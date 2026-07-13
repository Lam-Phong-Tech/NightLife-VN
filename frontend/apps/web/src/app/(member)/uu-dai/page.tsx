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
import { couponApi, type PublicCoupon } from "@/lib/api/coupons";
import { translateText } from "@/lib/i18n/client-translations";
import { formatVndByLanguage } from "@/lib/i18n/currency-format";
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

const couponPageSize = 4;
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
  coupon: Pick<PublicCoupon, "discountType" | "discountValue">,
  language: LanguageCode = "vi",
) => {
  if (coupon.discountType === "PERCENT") {
    return `-${coupon.discountValue}%`;
  }

  return `-${formatVndByLanguage(coupon.discountValue, language)}`;
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
    normalized.includes("coupon") ||
    normalized.includes("deal") ||
    normalized.includes("/uu-dai")
  );
};

const getCouponImage = (coupon: PublicCoupon, index: number) =>
  coupon.store.media?.[0]?.url ??
  categoryImages[coupon.store.category] ??
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

const getStoreLocation = (coupon: PublicCoupon, language: LanguageCode) => {
  const area = [
    coupon.store.district ? normalizeDistrictLabel(coupon.store.district, language) : "",
    coupon.store.city ? normalizeCityLabel(coupon.store.city, language) : "",
  ]
    .filter(Boolean)
    .join(", ");

  return area || categoryLabels[coupon.store.category] || coupon.store.category;
};

const getCategoryLabel = (category: string, language: LanguageCode = "vi") =>
  translateText(categoryLabels[category] ?? category, language);

