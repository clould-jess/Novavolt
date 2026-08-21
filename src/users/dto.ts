import { Transform } from 'class-transformer';
import {
  IsIn,
  IsOptional,
  IsPostalCode,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(2, 30)
  @Matches(/^\+?[0-9 ()-]+$/)
  phone?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(160)
  address?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(80)
  city?: string;

  @IsOptional()
  @IsIn(['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'])
  province?: string;

  @IsOptional()
  @IsPostalCode('CA')
  postalCode?: string;

  @IsOptional()
  @IsIn(['fr', 'en'])
  language?: string;
}
