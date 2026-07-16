import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from '../common/password.service';
import { CreateStaffDto } from './dto/create-staff.dto';

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

  async assignStaffToStore(dto: CreateStaffDto) {
    const email = dto.email.trim().toLowerCase();

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
          permissions:
            dto.permissions && dto.permissions.length > 0
              ? dto.permissions
              : ['coupon.scan', 'checkin.confirm'],
          status: 'ACTIVE',
          deletedAt: null,
        },
        update: {
          status: 'ACTIVE',
          deletedAt: null,
          permissions:
            dto.permissions && dto.permissions.length > 0
              ? dto.permissions
              : undefined,
        },
      });

      return {
        userId: user.id,
        email: user.email,
        displayName: user.displayName,
        phone: user.phone,
        status: user.status,
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
            permissions:
              dto.permissions && dto.permissions.length > 0
                ? dto.permissions
                : ['coupon.scan', 'checkin.confirm'],
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
      };
    }
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
