import { describe, expect, it } from 'vitest';
import { normalizeStoreDetail, type PublicStoreDetail } from '../src/lib/api/store-detail';

const storeDetail: PublicStoreDetail = {
  id: 'store-admin-1',
  slug: 'admin-store',
  name: 'Admin Store',
  category: 'BAR',
  description: 'Admin description',
  area: null,
  address: 'Admin address',
  city: 'Ha Noi',
  cityCode: 'hn',
  district: 'Hoan Kiem',
  phone: '+84240000000',
  latitude: 21.03,
  longitude: 105.85,
  mapUrl: 'https://maps.example/admin',
  googlePlaceId: null,
  openingHours: { monday: { open: '19:00', close: '02:00' } },
  holidaySchedule: null,
  gallery: [
    {
      id: 'media-store-1',
      type: 'IMAGE',
      url: 'https://cdn.example.com/admin-store-gallery.jpg',
      purpose: 'store-gallery',
      alt: 'Admin store gallery',
    },
    {
      id: 'media-store-video',
      type: 'VIDEO',
      url: 'https://www.youtube.com/embed/admin-store',
      purpose: 'promo',
      alt: 'Admin store video',
    },
  ],
  casts: [
    {
      id: 'cast-admin-1',
      slug: 'admin-cast',
      stageName: 'Admin Cast',
      publicAlias: 'Admin Cast',
      publicHeadline: 'Admin headline',
      thumbnailUrl: 'https://cdn.example.com/admin-cast.jpg',
      tags: ['vip'],
      languages: ['vi'],
      hourlyRateVnd: 700000,
    },
  ],
  priceReference: {
    currency: 'VND',
    startingFromVnd: 700000,
    note: 'Admin pricing',
    items: [
      {
        label: 'Admin menu item',
        amountVnd: 1200000,
        imageUrl: 'https://cdn.example.com/admin-menu.jpg',
      },
    ],
  },
  activeCoupons: [],
  campaigns: [],
  relatedStores: [
    {
      id: 'related-store',
      slug: 'related-admin-store',
      name: 'Related Store',
      category: 'CLUB',
      city: 'Ha Noi',
      thumbnailUrl: 'https://cdn.example.com/related-store.jpg',
      relatedReason: 'same-city',
    },
  ],
  seo: {
    title: 'Admin Store | NightLife VN',
    description: 'Admin description',
    canonicalPath: '/stores/admin-store',
    ogImage: 'https://cdn.example.com/admin-og.jpg',
  },
};

describe('normalizeStoreDetail', () => {
  it('keeps admin store media, cast thumbnails, menu images, and related store images', () => {
    const normalized = normalizeStoreDetail(storeDetail);

    expect(normalized.gallery.map((item) => item.url)).toEqual([
      'https://cdn.example.com/admin-store-gallery.jpg',
      'https://www.youtube.com/embed/admin-store',
    ]);
    expect(normalized.casts[0]?.thumbnailUrl).toBe('https://cdn.example.com/admin-cast.jpg');
    expect(normalized.priceReference.items[0]?.imageUrl).toBe(
      'https://cdn.example.com/admin-menu.jpg',
    );
    expect(normalized.relatedStores[0]?.thumbnailUrl).toBe(
      'https://cdn.example.com/related-store.jpg',
    );
    expect(normalized.seo.ogImage).toBe('https://cdn.example.com/admin-og.jpg');
  });
});
