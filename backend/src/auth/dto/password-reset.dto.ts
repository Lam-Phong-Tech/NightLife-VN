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

const trimLowerEmail = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

const passwordRuleMessage =
  'password must contain at least one lowercase letter, one uppercase letter, and one number';

export class RequestPasswordResetDto {
  @ApiProperty({ example: 'member@nightlife.vn' })
  @Transform(trimLowerEmail)
  @IsEmail()
  @MaxLength(254)
  email: string;
}

export class VerifyPasswordResetCodeDto {
  @ApiProperty({ example: 'member@nightlife.vn' })
  @Transform(trimLowerEmail)
  @IsEmail()
  @MaxLength(254)
  email: string;

  @ApiProperty({ minLength: 6, maxLength: 6, example: '123456' })
  @Transform(trimString)
  @IsString()
  @Matches(/^\d{6}$/, {
    message: 'code must be a 6 digit number',
  })
  code: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'member@nightlife.vn' })
  @Transform(trimLowerEmail)
  @IsEmail()
  @MaxLength(254)
  email: string;

  @ApiProperty({ example: 'e02f8d42c6b24c5a9a2e3c8f0f2d7a1b' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MinLength(24)
  @MaxLength(160)
  resetToken: string;

  @ApiProperty({ minLength: 8, example: 'NewStr0ngPass!' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: passwordRuleMessage,
  })
  password: string;

  @ApiProperty({ minLength: 8, example: 'NewStr0ngPass!' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(72)
  confirmPassword: string;
}

export class PasswordResetRequestResponseDto {
  @ApiProperty({
    example: 'Mã xác nhận đã được gửi tới email và có hiệu lực trong 15 phút.',
  })
  message: string;

  @ApiProperty({ example: 15 })
  expiresInMinutes: number;
}

export class PasswordResetVerifyResponseDto {
  @ApiProperty({ example: 'e02f8d42c6b24c5a9a2e3c8f0f2d7a1b' })
  resetToken: string;

  @ApiProperty({ example: '2026-07-04T12:30:00.000Z' })
  expiresAt: string;
}

export class PasswordResetCompleteResponseDto {
  @ApiProperty({ example: true })
  updated: boolean;
}
