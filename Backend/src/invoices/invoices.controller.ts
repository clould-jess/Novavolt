import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentRequestContext } from '../common/decorators/request-context.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuthUser, RequestContext } from '../common/types/auth-user';
import {
  CreateInvoiceDto,
  InvoiceQueryDto,
  VoidInvoiceDto,
} from './dto';
import { InvoicesService } from './invoices.service';

@ApiTags('invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoices: InvoicesService) {}

  @UseGuards(RolesGuard)
  @Roles(Role.CUSTOMER)
  @Get('me')
  mine(@CurrentUser() user: AuthUser) {
    return this.invoices.mine(user.id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.AGENT, Role.ADMIN, Role.OWNER)
  @Get('staff')
  list(@Query() query: InvoiceQueryDto) {
    return this.invoices.list(query);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  @Post()
  create(
    @Body() dto: CreateInvoiceDto,
    @CurrentUser() user: AuthUser,
    @CurrentRequestContext() context: RequestContext,
  ) {
    return this.invoices.create(dto, user, context);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  @Patch(':id/void')
  void(
    @Param('id') id: string,
    @Body() dto: VoidInvoiceDto,
    @CurrentUser() user: AuthUser,
    @CurrentRequestContext() context: RequestContext,
  ) {
    return this.invoices.void(id, dto.reason, user, context);
  }
}
