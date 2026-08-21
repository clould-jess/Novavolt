import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
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
import { AdminService } from './admin.service';
import {
  UpdateUserRoleDto,
  UpdateUserStatusDto,
  UserQueryDto,
} from './dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.OWNER)
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('dashboard')
  dashboard() {
    return this.admin.dashboard();
  }

  @Get('users')
  users(@Query() query: UserQueryDto) {
    return this.admin.users(query);
  }

  @Patch('users/:id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() user: AuthUser,
    @CurrentRequestContext() context: RequestContext,
  ) {
    return this.admin.updateStatus(id, dto, user, context);
  }

  @Roles(Role.OWNER)
  @Patch('users/:id/role')
  updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() user: AuthUser,
    @CurrentRequestContext() context: RequestContext,
  ) {
    return this.admin.updateRole(id, dto, user, context);
  }
}
