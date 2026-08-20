import { describe, expect, it } from "vitest";

import {
  isBookingDetailReturnPath,
  isBookingPath,
  sanitizeBookingReturnHref,
} from "@/lib/booking-return-navigation";

describe("booking return navigation", () => {
  it("recognizes localized and unlocalized booking routes", () => {
    expect(isBookingPath("/dat-cho")).toBe(true);
    expect(isBookingPath("/ja/dat-cho")).toBe(true);
    expect(isBookingPath("/ja/stores/grace-the-class")).toBe(false);
  });

  it("accepts store and cast detail pages as booking return destinations", () => {
    expect(isBookingDetailReturnPath("/ja/stores/grace-the-class")).toBe(true);
    expect(isBookingDetailReturnPath("/vi/casts/hina")).toBe(true);
    expect(isBookingDetailReturnPath("/ja/stores")).toBe(false);
  });

  it("preserves the store detail source when returning from booking", () => {
    expect(
      sanitizeBookingReturnHref("/ja/stores/grace-the-class?from=home"),
    ).toBe("/ja/stores/grace-the-class?from=home");

    expect(
      sanitizeBookingReturnHref("/vi/stores/fuji-spa?from=spa"),
    ).toBe("/vi/stores/fuji-spa?from=spa");
  });

  it("preserves the nested cast-to-store chain through booking", () => {
    const returnHref =
      "/ja/casts/hina?from=store&returnTo=%2Fja%2Fstores%2Fgrace-the-class%3Ffrom%3Dhome";

    expect(sanitizeBookingReturnHref(returnHref)).toBe(returnHref);
  });

  it("rejects external or non-detail return destinations", () => {
    expect(sanitizeBookingReturnHref("https://example.com/ja/stores/grace-the-class")).toBeNull();
    expect(sanitizeBookingReturnHref("//example.com/ja/stores/grace-the-class")).toBeNull();
    expect(sanitizeBookingReturnHref("/ja/stores")).toBeNull();
    expect(sanitizeBookingReturnHref("/ja")).toBeNull();
  });
});
