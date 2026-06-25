import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'owner@nightlife.vn' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8, example: 'Str0ngPass!' })
  @IsString()
  @MinLength(8)
  password: string;
}
