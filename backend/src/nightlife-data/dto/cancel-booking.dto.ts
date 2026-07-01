import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelBookingDto {
  @ApiPropertyOptional({
    example: 'Customer requested a different time slot.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string;
}

export class CancelGuestBookingDto extends CancelBookingDto {
  @ApiProperty({
    example: '+84901234567',
    description: 'Phone number submitted with the guest booking.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  phone!: string;
}
