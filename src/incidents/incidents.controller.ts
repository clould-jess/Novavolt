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
  CreateIncidentDto,
  IncidentQueryDto,
  UpdateIncidentDto,
} from './dto';
import { IncidentsService } from './incidents.service';

@ApiTags('incidents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidents: IncidentsService) {}

  @UseGuards(RolesGuard)
  @Roles(Role.CUSTOMER)
  @Get('me')
  mine(@CurrentUser() user: AuthUser) {
    return this.incidents.mine(user.id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.AGENT, Role.FLEET_MANAGER, Role.ADMIN, Role.OWNER)
  @Get('staff')
  list(@Query() query: IncidentQueryDto) {
    return this.incidents.list(query);
  }

  @Post()
  create(
    @Body() dto: CreateIncidentDto,
    @CurrentUser() user: AuthUser,
    @CurrentRequestContext() context: RequestContext,
  ) {
    return this.incidents.create(dto, user, context);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.AGENT, Role.FLEET_MANAGER, Role.ADMIN, Role.OWNER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateIncidentDto,
    @CurrentUser() user: AuthUser,
    @CurrentRequestContext() context: RequestContext,
  ) {
    return this.incidents.update(id, dto, user, context);
  }
}
