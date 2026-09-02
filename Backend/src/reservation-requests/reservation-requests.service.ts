import { BadRequestException, ConflictException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, VehicleStatus } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma.service';
import { AdminNotificationsService } from '../admin-notifications/admin-notifications.service';
import {
  CreateReservationRequestDto,
  ReservationRequestQueryDto,
  ReservationRequestStatus,
} from './dto';

interface ReservationRequestRow {
  id: string;
  vehicleId: string;
  name: string;
  email: string;
  phone: string;
  startAt: Date;
  endAt: Date;
  message: string | null;
  status: ReservationRequestStatus;
  emailSentAt: Date | null;
  emailError: string | null;
  createdAt: Date;
  updatedAt: Date;
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleYear: number | null;
  vehicleStatus: VehicleStatus | null;
}

export interface ReservationRequestRecord {
  id: string;
  vehicleId: string;
  vehicleLabel: string | null;
  vehicleYear: number | null;
  vehicleStatus: VehicleStatus | null;
  name: string;
  email: string;
  phone: string;
  startAt: string;
  endAt: string;
  message: string | null;
  status: ReservationRequestStatus;
  emailSentAt: string | null;
  emailError: string | null;
  createdAt: string;
  updatedAt: string;
  emailDelivered: boolean;
}

interface ReservationEmailPayload {
  name: string;
  email: string;
  phone: string;
  vehicleLabel: string;
  vehicleYear: number | null;
  startAt: string;
  endAt: string;
  message: string;
  createdAt: string;
}

@Injectable()
export class ReservationRequestsService {
  private readonly logger = new Logger(ReservationRequestsService.name);

  constructor(
    private readonly db: PrismaService,
    private readonly config: ConfigService,
    private readonly adminNotifications: AdminNotificationsService,
  ) {}

  async create(dto: CreateReservationRequestDto): Promise<ReservationRequestRecord> {
    const startAt = new Date(dto.startAt);
    const endAt = new Date(dto.endAt);
    if (
      Number.isNaN(startAt.getTime()) ||
      Number.isNaN(endAt.getTime()) ||
      startAt >= endAt
    ) {
      throw new BadRequestException('Invalid reservation interval');
    }

    const vehicle = await this.db.vehicle.findFirst({
      where: {
        id: dto.vehicleId,
        status: VehicleStatus.AVAILABLE,
      },
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        status: true,
      },
    });
    if (!vehicle) {
      throw new ConflictException('Vehicle is unavailable');
    }

    const [created] = await this.db.$queryRaw<ReservationRequestRow[]>(Prisma.sql`
      INSERT INTO "ReservationRequest" (
        "id",
        "vehicleId",
        "name",
        "email",
        "phone",
        "startAt",
        "endAt",
        "message",
        "status",
        "emailSentAt",
        "emailError",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${randomUUID()},
        ${vehicle.id},
        ${dto.name.trim()},
        ${dto.email.trim().toLowerCase()},
        ${dto.phone.trim()},
        ${startAt},
        ${endAt},
        ${dto.message?.trim() || null},
        'NEW',
        NULL,
        NULL,
        NOW(),
        NOW()
      )
      RETURNING
        "id",
        "vehicleId",
        "name",
        "email",
        "phone",
        "startAt",
        "endAt",
        "message",
        "status",
        "emailSentAt",
        "emailError",
        "createdAt",
        "updatedAt"
    `);

    if (!created) {
      throw new Error('Failed to persist reservation request');
    }

    const record = await this.getRecord(created.id);
    await this.adminNotifications.create({
      type: 'RESERVATION_REQUEST', entityId: record.id,
      title: 'Nouvelle demande de reservation',
      preview: record.name + ' - ' + (record.vehicleLabel ?? 'Vehicule'),
      metadata: { email: record.email, vehicleId: record.vehicleId },
    });

    try {
      await this.sendAdminEmail({
        name: record.name,
        email: record.email,
        phone: record.phone,
        vehicleLabel: record.vehicleLabel ?? 'Vehicle',
        vehicleYear: record.vehicleYear,
        startAt: record.startAt,
        endAt: record.endAt,
        message: record.message ?? '',
        createdAt: record.createdAt,
      });
      await this.db.$executeRaw(Prisma.sql`
        UPDATE "ReservationRequest"
        SET "emailSentAt" = NOW(), "emailError" = NULL, "updatedAt" = NOW()
        WHERE "id" = ${record.id}
      `);
      return { ...record, emailSentAt: new Date().toISOString(), emailError: null, emailDelivered: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown email error';
      this.logger.warn(`Failed to send reservation request email: ${message}`);
      await this.db.$executeRaw(Prisma.sql`
        UPDATE "ReservationRequest"
        SET "emailError" = ${message}, "updatedAt" = NOW()
        WHERE "id" = ${record.id}
      `);
      return { ...record, emailError: message, emailDelivered: false };
    }
  }

  async list(query: ReservationRequestQueryDto): Promise<{ items: ReservationRequestRecord[]; total: number; page: number; limit: number; }> {
    const statusFilter = query.status
      ? Prisma.sql`WHERE r."status" = ${query.status}`
      : Prisma.empty;
    const [rows, countRows] = await Promise.all([
      this.db.$queryRaw<ReservationRequestRow[]>(Prisma.sql`
        SELECT
          r."id",
          r."vehicleId",
          r."name",
          r."email",
          r."phone",
          r."startAt",
          r."endAt",
          r."message",
          r."status",
          r."emailSentAt",
          r."emailError",
          r."createdAt",
          r."updatedAt",
          v."make" AS "vehicleMake",
          v."model" AS "vehicleModel",
          v."year" AS "vehicleYear",
          v."status" AS "vehicleStatus"
        FROM "ReservationRequest" r
        LEFT JOIN "Vehicle" v ON v."id" = r."vehicleId"
        ${statusFilter}
        ORDER BY r."createdAt" DESC
        LIMIT ${query.limit}
        OFFSET ${query.skip}
      `),
      this.db.$queryRaw<{ count: bigint }[]>(Prisma.sql`
        SELECT COUNT(*)::bigint AS count
        FROM "ReservationRequest" r
        ${statusFilter}
      `),
    ]);

    return {
      items: rows.map((row) => this.toRecord(row, Boolean(row.emailSentAt))),
      total: Number(countRows[0]?.count ?? 0n),
      page: query.page,
      limit: query.limit,
    };
  }

