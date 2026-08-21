import { Transform } from 'class-transformer';
import { WorkflowStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { PaginationDto } from '../common/dto/pagination.dto';

export class CreateBookingDto {
  @IsString()
  @Length(10, 40)
  vehicleId!: string;

  @IsDateString({ strict: true })
  startAt!: string;

  @IsDateString({ strict: true })
  endAt!: string;
}

export enum BookingDecision {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class ReviewBookingDto {
  @IsEnum(BookingDecision)
  status!: BookingDecision;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(1, 1_000)
  reviewNote?: string;
}

export class BookingQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(WorkflowStatus)
  status?: WorkflowStatus;
}
