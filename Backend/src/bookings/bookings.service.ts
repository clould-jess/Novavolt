import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import {
  DocumentStatus,
  DocumentType,
  Prisma,
  VehicleStatus,
  WorkflowStatus,
} from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { AuthUser, RequestContext } from '../common/types/auth-user';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma.service';
import { parseBookingInterval } from './booking-rules';
import {
  BookingQueryDto,
  CreateBookingDto,
  ReviewBookingDto,
} from './dto';

@Injectable()
export class BookingsService {
  constructor(
    private readonly db: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  mine(customerId: string) {
    return this.db.booking.findMany({
      where: { customerId },
      include: {
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            weeklyRateCents: true,
            currency: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async list(query: BookingQueryDto) {
    const where: Prisma.BookingWhereInput = query.status
      ? { status: query.status }
      : {};
    const [items, total] = await this.db.$transaction([
      this.db.booking.findMany({
        where,
        include: {
          customer: { select: { id: true, email: true, profile: true } },
          vehicle: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.db.booking.count({ where }),
    ]);
    return { items, total, page: query.page, limit: query.limit };
  }

  async create(
    customer: AuthUser,
    dto: CreateBookingDto,
    context: RequestContext,
  ) {
    const { startAt, endAt } = parseBookingInterval(dto.startAt, dto.endAt);
    return this.db.$transaction(
      async (transaction) => {
        const vehicle = await transaction.vehicle.findUniqueOrThrow({
          where: { id: dto.vehicleId },
        });
        if (
          vehicle.status === VehicleStatus.MAINTENANCE ||
          vehicle.status === VehicleStatus.INACTIVE
        ) {
          throw new ConflictException('Vehicle is unavailable');
        }

        const [approvedApplication, approvedLicense] = await Promise.all([
          transaction.application.findFirst({
            where: {
              customerId: customer.id,
              status: WorkflowStatus.APPROVED,
              OR: [
                { requestedVehicleId: null },
                { requestedVehicleId: dto.vehicleId },
              ],
            },
            select: { id: true },
          }),
          transaction.document.findFirst({
            where: {
              customerId: customer.id,
              type: DocumentType.DRIVERS_LICENSE,
              status: DocumentStatus.APPROVED,
              OR: [{ expiresAt: null }, { expiresAt: { gt: endAt } }],
            },
            select: { id: true },
          }),
        ]);
        if (!approvedApplication || !approvedLicense) {
          throw new BadRequestException(
            'An approved application and valid driver license are required',
          );
        }

        const [ownOverlap, approvedOverlap, activeRental] = await Promise.all([
          transaction.booking.findFirst({
            where: {
              customerId: customer.id,
              status: { in: [WorkflowStatus.PENDING, WorkflowStatus.APPROVED] },
              startAt: { lt: endAt },
              endAt: { gt: startAt },
            },
            select: { id: true },
          }),
          transaction.booking.findFirst({
            where: {
              vehicleId: dto.vehicleId,
              status: WorkflowStatus.APPROVED,
              startAt: { lt: endAt },
              endAt: { gt: startAt },
            },
            select: { id: true },
          }),
          transaction.rental.findFirst({
            where: {
              vehicleId: dto.vehicleId,
              OR: [
                { status: 'OVERDUE' },
                {
                  status: { in: ['PENDING', 'ACTIVE'] },
                  startAt: { lt: endAt },
                  OR: [{ endAt: null }, { endAt: { gt: startAt } }],
                },
              ],
            },
            select: { id: true },
          }),
        ]);
        if (ownOverlap) {
          throw new ConflictException('You already have an overlapping booking');
        }
        if (approvedOverlap || activeRental) {
          throw new ConflictException('Vehicle is unavailable for this interval');
        }

        const booking = await transaction.booking.create({
          data: {
            customerId: customer.id,
            vehicleId: dto.vehicleId,
            startAt,
            endAt,
          },
        });
        await this.audit.write(
          {
            actorUserId: customer.id,
            action: 'booking.requested',
            entityType: 'Booking',
            entityId: booking.id,
            metadata: {
              vehicleId: dto.vehicleId,
              startAt: startAt.toISOString(),
              endAt: endAt.toISOString(),
            },
            context,
          },
          transaction,
        );
        return booking;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async review(
    id: string,
    dto: ReviewBookingDto,
    actor: AuthUser,
    context: RequestContext,
  ) {
    const booking = await this.db.$transaction(
      async (transaction) => {
        const current = await transaction.booking.findUniqueOrThrow({
          where: { id },
        });
        if (current.status !== WorkflowStatus.PENDING) {
          throw new BadRequestException('Only a pending booking can be reviewed');
        }

        await transaction.$queryRaw(
          Prisma.sql`SELECT id FROM "Vehicle" WHERE id = ${current.vehicleId} FOR UPDATE`,
        );
        if (dto.status === 'APPROVED') {
          const [overlap, rental] = await Promise.all([
            transaction.booking.findFirst({
              where: {
                id: { not: id },
                vehicleId: current.vehicleId,
                status: WorkflowStatus.APPROVED,
                startAt: { lt: current.endAt },
                endAt: { gt: current.startAt },
              },
              select: { id: true },
            }),
            transaction.rental.findFirst({
              where: {
                vehicleId: current.vehicleId,
                OR: [
                  { status: 'OVERDUE' },
                  {
                    status: { in: ['PENDING', 'ACTIVE'] },
                    startAt: { lt: current.endAt },
                    OR: [
                      { endAt: null },
                      { endAt: { gt: current.startAt } },
                    ],
                  },
                ],
              },
              select: { id: true },
            }),
          ]);
          if (overlap || rental) {
            throw new ConflictException('Vehicle is no longer available');
          }
        }

        const updated = await transaction.booking.update({
          where: { id },
          data: {
            status: dto.status,
            reviewNote: dto.reviewNote,
            reviewedAt: new Date(),
            reviewedById: actor.id,
          },
        });
        if (dto.status === 'APPROVED') {
          await transaction.vehicle.updateMany({
            where: {
              id: current.vehicleId,
              status: VehicleStatus.AVAILABLE,
            },
            data: { status: VehicleStatus.RESERVED },
          });
        }
        await this.audit.write(
          {
            actorUserId: actor.id,
            action: 'booking.reviewed',
            entityType: 'Booking',
            entityId: id,
            metadata: { decision: dto.status },
            context,
          },
          transaction,
        );
        return updated;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    await this.notifications.queue(
      booking.customerId,
      'IN_APP',
      'BOOKING_REVIEWED',
      booking.customerId,
      { bookingId: booking.id, status: booking.status },
    );
    return booking;
  }

  async cancel(
    id: string,
    customer: AuthUser,
    context: RequestContext,
  ) {
    return this.db.$transaction(
      async (transaction) => {
        const current = await transaction.booking.findFirstOrThrow({
          where: { id, customerId: customer.id },
          include: { rental: { select: { id: true } } },
        });
        if (
          current.status !== WorkflowStatus.PENDING &&
          current.status !== WorkflowStatus.APPROVED
        ) {
          throw new BadRequestException('This booking cannot be cancelled');
        }
        if (current.rental) {
          throw new BadRequestException('An activated rental cannot be cancelled here');
        }
        await transaction.$queryRaw(
          Prisma.sql`SELECT id FROM "Vehicle" WHERE id = ${current.vehicleId} FOR UPDATE`,
        );
        const booking = await transaction.booking.update({
          where: { id },
          data: { status: WorkflowStatus.CANCELLED, cancelledAt: new Date() },
        });
        const otherApproved = await transaction.booking.count({
          where: {
            id: { not: id },
            vehicleId: current.vehicleId,
            status: WorkflowStatus.APPROVED,
            endAt: { gt: new Date() },
          },
        });
        const activeRental = await transaction.rental.count({
          where: {
            vehicleId: current.vehicleId,
            status: { in: ['PENDING', 'ACTIVE', 'OVERDUE'] },
          },
        });
        if (!otherApproved && !activeRental) {
          await transaction.vehicle.updateMany({
            where: { id: current.vehicleId, status: VehicleStatus.RESERVED },
            data: { status: VehicleStatus.AVAILABLE },
          });
        }
        await this.audit.write(
          {
            actorUserId: customer.id,
            action: 'booking.cancelled',
            entityType: 'Booking',
            entityId: id,
            context,
          },
          transaction,
        );
        return booking;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }
}
