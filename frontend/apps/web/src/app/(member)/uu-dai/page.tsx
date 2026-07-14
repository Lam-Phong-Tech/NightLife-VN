"use client";

import Link from "next/link";
import { type CSSProperties, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  MapPin,
  Search,
  Sparkles,
  Ticket,
} from "lucide-react";
import { ApiError, resolveClientUrl } from "@/lib/api/client";
import { contentApi, type CmsContentItem } from "@/lib/api/content";
import { campaignsApi, type CampaignItem } from "@/lib/api/campaigns";
import { useMoneyFormatter } from "@/components/providers/CurrencyProvider";
import { translateText } from "@/lib/i18n/client-translations";
import { formatVndByLanguage, type CurrencyRateMap } from "@/lib/i18n/currency-format";
import {
  intlLocaleByLanguage,
  useActiveLanguage,
  type LanguageCode,
} from "@/lib/i18n/use-active-language";

const categoryLabels: Record<string, string> = {
  BAR: "Bar",
  CLUB: "Club",
  LOUNGE: "Lounge",
  GIRLS_BAR: "Girls bar",
  KARAOKE: "Karaoke/KTV",
  MASSAGE_SPA: "Massage spa",
  RESTAURANT: "Nhà hàng",
  CASINO: "Casino lounge",
};

const categoryImages: Record<string, string> = {
  BAR: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=720&q=76",
  CLUB: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=720&q=76",
  LOUNGE: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=720&q=76",
  GIRLS_BAR: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=720&q=76",
  KARAOKE: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=720&q=76",
  MASSAGE_SPA: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=720&q=76",
  RESTAURANT: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=720&q=76",
};

const fallbackImages = [
  "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=720&q=76",
  "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=720&q=76",
  "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=720&q=76",
  "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=720&q=76",
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=720&q=76",
];

const campaignPageSize = 4;
const defaultCouponBannerImage =
  "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1400&q=76";

type CouponBannerMetadata = {
  description?: string;
  tag?: string;
  link?: string;
  statusLabel?: string;
  subtitle?: string;
  imageUrl?: string;
  position?: string;
};

const formatDiscount = (
  campaign: Pick<CampaignItem, "discountType" | "discountValue">,
  language: LanguageCode = "vi",
  rates?: CurrencyRateMap,
) => {
  if (campaign.discountType === "PERCENT") {
    return `-${campaign.discountValue}%`;
  }

  return `-${formatVndByLanguage(campaign.discountValue, language, rates)}`;
};

