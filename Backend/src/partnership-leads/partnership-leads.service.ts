import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FleetPartnerLeadStatus, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { CreatePartnershipLeadDto, PartnershipLeadQueryDto } from './dto';
import { PrismaService } from '../prisma.service';
import { AdminNotificationsService } from '../admin-notifications/admin-notifications.service';

interface FleetPartnerLeadRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  vehicleCount: string;
  message: string | null;
  status: FleetPartnerLeadStatus;
  emailSentAt: Date | null;
  emailError: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface LeadEmailPayload {
  name: string;
  email: string;
  phone: string;
  company: string;
  vehicleCount: string;
  message: string;
  createdAt: string;
}

export interface PartnershipLeadRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  vehicleCount: string;
  message: string | null;
  status: FleetPartnerLeadStatus;
  emailSentAt: string | null;
  emailError: string | null;
  createdAt: string;
  updatedAt: string;
  emailDelivered: boolean;
}

@Injectable()
export class PartnershipLeadsService {
  private readonly logger = new Logger(PartnershipLeadsService.name);

  constructor(
    private readonly db: PrismaService,
    private readonly config: ConfigService,
    private readonly adminNotifications: AdminNotificationsService,
  ) {}

  async create(dto: CreatePartnershipLeadDto): Promise<PartnershipLeadRecord> {
    const rows = await this.db.$queryRaw<FleetPartnerLeadRow[]>(Prisma.sql`
      INSERT INTO "FleetPartnerLead" (
        "id",
        "name",
        "email",
        "phone",
        "company",
        "vehicleCount",
        "message",
        "status",
        "emailSentAt",
        "emailError",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${randomUUID()},
        ${dto.name.trim()},
        ${dto.email.trim().toLowerCase()},
        ${dto.phone.trim()},
        ${dto.company.trim()},
        ${dto.vehicleCount},
        ${dto.message?.trim() || null},
        'NEW',
        NULL,
        NULL,
        NOW(),
        NOW()
      )
      RETURNING
        "id",
        "name",
        "email",
        "phone",
        "company",
        "vehicleCount",
        "message",
        "status",
        "emailSentAt",
        "emailError",
        "createdAt",
        "updatedAt"
    `);

    const lead = rows[0];
    if (!lead) {
      throw new Error('Failed to persist partnership lead');
    }

    await this.adminNotifications.create({
      type: 'FLEET_REQUEST', entityId: lead.id,
      title: 'Nouvelle demande Fleet',
      preview: lead.name + ' - ' + lead.vehicleCount + ' vehicules',
      metadata: { email: lead.email, company: lead.company },
    });

    try {
      await this.sendAdminEmail({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        vehicleCount: lead.vehicleCount,
        message: lead.message ?? '',
        createdAt: lead.createdAt.toISOString(),
      });
      await this.db.$executeRaw(Prisma.sql`
        UPDATE "FleetPartnerLead"
        SET "emailSentAt" = NOW(), "emailError" = NULL, "updatedAt" = NOW()
        WHERE "id" = ${lead.id}
      `);
      return this.toRecord({ ...lead, emailSentAt: new Date(), emailError: null }, true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown email error';
      this.logger.warn(`Failed to send fleet partner lead email: ${message}`);
      await this.db.$executeRaw(Prisma.sql`
        UPDATE "FleetPartnerLead"
        SET "emailError" = ${message}, "updatedAt" = NOW()
        WHERE "id" = ${lead.id}
      `);
      return this.toRecord({ ...lead, emailError: message }, false);
    }
  }

  async list(
    query: PartnershipLeadQueryDto,
  ): Promise<{ items: PartnershipLeadRecord[]; total: number; page: number; limit: number }> {
    const statusFilter = query.status
      ? Prisma.sql`WHERE "status" = ${query.status}`
      : Prisma.empty;
    const itemsPromise = this.db.$queryRaw<FleetPartnerLeadRow[]>(Prisma.sql`
      SELECT
        "id",
        "name",
        "email",
        "phone",
        "company",
        "vehicleCount",
        "message",
        "status",
        "emailSentAt",
        "emailError",
        "createdAt",
        "updatedAt"
      FROM "FleetPartnerLead"
      ${statusFilter}
      ORDER BY "createdAt" DESC
      LIMIT ${query.limit}
      OFFSET ${query.skip}
    `);
    const countPromise = this.db.$queryRaw<{ count: bigint }[]>(Prisma.sql`
      SELECT COUNT(*)::bigint AS count
      FROM "FleetPartnerLead"
      ${statusFilter}
    `);

    const [rows, countRows] = await Promise.all([itemsPromise, countPromise]);
    return {
      items: rows.map((row) => this.toRecord(row, Boolean(row.emailSentAt))),
      total: Number(countRows[0]?.count ?? 0n),
      page: query.page,
      limit: query.limit,
    };
  }

  async updateStatus(id: string, status: FleetPartnerLeadStatus): Promise<PartnershipLeadRecord> {
    const rows = await this.db.$queryRaw<FleetPartnerLeadRow[]>(Prisma.sql`
      UPDATE "FleetPartnerLead"
      SET "status" = ${status}, "updatedAt" = NOW()
      WHERE "id" = ${id}
      RETURNING
        "id",
        "name",
        "email",
        "phone",
        "company",
        "vehicleCount",
        "message",
        "status",
        "emailSentAt",
        "emailError",
        "createdAt",
        "updatedAt"
    `);

    const lead = rows[0];
    if (!lead) {
      throw new Error('Partnership lead not found');
    }

    return this.toRecord(lead, Boolean(lead.emailSentAt));
  }

  async delete(id: string): Promise<{ deleted: true }> {
    const rows = await this.db.$queryRaw<{ id: string }[]>(Prisma.sql`
      DELETE FROM "FleetPartnerLead"
      WHERE "id" = ${id}
      RETURNING "id"
    `);

    if (rows.length === 0) {
      throw new Error('Partnership lead not found');
    }

    return { deleted: true };
  }

  private async sendAdminEmail(lead: LeadEmailPayload): Promise<void> {
    const apiKey = this.config.get<string>('RESEND_API_KEY')?.trim();
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const to = this.config.get<string>('ADMIN_EMAIL')?.trim();
    if (!to) {
      throw new Error('ADMIN_EMAIL is required');
    }

    const from = this.config.get<string>('RESEND_FROM_EMAIL')?.trim() || 'Novavolt <onboarding@resend.dev>';
    const subject = `New Novavolt fleet request from ${lead.name}`;
    const message = lead.message || 'No additional message provided.';
    const html = `
      <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;color:#0f172a">
        <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:28px">
          <p style="margin:0 0 10px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#0284c7">Novavolt Fleet</p>
          <h1 style="margin:0 0 18px;font-size:24px;line-height:1.2">New fleet partnership request</h1>
          <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:8px 0;color:#64748b;width:170px">Name</td><td style="padding:8px 0;font-weight:600">${escapeHtml(lead.name)}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b">Email</td><td style="padding:8px 0;font-weight:600"><a href="mailto:${escapeHtml(lead.email)}">${escapeHtml(lead.email)}</a></td></tr>
            <tr><td style="padding:8px 0;color:#64748b">Phone</td><td style="padding:8px 0;font-weight:600">${escapeHtml(lead.phone)}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b">Company</td><td style="padding:8px 0;font-weight:600">${escapeHtml(lead.company)}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b">Fleet size</td><td style="padding:8px 0;font-weight:600">${escapeHtml(lead.vehicleCount)}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b">Received</td><td style="padding:8px 0;font-weight:600">${escapeHtml(lead.createdAt)}</td></tr>
          </table>
          <div style="margin-top:20px;padding:16px;border-radius:14px;background:#f8fafc;border:1px solid #e2e8f0">
            <p style="margin:0 0 8px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#64748b">Message</p>
            <p style="margin:0;white-space:pre-wrap;line-height:1.6">${escapeHtml(message)}</p>
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
          'New Novavolt fleet partnership request',
          `Name: ${lead.name}`,
          `Email: ${lead.email}`,
          `Phone: ${lead.phone}`,
          `Company: ${lead.company}`,
          `Fleet size: ${lead.vehicleCount}`,
          `Received: ${lead.createdAt}`,
          '',
          'Message:',
          message,
        ].join('\n'),
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(
        `Resend rejected delivery${errorText ? `: ${errorText}` : ''}`,
      );
    }
  }

  private toRecord(row: FleetPartnerLeadRow, emailDelivered: boolean): PartnershipLeadRecord {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      company: row.company,
      vehicleCount: row.vehicleCount,
      message: row.message,
      status: row.status,
      emailSentAt: row.emailSentAt ? row.emailSentAt.toISOString() : null,
      emailError: row.emailError,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      emailDelivered,
    };
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
