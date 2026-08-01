/**
 * SeoConfig.test.ts
 *
 * TDD tests for 4 Critical SEO issues identified in the pre-production audit:
 * 1. siteConfig.description must contain proper Vietnamese diacritics
 * 2. robots.ts must export a sitemap URL
 * 3. sitemap.ts must export a revalidate constant
 * 4. sitemap store/cast limit must be > 50
 */
import { describe, it, expect } from "vitest";

// -------------------------------------------------------------------
// Issue #1 — siteConfig.description diacritics
// -------------------------------------------------------------------
describe("siteConfig", () => {
  it("description should contain Vietnamese diacritics (không, ưu đãi, cẩm nang)", async () => {
    const { siteConfig } = await import("@/lib/site");

    // These Vietnamese words MUST appear with diacritics, not stripped
    expect(siteConfig.description).toMatch(/Khám phá/i); // "Khám phá" not "Kham pha"
    expect(siteConfig.description).toMatch(/ưu đãi/i);   // "ưu đãi" not "uu dai"
    expect(siteConfig.description).toMatch(/cẩm nang/i); // "cẩm nang" not "cam nang"
    expect(siteConfig.description).toMatch(/đi đêm/i);   // "đi đêm" not "di dem"
  });

  it("description should not contain unaccented Vietnamese words", async () => {
    const { siteConfig } = await import("@/lib/site");

    // These are the un-accented versions that were in the bug
    expect(siteConfig.description).not.toContain("uu dai");
    expect(siteConfig.description).not.toContain("cam nang");
    expect(siteConfig.description).not.toContain("Kham pha");
  });
});

// -------------------------------------------------------------------
// Issue #2 — robots.ts must include a sitemap URL
// -------------------------------------------------------------------
describe("robots config", () => {
  it("should include a sitemap URL pointing to /sitemap.xml", async () => {
    // Dynamically import to get the live output
    const { default: robots } = await import("@/app/robots");
    const result = robots();

    expect(result).toHaveProperty("sitemap");
    expect(result.sitemap).toBeTruthy();

    const sitemapUrl = Array.isArray(result.sitemap)
      ? result.sitemap[0]
      : result.sitemap;

    expect(typeof sitemapUrl).toBe("string");
    expect(sitemapUrl).toContain("/sitemap.xml");
  });
});

// -------------------------------------------------------------------
// Issue #3 — sitemap.ts must export a revalidate constant
// -------------------------------------------------------------------
describe("sitemap module", () => {
  it("should export a revalidate constant to enable ISR caching", async () => {
    const sitemapModule = await import("@/app/sitemap");

    expect(sitemapModule).toHaveProperty("revalidate");
    expect(typeof sitemapModule.revalidate).toBe("number");
    // Should cache for at least 30 minutes
    expect(sitemapModule.revalidate).toBeGreaterThanOrEqual(1800);
  });
});

// -------------------------------------------------------------------
// Issue #4 — sitemap store/cast limit > 50
// -------------------------------------------------------------------
describe("sitemap discovery limits", () => {
  it("store and cast limit constants should be greater than 50", async () => {
    const { SITEMAP_STORE_LIMIT, SITEMAP_CAST_LIMIT } = await import(
      "@/lib/seo/sitemap-limits"
    );

    expect(SITEMAP_STORE_LIMIT).toBeGreaterThan(50);
    expect(SITEMAP_CAST_LIMIT).toBeGreaterThan(50);
  });
});
