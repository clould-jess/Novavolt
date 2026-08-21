import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
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
import { ContractsService } from './contracts.service';
import { CreateContractUploadDto, MarkContractSignedDto } from './dto';

@ApiTags('contracts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contracts: ContractsService) {}

  @UseGuards(RolesGuard)
  @Roles(Role.CUSTOMER)
  @Get('me')
  mine(@CurrentUser() user: AuthUser) {
    return this.contracts.mine(user.id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.AGENT, Role.ADMIN, Role.OWNER)
  @Post('upload')
  startUpload(
    @Body() dto: CreateContractUploadDto,
    @CurrentUser() user: AuthUser,
    @CurrentRequestContext() context: RequestContext,
  ) {
    return this.contracts.startUpload(dto, user, context);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.AGENT, Role.ADMIN, Role.OWNER)
  @HttpCode(200)
  @Post(':id/complete')
  complete(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @CurrentRequestContext() context: RequestContext,
  ) {
    return this.contracts.completeUpload(id, user, context);
  }

  @Get(':id/download')
  download(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.contracts.download(id, user);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.AGENT, Role.ADMIN, Role.OWNER)
  @HttpCode(200)
  @Post(':id/signed')
  markSigned(
    @Param('id') id: string,
    @Body() dto: MarkContractSignedDto,
    @CurrentUser() user: AuthUser,
    @CurrentRequestContext() context: RequestContext,
  ) {
    return this.contracts.markSigned(id, dto.providerId, user, context);
  }
}
