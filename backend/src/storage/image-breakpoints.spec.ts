import {
  getImageBreakpoints,
  getMissingImageVariantWidths,
} from './image-breakpoints';

describe('image breakpoints', () => {
  it.each([
    'store-hero',
    'store-cover',
    'STORE_COVER',
    'COVER_IMAGE',
    'PARTNER_STORE_COVER',
  ])('adds a 200px candidate for %s', (purpose) => {
    expect(getImageBreakpoints(purpose, 1600)).toEqual([
      200, 400, 800, 1200, 1600,
    ]);
  });

  it('does not upscale a source that is narrower than the first breakpoint', () => {
    expect(getImageBreakpoints('store-hero', 120)).toEqual([120]);
  });

  it('identifies only the new width needed by an already migrated store image', () => {
    expect(
      getMissingImageVariantWidths(
        getImageBreakpoints('store-hero', 1600),
        [400, 800, 1200, 1600].map((width) => ({ width })),
      ),
    ).toEqual([200]);
  });
});
