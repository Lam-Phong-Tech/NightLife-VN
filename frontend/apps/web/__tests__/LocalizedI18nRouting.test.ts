import { afterEach, describe, expect, it } from "vitest";
import { syncGoogleTranslateCookie } from "@/lib/i18n/client-translations";
import {
  getPathLanguage,
  languageAlternates,
  localizeHref,
  localizePathname,
  stripLanguagePrefix,
} from "@/lib/i18n/locales";
import { createLocalizedPageMetadata } from "@/lib/seo/localized-page-metadata";

afterEach(() => {
  document.cookie = "googtrans=; path=/; max-age=0";
});

describe("localized public routes", () => {
  it("recognizes, replaces, and removes all five language prefixes", () => {
    expect(getPathLanguage("/vi/danh-sach-quan")).toBe("vi");
    expect(getPathLanguage("/en/blog")).toBe("en");
    expect(getPathLanguage("/ja/tour")).toBe("ja");
    expect(getPathLanguage("/ko/spa")).toBe("ko");
    expect(getPathLanguage("/zh/nha-hang")).toBe("zh");
    expect(stripLanguagePrefix("/ja/danh-sach-cast")).toBe("/danh-sach-cast");
    expect(localizePathname("/ja/blog", "ko")).toBe("/ko/blog");
  });

  it("preserves query strings and hashes while localizing user links", () => {
    expect(localizeHref("/ja/blog?q=ktv#latest", "en")).toBe(
      "/en/blog?q=ktv#latest",
    );
    expect(localizeHref("/admin/bookings", "ja")).toBe("/admin/bookings");
    expect(localizeHref("https://example.com/path", "ja")).toBe(
      "https://example.com/path",
    );
  });

  it("builds five-language canonical and hreflang metadata", () => {
    const metadata = createLocalizedPageMetadata("ja", "tour");

    expect(metadata.alternates?.canonical).toBe("/ja/tour");
    expect(metadata.alternates?.languages).toMatchObject({
      vi: "/vi/tour",
      en: "/en/tour",
      ja: "/ja/tour",
      ko: "/ko/tour",
      "zh-CN": "/zh/tour",
      "x-default": "/vi/tour",
    });
    expect(languageAlternates("/tour")).toMatchObject({
      vi: "/vi/tour",
      ja: "/ja/tour",
    });
  });

  it("uses the approved Japanese SEO titles and descriptions", () => {
    expect(createLocalizedPageMetadata("ja", "home").title).toEqual({
      absolute: "Vietyoru｜ベトナムの夜遊び・ナイトライフガイド",
    });
    expect(createLocalizedPageMetadata("ja", "venues").title).toBe(
      "夜遊び店舗検索",
    );
    expect(createLocalizedPageMetadata("ja", "spa").title).toBe(
      "スパ・マッサージ",
    );
    expect(createLocalizedPageMetadata("ja", "restaurants").title).toBe(
      "レストラン検索",
    );
    expect(createLocalizedPageMetadata("ja", "casts").title).toBe(
      "キャスト一覧",
    );
    expect(createLocalizedPageMetadata("ja", "offers").title).toBe(
      "お得なクーポン",
    );
    expect(createLocalizedPageMetadata("ja", "tour").title).toBe(
      "ナイトツアー",
    );
    expect(createLocalizedPageMetadata("ja", "home").description).toBe(
      "ハノイ・ホーチミンの夜遊び・ナイトライフ情報を日本語で紹介。ラウンジ、ガールズバー、KTV、キャスト、クーポン、ナイトツアーを比較し、気になる店舗や体験をVietyoruから予約できます。",
    );
    expect(createLocalizedPageMetadata("ja", "venues").description).toBe(
      "ハノイ・ホーチミンのラウンジ、ガールズバー、KTV、バーをエリアやジャンルから検索。料金目安、営業時間、写真、特典を比較して予約できます。",
    );
    expect(createLocalizedPageMetadata("ja", "spa").description).toBe(
      "ベトナムのスパ・マッサージ店を日本語で検索。エリア、料金目安、営業時間、写真、特典を比較し、自分に合った店舗を探せます。",
    );
    expect(createLocalizedPageMetadata("ja", "restaurants").description).toBe(
      "ベトナムのレストランやダイニングラウンジを日本語で検索。エリア、予算、営業時間、写真、特典を比較し、ディナーに合う店舗を探せます。",
    );
    expect(createLocalizedPageMetadata("ja", "casts").description).toBe(
      "各店舗の人気キャストのプロフィールや写真、出勤情報をチェック。お気に入りのキャストを見つけよう。",
    );
    expect(createLocalizedPageMetadata("ja", "rankings").description).toBe(
      "ベトナムで注目を集める店舗とキャストをランキングで紹介。ハノイ、ホーチミンなどのエリアやジャンル別に比較し、今夜行きたい店舗や気になるキャストを見つけられます。",
    );
    expect(createLocalizedPageMetadata("ja", "offers").description).toBe(
      "Vietyoru限定の割引クーポンや初回特典情報。お得にベトナムの夜を楽しみたい方はこちら。",
    );
    expect(createLocalizedPageMetadata("ja", "tour").description).toBe(
      "初めてでも安心。ローカルグルメや夜景、ナイトライフを効率よく楽しめるプライベートナイトツアーを日本語で予約できます。",
    );
    expect(createLocalizedPageMetadata("ja", "blog").description).toBe(
      "ベトナムの夜遊び・ナイトライフ情報を日本語で紹介。ホーチミンやハノイのおすすめ店舗、料金、マナー、安全対策、予約方法、お得な特典を分かりやすく解説します。",
    );
  });
});

describe("Google Translate fallback cookie", () => {
  it("clears googtrans cookie to prevent Chrome browser top translation bar from popping up", () => {
    syncGoogleTranslateCookie("en");
    expect(decodeURIComponent(document.cookie)).not.toContain("googtrans=/vi/en");

    syncGoogleTranslateCookie("vi");
    expect(decodeURIComponent(document.cookie)).not.toContain("googtrans=/vi/en");
  });
});
