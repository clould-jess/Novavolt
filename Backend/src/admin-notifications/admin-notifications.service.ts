import { Injectable } from '@nestjs/common';
import { AdminNotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

export interface AdminNotificationInput {
  type: AdminNotificationType;
  entityId: string;
  title: string;
  preview: string;
  metadata?: Prisma.InputJsonValue;
}

@Injectable()
export class AdminNotificationsService {
  constructor(private readonly db: PrismaService) {}

  create(input: AdminNotificationInput) {
    return this.db.adminNotification.create({ data: input });
  }

  async list(page = 1, limit = 20, unreadOnly = false) {
    const where = unreadOnly ? { readAt: null, archivedAt: null } : { archivedAt: null };
    const [items, total, unread] = await this.db.$transaction([
      this.db.adminNotification.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      this.db.adminNotification.count({ where }),
      this.db.adminNotification.count({ where: { readAt: null, archivedAt: null } }),
    ]);
    return { items, total, unread, page, limit };
  }

  async markRead(id: string) {
    const result = await this.db.adminNotification.updateMany({ where: { id, archivedAt: null }, data: { readAt: new Date() } });
    return { ok: result.count === 1 };
  }

  async archive(id: string) {
    const result = await this.db.adminNotification.updateMany({ where: { id, archivedAt: null }, data: { archivedAt: new Date() } });
    return { ok: result.count === 1 };
  }
}
