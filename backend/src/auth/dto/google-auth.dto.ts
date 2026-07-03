import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, MinLength, ValidateIf } from 'class-validator';

export class GoogleAuthDto {
  @ApiPropertyOptional({
    description: 'Google Identity Services ID token credential.',
    minLength: 10,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @ValidateIf(
    (dto: GoogleAuthDto, value?: string) =>
      value !== undefined || !dto.accessToken,
  )
  @IsString()
  @MinLength(10)
  credential?: string;

  @ApiPropertyOptional({
    description: 'Google OAuth access token from the browser popup flow.',
    minLength: 10,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @ValidateIf(
    (dto: GoogleAuthDto, value?: string) =>
      value !== undefined || !dto.credential,
  )
  @IsString()
  @MinLength(10)
  accessToken?: string;
}
