import {
  BadRequestException,
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from '../common/password.service';
import { CreateStaffDto } from './dto/create-staff.dto';

const DEFAULT_STAFF_PERMISSIONS = ['coupon.scan', 'checkin.confirm'];
const ALLOWED_STAFF_PERMISSIONS = new Set(DEFAULT_STAFF_PERMISSIONS);

@Injectable()
export class PartnerStaffService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  async getStaffByStore(storeId: string) {
    const permissions = await this.prisma.storePermission.findMany({
      where: {
        storeId,
        status: 'ACTIVE',
        deletedAt: null,
        user: {
          role: 'STAFF',
        },
      },
      include: {
        user: true,
      },
    });

    return permissions.map((p) => ({
      id: p.userId,
      userId: p.userId,
      email: p.user.email,
      displayName: p.user.displayName,
      phone: p.user.phone,
      status: p.user.status,
      permissions: p.permissions,
      createdAt: p.createdAt,
    }));
  }

  private normalizeStaffPermissions(
    permissions: string[] | undefined,
    fallbackToDefault: boolean,
  ) {
    if (!Array.isArray(permissions)) {
      if (fallbackToDefault) return [...DEFAULT_STAFF_PERMISSIONS];
      throw new BadRequestException('permissions must be an array');
    }

    const normalized = Array.from(
      new Set(permissions.map((permission) => permission.trim()).filter(Boolean)),
    );
    const invalid = normalized.filter(
      (permission) => !ALLOWED_STAFF_PERMISSIONS.has(permission),
    );

    if (invalid.length) {
      throw new BadRequestException(
        `Quyền nhân viên không hợp lệ: ${invalid.join(', ')}`,
      );
    }

    return normalized;
  }

  async assignStaffToStore(dto: CreateStaffDto) {
    const email = dto.email.trim().toLowerCase();
    const permissions = this.normalizeStaffPermissions(dto.permissions, true);

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      if (user.role !== 'STAFF') {
        throw new ConflictException(
          'Người dùng đã tồn tại nhưng không phải vai trò STAFF',
        );
      }

      const activePermission = await this.prisma.storePermission.findFirst({
        where: {
          userId: user.id,
          storeId: dto.storeId,
          status: 'ACTIVE',
          deletedAt: null,
        },
      });

      if (activePermission) {
        throw new ConflictException(
          'Nhân viên đã được gán vào cửa hàng này và đang hoạt động',
        );
      }

      await this.prisma.storePermission.upsert({
        where: {
          userId_storeId: {
            userId: user.id,
            storeId: dto.storeId,
          },
        },
        create: {
          userId: user.id,
          storeId: dto.storeId,
          permissions,
          status: 'ACTIVE',
          deletedAt: null,
        },
        update: {
          status: 'ACTIVE',
          deletedAt: null,
          permissions,
        },
      });

      return {
        userId: user.id,
        email: user.email,
        displayName: user.displayName,
        phone: user.phone,
        status: user.status,
        permissions,
      };
    } else {
      const passwordHash = await this.passwordService.hash(dto.password);

      const newUser = await this.prisma.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
          data: {
            email,
            passwordHash,
            displayName: dto.displayName.trim(),
            role: 'STAFF',
            status: 'ACTIVE',
            phone: dto.phone ? dto.phone.trim() : null,
          },
        });

        await tx.storePermission.create({
          data: {
            userId: createdUser.id,
            storeId: dto.storeId,
            permissions,
            status: 'ACTIVE',
          },
        });

        return createdUser;
      });

      return {
        userId: newUser.id,
        email: newUser.email,
        displayName: newUser.displayName,
        phone: newUser.phone,
        status: newUser.status,
        permissions,
      };
    }
  }

  async updateStaffPermissions(
    userId: string,
    storeId: string,
    permissions: string[] | undefined,
  ) {
    const normalizedPermissions = this.normalizeStaffPermissions(
      permissions,
      false,
    );
    const permission = await this.prisma.storePermission.findFirst({
      where: {
        userId,
        storeId,
        deletedAt: null,
        status: 'ACTIVE',
        user: { role: 'STAFF' },
      },
    });

    if (!permission) {
      throw new NotFoundException(
        'Quyền truy cập cửa hàng không tồn tại cho nhân viên này',
      );
    }

    const updated = await this.prisma.storePermission.update({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
      data: {
        permissions: normalizedPermissions,
      },
      include: {
        user: true,
      },
    });

    return {
      id: updated.userId,
      userId: updated.userId,
      email: updated.user.email,
      displayName: updated.user.displayName,
      phone: updated.user.phone,
      status: updated.user.status,
      permissions: updated.permissions,
      createdAt: updated.createdAt,
    };
  }

  async removeStaffFromStore(userId: string, storeId: string) {
    const permission = await this.prisma.storePermission.findFirst({
      where: {
        userId,
        storeId,
      },
    });

    if (!permission) {
      throw new NotFoundException(
        'Quyền truy cập cửa hàng không tồn tại cho nhân viên này',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.storePermission.update({
        where: {
          userId_storeId: {
            userId,
            storeId,
          },
        },
        data: {
          status: 'INACTIVE',
          deletedAt: new Date(),
        },
      });

      await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          status: 'INACTIVE',
        },
      });
    });

    return { success: true };
  }
}
