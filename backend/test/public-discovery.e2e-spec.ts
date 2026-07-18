import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AccessService } from '../src/access/access.service';
import { ActionPolicyGuard } from '../src/access/action-policy.guard';
import { RolesGuard } from '../src/auth/roles.guard';
import { NightlifeDataController } from '../src/nightlife-data/nightlife-data.controller';
import { NightlifeDataService } from '../src/nightlife-data/nightlife-data.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Public discovery listing API (e2e)', () => {
  let app: INestApplication;
  const prisma = {
    area: { findMany: jest.fn() },
    store: { findMany: jest.fn(), count: jest.fn() },
    cast: { findMany: jest.fn(), count: jest.fn() },
    rankingConfig: { findMany: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.area.findMany.mockResolvedValue([
      {
        id: 'area-hn',
        code: 'hn-tayho',
        name: 'Tay Ho',
        city: 'Ha Noi',
        district: 'Tay Ho',
        ward: 'Quang An',
      },
    ]);
    prisma.store.findMany.mockResolvedValue([
      {
        id: 'store-neon',
        createdAt: new Date('2026-06-20T00:00:00.000Z'),
        name: 'Neon Club',
        slug: 'neon-club',
        category: 'CLUB',
        description: 'EDM club',
        address: 'Tay Ho',
        city: 'Ha Noi',
        district: 'Tay Ho',
        latitude: '21.063',
        longitude: '105.822',
        area: {
          id: 'area-hn',
          code: 'hn-tayho',
          name: 'Tay Ho',
          city: 'Ha Noi',
          district: 'Tay Ho',
        },
        media: [
          { url: '/media/admin/stores/neon-gallery.jpg', purpose: 'gallery' },
          { url: '/media/admin/stores/neon-hero.jpg', purpose: 'hero' },
        ],
      },
    ]);
    prisma.cast.findMany.mockResolvedValue([
      {
        id: 'cast-mika',
        createdAt: new Date('2026-06-20T00:00:00.000Z'),
        slug: 'mika-golden-ktv',
        stageName: 'Mika',
        publicAlias: 'Mika',
        publicHeadline: 'KTV host',
        tags: ['ktv'],
        languages: ['ja', 'vi'],
        hourlyRateVnd: 430000,
        media: [
          {
            url: '/media/admin/casts/mika-gallery.jpg',
            purpose: 'cast-gallery',
          },
          { url: '/media/admin/casts/mika-avatar.jpg', purpose: 'avatar' },
        ],
        store: {
          id: 'store-ktv',
          name: 'Golden Voice KTV Quan 7',
          slug: 'golden-voice-ktv-quan-7',
          category: 'KARAOKE',
          city: 'Ho Chi Minh',
          district: 'Quan 7',
          latitude: '10.7385',
          longitude: '106.7219',
          area: {
            id: 'area-hcm',
            code: 'hcm-q7',
            name: 'Quan 7',
            city: 'Ho Chi Minh',
            district: 'Quan 7',
          },
        },
      },
    ]);
    prisma.store.count.mockResolvedValue(1);
    prisma.cast.count.mockResolvedValue(1);
    prisma.rankingConfig.findMany.mockResolvedValue([]);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [NightlifeDataController],
      providers: [
        Reflector,
        RolesGuard,
        ActionPolicyGuard,
        NightlifeDataService,
        { provide: PrismaService, useValue: prisma },
        { provide: AccessService, useValue: {} },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        forbidNonWhitelisted: true,
        transform: true,
        whitelist: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('handles valid GET /areas query for an MVP city', async () => {
    const response = await request(app.getHttpServer())
      .get('/areas')
      .query({ city: 'hn' })
      .expect(200);

    expect(response.body).toEqual([
      expect.objectContaining({ code: 'hn-tayho', cityCode: 'hn' }),
    ]);
    expect(prisma.area.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deletedAt: null,
          status: 'ACTIVE',
          OR: [
            { code: { startsWith: 'hn-' } },
            { code: { startsWith: 'hanoi-' } },
          ],
        }),
      }),
    );
  });

  it('handles valid GET /stores query and only asks for active non-deleted stores', async () => {
    const response = await request(app.getHttpServer())
      .get('/stores')
      .query({
        q: 'neon',
        city: 'hn',
        category: 'club',
        limit: '20',
        lat: '21.06',
        lng: '105.82',
      })
      .expect(200);

    expect(response.body.data).toEqual([
      expect.objectContaining({ slug: 'neon-club', category: 'CLUB' }),
    ]);
    expect(response.body.meta).toEqual(
      expect.objectContaining({
        total: 1,
        page: 1,
        limit: 20,
        offset: 0,
        hasMore: false,
        sort: 'nearest',
      }),
    );
    expect(prisma.store.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deletedAt: null,
          status: 'ACTIVE',
          category: 'CLUB',
        }),
        take: 20,
      }),
    );
  });

  it('handles valid GET /casts query with language and tag filters', async () => {
    const response = await request(app.getHttpServer())
      .get('/casts')
      .query({
        q: 'mika',
        city: 'hcm',
        category: 'ktv',
        language: 'ja',
        tag: 'ktv',
      })
      .expect(200);

    expect(response.body.data).toEqual([
      expect.objectContaining({
        slug: 'mika-golden-ktv',
        languages: ['ja', 'vi'],
      }),
    ]);
    expect(response.body.meta).toEqual(
      expect.objectContaining({
        total: 1,
        page: 1,
        hasMore: false,
        sort: 'newest',
      }),
    );
    expect(prisma.cast.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deletedAt: null,
          status: 'ACTIVE',
          isPublic: true,
          languages: { has: 'ja' },
          tags: { has: 'ktv' },
          store: expect.objectContaining({
            deletedAt: null,
            status: 'ACTIVE',
            category: 'KARAOKE',
          }),
        }),
      }),
    );
  });

  it('handles valid GET /rankings query for public casts', async () => {
    prisma.rankingConfig.findMany.mockResolvedValue([
      {
        targetId: 'cast-mika',
        cityCode: 'hcm',
        category: 'KARAOKE',
        scope: 'global',
        manualScore: 95,
        pinRank: 1,
        sponsored: true,
        updatedAt: new Date('2026-06-20T00:00:00.000Z'),
      },
    ]);

    const response = await request(app.getHttpServer())
      .get('/rankings')
      .query({
        targetType: 'CAST',
        city: 'hcm',
        category: 'karaoke',
        limit: '1',
      })
      .expect(200);

    expect(response.body).toEqual({
      data: [
        expect.objectContaining({
          rank: 1,
          targetType: 'CAST',
          targetId: 'cast-mika',
          name: 'Mika',
          slug: 'mika-golden-ktv',
          image: '/media/admin/casts/mika-avatar.jpg',
          category: 'KARAOKE',
          sponsored: true,
          pinRank: 1,
          manualScore: 95,
          href: '/casts/mika-golden-ktv',
        }),
      ],
      meta: expect.objectContaining({
        targetType: 'CAST',
        city: 'hcm',
        category: 'KARAOKE',
        limit: 1,
        total: 1,
      }),
    });
    expect(prisma.rankingConfig.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          targetType: 'CAST',
          scope: 'global',
          status: 'ACTIVE',
          deletedAt: null,
        }),
      }),
    );
    expect(prisma.cast.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: { in: ['cast-mika'] },
          deletedAt: null,
          status: 'ACTIVE',
          isPublic: true,
          store: expect.objectContaining({
            deletedAt: null,
            status: 'ACTIVE',
          }),
        }),
      }),
    );
  });

  it('handles valid GET /rankings query for public stores with phone', async () => {
    prisma.store.findMany.mockResolvedValue([
      {
        id: 'store-neon',
        name: 'Neon Club',
        slug: 'neon-club',
        category: 'CLUB',
        city: 'Ha Noi',
        district: 'Tay Ho',
        phone: '+84243456007',
        area: {
          id: 'area-hn',
          code: 'hn-tayho',
          name: 'Tay Ho',
          city: 'Ha Noi',
          district: 'Tay Ho',
        },
        media: [
          { url: '/media/admin/stores/neon-gallery.jpg', purpose: 'gallery' },
          { url: '/media/admin/stores/neon-hero.jpg', purpose: 'hero' },
        ],
      },
    ]);
    prisma.rankingConfig.findMany.mockResolvedValue([
      {
        targetId: 'store-neon',
        cityCode: 'hn',
        category: 'CLUB',
        scope: 'global',
        manualScore: 100,
        pinRank: 1,
        sponsored: true,
        updatedAt: new Date('2026-06-20T00:00:00.000Z'),
      },
    ]);

    const response = await request(app.getHttpServer())
      .get('/rankings')
      .query({
        targetType: 'STORE',
        city: 'hn',
        category: 'club',
        limit: '1',
      })
      .expect(200);

    expect(response.body.data).toEqual([
      expect.objectContaining({
        rank: 1,
        targetType: 'STORE',
        targetId: 'store-neon',
        name: 'Neon Club',
        slug: 'neon-club',
        image: '/media/admin/stores/neon-hero.jpg',
        category: 'CLUB',
        sponsored: true,
        pinRank: 1,
        manualScore: 100,
        href: '/stores/neon-club',
        phone: '+84243456007',
      }),
    ]);
  });

  it('does not synthesize public ranking rows without admin configs', async () => {
    const response = await request(app.getHttpServer())
      .get('/rankings')
      .query({ targetType: 'CAST', city: 'hn', limit: '5' })
      .expect(200);

    expect(response.body).toEqual({
      data: [],
      meta: expect.objectContaining({
        targetType: 'CAST',
        city: 'hn',
        limit: 5,
        total: 0,
      }),
    });
    expect(prisma.cast.findMany).not.toHaveBeenCalled();
  });

  it('uses the aggregate admin ranking configs for city=all', async () => {
    await request(app.getHttpServer())
      .get('/rankings')
      .query({ targetType: 'STORE', city: 'all', limit: '5' })
      .expect(200);

    expect(prisma.rankingConfig.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          targetType: 'STORE',
          AND: expect.arrayContaining([{ cityCode: 'all' }]),
        }),
      }),
    );
  });

  it('rejects an invalid category', async () => {
    await request(app.getHttpServer())
      .get('/stores')
      .query({ category: 'bowling' })
      .expect(400);

    expect(prisma.store.findMany).not.toHaveBeenCalled();
  });

  it('rejects unsupported public area city filters', async () => {
    await request(app.getHttpServer())
      .get('/areas')
      .query({ city: 'tokyo' })
      .expect(400);

    expect(prisma.area.findMany).not.toHaveBeenCalled();
  });

  it('rejects unsupported public ranking city filters', async () => {
    await request(app.getHttpServer())
      .get('/rankings')
      .query({ city: 'tokyo' })
      .expect(400);

    expect(prisma.rankingConfig.findMany).not.toHaveBeenCalled();
  });

  it('rejects an oversized limit', async () => {
    await request(app.getHttpServer())
      .get('/stores')
      .query({ limit: '101' })
      .expect(400);

    expect(prisma.store.findMany).not.toHaveBeenCalled();
  });

  it('rejects invalid coordinates', async () => {
    await request(app.getHttpServer())
      .get('/stores')
      .query({ lat: '999', lng: '105.82' })
      .expect(400);

    expect(prisma.store.findMany).not.toHaveBeenCalled();
  });

  it('rejects nearest sort without coordinates', async () => {
    await request(app.getHttpServer())
      .get('/stores')
      .query({ sort: 'nearest' })
      .expect(400);

    expect(prisma.store.findMany).not.toHaveBeenCalled();
    expect(prisma.store.count).not.toHaveBeenCalled();
  });
});
