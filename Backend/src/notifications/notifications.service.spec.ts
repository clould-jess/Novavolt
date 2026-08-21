import { ConfigService } from '@nestjs/config';
import { createDecipheriv } from 'crypto';
import { PrismaService } from '../prisma.service';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  it('encrypts queued payloads containing one-time delivery secrets', async () => {
    const keyHex = 'ab'.repeat(32);
    const create = jest.fn().mockImplementation(({ data }) => data);
    const db = {
      notification: { create },
    } as unknown as PrismaService;
    const config = {
      get: jest.fn((key: string) =>
        key === 'NOTIFICATION_PAYLOAD_ENCRYPTION_KEY' ? keyHex : undefined,
      ),
    } as unknown as ConfigService;
    const service = new NotificationsService(db, config);

    await service.queue('user-1', 'EMAIL', 'PASSWORD_RESET', 'a@example.ca', {
      token: 'one-time-secret',
    });

    const stored = create.mock.calls[0][0].data.payload as {
      algorithm: string;
      ciphertext: string;
      iv: string;
      tag: string;
      version: number;
    };
    expect(stored.algorithm).toBe('A256GCM');
    expect(JSON.stringify(stored)).not.toContain('one-time-secret');

    const decipher = createDecipheriv(
      'aes-256-gcm',
      Buffer.from(keyHex, 'hex'),
      Buffer.from(stored.iv, 'base64'),
    );
    decipher.setAuthTag(Buffer.from(stored.tag, 'base64'));
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(stored.ciphertext, 'base64')),
      decipher.final(),
    ]).toString('utf8');
    expect(JSON.parse(plaintext)).toEqual({ token: 'one-time-secret' });
  });
});
