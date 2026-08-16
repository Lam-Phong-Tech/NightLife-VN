import { describe, expect, it } from "vitest";
import {
  getFilterAreaLabel,
  getFilterCategoryLabel,
  getFilterCityLabel,
  getPreferredStoreAreaName,
} from "../src/lib/i18n/filter-taxonomy";

describe("homepage locale labels", () => {
  it("renders common ranking and recommendation locations in Japanese", () => {
    expect(getFilterCityLabel("hn", "ja")).toBe("ハノイ");
    expect(getFilterCityLabel("hcm", "ja")).toBe("ホーチミン市");
    expect(getFilterCityLabel("hp", "ja")).toBe("ハイフォン");
    expect(getFilterCityLabel("dn", "ja")).toBe("ダナン");
    expect(getFilterAreaLabel("Phường Sài Gòn", "ja")).toBe("サイゴン区");
    expect(getFilterAreaLabel("Phường Giảng Võ", "ja")).toBe("ザンボー区");
    expect(getFilterAreaLabel("Cống Vị", "ja")).toBe("コンビ");
    expect(getFilterAreaLabel("Hồng Bàng", "ja")).toBe("ホンバン");
    expect(getFilterAreaLabel("Hải Châu", "ja")).toBe("ハイチャウ");
    expect(getFilterAreaLabel("Sơn Trà", "ja")).toBe("ソンチャ");
  });

  it("localizes category labels without a network lookup", () => {
    expect(getFilterCategoryLabel("RESTAURANT", "ja")).toBe("レストラン");
    expect(getFilterCategoryLabel("MASSAGE_SPA", "ja")).toBe("マッサージ");
  });
  it("localizes dynamic admin ward labels without a network lookup", () => {
    expect(getFilterAreaLabel("Phường Ba Đình", "en")).toBe("Ba Dinh Ward");
    expect(getFilterAreaLabel("Phường Ba Đình", "ja")).toBe("Ba Dinh区");
    expect(getFilterAreaLabel("Phường Bình Thạnh", "ko")).toBe("Binh Thanh 구");
    expect(getFilterAreaLabel("Phường Tân Định", "zh")).toBe("Tan Dinh坊");
    expect(getFilterAreaLabel("Phường Ba Đình", "vi")).toBe("Phường Ba Đình");
  });

  it("prefers a store ward over a generic area label for booking metadata", () => {
    const area = getPreferredStoreAreaName({
      ward: "Phường Sài Gòn",
      areaName: "Tổng hợp",
      district: "Quận 1",
    });

    expect(area).toBe("Phường Sài Gòn");
    expect(getFilterAreaLabel(area ?? "", "ja")).toBe("サイゴン区");
  });
});
