import { describe, expect, it } from "vitest";

import {
  hasNativeRouteLocale,
  isPublicHomepagePath,
  shouldSkipLanguageTranslation,
} from "@/components/i18n/ClientLanguageTranslator";
import { shouldEnablePublicTranslationFallback } from "@/components/i18n/PublicTranslationFallback";
import type { NightlifeHostKind } from "@/lib/auth/hosts";

describe("client language translator portal isolation", () => {
  it.each([
    ["admin", "/", "admin.vietyoru.com"],
    ["partner", "/", "partner.vietyoru.com"],
    ["auth", "/", "auth.vietyoru.com"],
    ["admin", "/admin", "admin.vietyoru.com"],
    ["partner", "/partner", "partner.vietyoru.com"],
  ] satisfies [NightlifeHostKind, string, string][])(
    "disables translation for the %s portal at %s",
    (hostKind, pathname, hostname) => {
      expect(shouldSkipLanguageTranslation(pathname, hostKind, hostname)).toBe(true);
    },
  );

  it.each([
    ["unknown", "/", "admin.preview.example.com"],
    ["unknown", "/", "partner.preview.example.com"],
  ] satisfies [NightlifeHostKind, string, string][])(
    "falls back to the %s host name when hostKind is not configured",
    (hostKind, pathname, hostname) => {
      expect(shouldSkipLanguageTranslation(pathname, hostKind, hostname)).toBe(true);
    },
  );

  it.each([
    ["public", "/admin", "vietyoru.com"],
    ["public", "/partner", "vietyoru.com"],
  ] satisfies [NightlifeHostKind, string, string][])(
    "keeps the pathname safeguard for %s routes",
    (hostKind, pathname, hostname) => {
      expect(shouldSkipLanguageTranslation(pathname, hostKind, hostname)).toBe(true);
    },
  );

  it.each([
    ["public", "/", "vietyoru.com"],
  ] satisfies [NightlifeHostKind, string, string][])(
    "keeps translation enabled for the %s portal",
    (hostKind, pathname, hostname) => {
      expect(shouldSkipLanguageTranslation(pathname, hostKind, hostname)).toBe(false);
    },
  );
});

describe("homepage translation isolation", () => {
  it.each(["/", "/vi", "/en/", "/ja", "/ko", "/zh/"])(
    "recognizes %s as a localized homepage",
    (pathname) => {
      expect(isPublicHomepagePath(pathname)).toBe(true);
    },
  );

  it("does not classify nested routes as the homepage", () => {
    expect(isPublicHomepagePath("/ja/stores")).toBe(false);
  });
});

describe("native locale rendering", () => {
  it.each(["/vi/stores", "/en/stores", "/ja/stores", "/ko/tour", "/zh/blog"])(
    "does not run the DOM translator for %s",
    (pathname) => {
      expect(hasNativeRouteLocale(pathname)).toBe(true);
    },
  );

  it("keeps unprefixed legacy routes eligible for the fallback", () => {
    expect(hasNativeRouteLocale("/stores")).toBe(false);
  });

  it.each([
    "/vi/stores",
    "/en/stores/fuji",
    "/ja/stores",
    "/ja/stores/twenty-two-private-lounge",
    "/ko/casts/hina",
    "/zh/blog",
  ])("never enables the DOM-rewriting Google fallback for %s", (pathname) => {
    expect(
      shouldEnablePublicTranslationFallback(pathname, "public", "vietyoru.com"),
    ).toBe(false);
  });

  it("retains the fallback only for an unprefixed legacy public route", () => {
    expect(
      shouldEnablePublicTranslationFallback("/stores", "public", "vietyoru.com"),
    ).toBe(true);
  });
});
