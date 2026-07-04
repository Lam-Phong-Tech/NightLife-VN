import { ApiProperty } from '@nestjs/swagger';
import { Transform, type TransformFnParams } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const trimString = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() : value;

const trimLowerEmail = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class UpdateProfileDto {
  @ApiProperty({ minLength: 2, maxLength: 80, example: 'Nguyen Van A' })
  @Transform(trimString)
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  displayName: string;

  @ApiProperty({ example: 'member@nightlife.vn' })
  @Transform(trimLowerEmail)
  @IsEmail()
  @MaxLength(254)
  email: string;

  @ApiProperty({ example: '+84901234567', required: false, nullable: true })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[0-9+\-\s().]{8,20}$/, {
    message: 'phone must be a valid phone number',
  })
  phone?: string | null;
}
