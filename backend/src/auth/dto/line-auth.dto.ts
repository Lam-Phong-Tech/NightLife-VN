import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';

export class LineAuthDto {
  @ApiProperty({
    description: 'LINE LIFF ID token returned by liff.getIDToken().',
    minLength: 10,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(10)
  idToken: string;
}
