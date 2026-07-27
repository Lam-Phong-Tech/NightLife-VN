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

export class ReplacedSessionDto {
  @ApiProperty({
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0',
    nullable: true,
  })
  userAgent: string | null;

  @ApiProperty({ example: '203.113.131.xxx', nullable: true })
  ipAddress: string | null;

  @ApiProperty({ example: '2026-07-26T08:04:00.000Z', nullable: true })
  lastSeenAt: string | null;

  @ApiProperty({ example: '2026-07-25T02:00:00.000Z' })
  createdAt: string;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ type: PublicUserDto })
  user: PublicUserDto;

  @ApiProperty({
    type: ReplacedSessionDto,
    required: false,
    description:
      'Set when this privileged login revoked an active session on another device.',
  })
  replacedSession?: ReplacedSessionDto;
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

  @ApiProperty({
    example: true,
    description: 'Whether the legacy browser OAuth fallback is configured.',
  })
  webOAuthConfigured: boolean;

  @ApiProperty({
    example: '2010552841-AbCdEfGh',
    nullable: true,
    required: false,
    description: 'LINE LIFF ID used to open login through the LINE app.',
  })
  liffId: string | null;
}
