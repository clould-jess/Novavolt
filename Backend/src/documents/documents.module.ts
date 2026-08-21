import { Module } from '@nestjs/common';
import { DocumentStorageService } from './document-storage.service';
import { DocumentScanController } from './document-scan.controller';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

@Module({
  controllers: [DocumentsController, DocumentScanController],
  providers: [DocumentsService, DocumentStorageService],
  exports: [DocumentStorageService],
})
export class DocumentsModule {}
