import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'owner@nightlife.vn' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8, example: 'Str0ngPass!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ example: 'NightLife Owner' })
  @IsOptional()
  @IsString()
  displayName?: string;
}
