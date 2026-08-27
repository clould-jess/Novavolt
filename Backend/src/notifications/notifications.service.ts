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
      await this.deliver(candidate).catch(async (error: unknown) => {
        const attempts = candidate.attempts + 1;
        const lastError =
          error instanceof Error && error.message
            ? error.message.slice(0, 1_000)
            : 'delivery_failed';
        await this.db.notification.update({
          where: { id: candidate.id },
          data: {
            attempts,
            status:
              attempts >= 5
                ? NotificationStatus.FAILED
                : NotificationStatus.QUEUED,
            lastError,
          },
        });
      });
    }
  }

  private async deliver(notification: Notification): Promise<void> {
    const payload = this.decryptPayload(notification.payload);
    const resendApiKey = this.config.get<string>('RESEND_API_KEY');
    const result = resendApiKey && notification.channel === 'EMAIL'
      ? await this.deliverViaResend(notification, payload, resendApiKey)
      : await this.deliverViaWebhook(notification, payload);
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

  private async deliverViaResend(
    notification: Notification,
    payload: Prisma.JsonValue | null,
    apiKey: string,
  ): Promise<{ providerId?: string }> {
    const from = this.config.get<string>(
      'RESEND_FROM_EMAIL',
      'Novavolt <no-reply@resend.dev>',
    );
    const content = this.composeEmail(notification.template, payload);
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'User-Agent': 'Novavolt/1.0',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: notification.destination,
        subject: content.subject,
        html: content.html,
        text: content.text,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(
        `Resend rejected delivery${errorText ? `: ${errorText}` : ''}`,
      );
    }
    const result = (await response.json().catch(() => ({}))) as {
      id?: string;
    };
    return { providerId: result.id };
  }

  private async deliverViaWebhook(
    notification: Notification,
    payload: Prisma.JsonValue | null,
  ): Promise<{ providerId?: string }> {
    const webhookUrl = this.config.get<string>('NOTIFICATION_WEBHOOK_URL');
    if (!webhookUrl) {
      throw new Error('No notification provider configured');
    }

    const body = JSON.stringify({
      id: notification.id,
      userId: notification.userId,
      channel: notification.channel,
      template: notification.template,
      destination: notification.destination,
      payload,
    });
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = createHmac(
      'sha256',
      this.config.getOrThrow<string>('NOTIFICATION_WEBHOOK_SECRET'),
    )
      .update(`${timestamp}.${body}`)
      .digest('hex');
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-novavolt-timestamp': timestamp,
        'x-novavolt-signature': signature,
      },
      body,
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      throw new Error('Notification provider rejected delivery');
    }
    return (await response.json().catch(() => ({}))) as {
      providerId?: string;
    };
  }

  private composeEmail(
    template: string,
    payload: Prisma.JsonValue | null,
  ): { subject: string; html: string; text: string } {
    const data =
      payload && typeof payload === 'object' && !Array.isArray(payload)
        ? (payload as Record<string, unknown>)
        : undefined;
    const code = typeof data?.code === 'string' ? data.code : undefined;
    const expiresInMinutes =
      typeof data?.expiresInMinutes === 'number'
        ? data.expiresInMinutes
        : undefined;

    if (template === 'EMAIL_VERIFICATION') {
      const subject = 'Novavolt verification code';
      const text = [
        'Your Novavolt verification code is:',
        code ?? 'Unknown code',
        expiresInMinutes ? `It expires in ${expiresInMinutes} minutes.` : '',
      ]
        .filter(Boolean)
        .join('\n\n');
      return {
        subject,
        text,
        html: `
          <div style="font-family:Arial,sans-serif;background:#0b1220;color:#e5eefb;padding:32px">
            <div style="max-width:560px;margin:0 auto;background:#101a2e;border-radius:20px;padding:32px;border:1px solid rgba(255,255,255,.08)">
              <p style="margin:0 0 12px;font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:#7cc3ff">Novavolt</p>
              <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;color:#fff">Verification code</h1>
              <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#c6d5ee">Use the code below to verify your email address.</p>
              <div style="display:inline-block;padding:16px 20px;border-radius:14px;background:#fff;color:#0b1220;font-size:32px;font-weight:700;letter-spacing:0.2em">${code ?? '------'}</div>
              ${expiresInMinutes ? `<p style="margin:20px 0 0;font-size:14px;line-height:1.6;color:#9cb3d3">This code expires in ${expiresInMinutes} minutes.</p>` : ''}
            </div>
          </div>
        `,
      };
    }

    if (template === 'PASSWORD_RESET') {
      const subject = 'Novavolt password reset code';
      const text = [
        'Your Novavolt password reset code is:',
        code ?? 'Unknown code',
        expiresInMinutes ? `It expires in ${expiresInMinutes} minutes.` : '',
      ]
        .filter(Boolean)
        .join('\n\n');
      return {
        subject,
        text,
        html: `
          <div style="font-family:Arial,sans-serif;background:#0b1220;color:#e5eefb;padding:32px">
            <div style="max-width:560px;margin:0 auto;background:#101a2e;border-radius:20px;padding:32px;border:1px solid rgba(255,255,255,.08)">
              <p style="margin:0 0 12px;font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:#7cc3ff">Novavolt</p>
              <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;color:#fff">Password reset code</h1>
              <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#c6d5ee">Use the code below to reset your password.</p>
              <div style="display:inline-block;padding:16px 20px;border-radius:14px;background:#fff;color:#0b1220;font-size:32px;font-weight:700;letter-spacing:0.2em">${code ?? '------'}</div>
              ${expiresInMinutes ? `<p style="margin:20px 0 0;font-size:14px;line-height:1.6;color:#9cb3d3">This code expires in ${expiresInMinutes} minutes.</p>` : ''}
            </div>
          </div>
        `,
      };
    }

    if (template === 'NEW_LOGIN') {
      const device = typeof data?.device === 'string' ? data.device : 'Unknown device';
      const location = typeof data?.ipAddress === 'string' ? data.ipAddress : 'Unknown location';
      const time = typeof data?.createdAt === 'string' ? data.createdAt : new Date().toISOString();
      return {
        subject: 'New login detected - Novavolt',
        text: `New login detected. Device: ${device}. Location/IP: ${location}. Time: ${time}.`,
        html: `<div style="font-family:Arial,sans-serif;padding:24px;color:#0f172a"><h1>New login detected</h1><p>A new sign-in to your Novavolt account was detected.</p><p><strong>Device:</strong> ${device}</p><p><strong>Location/IP:</strong> ${location}</p><p><strong>Time:</strong> ${time}</p></div>`,
      };
    }
    return {
      subject: 'Novavolt notification',
      text: 'You have a new Novavolt notification.',
      html: '<p>You have a new Novavolt notification.</p>',
    };
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
