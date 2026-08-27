import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminNotificationsService } from './admin-notifications.service';

@ApiTags('admin-notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.OWNER)
@Controller('admin-notifications')
export class AdminNotificationsController {
  constructor(private readonly notifications: AdminNotificationsService) {}

  @Get()
  list(@Query('page') page = '1', @Query('limit') limit = '20', @Query('unread') unread = 'false') {
    return this.notifications.list(Math.max(1, Number(page) || 1), Math.min(100, Math.max(1, Number(limit) || 20)), unread === 'true');
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string) { return this.notifications.markRead(id); }

  @Patch(':id/archive')
  archive(@Param('id') id: string) { return this.notifications.archive(id); }
}
