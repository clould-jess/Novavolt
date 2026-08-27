import { Transform } from 'class-transformer';
import { IsDateString, IsEmail, IsIn, IsOptional, IsString, Length, Matches } from 'class-validator';
import { PaginationDto } from '../common/dto/pagination.dto';

export type ReservationRequestStatus = 'NEW' | 'CONTACTED' | 'ARCHIVED';

export class CreateReservationRequestDto {
  @IsString()
  @Length(2, 120)
  name!: string;

  @IsEmail()
  @Length(3, 254)
  email!: string;

  @IsString()
  @Length(7, 25)
  @Matches(/^[+()\d\s.-]+$/)
  phone!: string;

  @IsString()
  @Length(10, 40)
  vehicleId!: string;

  @IsDateString({ strict: true })
  startAt!: string;

  @IsDateString({ strict: true })
  endAt!: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(1, 2_000)
  message?: string;
}

export class ReservationRequestQueryDto extends PaginationDto {
  @IsOptional()
  @IsIn(['NEW', 'CONTACTED', 'ARCHIVED'])
  status?: ReservationRequestStatus;
}

export class UpdateReservationRequestStatusDto {
  @IsIn(['NEW', 'CONTACTED', 'ARCHIVED'])
  status!: ReservationRequestStatus;
}
