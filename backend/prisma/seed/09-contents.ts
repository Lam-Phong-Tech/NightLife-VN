import { PrismaClient, User } from '@prisma/client';

/**
 * 5 Content items:
 *   3 BLOG posts — trilingual (JP/EN/VN) with i18n metadata & SEO keywords
 *   2 POLICY pages — Privacy Policy + Terms of Service (trilingual body)
 *
 * Per spec CON-01/02: Blog for SEO & promotion
 * Per spec CON-04: Privacy & Terms policies
 */

interface ContentSeed {
  slug: string;
  title: string;
  type: 'BLOG' | 'POLICY';
  excerpt: string | null;
  body: string;
  metadata: Record<string, unknown>;
}

const CONTENTS: ContentSeed[] = [
  // ═══════════════ BLOG POSTS ═══════════════
  {
    slug: 'hcm-nightlife-guide',
    title: 'ホーチミンのナイトライフ完全ガイド',
    type: 'BLOG',
    excerpt: 'ホーチミン市で最高のバー、クラブ、ラウンジを紹介。日本人観光客・駐在員向けの完全ガイド。',
    body: `# ホーチミンのナイトライフ完全ガイド

## はじめに
ホーチミン市は、ベトナム最大の都市であり、東南アジアでも有数のナイトライフスポットです。この記事では、日本人のお客様向けに、おすすめのバー・クラブ・ラウンジをエリア別にご紹介します。

## おすすめエリア

### 1区 — ダウンタウン
1区はホーチミンのナイトライフの中心地です。ドンコイ通りやブイビエン通りには、バーやクラブが立ち並んでいます。
- **ムーンライト・バー** — 洗練されたクラフトカクテルとジャズの雰囲気
- **ベルベット・クラブ** — サイゴン最大級のクラブ、毎週金曜レディースナイト

### 3区 — ローカルな雰囲気
3区は地元の人々に人気のエリアで、隠れ家的なバーやラウンジが多くあります。
- **サクラ・ラウンジ** — 日本式おもてなしのプレミアムラウンジ
- **花見ダイニング** — 季節の創作料理と厳選日本酒

### 7区 — 高級エリア
7区はフーミーフンエリアを中心に、高級KTVやレストランが集まっています。
- **ゴールデンボイスKTV** — 日本語曲10,000曲以上、最新音響設備

## 日本語対応のお店
NightLife Vietnamでは、日本語対応のお店を多数掲載しています。安心してお楽しみください。

## まとめ
ホーチミンのナイトライフは、多様なスタイルのお店が揃っています。NightLife Vietnamで予約すれば、割引クーポンやポイントも獲得できます。

---
*NightLife Vietnam — あなたの夜を、もっと特別に。*`,
    metadata: {
      i18n: {
        ja: {
          title: 'ホーチミンのナイトライフ完全ガイド',
          excerpt: 'ホーチミン市で最高のバー、クラブ、ラウンジを紹介。日本人向けの完全ガイド。',
        },
        en: {
          title: 'Complete Nightlife Guide to Ho Chi Minh City',
          excerpt: 'Discover the best bars, clubs, and lounges in HCMC. A complete guide for Japanese visitors.',
        },
        vi: {
          title: 'Hướng dẫn toàn diện về Nightlife TP.HCM',
          excerpt: 'Khám phá những bar, club, lounge tốt nhất tại TP.HCM. Hướng dẫn đầy đủ cho du khách Nhật.',
        },
      },
      seo: {
        keywords: ['ホーチミン', 'ナイトライフ', 'バー', 'クラブ', 'nightlife', 'HCMC', 'bar', 'club'],
        ogImage: 'https://placehold.co/1200x630/1a1a2e/e94560?text=HCMC+Nightlife+Guide',
      },
    },
  },
  {
    slug: 'hanoi-bars-clubs',
    title: 'ハノイで人気のバー＆クラブ TOP 5',
    type: 'BLOG',
    excerpt: 'ハノイの旧市街から西湖エリアまで、今一番ホットなバーとクラブを厳選紹介。',
    body: `# ハノイで人気のバー＆クラブ TOP 5

ハノイは歴史と文化の街ですが、近年はナイトライフも急速に発展しています。旧市街の趣あるバーから西湖畔の最新クラブまで、おすすめ5選をご紹介。

## 1. クリムゾン・バー（旧市街・ホアンキエム）
ハノイの旧市街に位置するシックなバー。ベトナム産クラフトビールと創作カクテルが人気。週末はライブジャズ演奏も楽しめます。

## 2. ネオン・クラブ（西湖・タイホー）
西湖畔に佇む最新鋭のクラブ。ネオンライトとレーザーが彩る空間で、アジアトップクラスのDJが毎週プレイ。

## 3. ジェイド・ラウンジ（ホアンキエム）
翡翠をテーマにした高級ラウンジ。ホアンキエム湖を一望するテラス席が魅力。プレミアムウイスキーバーも併設。

## 4. スターKTV（カウジャイ）
5つ星のKTV体験。最新のDAMシステムと日本語スタッフが揃っています。接待にも最適。

## 5. 東京キッチン（タイホー）
本格日本料理レストラン。寿司、刺身、天ぷらを堪能した後のバー利用も人気。

---
*NightLife Vietnam — あなたの夜を、もっと特別に。*`,
    metadata: {
      i18n: {
        ja: {
          title: 'ハノイで人気のバー＆クラブ TOP 5',
          excerpt: 'ハノイで今一番ホットなバーとクラブを厳選紹介。',
        },
        en: {
          title: 'Top 5 Popular Bars & Clubs in Hanoi',
          excerpt: 'Curated selection of the hottest bars and clubs in Hanoi right now.',
        },
        vi: {
          title: 'Top 5 Bar & Club nổi tiếng tại Hà Nội',
          excerpt: 'Tuyển chọn những bar và club hot nhất Hà Nội hiện nay.',
        },
      },
      seo: {
        keywords: ['ハノイ', 'バー', 'クラブ', 'Hanoi', 'bars', 'clubs', 'nightlife'],
        ogImage: 'https://placehold.co/1200x630/16213e/0f3460?text=Hanoi+Top+5',
      },
    },
  },
  {
    slug: 'vietnam-ktv-guide',
    title: 'ベトナムKTVの楽しみ方ガイド',
    type: 'BLOG',
    excerpt: 'ベトナムのKTV（カラオケ）文化を徹底解説。料金システム、マナー、おすすめ店舗まで。',
    body: `# ベトナムKTVの楽しみ方ガイド

ベトナムのKTV（カラオケ）は、日本のカラオケボックスとは少し異なる独自の文化があります。この記事では、初めてベトナムのKTVを利用する方向けに、基本情報をお伝えします。

## KTVとは？
KTVは「Karaoke Television」の略で、個室でカラオケを楽しむエンターテインメント施設です。ベトナムでは、お酒や食事と一緒にカラオケを楽しむのが主流です。

## 料金システム
- **ルーム料金：** 時間制（通常1時間単位）
- **ドリンク代：** 別途（ビール、カクテル、ソフトドリンク等）
- **スタッフ指名料：** 別途（任意）

## マナーとルール
1. スタッフへのチップは任意ですが、喜ばれます
2. 他のお客様への配慮を忘れずに
3. 撮影は必ずスタッフの許可を得てから
4. 閉店時間を守りましょう

## NightLife Vietnamでの予約がお得
NightLife Vietnamから予約すると、メンバーシップランクに応じた割引が適用されます：
- ゲスト：5%割引
- メンバー：8%割引
- VIP：10%割引

---
*NightLife Vietnam — あなたの夜を、もっと特別に。*`,
    metadata: {
      i18n: {
        ja: {
          title: 'ベトナムKTVの楽しみ方ガイド',
          excerpt: 'ベトナムのKTV文化を徹底解説。料金、マナー、おすすめ店舗。',
        },
        en: {
          title: 'How to Enjoy KTV in Vietnam — A Complete Guide',
          excerpt: 'A complete guide to Vietnam\'s KTV culture: pricing, etiquette, and top venues.',
        },
        vi: {
          title: 'Hướng dẫn tận hưởng KTV tại Việt Nam',
          excerpt: 'Giải thích chi tiết văn hóa KTV Việt Nam: giá cả, quy tắc ứng xử, quán nổi tiếng.',
        },
      },
      seo: {
        keywords: ['KTV', 'カラオケ', 'ベトナム', 'karaoke', 'Vietnam', 'guide'],
        ogImage: 'https://placehold.co/1200x630/2d2d44/ff6b9d?text=Vietnam+KTV+Guide',
      },
    },
  },

  // ═══════════════ POLICY PAGES ═══════════════
  {
    slug: 'privacy-policy',
    title: 'プライバシーポリシー — Privacy Policy — Chính sách Bảo mật',
    type: 'POLICY',
    excerpt: null,
    body: `# プライバシーポリシー / Privacy Policy / Chính sách Bảo mật

**最終更新日 / Last Updated / Cập nhật lần cuối:** 2026-06-22

---

## 🇯🇵 日本語版

### 1. 収集する情報
当社は、サービス利用時に以下の情報を収集します：
- お名前、メールアドレス、電話番号
- 予約情報（日時、人数、店舗）
- 支払い情報（請求書の総額のみ — 詳細な明細は収集しません）

### 2. 情報の利用目的
- サービスの提供・改善
- 予約の管理・確認
- ポイント・クーポンの管理
- マーケティング（同意を得た場合のみ）

### 3. 情報の共有
お客様の個人情報は、以下の場合を除き第三者に提供いたしません：
- お客様の同意がある場合
- 法的要求がある場合
- サービス提供に必要な場合（予約先の店舗への情報共有等）

### 4. データの保護
業界標準の暗号化とセキュリティ対策を使用してデータを保護します。

---

## 🇬🇧 English Version

### 1. Information We Collect
- Name, email address, phone number
- Booking information (date, party size, venue)
- Payment information (total bill amount only — no itemized details)

### 2. How We Use Information
- To provide and improve our services
- To manage and confirm bookings
- To manage points and coupons
- For marketing (with your consent only)

### 3. Information Sharing
We do not share your personal information with third parties except:
- With your consent
- When legally required
- When necessary for service delivery (e.g., sharing booking details with venues)

### 4. Data Protection
We use industry-standard encryption and security measures to protect your data.

---

## 🇻🇳 Phiên bản Tiếng Việt

### 1. Thông tin chúng tôi thu thập
- Họ tên, email, số điện thoại
- Thông tin đặt chỗ (ngày giờ, số người, quán)
- Thông tin thanh toán (chỉ tổng tiền hóa đơn — không thu thập chi tiết từng món)

### 2. Mục đích sử dụng
- Cung cấp và cải thiện dịch vụ
- Quản lý và xác nhận đặt chỗ
- Quản lý điểm và mã giảm giá
- Marketing (chỉ khi có sự đồng ý)

### 3. Chia sẻ thông tin
Chúng tôi không chia sẻ thông tin cá nhân với bên thứ ba trừ khi:
- Có sự đồng ý của bạn
- Được yêu cầu theo pháp luật
- Cần thiết để cung cấp dịch vụ

### 4. Bảo vệ dữ liệu
Chúng tôi sử dụng mã hóa và biện pháp bảo mật tiêu chuẩn ngành để bảo vệ dữ liệu.

---
*© 2026 NightLife Vietnam. All rights reserved.*`,
    metadata: {
      i18n: {
        ja: { title: 'プライバシーポリシー' },
        en: { title: 'Privacy Policy' },
        vi: { title: 'Chính sách Bảo mật' },
      },
      legal: true,
      version: '1.0',
      effectiveDate: '2026-06-22',
    },
  },
  {
    slug: 'terms-of-service',
    title: '利用規約 — Terms of Service — Chính sách Hoạt động',
    type: 'POLICY',
    excerpt: null,
    body: `# 利用規約 / Terms of Service / Chính sách Hoạt động

**最終更新日 / Last Updated / Cập nhật lần cuối:** 2026-06-22

---

## 🇯🇵 日本語版

### 1. サービス概要
NightLife Vietnamは、ベトナムのナイトライフ施設の紹介・予約仲介プラットフォームです。当社は仲介サービスのみを提供し、実際のサービスは各店舗が提供します。

### 2. 予約について
- 予約は確定後、開始1時間前まで無料でキャンセル可能です
- 予約の変更はできません。変更を希望する場合は、キャンセル後に再予約してください
- ノーショー（無断キャンセル）が続く場合、アカウントを停止する場合があります

### 3. クーポン・ポイント
- クーポンは1枚につき1回のみ利用可能です（1回/Coupon）
- ゲスト用クーポンの有効期限は24時間、メンバー用は7日間です
- ポイントの有効期限は獲得日から1年間です
- 不正利用が発覚した場合、ポイント・クーポンを取り消す場合があります
- ポイント算出：1,000,000₫（税引前）= 10ポイント

### 4. 免責事項
当社は仲介プラットフォームであり、各店舗のサービス品質について保証するものではありません。

---

## 🇬🇧 English Version

### 1. Service Overview
NightLife Vietnam is a platform for introducing and booking nightlife venues in Vietnam. We only provide intermediary services; actual services are provided by each venue.

### 2. Bookings
- Bookings can be cancelled free of charge up to 1 hour before scheduled time
- Booking modifications are not supported — please cancel and rebook
- Repeated no-shows may result in account suspension

### 3. Coupons & Points
- Each coupon can only be used once (1 use per coupon)
- Guest coupons valid for 24 hours; member coupons for 7 days
- Points expire 1 year from the date earned
- Fraudulent use may result in revocation
- Point calculation: 1,000,000₫ (before discount) = 10 points

### 4. Disclaimer
As an intermediary platform, we do not guarantee the quality of services provided by individual venues.

---

## 🇻🇳 Phiên bản Tiếng Việt

### 1. Tổng quan dịch vụ
NightLife Vietnam là nền tảng giới thiệu và đặt chỗ các cơ sở nightlife tại Việt Nam. Chúng tôi chỉ cung cấp dịch vụ trung gian; dịch vụ thực tế do từng quán cung cấp.

### 2. Đặt chỗ
- Có thể hủy đặt chỗ miễn phí trước giờ hẹn 1 giờ
- Không hỗ trợ sửa đổi đặt chỗ — vui lòng hủy và đặt lại
- No-show liên tục có thể dẫn đến tạm dừng tài khoản

### 3. Mã giảm giá & Điểm
- Mỗi mã giảm giá chỉ sử dụng được 1 lần (1 lần/coupon)
- Mã cho Guest có hiệu lực 24 giờ; cho Member 7 ngày
- Điểm có hiệu lực 1 năm kể từ ngày tích
- Sử dụng gian lận có thể dẫn đến thu hồi
- Tích điểm: 1.000.000₫ (trước giảm giá) = 10 điểm

### 4. Miễn trừ trách nhiệm
Với tư cách nền tảng trung gian, chúng tôi không đảm bảo chất lượng dịch vụ của từng quán.

---
*© 2026 NightLife Vietnam. All rights reserved.*`,
    metadata: {
      i18n: {
        ja: { title: '利用規約' },
        en: { title: 'Terms of Service' },
        vi: { title: 'Chính sách Hoạt động' },
      },
      legal: true,
      version: '1.0',
      effectiveDate: '2026-06-22',
    },
  },
];

export async function seedContents(
  prisma: PrismaClient,
  users: Record<string, User>,
): Promise<void> {
  console.log('  📝 Seeding contents...');
  const adminId = users['admin']?.id ?? null;

  for (const c of CONTENTS) {
    await prisma.content.upsert({
      where: { slug: c.slug },
      update: {
        title: c.title,
        type: c.type,
        excerpt: c.excerpt,
        body: c.body,
        metadata: c.metadata,
        status: 'PUBLISHED',
      },
      create: {
        authorId: adminId,
        slug: c.slug,
        title: c.title,
        type: c.type,
        status: 'PUBLISHED',
        excerpt: c.excerpt,
        body: c.body,
        metadata: c.metadata,
        publishedAt: new Date(),
      },
    });
  }

  const blogCount = CONTENTS.filter((c) => c.type === 'BLOG').length;
  const policyCount = CONTENTS.filter((c) => c.type === 'POLICY').length;
  console.log(`     ✓ ${CONTENTS.length} content items (${blogCount} blogs + ${policyCount} policies, all trilingual)`);
}
