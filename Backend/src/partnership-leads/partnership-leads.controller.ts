import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreatePartnershipLeadDto } from './dto';
import { PartnershipLeadsService } from './partnership-leads.service';
import { PartnershipLeadQueryDto, UpdatePartnershipLeadStatusDto } from './dto';

@ApiTags('partnership-leads')
@Controller('partnership-leads')
export class PartnershipLeadsController {
  constructor(private readonly leads: PartnershipLeadsService) {}

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreatePartnershipLeadDto) {
    return this.leads.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  @Get()
  list(@Query() query: PartnershipLeadQueryDto) {
    return this.leads.list(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: UpdatePartnershipLeadStatusDto,
  ) {
    return this.leads.updateStatus(id, body.status);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.leads.delete(id);
  }
}
