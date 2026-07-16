/* eslint-disable */
import { NotFoundException } from '@nestjs/common';
import { PartnerStaffService } from './partner-staff.service';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from '../common/password.service';

describe('PartnerStaffService', () => {
  const prisma = {
    $transaction: jest.fn(),
    storePermission: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
  } as unknown as jest.Mocked<PrismaService>;

  const passwordService = {
    hash: jest.fn(),
    verify: jest.fn(),
  } as unknown as jest.Mocked<PasswordService>;

  let service: PartnerStaffService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation((callback) => callback(prisma));
    service = new PartnerStaffService(prisma, passwordService);
  });

  describe('removeStaffFromStore', () => {
    it('should throw NotFoundException if storePermission does not exist', async () => {
      prisma.storePermission.findFirst.mockResolvedValue(null);

      await expect(
        service.removeStaffFromStore('user-1', 'store-1'),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.storePermission.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-1', storeId: 'store-1' },
      });
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('should deactivate store permission and user status in a transaction', async () => {
      const mockPermission = {
        userId: 'user-1',
        storeId: 'store-1',
        status: 'ACTIVE',
      };
      prisma.storePermission.findFirst.mockResolvedValue(mockPermission as any);

      const result = await service.removeStaffFromStore('user-1', 'store-1');

      expect(result).toEqual({ success: true });
      expect(prisma.storePermission.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-1', storeId: 'store-1' },
      });
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.storePermission.update).toHaveBeenCalledWith({
        where: {
          userId_storeId: {
            userId: 'user-1',
            storeId: 'store-1',
          },
        },
        data: {
          status: 'INACTIVE',
          deletedAt: expect.any(Date),
        },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { status: 'INACTIVE' },
      });
    });
  });
});
