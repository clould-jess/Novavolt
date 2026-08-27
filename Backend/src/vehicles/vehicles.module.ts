import { Module } from '@nestjs/common';
import { VehiclePhotoScanController } from './vehicle-photo-scan.controller';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { VehicleImageKitService } from './vehicle-imagekit.service';

@Module({
  imports: [],
  controllers: [VehiclesController, VehiclePhotoScanController],
  providers: [VehiclesService, VehicleImageKitService],
})
export class VehiclesModule {}
