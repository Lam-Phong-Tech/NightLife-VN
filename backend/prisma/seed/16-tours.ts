import { PrismaClient, Tour, Store, ProfileStatus } from '@prisma/client';
import { seedUuid } from './shared';

interface TourStopSeed {
  storeSlug: string;
  order: number;
}

interface TourSeed {
  key: string;
  title: string;
  subtitle: string;
  city: string;
  durationHours: number;
  priceTier: number;
  coverUrl: string;
  status: ProfileStatus;
  departureTimes: string[];
  stops: TourStopSeed[];
}

const dailyDepartureSchedule = (times: string[]) =>
  Object.fromEntries(
    [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ].map((day) => [day, { isOff: times.length === 0, times }]),
  );

const TOURS: TourSeed[] = [
  {
    key: 'hanoi-old-quarter-crawl',
    title: 'Hanoi Old Quarter Pub & Lounge Crawl',
    subtitle:
      'Discover the hidden gems, craft beers, and speakeasy lounges in the historic heart of Hanoi.',
    city: 'Hà Nội',
    durationHours: 4,
    priceTier: 2,
    coverUrl:
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200&h=800&fit=crop&q=80',
    status: ProfileStatus.ACTIVE,
    departureTimes: ['19:00', '20:30'],
    stops: [
      { storeSlug: 'crimson-bar', order: 1 },
      { storeSlug: 'star-ktv', order: 2 },
      { storeSlug: 'jade-lounge', order: 3 },
    ],
  },
  {
    key: 'saigon-nightlife-vip',
    title: 'Saigon Premium VIP Experience',
    subtitle:
      'Experience Saigon’s most exclusive bars, high-end lounges, and elite clubs in District 1.',
    city: 'Hồ Chí Minh',
    durationHours: 5,
    priceTier: 3,
    coverUrl:
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&h=800&fit=crop&q=80',
    status: ProfileStatus.ACTIVE,
    departureTimes: ['20:00', '21:30'],
    stops: [
      { storeSlug: 'moonlight-bar', order: 1 },
      { storeSlug: 'sakura-lounge', order: 2 },
      { storeSlug: 'velvet-club', order: 3 },
    ],
  },
];

export async function seedTours(
  prisma: PrismaClient,
  stores: Record<string, Store>,
): Promise<Record<string, Tour>> {
  console.log('  🗺️ Seeding tours...');
  const result: Record<string, Tour> = {};

  for (const t of TOURS) {
    const id = seedUuid(`tour:${t.key}`);

    // 1. Upsert Tour
    const tour = await prisma.tour.upsert({
      where: { id },
      update: {
        title: t.title,
        subtitle: t.subtitle,
        city: t.city,
        durationHours: t.durationHours,
        priceTier: t.priceTier,
        coverUrl: t.coverUrl,
        departureTimes: t.departureTimes,
        departureSchedule: dailyDepartureSchedule(t.departureTimes),
        status: t.status,
      },
      create: {
        id,
        title: t.title,
        subtitle: t.subtitle,
        city: t.city,
        durationHours: t.durationHours,
        priceTier: t.priceTier,
        coverUrl: t.coverUrl,
        departureTimes: t.departureTimes,
        departureSchedule: dailyDepartureSchedule(t.departureTimes),
        status: t.status,
      },
    });

    result[t.key] = tour;

    // 2. Upsert Tour Stops
    for (const stop of t.stops) {
      const store = stores[stop.storeSlug];
      if (!store) {
        console.warn(`     ⚠ Store not found for tour stop: ${stop.storeSlug}`);
        continue;
      }

      await prisma.tourStop.upsert({
        where: {
          tourId_storeId: {
            tourId: tour.id,
            storeId: store.id,
          },
        },
        update: {
          order: stop.order,
        },
        create: {
          id: seedUuid(`tourstop:${t.key}:${stop.storeSlug}`),
          tourId: tour.id,
          storeId: store.id,
          order: stop.order,
        },
      });
    }
  }

  console.log(
    `     ✓ ${Object.keys(result).length} tours & related stops successfully seeded`,
  );
  return result;
}