const couponCopy = (language: LanguageCode) =>
  ({
    vi: {
      validUntil: "HSD",
      viewOffer: "Xem ưu đãi",
      page: "Trang",
      previous: "Trước",
      next: "Sau",
      loadMore: "Xem thêm",
    },
    en: {
      validUntil: "Valid until",
      viewOffer: "View offer",
      page: "Page",
      previous: "Previous",
      next: "Next",
      loadMore: "Load more",
    },
    ja: {
      validUntil: "有効期限",
      viewOffer: "特典を見る",
      page: "ページ",
      previous: "前へ",
      next: "次へ",
      loadMore: "もっと見る",
    },
    ko: {
      validUntil: "유효기간",
      viewOffer: "혜택 보기",
      page: "페이지",
      previous: "이전",
      next: "다음",
      loadMore: "더 보기",
    },
    zh: {
      validUntil: "有效期至",
      viewOffer: "查看优惠",
      page: "页",
      previous: "上一页",
      next: "下一页",
      loadMore: "查看更多",
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
  const copy = couponCopy(language);
  return `${copy.page} ${page}/${totalPages}`;
};

function CouponDealCard({
  coupon,
  index,
  language,
}: {
  coupon: PublicCoupon;
  index: number;
  language: LanguageCode;
}) {
  const storeName = readableName(coupon.store.name);
  const couponName = readableName(coupon.name);
  const location = getStoreLocation(coupon, language);
  const copy = couponCopy(language);

  return (
    <Link
      aria-label={`${copy.viewOffer} ${couponName} ${language === "vi" ? "tại" : "at"} ${storeName}`}
      className="coupon-card"
      href={`/stores/${coupon.store.slug}`}
    >
      <span
        aria-label="Ảnh ưu đãi"
        className="coupon-image"
        role="img"
        style={{ backgroundImage: `url(${getCouponImage(coupon, index)})` }}
      >
        <span className="coupon-image-shade" />
      </span>
      <span className="coupon-copy">
        <span className="coupon-meta">
          <span>{getCategoryLabel(coupon.store.category, language)}</span>
          <span>
            {copy.validUntil} {formatShortDate(coupon.endsAt, language)}
          </span>
        </span>
        <strong>{formatDiscount(coupon, language)}</strong>
        <span className="coupon-title">{couponName}</span>
        <span className="coupon-place">
          <MapPin size={13} />
          {storeName} · {location}
        </span>
      </span>
      <span className="coupon-action">
        {copy.viewOffer}
        <ArrowRight size={14} />
      </span>
    </Link>
  );
}

export default function Page() {
  const activeLanguage = useActiveLanguage();
  const [coupons, setCoupons] = useState<PublicCoupon[]>([]);
  const [banners, setBanners] = useState<CmsContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    couponApi
      .listPublicCoupons()
      .then((data) => {
        if (isMounted) {
          setCoupons(data);
          setLoadError("");
        }
      })
      .catch((error) => {
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
    const counts = coupons.reduce<Record<string, number>>((acc, coupon) => {
      acc[coupon.store.category] = (acc[coupon.store.category] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([category, count]) => ({
      category,
      count,
      label: getCategoryLabel(category, activeLanguage),
    }));
  }, [activeLanguage, coupons]);

  const filteredCoupons = useMemo(() => {
    const query = normalizeText(searchTerm);

    return coupons.filter((coupon) => {
      const matchesCategory = activeCategory === "ALL" || coupon.store.category === activeCategory;
      const searchable = normalizeText(
        [
          coupon.name,
          coupon.code,
          coupon.description ?? "",
          coupon.store.name,
          coupon.store.city,
          coupon.store.district ?? "",
          getCategoryLabel(coupon.store.category),
          getCategoryLabel(coupon.store.category, activeLanguage),
        ].join(" "),
      );

      return matchesCategory && (!query || searchable.includes(query));
    });
  }, [activeCategory, activeLanguage, coupons, searchTerm]);

  const featuredCoupon = filteredCoupons[0] ?? coupons[0];
  const couponBanner = useMemo(() => banners.find(isCouponBanner) ?? null, [banners]);
  const couponBannerMetadata = couponBanner ? getCouponBannerMetadata(couponBanner) : null;
  const couponBannerImage =
    resolveClientUrl(couponBannerMetadata?.imageUrl) ||
    couponBannerMetadata?.imageUrl ||
    defaultCouponBannerImage;
  const couponHeroStyle = {
    "--coupon-hero-image": `url(${JSON.stringify(couponBannerImage)})`,
  } as CSSProperties;
  const couponHeroTitle = couponBanner?.title || "Ưu đãi đêm nay";
  const couponHeroDescription =
    couponBannerMetadata?.description ||
    couponBanner?.excerpt ||
    "Coupon & khuyến mãi từ các quán đối tác, dẫn thẳng về trang đặt bàn để nhận QR.";
  const couponHeroEyebrow = couponBannerMetadata?.tag || couponBannerMetadata?.statusLabel || "Xem danh sách quán";
  const couponHeroHref =
    couponBannerMetadata?.link && couponBannerMetadata.link !== "/uu-dai"
      ? couponBannerMetadata.link
      : "/danh-sach-quan";
  const totalPages = Math.max(1, Math.ceil(filteredCoupons.length / couponPageSize));
  const currentCouponPage = Math.min(currentPage, totalPages);
  const couponStartIndex = (currentCouponPage - 1) * couponPageSize;
  const paginatedCoupons = filteredCoupons.slice(couponStartIndex, couponStartIndex + couponPageSize);
  const shouldShowPagination = !isLoading && !loadError && filteredCoupons.length > couponPageSize;

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
    <main className="coupon-page">
      <section className="coupon-shell">
        <header className="coupon-hero" style={couponHeroStyle}>
          <div className="hero-copy">
            <Link className="back-link" href={couponHeroHref}>
              {couponHeroEyebrow}
            </Link>
            <h1>{couponHeroTitle}</h1>
            <p>{couponHeroDescription}</p>
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

        <section className="coupon-content">
          <aside className="coupon-panel" aria-label="Bộ lọc ưu đãi">
            <div className="panel-card featured-card">
              <span className="panel-icon">
                <Sparkles size={18} />
              </span>
              <span className="panel-eyebrow">Đang nổi bật</span>
              <strong>{featuredCoupon ? readableName(featuredCoupon.name) : "Ưu đãi mới"}</strong>
              <p>
                {featuredCoupon
                  ? `${readableName(featuredCoupon.store.name)} · ${formatDiscount(featuredCoupon, activeLanguage)}`
                  : "Các ưu đãi sẽ được cập nhật liên tục theo khu vực."}
              </p>
            </div>

            <div className="panel-card filter-card">
              <div className="panel-head">
                <span>
                  <Ticket size={17} />
                  Loại ưu đãi
                </span>
                <b>{filteredCoupons.length}</b>
              </div>
              <div className="filter-list">
                <button
                  className={activeCategory === "ALL" ? "active" : ""}
                  onClick={() => updateCategory("ALL")}
                  type="button"
                >
                  <span>Tất cả</span>
                  <b>{coupons.length}</b>
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

          <section className="coupon-results">
            <div className="result-head">
              <div>
                <span>Danh sách ưu đãi</span>
                <strong>{isLoading ? "Đang tải..." : `${filteredCoupons.length} ưu đãi phù hợp`}</strong>
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
              <section className="coupon-grid" aria-label="Đang tải ưu đãi">
                {[0, 1, 2, 3, 4, 5].map((item) => (
                  <div className="coupon-skeleton" key={item} />
                ))}
              </section>
            ) : null}

            {!isLoading && !loadError && filteredCoupons.length === 0 ? (
              <section className="empty-state">
                <Ticket size={32} />
                <h2>Chưa có coupon phù hợp</h2>
                <p>Thử đổi bộ lọc hoặc tìm theo tên quán/khu vực khác.</p>
                <button
                  onClick={clearFilters}
                  type="button"
                >
                  Xem tất cả ưu đãi
                </button>
              </section>
            ) : null}

            {!isLoading && !loadError && filteredCoupons.length ? (
              <section className="coupon-grid" aria-label="Danh sách coupon đang có">
                {paginatedCoupons.map((coupon, index) => (
                  <CouponDealCard
                    coupon={coupon}
                    index={couponStartIndex + index}
                    key={coupon.id}
                    language={activeLanguage}
                  />
                ))}
              </section>
            ) : null}

            {shouldShowPagination ? (
              <nav aria-label="Phân trang ưu đãi" className="coupon-pagination">
                <span>
                  {formatCouponPagination({
                    page: currentCouponPage,
                    totalPages,
                    language: activeLanguage,
                  })}
                </span>
                <div className="coupon-pagination-actions">
                  <button
                    disabled={currentCouponPage <= 1}
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    type="button"
                  >
                    {couponCopy(activeLanguage).previous}
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
                    {couponCopy(activeLanguage).next}
                  </button>
                  {currentCouponPage < totalPages ? (
                    <button
                      className="load-more"
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      type="button"
                    >
                      {couponCopy(activeLanguage).loadMore}
                    </button>
                  ) : null}
                </div>
              </nav>
            ) : null}
          </section>
        </section>
      </section>

      <style>{`
        .coupon-page {
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

        .coupon-shell {
          width: min(1180px, 100%);
          margin: 0 auto;
          display: grid;
          gap: 22px;
        }

        .coupon-hero {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          border: 1px solid rgba(212, 178, 106, .2);
          border-radius: 8px;
          background:
            linear-gradient(115deg, rgba(10, 10, 13, .76), rgba(13, 11, 16, .38) 52%, rgba(13, 9, 16, .18)),
            var(--coupon-hero-image, url("https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1400&q=76"));
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

        .coupon-hero::before {
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

        .coupon-hero p {
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

        .coupon-content {
          display: grid;
          grid-template-columns: 286px minmax(0, 1fr);
          gap: 18px;
          align-items: start;
        }

        .coupon-panel {
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

        .coupon-results {
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

        .coupon-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .coupon-card {
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

        .coupon-card:hover {
          transform: translateY(-2px);
          border-color: rgba(212, 178, 106, .44);
          background: linear-gradient(145deg, rgba(212, 178, 106, .12), rgba(255, 255, 255, .035));
        }

        .coupon-image {
          position: relative;
          grid-row: 1 / 3;
          min-height: 158px;
          overflow: hidden;
          border-radius: 8px;
          background-position: center;
          background-size: cover;
          border: 1px solid rgba(212, 178, 106, .18);
        }

        .coupon-image-shade {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 28%, rgba(12, 12, 15, .54));
        }

        .coupon-copy {
          min-width: 0;
          display: grid;
          align-content: start;
          gap: 6px;
          padding-top: 2px;
        }

        .coupon-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .coupon-meta span {
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

        .coupon-copy strong {
          color: #f0dda8;
          font-size: 30px;
          font-weight: 950;
          line-height: .98;
          white-space: nowrap;
        }

        .coupon-title {
          color: #fffaf1;
          font-size: 16px;
          font-weight: 900;
          line-height: 1.25;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .coupon-place {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 5px;
          color: #9f9789;
          font-size: 12px;
          line-height: 1.35;
          overflow: hidden;
        }

        .coupon-place svg {
          flex: none;
          color: #d4b26a;
        }

        .coupon-action {
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

        .coupon-skeleton {
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

        .coupon-pagination {
          border: 1px solid rgba(212, 178, 106, .16);
          border-radius: 8px;
          background: rgba(255, 255, 255, .035);
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .coupon-pagination > span {
          color: #bdb4a5;
          font-size: 12px;
          font-weight: 800;
        }

        .coupon-pagination-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 7px;
          flex-wrap: wrap;
        }

        .coupon-pagination button {
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

        .coupon-pagination button.active,
        .coupon-pagination button.load-more {
          border-color: transparent;
          background: linear-gradient(135deg, #f4e3b4, #d4b26a 58%, #b6924a);
          color: #17130c;
        }

        .coupon-pagination button:disabled {
          cursor: not-allowed;
          opacity: .45;
        }

        html.vy-light .coupon-page {
          background:
            radial-gradient(circle at 18% 0%, rgba(168, 124, 52, .1), transparent 32%),
            radial-gradient(circle at 84% 12%, rgba(194, 81, 126, .08), transparent 30%),
            #f6f4ef;
          color: #211e19;
        }

        html.vy-light .coupon-hero {
          border-color: rgba(150, 116, 52, .28);
          background:
            linear-gradient(115deg, rgba(255, 250, 242, .78), rgba(246, 244, 239, .42) 54%, rgba(246, 244, 239, .22)),
            var(--coupon-hero-image, url("https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1400&q=76"));
          background-position: center;
          background-size: cover;
          box-shadow:
            inset 0 0 0 1px rgba(255, 255, 255, .68),
            0 22px 54px -34px rgba(40, 30, 10, .34);
        }

        html.vy-light .coupon-hero::before {
          background:
            radial-gradient(circle at 82% 32%, rgba(168, 124, 52, .16), transparent 34%),
            linear-gradient(90deg, rgba(255, 250, 242, .8), rgba(246, 244, 239, .34) 50%, rgba(246, 244, 239, .14));
        }

        html.vy-light .back-link,
        html.vy-light h1,
        html.vy-light .coupon-hero p {
          text-shadow: none;
        }

        html.vy-light .back-link,
        html.vy-light .panel-eyebrow,
        html.vy-light .filter-list b,
        html.vy-light .note-card,
        html.vy-light .coupon-place svg {
          color: #8f6a2a;
        }

        html.vy-light h1,
        html.vy-light .featured-card strong,
        html.vy-light .panel-head span,
        html.vy-light .result-head strong,
        html.vy-light .coupon-title,
        html.vy-light .empty-state h2 {
          color: #211e19;
        }

        html.vy-light .coupon-hero p,
        html.vy-light .featured-card p,
        html.vy-light .note-card p,
        html.vy-light .coupon-place,
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
        html.vy-light .coupon-card,
        html.vy-light .empty-state,
        html.vy-light .coupon-pagination {
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
        html.vy-light .coupon-meta span,
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

        html.vy-light .coupon-card {
          background: linear-gradient(145deg, rgba(255, 255, 255, .92), rgba(246, 244, 239, .78));
          color: #211e19;
        }

        html.vy-light .coupon-card:hover {
          border-color: rgba(150, 116, 52, .52);
          background: linear-gradient(145deg, rgba(255, 255, 255, .98), rgba(168, 124, 52, .12));
        }

        html.vy-light .coupon-image {
          border-color: rgba(150, 116, 52, .22);
        }

        html.vy-light .coupon-image-shade {
          background: linear-gradient(180deg, transparent 32%, rgba(246, 244, 239, .16));
        }

        html.vy-light .coupon-copy strong {
          color: #8f6a2a;
        }

        html.vy-light .coupon-meta span {
          color: #8f6a2a;
        }

        html.vy-light .result-head span {
          color: #8c8679;
        }

        html.vy-light .coupon-pagination > span {
          color: #6f675c;
        }

        html.vy-light .coupon-pagination button {
          border-color: rgba(150, 116, 52, .24);
          background: rgba(28, 22, 10, .035);
          color: #8f6a2a;
        }

        html.vy-light .coupon-pagination button.active,
        html.vy-light .coupon-pagination button.load-more {
          background: linear-gradient(135deg, #f4e3b4, #d4b26a 58%, #b6924a);
          color: #17130c;
        }

        html.vy-light .result.error {
          border-color: rgba(194, 69, 92, .34);
          background: rgba(194, 69, 92, .08);
          color: #9f263a;
        }

        html.vy-light .coupon-skeleton {
          background: linear-gradient(90deg, rgba(28, 22, 10, .035), rgba(168, 124, 52, .16), rgba(28, 22, 10, .035));
          background-size: 220% 100%;
        }

        @keyframes shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }

        @media (max-width: 1120px) {
          .coupon-content {
            grid-template-columns: 1fr;
          }

          .coupon-panel {
            position: static;
            grid-template-columns: 1fr 1fr;
          }

          .note-card {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 820px) {
          .coupon-page {
            min-height: auto;
            padding: 18px 16px 22px;
          }

          .coupon-shell {
            gap: 16px;
          }

          .coupon-hero {
            grid-template-columns: 1fr;
            padding: 22px;
          }

          h1 {
            font-size: 34px;
          }

          .coupon-panel {
            grid-template-columns: 1fr;
          }

          .coupon-grid {
            grid-template-columns: 1fr;
          }

          .coupon-pagination {
            align-items: stretch;
            flex-direction: column;
          }

          .coupon-pagination-actions {
            justify-content: flex-start;
          }
        }

        @media (max-width: 560px) {
          .coupon-hero {
            padding: 18px;
          }

          .coupon-hero p {
            font-size: 12.5px;
          }

          .hero-search {
            min-height: 48px;
          }

          .coupon-card {
            min-height: 154px;
            grid-template-columns: 108px minmax(0, 1fr);
            gap: 0 12px;
          }

          .coupon-image {
            min-height: 130px;
          }

          .coupon-meta span {
            min-height: 21px;
            padding: 0 8px;
            font-size: 9.5px;
          }

          .coupon-copy strong {
            font-size: 24px;
          }

          .coupon-title {
            font-size: 14px;
          }

          .coupon-action {
            width: 100%;
            min-height: 34px;
            font-size: 11px;
          }
        }

        @media (max-width: 374px) {
          .coupon-card {
            grid-template-columns: 92px minmax(0, 1fr);
            gap: 0 10px;
            padding: 10px;
          }

          .coupon-image {
            min-height: 122px;
          }

          .coupon-copy strong {
            font-size: 21px;
          }

          .coupon-place {
            font-size: 11px;
          }
        }
      `}</style>
    </main>
  );
}
