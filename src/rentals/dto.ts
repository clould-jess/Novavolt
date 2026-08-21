import { DepositStatus, RentalStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { PaginationDto } from '../common/dto/pagination.dto';

export class ActivateRentalDto {
  @IsString()
  @Length(10, 40)
  bookingId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  startOdometer!: number;
}

export class UpdateRentalStatusDto {
  @IsEnum(RentalStatus)
  status!: RentalStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  endOdometer?: number;
}

export class RentalQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(RentalStatus)
  status?: RentalStatus;
}

export class CreateDepositDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10_000_000)
  amountCents!: number;

  @IsOptional()
  @IsString()
  @Length(1, 200)
  providerReference?: string;
}

export class UpdateDepositDto {
  @IsEnum(DepositStatus)
  status!: DepositStatus;
}
