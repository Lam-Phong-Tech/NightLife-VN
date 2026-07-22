"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Ticket,
} from "lucide-react";
import { ApiError } from "@/lib/api/client";
import { campaignsApi, type CampaignItem } from "@/lib/api/campaigns";
import { useMoneyFormatter } from "@/components/providers/CurrencyProvider";
import { translateText } from "@/lib/i18n/client-translations";
import { formatVndByLanguage, type CurrencyRateMap } from "@/lib/i18n/currency-format";
import {
  intlLocaleByLanguage,
  useActiveLanguage,
  type LanguageCode,
} from "@/lib/i18n/use-active-language";

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
const expiringSoonWindowMs = 24 * 60 * 60 * 1000;
const campaignClockTickMs = 60 * 1000;

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

const timestampFromDate = (value?: string | null) => {
  if (!value) return null;

  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
};

const campaignRemainingMs = (campaign: CampaignItem, nowMs: number) => {
  const endsAtMs = timestampFromDate(campaign.endsAt);
  return endsAtMs === null ? null : endsAtMs - nowMs;
};

const isCampaignAvailableNow = (campaign: CampaignItem, nowMs: number) => {
  if (campaign.status !== "ACTIVE" || !campaign.targetStore) return false;

  const startsAtMs = timestampFromDate(campaign.startsAt);
  if (startsAtMs !== null && startsAtMs > nowMs) return false;

  const remainingMs = campaignRemainingMs(campaign, nowMs);
  return remainingMs === null || remainingMs > 0;
};

const isCampaignExpiringSoon = (campaign: CampaignItem, nowMs: number) => {
  const remainingMs = campaignRemainingMs(campaign, nowMs);
  return remainingMs !== null && remainingMs > 0 && remainingMs <= expiringSoonWindowMs;
};

const formatRemainingTime = (remainingMs: number, language: LanguageCode) => {
  const minuteCount = Math.ceil(remainingMs / 60000);

  if (minuteCount <= 1) {
    return {
      vi: "dưới 1 phút",
      en: "under 1 minute",
      ja: "1分未満",
      ko: "1분 미만",
      zh: "不到 1 分钟",
    }[language];
  }

  if (minuteCount < 60) {
    return {
      vi: `còn ${minuteCount} phút`,
      en: `${minuteCount} minute${minuteCount === 1 ? "" : "s"} left`,
      ja: `残り${minuteCount}分`,
      ko: `${minuteCount}분 남음`,
      zh: `剩余 ${minuteCount} 分钟`,
    }[language];
  }

  const hourCount = Math.ceil(minuteCount / 60);
  if (hourCount <= 24) {
    return {
      vi: `còn ${hourCount} giờ`,
      en: `${hourCount} hour${hourCount === 1 ? "" : "s"} left`,
      ja: `残り${hourCount}時間`,
      ko: `${hourCount}시간 남음`,
      zh: `剩余 ${hourCount} 小时`,
    }[language];
  }

  const dayCount = Math.ceil(hourCount / 24);
  return {
    vi: `còn ${dayCount} ngày`,
    en: `${dayCount} day${dayCount === 1 ? "" : "s"} left`,
    ja: `残り${dayCount}日`,
    ko: `${dayCount}일 남음`,
    zh: `剩余 ${dayCount} 天`,
  }[language];
};

