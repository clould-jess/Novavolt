import { IncidentStatus } from '@prisma/client';
import {
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { PaginationDto } from '../common/dto/pagination.dto';

export class CreateIncidentDto {
  @IsString()
  @Length(10, 40)
  rentalId!: string;

  @IsIn(['COLLISION', 'DAMAGE', 'BREAKDOWN', 'THEFT', 'TICKET', 'OTHER'])
  category!: string;

  @IsString()
  @Length(10, 5_000)
  description!: string;
}

export class UpdateIncidentDto {
  @IsEnum(IncidentStatus)
  status!: IncidentStatus;
}

export class IncidentQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(IncidentStatus)
  status?: IncidentStatus;
}
