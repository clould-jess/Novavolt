import { BadRequestException, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InvoiceStatus, Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { AuthUser, RequestContext } from '../common/types/auth-user';
import { PrismaService } from '../prisma.service';
import { CreateInvoiceDto, InvoiceQueryDto } from './dto';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly db: PrismaService,
    private readonly audit: AuditService,
  ) {}

  mine(customerId: string) {
    return this.db.invoice.findMany({
      where: { rental: { customerId } },
      include: {
        payments: {
          select: {
            id: true,
            amountCents: true,
            currency: true,
            status: true,
            paidAt: true,
            createdAt: true,
          },
        },
      },
      orderBy: { dueAt: 'desc' },
    });
  }

  async list(query: InvoiceQueryDto) {
    const where: Prisma.InvoiceWhereInput = query.status
      ? { status: query.status }
      : {};
    const [items, total] = await this.db.$transaction([
      this.db.invoice.findMany({
        where,
        include: {
          rental: {
            include: {
              customer: { select: { id: true, email: true, profile: true } },
              vehicle: true,
            },
          },
          payments: true,
        },
        orderBy: { dueAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.db.invoice.count({ where }),
    ]);
    return { items, total, page: query.page, limit: query.limit };
  }

  async create(
    dto: CreateInvoiceDto,
    actor: AuthUser,
    context: RequestContext,
  ) {
    const periodStart = new Date(dto.periodStart);
    const periodEnd = new Date(dto.periodEnd);
    const dueAt = new Date(dto.dueAt);
    if (periodStart >= periodEnd) {
      throw new BadRequestException('Invalid invoice period');
    }
    if (dto.subtotalCents + dto.taxCents !== dto.totalCents) {
      throw new BadRequestException('Invoice total does not match subtotal plus tax');
    }

    return this.db.$transaction(async (transaction) => {
      const rental = await transaction.rental.findUniqueOrThrow({
        where: { id: dto.rentalId },
      });
      const invoice = await transaction.invoice.create({
        data: {
          rentalId: dto.rentalId,
          periodStart,
          periodEnd,
          subtotalCents: dto.subtotalCents,
          taxCents: dto.taxCents,
          totalCents: dto.totalCents,
          currency: rental.currency,
          dueAt,
        },
      });
      await this.audit.write(
        {
          actorUserId: actor.id,
          action: 'invoice.created',
          entityType: 'Invoice',
          entityId: invoice.id,
          metadata: {
            rentalId: dto.rentalId,
            totalCents: dto.totalCents,
            currency: rental.currency,
          },
          context,
        },
        transaction,
      );
      return invoice;
    });
  }

  async void(
    id: string,
    reason: string,
    actor: AuthUser,
    context: RequestContext,
  ) {
    return this.db.$transaction(async (transaction) => {
      const current = await transaction.invoice.findUniqueOrThrow({
        where: { id },
      });
      if (
        current.status !== InvoiceStatus.DRAFT &&
        current.status !== InvoiceStatus.OPEN &&
        current.status !== InvoiceStatus.OVERDUE
      ) {
        throw new BadRequestException('Paid or already void invoices cannot be voided');
      }
      const invoice = await transaction.invoice.update({
        where: { id },
        data: { status: InvoiceStatus.VOID },
      });
      await this.audit.write(
        {
          actorUserId: actor.id,
          action: 'invoice.voided',
          entityType: 'Invoice',
          entityId: id,
          metadata: { reason },
          context,
        },
        transaction,
      );
      return invoice;
    });
  }

  @Cron(CronExpression.EVERY_HOUR)
  async markOverdue(): Promise<void> {
    await this.db.invoice.updateMany({
      where: { status: InvoiceStatus.OPEN, dueAt: { lt: new Date() } },
      data: { status: InvoiceStatus.OVERDUE },
    });
  }
}
