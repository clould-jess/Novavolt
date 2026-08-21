import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { DocumentsService } from './documents.service';
import { MalwareScanResultDto } from './dto';

@ApiExcludeController()
@Controller('internal/document-scans')
export class DocumentScanController {
  constructor(private readonly documents: DocumentsService) {}

  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @HttpCode(202)
  @Post(':id')
  result(
    @Param('id') id: string,
    @Body() dto: MalwareScanResultDto,
    @Headers('x-scanner-timestamp') timestamp?: string,
    @Headers('x-scanner-signature') signature?: string,
  ) {
    return this.documents.recordMalwareScan(
      id,
      dto.status,
      timestamp,
      signature,
    );
  }
}
