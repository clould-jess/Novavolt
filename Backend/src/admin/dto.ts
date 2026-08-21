import { Role, UserStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { PaginationDto } from '../common/dto/pagination.dto';

export class UserQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  search?: string;
}

export class UpdateUserStatusDto {
  @IsEnum(UserStatus)
  status!: UserStatus;
}

export class UpdateUserRoleDto {
  @IsEnum(Role)
  role!: Role;
}
