import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { RequestContext } from '../common/types/auth-user';
import { PrismaService } from '../prisma.service';

type AuditClient = Pick<PrismaService, 'auditLog'> | Prisma.TransactionClient;

export interface AuditEntry {
  actorUserId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
  context?: RequestContext;
}

@Injectable()
export class AuditService {
  constructor(private readonly db: PrismaService) {}

  write(entry: AuditEntry, client: AuditClient = this.db) {
    return client.auditLog.create({
      data: {
        actorUserId: entry.actorUserId,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        metadata: entry.metadata,
        ipAddress: entry.context?.ipAddress,
        requestId: entry.context?.requestId,
      },
    });
  }
}
