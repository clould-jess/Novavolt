import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateContactMessageDto } from './dto';
import { AdminNotificationsService } from '../admin-notifications/admin-notifications.service';
import { PrismaService } from '../prisma.service';

export interface ContactMessageRecord {
  emailDelivered: boolean;
}

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly db: PrismaService,
    private readonly adminNotifications: AdminNotificationsService,
  ) {}

  async create(dto: CreateContactMessageDto): Promise<ContactMessageRecord> {
    const message = await this.db.contactMessage.create({
      data: {
        name: dto.name.trim(), email: dto.email.trim().toLowerCase(), phone: dto.phone?.trim() || null,
        subject: dto.subject, message: dto.message.trim(),
      },
    });
    await this.adminNotifications.create({
      type: 'CONTACT_MESSAGE', entityId: message.id,
      title: `Nouveau message de ${message.name}`,
      preview: subjectLabel(message.subject),
      metadata: { email: message.email, subject: message.subject },
    });

    try {
      await this.sendEmail(dto);
      await this.db.contactMessage.update({ where: { id: message.id }, data: { emailSentAt: new Date(), emailError: null } });
      return { emailDelivered: true };
    } catch (error) {
      const emailError = error instanceof Error ? error.message : 'Unknown email error';
      this.logger.warn(`Failed to send contact email: ${emailError}`);
      await this.db.contactMessage.update({ where: { id: message.id }, data: { emailError } });
      return { emailDelivered: false };
    }
  }

  private async sendEmail(dto: CreateContactMessageDto): Promise<void> {
    const apiKey = this.config.get<string>('RESEND_API_KEY')?.trim();
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const to = this.config.get<string>('ADMIN_EMAIL')?.trim();
    if (!to) {
      throw new Error('ADMIN_EMAIL is required');
    }

    const from = this.config.get<string>('RESEND_FROM_EMAIL')?.trim() || 'Novavolt <onboarding@resend.dev>';
    const subject = `New Novavolt contact message: ${subjectLabel(dto.subject)}`;
    const phone = dto.phone?.trim() || 'Not provided';
    const html = `
      <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;color:#0f172a">
        <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:28px">
          <p style="margin:0 0 10px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#0284c7">Novavolt Contact</p>
          <h1 style="margin:0 0 18px;font-size:24px;line-height:1.2">New contact request</h1>
          <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:8px 0;color:#64748b;width:170px">Name</td><td style="padding:8px 0;font-weight:600">${escapeHtml(dto.name.trim())}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b">Email</td><td style="padding:8px 0;font-weight:600"><a href="mailto:${escapeHtml(dto.email.trim().toLowerCase())}">${escapeHtml(dto.email.trim().toLowerCase())}</a></td></tr>
            <tr><td style="padding:8px 0;color:#64748b">Phone</td><td style="padding:8px 0;font-weight:600">${escapeHtml(phone)}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b">Subject</td><td style="padding:8px 0;font-weight:600">${escapeHtml(subjectLabel(dto.subject))}</td></tr>
          </table>
          <div style="margin-top:20px;padding:16px;border-radius:14px;background:#f8fafc;border:1px solid #e2e8f0">
            <p style="margin:0 0 8px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#64748b">Message</p>
            <p style="margin:0;white-space:pre-wrap;line-height:1.6">${escapeHtml(dto.message)}</p>
          </div>
        </div>
      </div>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
        text: [
          'New Novavolt contact request',
          `Name: ${dto.name.trim()}`,
          `Email: ${dto.email.trim().toLowerCase()}`,
          `Phone: ${phone}`,
          `Subject: ${subjectLabel(dto.subject)}`,
          '',
          'Message:',
          dto.message,
        ].join('\n'),
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Resend rejected delivery${errorText ? `: ${errorText}` : ''}`);
    }
  }
}

function subjectLabel(subject: string): string {
  switch (subject) {
    case 'driver':
      return 'Chauffeur';
    case 'individual':
      return 'Particulier';
    case 'support':
      return 'Support';
    case 'partner':
      return 'Partenaire';
    default:
      return 'Autre';
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
