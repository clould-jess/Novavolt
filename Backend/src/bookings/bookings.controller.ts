import {
  Body,
  Controller,
  Get,
  HttpCode,
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
import { BookingsService } from './bookings.service';
import {
  BookingQueryDto,
  CreateBookingDto,
  ReviewBookingDto,
} from './dto';

@ApiTags('bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @UseGuards(RolesGuard)
  @Roles(Role.CUSTOMER)
  @Get('me')
  mine(@CurrentUser() user: AuthUser) {
    return this.bookings.mine(user.id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.AGENT, Role.FLEET_MANAGER, Role.ADMIN, Role.OWNER)
  @Get('staff')
  list(@Query() query: BookingQueryDto) {
    return this.bookings.list(query);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.CUSTOMER)
  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateBookingDto,
    @CurrentRequestContext() context: RequestContext,
  ) {
    return this.bookings.create(user, dto, context);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.AGENT, Role.FLEET_MANAGER, Role.ADMIN, Role.OWNER)
  @Patch(':id/review')
  review(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: ReviewBookingDto,
    @CurrentRequestContext() context: RequestContext,
  ) {
    return this.bookings.review(id, dto, user, context);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.CUSTOMER)
  @HttpCode(200)
  @Post(':id/cancel')
  cancel(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @CurrentRequestContext() context: RequestContext,
  ) {
    return this.bookings.cancel(id, user, context);
  }
}
