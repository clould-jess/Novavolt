import { IsEmail, IsIn, IsOptional, IsString, Length, Matches } from 'class-validator';
import { PaginationDto } from '../common/dto/pagination.dto';

export type FleetPartnerLeadStatus = 'NEW' | 'CONTACTED' | 'ARCHIVED';

export class CreatePartnershipLeadDto {
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
  @Length(2, 150)
  company!: string;

  @IsString()
  @IsIn(['1-5', '6-20', '20+'])
  vehicleCount!: string;

  @IsOptional()
  @IsString()
  @Length(1, 2_000)
  message?: string;
}

export class PartnershipLeadQueryDto extends PaginationDto {
  @IsOptional()
  @IsIn(['NEW', 'CONTACTED', 'ARCHIVED'])
  status?: FleetPartnerLeadStatus;
}

export class UpdatePartnershipLeadStatusDto {
  @IsIn(['NEW', 'CONTACTED', 'ARCHIVED'])
  status!: FleetPartnerLeadStatus;
}
