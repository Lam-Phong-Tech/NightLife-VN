import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ReviewBillDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  approve: boolean;

  @ApiPropertyOptional({ example: 'Invoice total does not match upload.' })
  @IsOptional()
  @IsString()
  rejectReason?: string;
}
