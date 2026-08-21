import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { RentalsController } from './rentals.controller';
import { RentalsService } from './rentals.service';

@Module({
  imports: [NotificationsModule],
  controllers: [RentalsController],
  providers: [RentalsService],
})
export class RentalsModule {}
