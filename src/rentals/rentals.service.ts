import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  DepositStatus,
  Prisma,
  RentalStatus,
  VehicleStatus,
  WorkflowStatus,
} from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { AuthUser, RequestContext } from '../common/types/auth-user';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma.service';
import {
  ActivateRentalDto,
  CreateDepositDto,
  RentalQueryDto,
  UpdateDepositDto,
  UpdateRentalStatusDto,
} from './dto';
import { canTransitionRental } from './rental-rules';

@Injectable()
export class RentalsService {
  constructor(
    private readonly db: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  mine(customerId: string) {
    return this.db.rental.findMany({
      where: { customerId },
      include: {
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            plate: true,
          },
        },
        invoices: { orderBy: { dueAt: 'desc' } },
        contracts: {
          select: { id: true, version: true, signedAt: true, createdAt: true },
        },
        deposits: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async list(query: RentalQueryDto) {
    const where: Prisma.RentalWhereInput = query.status
      ? { status: query.status }
      : {};
    const [items, total] = await this.db.$transaction([
      this.db.rental.findMany({
        where,
        include: {
          customer: { select: { id: true, email: true, profile: true } },
          vehicle: true,
          deposits: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.db.rental.count({ where }),
    ]);
    return { items, total, page: query.page, limit: query.limit };
  }

  async activate(
    dto: ActivateRentalDto,
    actor: AuthUser,
    context: RequestContext,
  ) {
    const rental = await this.db.$transaction(
      async (transaction) => {
        const booking = await transaction.booking.findUniqueOrThrow({
          where: { id: dto.bookingId },
          include: { vehicle: true },
        });
        if (booking.status !== WorkflowStatus.APPROVED) {
          throw new BadRequestException('Booking must be approved first');
        }
        if (booking.endAt <= new Date()) {
          throw new BadRequestException('Booking has already ended');
        }
        if (booking.startAt.getTime() > Date.now() + 24 * 60 * 60_000) {
          throw new BadRequestException(
            'Rental can only be activated within 24 hours of its start',
          );
        }
        if (dto.startOdometer < booking.vehicle.odometer) {
          throw new BadRequestException('Odometer cannot decrease');
        }

        await transaction.$queryRaw(
          Prisma.sql`SELECT id FROM "Vehicle" WHERE id = ${booking.vehicleId} FOR UPDATE`,
        );
        const existing = await transaction.rental.findFirst({
          where: {
            OR: [
              { bookingId: booking.id },
              {
                vehicleId: booking.vehicleId,
                status: {
                  in: [
                    RentalStatus.PENDING,
                    RentalStatus.ACTIVE,
                    RentalStatus.OVERDUE,
                  ],
                },
              },
            ],
          },
          select: { id: true },
        });
        if (existing) {
          throw new ConflictException('Rental is already active');
        }
        if (
          booking.vehicle.status === VehicleStatus.MAINTENANCE ||
          booking.vehicle.status === VehicleStatus.INACTIVE
        ) {
          throw new ConflictException('Vehicle is not operational');
        }

        const created = await transaction.rental.create({
          data: {
            bookingId: booking.id,
            customerId: booking.customerId,
            vehicleId: booking.vehicleId,
            startAt: new Date(),
            endAt: booking.endAt,
            weeklyRateCents: booking.vehicle.weeklyRateCents,
            currency: booking.vehicle.currency,
            startOdometer: dto.startOdometer,
            status: RentalStatus.ACTIVE,
          },
        });
        await transaction.vehicle.update({
          where: { id: booking.vehicleId },
          data: { status: VehicleStatus.RENTED, odometer: dto.startOdometer },
        });
        await this.audit.write(
          {
            actorUserId: actor.id,
            action: 'rental.activated',
            entityType: 'Rental',
            entityId: created.id,
            metadata: { bookingId: booking.id, vehicleId: booking.vehicleId },
            context,
          },
          transaction,
        );
        return created;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    await this.notifications.queue(
      rental.customerId,
      'IN_APP',
      'RENTAL_ACTIVATED',
      rental.customerId,
      { rentalId: rental.id },
    );
    return rental;
  }

  async updateStatus(
    id: string,
    dto: UpdateRentalStatusDto,
    actor: AuthUser,
    context: RequestContext,
  ) {
    return this.db.$transaction(
      async (transaction) => {
        const current = await transaction.rental.findUniqueOrThrow({
          where: { id },
        });
        if (!canTransitionRental(current.status, dto.status)) {
          throw new BadRequestException(
            `Invalid rental transition from ${current.status} to ${dto.status}`,
          );
        }
        if (
          dto.status === RentalStatus.COMPLETED &&
          dto.endOdometer === undefined
        ) {
          throw new BadRequestException('End odometer is required');
        }
        if (
          dto.endOdometer !== undefined &&
          current.startOdometer !== null &&
          dto.endOdometer < current.startOdometer
        ) {
          throw new BadRequestException('End odometer cannot be lower than start');
        }

        await transaction.$queryRaw(
          Prisma.sql`SELECT id FROM "Vehicle" WHERE id = ${current.vehicleId} FOR UPDATE`,
        );
        const terminal =
          dto.status === RentalStatus.COMPLETED ||
          dto.status === RentalStatus.CANCELLED;
        const rental = await transaction.rental.update({
          where: { id },
          data: {
            status: dto.status,
            endOdometer: dto.endOdometer,
            completedAt: terminal ? new Date() : undefined,
          },
        });

        if (terminal) {
          const futureBooking = await transaction.booking.count({
            where: {
              vehicleId: current.vehicleId,
              status: WorkflowStatus.APPROVED,
              endAt: { gt: new Date() },
              rental: null,
            },
          });
          await transaction.vehicle.update({
            where: { id: current.vehicleId },
            data: {
              status: futureBooking
                ? VehicleStatus.RESERVED
                : VehicleStatus.AVAILABLE,
              ...(dto.endOdometer !== undefined
                ? { odometer: dto.endOdometer }
                : {}),
            },
          });
        }

        await this.audit.write(
          {
            actorUserId: actor.id,
            action: 'rental.status_changed',
            entityType: 'Rental',
            entityId: id,
            metadata: { from: current.status, to: dto.status },
            context,
          },
          transaction,
        );
        return rental;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async createDeposit(
    rentalId: string,
    dto: CreateDepositDto,
    actor: AuthUser,
    context: RequestContext,
  ) {
    return this.db.$transaction(async (transaction) => {
      const rental = await transaction.rental.findUniqueOrThrow({
        where: { id: rentalId },
      });
      const deposit = await transaction.deposit.create({
        data: {
          rentalId,
          amountCents: dto.amountCents,
          currency: rental.currency,
          providerReference: dto.providerReference,
        },
      });
      await this.audit.write(
        {
          actorUserId: actor.id,
          action: 'deposit.created',
          entityType: 'Deposit',
          entityId: deposit.id,
          metadata: { rentalId, amountCents: dto.amountCents },
          context,
        },
        transaction,
      );
      return deposit;
    });
  }

  async updateDeposit(
    depositId: string,
    dto: UpdateDepositDto,
    actor: AuthUser,
    context: RequestContext,
  ) {
    return this.db.$transaction(async (transaction) => {
      const current = await transaction.deposit.findUniqueOrThrow({
        where: { id: depositId },
      });
      if (
        current.status === DepositStatus.RELEASED ||
        current.status === DepositStatus.REFUNDED
      ) {
        throw new BadRequestException('Deposit is already finalized');
      }
      const deposit = await transaction.deposit.update({
        where: { id: depositId },
        data: {
          status: dto.status,
          heldAt: dto.status === DepositStatus.HELD ? new Date() : undefined,
          releasedAt:
            dto.status === DepositStatus.RELEASED ? new Date() : undefined,
        },
      });
      await this.audit.write(
        {
          actorUserId: actor.id,
          action: 'deposit.status_changed',
          entityType: 'Deposit',
          entityId: depositId,
          metadata: { from: current.status, to: dto.status },
          context,
        },
        transaction,
      );
      return deposit;
    });
  }

  @Cron(CronExpression.EVERY_HOUR)
  async markOverdueRentals(): Promise<void> {
    await this.db.rental.updateMany({
      where: {
        status: RentalStatus.ACTIVE,
        endAt: { lt: new Date() },
      },
      data: { status: RentalStatus.OVERDUE },
    });
  }
}
