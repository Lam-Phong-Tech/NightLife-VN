import { describe, expect, it } from 'vitest';
import {
  extractMenuImageKeysAndIds,
  filterStoreAlbumMedia,
  isMenuMediaItem,
} from '@/lib/store-media-filter';

describe('Store Album Media Filter', () => {
  it('identifies media with menu item purpose as menu media', () => {
    const menuMedia = { id: 'media-1', url: 'https://example.com/item1.jpg', purpose: 'STORE_MENU_ITEM' };
    const galleryMedia = { id: 'media-2', url: 'https://example.com/album1.jpg', purpose: 'STORE_GALLERY' };
    const emptyKeys = new Set<string>();

    expect(isMenuMediaItem(menuMedia, emptyKeys)).toBe(true);
    expect(isMenuMediaItem(galleryMedia, emptyKeys)).toBe(false);
  });

  it('identifies media referenced in pricingInfo items as menu media', () => {
    const pricingInfo = {
      groups: [
        {
          name: 'Cocktails',
          items: [
            { id: 'm1', name: 'Mojito', thumb: 'https://example.com/mojito.jpg', mediaId: 'media-mojito' },
          ],
        },
      ],
    };

    const keysAndIds = extractMenuImageKeysAndIds(pricingInfo);
    expect(keysAndIds.has('media-mojito')).toBe(true);

    const referencedMediaById = { id: 'media-mojito', url: 'https://example.com/mojito.jpg', purpose: 'STORE_GALLERY' };
    expect(isMenuMediaItem(referencedMediaById, keysAndIds)).toBe(true);
  });

  it('excludes menu item images from store album gallery', () => {
    const mockStoreMedia = [
      { id: 'cover-1', type: 'IMAGE', url: 'https://example.com/hero.jpg', purpose: 'store-hero' },
      { id: 'album-1', type: 'IMAGE', url: 'https://example.com/album1.jpg', purpose: 'STORE_GALLERY' },
      { id: 'album-2', type: 'IMAGE', url: 'https://example.com/album2.jpg', purpose: 'STORE_GALLERY' },
      { id: 'menu-1', type: 'IMAGE', url: 'https://example.com/cocktail.jpg', purpose: 'STORE_MENU_ITEM' },
      { id: 'menu-2', type: 'IMAGE', url: 'https://example.com/steak.jpg', purpose: 'store_menu_item' },
    ];

    const pricingInfo = {
      groups: [
        {
          name: 'Food',
          items: [
            { id: 'item-1', name: 'Steak', thumb: 'https://example.com/steak.jpg', mediaId: 'menu-2' },
          ],
        },
      ],
    };

    const { cover, galleryMedia } = filterStoreAlbumMedia(mockStoreMedia, pricingInfo);

    expect(cover?.id).toBe('cover-1');
    expect(galleryMedia.map((m: any) => m.id)).toEqual(['album-1', 'album-2']);
    expect(galleryMedia.some((m: any) => m.id === 'menu-1' || m.id === 'menu-2')).toBe(false);
  });
});
