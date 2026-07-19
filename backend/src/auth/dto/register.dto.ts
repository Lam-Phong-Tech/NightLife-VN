import { ApiProperty } from '@nestjs/swagger';
import { Transform, type TransformFnParams } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const trimString = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() : value;

const trimDisplayName = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value;

export class RegisterDto {
  @ApiProperty({ example: 'owner@nightlife.vn' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(254)
  email: string;

  @ApiProperty({ minLength: 8, example: 'Str0ngPass!' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'password must contain at least one lowercase letter, one uppercase letter, and one number',
  })
  password: string;

  @ApiProperty({ minLength: 2, maxLength: 80, example: 'NightLife Owner' })
  @Transform(trimDisplayName)
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(80)
  @Matches(/^[\p{L}\s]+$/u, {
    message: 'displayName must contain letters and spaces only',
  })
  displayName: string;

  @ApiProperty({ minLength: 6, maxLength: 6, example: '123456' })
  @Transform(trimString)
  @IsString()
  @Matches(/^\d{6}$/, {
    message: 'emailOtp must be a 6 digit number',
  })
  emailOtp: string;
}

export class RequestRegistrationOtpDto {
  @ApiProperty({ example: 'member@nightlife.vn' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(254)
  email: string;
}

export class RegistrationOtpRequestResponseDto {
  @ApiProperty({
    example: 'Mã OTP đã được gửi tới email và có hiệu lực trong 15 phút.',
  })
  message: string;

  @ApiProperty({ example: 15 })
  expiresInMinutes: number;
}
