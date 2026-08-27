import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  CreateReservationRequestDto,
  ReservationRequestQueryDto,
  UpdateReservationRequestStatusDto,
} from './dto';
import { ReservationRequestsService } from './reservation-requests.service';

@ApiTags('reservation-requests')
@Controller('reservation-requests')
export class ReservationRequestsController {
  constructor(private readonly requests: ReservationRequestsService) {}

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateReservationRequestDto) {
    return this.requests.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  @Get()
  list(@Query() query: ReservationRequestQueryDto) {
    return this.requests.list(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateReservationRequestStatusDto,
  ) {
    return this.requests.updateStatus(id, body.status);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.requests.delete(id);
  }
}