const formatShortDate = (value?: string | null, language: LanguageCode = "vi") => {
  if (!value) {
    return {
      vi: "Không giới hạn",
      en: "No limit",
      ja: "期限なし",
      ko: "제한 없음",
      zh: "不限期",
    }[language];
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return {
      vi: "Đang cập nhật",
      en: "Updating",
      ja: "更新中",
      ko: "업데이트 중",
      zh: "更新中",
    }[language];
  }

  return new Intl.DateTimeFormat(intlLocaleByLanguage[language], {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
};

const readableName = (name: string) => {
  const parts = name.split(/—|-/);
  return parts[parts.length - 1]?.trim() || name;
};

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const getCouponBannerMetadata = (content: CmsContentItem): CouponBannerMetadata =>
  (content.metadata ?? {}) as CouponBannerMetadata;

const isCouponBanner = (content: CmsContentItem) => {
  const metadata = getCouponBannerMetadata(content);
  const haystack = [
    content.title,
    content.slug,
    content.excerpt ?? "",
    metadata.position ?? "",
    metadata.tag ?? "",
    metadata.link ?? "",
    metadata.statusLabel ?? "",
    metadata.subtitle ?? "",
    metadata.description ?? "",
  ].join(" ");
  const normalized = normalizeText(haystack);

  return (
    normalized.includes("uu dai") ||
    normalized.includes("khuyen mai") ||
    normalized.includes("campaign") ||
    normalized.includes("deal") ||
    normalized.includes("/uu-dai")
  );
};

const getCampaignImage = (campaign: CampaignItem, index: number) =>
  campaign.targetStore!.media?.[0]?.url ??
  categoryImages[campaign.targetStore!.category] ??
  fallbackImages[index % fallbackImages.length];

const normalizeDistrictLabel = (value: string, language: LanguageCode) => {
  const trimmed = value.trim();
  const districtNumber =
    trimmed.match(/^Quận\s+(\d+)$/i)?.[1] ?? trimmed.match(/^District\s+(\d+)$/i)?.[1];

  if (districtNumber) {
    return {
      vi: `Quận ${districtNumber}`,
      en: `District ${districtNumber}`,
      ja: `${districtNumber}区`,
      ko: `${districtNumber}군`,
      zh: `${districtNumber}区`,
    }[language];
  }

  return translateText(trimmed, language);
};

const normalizeCityLabel = (value: string, language: LanguageCode) => {
  const normalized = normalizeText(value);
  if (
    normalized === "ho chi minh city" ||
    normalized === "tp.hcm" ||
    normalized === "tp hcm" ||
    normalized === "hcm"
  ) {
    return {
      vi: "TP.HCM",
      en: "Ho Chi Minh City",
      ja: "ホーチミン市",
      ko: "호치민시",
      zh: "胡志明市",
    }[language];
  }

  if (normalized === "ha noi" || normalized === "hanoi") {
    return {
      vi: "Hà Nội",
      en: "Hanoi",
      ja: "ハノイ",
      ko: "하노이",
      zh: "河内",
    }[language];
  }

  return translateText(value, language);
};

const getStoreLocation = (campaign: CampaignItem, language: LanguageCode) => {
  const area = [
    campaign.targetStore!.district ? normalizeDistrictLabel(campaign.targetStore!.district, language) : "",
    campaign.targetStore!.city ? normalizeCityLabel(campaign.targetStore!.city, language) : "",
  ]
    .filter(Boolean)
    .join(", ");

  return area || categoryLabels[campaign.targetStore!.category] || campaign.targetStore!.category;
};

const getCategoryLabel = (category: string, language: LanguageCode = "vi") =>
  translateText(categoryLabels[category] ?? category, language);

const campaignCopy = (language: LanguageCode) =>
  ({
    vi: {
      validUntil: "HSD",
      viewOffer: "Xem ưu đãi",
      page: "Trang",
      previous: "Trước",
      next: "Sau",
    },
    en: {
      validUntil: "Valid until",
      viewOffer: "View offer",
      page: "Page",
      previous: "Previous",
      next: "Next",
    },
    ja: {
      validUntil: "有効期限",
      viewOffer: "特典を見る",
      page: "ページ",
      previous: "前へ",
      next: "次へ",
    },
    ko: {
      validUntil: "유효기간",
      viewOffer: "혜택 보기",
      page: "페이지",
      previous: "이전",
      next: "다음",
    },
    zh: {
      validUntil: "有效期至",
      viewOffer: "查看优惠",
      page: "页",
      previous: "上一页",
      next: "下一页",
    },
  })[language];

const formatCouponPagination = ({
  page,
  totalPages,
  language,
}: {
  page: number;
  totalPages: number;
  language: LanguageCode;
}) => {
  const copy = campaignCopy(language);
  return `${copy.page} ${page}/${totalPages}`;
};

function CampaignDealCard({
  campaign,
  index,
  language,
  rates,
}: {
  campaign: CampaignItem;
  index: number;
  language: LanguageCode;
  rates: CurrencyRateMap;
}) {
  const storeName = readableName(campaign.targetStore!.name);
  const campaignName = readableName(campaign.name);
  const location = getStoreLocation(campaign, language);
  const copy = campaignCopy(language);

  return (
    <Link
      aria-label={`${copy.viewOffer} ${campaignName} ${language === "vi" ? "tại" : "at"} ${storeName}`}
      className="campaign-card"
      href={`/stores/${campaign.targetStore!.slug}`}
    >
      <span
        aria-label="Ảnh ưu đãi"
        className="campaign-image"
        role="img"
        style={{ backgroundImage: `url(${getCampaignImage(campaign, index)})` }}
      >
        <span className="campaign-image-shade" />
      </span>
      <span className="campaign-copy">
        <span className="campaign-meta">
          <span>{getCategoryLabel(campaign.targetStore!.category, language)}</span>
          <span>
            {copy.validUntil} {formatShortDate(campaign.endsAt, language)}
          </span>
        </span>
        <strong>{formatDiscount(campaign, language, rates)}</strong>
        <span className="campaign-title">{campaignName}</span>
        <span className="campaign-place">
          <MapPin size={13} />
          {storeName} · {location}
        </span>
      </span>
      <span className="campaign-action">
        {copy.viewOffer}
        <ArrowRight size={14} />
      </span>
    </Link>
  );
}

export default function Page() {
  const activeLanguage = useActiveLanguage();
  const { rates } = useMoneyFormatter(activeLanguage);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [banners, setBanners] = useState<CmsContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    campaignsApi
      .listPublicCampaigns()
      .then((data: CampaignItem[]) => {
        if (isMounted) {
          setCampaigns(data);
          setLoadError("");
        }
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }

        const message =
          error instanceof ApiError ? error.message : "Không tải được danh sách ưu đãi từ backend.";
        setLoadError(message);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    contentApi
      .list({ type: "BANNER", limit: 24 })
      .then((response) => {
        if (isMounted) {
          setBanners(response.data ?? []);
        }
      })
      .catch(() => {
        if (isMounted) {
          setBanners([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const categoryOptions = useMemo(() => {
    const counts = campaigns.reduce<Record<string, number>>((acc, campaign) => {
      acc[campaign.targetStore!.category] = (acc[campaign.targetStore!.category] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([category, count]) => ({
      category,
      count,
      label: getCategoryLabel(category, activeLanguage),
    }));
  }, [activeLanguage, campaigns]);

  const filteredCampaigns = useMemo(() => {
    const query = normalizeText(searchTerm);

    return campaigns.filter((campaign) => {
      const matchesCategory = activeCategory === "ALL" || campaign.targetStore!.category === activeCategory;
      const searchable = normalizeText(
        [
          campaign.name,
          
          "",
          campaign.targetStore!.name,
          campaign.targetStore!.city,
          campaign.targetStore!.district ?? "",
          getCategoryLabel(campaign.targetStore!.category),
          getCategoryLabel(campaign.targetStore!.category, activeLanguage),
        ].join(" "),
      );

      return matchesCategory && (!query || searchable.includes(query));
    });
  }, [activeCategory, activeLanguage, campaigns, searchTerm]);

  const featuredCoupon = filteredCampaigns[0] ?? campaigns[0];
  const campaignBanner = useMemo(() => banners.find(isCouponBanner) ?? null, [banners]);
  const campaignBannerMetadata = campaignBanner ? getCouponBannerMetadata(campaignBanner) : null;
  const campaignBannerImage =
    resolveClientUrl(campaignBannerMetadata?.imageUrl) ||
    campaignBannerMetadata?.imageUrl ||
    defaultCouponBannerImage;
  const campaignHeroStyle = {
    "--campaign-hero-image": `url(${JSON.stringify(campaignBannerImage)})`,
  } as CSSProperties;
  const campaignHeroTitle = campaignBanner?.title || "Ưu đãi đêm nay";
  const campaignHeroDescription =
    campaignBannerMetadata?.description ||
    campaignBanner?.excerpt ||
    "Coupon & khuyến mãi từ các quán đối tác, dẫn thẳng về trang đặt bàn để nhận QR.";
  const campaignHeroEyebrow = campaignBannerMetadata?.tag || campaignBannerMetadata?.statusLabel || "Xem danh sách quán";
  const campaignHeroHref =
    campaignBannerMetadata?.link && campaignBannerMetadata.link !== "/uu-dai"
      ? campaignBannerMetadata.link
      : "/danh-sach-quan";
  const totalPages = Math.max(1, Math.ceil(filteredCampaigns.length / campaignPageSize));
  const currentCouponPage = Math.min(currentPage, totalPages);
  const campaignStartIndex = (currentCouponPage - 1) * campaignPageSize;
  const paginatedCoupons = filteredCampaigns.slice(campaignStartIndex, campaignStartIndex + campaignPageSize);
  const shouldShowPagination = !isLoading && !loadError && filteredCampaigns.length > campaignPageSize;

  const updateSearchTerm = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const updateCategory = (category: string) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setActiveCategory("ALL");
    setCurrentPage(1);
  };

  return (
    <main className="campaign-page">
      <section className="campaign-shell">
        <header className="campaign-hero" style={campaignHeroStyle}>
          <div className="hero-copy">
            <Link className="back-link" href={campaignHeroHref}>
              {campaignHeroEyebrow}
            </Link>
            <h1>{campaignHeroTitle}</h1>
            <p>{campaignHeroDescription}</p>
          </div>

          <div className="hero-search" role="search">
            <Search size={17} />
            <input
              aria-label="Tìm ưu đãi"
              onChange={(event) => updateSearchTerm(event.target.value)}
              placeholder="Tìm quán, khu vực hoặc ưu đãi..."
              type="search"
              value={searchTerm}
            />
          </div>
        </header>

        {loadError ? (
          <section className="result error" role="alert">
            <AlertCircle size={20} />
            <span>{loadError}</span>
          </section>
        ) : null}

        <section className="campaign-content">
          <aside className="campaign-panel" aria-label="Bộ lọc ưu đãi">
            <div className="panel-card featured-card">
              <span className="panel-icon">
                <Sparkles size={18} />
              </span>
              <span className="panel-eyebrow">Đang nổi bật</span>
              <strong>{featuredCoupon ? readableName(featuredCoupon.name) : "Ưu đãi mới"}</strong>
              <p>
                {featuredCoupon
                  ? `${readableName(featuredCoupon.targetStore!.name)} · ${formatDiscount(featuredCoupon, activeLanguage, rates)}`
                  : "Các ưu đãi sẽ được cập nhật liên tục theo khu vực."}
              </p>
            </div>

            <div className="panel-card filter-card">
              <div className="panel-head">
                <span>
                  <Ticket size={17} />
                  Loại ưu đãi
                </span>
                <b>{filteredCampaigns.length}</b>
              </div>
              <div className="filter-list">
                <button
                  className={activeCategory === "ALL" ? "active" : ""}
                  onClick={() => updateCategory("ALL")}
                  type="button"
                >
                  <span>Tất cả</span>
                  <b>{campaigns.length}</b>
                </button>
                {categoryOptions.map((option) => (
                  <button
                    className={activeCategory === option.category ? "active" : ""}
                    key={option.category}
                    onClick={() => updateCategory(option.category)}
                    type="button"
                  >
                    <span>{option.label}</span>
                    <b>{option.count}</b>
                  </button>
                ))}
              </div>
            </div>

            <div className="panel-card note-card">
              <CalendarDays size={18} />
              <p>Ưu đãi có thể thay đổi theo tình trạng đặt chỗ. Admin sẽ xác nhận sau khi gửi yêu cầu.</p>
            </div>
          </aside>

          <section className="campaign-results">
            <div className="result-head">
              <div>
                <span>Danh sách ưu đãi</span>
                <strong>{isLoading ? "Đang tải..." : `${filteredCampaigns.length} ưu đãi phù hợp`}</strong>
              </div>
              {searchTerm || activeCategory !== "ALL" ? (
                <button
                  onClick={clearFilters}
                  type="button"
                >
                  Xóa lọc
                </button>
              ) : null}
            </div>

            {isLoading ? (
              <section className="campaign-grid" aria-label="Đang tải ưu đãi">
                {[0, 1, 2, 3, 4, 5].map((item) => (
                  <div className="campaign-skeleton" key={item} />
                ))}
              </section>
            ) : null}

            {!isLoading && !loadError && filteredCampaigns.length === 0 ? (
              <section className="empty-state">
                <Ticket size={32} />
                <h2>Chưa có campaign phù hợp</h2>
                <p>Thử đổi bộ lọc hoặc tìm theo tên quán/khu vực khác.</p>
                <button
                  onClick={clearFilters}
                  type="button"
                >
                  Xem tất cả ưu đãi
                </button>
              </section>
            ) : null}

            {!isLoading && !loadError && filteredCampaigns.length ? (
              <section className="campaign-grid" aria-label="Danh sách campaign đang có">
                {paginatedCoupons.map((campaign, index) => (
                  <CampaignDealCard
                    campaign={campaign}
                    index={campaignStartIndex + index}
                    key={campaign.id}
                    language={activeLanguage}
                    rates={rates}
                  />
                ))}
              </section>
            ) : null}

            {shouldShowPagination ? (
              <nav aria-label="Phân trang ưu đãi" className="campaign-pagination">
                <span>
                  {formatCouponPagination({
                    page: currentCouponPage,
                    totalPages,
                    language: activeLanguage,
                  })}
                </span>
                <div className="campaign-pagination-actions">
                  <button
                    disabled={currentCouponPage <= 1}
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    type="button"
                  >
                    {campaignCopy(activeLanguage).previous}
                  </button>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <button
                      aria-current={currentCouponPage === page ? "page" : undefined}
                      className={currentCouponPage === page ? "active" : ""}
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      type="button"
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    disabled={currentCouponPage >= totalPages}
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    type="button"
                  >
                    {campaignCopy(activeLanguage).next}
                  </button>
                </div>
              </nav>
            ) : null}
          </section>
        </section>
      </section>

      <style>{`
        .campaign-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at 18% 0%, rgba(212, 178, 106, .14), transparent 32%),
            radial-gradient(circle at 84% 12%, rgba(255, 122, 154, .08), transparent 30%),
            #0c0c0f;
          color: #f3f0ea;
          font-family: var(--nl-font-sans);
          overflow-x: hidden;
          padding: 30px 28px 64px;
        }

        .campaign-shell {
          width: min(1180px, 100%);
          margin: 0 auto;
          display: grid;
          gap: 22px;
        }

        .campaign-hero {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          border: 1px solid rgba(212, 178, 106, .2);
          border-radius: 8px;
          background:
            linear-gradient(115deg, rgba(10, 10, 13, .76), rgba(13, 11, 16, .38) 52%, rgba(13, 9, 16, .18)),
            var(--campaign-hero-image, url("https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1400&q=76"));
          background-position: center;
          background-size: cover;
          box-shadow:
            inset 0 0 0 1px rgba(255, 255, 255, .045),
            0 28px 72px -44px rgba(0, 0, 0, .9);
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(300px, 390px);
          gap: 28px;
          align-items: end;
          padding: 30px;
        }

        .campaign-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 82% 32%, rgba(212, 178, 106, .13), transparent 34%),
            linear-gradient(90deg, rgba(8, 8, 10, .78), rgba(8, 8, 10, .34) 48%, rgba(8, 8, 10, .16));
          pointer-events: none;
        }

        .hero-copy,
        .hero-search {
          position: relative;
          z-index: 1;
        }

        .back-link {
          display: inline-flex;
          color: #e3c27e;
          font-size: 12px;
          font-weight: 900;
          text-decoration: none;
          margin-bottom: 9px;
          text-shadow: 0 2px 14px rgba(0, 0, 0, .72);
        }

        h1,
        h2,
        p {
          margin: 0;
        }

        h1 {
          max-width: 560px;
          color: #fffaf1;
          font-size: clamp(34px, 4vw, 56px);
          line-height: .96;
          font-weight: 950;
          text-shadow: 0 4px 24px rgba(0, 0, 0, .78);
        }

        .campaign-hero p {
          max-width: 520px;
          margin-top: 12px;
          color: #bdb4a5;
          font-size: 14px;
          line-height: 1.65;
          text-shadow: 0 2px 14px rgba(0, 0, 0, .68);
        }

        .hero-search {
          min-height: 54px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid rgba(212, 178, 106, .32);
          border-radius: 8px;
          background: rgba(12, 12, 15, .72);
          color: #d4b26a;
          padding: 0 16px;
          backdrop-filter: blur(16px);
        }

        .hero-search input {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #f3f0ea;
          font: inherit;
          font-size: 14px;
        }

        .hero-search input::placeholder {
          color: #8c8679;
          opacity: 1;
        }

        .campaign-content {
          display: grid;
          grid-template-columns: 286px minmax(0, 1fr);
          gap: 18px;
          align-items: start;
        }

        .campaign-panel {
          position: sticky;
          top: 18px;
          display: grid;
          gap: 12px;
        }

        .panel-card {
          border: 1px solid rgba(212, 178, 106, .18);
          border-radius: 8px;
          background: rgba(255, 255, 255, .04);
          padding: 18px;
          box-shadow: 0 18px 36px -30px rgba(0, 0, 0, .9);
        }

        .featured-card {
          min-height: 196px;
          background:
            linear-gradient(155deg, rgba(212, 178, 106, .18), rgba(255, 255, 255, .04) 52%, rgba(255, 122, 154, .08)),
            rgba(255, 255, 255, .04);
          display: grid;
          align-content: end;
          gap: 8px;
        }

        .panel-icon {
          width: 42px;
          height: 42px;
          border-radius: 8px;
          background: linear-gradient(135deg, #f4e3b4, #d4b26a 58%, #b6924a);
          color: #17130c;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .panel-eyebrow {
          color: #d4b26a;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .12em;
          text-transform: uppercase;
        }

        .featured-card strong {
          color: #fffaf1;
          font-size: 20px;
          line-height: 1.18;
        }

        .featured-card p,
        .note-card p {
          color: #bdb4a5;
          font-size: 12.5px;
          line-height: 1.6;
        }

        .panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }

        .panel-head span {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #f3f0ea;
          font-size: 13px;
          font-weight: 900;
        }

        .panel-head b {
          min-width: 28px;
          height: 24px;
          border-radius: 999px;
          background: rgba(212, 178, 106, .16);
          color: #e3c27e;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }

        .filter-list {
          display: grid;
          gap: 8px;
        }

        .filter-list button,
        .result-head button,
        .empty-state button {
          border: 0;
          font: inherit;
          cursor: pointer;
        }

        .filter-list button {
          min-height: 42px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          border: 1px solid rgba(255, 255, 255, .08);
          border-radius: 8px;
          background: rgba(255, 255, 255, .035);
          color: #bdb4a5;
          padding: 0 12px;
          font-size: 12px;
          font-weight: 850;
          text-align: left;
        }

        .filter-list button.active {
          border-color: rgba(212, 178, 106, .48);
          background: rgba(212, 178, 106, .16);
          color: #f3f0ea;
        }

        .filter-list b {
          color: #e3c27e;
          font-size: 11px;
        }

        .note-card {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          border-color: rgba(244, 211, 141, .46);
          background:
            linear-gradient(135deg, rgba(212, 178, 106, .22), rgba(255, 122, 154, .09)),
            rgba(255, 255, 255, .055);
          color: #f6d77a;
          box-shadow: 0 20px 44px -30px rgba(212, 178, 106, .45);
        }

        .note-card svg {
          flex: none;
          color: #f6d77a;
          filter: drop-shadow(0 0 10px rgba(244, 211, 141, .32));
        }

        .note-card p {
          color: #f2dfb2;
          font-weight: 760;
          line-height: 1.55;
        }

        .campaign-results {
          display: grid;
          gap: 12px;
          min-width: 0;
        }

        .result-head {
          min-height: 58px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          border: 1px solid rgba(212, 178, 106, .16);
          border-radius: 8px;
          background: rgba(255, 255, 255, .035);
          padding: 12px 16px;
        }

        .result-head div {
          display: grid;
          gap: 3px;
        }

        .result-head span {
          color: #8c8679;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .12em;
          text-transform: uppercase;
        }

        .result-head strong {
          color: #f3f0ea;
          font-size: 18px;
        }

        .result-head button,
        .empty-state button {
          min-height: 38px;
          border-radius: 8px;
          background: rgba(212, 178, 106, .14);
          color: #e3c27e;
          padding: 0 14px;
          font-size: 12px;
          font-weight: 900;
        }

        .campaign-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .campaign-card {
          position: relative;
          min-height: 182px;
          overflow: hidden;
          border: 1px solid rgba(212, 178, 106, .2);
          border-radius: 8px;
          background: linear-gradient(145deg, rgba(255, 255, 255, .055), rgba(255, 255, 255, .025));
          color: #f3f0ea;
          display: grid;
          grid-template-columns: 154px minmax(0, 1fr);
          grid-template-rows: minmax(0, 1fr) auto;
          gap: 0 14px;
          padding: 12px;
          text-decoration: none;
          box-shadow: 0 16px 34px -28px rgba(0, 0, 0, .88);
          transition: transform .18s ease, border-color .18s ease, background .18s ease;
        }

        .campaign-card:hover {
          transform: translateY(-2px);
          border-color: rgba(212, 178, 106, .44);
          background: linear-gradient(145deg, rgba(212, 178, 106, .12), rgba(255, 255, 255, .035));
        }

        .campaign-image {
          position: relative;
          grid-row: 1 / 3;
          min-height: 158px;
          overflow: hidden;
          border-radius: 8px;
          background-position: center;
          background-size: cover;
          border: 1px solid rgba(212, 178, 106, .18);
        }

        .campaign-image-shade {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 28%, rgba(12, 12, 15, .54));
        }

        .campaign-copy {
          min-width: 0;
          display: grid;
          align-content: start;
          gap: 6px;
          padding-top: 2px;
        }

        .campaign-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .campaign-meta span {
          min-height: 24px;
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          background: rgba(212, 178, 106, .12);
          color: #d9c08a;
          padding: 0 9px;
          font-size: 10px;
          font-weight: 900;
        }

        .campaign-copy strong {
          color: #f0dda8;
          font-size: 30px;
          font-weight: 950;
          line-height: .98;
          white-space: nowrap;
        }

        .campaign-title {
          color: #fffaf1;
          font-size: 16px;
          font-weight: 900;
          line-height: 1.25;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .campaign-place {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 5px;
          color: #9f9789;
          font-size: 12px;
          line-height: 1.35;
          overflow: hidden;
        }

        .campaign-place svg {
          flex: none;
          color: #d4b26a;
        }

        .campaign-action {
          align-self: end;
          min-height: 38px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border-radius: 8px;
          background: linear-gradient(135deg, #f4e3b4, #d4b26a 58%, #b6924a);
          color: #17130c;
          padding: 0 13px;
          font-size: 12px;
          font-weight: 950;
          white-space: nowrap;
        }

        .result {
          min-height: 58px;
          border: 1px solid rgba(255, 128, 150, .42);
          border-radius: 8px;
          background: rgba(255, 128, 150, .12);
          color: #ffd1d9;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 15px;
          font-size: 13px;
        }

        .campaign-skeleton {
          min-height: 182px;
          border-radius: 8px;
          background: linear-gradient(90deg, rgba(255, 255, 255, .035), rgba(212, 178, 106, .14), rgba(255, 255, 255, .035));
          background-size: 220% 100%;
          animation: shimmer 1.4s ease-in-out infinite;
        }

        .empty-state {
          min-height: 320px;
          border: 1px solid rgba(212, 178, 106, .18);
          border-radius: 8px;
          background: rgba(255, 255, 255, .035);
          display: grid;
          place-items: center;
          gap: 10px;
          padding: 34px;
          text-align: center;
        }

        .empty-state h2 {
          color: #f3f0ea;
          font-size: 22px;
        }

        .empty-state p {
          color: #8c8679;
          font-size: 13px;
          line-height: 1.6;
        }

        .campaign-pagination {
          border: 1px solid rgba(212, 178, 106, .16);
          border-radius: 8px;
          background: rgba(255, 255, 255, .035);
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .campaign-pagination > span {
          color: #bdb4a5;
          font-size: 12px;
          font-weight: 800;
        }

        .campaign-pagination-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 7px;
          flex-wrap: wrap;
        }

        .campaign-pagination button {
          min-width: 38px;
          min-height: 36px;
          border: 1px solid rgba(212, 178, 106, .2);
          border-radius: 8px;
          background: rgba(255, 255, 255, .04);
          color: #d9c08a;
          font: inherit;
          font-size: 12px;
          font-weight: 900;
          cursor: pointer;
          padding: 0 11px;
        }

        .campaign-pagination button.active {
          border-color: transparent;
          background: linear-gradient(135deg, #f4e3b4, #d4b26a 58%, #b6924a);
          color: #17130c;
        }

        .campaign-pagination button:disabled {
          cursor: not-allowed;
          opacity: .45;
        }

        html.vy-light .campaign-page {
          background:
            radial-gradient(circle at 18% 0%, rgba(168, 124, 52, .1), transparent 32%),
            radial-gradient(circle at 84% 12%, rgba(194, 81, 126, .08), transparent 30%),
            #f6f4ef;
          color: #211e19;
        }

        html.vy-light .campaign-hero {
          border-color: rgba(150, 116, 52, .28);
          background: var(--campaign-hero-image, url("https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1400&q=76"));
          background-position: center;
          background-size: cover;
          box-shadow:
            inset 0 0 0 1px rgba(255, 255, 255, .68),
            0 22px 54px -34px rgba(40, 30, 10, .34);
        }

        html.vy-light .campaign-hero::before {
          background:
            linear-gradient(90deg, rgba(6, 6, 8, .78), rgba(6, 6, 8, .42) 48%, rgba(6, 6, 8, .08) 74%, transparent);
        }

        html.vy-light .campaign-hero .back-link,
        html.vy-light .campaign-hero h1,
        html.vy-light .campaign-hero p {
          text-shadow: 0 3px 18px rgba(0, 0, 0, .72);
        }

        html.vy-light .campaign-hero .back-link {
          color: #f3d782;
        }

        html.vy-light .campaign-hero h1 {
          color: #fffaf1;
        }

        html.vy-light .campaign-hero p {
          color: #f2eadc;
        }

        html.vy-light .back-link,
        html.vy-light .panel-eyebrow,
        html.vy-light .filter-list b,
        html.vy-light .note-card,
        html.vy-light .campaign-place svg {
          color: #8f6a2a;
        }

        html.vy-light h1,
        html.vy-light .featured-card strong,
        html.vy-light .panel-head span,
        html.vy-light .result-head strong,
        html.vy-light .campaign-title,
        html.vy-light .empty-state h2 {
          color: #211e19;
        }

        html.vy-light .featured-card p,
        html.vy-light .note-card p,
        html.vy-light .campaign-place,
        html.vy-light .empty-state p {
          color: #6f675c;
        }

        html.vy-light .hero-search {
          border-color: rgba(150, 116, 52, .34);
          background: rgba(255, 255, 255, .82);
          color: #8f6a2a;
          box-shadow: 0 16px 30px -26px rgba(40, 30, 10, .38);
        }

        html.vy-light .hero-search input {
          color: #211e19;
        }

        html.vy-light .hero-search input::placeholder {
          color: #8c8679;
        }

        html.vy-light .panel-card,
        html.vy-light .result-head,
        html.vy-light .campaign-card,
        html.vy-light .empty-state,
        html.vy-light .campaign-pagination {
          border-color: rgba(150, 116, 52, .28);
          background: rgba(255, 255, 255, .82);
          box-shadow: 0 18px 40px -34px rgba(40, 30, 10, .32);
        }

        html.vy-light .featured-card {
          background:
            linear-gradient(155deg, rgba(168, 124, 52, .18), rgba(255, 255, 255, .84) 52%, rgba(194, 81, 126, .08)),
            rgba(255, 255, 255, .82);
        }

        html.vy-light .note-card {
          border-color: rgba(168, 124, 52, .48);
          background:
            linear-gradient(135deg, rgba(236, 199, 116, .32), rgba(255, 255, 255, .9) 48%, rgba(194, 81, 126, .12)),
            #fffaf0;
          color: #8a641f;
          box-shadow: 0 22px 48px -34px rgba(98, 67, 18, .5);
        }

        html.vy-light .note-card svg {
          color: #a77720;
          filter: drop-shadow(0 0 8px rgba(168, 124, 52, .18));
        }

        html.vy-light .note-card p {
          color: #4f3b1f;
          font-weight: 800;
        }

        html.vy-light .panel-head b,
        html.vy-light .campaign-meta span,
        html.vy-light .filter-list button.active,
        html.vy-light .result-head button,
        html.vy-light .empty-state button {
          background: rgba(168, 124, 52, .12);
          color: #8f6a2a;
        }

        html.vy-light .filter-list button {
          border-color: rgba(30, 24, 12, .1);
          background: rgba(28, 22, 10, .035);
          color: #57534b;
        }

        html.vy-light .filter-list button.active {
          border-color: rgba(150, 116, 52, .46);
          color: #211e19;
        }

        html.vy-light .campaign-card {
          background: linear-gradient(145deg, rgba(255, 255, 255, .92), rgba(246, 244, 239, .78));
          color: #211e19;
        }

        html.vy-light .campaign-card:hover {
          border-color: rgba(150, 116, 52, .52);
          background: linear-gradient(145deg, rgba(255, 255, 255, .98), rgba(168, 124, 52, .12));
        }

        html.vy-light .campaign-image {
          border-color: rgba(150, 116, 52, .22);
        }

        html.vy-light .campaign-image-shade {
          background: linear-gradient(180deg, transparent 32%, rgba(246, 244, 239, .16));
        }

        html.vy-light .campaign-copy strong {
          color: #8f6a2a;
        }

        html.vy-light .campaign-meta span {
          color: #8f6a2a;
        }

        html.vy-light .result-head span {
          color: #8c8679;
        }

        html.vy-light .campaign-pagination > span {
          color: #6f675c;
        }

        html.vy-light .campaign-pagination button {
          border-color: rgba(150, 116, 52, .24);
          background: rgba(28, 22, 10, .035);
          color: #8f6a2a;
        }

        html.vy-light .campaign-pagination button.active {
          background: linear-gradient(135deg, #f4e3b4, #d4b26a 58%, #b6924a);
          color: #17130c;
        }

        html.vy-light .result.error {
          border-color: rgba(194, 69, 92, .34);
          background: rgba(194, 69, 92, .08);
          color: #9f263a;
        }

        html.vy-light .campaign-skeleton {
          background: linear-gradient(90deg, rgba(28, 22, 10, .035), rgba(168, 124, 52, .16), rgba(28, 22, 10, .035));
          background-size: 220% 100%;
        }

        @keyframes shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }

        @media (max-width: 1120px) {
          .campaign-content {
            grid-template-columns: 1fr;
          }

          .campaign-panel {
            position: static;
            grid-template-columns: 1fr 1fr;
          }

          .note-card {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 820px) {
          .campaign-page {
            min-height: auto;
            padding: 18px 16px 22px;
          }

          .campaign-shell {
            gap: 16px;
          }

          .campaign-hero {
            grid-template-columns: 1fr;
            padding: 22px;
          }

          h1 {
            font-size: 34px;
          }

          .campaign-panel {
            grid-template-columns: 1fr;
          }

          .campaign-grid {
            grid-template-columns: 1fr;
          }

          .campaign-pagination {
            align-items: stretch;
            flex-direction: column;
          }

          .campaign-pagination-actions {
            justify-content: flex-start;
          }
        }

        @media (max-width: 560px) {
          .campaign-hero {
            padding: 18px;
          }

          .campaign-hero p {
            font-size: 12.5px;
          }

          .hero-search {
            min-height: 48px;
          }

          .campaign-card {
            min-height: 154px;
            grid-template-columns: 108px minmax(0, 1fr);
            gap: 0 12px;
          }

          .campaign-image {
            min-height: 130px;
          }

          .campaign-meta span {
            min-height: 21px;
            padding: 0 8px;
            font-size: 9.5px;
          }

          .campaign-copy strong {
            font-size: 24px;
          }

          .campaign-title {
            font-size: 14px;
          }

          .campaign-action {
            width: 100%;
            min-height: 34px;
            font-size: 11px;
          }
        }

        @media (max-width: 374px) {
          .campaign-card {
            grid-template-columns: 92px minmax(0, 1fr);
            gap: 0 10px;
            padding: 10px;
          }

          .campaign-image {
            min-height: 122px;
          }

          .campaign-copy strong {
            font-size: 21px;
          }

          .campaign-place {
            font-size: 11px;
          }
        }
      `}</style>
    </main>
  );
}
