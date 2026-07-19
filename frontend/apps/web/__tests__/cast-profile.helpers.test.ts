import { describe, expect, it } from 'vitest';
import type { PublicCastDetail } from '../src/lib/api/cast-detail';
import { profileFromCastDetail } from '../src/app/(public)/casts/[slug]/cast-profile.helpers';

const castDetail: PublicCastDetail = {
  id: 'cast-admin-1',
  slug: 'admin-cast',
  stageName: 'Admin Cast',
  name: 'Admin Alias',
  publicAlias: 'Admin Alias',
  publicBio: 'Admin bio from CMS',
  monthOfBirth: 8,
  zodiacSign: 'Leo',
  heightCm: 168,
  measurements: '82-58-86',
  interests: ['wine', 'piano'],
  styleTags: ['elegant', 'quiet'],
  tags: ['vip'],
  languages: ['vi', 'en'],
  hourlyRateVnd: 700000,
  thumbnailUrl: 'https://cdn.example.com/admin-cast-avatar.jpg',
  gallery: [
    {
      id: 'media-admin-1',
      type: 'IMAGE',
      url: 'https://cdn.example.com/admin-cast-gallery.jpg',
      purpose: 'cast-gallery',
      alt: 'Admin uploaded gallery',
    },
    {
      id: 'media-admin-video',
      type: 'VIDEO',
      url: 'https://youtu.be/admin-cast',
      purpose: 'youtube-link',
      alt: 'Admin video',
    },
  ],
  relatedCasts: [
    {
      id: 'related-1',
      slug: 'related-admin-cast',
      stageName: 'Related',
      name: 'Related',
      publicAlias: 'Related',
      tags: [],
      languages: ['vi'],
      hourlyRateVnd: null,
      thumbnailUrl: 'https://cdn.example.com/related.jpg',
      relatedReason: 'same-store',
      store: {
        id: 'store-admin-1',
        name: 'Admin Store',
        slug: 'admin-store',
        category: 'MASSAGE_SPA',
        city: 'Ha Noi',
        cityCode: 'hn',
        district: 'Hoan Kiem',
        area: null,
        thumbnailUrl: 'https://cdn.example.com/store.jpg',
      },
    },
  ],
  store: {
    id: 'store-admin-1',
    name: 'Admin Store',
    slug: 'admin-store',
    category: 'MASSAGE_SPA',
    city: 'Ha Noi',
    cityCode: 'hn',
    district: 'Hoan Kiem',
    area: null,
    latitude: null,
    longitude: null,
    thumbnailUrl: 'https://cdn.example.com/store.jpg',
    phone: null,
    mapUrl: null,
    googlePlaceId: null,
  },
  seo: {
    title: 'Admin Alias | NightLife VN',
    description: 'Admin bio from CMS',
    canonicalPath: '/casts/admin-cast',
    ogImage: 'https://cdn.example.com/admin-cast-avatar.jpg',
  },
};

describe('profileFromCastDetail', () => {
  it('keeps admin media and profile fields instead of demo images', () => {
    const profile = profileFromCastDetail(castDetail);

    expect(profile.thumbnailUrl).toBe('https://cdn.example.com/admin-cast-avatar.jpg');
    expect(profile.gallery.map((item) => item.url)).toEqual([
      'https://cdn.example.com/admin-cast-avatar.jpg',
      'https://cdn.example.com/admin-cast-gallery.jpg',
      'https://youtu.be/admin-cast',
    ]);
    expect(profile.bio).toBe('Admin bio from CMS');
    expect(profile.monthOfBirth).toBe(8);
    expect(profile.zodiacSign).toBe('Leo');
    expect(profile.heightCm).toBe(168);
    expect(profile.measurements).toBe('82-58-86');
    expect(profile.interests).toEqual(['wine', 'piano']);
    expect(profile.styleTags).toEqual(['elegant', 'quiet']);
    expect(profile.store.thumbnailUrl).toBe('https://cdn.example.com/store.jpg');
  });
});
