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
  CreateMaintenanceDto,
  MaintenanceQueryDto,
  UpdateMaintenanceDto,
} from './dto';
import { MaintenanceService } from './maintenance.service';

@ApiTags('maintenance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.FLEET_MANAGER, Role.ADMIN, Role.OWNER)
@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenance: MaintenanceService) {}

  @Get()
  list(@Query() query: MaintenanceQueryDto) {
    return this.maintenance.list(query);
  }

  @Post()
  create(
    @Body() dto: CreateMaintenanceDto,
    @CurrentUser() user: AuthUser,
    @CurrentRequestContext() context: RequestContext,
  ) {
    return this.maintenance.create(dto, user, context);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMaintenanceDto,
    @CurrentUser() user: AuthUser,
    @CurrentRequestContext() context: RequestContext,
  ) {
    return this.maintenance.update(id, dto, user, context);
  }
}
