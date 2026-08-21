import {
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Request } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentRequestContext } from '../common/decorators/request-context.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuthUser, RequestContext } from '../common/types/auth-user';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @Get('me')
  mine(@CurrentUser() user: AuthUser) {
    return this.payments.mine(user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @Post('invoices/:invoiceId/intent')
  createIntent(
    @Param('invoiceId') invoiceId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @CurrentUser() user: AuthUser,
    @CurrentRequestContext() context: RequestContext,
  ) {
    return this.payments.createInvoicePaymentIntent(
      invoiceId,
      idempotencyKey,
      user,
      context,
    );
  }

  @HttpCode(200)
  @Post('webhooks/stripe')
  webhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature?: string,
  ) {
    const event = this.payments.constructWebhookEvent(
      request.rawBody,
      signature,
    );
    return this.payments.processWebhook(event);
  }
}
