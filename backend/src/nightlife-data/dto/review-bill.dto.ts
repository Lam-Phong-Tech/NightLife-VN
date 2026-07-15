import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

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

  @ApiPropertyOptional({
    example: false,
    description:
      'Set true only after PM/BA confirms a negative commission preview.',
  })
  @IsOptional()
  @IsBoolean()
  confirmNegativeCommission?: boolean;

  @ApiPropertyOptional({
    example: 'PM confirmed campaign loss leader for July launch.',
    description:
      'Required when confirmNegativeCommission is true. Stored in audit metadata.',
  })
  @ValidateIf((dto: ReviewBillDto) => dto.confirmNegativeCommission === true)
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  pmBaReason?: string;
}

export class ConfirmNegativeCommissionDto {
  @ApiProperty({
    example: 'PM/BA confirmed campaign loss leader for July launch.',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  reason: string;
}

export class VoidBillDto {
  @ApiProperty({
    example: 'Customer refund confirmed by store.',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  reason: string;

  @ApiPropertyOptional({
    example: 'REFUND-20260704-001',
    description:
      'Optional refund or reversal reference from payment/admin ops.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  refundReference?: string;
}
