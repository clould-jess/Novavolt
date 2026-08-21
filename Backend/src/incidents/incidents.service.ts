import { ForbiddenException, Injectable } from '@nestjs/common';
import { IncidentStatus, Prisma, Role } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { AuthUser, RequestContext } from '../common/types/auth-user';
import { PrismaService } from '../prisma.service';
import {
  CreateIncidentDto,
  IncidentQueryDto,
  UpdateIncidentDto,
} from './dto';

@Injectable()
export class IncidentsService {
  constructor(
    private readonly db: PrismaService,
    private readonly audit: AuditService,
  ) {}

  mine(customerId: string) {
    return this.db.incident.findMany({
      where: { rental: { customerId } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async list(query: IncidentQueryDto) {
    const where: Prisma.IncidentWhereInput = query.status
      ? { status: query.status }
      : {};
    const [items, total] = await this.db.$transaction([
      this.db.incident.findMany({
        where,
        include: {
          rental: {
            include: {
              customer: { select: { id: true, email: true, profile: true } },
              vehicle: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.db.incident.count({ where }),
    ]);
    return { items, total, page: query.page, limit: query.limit };
  }

  async create(
    dto: CreateIncidentDto,
    actor: AuthUser,
    context: RequestContext,
  ) {
    return this.db.$transaction(async (transaction) => {
      const rental = await transaction.rental.findUniqueOrThrow({
        where: { id: dto.rentalId },
      });
      if (actor.role === Role.CUSTOMER && rental.customerId !== actor.id) {
        throw new ForbiddenException();
      }
      const incident = await transaction.incident.create({ data: dto });
      await this.audit.write(
        {
          actorUserId: actor.id,
          action: 'incident.created',
          entityType: 'Incident',
          entityId: incident.id,
          metadata: { rentalId: dto.rentalId, category: dto.category },
          context,
        },
        transaction,
      );
      return incident;
    });
  }

  async update(
    id: string,
    dto: UpdateIncidentDto,
    actor: AuthUser,
    context: RequestContext,
  ) {
    return this.db.$transaction(async (transaction) => {
      const current = await transaction.incident.findUniqueOrThrow({
        where: { id },
      });
      const incident = await transaction.incident.update({
        where: { id },
        data: {
          status: dto.status,
          resolvedAt:
            dto.status === IncidentStatus.RESOLVED ||
            dto.status === IncidentStatus.CLOSED
              ? new Date()
              : null,
        },
      });
      await this.audit.write(
        {
          actorUserId: actor.id,
          action: 'incident.status_changed',
          entityType: 'Incident',
          entityId: id,
          metadata: { from: current.status, to: dto.status },
          context,
        },
        transaction,
      );
      return incident;
    });
  }
}
