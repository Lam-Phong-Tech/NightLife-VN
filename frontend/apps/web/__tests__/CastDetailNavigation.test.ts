import { describe, expect, it } from "vitest";

import {
  getCastDetailBackHref,
  inferCastDetailSource,
  isCastDetailPath,
  parseCastDetailSource,
  sanitizeCastStoreReturnHref,
} from "@/lib/cast-detail-navigation";

describe("cast detail navigation", () => {
  it("accepts only the supported navigation sources", () => {
    expect(parseCastDetailSource("home")).toBe("home");
    expect(parseCastDetailSource("casts")).toBe("casts");
    expect(parseCastDetailSource("ranking")).toBe("ranking");
    expect(parseCastDetailSource("search")).toBe("search");
    expect(parseCastDetailSource("store")).toBe("store");
    expect(parseCastDetailSource("external")).toBeNull();
    expect(parseCastDetailSource(null)).toBeNull();
  });

  it("infers source from the page that opened a cast detail", () => {
    expect(inferCastDetailSource("/ja")).toBe("home");
    expect(inferCastDetailSource("/ja/casts")).toBe("casts");
    expect(inferCastDetailSource("/ja/casts", true)).toBe("search");
    expect(inferCastDetailSource("/ja/danh-sach-cast")).toBe("casts");
    expect(inferCastDetailSource("/ja/xep-hang")).toBe("ranking");
    expect(inferCastDetailSource("/ja/stores/grace-the-class")).toBe("store");
  });

  it("recognizes localized and unlocalized cast detail paths", () => {
    expect(isCastDetailPath("/casts/hina")).toBe(true);
    expect(isCastDetailPath("/ja/casts/hina")).toBe(true);
    expect(isCastDetailPath("/ja/casts")).toBe(false);
  });

  it("accepts only safe internal store-detail return hrefs", () => {
    expect(sanitizeCastStoreReturnHref("/ja/stores/grace-the-class?from=home")).toBe(
      "/ja/stores/grace-the-class?from=home",
    );
    expect(sanitizeCastStoreReturnHref("/stores/grace-the-class")).toBe(
      "/stores/grace-the-class",
    );
    expect(sanitizeCastStoreReturnHref("/ja/stores")).toBeNull();
    expect(sanitizeCastStoreReturnHref("https://example.com/ja/stores/grace-the-class")).toBeNull();
    expect(sanitizeCastStoreReturnHref("//example.com/ja/stores/grace-the-class")).toBeNull();
  });

  it("resolves the localized back destination for each source", () => {
    const detailPath = "/ja/casts/hina";

    expect(getCastDetailBackHref(detailPath, "home")).toBe("/ja");
    expect(getCastDetailBackHref(detailPath, "casts")).toBe("/ja/casts");
    expect(getCastDetailBackHref(detailPath, "search")).toBe("/ja/casts");
    expect(getCastDetailBackHref(detailPath, "ranking")).toBe("/ja/xep-hang");
    expect(
      getCastDetailBackHref(
        detailPath,
        "store",
        "/ja/stores/grace-the-class?from=home",
      ),
    ).toBe("/ja/stores/grace-the-class?from=home");
    expect(getCastDetailBackHref(detailPath, "store", "https://example.com/stores/grace")).toBe(
      "/ja/casts",
    );
    expect(getCastDetailBackHref(detailPath, null)).toBe("/ja/casts");
  });
});
