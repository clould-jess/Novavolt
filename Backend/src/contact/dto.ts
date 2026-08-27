import { IsEmail, IsIn, IsOptional, IsString, Length, Matches } from 'class-validator';

export type ContactSubject = 'driver' | 'individual' | 'support' | 'partner' | 'other';

export class CreateContactMessageDto {
  @IsString()
  @Length(2, 120)
  name!: string;

  @IsEmail()
  @Length(3, 254)
  email!: string;

  @IsOptional()
  @IsString()
  @Length(7, 25)
  @Matches(/^[+()\d\s.-]+$/)
  phone?: string;

  @IsString()
  @IsIn(['driver', 'individual', 'support', 'partner', 'other'])
  subject!: ContactSubject;

  @IsString()
  @Length(1, 2_000)
  message!: string;
}
