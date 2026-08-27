import { AdminNotificationsModule } from '../admin-notifications/admin-notifications.module';
import { Module } from '@nestjs/common';
import { PartnershipLeadsController } from './partnership-leads.controller';
import { PartnershipLeadsService } from './partnership-leads.service';

@Module({ imports: [AdminNotificationsModule],
  controllers: [PartnershipLeadsController],
  providers: [PartnershipLeadsService],
  exports: [PartnershipLeadsService],
})
export class PartnershipLeadsModule {}
