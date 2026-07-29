import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Category, Prisma } from '@prisma/client';
import { AuthenticatedUser } from '../access/access.service';
import { adminAuditActorFields } from '../audit-logs/admin-audit';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  private categoryAuditSnapshot(category: Category) {
    return {
      name: category.name,
      slug: category.slug,
      type: category.type,
    } as Prisma.InputJsonValue;
  }

  async findAll(type?: string) {
    return this.prisma.category.findMany({
      where: type ? { type } : undefined,
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(
    data: { name: string; slug: string; type?: string },
    actor: AuthenticatedUser,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const created = await tx.category.create({
        data: {
          name: data.name,
          slug: data.slug,
          type: data.type || 'BLOG',
        },
      });

      await tx.auditLog.create({
        data: {
          ...adminAuditActorFields(actor),
          module: 'Category',
          action: 'category.create',
          targetType: 'Category',
          targetId: created.id,
          entityDisplayCode: `CAT-${created.id.substring(0, 8)}`,
          beforeJson: Prisma.JsonNull,
          afterJson: this.categoryAuditSnapshot(created),
          changeSummary: `Created category "${created.name}" (${created.type})`,
          result: 'SUCCESS',
        },
      });

      return created;
    });
  }

  async update(
    id: string,
    data: { name?: string; slug?: string; type?: string },
    actor: AuthenticatedUser,
  ) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.category.update({
        where: { id },
        data,
      });

      await tx.auditLog.create({
        data: {
          ...adminAuditActorFields(actor),
          module: 'Category',
          action: 'category.update',
          targetType: 'Category',
          targetId: id,
          entityDisplayCode: `CAT-${id.substring(0, 8)}`,
          beforeJson: this.categoryAuditSnapshot(existing),
          afterJson: this.categoryAuditSnapshot(updated),
          changedFields: Object.entries(data)
            .filter(([, value]) => value !== undefined)
            .map(([key]) => key),
          changeSummary: `Updated category "${updated.name}"`,
          result: 'SUCCESS',
        },
      });

      return updated;
    });
  }

  async remove(id: string, actor: AuthenticatedUser) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      const deleted = await tx.category.delete({
        where: { id },
      });

      await tx.auditLog.create({
        data: {
          ...adminAuditActorFields(actor),
          module: 'Category',
          action: 'category.delete',
          targetType: 'Category',
          targetId: id,
          entityDisplayCode: `CAT-${id.substring(0, 8)}`,
          beforeJson: this.categoryAuditSnapshot(existing),
          afterJson: Prisma.JsonNull,
          changeSummary: `Deleted category "${existing.name}" (hard delete)`,
          result: 'SUCCESS',
        },
      });

      return deleted;
    });
  }
}
