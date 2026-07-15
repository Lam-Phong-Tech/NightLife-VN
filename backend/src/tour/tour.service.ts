import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';

@Injectable()
export class TourService {
  constructor(private prisma: PrismaService) {}

  private publicTourStoreSelect(now: Date) {
    return {
      id: true,
      name: true,
      slug: true,
      category: true,
      description: true,
      address: true,
      city: true,
      district: true,
      openingHours: true,
      pricingInfo: true,
      area: {
        select: {
          id: true,
          code: true,
          name: true,
          city: true,
          district: true,
          ward: true,
        },
      },
      media: {
        where: {
          deletedAt: null,
          access: 'PUBLIC',
          status: 'READY',
          type: 'IMAGE',
        },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          id: true,
          url: true,
          purpose: true,
        },
      },
      coupons: {
        where: {
          status: 'ACTIVE',
          deletedAt: null,
          startsAt: { lte: now },
          OR: [{ endsAt: null }, { endsAt: { gte: now } }],
        },
        orderBy: { startsAt: 'desc' },
        take: 2,
        select: {
          id: true,
          code: true,
          name: true,
          description: true,
          discountType: true,
          discountValue: true,
          maxDiscountVnd: true,
          minSpendVnd: true,
        },
      },
      casts: {
        where: {
          status: 'ACTIVE',
          isPublic: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 4,
        select: {
          id: true,
          stageName: true,
          slug: true,
          publicAlias: true,
          publicHeadline: true,
          zodiacSign: true,
          heightCm: true,
          languages: true,
          tags: true,
          media: {
            where: {
              deletedAt: null,
              access: 'PUBLIC',
              status: 'READY',
              type: 'IMAGE',
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              id: true,
              url: true,
              purpose: true,
            },
          },
        },
      },
    } satisfies Prisma.StoreSelect;
  }

  private publicTourInclude(now: Date) {
    return {
      stops: {
        where: {
          store: {
            status: 'ACTIVE',
            deletedAt: null,
          },
        },
        orderBy: { order: 'asc' },
        include: {
          store: {
            select: this.publicTourStoreSelect(now),
          },
        },
      },
    } satisfies Prisma.TourInclude;
  }

  async findPublicAll(params: {
    skip?: number;
    take?: number;
    city?: string;
  }) {
    const { skip = 0, take = 20, city } = params;
    const now = new Date();
    const where: Prisma.TourWhereInput = {
      status: 'ACTIVE',
      deletedAt: null,
      ...(city ? { city } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.tour.findMany({
        skip,
        take,
        where,
        orderBy: { createdAt: 'desc' },
        include: this.publicTourInclude(now),
      }),
      this.prisma.tour.count({ where }),
    ]);

    return {
      data: data.filter((tour) => tour.stops.length > 0),
      total,
      page: Math.floor(skip / take) + 1,
      limit: take,
    };
  }

  async findPublicOne(id: string) {
    const now = new Date();
    const tour = await this.prisma.tour.findFirst({
      where: {
        id,
        status: 'ACTIVE',
        deletedAt: null,
      },
      include: this.publicTourInclude(now),
    });

    if (!tour || tour.stops.length === 0) {
      throw new NotFoundException(`Tour with ID ${id} not found`);
    }

    return tour;
  }

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
