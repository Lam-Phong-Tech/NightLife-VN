import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HomeHeroPreload } from "@/components/home/HomeHeroPreload";
import type { CmsContentItem } from "@/lib/api/content";
import { buildHomeHeroPreload, HOME_HERO_IMAGE_SIZES, selectHomeHeroBanner } from "@/lib/home-hero";

function banner(id: string, order: number, createdAt: string): CmsContentItem {
  return {
    id,
    title: id,
    slug: id,
    type: "BANNER",
    status: "PUBLISHED",
    createdAt,
    updatedAt: createdAt,
    metadata: {
      imageUrl: `/fallback-${id}.webp`,
      position: "Trang chủ #1",
      order,
    },
    responsiveImage: {
      src: `/primary-${id}.webp`,
      width: 1920,
      height: 720,
      variants: [
        {
          width: 800,
          webpUrl: `/hero-${id}-800.webp`,
          avifUrl: `/hero-${id}-800.avif`,
        },
        {
          width: 400,
          webpUrl: `/hero-${id}-400.webp`,
          avifUrl: `/hero-${id}-400.avif`,
        },
      ],
    },
  };
}

describe("homepage hero preload", () => {
  it("selects the same stable first banner used by the hero", () => {
    const selected = selectHomeHeroBanner([
      banner("later", 2, "2026-01-01T00:00:00.000Z"),
      banner("tie-b", 1, "2026-01-02T00:00:00.000Z"),
      banner("tie-a", 1, "2026-01-01T00:00:00.000Z"),
    ]);
    expect(selected?.id).toBe("tie-a");
  });

  it("preloads the AVIF candidates with the exact hero sizes", () => {
    const selected = banner("active", 1, "2026-01-01T00:00:00.000Z");
    expect(buildHomeHeroPreload(selected)).toEqual({
      href: "/hero-active-400.avif",
      type: "image/avif",
      imageSrcSet: "/hero-active-400.avif 400w, /hero-active-800.avif 800w",
      imageSizes: HOME_HERO_IMAGE_SIZES,
    });

    const html = renderToStaticMarkup(<HomeHeroPreload banner={selected} />);
    expect(html).toContain('rel="preload"');
    expect(html).toContain('fetchPriority="high"');
    expect(html).toContain('imageSrcSet="/hero-active-400.avif 400w, /hero-active-800.avif 800w"');
    expect(html).toContain(`imageSizes="${HOME_HERO_IMAGE_SIZES}"`);
  });

  it("keeps a legacy banner preload working without variants", () => {
    const legacy = banner("legacy", 1, "2026-01-01T00:00:00.000Z");
    legacy.responsiveImage = null;
    expect(buildHomeHeroPreload(legacy)).toEqual({
      href: "/fallback-legacy.webp",
    });
  });
});
