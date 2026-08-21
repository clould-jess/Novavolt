import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class CreateContractUploadDto {
  @IsString()
  @Length(10, 40)
  rentalId!: string;

  @IsString()
  @Length(1, 180)
  originalName!: string;

  @IsInt()
  @Min(1)
  @Max(20_000_000)
  sizeBytes!: number;
}

export class MarkContractSignedDto {
  @IsOptional()
  @IsString()
  @Length(1, 200)
  providerId?: string;
}
