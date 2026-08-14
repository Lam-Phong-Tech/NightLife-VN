export type ImageVariantWidth = { width: number };

export const IMAGE_BREAKPOINTS_BY_PURPOSE: Record<string, readonly number[]> = {
  // Store images are reused in 64-92px homepage cards. A 200px candidate
  // covers those slots on high-DPR mobile screens without forcing 400px.
  'store-hero': [200, 400, 800, 1200, 1600],
  'store-cover': [200, 400, 800, 1200, 1600],
  STORE_COVER: [200, 400, 800, 1200, 1600],
  COVER_IMAGE: [200, 400, 800, 1200, 1600],
  PARTNER_STORE_COVER: [200, 400, 800, 1200, 1600],

  // Some legacy stores use a gallery image as the primary card/hero image.
  // Keep the thumbnail candidate automatic for those uploads as well.
  STORE_GALLERY: [200, 400, 800, 1200],
  PARTNER_STORE_GALLERY: [200, 400, 800, 1200],

  CAST_AVATAR: [200, 400, 800],
  CAST_PHOTO: [200, 400, 800],
  PARTNER_CAST_IMAGE: [200, 400, 800],

  TOUR_COVER: [400, 800, 1200],
  BLOG_COVER: [400, 800, 1200],
  BANNER_GLOBAL: [400, 800, 1200],

  STORE_MENU_ITEM: [200, 400, 800],
  PARTNER_MENU_ITEM: [200, 400, 800],
};

export const DEFAULT_IMAGE_BREAKPOINTS: readonly number[] = [400, 800, 1200];

export function getImageBreakpoints(
  purpose: string | null | undefined,
  originalWidth: number,
): number[] {
  const configured =
    (purpose ? IMAGE_BREAKPOINTS_BY_PURPOSE[purpose] : undefined) ??
    DEFAULT_IMAGE_BREAKPOINTS;
  const widths = configured.filter((width) => width <= originalWidth);
  if (widths.length) return [...widths];
  return [Math.max(1, Math.floor(originalWidth))];
}

export function getMissingImageVariantWidths(
  desiredWidths: readonly number[],
  variants: readonly ImageVariantWidth[],
): number[] {
  const existingWidths = new Set(variants.map((variant) => variant.width));
  return desiredWidths.filter((width) => !existingWidths.has(width));
}
