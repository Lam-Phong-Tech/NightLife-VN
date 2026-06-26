import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ClaimGuestCouponDto {
  @ApiPropertyOptional({ example: 'Guest Name' })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiProperty({
    example: '+84901234567',
    description: 'Guest phone used to identify the coupon claim.',
  })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiPropertyOptional({ example: 'guest@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;
}
