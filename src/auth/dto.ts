import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s]).+$/;

export class RegisterDto {
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @Length(12, 128)
  @Matches(strongPassword, {
    message:
      'password must contain uppercase, lowercase, number, and special characters',
  })
  password!: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(1, 80)
  firstName!: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(1, 80)
  lastName!: string;
}

export class LoginDto {
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @Length(1, 128)
  password!: string;
}

export class RefreshDto {
  @IsString()
  @Length(20, 4096)
  refreshToken!: string;
}

export class EmailDto {
  @IsEmail()
  @MaxLength(254)
  email!: string;
}

export class OpaqueTokenDto {
  @IsString()
  @Length(32, 256)
  token!: string;
}

export class ResetPasswordDto extends OpaqueTokenDto {
  @IsString()
  @Length(12, 128)
  @Matches(strongPassword, {
    message:
      'password must contain uppercase, lowercase, number, and special characters',
  })
  newPassword!: string;
}

export class ChangePasswordDto {
  @IsString()
  @Length(1, 128)
  currentPassword!: string;

  @IsString()
  @Length(12, 128)
  @Matches(strongPassword, {
    message:
      'newPassword must contain uppercase, lowercase, number, and special characters',
  })
  newPassword!: string;
}
