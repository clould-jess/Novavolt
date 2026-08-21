import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthUser } from '../common/types/auth-user';
import { PrismaService } from '../prisma.service';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly db: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  @Get('me')
  async mine(@CurrentUser() user: AuthUser, @Query() query: PaginationDto) {
    const where = { userId: user.id };
    const [items, total] = await this.db.$transaction([
      this.db.notification.findMany({
        where,
        select: {
          id: true,
          channel: true,
          template: true,
          status: true,
          createdAt: true,
          sentAt: true,
          readAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.db.notification.count({ where }),
    ]);
    return { items, total, page: query.page, limit: query.limit };
  }

  @Patch(':id/read')
  markRead(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.notifications.markRead(user.id, id);
  }
}
