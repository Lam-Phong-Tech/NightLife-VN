import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePartnerRequestDto {
  @ApiProperty({ example: 'Neon Club' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(160)
  businessName: string;

  @ApiPropertyOptional({ example: 'Club / Lounge' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  businessType?: string;

  @ApiPropertyOptional({ example: 'Ha Noi - Tay Ho' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  area?: string;

  @ApiProperty({ example: 'Nguyen Van A' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  contactName: string;

  @ApiProperty({ example: '+84901234567' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(32)
  contactPhone: string;

  @ApiPropertyOptional({ example: 'owner@example.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(160)
  contactEmail?: string;

  @ApiPropertyOptional({
    example: 'We want to join the booking and coupon program.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