const formatExpiringSoonLabel = (remainingMs: number, language: LanguageCode, label: string) => {
  const remainingText = formatRemainingTime(remainingMs, language);
  return `${label} - ${remainingText}`;
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

const getCampaignImage = (campaign: CampaignItem, index: number) =>
  campaign.targetStore!.media?.[0]?.url ??
  categoryImages[campaign.targetStore!.category] ??
  fallbackImages[index % fallbackImages.length];

const campaignStoreHref = (campaign: CampaignItem) => {
  const slug = campaign.targetStore?.slug;
  if (!slug) {
    return "/danh-sach-quan";
  }

  const params = new URLSearchParams({ couponId: campaign.id });
  return `/stores/${slug}?${params.toString()}`;
};

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

const campaignUiCopy = (language: LanguageCode) =>
  ({
    vi: {
      all: "Tất cả",
      allStores: "Tất cả quán",
      bestDiscount: "Ưu đãi tốt nhất",
      byStore: "Theo quán",
      claim: "Lấy mã",
      emptyAction: "Xem tất cả ưu đãi",
      emptyBody: "Thử đổi bộ lọc hoặc tìm theo tên quán/khu vực khác.",
      emptyTitle: "Chưa có campaign phù hợp",
      expiring: "Sắp hết hạn",
      listLabel: "Danh sách campaign đang có",
      loadingLabel: "Đang tải ưu đãi",
      newest: "Mới nhất",
      sort: "Sắp xếp:",
      subtitle: "Coupon & khuyến mãi từ các quán đối tác",
      title: "Ưu đãi đêm nay",
      allCities: "Toàn quốc",
      used: "Đã dùng",
      validUntil: "HSD",
    },
    en: {
      all: "All",
      allStores: "All venues",
      bestDiscount: "Best deals",
      byStore: "By venue",
      claim: "Claim",
      emptyAction: "View all deals",
      emptyBody: "Try another filter or search by venue or area.",
      emptyTitle: "No matching campaigns",
      expiring: "Expiring soon",
      listLabel: "Available campaign list",
      loadingLabel: "Loading deals",
      newest: "Newest",
      sort: "Sort:",
      subtitle: "Coupons and promotions from partner venues",
      title: "Tonight's deals",
      allCities: "All areas",
      used: "Used",
      validUntil: "Valid until",
    },
    ja: {
      all: "すべて",
      allStores: "全店舗",
      bestDiscount: "お得順",
      byStore: "店舗別",
      claim: "取得",
      emptyAction: "すべての特典を見る",
      emptyBody: "別のフィルター、店舗名、エリアで検索してください。",
      emptyTitle: "該当するキャンペーンはありません",
      expiring: "まもなく終了",
      listLabel: "利用可能なキャンペーン一覧",
      loadingLabel: "特典を読み込み中",
      newest: "新着",
      sort: "並び替え:",
      subtitle: "提携店舗のクーポン・キャンペーン",
      title: "今夜の特典",
      allCities: "全エリア",
      used: "使用済み",
      validUntil: "有効期限",
    },
    ko: {
      all: "전체",
      allStores: "전체 매장",
      bestDiscount: "최고 혜택",
      byStore: "매장별",
      claim: "받기",
      emptyAction: "전체 혜택 보기",
      emptyBody: "다른 필터를 선택하거나 매장/지역으로 검색해 보세요.",
      emptyTitle: "일치하는 캠페인이 없습니다",
      expiring: "곧 만료",
      listLabel: "이용 가능한 캠페인 목록",
      loadingLabel: "혜택 불러오는 중",
      newest: "최신순",
      sort: "정렬:",
      subtitle: "제휴 매장의 쿠폰 및 프로모션",
      title: "오늘 밤 혜택",
      allCities: "전체 지역",
      used: "사용됨",
      validUntil: "유효 기간",
    },
    zh: {
      all: "全部",
      allStores: "全部场所",
      bestDiscount: "最佳优惠",
      byStore: "按场所",
      claim: "领取",
      emptyAction: "查看全部优惠",
      emptyBody: "尝试切换筛选，或按场所/区域搜索。",
      emptyTitle: "暂无匹配活动",
      expiring: "即将结束",
      listLabel: "可用活动列表",
      loadingLabel: "正在加载优惠",
      newest: "最新",
      sort: "排序:",
      subtitle: "合作场所的优惠券和促销",
      title: "今晚优惠",
      allCities: "全部地区",
      used: "已使用",
      validUntil: "有效期至",
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
  copy,
  rates,
  nowMs,
}: {
  campaign: CampaignItem;
  index: number;
  language: LanguageCode;
  copy: ReturnType<typeof campaignUiCopy>;
  rates: CurrencyRateMap;
  nowMs: number;
}) {
  const storeName = readableName(campaign.targetStore!.name);
  const campaignName = readableName(campaign.name);
  const isVip = campaign.name.toUpperCase().includes("VIP");

  const isUsed = false;
  const remainingMs = campaignRemainingMs(campaign, nowMs);
  const urgentLabel =
    remainingMs !== null && remainingMs > 0 && remainingMs <= expiringSoonWindowMs
      ? formatExpiringSoonLabel(remainingMs, language, copy.expiring)
      : "";

  const discountText = formatDiscount(campaign, language, rates);

  return (
    <Link
      className={`coupon-ticket ${isUsed ? "used" : ""} ${isVip ? "vip" : ""}`}
      href={campaignStoreHref(campaign)}
      aria-label={`${campaignName} at ${storeName}`}
    >
      <div 
        className="coupon-thumb" 
        style={{ backgroundImage: `url(${getCampaignImage(campaign, index)})` }} 
      />
      
      <div className="coupon-details">
        <div className="coupon-header-row">
          <span className="coupon-discount">{discountText}</span>
          {isVip && <span className="coupon-vip-badge">VIP</span>}
          {!isVip && <span className="coupon-title-inline">{campaignName}</span>}
        </div>
        
        {isVip && <div className="coupon-title-block">{campaignName}</div>}
        
        <div className="coupon-store-info">
          {storeName} · {campaign.targetStore?.district || ""}
          {campaign.endsAt && ` · ${copy.validUntil} ${formatShortDate(campaign.endsAt, language)}`}
        </div>

        {urgentLabel && (
          <div className="coupon-status-urgent">
            <span className="dot" />
            {urgentLabel}
          </div>
        )}
      </div>

      <div className="coupon-action-tab">
        <span className="vertical-text">{isUsed ? copy.used : copy.claim}</span>
      </div>
    </Link>
  );
}

export default function Page() {
  const activeLanguage = useActiveLanguage();
  const copy = campaignUiCopy(activeLanguage);
  const { rates } = useMoneyFormatter(activeLanguage);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [nowMs, setNowMs] = useState(() => Date.now());
  
  // New filter types: 'ALL' | 'EXPIRING' | 'BY_STORE' | 'VIP'
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'EXPIRING' | 'BY_STORE' | 'VIP'>('ALL');
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), campaignClockTickMs);
    return () => window.clearInterval(timer);
  }, []);

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
          error instanceof ApiError
            ? error.message
            : "Không tải được danh sách ưu đãi từ backend.";
        setLoadError(message);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const availableCampaigns = useMemo(
    () => campaigns.filter((campaign) => isCampaignAvailableNow(campaign, nowMs)),
    [campaigns, nowMs],
  );

  const uniqueStores = useMemo(() => {
    const storesMap = new Map<string, { id: string; name: string }>();
    availableCampaigns.forEach(c => {
      if (c.targetStore) {
        storesMap.set(c.targetStore.id, { id: c.targetStore.id, name: c.targetStore.name });
      }
    });
    return Array.from(storesMap.values());
  }, [availableCampaigns]);

  const filteredCampaigns = useMemo(() => {
    let result = [...availableCampaigns];

    if (activeFilter === "VIP") {
      result = result.filter(c => c.name.toUpperCase().includes("VIP"));
    } else if (activeFilter === "EXPIRING") {
      result = result.filter(c => isCampaignExpiringSoon(c, nowMs));
    } else if (activeFilter === "BY_STORE" && selectedStoreId) {
      result = result.filter(c => c.targetStoreId === selectedStoreId);
    }

    const query = normalizeText(searchTerm);
    if (query) {
      result = result.filter((campaign) => {
        const searchable = normalizeText(
          [
            campaign.name,
            campaign.targetStore!.name,
            campaign.targetStore!.city,
            campaign.targetStore!.district ?? "",
          ].join(" "),
        );
        return searchable.includes(query);
      });
    }

    result.sort((a, b) => {
      if (activeFilter === "EXPIRING") {
        return (
          (timestampFromDate(a.endsAt) ?? Number.MAX_SAFE_INTEGER) -
          (timestampFromDate(b.endsAt) ?? Number.MAX_SAFE_INTEGER)
        );
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [availableCampaigns, activeFilter, selectedStoreId, searchTerm, nowMs]);

  const totalPages = Math.max(1, Math.ceil(filteredCampaigns.length / campaignPageSize));
  const currentCouponPage = Math.min(currentPage, totalPages);
  const campaignStartIndex = (currentCouponPage - 1) * campaignPageSize;
  const paginatedCoupons = filteredCampaigns.slice(campaignStartIndex, campaignStartIndex + campaignPageSize);
  const shouldShowPagination = !isLoading && !loadError && filteredCampaigns.length > campaignPageSize;

  const updateFilter = (filter: 'ALL' | 'EXPIRING' | 'BY_STORE' | 'VIP') => {
    setActiveFilter(filter);
    setSelectedStoreId(null);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setActiveFilter("ALL");
    setSelectedStoreId(null);
    setCurrentPage(1);
  };

  return (
    <main className="campaign-page">
      <section className="campaign-shell">
        <header className="campaign-header-simple">
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </header>

        {loadError ? (
          <section className="result error" role="alert">
            <AlertCircle size={20} />
            <span>{translateText(loadError, activeLanguage)}</span>
          </section>
        ) : null}

        <div className="filter-sort-row">
          <div className="filter-chips">
            <button
              className={activeFilter === "ALL" ? "active" : ""}
              onClick={() => updateFilter("ALL")}
              type="button"
            >
              {copy.all}
            </button>
            <button
              className={activeFilter === "EXPIRING" ? "active" : ""}
              onClick={() => updateFilter("EXPIRING")}
              type="button"
            >
              {copy.expiring}
            </button>
            <button
              className={activeFilter === "BY_STORE" ? "active" : ""}
              onClick={() => updateFilter("BY_STORE")}
              type="button"
            >
              {copy.byStore}
            </button>
          </div>

        </div>

        {activeFilter === 'BY_STORE' && uniqueStores.length > 0 && (
          <div className="store-sub-filters">
            <button 
              className={!selectedStoreId ? 'active' : ''} 
              onClick={() => setSelectedStoreId(null)}
              type="button"
            >
              {copy.allStores}
            </button>
            {uniqueStores.map(store => (
              <button 
                key={store.id} 
                className={selectedStoreId === store.id ? 'active' : ''} 
                onClick={() => setSelectedStoreId(store.id)}
                type="button"
              >
                {readableName(store.name)}
              </button>
            ))}
          </div>
        )}

        <section className="campaign-content">
          <section className="campaign-results">
            {isLoading ? (
              <section className="campaign-grid" aria-label={copy.loadingLabel}>
                {[0, 1, 2, 3, 4, 5].map((item) => (
                  <div className="campaign-skeleton" key={item} />
                ))}
              </section>
            ) : null}

            {!isLoading && !loadError && filteredCampaigns.length === 0 ? (
              <section className="empty-state">
                <Ticket size={32} />
                <h2>{copy.emptyTitle}</h2>
                <p>{copy.emptyBody}</p>
                <button
                  onClick={clearFilters}
                  type="button"
                >
                  {copy.emptyAction}
                </button>
              </section>
            ) : null}

            {!isLoading && !loadError && filteredCampaigns.length ? (
              <section className="campaign-grid" aria-label={copy.listLabel}>
                {paginatedCoupons.map((campaign, index) => (
                  <CampaignDealCard
                    campaign={campaign}
                    index={campaignStartIndex + index}
                    key={campaign.id}
                    language={activeLanguage}
                    copy={copy}
                    rates={rates}
                    nowMs={nowMs}
                  />
                ))}
              </section>
            ) : null}

            {shouldShowPagination ? (
              <nav aria-label={translateText("Phân trang ưu đãi", activeLanguage)} className="campaign-pagination">
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
          min-height: auto;
          background:
            radial-gradient(circle at 18% 0%, rgba(212, 178, 106, .14), transparent 32%),
            radial-gradient(circle at 84% 12%, rgba(255, 122, 154, .08), transparent 30%),
            #0c0c0f;
          color: #f3f0ea;
          font-family: var(--nl-font-sans);
          overflow-x: hidden;
          padding: 40px 28px 34px;
        }

        .campaign-shell {
          width: min(1180px, 100%);
          margin: 0 auto;
          display: grid;
          gap: 28px;
        }

        .campaign-header-simple {
          display: grid;
          gap: 6px;
        }

        .campaign-header-simple h1 {
          color: #fffaf1;
          font-size: clamp(32px, 3.5vw, 42px);
          font-weight: 700;
          letter-spacing: -0.5px;
          margin: 0;
        }

        .campaign-header-simple p {
          color: #8c8679;
          font-size: 13.5px;
          margin: 0;
        }

        .filter-sort-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          min-width: 0;
          flex-wrap: nowrap;
          border-bottom: 1px solid rgba(255, 255, 255, .08);
          padding-bottom: 16px;
        }

        .filter-chips {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          flex: 1 1 auto;
          flex-wrap: nowrap;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .filter-chips::-webkit-scrollbar {
          display: none;
        }

        .filter-chips button {
          border: 0;
          font: inherit;
          cursor: pointer;
          min-height: 38px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 18px;
          background: rgba(255, 255, 255, .035);
          color: #bdb4a5;
          padding: 0 16px;
          font-size: 13px;
          font-weight: 600;
          flex: 0 0 auto;
          white-space: nowrap;
          transition: background .2s, color .2s, border-color .2s;
        }

        .filter-chips button:hover {
          background: rgba(255, 255, 255, .06);
          color: #f3f0ea;
        }

        .filter-chips button.active {
          background: linear-gradient(135deg, #f4e3b4, #d4b26a 55%, #b6924a);
          color: #241a0a;
        }

        .filter-chips button.vip-only-chip {
          border: 1px solid rgba(212, 178, 106, .22);
          gap: 6px;
        }

        .filter-chips button.vip-only-chip.active {
          border-color: transparent;
        }

        .store-sub-filters {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          margin-top: -12px;
        }

        .store-sub-filters button {
          border: 0;
          font: inherit;
          cursor: pointer;
          font-size: 11.5px;
          padding: 4px 10px;
          border-radius: 6px;
          color: #8c8679;
          background: transparent;
          transition: background .2s, color .2s;
        }

        .store-sub-filters button.active,
        .store-sub-filters button:hover {
          background: rgba(212, 178, 106, 0.12);
          color: #e3c27e;
        }

        .campaign-content {
          min-width: 0;
        }

        .campaign-results {
          display: grid;
          gap: 20px;
        }

        .campaign-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .coupon-ticket {
          display: flex;
          height: 98px;
          background: rgba(255, 255, 255, .035);
          border: 1px solid rgba(212, 178, 106, .18);
          border-radius: 14px;
          overflow: hidden;
          text-decoration: none;
          color: #f3f0ea;
          box-shadow: 0 16px 34px -18px rgba(0,0,0,.7);
          transition: transform .2s, border-color .2s, background .2s;
        }

        .coupon-ticket:hover {
          transform: translateY(-2px);
          border-color: rgba(212, 178, 106, .45);
          background: rgba(255, 255, 255, .05);
        }

        .coupon-ticket.vip {
          position: relative;
        }

        .coupon-ticket.vip::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(135deg, #f4e3b4, #d4b26a 55%, #b6924a);
        }

        .coupon-thumb {
          width: 98px;
          height: 100%;
          background-size: cover;
          background-position: center;
          flex-shrink: 0;
          border-right: 1px solid rgba(255, 255, 255, 0.05);
        }

        .coupon-details {
          flex-grow: 1;
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-width: 0;
        }

        .coupon-header-row {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .coupon-discount {
          font-size: 18px;
          font-weight: 700;
          color: #e3c27e;
          line-height: 1.1;
          flex-shrink: 0;
        }

        .coupon-vip-badge {
          background: linear-gradient(135deg, #f4e3b4, #d4b26a 55%, #b6924a);
          color: #241a0a;
          font-size: 9px;
          font-weight: 700;
          padding: 1px 5px;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          line-height: 1.1;
          flex-shrink: 0;
        }

        .coupon-title-inline {
          font-size: 13.5px;
          font-weight: 600;
          color: #f3f0ea;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .coupon-title-block {
          font-size: 13.5px;
          font-weight: 600;
          color: #f3f0ea;
          margin-top: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .coupon-store-info {
          font-size: 11px;
          color: #8c8679;
          margin-top: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .coupon-status-urgent {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #e0729e;
          margin-top: 4px;
          font-weight: 500;
        }

        .coupon-status-urgent .dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background-color: #e0729e;
          box-shadow: 0 0 6px #e0729e;
        }

        .coupon-action-tab {
          width: 36px;
          border-left: 1px dashed rgba(212, 178, 106, .22);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: rgba(212, 178, 106, 0.01);
        }

        .coupon-ticket.used {
          opacity: 0.5;
        }

        .coupon-ticket.used .coupon-action-tab {
          border-left-color: rgba(255, 255, 255, 0.1);
        }

        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #d4b26a;
        }

        .coupon-ticket.used .vertical-text {
          color: #8c8679;
        }

        .campaign-skeleton {
          height: 98px;
          border-radius: 14px;
          background: linear-gradient(90deg, rgba(255, 255, 255, .035), rgba(212, 178, 106, .14), rgba(255, 255, 255, .035));
          background-size: 220% 100%;
          animation: shimmer 1.4s ease-in-out infinite;
        }

        .empty-state {
          min-height: 260px;
          border: 1px solid rgba(212, 178, 106, .18);
          border-radius: 14px;
          background: rgba(255, 255, 255, .03);
          display: grid;
          place-items: center;
          gap: 10px;
          padding: 34px;
          text-align: center;
        }

        .empty-state h2 {
          color: #f3f0ea;
          font-size: 20px;
        }

        .empty-state p {
          color: #8c8679;
          font-size: 13px;
        }

        .empty-state button {
          border: 0;
          font: inherit;
          cursor: pointer;
          min-height: 38px;
          border-radius: 18px;
          background: rgba(212, 178, 106, .14);
          color: #e3c27e;
          padding: 0 16px;
          font-size: 12.5px;
          font-weight: 700;
        }

        .campaign-pagination {
          border: 1px solid rgba(255, 255, 255, .05);
          border-radius: 14px;
          background: rgba(255, 255, 255, .02);
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .campaign-pagination > span {
          color: #8c8679;
          font-size: 12.5px;
          font-weight: 600;
        }

        .campaign-pagination-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .campaign-pagination button {
          min-width: 34px;
          min-height: 34px;
          border: 1px solid rgba(255, 255, 255, .1);
          border-radius: 8px;
          background: rgba(255, 255, 255, .03);
          color: #bdb4a5;
          font: inherit;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          padding: 0 8px;
        }

        .campaign-pagination button.active {
          border-color: transparent;
          background: linear-gradient(135deg, #f4e3b4, #d4b26a 58%, #b6924a);
          color: #241a0a;
        }

        .campaign-pagination button:disabled {
          cursor: not-allowed;
          opacity: .35;
        }

        /* Light mode overrides */
        html.vy-light .campaign-page {
          background: #f6f4ef;
          color: #211e19;
        }

        html.vy-light .empty-state {
          border-color: rgba(150, 116, 52, .18);
          background: rgba(255, 255, 255, .7);
        }

        html.vy-light .empty-state h2 {
          color: #211e19;
        }

        html.vy-light .empty-state p {
          color: #6f675c;
        }

        html.vy-light .empty-state svg {
          color: #8c8679;
        }

        html.vy-light .empty-state button {
          background: #d4b26a;
          color: #241a0a;
        }

        html.vy-light .empty-state button:hover {
          background: #b6924a;
          color: #ffffff;
        }

        html.vy-light .campaign-header-simple h1 {
          color: #211e19;
        }

        html.vy-light .campaign-header-simple p {
          color: #6f675c;
        }

        html.vy-light .filter-sort-row {
          border-bottom-color: rgba(30, 24, 12, .1);
        }

        html.vy-light .filter-chips button {
          background: rgba(28, 22, 10, .035);
          color: #57534b;
        }

        html.vy-light .filter-chips button:hover {
          background: rgba(28, 22, 10, .06);
        }

        html.vy-light .filter-chips button.active {
          background: linear-gradient(135deg, #f4e3b4, #d4b26a 58%, #b6924a);
          color: #241a0a;
        }

        html.vy-light .filter-chips button.vip-only-chip {
          border-color: rgba(168, 124, 52, .24);
        }

        html.vy-light .store-sub-filters {
          background: rgba(28, 22, 10, 0.01);
          border-color: rgba(30, 24, 12, .05);
        }

        html.vy-light .store-sub-filters button {
          color: #6f675c;
        }

        html.vy-light .store-sub-filters button.active,
        html.vy-light .store-sub-filters button:hover {
          background: rgba(168, 124, 52, 0.1);
          color: #8f6a2a;
        }

        html.vy-light .coupon-ticket {
          background: rgba(255, 255, 255, .82);
          border-color: rgba(150, 116, 52, .22);
          color: #211e19;
          box-shadow: 0 16px 34px -28px rgba(40, 30, 10, .18);
        }

        html.vy-light .coupon-ticket:hover {
          background: #fff;
          border-color: rgba(150, 116, 52, .44);
        }

        html.vy-light .coupon-thumb {
          border-right-color: rgba(30, 24, 12, .05);
        }

        html.vy-light .coupon-title-inline,
        html.vy-light .coupon-title-block {
          color: #211e19;
        }

        html.vy-light .coupon-store-info {
          color: #6f675c;
        }

        html.vy-light .coupon-discount {
          color: #8f6a2a;
        }

        html.vy-light .coupon-action-tab {
          border-left-color: rgba(150, 116, 52, .22);
        }

        html.vy-light .campaign-pagination {
          border-color: rgba(150, 116, 52, .18);
          background: rgba(255, 255, 255, .7);
        }

        html.vy-light .campaign-pagination button {
          border-color: rgba(30, 24, 12, .15);
          background: rgba(255, 255, 255, .8);
          color: #57534b;
        }

        html.vy-light .campaign-pagination button.active {
          background: linear-gradient(135deg, #f4e3b4, #d4b26a 58%, #b6924a);
          color: #241a0a;
        }

        @keyframes shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }

        @media (max-width: 820px) {
          .campaign-page {
            padding: 24px 16px 40px;
          }

          .campaign-shell {
            gap: 22px;
          }

          .filter-sort-row {
            gap: 10px;
            padding-bottom: 12px;
          }

          .filter-chips {
            gap: 8px;
          }

          .filter-chips button {
            min-height: 34px;
            border-radius: 17px;
            padding: 0 12px;
            font-size: 12px;
          }

          .campaign-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
