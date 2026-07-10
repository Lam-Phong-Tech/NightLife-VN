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

  it("translates audited public and member screen copy without per-page patches", () => {
    expect(translateText("Email chưa đúng định dạng.", "ja")).toBe(
      "メールアドレスの形式が正しくありません。",
    );
    expect(translateText("Email không được vượt quá 254 ký tự.", "ko")).toBe(
      "이메일은 254자를 초과할 수 없습니다.",
    );
    expect(
      translateText("Bạn chưa lấy mã nào. Khám phá Coupon Hot để nhận ưu đãi ngay.", "zh"),
    ).toBe("你还没有领取任何码。立即探索热门优惠券领取优惠。");
    expect(translateText("Blog và cẩm nang nightlife | Vietyoru", "en")).toBe(
      "Nightlife blog and guides | Vietyoru",
    );
    expect(
      translateText("Cast này không tồn tại hoặc chưa được công khai trên Vietyoru.", "ja"),
    ).toBe("このキャストは存在しないか、まだVietyoruで公開されていません。");
    expect(translateText("Coupon đã lưu", "ko")).toBe("저장한 쿠폰");
    expect(translateText("Đặt bàn VIP", "ja")).toBe("VIP席を予約");
    expect(translateText("VIP sofa · Coupon", "ja")).toBe("VIPソファ · クーポン");
    expect(translateText("Cast Hoàn Kiếm", "ja")).toBe("ホアンキエムのキャスト");
    expect(
      translateText("Dạ chào anh, Vietyoru Hỗ trợ có thể giúp gì cho anh ạ?", "en"),
    ).toBe("Hello, Vietyoru Support here. How can we help you?");
    expect(
      translateText(
        "Sakura Lounge vẫn còn bàn khung 21:00 cho 4 khách ạ. Em giữ chỗ trước cho anh nhé?",
        "ja",
      ),
    ).toBe("Sakura Loungeは21:00に4名席がまだあります。仮押さえしましょうか？");
    expect(translateText("Store gallery lightbox", "zh")).toBe("店铺图库放大查看");
  });

  it("translates notification, footer, and discovery list leftovers", () => {
    expect(translateText("Thông báo", "ja")).toBe("通知");
    expect(translateText("Đánh dấu tất cả đã đọc", "ja")).toBe("すべて既読にする");
    expect(translateText("Hóa đơn", "ja")).toBe("請求書");
    expect(translateText("Đặt chỗ", "ja")).toBe("予約");
    expect(translateText("HÔM NAY", "ja")).toBe("今日");
    expect(translateText("Xem lịch đặt", "ja")).toBe("予約を見る");
    expect(translateText("5 giờ", "ja")).toBe("5時間");
    expect(
      translateText(
        "Lịch đặt tại 東京キッチン — Tokyo Kitchen đã được ghi nhận. Admin sẽ xác nhận sớm.",
        "ja",
      ),
    ).toBe("東京キッチン — 東京キッチンの予約リクエストを受け付けました。管理者がまもなく確認します。");
    expect(translateText("Đăng ký đối tác", "ja")).toBe("パートナー登録");
    expect(translateText("Chính sách hoạt động", "ja")).toBe("運営ポリシー");
    expect(translateText("© 2026 Vietyoru. Bảo lưu mọi quyền.", "ja")).toBe(
      "© 2026 Vietyoru. 無断転載を禁じます。",
    );
    expect(translateText("Sân khấu DJ", "ja")).toBe("DJステージ");
    expect(translateText("Mở đến 02:00", "ja")).toBe("02:00まで営業");
    expect(translateText("Đang mở đến 02:00", "ja")).toBe("02:00まで営業");
    expect(translateText("Mở muộn", "ja")).toBe("深夜営業");
    expect(translateText("Gói đôi", "ja")).toBe("ペアプラン");
    expect(translateText("Set Nhật Bản", "ja")).toBe("日本セット");
    expect(translateText("Opera Spa Hải Phòng", "ja")).toBe("Opera スパ ハイフォン");
    expect(translateText("13 cast · Hà Nội", "ja")).toBe("13人のキャスト · ハノイ");
    expect(translateText("WEEKEND DEAL · NIGHTLIFE", "ja")).toBe("週末ディール · NIGHTLIFE");
    expect(translateText("Ưu đãi cuối tuần - giảm đến 30%", "ja")).toBe(
      "週末特典 - 最大30%オフ",
    );
    expect(
      translateText("Lưu mã ưu đãi trước khi đặt bàn để không bỏ lỡ deal tốt.", "ja"),
    ).toBe("お得な特典を逃さないよう、予約前にクーポンコードを保存してください。");
    expect(translateText("Đã gửi hóa đơn", "ja")).toBe("請求書を送信しました");
    expect(translateText("Đặt bàn theo cast thành công", "ja")).toBe(
      "キャスト指名予約を送信しました",
    );
    expect(
      translateText(
        "Hóa đơn BILL-20260710-FCBF2405 tại dfghj (400.000 ₫) đã được gửi, đang chờ Admin duyệt.",
        "ja",
      ),
    ).toBe("dfghjの請求書 BILL-20260710-FCBF2405 (400.000 ₫) を送信しました。管理者の確認待ちです。");
    expect(
      translateText(
        "Yêu cầu đặt Yuri @ Opera Spa Hải Phòng lúc 19:00 10-07 đã được ghi nhận. Admin sẽ xác nhận sớm.",
        "ja",
      ),
    ).toBe(
      "Yuri @ Opera スパ ハイフォンの19:00 10-07の予約リクエストを受け付けました。管理者がまもなく確認します。",
    );
    expect(translateText("2 thông báo chưa đọc", "ja")).toBe("未読通知 2件");
    expect(translateText("Vừa xong", "ja")).toBe("たった今");
  });

  it("translates deals and blog page leftovers", () => {
    expect(translateText("Ưu đãi đêm nay", "ja")).toBe("今夜の特典");
    expect(
      translateText(
        "Coupon & khuyến mãi từ các quán đối tác, dẫn thẳng về trang đặt bàn để nhận QR.",
        "ja",
      ),
    ).toBe("提携店舗のクーポンとキャンペーンを、QR受け取り用の予約ページへ直接案内します。");
    expect(translateText("Tìm quán, khu vực hoặc ưu đãi...", "ja")).toBe(
      "店舗、エリア、特典を検索...",
    );
    expect(translateText("Bộ lọc ưu đãi", "ja")).toBe("特典フィルター");
    expect(translateText("Đang nổi bật", "ja")).toBe("注目中");
    expect(translateText("Loại ưu đãi", "ja")).toBe("特典タイプ");
    expect(translateText("0 ưu đãi phù hợp", "ja")).toBe("一致する特典 0件");
    expect(translateText("HSD 10/07", "ja")).toBe("有効期限 10/07");
    expect(translateText("Xóa lọc", "ja")).toBe("フィルターをクリア");
    expect(translateText("Chưa có coupon phù hợp", "ja")).toBe(
      "条件に合うクーポンはありません",
    );
    expect(translateText("Cẩm nang nightlife cho mỗi lần xuống phố", "ja")).toBe(
      "夜の外出に役立つナイトライフガイド",
    );
    expect(translateText("Tất cả tag", "ja")).toBe("すべてのタグ");
    expect(translateText("Lọc", "ja")).toBe("絞り込む");
    expect(translateText("Nổi bật · Cẩm nang khu vực", "ja")).toBe(
      "注目 · エリアガイド",
    );
    expect(translateText("6 phút đọc", "ja")).toBe("6分で読めます");
    expect(translateText("Đọc tiếp", "ja")).toBe("続きを読む");
    expect(translateText("Chưa có bài viết phù hợp.", "ja")).toBe(
      "条件に合う記事はありません。",
    );
    expect(translateText("Bản đồ Quận 1 về đêm cho khách mới", "ja")).toBe(
      "初めての方向け 1区ナイトマップ",
    );
  });

  it("translates blog detail and nested blog route copy", () => {
    expect(translateText("Bài liên quan", "ja")).toBe("関連記事");
    expect(
      translateText(
        "Giá, tình trạng bàn, cast và ưu đãi trong bài chỉ là tham khảo. Thông tin cuối cùng sẽ được admin xác nhận khi khách gửi yêu cầu đặt chỗ.",
        "ja",
      ),
    ).toBe(
      "記事内の料金、席の空き状況、キャスト、特典は参考情報です。最終情報は、予約リクエスト送信時に管理者が確認します。",
    );
    expect(translateText("Không tìm thấy bài viết", "ja")).toBe("記事が見つかりません");
    expect(translateText("Nháp", "ja")).toBe("下書き");
    expect(translateText("Không tìm thấy chủ đề blog", "ja")).toBe(
      "ブログトピックが見つかりません",
    );
    expect(translateText("Không tìm thấy tag blog", "ja")).toBe(
      "ブログタグが見つかりません",
    );
    expect(
      translateText(
        "Các bài viết được nhóm theo chủ đề để khách chọn nhanh nội dung phù hợp trước khi đặt chỗ.",
        "ja",
      ),
    ).toBe("記事はトピック別に整理されているため、予約前に必要な内容をすぐ選べます。");
    expect(
      translateText(
        "Các bài viết được gắn cùng tag để khách tìm nhanh theo nhu cầu đặt chỗ, khu vực hoặc ưu đãi.",
        "ja",
      ),
    ).toBe("同じタグの記事から、予約目的、エリア、特典に合わせてすばやく探せます。");
  });
});
