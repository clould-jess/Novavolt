import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  InvoiceStatus,
  PaymentStatus,
  Prisma,
} from '@prisma/client';
import Stripe from 'stripe';
import { AuditService } from '../audit/audit.service';
import { AuthUser, RequestContext } from '../common/types/auth-user';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe | null;

  constructor(
    private readonly db: PrismaService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
  ) {
    const secret = config.get<string>('STRIPE_SECRET_KEY');
    this.stripe = secret
      ? new Stripe(secret, {
          maxNetworkRetries: 2,
          timeout: 15_000,
          telemetry: false,
        })
      : null;
  }

  mine(customerId: string) {
    return this.db.payment.findMany({
      where: { invoice: { rental: { customerId } } },
      select: {
        id: true,
        invoiceId: true,
        amountCents: true,
        currency: true,
        status: true,
        failureCode: true,
        paidAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createInvoicePaymentIntent(
    invoiceId: string,
    idempotencyKey: string | undefined,
    customer: AuthUser,
    context: RequestContext,
  ) {
    const stripe = this.requireStripe();
    if (
      !idempotencyKey ||
      !/^[a-zA-Z0-9._:-]{8,255}$/.test(idempotencyKey)
    ) {
      throw new BadRequestException(
        'A valid Idempotency-Key header is required',
      );
    }

    const invoice = await this.db.invoice.findFirstOrThrow({
      where: { id: invoiceId, rental: { customerId: customer.id } },
      include: { payments: true },
    });
    if (
      invoice.status !== InvoiceStatus.OPEN &&
      invoice.status !== InvoiceStatus.OVERDUE
    ) {
      throw new BadRequestException('Invoice is not payable');
    }
    const paidCents = invoice.payments
      .filter(({ status }) => status === PaymentStatus.SUCCEEDED)
      .reduce((sum, payment) => sum + payment.amountCents, 0);
    const amountCents = invoice.totalCents - paidCents;
    if (amountCents <= 0) {
      throw new BadRequestException('Invoice is already paid');
    }

    let payment = await this.db.payment.findUnique({
      where: { idempotencyKey },
    });
    if (payment && payment.invoiceId !== invoiceId) {
      throw new BadRequestException('Idempotency key was used for another invoice');
    }
    if (!payment) {
      try {
        payment = await this.db.payment.create({
          data: {
            invoiceId,
            provider: 'STRIPE',
            idempotencyKey,
            amountCents,
            currency: invoice.currency,
          },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          payment = await this.db.payment.findUniqueOrThrow({
            where: { idempotencyKey },
          });
        } else {
          throw error;
        }
      }
    }
    if (payment.invoiceId !== invoiceId) {
      throw new BadRequestException('Idempotency key was used for another invoice');
    }

    try {
      const intent = payment.providerPaymentId
        ? await stripe.paymentIntents.retrieve(payment.providerPaymentId)
        : await stripe.paymentIntents.create(
            {
              amount: payment.amountCents,
              currency: payment.currency.toLowerCase(),
              automatic_payment_methods: { enabled: true },
              receipt_email: customer.email,
              metadata: {
                paymentId: payment.id,
                invoiceId,
                customerId: customer.id,
              },
              description: `NovaVolt invoice ${invoiceId}`,
            },
            { idempotencyKey },
          );

      if (!payment.providerPaymentId) {
        await this.db.$transaction(async (transaction) => {
          await transaction.payment.update({
            where: { id: payment.id },
            data: {
              providerPaymentId: intent.id,
              status: PaymentStatus.PENDING,
              failureCode: null,
            },
          });
          await this.audit.write(
            {
              actorUserId: customer.id,
              action: 'payment.intent_created',
              entityType: 'Payment',
              entityId: payment.id,
              metadata: { invoiceId, amountCents, provider: 'STRIPE' },
              context,
            },
            transaction,
          );
        });
      } else if (payment.status === PaymentStatus.FAILED) {
        await this.db.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.PENDING, failureCode: null },
        });
      }

      return {
        paymentId: payment.id,
        clientSecret: intent.client_secret,
        amountCents: payment.amountCents,
        currency: payment.currency,
      };
    } catch (error) {
      await this.db.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED, failureCode: 'provider_error' },
      });
      throw new BadGatewayException('Payment provider request failed');
    }
  }

  constructWebhookEvent(rawBody: Buffer | undefined, signature?: string): Stripe.Event {
    const stripe = this.requireStripe();
    if (!rawBody || !signature) {
      throw new BadRequestException('Missing Stripe webhook signature or raw body');
    }
    try {
      return stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.config.getOrThrow<string>('STRIPE_WEBHOOK_SECRET'),
      );
    } catch {
      throw new BadRequestException('Invalid Stripe webhook signature');
    }
  }

  async processWebhook(event: Stripe.Event) {
    const payload = JSON.parse(JSON.stringify(event)) as Prisma.InputJsonValue;
    let record = await this.db.paymentWebhook.findUnique({
      where: { provider_eventId: { provider: 'STRIPE', eventId: event.id } },
    });
    if (record?.processedAt) {
      return { received: true, duplicate: true };
    }
    if (!record) {
      try {
        record = await this.db.paymentWebhook.create({
          data: {
            provider: 'STRIPE',
            eventId: event.id,
            eventType: event.type,
            payload,
          },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          record = await this.db.paymentWebhook.findUniqueOrThrow({
            where: {
              provider_eventId: { provider: 'STRIPE', eventId: event.id },
            },
          });
          if (record.processedAt) {
            return { received: true, duplicate: true };
          }
        } else {
          throw error;
        }
      }
    }

    const claimed = await this.db.paymentWebhook.updateMany({
      where: {
        id: record.id,
        processedAt: null,
        OR: [
          { processingStartedAt: null },
          { processingStartedAt: { lt: new Date(Date.now() - 5 * 60_000) } },
        ],
      },
      data: { processingStartedAt: new Date(), error: null },
    });
    if (claimed.count !== 1) {
      return { received: true, duplicate: true };
    }

    try {
      await this.applyStripeEvent(event);
      await this.db.paymentWebhook.update({
        where: { id: record.id },
        data: {
          processedAt: new Date(),
          processingStartedAt: null,
          error: null,
        },
      });
      return { received: true };
    } catch (error) {
      await this.db.paymentWebhook.update({
        where: { id: record.id },
        data: { processingStartedAt: null, error: 'processing_failed' },
      });
      throw error;
    }
  }

  private async applyStripeEvent(event: Stripe.Event): Promise<void> {
    if (
      event.type === 'payment_intent.succeeded' ||
      event.type === 'payment_intent.payment_failed' ||
      event.type === 'payment_intent.canceled'
    ) {
      const intent = event.data.object as Stripe.PaymentIntent;
      const paymentId = intent.metadata.paymentId;
      const payment = paymentId
        ? await this.db.payment.findUnique({ where: { id: paymentId } })
        : await this.db.payment.findUnique({
            where: { providerPaymentId: intent.id },
          });
      if (!payment) {
        throw new BadRequestException('Webhook references an unknown payment');
      }

      const status =
        event.type === 'payment_intent.succeeded'
          ? PaymentStatus.SUCCEEDED
          : PaymentStatus.FAILED;
      await this.db.$transaction(async (transaction) => {
        await transaction.payment.update({
          where: { id: payment.id },
          data: {
            status,
            providerPaymentId: intent.id,
            providerPaymentMethodId:
              typeof intent.payment_method === 'string'
                ? intent.payment_method
                : intent.payment_method?.id,
            paidAt: status === PaymentStatus.SUCCEEDED ? new Date() : null,
            failureCode:
              status === PaymentStatus.FAILED
                ? intent.last_payment_error?.code ?? 'payment_failed'
                : null,
          },
        });

        if (status === PaymentStatus.SUCCEEDED) {
          const invoice = await transaction.invoice.findUniqueOrThrow({
            where: { id: payment.invoiceId },
          });
          const aggregate = await transaction.payment.aggregate({
            where: {
              invoiceId: payment.invoiceId,
              status: PaymentStatus.SUCCEEDED,
            },
            _sum: { amountCents: true },
          });
          if ((aggregate._sum.amountCents ?? 0) >= invoice.totalCents) {
            await transaction.invoice.update({
              where: { id: invoice.id },
              data: { status: InvoiceStatus.PAID },
            });
          }
        }
        await this.audit.write(
          {
            action:
              status === PaymentStatus.SUCCEEDED
                ? 'payment.succeeded'
                : 'payment.failed',
            entityType: 'Payment',
            entityId: payment.id,
            metadata: { providerEventId: event.id },
          },
          transaction,
        );
      });
      return;
    }

    if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge;
      const intentId =
        typeof charge.payment_intent === 'string'
          ? charge.payment_intent
          : charge.payment_intent?.id;
      if (!intentId) {
        return;
      }
      const payment = await this.db.payment.findUnique({
        where: { providerPaymentId: intentId },
      });
      if (payment && charge.amount_refunded >= payment.amountCents) {
        await this.db.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.REFUNDED },
        });
      }
    }
  }

  private requireStripe(): Stripe {
    if (!this.config.get<boolean>('PAYMENTS_ENABLED', false) || !this.stripe) {
      throw new ServiceUnavailableException('Payments are not configured');
    }
    return this.stripe;
  }
}
