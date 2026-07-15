import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';

@Injectable()
export class TourService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.TourWhereInput;
    orderBy?: Prisma.TourOrderByWithRelationInput;
  }) {
    const { skip = 0, take = 50, where, orderBy } = params;

    const [data, total] = await Promise.all([
      this.prisma.tour.findMany({
        skip,
        take,
        where: {
          ...where,
          status: where?.status || { not: 'DELETED' },
        },
        orderBy: orderBy || { createdAt: 'desc' },
        include: {
          stops: {
            orderBy: { order: 'asc' },
            include: {
              store: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                  city: true,
                  district: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.tour.count({
        where: {
          ...where,
          status: where?.status || { not: 'DELETED' },
        },
      }),
    ]);

    return {
      data,
      total,
      page: Math.floor(skip / take) + 1,
      limit: take,
    };
  }

  async findOne(id: string) {
    const tour = await this.prisma.tour.findFirst({
      where: {
        id,
        status: { not: 'DELETED' },
      },
      include: {
        stops: {
          orderBy: { order: 'asc' },
          include: {
            store: {
              include: {
                casts: {
                  where: { status: 'ACTIVE' },
                  select: {
                    id: true,
                    stageName: true,
                    slug: true,
                    zodiacSign: true,
                    heightCm: true,
                    languages: true,
                    tags: true,
                  },
                },
                coupons: {
                  where: { status: 'ACTIVE' },
                  select: {
                    id: true,
                    name: true,
                    discountType: true,
                    discountValue: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!tour) {
      throw new NotFoundException(`Tour with ID ${id} not found`);
    }

    return tour;
  }

  async create(dto: CreateTourDto) {
    const { stops, ...tourData } = dto;

    return this.prisma.$transaction(async (tx) => {
      const tour = await tx.tour.create({
        data: {
          title: tourData.title,
          subtitle: tourData.subtitle,
          city: tourData.city,
          durationHours: tourData.durationHours,
          priceTier: tourData.priceTier,
          coverUrl: tourData.coverUrl,
          status: tourData.status || 'ACTIVE',
          departureTimes: tourData.departureTimes,
        },
      });

      if (stops && stops.length > 0) {
        await tx.tourStop.createMany({
          data: stops.map((stop) => ({
            tourId: tour.id,
            storeId: stop.storeId,
            order: stop.order,
          })),
        });
      }

      return tx.tour.findUnique({
        where: { id: tour.id },
        include: {
          stops: {
            orderBy: { order: 'asc' },
            include: { store: true },
          },
        },
      });
    });
  }

  async update(id: string, dto: UpdateTourDto) {
    const { stops, ...tourData } = dto;

    const existing = await this.prisma.tour.findFirst({
      where: { id, status: { not: 'DELETED' } },
    });
    if (!existing) {
      throw new NotFoundException(`Tour with ID ${id} not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.tour.update({
        where: { id },
        data: {
          title: tourData.title,
          subtitle: tourData.subtitle,
          city: tourData.city,
          durationHours: tourData.durationHours,
          priceTier: tourData.priceTier,
          coverUrl: tourData.coverUrl,
          status: tourData.status,
          departureTimes: tourData.departureTimes,
        },
      });

      if (stops) {
        await tx.tourStop.deleteMany({
          where: { tourId: id },
        });

        if (stops.length > 0) {
          await tx.tourStop.createMany({
            data: stops.map((stop) => ({
              tourId: id,
              storeId: stop.storeId,
              order: stop.order,
            })),
          });
        }
      }

      return tx.tour.findUnique({
        where: { id },
        include: {
          stops: {
            orderBy: { order: 'asc' },
            include: { store: true },
          },
        },
      });
    });
  }

  async remove(id: string) {
    const tour = await this.prisma.tour.findFirst({
      where: { id, status: { not: 'DELETED' } },
    });
    if (!tour) {
      throw new NotFoundException(`Tour with ID ${id} not found`);
    }

    return this.prisma.tour.update({
      where: { id },
      data: {
        status: 'DELETED',
        deletedAt: new Date(),
      },
    });
  }
}
