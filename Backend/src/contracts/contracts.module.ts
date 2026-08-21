import { Module } from '@nestjs/common';
import { DocumentsModule } from '../documents/documents.module';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';

@Module({
  imports: [DocumentsModule],
  controllers: [ContractsController],
  providers: [ContractsService],
})
export class ContractsModule {}
