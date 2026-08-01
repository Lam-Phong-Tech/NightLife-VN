/**
 * SeoMedium.test.ts
 *
 * TDD — RED phase tests for 3 Medium-priority SEO issues:
 * #10 — createPageMetadata() missing hreflang for en/ja/ko/zh
 * #11 — site.webmanifest wrong "purpose" field + missing PNG icons
 * #12 — /blog-chi-tiet/ route should not exist (deleted)
 */
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

// ─────────────────────────────────────────────────────────────────────────────
// Issue #10 — createPageMetadata() must include all 5 hreflang codes
// ─────────────────────────────────────────────────────────────────────────────
describe("createPageMetadata hreflang alternates", () => {
  it("should include hreflang alternates for en, ja, ko, zh-CN in addition to vi and x-default", async () => {
    const { createPageMetadata } = await import("@/lib/seo/page-metadata");
    const meta = createPageMetadata({
      title: "Test Page",
      description: "Test description",
      path: "/danh-sach-quan",
    });

    const languages = meta.alternates?.languages as Record<string, string> | undefined;

    expect(languages).toBeDefined();
    expect(languages).toHaveProperty("vi");
    expect(languages).toHaveProperty("en");      // ❌ currently MISSING
    expect(languages).toHaveProperty("ja");      // ❌ currently MISSING
    expect(languages).toHaveProperty("ko");      // ❌ currently MISSING
    expect(languages).toHaveProperty("zh-CN");   // ❌ currently MISSING
    expect(languages).toHaveProperty("x-default");
  });

  it("each language alternate URL should contain the canonical path", async () => {
    const { createPageMetadata } = await import("@/lib/seo/page-metadata");
    const meta = createPageMetadata({
      title: "Test",
      description: "Test",
      path: "/spa",
    });

    const languages = meta.alternates?.languages as Record<string, string>;

    expect(languages["en"]).toContain("/spa");
    expect(languages["ja"]).toContain("/spa");
    expect(languages["ko"]).toContain("/spa");
    expect(languages["zh-CN"]).toContain("/spa");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Issue #11 — site.webmanifest: purpose must be split + PNG icons required
// ─────────────────────────────────────────────────────────────────────────────
describe("site.webmanifest", () => {
  const manifestPath = path.resolve(
    __dirname,
    "../public/site.webmanifest"
  );

  it("manifest file should exist", () => {
    expect(fs.existsSync(manifestPath)).toBe(true);
  });

  it("no icon should have both 'any' and 'maskable' in the same purpose string", () => {
    const raw = fs.readFileSync(manifestPath, "utf-8");
    const manifest = JSON.parse(raw);

    for (const icon of manifest.icons as Array<{ purpose?: string }>) {
      // "any maskable" in a single string is invalid per PWA spec
      expect(icon.purpose).not.toMatch(/any\s+maskable|maskable\s+any/);
    }
  });

  it("should have at least one PNG icon for Android compatibility", () => {
    const raw = fs.readFileSync(manifestPath, "utf-8");
    const manifest = JSON.parse(raw);

    const hasPng = (manifest.icons as Array<{ type?: string }>).some(
      (icon) => icon.type === "image/png"
    );
    expect(hasPng).toBe(true); // ❌ currently only SVG
  });

  it("should have a maskable icon entry", () => {
    const raw = fs.readFileSync(manifestPath, "utf-8");
    const manifest = JSON.parse(raw);

    const hasMaskable = (manifest.icons as Array<{ purpose?: string }>).some(
      (icon) => icon.purpose === "maskable"
    );
    expect(hasMaskable).toBe(true);
  });

  it("should have an 'any' icon entry separate from maskable", () => {
    const raw = fs.readFileSync(manifestPath, "utf-8");
    const manifest = JSON.parse(raw);

    const hasAny = (manifest.icons as Array<{ purpose?: string }>).some(
      (icon) => icon.purpose === "any"
    );
    expect(hasAny).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Issue #12 — /blog-chi-tiet/ route must be deleted
// ─────────────────────────────────────────────────────────────────────────────
describe("/blog-chi-tiet legacy route", () => {
  it("blog-chi-tiet directory should NOT exist after deletion", () => {
    const routePath = path.resolve(
      __dirname,
      "../src/app/(public)/blog-chi-tiet"
    );
    expect(fs.existsSync(routePath)).toBe(false); // ❌ currently EXISTS
  });

  it("/blog-chi-tiet should be listed in robots.txt disallow to prevent any residual crawling", async () => {
    const { default: robots } = await import("@/app/robots");
    const result = robots();
    const disallowList = (result.rules as Array<{ disallow?: string[] }>)[0]?.disallow ?? [];
    expect(disallowList).toContain("/blog-chi-tiet");
  });
});
