import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type AuthenticatedUser = {
  id: string;
  role?: string;
};

@Injectable()
export class AccessService {
  constructor(private readonly prisma: PrismaService) {}

  isAdmin(user: AuthenticatedUser) {
    return user.role === 'ADMIN';
  }

  isStaff(user: AuthenticatedUser) {
    return user.role === 'STAFF';
  }

  async getPartnerStoreIds(userId: string) {
    const stores = await this.prisma.store.findMany({
      where: {
        deletedAt: null,
        OR: [
          { ownerId: userId },
          {
            partnerAccount: {
              userId,
              deletedAt: null,
              status: { in: ['ACTIVE', 'PENDING_REVIEW'] },
            },
          },
        ],
      },
      select: { id: true },
    });

    return stores.map((store) => store.id);
  }

  async getAccessibleStoreIds(user: AuthenticatedUser) {
    if (this.isAdmin(user) || this.isStaff(user)) {
      return undefined;
    }

    if (user.role === 'PARTNER') {
      return this.getPartnerStoreIds(user.id);
    }

    return [];
  }

  async ensureStoreAccess(user: AuthenticatedUser, storeId: string) {
    const storeIds = await this.getAccessibleStoreIds(user);

    if (storeIds === undefined || storeIds.includes(storeId)) {
      return;
    }

    throw new ForbiddenException('You cannot access data for this store');
  }
}
