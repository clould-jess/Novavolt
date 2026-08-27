import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { VehicleStatus } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';

export class CreateVehicleDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @Length(17, 17)
  @Matches(/^[A-HJ-NPR-Z0-9]{17}$/)
  vin!: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(1, 60)
  make!: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(1, 60)
  model!: string;

  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year!: number;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  color?: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(1, 60)
  city!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(9)
  seats!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2000)
  rangeKm!: number;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(1000)
  description?: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @Length(2, 16)
  @Matches(/^[A-Z0-9 -]+$/)
  plate!: string;

  @IsIn(['ELECTRIC', 'HYBRID', 'PLUG_IN_HYBRID'])
  powertrain!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  odometer = 0;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10_000_000)
  weeklyRateCents!: number;
}

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  @Length(1, 60)
  make?: string;

  @IsOptional()
  @IsString()
  @Length(1, 60)
  model?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  color?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(1, 60)
  city?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(9)
  seats?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2000)
  rangeKm?: number;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsIn(['ELECTRIC', 'HYBRID', 'PLUG_IN_HYBRID'])
  powertrain?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  odometer?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10_000_000)
  weeklyRateCents?: number;
}

export class VehicleStatusDto {
  @IsEnum(VehicleStatus)
  status!: VehicleStatus;
}

export class CreateVehiclePhotoUploadDto {
  @IsString()
  @IsIn(['image/jpeg', 'image/png', 'image/webp'])
  mimeType!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10_000_000)
  sizeBytes!: number;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  altText?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  sortOrder = 0;
}

export class CompleteVehiclePhotoUploadDto {
  @IsString()
  @MaxLength(120)
  imagekitFileId!: string;

  @IsString()
  @MaxLength(1024)
  imagekitFilePath!: string;

  @IsString()
  @MaxLength(2048)
  imagekitUrl!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  imagekitThumbnailUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100_000_000)
  sizeBytes?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20_000)
  width?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20_000)
  height?: number;
}

export class VehicleQueryDto extends PaginationDto {
  @IsOptional()
  @IsIn(['ELECTRIC', 'HYBRID', 'PLUG_IN_HYBRID'])
  powertrain?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxWeeklyRateCents?: number;
}

export class StaffVehicleQueryDto extends VehicleQueryDto {
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;
}
