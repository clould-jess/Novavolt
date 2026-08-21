import { Module } from '@nestjs/common';
import { DocumentsModule } from '../documents/documents.module';
import { VehiclePhotoScanController } from './vehicle-photo-scan.controller';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';

@Module({
  imports: [DocumentsModule],
  controllers: [VehiclesController, VehiclePhotoScanController],
  providers: [VehiclesService],
})
export class VehiclesModule {}
