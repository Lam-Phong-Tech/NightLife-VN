import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  const user = {
    id: 'user-1',
    email: 'partner@nightlife.vn',
    displayName: 'Partner',
    phone: null,
    role: 'PARTNER',
    tier: 'PREMIUM',
    status: 'ACTIVE',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  const usersService = {
    createUser: jest.fn(),
    validateCredentials: jest.fn(),
    findByIdOrThrow: jest.fn(),
    toPublicUser: jest.fn((value) => ({
      id: value.id,
      email: value.email,
      role: value.role,
      tier: value.tier,
      status: value.status,
    })),
  } as unknown as jest.Mocked<UsersService>;

  const jwtService = {
    sign: jest.fn(() => 'jwt-token'),
  } as unknown as jest.Mocked<JwtService>;

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(jwtService, usersService);
  });

  it('registers a user and returns a JWT auth response', async () => {
    usersService.createUser.mockResolvedValue(user as never);

    await expect(
      service.register({
        email: user.email,
        password: 'Str0ngPass!',
        displayName: user.displayName,
      }),
    ).resolves.toEqual({
      accessToken: 'jwt-token',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tier: user.tier,
        status: user.status,
      },
    });
    expect(usersService.createUser).toHaveBeenCalledWith({
      email: user.email,
      password: 'Str0ngPass!',
      displayName: user.displayName,
    });
  });

  it('logs in with validated credentials', async () => {
    usersService.validateCredentials.mockResolvedValue(user as never);

    await service.login({
      email: user.email,
      password: 'Str0ngPass!',
    });

    expect(usersService.validateCredentials).toHaveBeenCalledWith(
      user.email,
      'Str0ngPass!',
    );
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: user.id,
      email: user.email,
      role: user.role,
      tier: user.tier,
    });
  });
});
