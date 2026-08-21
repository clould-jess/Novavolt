import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { Prisma, WorkflowStatus } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { AuthUser, RequestContext } from '../common/types/auth-user';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma.service';
import {
  ApplicationQueryDto,
  CreateApplicationDto,
  ReviewApplicationDto,
} from './dto';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly db: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(
    customer: AuthUser,
    dto: CreateApplicationDto,
    context: RequestContext,
  ) {
    return this.db.$transaction(async (transaction) => {
      const pending = await transaction.application.findFirst({
        where: {
          customerId: customer.id,
          status: { in: [WorkflowStatus.DRAFT, WorkflowStatus.PENDING] },
        },
        select: { id: true },
      });
      if (pending) {
        throw new ConflictException('An application is already being reviewed');
      }
      if (dto.requestedVehicleId) {
        await transaction.vehicle.findUniqueOrThrow({
          where: { id: dto.requestedVehicleId },
        });
      }

      const application = await transaction.application.create({
        data: {
          customerId: customer.id,
          requestedVehicleId: dto.requestedVehicleId,
          customerNote: dto.customerNote,
        },
      });
      await this.audit.write(
        {
          actorUserId: customer.id,
          action: 'application.submitted',
          entityType: 'Application',
          entityId: application.id,
          context,
        },
        transaction,
      );
      return application;
    });
  }

  mine(customerId: string) {
    return this.db.application.findMany({
      where: { customerId },
      include: {
        requestedVehicle: {
          select: { id: true, make: true, model: true, year: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async list(query: ApplicationQueryDto) {
    const where: Prisma.ApplicationWhereInput = query.status
      ? { status: query.status }
      : {};
    const [items, total] = await this.db.$transaction([
      this.db.application.findMany({
        where,
        include: {
          customer: {
            select: { id: true, email: true, profile: true },
          },
          requestedVehicle: {
            select: { id: true, make: true, model: true, year: true },
          },
        },
        orderBy: { submittedAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.db.application.count({ where }),
    ]);
    return { items, total, page: query.page, limit: query.limit };
  }

  async review(
    id: string,
    dto: ReviewApplicationDto,
    actor: AuthUser,
    context: RequestContext,
  ) {
    const application = await this.db.$transaction(async (transaction) => {
      const current = await transaction.application.findUniqueOrThrow({
        where: { id },
      });
      if (current.status !== WorkflowStatus.PENDING) {
        throw new BadRequestException('Only a pending application can be reviewed');
      }
      const updated = await transaction.application.update({
        where: { id },
        data: {
          status: dto.status,
          reviewNote: dto.reviewNote,
          reviewedAt: new Date(),
          reviewedById: actor.id,
        },
      });
      await this.audit.write(
        {
          actorUserId: actor.id,
          action: 'application.reviewed',
          entityType: 'Application',
          entityId: id,
          metadata: { decision: dto.status },
          context,
        },
        transaction,
      );
      return updated;
    });

    await this.notifications.queue(
      application.customerId,
      'IN_APP',
      'APPLICATION_REVIEWED',
      application.customerId,
      { applicationId: application.id, status: application.status },
    );
    return application;
  }

  async cancel(
    id: string,
    customer: AuthUser,
    context: RequestContext,
  ) {
    return this.db.$transaction(async (transaction) => {
      const current = await transaction.application.findFirstOrThrow({
        where: { id, customerId: customer.id },
      });
      if (
        current.status !== WorkflowStatus.DRAFT &&
        current.status !== WorkflowStatus.PENDING
      ) {
        throw new BadRequestException('This application can no longer be cancelled');
      }
      const application = await transaction.application.update({
        where: { id },
        data: { status: WorkflowStatus.CANCELLED },
      });
      await this.audit.write(
        {
          actorUserId: customer.id,
          action: 'application.cancelled',
          entityType: 'Application',
          entityId: id,
          context,
        },
        transaction,
      );
      return application;
    });
  }
}
