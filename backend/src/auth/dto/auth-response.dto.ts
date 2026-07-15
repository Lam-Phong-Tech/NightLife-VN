import { ApiProperty } from '@nestjs/swagger';

export class PublicUserDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe', nullable: true, required: false })
  displayName: string | null;

  @ApiProperty({ example: '+84901234567', nullable: true, required: false })
  phone: string | null;

  @ApiProperty({ example: 'USER' })
  role: string;

  @ApiProperty({ example: 'MEMBER' })
  tier: string;

  @ApiProperty({ example: 'ACTIVE' })
  status: string;

  @ApiProperty()
  createdAt: Date;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ type: PublicUserDto })
  user: PublicUserDto;
}

export class LogoutResponseDto {
  @ApiProperty({ example: true })
  revoked: boolean;
}

export class GoogleConfigResponseDto {
  @ApiProperty({ example: true })
  configured: boolean;

  @ApiProperty({
    example: '1234567890-xxx.apps.googleusercontent.com',
    nullable: true,
    required: false,
  })
  clientId: string | null;
}

export class LineConfigResponseDto {
  @ApiProperty({ example: true })
  configured: boolean;
}
