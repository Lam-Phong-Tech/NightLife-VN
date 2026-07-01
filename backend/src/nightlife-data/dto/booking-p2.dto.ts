import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsISO8601,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class RequestBookingRescheduleDto {
  @ApiProperty({
    example: '2026-07-10T20:00:00.000Z',
    description: 'New requested booking time.',
  })
  @IsISO8601()
  scheduledAt!: string;

  @ApiPropertyOptional({
    example: 'Customer wants to move the booking to a later slot.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string;
}

export class GuestBookingRescheduleDto extends RequestBookingRescheduleDto {
  @ApiProperty({
    example: '+84901234567',
    description: 'Phone number submitted with the guest booking.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  phone!: string;
}

export class ReviewBookingChangeRequestDto {
  @ApiProperty({
    example: true,
    description: 'Approve applies the requested schedule to the booking.',
  })
  @IsBoolean()
  approve!: boolean;

  @ApiPropertyOptional({
    example: 'Confirmed with the store.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;
}

export class BookingChatMessageDto {
  @ApiProperty({
    example: 'Can you confirm the new time?',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(800)
  message!: string;

  @ApiPropertyOptional({
    example: 'RESCHEDULE',
    enum: ['GENERAL', 'RESCHEDULE', 'CANCEL'],
  })
  @IsOptional()
  @IsIn(['GENERAL', 'RESCHEDULE', 'CANCEL'])
  topic?: 'GENERAL' | 'RESCHEDULE' | 'CANCEL';

  @ApiPropertyOptional({
    example: '2a29fef8-cc9a-4c19-a135-e0377cb5ee82',
    description: 'Attach this chat message to a reschedule request.',
  })
  @IsOptional()
  @IsUUID()
  changeRequestId?: string;
}

export class GuestBookingChatMessageDto extends BookingChatMessageDto {
  @ApiProperty({
    example: '+84901234567',
    description: 'Phone number submitted with the guest booking.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  phone!: string;
}

export class UpdateStoreBookingPolicyDto {
  @ApiProperty({
    example: 60,
    enum: [30, 60, 120],
    description: 'Self-service cancellation/reschedule cutoff in minutes.',
  })
  @IsInt()
  @IsIn([30, 60, 120])
  cancelCutoffMinutes!: 30 | 60 | 120;
}
