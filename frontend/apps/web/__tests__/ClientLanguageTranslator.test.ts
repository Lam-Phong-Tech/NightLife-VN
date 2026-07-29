import { describe, expect, it } from "vitest";

import { shouldSkipLanguageTranslation } from "@/components/i18n/ClientLanguageTranslator";
import type { NightlifeHostKind } from "@/lib/auth/hosts";

describe("client language translator portal isolation", () => {
  it.each([
    ["admin", "/", "admin.vietyoru.com"],
    ["partner", "/", "partner.vietyoru.com"],
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
    ["auth", "/", "auth.vietyoru.com"],
  ] satisfies [NightlifeHostKind, string, string][])(
    "keeps translation enabled for the %s portal",
    (hostKind, pathname, hostname) => {
      expect(shouldSkipLanguageTranslation(pathname, hostKind, hostname)).toBe(false);
    },
  );
});
