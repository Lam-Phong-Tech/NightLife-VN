import { describe, expect, it } from "vitest";

import { translateText } from "@/lib/i18n/client-translations";

describe("client translations", () => {
  it("translates dynamic discovery terms and counters", () => {
    expect(translateText("Club Lumière · Tây Hồ", "ja")).toBe(
      "クラブ・リュミエール · タイホー",
    );
    expect(translateText("KTV Hoàng Gia · Kim Mã", "ja")).toBe(
      "ホアンザーKTV · キムマー",
    );
    expect(translateText("Neon Club · HN", "ko")).toBe("네온 클럽 · 하노이");
    expect(translateText("Xem 11 cast", "ja")).toBe("11人のキャストを見る");
    expect(translateText("11 cast", "zh")).toBe("11 位 Cast");
    expect(translateText("Sắp xếp: Mới nhất", "en")).toBe("Sort: Newest");
    expect(translateText("2 bộ lọc đang bật", "ko")).toBe(
      "필터 2개 적용 중",
    );
  });

  it("translates filter and category labels used across public screens", () => {
    expect(translateText("Có ưu đãi đang chạy", "ja")).toBe(
      "実施中の特典あり",
    );
    expect(translateText("Còn lịch trống tuần này", "zh")).toBe(
      "本周仍有空档",
    );
    expect(translateText("Karaoke / KTV", "ko")).toBe("노래방 / KTV");
    expect(translateText("Massage / Spa", "ja")).toBe("マッサージ / スパ");
    expect(translateText("Bộ lọc", "ja")).toBe("フィルター");
    expect(translateText("Gợi ý cast", "zh")).toBe("推荐 Cast");
    expect(translateText("Chưa có cast phù hợp", "en")).toBe("No matching Cast");
    expect(translateText("nhân viên a", "ja")).toBe("スタッフA");
    expect(translateText("quán A", "en")).toBe("Venue A");
  });
});
