import { Body, Controller, Headers, HttpCode, Param, Post } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { MalwareScanResultDto } from '../documents/dto';
import { VehiclesService } from './vehicles.service';

@ApiExcludeController()
@Controller('internal/vehicle-photo-scans')
export class VehiclePhotoScanController {
  constructor(private readonly vehicles: VehiclesService) {}

  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @HttpCode(202)
  @Post(':id')
  result(
    @Param('id') id: string,
    @Body() dto: MalwareScanResultDto,
    @Headers('x-scanner-timestamp') timestamp?: string,
    @Headers('x-scanner-signature') signature?: string,
  ) {
    return this.vehicles.recordPhotoScan(id, dto.status, timestamp, signature);
  }
}
