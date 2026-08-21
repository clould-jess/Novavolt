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
import { DocumentsService } from './documents.service';
import {
  CreateDocumentUploadDto,
  DocumentQueryDto,
  ReviewDocumentDto,
} from './dto';

@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Get('me')
  mine(@CurrentUser() user: AuthUser) {
    return this.documents.mine(user.id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.AGENT, Role.ADMIN, Role.OWNER)
  @Get('staff')
  list(@Query() query: DocumentQueryDto) {
    return this.documents.list(query);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.CUSTOMER)
  @Post('upload')
  startUpload(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateDocumentUploadDto,
    @CurrentRequestContext() context: RequestContext,
  ) {
    return this.documents.startUpload(user, dto, context);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.CUSTOMER)
  @HttpCode(200)
  @Post(':id/complete')
  complete(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @CurrentRequestContext() context: RequestContext,
  ) {
    return this.documents.completeUpload(id, user, context);
  }

  @Get(':id/download')
  download(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.documents.download(id, user);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.AGENT, Role.ADMIN, Role.OWNER)
  @Patch(':id/review')
  review(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: ReviewDocumentDto,
    @CurrentRequestContext() context: RequestContext,
  ) {
    return this.documents.review(id, dto, user, context);
  }
}
