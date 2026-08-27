import { AdminNotificationsModule } from '../admin-notifications/admin-notifications.module';
import { Module } from '@nestjs/common';
import { ReservationRequestsController } from './reservation-requests.controller';
import { ReservationRequestsService } from './reservation-requests.service';

@Module({ imports: [AdminNotificationsModule],
  controllers: [ReservationRequestsController],
  providers: [ReservationRequestsService],
})
export class ReservationRequestsModule {}
