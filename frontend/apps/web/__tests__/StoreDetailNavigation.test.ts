import { describe, expect, it } from "vitest";

import {
  getStoreDetailBackHref,
  inferStoreDetailSource,
  isStoreDetailPath,
  parseStoreDetailSource,
} from "@/lib/store-detail-navigation";

describe("store detail navigation", () => {
  it("accepts only the supported navigation sources", () => {
    expect(parseStoreDetailSource("home")).toBe("home");
    expect(parseStoreDetailSource("stores")).toBe("stores");
    expect(parseStoreDetailSource("ranking")).toBe("ranking");
    expect(parseStoreDetailSource("search")).toBe("search");
    expect(parseStoreDetailSource("spa")).toBe("spa");
    expect(parseStoreDetailSource("restaurant")).toBe("restaurant");
    expect(parseStoreDetailSource("external")).toBeNull();
    expect(parseStoreDetailSource(null)).toBeNull();
  });

  it("infers source from the page that opened a store detail", () => {
    expect(inferStoreDetailSource("/ja")).toBe("home");
    expect(inferStoreDetailSource("/ja/stores")).toBe("stores");
    expect(inferStoreDetailSource("/ja/stores", true)).toBe("search");
    expect(inferStoreDetailSource("/ja/xep-hang")).toBe("ranking");
    expect(inferStoreDetailSource("/ja/spa")).toBe("spa");
    expect(inferStoreDetailSource("/vi/nha-hang")).toBe("restaurant");
  });

  it("recognizes localized and unlocalized store detail paths", () => {
    expect(isStoreDetailPath("/stores/grace-the-class")).toBe(true);
    expect(isStoreDetailPath("/ja/stores/grace-the-class")).toBe(true);
    expect(isStoreDetailPath("/ja/stores")).toBe(false);
  });

  it("resolves the localized back destination for each source", () => {
    const detailPath = "/ja/stores/grace-the-class";

    expect(getStoreDetailBackHref(detailPath, "home")).toBe("/ja");
    expect(getStoreDetailBackHref(detailPath, "stores")).toBe("/ja/stores");
    expect(getStoreDetailBackHref(detailPath, "search")).toBe("/ja/stores");
    expect(getStoreDetailBackHref(detailPath, "ranking")).toBe("/ja/xep-hang");
    expect(getStoreDetailBackHref(detailPath, "spa")).toBe("/ja/spa");
    expect(getStoreDetailBackHref(detailPath, "restaurant")).toBe("/ja/nha-hang");
    expect(getStoreDetailBackHref(detailPath, null)).toBe("/ja/stores");
  });

  it("keeps the fixed-category listing in the massage and restaurant flows", () => {
    expect(inferStoreDetailSource("/vi/spa")).toBe("spa");
    expect(getStoreDetailBackHref("/vi/stores/fuji-spa", "spa")).toBe("/vi/spa");

    expect(inferStoreDetailSource("/vi/nha-hang")).toBe("restaurant");
    expect(getStoreDetailBackHref("/vi/stores/example-restaurant", "restaurant")).toBe(
      "/vi/nha-hang",
    );
  });
});
