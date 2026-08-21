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
import {
  ApplicationQueryDto,
  CreateApplicationDto,
  ReviewApplicationDto,
} from './dto';
import { ApplicationsService } from './applications.service';

@ApiTags('applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applications: ApplicationsService) {}

  @UseGuards(RolesGuard)
  @Roles(Role.CUSTOMER)
  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateApplicationDto,
    @CurrentRequestContext() context: RequestContext,
  ) {
    return this.applications.create(user, dto, context);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.CUSTOMER)
  @Get('me')
  mine(@CurrentUser() user: AuthUser) {
    return this.applications.mine(user.id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.AGENT, Role.ADMIN, Role.OWNER)
  @Get()
  list(@Query() query: ApplicationQueryDto) {
    return this.applications.list(query);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.AGENT, Role.ADMIN, Role.OWNER)
  @Patch(':id/review')
  review(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: ReviewApplicationDto,
    @CurrentRequestContext() context: RequestContext,
  ) {
    return this.applications.review(id, dto, user, context);
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
    return this.applications.cancel(id, user, context);
  }
}
