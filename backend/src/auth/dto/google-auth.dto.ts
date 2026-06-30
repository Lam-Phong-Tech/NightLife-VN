import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class GoogleAuthDto {
  @ApiProperty({
    description: 'Google Identity Services ID token credential.',
    minLength: 10,
  })
  @IsString()
  @MinLength(10)
  credential: string;
}
