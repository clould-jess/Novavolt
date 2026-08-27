import { Module } from '@nestjs/common';
import { AdminNotificationsModule } from '../admin-notifications/admin-notifications.module';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';

@Module({ imports: [AdminNotificationsModule],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}
