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

  it("translates remaining member, venue, cast, and auth screens", () => {
    expect(translateText("Áp dụng JA", "ja")).toBe("JAを適用");
    expect(translateText("Xem danh sách quán", "ja")).toBe("店舗一覧を見る");
    expect(
      translateText("Coupon & khuyến mãi từ các quán đối tác · Hà Nội", "ja"),
    ).toBe("提携店舗のクーポン・キャンペーン · ハノイ");
    expect(translateText("Guest Discount 5%", "ja")).toBe("ゲスト割引 5%");
    expect(translateText("Club Lumiere · Tây Hồ", "ja")).toBe(
      "クラブ・リュミエール · タイホー",
    );
    expect(translateText("Thư viện ảnh", "ja")).toBe("フォトギャラリー");
    expect(translateText("3 ảnh", "ja")).toBe("3枚の写真");
    expect(translateText("1 nội dung", "ja")).toBe("1件");
    expect(translateText("Đang mở · 19:00 - 04:00", "ja")).toBe(
      "営業中 · 19:00 - 04:00",
    );
    expect(translateText("#BK-123456 · Admin đang điều phối", "ja")).toBe(
      "#BK-123456 · 管理者が調整中",
    );
    expect(translateText("Quán đang thuộc về", "ja")).toBe("所属店舗");
    expect(translateText("Cast tương tự", "ja")).toBe("似ているキャスト");
    expect(translateText("Đặt cast này", "ja")).toBe("このキャストを予約");
    expect(translateText("Nói tiếng Anh", "ja")).toBe("英語対応");
    expect(translateText("Nhật Bản · Việt Nam", "ja")).toBe("日本 · ベトナム");
    expect(translateText("Quên mật khẩu?", "ja")).toBe("パスワードをお忘れですか？");
    expect(translateText("Gửi mã xác nhận", "ja")).toBe("確認コードを送信");
    expect(translateText("Tạo mật khẩu mới", "ja")).toBe("新しいパスワードを作成");
  });

  it("translates admin-fed mixed public content with shared fallback patterns", () => {
    expect(translateText("Vi vu hôm nay", "ja")).toBe("今夜のおすすめ");
    expect(translateText("Chưa có Video Hot cho khu vực này.", "ja")).toBe(
      "このエリアの注目動画はまだありません。",
    );
    expect(translateText("東京キッチン — Set dinner đêm", "ja")).toBe(
      "東京キッチン — 夜のセットディナー",
    );
    expect(translateText("Quận 2", "ja")).toBe("2区");
    expect(translateText("District 3 · Ho Chi Minh City · Restaurant", "ja")).toBe(
      "3区 · ホーチミン市 · レストラン",
    );
    expect(translateText("Concierge cho một đêm trọn vẹn", "ko")).toBe(
      "완벽한 밤을 위한 컨시어지",
    );
  });
});
