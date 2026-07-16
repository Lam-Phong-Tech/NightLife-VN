import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const mockUsersService = {
      findByIdOrThrow: jest.fn(),
      toPublicUser: jest.fn(),
      changePassword: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  describe('me', () => {
    it('should return public user details', async () => {
      const mockReq = { user: { id: 'user-123' } };
      const mockUser = { id: 'user-123', email: 'user@example.com' };
      const mockPublicUser = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'User',
      };

      service.findByIdOrThrow.mockResolvedValue(mockUser as any);
      service.toPublicUser.mockReturnValue(mockPublicUser as any);

      const result = await controller.me(mockReq as any);

      expect(service.findByIdOrThrow).toHaveBeenCalledWith('user-123');
      expect(service.toPublicUser).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockPublicUser);
    });

    it('should propagate NotFoundException if user is not found', async () => {
      const mockReq = { user: { id: 'user-123' } };
      service.findByIdOrThrow.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(controller.me(mockReq as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('changePassword', () => {
    it('should call usersService.changePassword and return success: true', async () => {
      const mockReq = { user: { id: 'user-123' } };
      const dto: ChangePasswordDto = {
        oldPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
      };

      service.changePassword.mockResolvedValue({} as any);

      const result = await controller.changePassword(mockReq as any, dto);

      expect(service.changePassword).toHaveBeenCalledWith('user-123', dto);
      expect(result).toEqual({ success: true });
    });

    it('should throw error if usersService.changePassword throws it', async () => {
      const mockReq = { user: { id: 'user-123' } };
      const dto: ChangePasswordDto = {
        oldPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
      };

      service.changePassword.mockRejectedValue(
        new Error('Mật khẩu cũ không chính xác'),
      );

      await expect(
        controller.changePassword(mockReq as any, dto),
      ).rejects.toThrow('Mật khẩu cũ không chính xác');
    });
  });

  describe('partnerAdminCheck', () => {
    it('should return ok: true', () => {
      const result = controller.partnerAdminCheck();
      expect(result).toEqual({ ok: true });
    });
  });
});
