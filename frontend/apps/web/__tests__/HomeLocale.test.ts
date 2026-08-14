import { describe, expect, it } from "vitest";
import {
  getFilterAreaLabel,
  getFilterCategoryLabel,
  getFilterCityLabel,
} from "../src/lib/i18n/filter-taxonomy";

describe("homepage locale labels", () => {
  it("renders common ranking and recommendation locations in Japanese", () => {
    expect(getFilterCityLabel("hn", "ja")).toBe("ハノイ");
    expect(getFilterCityLabel("hcm", "ja")).toBe("ホーチミン市");
    expect(getFilterAreaLabel("Phường Sài Gòn", "ja")).toBe("サイゴン区");
    expect(getFilterAreaLabel("Phường Giảng Võ", "ja")).toBe("ザンボー区");
    expect(getFilterAreaLabel("Cống Vị", "ja")).toBe("コンビ");
  });

  it("localizes category labels without a network lookup", () => {
    expect(getFilterCategoryLabel("RESTAURANT", "ja")).toBe("レストラン");
    expect(getFilterCategoryLabel("MASSAGE_SPA", "ja")).toBe("マッサージ");
  });
});
