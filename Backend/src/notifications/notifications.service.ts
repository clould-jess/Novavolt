import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Notification, NotificationStatus, Prisma } from '@prisma/client';
import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
} from 'crypto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly db: PrismaService,
    private readonly config: ConfigService,
  ) {}

  queue(
    userId: string,
    channel: string,
    template: string,
    destination: string,
    payload?: Prisma.InputJsonValue,
  ) {
    return this.db.notification.create({
      data: {
        userId,
        channel,
        template,
        destination,
        payload: this.encryptPayload(payload),
      },
    });
  }

  async markRead(userId: string, id: string) {
    const result = await this.db.notification.updateMany({
      where: { id, userId },
      data: { readAt: new Date() },
    });
    return { ok: result.count === 1 };
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async deliverQueued(): Promise<void> {
    if (!this.config.get<boolean>('NOTIFICATIONS_ENABLED', false)) {
      return;
    }
    const staleBefore = new Date(Date.now() - 5 * 60_000);
    await this.db.$transaction([
      this.db.notification.updateMany({
        where: {
          status: NotificationStatus.SENDING,
          updatedAt: { lt: staleBefore },
          attempts: { gte: 4 },
        },
        data: {
          status: NotificationStatus.FAILED,
          attempts: { increment: 1 },
          lastError: 'delivery_interrupted',
        },
      }),
      this.db.notification.updateMany({
        where: {
          status: NotificationStatus.SENDING,
          updatedAt: { lt: staleBefore },
          attempts: { lt: 4 },
        },
        data: {
          status: NotificationStatus.QUEUED,
          attempts: { increment: 1 },
          lastError: 'delivery_interrupted',
        },
      }),
    ]);
    const candidates = await this.db.notification.findMany({
      where: { status: NotificationStatus.QUEUED, attempts: { lt: 5 } },
      orderBy: { createdAt: 'asc' },
      take: 25,
    });

    for (const candidate of candidates) {
      const claimed = await this.db.notification.updateMany({
        where: { id: candidate.id, status: NotificationStatus.QUEUED },
        data: { status: NotificationStatus.SENDING },
      });
      if (claimed.count !== 1) {
        continue;
      }
      await this.deliver(candidate).catch(async () => {
        const attempts = candidate.attempts + 1;
        await this.db.notification.update({
          where: { id: candidate.id },
          data: {
            attempts,
            status:
              attempts >= 5
                ? NotificationStatus.FAILED
                : NotificationStatus.QUEUED,
            lastError: 'delivery_failed',
          },
        });
      });
    }
  }

  private async deliver(notification: Notification): Promise<void> {
    const body = JSON.stringify({
      id: notification.id,
      userId: notification.userId,
      channel: notification.channel,
      template: notification.template,
      destination: notification.destination,
      payload: this.decryptPayload(notification.payload),
    });
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = createHmac(
      'sha256',
      this.config.getOrThrow<string>('NOTIFICATION_WEBHOOK_SECRET'),
    )
      .update(`${timestamp}.${body}`)
      .digest('hex');
    const response = await fetch(
      this.config.getOrThrow<string>('NOTIFICATION_WEBHOOK_URL'),
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-novavolt-timestamp': timestamp,
          'x-novavolt-signature': signature,
        },
        body,
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!response.ok) {
      throw new Error('Notification provider rejected delivery');
    }
    const result = (await response.json().catch(() => ({}))) as {
      providerId?: string;
    };
    await this.db.notification.update({
      where: { id: notification.id },
      data: {
        status: NotificationStatus.SENT,
        attempts: { increment: 1 },
        providerId: result.providerId,
        lastError: null,
        sentAt: new Date(),
      },
    });
  }

  private encryptPayload(
    payload: Prisma.InputJsonValue | undefined,
  ): Prisma.InputJsonValue | undefined {
    if (payload === undefined) {
      return undefined;
    }
    const keyHex = this.config.get<string>(
      'NOTIFICATION_PAYLOAD_ENCRYPTION_KEY',
    );
    if (!keyHex) {
      return payload;
    }
    const key = Buffer.from(keyHex, 'hex');
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const ciphertext = Buffer.concat([
      cipher.update(JSON.stringify(payload), 'utf8'),
      cipher.final(),
    ]);
    return {
      version: 1,
      algorithm: 'A256GCM',
      iv: iv.toString('base64'),
      tag: cipher.getAuthTag().toString('base64'),
      ciphertext: ciphertext.toString('base64'),
    };
  }

  private decryptPayload(payload: Prisma.JsonValue | null): Prisma.JsonValue | null {
    if (
      !payload ||
      typeof payload !== 'object' ||
      Array.isArray(payload) ||
      payload.version !== 1 ||
      payload.algorithm !== 'A256GCM' ||
      typeof payload.iv !== 'string' ||
      typeof payload.tag !== 'string' ||
      typeof payload.ciphertext !== 'string'
    ) {
      return payload;
    }
    const key = Buffer.from(
      this.config.getOrThrow<string>('NOTIFICATION_PAYLOAD_ENCRYPTION_KEY'),
      'hex',
    );
    const decipher = createDecipheriv(
      'aes-256-gcm',
      key,
      Buffer.from(payload.iv, 'base64'),
    );
    decipher.setAuthTag(Buffer.from(payload.tag, 'base64'));
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(payload.ciphertext, 'base64')),
      decipher.final(),
    ]).toString('utf8');
    return JSON.parse(plaintext) as Prisma.JsonValue;
  }
}
