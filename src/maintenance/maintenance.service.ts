import { BadRequestException, Injectable } from '@nestjs/common';
import {
  MaintenanceStatus,
  Prisma,
  RentalStatus,
  VehicleStatus,
  WorkflowStatus,
} from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { AuthUser, RequestContext } from '../common/types/auth-user';
import { PrismaService } from '../prisma.service';
import {
  CreateMaintenanceDto,
  MaintenanceQueryDto,
  UpdateMaintenanceDto,
} from './dto';

@Injectable()
export class MaintenanceService {
  constructor(
    private readonly db: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async list(query: MaintenanceQueryDto) {
    const where: Prisma.MaintenanceRecordWhereInput = query.status
      ? { status: query.status }
      : {};
    const [items, total] = await this.db.$transaction([
      this.db.maintenanceRecord.findMany({
        where,
        include: { vehicle: true, rental: true },
        orderBy: [{ status: 'asc' }, { scheduledAt: 'asc' }],
        skip: query.skip,
        take: query.limit,
      }),
      this.db.maintenanceRecord.count({ where }),
    ]);
    return { items, total, page: query.page, limit: query.limit };
  }

  async create(
    dto: CreateMaintenanceDto,
    actor: AuthUser,
    context: RequestContext,
  ) {
    return this.db.$transaction(async (transaction) => {
      const vehicle = await transaction.vehicle.findUniqueOrThrow({
        where: { id: dto.vehicleId },
      });
      if (dto.rentalId) {
        const rental = await transaction.rental.findUniqueOrThrow({
          where: { id: dto.rentalId },
        });
        if (rental.vehicleId !== dto.vehicleId) {
          throw new BadRequestException('Rental belongs to a different vehicle');
        }
      }
      if (dto.odometer !== undefined && dto.odometer < vehicle.odometer) {
        throw new BadRequestException('Odometer cannot decrease');
      }
      const record = await transaction.maintenanceRecord.create({
        data: {
          ...dto,
          scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        },
      });
      await this.audit.write(
        {
          actorUserId: actor.id,
          action: 'maintenance.created',
          entityType: 'MaintenanceRecord',
          entityId: record.id,
          metadata: { vehicleId: dto.vehicleId, type: dto.type },
          context,
        },
        transaction,
      );
      return record;
    });
  }

  async update(
    id: string,
    dto: UpdateMaintenanceDto,
    actor: AuthUser,
    context: RequestContext,
  ) {
    return this.db.$transaction(
      async (transaction) => {
        const current = await transaction.maintenanceRecord.findUniqueOrThrow({
          where: { id },
        });
        if (
          current.status === MaintenanceStatus.COMPLETED ||
          current.status === MaintenanceStatus.CANCELLED
        ) {
          throw new BadRequestException('Maintenance record is already finalized');
        }
        await transaction.$queryRaw(
          Prisma.sql`SELECT id FROM "Vehicle" WHERE id = ${current.vehicleId} FOR UPDATE`,
        );
        const record = await transaction.maintenanceRecord.update({
          where: { id },
          data: {
            status: dto.status,
            costCents: dto.costCents,
            description: dto.description,
            completedAt:
              dto.status === MaintenanceStatus.COMPLETED ? new Date() : undefined,
          },
        });

        if (dto.status === MaintenanceStatus.IN_PROGRESS) {
          await transaction.vehicle.update({
            where: { id: current.vehicleId },
            data: { status: VehicleStatus.MAINTENANCE },
          });
        }
        if (
          dto.status === MaintenanceStatus.COMPLETED ||
          dto.status === MaintenanceStatus.CANCELLED
        ) {
          const [activeRental, futureBooking] = await Promise.all([
            transaction.rental.count({
              where: {
                vehicleId: current.vehicleId,
                status: { in: [RentalStatus.ACTIVE, RentalStatus.OVERDUE] },
              },
            }),
            transaction.booking.count({
              where: {
                vehicleId: current.vehicleId,
                status: WorkflowStatus.APPROVED,
                endAt: { gt: new Date() },
                rental: null,
              },
            }),
          ]);
          await transaction.vehicle.update({
            where: { id: current.vehicleId },
            data: {
              status: activeRental
                ? VehicleStatus.RENTED
                : futureBooking
                  ? VehicleStatus.RESERVED
                  : VehicleStatus.AVAILABLE,
              ...(current.odometer !== null
                ? { odometer: { set: current.odometer } }
                : {}),
            },
          });
        }
        await this.audit.write(
          {
            actorUserId: actor.id,
            action: 'maintenance.status_changed',
            entityType: 'MaintenanceRecord',
            entityId: id,
            metadata: { from: current.status, to: dto.status },
            context,
          },
          transaction,
        );
        return record;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }
}
