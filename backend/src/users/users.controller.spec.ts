import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ChangePasswordDto } from './dto/change-password.dto';

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
});
