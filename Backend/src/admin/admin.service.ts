import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import {
  InvoiceStatus,
  PaymentStatus,
  Prisma,
  Role,
  UserStatus,
} from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { AuthUser, RequestContext } from '../common/types/auth-user';
import { PrismaService } from '../prisma.service';
import {
  UpdateUserRoleDto,
  UpdateUserStatusDto,
  UserQueryDto,
} from './dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly db: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async dashboard() {
    const [
      users,
      pendingApplications,
      vehicles,
      activeRentals,
      openInvoices,
      failedPayments,
      revenue,
    ] = await Promise.all([
      this.db.user.count(),
      this.db.application.count({ where: { status: 'PENDING' } }),
      this.db.vehicle.count(),
      this.db.rental.count({ where: { status: { in: ['ACTIVE', 'OVERDUE'] } } }),
      this.db.invoice.count({
        where: { status: { in: [InvoiceStatus.OPEN, InvoiceStatus.OVERDUE] } },
      }),
      this.db.payment.count({ where: { status: PaymentStatus.FAILED } }),
      this.db.payment.aggregate({
        where: { status: PaymentStatus.SUCCEEDED },
        _sum: { amountCents: true },
      }),
    ]);
    return {
      users,
      pendingApplications,
      vehicles,
      activeRentals,
      openInvoices,
      failedPayments,
      collectedRevenueCents: revenue._sum.amountCents ?? 0,
      currency: 'CAD',
    };
  }

  async users(query: UserQueryDto) {
    const search = query.search?.trim();
    const where: Prisma.UserWhereInput = {
      ...(query.role ? { role: query.role } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(search
        ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' as const } },
              {
                profile: {
                  is: { firstName: { contains: search, mode: 'insensitive' } },
                },
              },
              {
                profile: {
                  is: { lastName: { contains: search, mode: 'insensitive' } },
                },
              },
            ],
          }
        : {}),
    };
    const [items, total] = await this.db.$transaction([
      this.db.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          emailVerifiedAt: true,
          profile: true,
          lastLoginAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.db.user.count({ where }),
    ]);
    return { items, total, page: query.page, limit: query.limit };
  }

  async updateStatus(
    id: string,
    dto: UpdateUserStatusDto,
    actor: AuthUser,
    context: RequestContext,
  ) {
    if (id === actor.id && dto.status !== UserStatus.ACTIVE) {
      throw new BadRequestException('You cannot suspend your own account');
    }
    return this.db.$transaction(async (transaction) => {
      const current = await transaction.user.findUniqueOrThrow({ where: { id } });
      if (current.role === Role.OWNER && actor.role !== Role.OWNER) {
        throw new ForbiddenException('Only an owner can modify another owner');
      }
      const user = await transaction.user.update({
        where: { id },
        data: { status: dto.status },
        select: { id: true, email: true, role: true, status: true },
      });
      if (dto.status !== UserStatus.ACTIVE) {
        await transaction.session.updateMany({
          where: { userId: id, revokedAt: null },
          data: { revokedAt: new Date(), revokedReason: 'account_status_changed' },
        });
      }
      await this.audit.write(
        {
          actorUserId: actor.id,
          action: 'user.status_changed',
          entityType: 'User',
          entityId: id,
          metadata: { from: current.status, to: dto.status },
          context,
        },
        transaction,
      );
      return user;
    });
  }

  async updateRole(
    id: string,
    dto: UpdateUserRoleDto,
    actor: AuthUser,
    context: RequestContext,
  ) {
    if (id === actor.id) {
      throw new BadRequestException('You cannot change your own role');
    }
    return this.db.$transaction(async (transaction) => {
      const current = await transaction.user.findUniqueOrThrow({ where: { id } });
      const ownerCount = await transaction.user.count({
        where: { role: Role.OWNER, status: UserStatus.ACTIVE },
      });
      if (dto.role === Role.ADMIN && current.role !== Role.ADMIN) {
        const activeAdminCount = await transaction.user.count({
          where: {
            role: Role.ADMIN,
            status: UserStatus.ACTIVE,
            NOT: { id },
          },
        });
        if (activeAdminCount > 0) {
          throw new BadRequestException('Only one active admin account is allowed');
        }
      }
      if (
        current.role === Role.OWNER &&
        dto.role !== Role.OWNER &&
        ownerCount <= 1
      ) {
        throw new BadRequestException('At least one active owner is required');
      }
      const user = await transaction.user.update({
        where: { id },
        data: { role: dto.role },
        select: { id: true, email: true, role: true, status: true },
      });
      await transaction.session.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: new Date(), revokedReason: 'role_changed' },
      });
      await this.audit.write(
        {
          actorUserId: actor.id,
          action: 'user.role_changed',
          entityType: 'User',
          entityId: id,
          metadata: { from: current.role, to: dto.role },
          context,
        },
        transaction,
      );
      return user;
    });
  }
}
