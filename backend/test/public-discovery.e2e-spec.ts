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
    store: { findMany: jest.fn() },
    cast: { findMany: jest.fn() },
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
        media: [],
      },
    ]);
    prisma.cast.findMany.mockResolvedValue([
      {
        id: 'cast-mika',
        slug: 'mika-golden-ktv',
        stageName: 'Mika',
        publicAlias: 'Mika',
        publicHeadline: 'KTV host',
        tags: ['ktv'],
        languages: ['ja', 'vi'],
        hourlyRateVnd: 430000,
        media: [],
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
          code: { startsWith: 'hn-' },
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

    expect(response.body).toEqual([
      expect.objectContaining({ slug: 'neon-club', category: 'CLUB' }),
    ]);
    expect(prisma.store.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deletedAt: null,
          status: 'ACTIVE',
          category: 'CLUB',
        }),
        take: 100,
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

    expect(response.body).toEqual([
      expect.objectContaining({
        slug: 'mika-golden-ktv',
        languages: ['ja', 'vi'],
      }),
    ]);
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

  it('rejects an invalid category', async () => {
    await request(app.getHttpServer())
      .get('/stores')
      .query({ category: 'bowling' })
      .expect(400);

    expect(prisma.store.findMany).not.toHaveBeenCalled();
  });

  it('rejects cities outside the P0 public scope', async () => {
    await request(app.getHttpServer())
      .get('/areas')
      .query({ city: 'dn' })
      .expect(400);

    expect(prisma.area.findMany).not.toHaveBeenCalled();
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
});