  async updateStatus(id: string, status: ReservationRequestStatus): Promise<ReservationRequestRecord> {
    const rows = await this.db.$queryRaw<ReservationRequestRow[]>(Prisma.sql`
      UPDATE "ReservationRequest"
      SET "status" = ${status}, "updatedAt" = NOW()
      WHERE "id" = ${id}
      RETURNING
        "id",
        "vehicleId",
        "name",
        "email",
        "phone",
        "startAt",
        "endAt",
        "message",
        "status",
        "emailSentAt",
        "emailError",
        "createdAt",
        "updatedAt"
    `);

    const record = rows[0];
    if (!record) {
      throw new Error('Reservation request not found');
    }

    const joined = await this.getRecord(record.id);
    return { ...joined, emailDelivered: Boolean(joined.emailSentAt) };
  }

  async delete(id: string): Promise<{ deleted: true }> {
    const rows = await this.db.$queryRaw<{ id: string }[]>(Prisma.sql`
      DELETE FROM "ReservationRequest"
      WHERE "id" = ${id}
      RETURNING "id"
    `);

    if (rows.length === 0) {
      throw new Error('Reservation request not found');
    }

    return { deleted: true };
  }

  private async getRecord(id: string): Promise<ReservationRequestRecord> {
    const rows = await this.db.$queryRaw<ReservationRequestRow[]>(Prisma.sql`
      SELECT
        r."id",
        r."vehicleId",
        r."name",
        r."email",
        r."phone",
        r."startAt",
        r."endAt",
        r."message",
        r."status",
        r."emailSentAt",
        r."emailError",
        r."createdAt",
        r."updatedAt",
        v."make" AS "vehicleMake",
        v."model" AS "vehicleModel",
        v."year" AS "vehicleYear",
        v."status" AS "vehicleStatus"
      FROM "ReservationRequest" r
      LEFT JOIN "Vehicle" v ON v."id" = r."vehicleId"
      WHERE r."id" = ${id}
    `);
    const row = rows[0];
    if (!row) {
      throw new Error('Reservation request not found');
    }
    return this.toRecord(row, Boolean(row.emailSentAt));
  }

  private async sendAdminEmail(lead: ReservationEmailPayload): Promise<void> {
    const apiKey = this.config.get<string>('RESEND_API_KEY')?.trim();
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const to = this.config.get<string>('ADMIN_EMAIL')?.trim();
    if (!to) {
      throw new Error('ADMIN_EMAIL is required');
    }

    const from = this.config.get<string>('RESEND_FROM_EMAIL')?.trim() || 'Novavolt <onboarding@resend.dev>';
    const subject = `New reservation request for ${lead.vehicleLabel}`;
    const vehicleYear = lead.vehicleYear ? ` (${lead.vehicleYear})` : '';
    const message = lead.message || 'No additional message provided.';
    const html = `
      <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;color:#0f172a">
        <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:28px">
          <p style="margin:0 0 10px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#0284c7">Novavolt Reservations</p>
          <h1 style="margin:0 0 18px;font-size:24px;line-height:1.2">New public reservation request</h1>
          <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:8px 0;color:#64748b;width:170px">Name</td><td style="padding:8px 0;font-weight:600">${escapeHtml(lead.name)}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b">Email</td><td style="padding:8px 0;font-weight:600"><a href="mailto:${escapeHtml(lead.email)}">${escapeHtml(lead.email)}</a></td></tr>
            <tr><td style="padding:8px 0;color:#64748b">Phone</td><td style="padding:8px 0;font-weight:600">${escapeHtml(lead.phone)}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b">Vehicle</td><td style="padding:8px 0;font-weight:600">${escapeHtml(lead.vehicleLabel)}${escapeHtml(vehicleYear)}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b">Pickup</td><td style="padding:8px 0;font-weight:600">${escapeHtml(lead.startAt)}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b">Return</td><td style="padding:8px 0;font-weight:600">${escapeHtml(lead.endAt)}</td></tr>
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
          'New public reservation request',
          `Name: ${lead.name}`,
          `Email: ${lead.email}`,
          `Phone: ${lead.phone}`,
          `Vehicle: ${lead.vehicleLabel}${vehicleYear}`,
          `Pickup: ${lead.startAt}`,
          `Return: ${lead.endAt}`,
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
      throw new Error(`Resend rejected delivery${errorText ? `: ${errorText}` : ''}`);
    }
  }

  private toRecord(row: ReservationRequestRow, emailDelivered: boolean): ReservationRequestRecord {
    const vehicleLabel = row.vehicleMake && row.vehicleModel
      ? `${row.vehicleMake} ${row.vehicleModel}`.trim()
      : null;
    return {
      id: row.id,
      vehicleId: row.vehicleId,
      vehicleLabel,
      vehicleYear: row.vehicleYear,
      vehicleStatus: row.vehicleStatus,
      name: row.name,
      email: row.email,
      phone: row.phone,
      startAt: row.startAt.toISOString(),
      endAt: row.endAt.toISOString(),
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