import type { Metadata } from "next";
import {
  languageAlternates,
  languageOpenGraphLocale,
  localizePathname,
  type LanguageCode,
} from "@/lib/i18n/locales";
import { absoluteSiteUrl, siteConfig } from "@/lib/site";

export type LocalizedPageKey =
  | "home"
  | "venues"
  | "spa"
  | "restaurants"
  | "casts"
  | "rankings"
  | "offers"
  | "tour"
  | "blog";

type LocalizedSeoCopy = {
  title: string;
  description: string;
};

const pagePaths: Record<LocalizedPageKey, string> = {
  home: "/",
  venues: "/stores",
  spa: "/spa",
  restaurants: "/nha-hang",
  casts: "/casts",
  rankings: "/xep-hang",
  offers: "/uu-dai",
  tour: "/tour",
  blog: "/blog",
};

const localizedSeoCopy: Record<
  LocalizedPageKey,
  Record<LanguageCode, LocalizedSeoCopy>
> = {
  home: {
    vi: {
      title: "Vietyoru｜Cẩm nang nightlife và vui chơi về đêm tại Việt Nam",
      description:
        "Khám phá nightlife tại Hà Nội và TP.HCM: lounge, bar, KTV, spa, nhà hàng, cast, tour và ưu đãi trên Vietyoru.",
    },
    en: {
      title: "Vietyoru｜Vietnam Nightlife and Night-out Guide",
      description:
        "Explore nightlife in Hanoi and Ho Chi Minh City, including lounges, bars, KTV, spas, restaurants, casts, tours, and deals.",
    },
    ja: {
      title: "Vietyoru｜ベトナムの夜遊び・ナイトライフガイド",
      description:
        "ハノイ・ホーチミンの夜遊び・ナイトライフ情報を日本語で紹介。ラウンジ、ガールズバー、KTV、キャスト、クーポン、ナイトツアーを比較し、気になる店舗や体験をVietyoruから予約できます。",
    },
    ko: {
      title: "Vietyoru｜베트남 밤문화·나이트라이프 가이드",
      description:
        "하노이와 호찌민의 라운지, 바, KTV, 스파, 레스토랑, 캐스트, 투어와 할인 정보를 한국어로 확인하세요.",
    },
    zh: {
      title: "Vietyoru｜越南夜生活与夜游指南",
      description:
        "用中文探索河内和胡志明市的酒廊、酒吧、KTV、水疗、餐厅、Cast、夜游与优惠信息。",
    },
  },
  venues: {
    vi: {
      title: "Tìm quán nightlife tại Việt Nam",
      description:
        "Tìm bar, club, lounge và karaoke theo khu vực, loại hình, giá tham khảo, giờ hoạt động, hình ảnh và ưu đãi.",
    },
    en: {
      title: "Find Nightlife Venues in Vietnam",
      description:
        "Search bars, clubs, lounges, and KTV venues by area, category, price, opening hours, photos, and available deals.",
    },
    ja: {
      title: "夜遊び店舗検索",
      description:
        "ハノイ・ホーチミンのラウンジ、ガールズバー、KTV、バーをエリアやジャンルから検索。料金目安、営業時間、写真、特典を比較して予約できます。",
    },
    ko: {
      title: "베트남 나이트라이프 장소 검색",
      description:
        "지역, 업종, 예상 가격, 영업시간, 사진과 혜택으로 라운지, 바, 클럽과 KTV를 비교하고 예약하세요.",
    },
    zh: {
      title: "搜索越南夜生活场所",
      description:
        "按地区、类型、参考价格、营业时间、照片和优惠搜索并比较酒廊、酒吧、夜店与KTV。",
    },
  },
  spa: {
    vi: {
      title: "Spa và massage tại Việt Nam",
      description:
        "Tìm spa và massage theo khu vực, giá tham khảo, giờ hoạt động, hình ảnh và ưu đãi trên Vietyoru.",
    },
    en: {
      title: "Spas and Massage in Vietnam",
      description:
        "Find spas and massage venues by area, estimated price, opening hours, photos, and available deals.",
    },
    ja: {
      title: "スパ・マッサージ",
      description:
        "ベトナムのスパ・マッサージ店を日本語で検索。エリア、料金目安、営業時間、写真、特典を比較し、自分に合った店舗を探せます。",
    },
    ko: {
      title: "베트남 스파·마사지 검색",
      description:
        "지역, 예상 가격, 영업시간, 사진과 혜택을 비교해 나에게 맞는 베트남 스파와 마사지 매장을 찾아보세요.",
    },
    zh: {
      title: "搜索越南水疗与按摩",
      description:
        "按地区、参考价格、营业时间、照片和优惠比较越南水疗与按摩门店。",
    },
  },
  restaurants: {
    vi: {
      title: "Nhà hàng và dining lounge tại Việt Nam",
      description:
        "Khám phá nhà hàng và dining lounge theo khu vực, ngân sách, giờ hoạt động, hình ảnh và ưu đãi.",
    },
    en: {
      title: "Restaurants and Dining Lounges in Vietnam",
      description:
        "Explore restaurants and dining lounges by area, budget, opening hours, photos, and available offers.",
    },
    ja: {
      title: "レストラン検索",
      description:
        "ベトナムのレストランやダイニングラウンジを日本語で検索。エリア、予算、営業時間、写真、特典を比較し、ディナーに合う店舗を探せます。",
    },
    ko: {
      title: "베트남 레스토랑 검색",
      description:
        "지역, 예산, 영업시간, 사진과 혜택을 비교해 저녁 식사에 맞는 레스토랑과 다이닝 라운지를 찾아보세요.",
    },
    zh: {
      title: "搜索越南餐厅与Dining Lounge",
      description:
        "按地区、预算、营业时间、照片和优惠比较越南餐厅与Dining Lounge。",
    },
  },
  casts: {
    vi: {
      title: "Danh sách cast tại Việt Nam",
      description:
        "Tìm cast theo hồ sơ, hình ảnh, ngôn ngữ hỗ trợ, khu vực hoạt động và quán đang làm việc.",
    },
    en: {
      title: "Cast Directory in Vietnam",
      description:
        "Find casts by profile, photos, supported languages, active area, and current venue.",
    },
    ja: {
      title: "キャスト一覧",
      description:
        "各店舗の人気キャストのプロフィールや写真、出勤情報をチェック。お気に入りのキャストを見つけよう。",
    },
    ko: {
      title: "베트남 캐스트 목록",
      description:
        "프로필, 사진, 지원 언어, 활동 지역과 소속 매장을 확인하고 원하는 캐스트를 찾아보세요.",
    },
    zh: {
      title: "越南Cast名单",
      description:
        "按个人资料、照片、支持语言、活动地区和所在门店查找合适的Cast。",
    },
  },
  rankings: {
    vi: {
      title: "Bảng xếp hạng nightlife Việt Nam",
      description:
        "Xem bảng xếp hạng quán và cast nổi bật theo khu vực, loại hình và mức độ quan tâm.",
    },
    en: {
      title: "Vietnam Nightlife Rankings",
      description:
        "Discover trending venues and casts ranked by area, category, and audience interest.",
    },
    ja: {
      title: "ベトナムの店舗・キャストランキング",
      description:
        "ベトナムで注目を集める店舗とキャストをランキングで紹介。ハノイ、ホーチミンなどのエリアやジャンル別に比較し、今夜行きたい店舗や気になるキャストを見つけられます。",
    },
    ko: {
      title: "베트남 나이트라이프 랭킹",
      description:
        "지역과 장르별로 인기 매장과 캐스트 순위를 비교하고 관심 있는 대상을 찾아보세요.",
    },
    zh: {
      title: "越南夜生活排行榜",
      description:
        "按地区与类型查看热门门店和Cast排行榜，快速找到感兴趣的场所与Cast。",
    },
  },
  offers: {
    vi: {
      title: "Coupon và ưu đãi nightlife",
      description:
        "Tổng hợp coupon, giảm giá và ưu đãi đang áp dụng tại các quán, spa và nhà hàng đối tác.",
    },
    en: {
      title: "Nightlife Coupons and Deals",
      description:
        "Browse coupons, discounts, and promotions available at partner venues, spas, and restaurants.",
    },
    ja: {
      title: "お得なクーポン",
      description:
        "Vietyoru限定の割引クーポンや初回特典情報。お得にベトナムの夜を楽しみたい方はこちら。",
    },
    ko: {
      title: "베트남 쿠폰·할인 혜택",
      description:
        "바, 클럽, KTV, 스파와 레스토랑에서 사용할 수 있는 쿠폰과 할인 조건, 유효기간을 확인하세요.",
    },
    zh: {
      title: "越南优惠券与特惠",
      description:
        "查看酒吧、夜店、KTV、水疗和餐厅可用的优惠券、使用条件与有效期。",
    },
  },
  tour: {
    vi: {
      title: "Tour nightlife tại Việt Nam",
      description:
        "Tìm tour nightlife theo địa điểm ghé thăm, khu vực, thời lượng, giá tham khảo và ưu đãi.",
    },
    en: {
      title: "Vietnam Nightlife Tours",
      description:
        "Compare nightlife tours by stops, area, duration, estimated price, and included benefits.",
    },
    ja: {
      title: "ナイトツアー",
      description:
        "初めてでも安心。ローカルグルメや夜景、ナイトライフを効率よく楽しめるプライベートナイトツアーを日本語で予約できます。",
    },
    ko: {
      title: "베트남 나이트라이프 투어",
      description:
        "방문 장소, 지역, 소요 시간, 예상 가격과 혜택을 비교해 원하는 나이트라이프 투어를 예약하세요.",
    },
    zh: {
      title: "越南夜生活之旅",
      description:
        "按访问地点、地区、时长、参考价格与优惠比较并预订合适的越南夜生活体验。",
    },
  },
  blog: {
    vi: {
      title: "Blog và cẩm nang nightlife Việt Nam",
      description:
        "Cẩm nang địa điểm, giá cả, cách đặt chỗ, phép lịch sự, an toàn và ưu đãi nightlife tại Việt Nam.",
    },
    en: {
      title: "Vietnam Nightlife Blog and Guides",
      description:
        "Read guides to venues, prices, reservations, etiquette, safety, and nightlife deals in Vietnam.",
    },
    ja: {
      title: "ベトナム夜遊び・ナイトライフブログ",
      description:
        "ベトナムの夜遊び・ナイトライフ情報を日本語で紹介。ホーチミンやハノイのおすすめ店舗、料金、マナー、安全対策、予約方法、お得な特典を分かりやすく解説します。",
    },
    ko: {
      title: "베트남 밤문화 블로그·가이드",
      description:
        "추천 장소, 가격, 예약 방법, 매너, 안전 수칙과 할인 등 베트남 밤문화 정보를 확인하세요.",
    },
    zh: {
      title: "越南夜生活博客与指南",
      description:
        "了解推荐场所、价格、预订方式、礼仪、安全提示和越南夜生活优惠。",
    },
  },
};

export function createLocalizedPageMetadata(
  locale: LanguageCode,
  page: LocalizedPageKey,
): Metadata {
  const path = pagePaths[page];
  const canonical = localizePathname(path, locale);
  const copy = localizedSeoCopy[page][locale];
  const absoluteTitle = page === "home" ? copy.title : `${copy.title} | ${siteConfig.name}`;

  return {
    title: page === "home" ? { absolute: copy.title } : copy.title,
    description: copy.description,
    alternates: {
      canonical,
      languages: {
        ...languageAlternates(path),
        "x-default": `/vi${path === "/" ? "" : path}`,
      },
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      siteName: siteConfig.name,
      title: absoluteTitle,
      description: copy.description,
      url: absoluteSiteUrl(canonical),
      locale: languageOpenGraphLocale[locale],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: absoluteTitle,
      description: copy.description,
    },
  };
}
