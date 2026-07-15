import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(type?: string) {
    return this.prisma.category.findMany({
      where: type ? { type } : undefined,
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(data: { name: string; slug: string; type?: string }) {
    return this.prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        type: data.type || 'BLOG',
      },
    });
  }

  async update(
    id: string,
    data: { name?: string; slug?: string; type?: string },
  ) {
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.category.delete({
      where: { id },
    });
  }
}
