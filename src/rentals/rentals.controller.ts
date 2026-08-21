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
  ActivateRentalDto,
  CreateDepositDto,
  RentalQueryDto,
  UpdateDepositDto,
  UpdateRentalStatusDto,
} from './dto';
import { RentalsService } from './rentals.service';

@ApiTags('rentals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rentals')
export class RentalsController {
  constructor(private readonly rentals: RentalsService) {}

  @UseGuards(RolesGuard)
  @Roles(Role.CUSTOMER)
  @Get('me')
  mine(@CurrentUser() user: AuthUser) {
    return this.rentals.mine(user.id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.AGENT, Role.FLEET_MANAGER, Role.ADMIN, Role.OWNER)
  @Get('staff')
  list(@Query() query: RentalQueryDto) {
    return this.rentals.list(query);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.FLEET_MANAGER, Role.ADMIN, Role.OWNER)
  @Post('activate')
  activate(
    @Body() dto: ActivateRentalDto,
    @CurrentUser() user: AuthUser,
    @CurrentRequestContext() context: RequestContext,
  ) {
    return this.rentals.activate(dto, user, context);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.FLEET_MANAGER, Role.ADMIN, Role.OWNER)
  @Patch(':id/status')
  status(
    @Param('id') id: string,
    @Body() dto: UpdateRentalStatusDto,
    @CurrentUser() user: AuthUser,
    @CurrentRequestContext() context: RequestContext,
  ) {
    return this.rentals.updateStatus(id, dto, user, context);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  @Post(':id/deposits')
  createDeposit(
    @Param('id') id: string,
    @Body() dto: CreateDepositDto,
    @CurrentUser() user: AuthUser,
    @CurrentRequestContext() context: RequestContext,
  ) {
    return this.rentals.createDeposit(id, dto, user, context);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  @Patch('deposits/:id')
  updateDeposit(
    @Param('id') id: string,
    @Body() dto: UpdateDepositDto,
    @CurrentUser() user: AuthUser,
    @CurrentRequestContext() context: RequestContext,
  ) {
    return this.rentals.updateDeposit(id, dto, user, context);
  }
}
