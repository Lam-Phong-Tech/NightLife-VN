import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelBookingDto {
  @ApiPropertyOptional({
    example: 'Customer requested a different time slot.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string;
}
