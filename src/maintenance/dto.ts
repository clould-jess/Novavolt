import { MaintenanceStatus } from '@prisma/client';
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

export class CreateMaintenanceDto {
  @IsString()
  @Length(10, 40)
  vehicleId!: string;

  @IsOptional()
  @IsString()
  @Length(10, 40)
  rentalId?: string;

  @IsString()
  @Length(2, 100)
  type!: string;

  @IsOptional()
  @IsString()
  @Length(1, 2_000)
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  odometer?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100_000_000)
  costCents?: number;

  @IsOptional()
  @IsDateString({ strict: true })
  scheduledAt?: string;
}

export class UpdateMaintenanceDto {
  @IsEnum(MaintenanceStatus)
  status!: MaintenanceStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100_000_000)
  costCents?: number;

  @IsOptional()
  @IsString()
  @Length(1, 2_000)
  description?: string;
}

export class MaintenanceQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus;
}
