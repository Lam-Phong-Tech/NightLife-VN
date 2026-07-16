/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { PartnerStaffController } from './partner-staff.controller';
import { PartnerStaffService } from './partner-staff.service';
import { AccessService } from '../access/access.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

describe('PartnerStaffController', () => {
  let controller: PartnerStaffController;
  let partnerStaffService: jest.Mocked<PartnerStaffService>;
  let accessService: jest.Mocked<AccessService>;

  beforeEach(async () => {
    const mockPartnerStaffService = {
      getStaffByStore: jest.fn(),
      assignStaffToStore: jest.fn(),
      removeStaffFromStore: jest.fn(),
    };

    const mockAccessService = {
      ensureStoreAccess: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartnerStaffController],
      providers: [
        {
          provide: PartnerStaffService,
          useValue: mockPartnerStaffService,
        },
        {
          provide: AccessService,
          useValue: mockAccessService,
        },
      ],
    }).compile();

    controller = module.get<PartnerStaffController>(PartnerStaffController);
    partnerStaffService = module.get(PartnerStaffService);
    accessService = module.get(AccessService);
  });

  const mockUser = { id: 'partner-1', role: 'PARTNER' };
  const mockReq = { user: mockUser };

  describe('getStaff', () => {
    it('should throw BadRequestException if storeId is missing', async () => {
      await expect(controller.getStaff(mockReq, '')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should verify store access and return staff list', async () => {
      const storeId = 'store-123';
      const staffList = [
        {
          userId: 'staff-1',
          email: 'staff1@example.com',
          displayName: 'Staff 1',
          status: 'ACTIVE',
          permissions: [],
        },
      ];
      accessService.ensureStoreAccess.mockResolvedValue(undefined);
      partnerStaffService.getStaffByStore.mockResolvedValue(staffList as any);

      const result = await controller.getStaff(mockReq, storeId);

      expect(accessService.ensureStoreAccess).toHaveBeenCalledWith(
        mockUser,
        storeId,
      );
      expect(partnerStaffService.getStaffByStore).toHaveBeenCalledWith(storeId);
      expect(result).toEqual(staffList);
    });

    it('should propagate ForbiddenException if store access check fails', async () => {
      const storeId = 'store-123';
      accessService.ensureStoreAccess.mockRejectedValue(new ForbiddenException('No access'));

      await expect(controller.getStaff(mockReq, storeId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should propagate service errors when fetching staff fails', async () => {
      const storeId = 'store-123';
      accessService.ensureStoreAccess.mockResolvedValue(undefined);
      partnerStaffService.getStaffByStore.mockRejectedValue(new Error('DB error'));

      await expect(controller.getStaff(mockReq, storeId)).rejects.toThrow('DB error');
    });
  });

  describe('createStaff', () => {
    it('should verify store access and create/link staff', async () => {
      const dto: CreateStaffDto = {
        storeId: 'store-123',
        email: 'staff@example.com',
        password: 'password123',
        displayName: 'Staff Name',
      };
      const createdUser = {
        userId: 'staff-123',
        email: 'staff@example.com',
        displayName: 'Staff Name',
        status: 'ACTIVE',
      };
      accessService.ensureStoreAccess.mockResolvedValue(undefined);
      partnerStaffService.assignStaffToStore.mockResolvedValue(
        createdUser as any,
      );

      const result = await controller.createStaff(mockReq, dto);

      expect(accessService.ensureStoreAccess).toHaveBeenCalledWith(
        mockUser,
        dto.storeId,
      );
      expect(partnerStaffService.assignStaffToStore).toHaveBeenCalledWith(dto);
      expect(result).toEqual(createdUser);
    });

    it('should propagate ForbiddenException if store access check fails', async () => {
      const dto: CreateStaffDto = {
        storeId: 'store-123',
        email: 'staff@example.com',
        password: 'password123',
        displayName: 'Staff Name',
      };
      accessService.ensureStoreAccess.mockRejectedValue(new ForbiddenException('No access'));

      await expect(controller.createStaff(mockReq, dto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should propagate service errors when creating staff fails', async () => {
      const dto: CreateStaffDto = {
        storeId: 'store-123',
        email: 'staff@example.com',
        password: 'password123',
        displayName: 'Staff Name',
      };
      accessService.ensureStoreAccess.mockResolvedValue(undefined);
      partnerStaffService.assignStaffToStore.mockRejectedValue(new Error('Email already exists'));

      await expect(controller.createStaff(mockReq, dto)).rejects.toThrow('Email already exists');
    });
  });

  describe('deleteStaff', () => {
    it('should throw BadRequestException if storeId is missing', async () => {
      await expect(
        controller.deleteStaff(mockReq, 'staff-123', ''),
      ).rejects.toThrow(BadRequestException);
    });

    it('should verify store access and delete staff permissions and set user status to INACTIVE', async () => {
      const staffId = 'staff-123';
      const storeId = 'store-123';
      accessService.ensureStoreAccess.mockResolvedValue(undefined);
      partnerStaffService.removeStaffFromStore.mockResolvedValue({
        success: true,
      });

      const result = await controller.deleteStaff(mockReq, staffId, storeId);

      expect(accessService.ensureStoreAccess).toHaveBeenCalledWith(
        mockUser,
        storeId,
      );
      expect(partnerStaffService.removeStaffFromStore).toHaveBeenCalledWith(
        staffId,
        storeId,
      );
      expect(result).toEqual({ success: true });
    });

    it('should propagate ForbiddenException if store access check fails', async () => {
      const staffId = 'staff-123';
      const storeId = 'store-123';
      accessService.ensureStoreAccess.mockRejectedValue(new ForbiddenException('No access'));

      await expect(controller.deleteStaff(mockReq, staffId, storeId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should propagate service errors when deleting staff fails', async () => {
      const staffId = 'staff-123';
      const storeId = 'store-123';
      accessService.ensureStoreAccess.mockResolvedValue(undefined);
      partnerStaffService.removeStaffFromStore.mockRejectedValue(new Error('Staff not found'));

      await expect(controller.deleteStaff(mockReq, staffId, storeId)).rejects.toThrow('Staff not found');
    });
  });
});
