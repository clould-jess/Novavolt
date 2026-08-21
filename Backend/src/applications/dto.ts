import { WorkflowStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { PaginationDto } from '../common/dto/pagination.dto';

export class CreateApplicationDto {
  @IsOptional()
  @IsString()
  @Length(10, 40)
  requestedVehicleId?: string;

  @IsOptional()
  @IsString()
  @Length(1, 2_000)
  customerNote?: string;
}

export enum ApplicationDecision {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class ReviewApplicationDto {
  @IsEnum(ApplicationDecision)
  status!: ApplicationDecision;

  @IsOptional()
  @IsString()
  @Length(1, 2_000)
  reviewNote?: string;
}

export class ApplicationQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(WorkflowStatus)
  status?: WorkflowStatus;
}
