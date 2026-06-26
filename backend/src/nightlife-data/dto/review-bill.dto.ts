import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class ReviewBillDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  approve: boolean;

  @ApiPropertyOptional({
    example: 'Invoice total does not match upload.',
    description: 'Required when approve is false.',
  })
  @ValidateIf((dto: ReviewBillDto) => dto.approve === false)
  @IsNotEmpty()
  @IsString()
  rejectReason?: string;
}
