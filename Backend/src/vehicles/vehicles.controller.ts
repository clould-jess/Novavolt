import {
  Body,
  Controller,
  Delete,
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
  CreateVehiclePhotoUploadDto,
  CompleteVehiclePhotoUploadDto,
  CreateVehicleDto,
  StaffVehicleQueryDto,
  UpdateVehicleDto,
  VehicleQueryDto,
  VehicleStatusDto,
} from './dto';
import { VehiclesService } from './vehicles.service';

@ApiTags('vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehicles: VehiclesService) {}

  @Get()
  list(@Query() query: VehicleQueryDto) {
    return this.vehicles.publicList(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FLEET_MANAGER, Role.ADMIN, Role.OWNER)
  @Get('staff')
  staffList(@Query() query: StaffVehicleQueryDto) {
    return this.vehicles.staffList(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FLEET_MANAGER, Role.ADMIN, Role.OWNER)
  @Post()
  create(
    @Body() dto: CreateVehicleDto,
    @CurrentUser() user: AuthUser,
    @CurrentRequestContext() context: RequestContext,
  ) {
    return this.vehicles.create(dto, user, context);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FLEET_MANAGER, Role.ADMIN, Role.OWNER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
    @CurrentUser() user: AuthUser,
    @CurrentRequestContext() context: RequestContext,
  ) {
    return this.vehicles.update(id, dto, user, context);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FLEET_MANAGER, Role.ADMIN, Role.OWNER)
  @Patch(':id/status')
  status(
    @Param('id') id: string,
    @Body() dto: VehicleStatusDto,
    @CurrentUser() user: AuthUser,
    @CurrentRequestContext() context: RequestContext,
  ) {
    return this.vehicles.setStatus(id, dto.status, user, context);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FLEET_MANAGER, Role.ADMIN, Role.OWNER)
  @Post(':vehicleId/photos/upload')
  uploadPhoto(
    @Param('vehicleId') vehicleId: string,
    @Body() dto: CreateVehiclePhotoUploadDto,
    @CurrentUser() user: AuthUser,
    @CurrentRequestContext() context: RequestContext,
  ) {
    return this.vehicles.startPhotoUpload(vehicleId, dto, user, context);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FLEET_MANAGER, Role.ADMIN, Role.OWNER)
  @Post(':vehicleId/photos/:photoId/complete')
  completePhoto(
    @Param('vehicleId') vehicleId: string,
    @Param('photoId') photoId: string,
    @Body() dto: CompleteVehiclePhotoUploadDto,
    @CurrentUser() user: AuthUser,
    @CurrentRequestContext() context: RequestContext,
  ) {
    return this.vehicles.completePhotoUpload(vehicleId, photoId, dto, user, context);
  }

  @Get(':vehicleId/photos/:photoId')
  photo(
    @Param('vehicleId') vehicleId: string,
    @Param('photoId') photoId: string,
  ) {
    return this.vehicles.photoDownload(vehicleId, photoId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FLEET_MANAGER, Role.ADMIN, Role.OWNER)
  @Delete(':vehicleId/photos/:photoId')
  deletePhoto(
    @Param('vehicleId') vehicleId: string,
    @Param('photoId') photoId: string,
    @CurrentUser() user: AuthUser,
    @CurrentRequestContext() context: RequestContext,
  ) {
    return this.vehicles.deletePhoto(vehicleId, photoId, user, context);
  }

  @Get(':id')
  one(@Param('id') id: string) {
    return this.vehicles.publicOne(id);
  }
}
