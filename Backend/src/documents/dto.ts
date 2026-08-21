import { DocumentStatus, DocumentType } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { PaginationDto } from '../common/dto/pagination.dto';

export class CreateDocumentUploadDto {
  @IsEnum(DocumentType)
  type!: DocumentType;

  @IsString()
  @Length(1, 180)
  originalName!: string;

  @IsString()
  @Length(3, 100)
  mimeType!: string;

  @IsInt()
  @Min(1)
  @Max(20_000_000)
  sizeBytes!: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export enum DocumentDecision {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class ReviewDocumentDto {
  @IsEnum(DocumentDecision)
  status!: DocumentDecision;

  @IsOptional()
  @IsString()
  @Length(1, 1_000)
  rejectionReason?: string;
}

export class DocumentQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType;
}

export enum MalwareScanResult {
  CLEAN = 'CLEAN',
  INFECTED = 'INFECTED',
  ERROR = 'ERROR',
}

export class MalwareScanResultDto {
  @IsEnum(MalwareScanResult)
  status!: MalwareScanResult;
}
