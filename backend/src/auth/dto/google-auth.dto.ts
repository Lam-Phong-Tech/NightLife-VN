import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class GoogleAuthDto {
  @ApiProperty({
    description: 'Google Identity Services ID token credential.',
    minLength: 10,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  credential?: string;

  @ApiProperty({
    description: 'Google OAuth access token from the browser popup flow.',
    minLength: 10,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  accessToken?: string;
}
