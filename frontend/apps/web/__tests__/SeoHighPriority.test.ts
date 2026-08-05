/**
 * SeoHighPriority.test.ts
 *
 * TDD — RED phase tests for 4 High-priority SEO issues:
 * #6 — Store/Cast detail pages missing explicit robots: { index, follow }
 * #7 — Tour detail canonical uses numeric ID, not slug
 * #8 — Tour detail missing robots + twitter:card fields
 * #9 — Tour listing /tour missing hreflang language alternates
 */
import { describe, it, expect } from "vitest";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers — build a minimal fake tour / store / cast that matches API shapes
// ─────────────────────────────────────────────────────────────────────────────

const makeTour = (overrides: Record<string, unknown> = {}) => ({
  id: "42",
  slug: "hanoi-bar-hopping-night-tour",
  title: "Hanoi Bar Hopping",
  subtitle: "Best bars in Hanoi in one night",
  coverUrl: "https://example.com/cover.jpg",
  stops: [],
  ...overrides,
});

const makeStore = (overrides: Record<string, unknown> = {}) => ({
  slug: "neon-club",
  seo: {
    title: "Neon Club | Bar Hà Nội | Vietyoru",
    description: "Thông tin quán Neon Club trên Vietyoru.",
    canonicalPath: "/stores/neon-club",
    ogImage: "https://example.com/neon.jpg",
    noindex: false,
  },
  ...overrides,
});

const makeCast = (overrides: Record<string, unknown> = {}) => ({
  slug: "aya-velvet",
  seo: {
    title: "Aya Velvet | Cast | Vietyoru",
    description: "Hồ sơ cast Aya Velvet trên Vietyoru.",
    canonicalPath: "/casts/aya-velvet",
    ogImage: "https://example.com/aya.jpg",
    noindex: false,
  },
  ...overrides,
});

// ─────────────────────────────────────────────────────────────────────────────
// Issue #6 — Store detail must include robots: { index, follow }
// ─────────────────────────────────────────────────────────────────────────────
describe("store detail generateMetadata", () => {
  it("should include explicit robots index:true follow:true for a normal (indexable) store", async () => {
    const { buildStoreMetadata } = await import("@/lib/seo/store-metadata");
    const store = makeStore();
    const meta = buildStoreMetadata(store as Parameters<typeof buildStoreMetadata>[0]);

    expect(meta).toHaveProperty("robots");
    expect(meta.robots).toMatchObject({ index: true, follow: true });
  });

  it("should set robots noindex when store.seo.noindex is true", async () => {
    const { buildStoreMetadata } = await import("@/lib/seo/store-metadata");
    const store = makeStore({ seo: { ...makeStore().seo, noindex: true } });
    const meta = buildStoreMetadata(store as Parameters<typeof buildStoreMetadata>[0]);

    expect(meta.robots).toMatchObject({ index: false, follow: false });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Issue #6 — Cast detail must include robots: { index, follow }
// ─────────────────────────────────────────────────────────────────────────────
describe("cast detail generateMetadata", () => {
  it("should include explicit robots index:true follow:true for a normal (indexable) cast", async () => {
    const { buildCastMetadata } = await import("@/lib/seo/cast-metadata");
    const cast = makeCast();
    const meta = buildCastMetadata(cast as Parameters<typeof buildCastMetadata>[0]);

    expect(meta).toHaveProperty("robots");
    expect(meta.robots).toMatchObject({ index: true, follow: true });
  });

  it("should set robots noindex when cast.seo.noindex is true", async () => {
    const { buildCastMetadata } = await import("@/lib/seo/cast-metadata");
    const cast = makeCast({ seo: { ...makeCast().seo, noindex: true } });
    const meta = buildCastMetadata(cast as Parameters<typeof buildCastMetadata>[0]);

    expect(meta.robots).toMatchObject({ index: false, follow: false });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Issue #7 — Tour detail canonical must use slug, not numeric ID
// ─────────────────────────────────────────────────────────────────────────────
describe("tour detail canonical path", () => {
  it("should use tour.slug in the canonical URL, not tour.id", async () => {
    const { buildTourMetadata } = await import("@/lib/seo/tour-metadata");
    const tour = makeTour();
    const meta = buildTourMetadata(tour as Parameters<typeof buildTourMetadata>[0]);

    const canonical =
      typeof meta.alternates?.canonical === "string"
        ? meta.alternates.canonical
        : "";

    // Must contain the slug keyword, NOT the bare numeric id
    expect(canonical).toContain("hanoi-bar-hopping-night-tour");
    expect(canonical).not.toMatch(/\/tour\/\d+$/); // /tour/42 pattern is forbidden
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Issue #8 — Tour detail must have robots + twitter:card
// ─────────────────────────────────────────────────────────────────────────────
describe("tour detail metadata completeness", () => {
  it("should include robots: { index, follow }", async () => {
    const { buildTourMetadata } = await import("@/lib/seo/tour-metadata");
    const meta = buildTourMetadata(makeTour() as Parameters<typeof buildTourMetadata>[0]);

    expect(meta).toHaveProperty("robots");
    expect(meta.robots).toMatchObject({ index: true, follow: true });
  });

  it("should include twitter card configuration", async () => {
    const { buildTourMetadata } = await import("@/lib/seo/tour-metadata");
    const meta = buildTourMetadata(makeTour() as Parameters<typeof buildTourMetadata>[0]);

    expect(meta).toHaveProperty("twitter");
    expect((meta.twitter as { card?: string })?.card).toBe("summary_large_image");
    expect(meta.twitter?.title).toBeTruthy();
    expect(meta.twitter?.description).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Issue #9 — Tour listing /tour must have hreflang language alternates
// ─────────────────────────────────────────────────────────────────────────────
describe("tour listing metadata", () => {
  it("should include hreflang alternates for all 5 supported languages", async () => {
    const { TOUR_PAGE_METADATA } = await import("@/lib/seo/tour-listing-metadata");
    const languages = TOUR_PAGE_METADATA.alternates?.languages as Record<string, string> | undefined;

    expect(languages).toBeDefined();
    // Must have all 5 language codes
    expect(languages).toHaveProperty("vi");
    expect(languages).toHaveProperty("en");
    expect(languages).toHaveProperty("ja");
    expect(languages).toHaveProperty("ko");
    expect(languages).toHaveProperty("zh-CN"); // languageHtmlLang maps zh → "zh-CN"
    expect(languages).toHaveProperty("x-default");
  });

  it("each hreflang alternate must contain the /tour path", async () => {
    const { TOUR_PAGE_METADATA } = await import("@/lib/seo/tour-listing-metadata");
    const languages = TOUR_PAGE_METADATA.alternates?.languages as Record<string, string>;

    for (const [lang, url] of Object.entries(languages)) {
      if (lang === "x-default") continue;
      expect(url).toContain("/tour");
    }
  });
});
