import { InvoiceStatus } from '@prisma/client';
import { Type } from 'class-transformer';
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

export class CreateInvoiceDto {
  @IsString()
  @Length(10, 40)
  rentalId!: string;

  @IsDateString({ strict: true })
  periodStart!: string;

  @IsDateString({ strict: true })
  periodEnd!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100_000_000)
  subtotalCents!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100_000_000)
  taxCents!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100_000_000)
  totalCents!: number;

  @IsDateString({ strict: true })
  dueAt!: string;
}

export class InvoiceQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;
}

export class VoidInvoiceDto {
  @IsString()
  @Length(3, 500)
  reason!: string;
}
