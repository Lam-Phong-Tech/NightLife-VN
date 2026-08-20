"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Route,
  Search,
  Sparkles,
} from "lucide-react";

import { PlaceholderMedia } from "@/components/ui/MediaPlaceholder";
import { translateText } from "@/lib/i18n/client-translations";
import { useActiveLanguage, type LanguageCode } from "@/lib/i18n/use-active-language";
import { tourApi, type PublicTour } from "@/lib/api/tours";

const cityOptions = [
  { id: "all", label: "Tất cả", value: "" },
  { id: "hn", label: "Hà Nội", value: "Hanoi" },
  { id: "hcm", label: "TP.HCM", value: "Ho Chi Minh City" },
] as const;

type CityFilter = (typeof cityOptions)[number]["id"];

const categoryLabels: Record<string, string> = {
  BAR: "Bar",
  CLUB: "Club",
  LOUNGE: "Lounge",
  GIRLS_BAR: "Girls bar",
  KARAOKE: "Karaoke",
  MASSAGE_SPA: "Spa",
  RESTAURANT: "Nhà hàng",
  CASINO: "Casino",
};

const emptyTourImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop stop-color='%2318181c'/%3E%3Cstop offset='.54' stop-color='%23342d21'/%3E%3Cstop offset='1' stop-color='%23101114'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='800' fill='url(%23g)'/%3E%3Ccircle cx='420' cy='380' r='72' fill='%23f0dda8' opacity='.14'/%3E%3Ccircle cx='600' cy='380' r='72' fill='%23f0dda8' opacity='.22'/%3E%3Ccircle cx='780' cy='380' r='72' fill='%23f0dda8' opacity='.14'/%3E%3Cpath d='M492 380h216' stroke='%23f0dda8' stroke-width='18' stroke-linecap='round' opacity='.2'/%3E%3C/svg%3E";

const normalizeSearch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const localize = (value: string, language: LanguageCode) =>
  language === "vi" ? value : translateText(value, language);

const tourDirectoryCopy: Record<LanguageCode, {
  backHome: string;
  title: string;
  eyebrow: string;
  searchAria: string;
  searchPlaceholder: string;
  cityAria: string;
  searchButton: string;
  suggestionLabel: string;
  suggestionsLoading: string;
  suggestionsEmpty: string;
  reset: string;
  loadFailed: string;
  listAria: string;
  emptyTitle: string;
  emptyDescription: string;
  requestTime: string;
  noTourImage: string;
  freeExperience: string;
  hasDeals: string;
  itinerary: string;
  viewTour: string;
}> = {
  vi: {
    backHome: "Quay lại trang chủ",
    title: "Danh sách tour nightlife",
    eyebrow: "",
    searchAria: "Tìm tour",
    searchPlaceholder: "Tìm tour, quán hoặc khu vực...",
    cityAria: "Chọn thành phố",
    searchButton: "Tìm",
    suggestionLabel: "Gợi ý tour",
    suggestionsLoading: "Đang tìm tour...",
    suggestionsEmpty: "Không có gợi ý trùng khớp.",
    reset: "Đặt lại",
    loadFailed: "Chưa tải được danh sách tour. Vui lòng thử lại sau.",
    listAria: "Danh sách tour",
    emptyTitle: "Chưa có tour phù hợp",
    emptyDescription: "Đổi thành phố hoặc từ khóa để xem thêm hành trình.",
    requestTime: "Theo yêu cầu",
    noTourImage: "Chưa có ảnh tour",
    freeExperience: "Trải nghiệm tự do",
    hasDeals: "Có ưu đãi",
    itinerary: "Theo lịch trình",
    viewTour: "Xem tour",
  },
  en: {
    backHome: "Back to home",
    title: "Nightlife tour list",
    eyebrow: "",
    searchAria: "Search tours",
    searchPlaceholder: "Search tours, venues, or areas...",
    cityAria: "Choose city",
    searchButton: "Search",
    suggestionLabel: "Tour suggestions",
    suggestionsLoading: "Searching tours...",
    suggestionsEmpty: "No matching suggestions.",
    reset: "Reset",
    loadFailed: "Could not load the tour list. Please try again later.",
    listAria: "Tour list",
    emptyTitle: "No matching tours",
    emptyDescription: "Change the city or keyword to see more itineraries.",
    requestTime: "On request",
    noTourImage: "No tour image yet",
    freeExperience: "Free-form experience",
    hasDeals: "Has deals",
    itinerary: "Itinerary",
    viewTour: "View tour",
  },
  ja: {
    backHome: "ホームへ戻る",
    title: "ナイトライフツアー一覧",
    eyebrow: "",
    searchAria: "ツアーを検索",
    searchPlaceholder: "ツアー、店舗、エリアを検索...",
    cityAria: "都市を選択",
    searchButton: "検索",
    suggestionLabel: "ツアー候補",
    suggestionsLoading: "ツアーを検索中...",
    suggestionsEmpty: "一致する候補がありません。",
    reset: "リセット",
    loadFailed: "ツアー一覧を読み込めませんでした。後でもう一度お試しください。",
    listAria: "ツアー一覧",
    emptyTitle: "該当するツアーがありません",
    emptyDescription: "都市またはキーワードを変更して、ほかの行程を確認してください。",
    requestTime: "リクエスト制",
    noTourImage: "ツアー画像はまだありません",
    freeExperience: "自由体験",
    hasDeals: "特典あり",
    itinerary: "旅程",
    viewTour: "ツアーを見る",
  },
  ko: {
    backHome: "홈으로 돌아가기",
    title: "나이트라이프 투어 목록",
    eyebrow: "",
    searchAria: "투어 검색",
    searchPlaceholder: "투어, 매장 또는 지역 검색...",
    cityAria: "도시 선택",
    searchButton: "검색",
    suggestionLabel: "투어 추천",
    suggestionsLoading: "투어를 검색 중...",
    suggestionsEmpty: "일치하는 추천이 없습니다.",
    reset: "초기화",
    loadFailed: "투어 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    listAria: "투어 목록",
    emptyTitle: "일치하는 투어가 없습니다",
    emptyDescription: "도시 또는 키워드를 변경해 다른 일정을 확인하세요.",
    requestTime: "요청 시",
    noTourImage: "투어 이미지가 아직 없습니다",
    freeExperience: "자유 체험",
    hasDeals: "혜택 있음",
    itinerary: "일정",
    viewTour: "투어 보기",
  },
  zh: {
    backHome: "返回首页",
    title: "夜生活行程列表",
    eyebrow: "",
    searchAria: "搜索行程",
    searchPlaceholder: "搜索行程、店铺或区域...",
    cityAria: "选择城市",
    searchButton: "搜索",
    suggestionLabel: "行程推荐",
    suggestionsLoading: "正在搜索行程...",
    suggestionsEmpty: "没有匹配的推荐。",
    reset: "重置",
    loadFailed: "无法加载行程列表。请稍后重试。",
    listAria: "行程列表",
    emptyTitle: "没有匹配的行程",
    emptyDescription: "更换城市或关键词以查看更多路线。",
    requestTime: "按需求安排",
    noTourImage: "暂无行程图片",
    freeExperience: "自由体验",
    hasDeals: "有优惠",
    itinerary: "行程",
    viewTour: "查看行程",
  },
};

const getTourDirectoryCopy = (language: LanguageCode) =>
  tourDirectoryCopy[language] ?? tourDirectoryCopy.vi;

const formatTourCount = (count: number, language: LanguageCode) => {
  if (language === "en") return `${count} ${count === 1 ? "tour" : "tours"}`;
  if (language === "ja") return `${count}ツアー`;
  if (language === "ko") return `${count}개 투어`;
  if (language === "zh") return `${count} 个行程`;
  return `${count} tour`;
};

const formatStopCount = (count: number, language: LanguageCode) => {
  if (language === "en") return `${count} ${count === 1 ? "stop" : "stops"}`;
  if (language === "ja") return `${count}か所`;
  if (language === "ko") return `${count}개 지점`;
  if (language === "zh") return `${count} 个站点`;
  return `${count} điểm dừng`;
};

const formatDuration = (hours: number, language: LanguageCode) => {
  if (language === "en") return `${hours}h`;
  if (language === "ja") return `${hours}時間`;
  if (language === "ko") return `${hours}시간`;
  if (language === "zh") return `${hours}小时`;
  return `${hours} giờ`;
};

const formatCastCount = (count: number, language: LanguageCode) => {
  if (language === "en") return `${count} Cast`;
  if (language === "ja") return `${count}人のキャスト`;
  if (language === "ko") return `${count}명 캐스트`;
  if (language === "zh") return `${count} 位Cast`;
  return `${count} cast`;
};

const priceTierLabel = (tier: number) =>
  "$".repeat(Math.max(1, Math.min(4, Math.trunc(tier || 3))));

const tourImage = (tour: PublicTour) =>
  tour.coverUrl || emptyTourImage;

const countTourCasts = (tour: PublicTour) =>
  tour.stops.reduce((sum, stop) => sum + stop.store.casts.length, 0);

const tourCityLabel = (tour: PublicTour, language: LanguageCode) => {
  const city = tour.stops[0]?.store.area?.city || tour.city || "NightLife";
  if (/ho chi minh|hcm|tp\.?hcm/i.test(city)) return "TP.HCM";
  if (/hanoi|ha noi|hà nội/i.test(city)) return localize("Hà Nội", language);
  return localize(city, language);
};

const tourSearchText = (tour: PublicTour) =>
  normalizeSearch(
    [
      tour.title,
      tour.subtitle,
      tour.city,
      tour.stops.map((stop) => [
        stop.store.name,
        stop.store.category,
        stop.store.area?.name,
        stop.store.district,
        stop.store.coupons.map((coupon) => coupon.name).join(" "),
      ].join(" ")).join(" "),
    ].filter(Boolean).join(" "),
  );

const tourItemsPerPage = 12;

export function TourClient() {
  const activeLanguage = useActiveLanguage();
  const copy = getTourDirectoryCopy(activeLanguage);
  const [city, setCity] = useState<CityFilter>("all");
  const [query, setQuery] = useState("");
  const [suggestionTours, setSuggestionTours] = useState<PublicTour[]>([]);
  const [isSuggestionLoading, setSuggestionLoading] = useState(false);
  const [isSearchFocused, setSearchFocused] = useState(false);
  const [isCityMenuOpen, setCityMenuOpen] = useState(false);
  const [tours, setTours] = useState<PublicTour[]>([]);
  const [totalTours, setTotalTours] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const listRef = useRef<HTMLElement>(null);

  const selectedCity = useMemo(
    () => cityOptions.find((option) => option.id === city) ?? cityOptions[0],
    [city],
  );

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError("");

    tourApi
      .list({
        city: selectedCity.value || undefined,
        q: query.trim() || undefined,
        page: currentPage,
        limit: tourItemsPerPage,
      })
      .then((response) => {
        if (!cancelled) {
          setTours(response.data);
          setTotalTours(response.total);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTours([]);
          setTotalTours(0);
          setError("loadFailed");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCity.value, currentPage, query]);

  useEffect(() => {
    const suggestionQuery = query.trim().replace(/\s+/g, " ");
    if (!suggestionQuery) {
      setSuggestionTours([]);
      setSuggestionLoading(false);
      return;
    }

    let cancelled = false;
    setSuggestionTours([]);
    setSuggestionLoading(true);
    const timer = window.setTimeout(() => {
      tourApi
        .list({
          city: selectedCity.value || undefined,
          q: suggestionQuery,
          page: 1,
          limit: 12,
        })
        .then((response) => {
          if (!cancelled) setSuggestionTours(response.data);
        })
        .catch(() => {
          if (!cancelled) setSuggestionTours([]);
        })
        .finally(() => {
          if (!cancelled) setSuggestionLoading(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, selectedCity.value]);

  // Scroll lên đầu danh sách khi chuyển trang
  useEffect(() => {
    if (currentPage <= 1) return;
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentPage]);

  const suggestions = useMemo(() => {
    const normalizedQuery = normalizeSearch(query);
    if (!normalizedQuery) return [];

    return suggestionTours
      .filter((tour) => tourSearchText(tour).includes(normalizedQuery))
      .sort((left, right) => {
        const leftTitle = normalizeSearch(left.title);
        const rightTitle = normalizeSearch(right.title);
        const leftScore = leftTitle === normalizedQuery ? 0 : leftTitle.startsWith(normalizedQuery) ? 1 : 2;
        const rightScore = rightTitle === normalizedQuery ? 0 : rightTitle.startsWith(normalizedQuery) ? 1 : 2;
        return leftScore - rightScore || left.title.localeCompare(right.title);
      })
      .slice(0, 4);
  }, [query, suggestionTours]);
  const showSuggestions = isSearchFocused && query.trim().length > 0;

  const totalPages = Math.max(1, Math.ceil(totalTours / tourItemsPerPage));
  const hasActiveFilter = city !== "all" || query.trim().length > 0;

  const resetSearchControls = () => {
    setCity("all");
    setQuery("");
    setCurrentPage(1);
    setCityMenuOpen(false);
  };

  const selectCity = (nextCity: CityFilter) => {
    setCity(nextCity);
    setCurrentPage(1);
    setCityMenuOpen(false);
  };

  return (
    <>
      <style>{tourDirectoryCss}</style>

      <div className="tour-directory-shell">
        <section className="tour-search-hero" aria-label={copy.searchAria}>
        <header className="tour-directory-header">
          <Link href="/" aria-label={copy.backHome} className="tour-directory-back">
            <ArrowLeft size={17} />
          </Link>

          <div className="tour-directory-title">
            <h1>{copy.title}</h1>
            {copy.eyebrow && <p>{copy.eyebrow}</p>}
          </div>
        </header>

        <section className="tour-search-controls" aria-label={copy.searchAria}>
          <label className="tour-search-input">
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => { setQuery(event.target.value); setCurrentPage(1); }}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)}
              placeholder={copy.searchPlaceholder}
              autoComplete="off"
            />
            {showSuggestions ? (
              <TourSearchSuggestions
                copy={copy}
                language={activeLanguage}
                isLoading={isSuggestionLoading}
                tours={suggestions}
              />
            ) : null}
          </label>

          <div
            className={`tour-city-select ${isCityMenuOpen ? "is-open" : ""}`}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setCityMenuOpen(false);
              }
            }}
          >
            <button
              type="button"
              className="tour-city-trigger"
              aria-label={copy.cityAria}
              aria-haspopup="listbox"
              aria-expanded={isCityMenuOpen}
              onClick={() => setCityMenuOpen((current) => !current)}
            >
              <MapPin size={15} />
              <span>{localize(selectedCity.label, activeLanguage)}</span>
              <ChevronDown size={14} />
            </button>

            {isCityMenuOpen ? (
              <div className="tour-city-menu" role="listbox" aria-label={copy.cityAria}>
                {cityOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="option"
                    aria-selected={option.id === city}
                    className={option.id === city ? "is-selected" : ""}
                    onClick={() => selectCity(option.id)}
                  >
                    {localize(option.label, activeLanguage)}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <button type="button" className="tour-find-button">
            {copy.searchButton}
          </button>
        </section>
        </section>

        <div className="tour-result-bar">
          <div>
            <strong>{isLoading ? "..." : formatTourCount(totalTours, activeLanguage)}</strong>
            <span> · {localize(selectedCity.label, activeLanguage)}</span>
          </div>

          {hasActiveFilter ? (
            <button type="button" onClick={resetSearchControls}>
              {copy.reset}
            </button>
          ) : null}
        </div>

        {error ? <div className="tour-error">{copy.loadFailed}</div> : null}

        <section className="tour-list" aria-label={copy.listAria} ref={listRef}>
          {isLoading ? (
            <TourSkeletons />
          ) : tours.length > 0 ? (
            tours.map((tour) => (
              <TourResultCard key={tour.id} tour={tour} language={activeLanguage} />
            ))
          ) : (
            <div className="tour-empty">
              <strong>{copy.emptyTitle}</strong>
              <span>{copy.emptyDescription}</span>
            </div>
          )}
        </section>

        {!isLoading && totalPages > 1 ? (
          <div className="tour-pagination">
            <button
              type="button"
              className="tour-page-btn"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              aria-label="Trang trước"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="tour-page-info">
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              className="tour-page-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Trang sau"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}

function TourResultCard({ tour, language }: { tour: PublicTour; language: LanguageCode }) {
  const copy = getTourDirectoryCopy(language);
  const displayTitle = localize(tour.title, language);
  const stopCount = tour.stops.length;
  const castCount = countTourCasts(tour);
  const departureLabel = tour.departureTimes.slice(0, 2).join(", ") || copy.requestTime;

  return (
    <article className="tour-card">
      <Link href={`/tour/${tour.id}`} className="tour-card-media" aria-label={displayTitle}>
        <PlaceholderMedia
          src={tourImage(tour)}
          alt={displayTitle}
          label={copy.noTourImage}
          className="tour-card-image"
        >
          <span className="tour-media-shade" />
          <span className="tour-status-pill">
            <Route size={14} />
            {formatStopCount(stopCount, language)}
          </span>
        </PlaceholderMedia>
      </Link>

      <div className="tour-card-body">
        <div className="tour-card-main">
          <div className="tour-name-row">
            <Link href={`/tour/${tour.id}`}>{displayTitle}</Link>
            <span className="notranslate" translate="no" data-no-translate="true">
              {priceTierLabel(tour.priceTier)}
            </span>
          </div>

          {tour.subtitle ? <p className="tour-subtitle">{tour.subtitle}</p> : null}

          <div className="tour-meta-grid">
            <span>
              <MapPin size={14} />
              {tourCityLabel(tour, language)}
            </span>
            <span>
              <Clock3 size={14} />
              {formatDuration(tour.durationHours, language)}
            </span>
            <span>
              <CalendarDays size={14} />
              {departureLabel}
            </span>
            <span>
              <Sparkles size={14} />
              {castCount ? formatCastCount(castCount, language) : copy.freeExperience}
            </span>
          </div>

          <div className="tour-stop-list">
            {tour.stops.slice(0, 3).map((stop) => (
              <Link key={stop.id} href={`/stores/${stop.store.slug}`}>
                <span>{stop.order}</span>
                <strong className="notranslate" translate="no" data-no-translate="true">{stop.store.name}</strong>
                <em>{localize(categoryLabels[stop.store.category] ?? stop.store.category, language)}</em>
              </Link>
            ))}
          </div>
        </div>

        <div className="tour-card-side">
          <Link href={`/tour/${tour.id}`}>
            {copy.viewTour}
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}

function TourSearchSuggestions({
  copy,
  language,
  isLoading,
  tours,
}: {
  copy: ReturnType<typeof getTourDirectoryCopy>;
  language: LanguageCode;
  isLoading: boolean;
  tours: PublicTour[];
}) {
  return (
    <div className="tour-suggestions" role="listbox" aria-label={copy.suggestionLabel}>
      {isLoading ? (
        <div className="tour-suggestion-empty">{copy.suggestionsLoading}</div>
      ) : tours.length ? (
        <>
          <div className="tour-suggestion-label">{copy.suggestionLabel}</div>
          {tours.map((tour) => (
            <Link key={tour.id} href={`/tour/${tour.id}`} className="tour-suggestion-row">
              <span
                className="tour-suggestion-thumb"
                aria-hidden="true"
                style={{ backgroundImage: `url(${JSON.stringify(tourImage(tour))})` }}
              />
              <span>
                <b>{displayTitle}</b>
                <small>{[tourCityLabel(tour, language), formatStopCount(tour.stops.length, language)].filter(Boolean).join(" · ")}</small>
              </span>
              <ChevronRight size={15} />
            </Link>
          ))}
        </>
      ) : (
        <div className="tour-suggestion-empty">{copy.suggestionsEmpty}</div>
      )}
    </div>
  );
}

function TourSkeletons() {
  return (
    <>
      {[0, 1, 2].map((item) => (
        <div key={item} className="tour-card tour-skeleton">
          <div className="tour-card-media" />
          <div className="tour-card-body">
            <div className="tour-card-main">
              <div className="tour-skeleton-line wide" />
              <div className="tour-skeleton-line" />
              <div className="tour-skeleton-tags">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

const tourDirectoryCss = `
  .tour-directory-page {
    min-height: auto;
    background: var(--vy-bg);
    color: var(--vy-text);
    font-family: var(--nl-font-sans);
  }

  .nl-page-content:has(.tour-directory-page) {
    padding-bottom: 0 !important;
  }

  .tour-directory-page * {
    box-sizing: border-box;
  }

  .tour-directory-shell {
    width: min(100%, 1180px);
    margin: 0 auto;
    padding: 28px 26px 34px;
  }

  .tour-search-hero {
    border: 1px solid var(--vy-border-gold-22);
    border-radius: 18px;
    background:
      radial-gradient(circle at 16% 0%, rgba(212, 178, 106, .12), transparent 34%),
      linear-gradient(135deg, rgba(21, 19, 26, .96), rgba(13, 12, 17, .98));
    box-shadow: 0 30px 70px -34px rgba(0, 0, 0, .7);
    padding: 26px;
  }

  .tour-directory-header {
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }

  .tour-directory-back {
    display: none;
  }

  .tour-directory-title h1 {
    margin: 0;
    color: var(--vy-text);
    font-size: 28px;
    line-height: 1.15;
    font-weight: 800;
    letter-spacing: 0;
  }

  .tour-directory-title p {
    margin: 8px 0 0;
    color: var(--vy-muted);
    font-size: 10px;
    line-height: 1;
    font-weight: 900;
    letter-spacing: .18em;
  }

  .tour-search-controls {
    position: relative;
    z-index: 20;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 160px 108px;
    gap: 12px;
    margin-top: 24px;
  }

  .tour-search-input,
  .tour-city-select,
  .tour-find-button {
    min-height: 56px;
    border: 1px solid var(--vy-border-gold-32);
    border-radius: 14px;
    background: var(--vy-surface-1);
    color: var(--vy-gold-pale);
  }

  .tour-search-input,
  .tour-city-trigger {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 0 18px;
  }

  .tour-search-input { position: relative; }

  .tour-suggestions {
    position: absolute;
    z-index: 230;
    top: calc(100% + 8px);
    left: 0;
    width: min(100%, 680px);
    overflow: hidden;
    border: 1px solid var(--vy-border-gold-32);
    border-radius: 14px;
    background: #17151b;
    box-shadow: 0 22px 48px -24px rgba(0, 0, 0, .88);
  }

  .tour-suggestion-label,
  .tour-suggestion-empty {
    color: var(--vy-muted);
    font-size: 12px;
    font-weight: 800;
  }

  .tour-suggestion-label { padding: 11px 14px 7px; text-transform: uppercase; letter-spacing: .08em; }
  .tour-suggestion-empty { padding: 17px 14px; }

  .tour-suggestion-row {
    display: flex;
    align-items: center;
    gap: 11px;
    min-height: 62px;
    border-top: 1px solid rgba(255,255,255,.07);
    color: var(--vy-text);
    padding: 8px 12px;
    text-decoration: none;
  }

  .tour-suggestion-row:hover,
  .tour-suggestion-row:focus-visible { background: rgba(212, 178, 106, .1); outline: none; }

  .tour-suggestion-thumb {
    width: 42px;
    height: 42px;
    flex: none;
    border-radius: 9px;
    background: #29252d center / cover no-repeat;
  }

  .tour-suggestion-row > span:nth-child(2) { display: grid; min-width: 0; gap: 3px; }
  .tour-suggestion-row b,
  .tour-suggestion-row small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .tour-suggestion-row b { font-size: 13px; }
  .tour-suggestion-row small { color: var(--vy-muted); font-size: 11px; }
  .tour-suggestion-row > svg { margin-left: auto; color: var(--vy-gold); flex: none; }

  .tour-search-input svg,
  .tour-city-trigger svg {
    color: var(--vy-gold);
    flex: none;
  }

  .tour-search-input input {
    width: 100%;
    min-width: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: var(--vy-text);
    font-family: inherit;
    font-size: 15px;
    font-weight: 700;
  }

  .tour-city-select {
    position: relative;
    min-width: 0;
    background: #18161c;
  }

  .tour-city-trigger {
    width: 100%;
    min-height: 56px;
    border: 0;
    border-radius: 14px;
    background: #18161c;
    color: var(--vy-gold-pale);
    cursor: pointer;
    font-family: inherit;
  }

  .tour-city-trigger:focus-visible {
    outline: none;
    box-shadow: inset 0 0 0 2px var(--vy-border-gold-40);
  }

  .tour-city-trigger span {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    color: var(--vy-text);
    font-size: 15px;
    font-weight: 800;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tour-city-trigger svg:last-child {
    transition: transform 180ms ease;
  }

  .tour-city-select.is-open {
    border-color: var(--vy-border-gold-22);
    box-shadow: none;
  }

  .tour-city-select.is-open .tour-city-trigger svg:last-child {
    transform: rotate(180deg);
  }

  .tour-city-menu {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    z-index: 220;
    display: grid;
    gap: 3px;
    min-width: 100%;
    border: 1px solid var(--vy-border-gold-32);
    border-radius: 12px;
    background: #17151b;
    padding: 6px;
    box-shadow: 0 20px 48px -24px rgba(0, 0, 0, 0.9);
  }

  .tour-city-menu button {
    width: 100%;
    min-height: 38px;
    border: 0;
    border-radius: 9px;
    background: #201d23;
    color: var(--vy-muted);
    padding: 0 10px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 750;
    text-align: left;
    cursor: pointer;
  }

  .tour-city-menu button:hover,
  .tour-city-menu button:focus-visible {
    background: #29252d;
    color: var(--vy-text);
    outline: none;
  }

  .tour-city-menu button.is-selected {
    background: var(--vy-gold-grad);
    color: var(--vy-on-gold);
    font-weight: 900;
  }

  html.vy-light .tour-city-select,
  html.vy-light .tour-city-trigger {
    background: #fffaf2;
  }

  html.vy-light .tour-search-hero {
    border-color: rgba(150, 116, 52, .2);
    background: linear-gradient(135deg, rgba(255, 255, 255, .94), rgba(246, 238, 219, .88));
    box-shadow: 0 24px 70px -42px rgba(84, 62, 25, .34);
  }

  html.vy-light .tour-suggestions { background: #fffaf2; box-shadow: 0 18px 44px -28px rgba(86, 62, 18, .36); }
  html.vy-light .tour-suggestion-row { border-color: rgba(87, 67, 36, .1); }

  html.vy-light .tour-city-menu {
    background: #fffaf2;
    box-shadow: 0 18px 44px -30px rgba(86, 62, 18, 0.42);
  }

  html.vy-light .tour-city-menu button {
    background: #ffffff;
    color: var(--vy-muted);
  }

  html.vy-light .tour-city-menu button:hover,
  html.vy-light .tour-city-menu button:focus-visible {
    background: #f3eadb;
    color: var(--vy-text);
  }

  html.vy-light .tour-city-menu button.is-selected {
    background: var(--vy-gold-grad);
    color: var(--vy-on-gold);
    box-shadow: inset 0 0 0 1px rgba(125, 88, 19, 0.16);
  }

  .tour-search-input input::placeholder {
    color: var(--vy-muted);
  }

  .tour-find-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-color: var(--vy-border-gold-40);
    background: var(--vy-gold-grad);
    color: var(--vy-on-gold);
    font-family: inherit;
    font-size: 14px;
    font-weight: 950;
    cursor: pointer;
  }

  .tour-result-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 18px;
    color: var(--vy-muted);
    font-size: 13px;
    font-weight: 750;
  }

  .tour-result-bar strong {
    color: var(--vy-text);
    font-weight: 950;
  }

  .tour-result-bar button {
    min-height: 30px;
    border: 1px solid var(--vy-border);
    border-radius: 999px;
    background: var(--vy-surface-1);
    color: var(--vy-gold-pale);
    padding: 0 13px;
    font-family: inherit;
    font-size: 12px;
    font-weight: 850;
    cursor: pointer;
  }

  .tour-error,
  .tour-empty {
    border: 1px dashed var(--vy-border-gold-32);
    border-radius: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 48px 24px;
    margin-top: 20px;
    text-align: center;
  }

  .tour-error {
    color: #e06c6c;
  }

  .tour-empty strong {
    color: var(--vy-text);
    font-size: 16px;
  }

  .tour-empty span {
    color: var(--vy-muted);
    font-size: 13px;
  }

  .tour-list {
    display: grid;
    gap: 18px;
    margin-top: 20px;
  }

  /* Pagination */
  .tour-pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-top: 32px;
    padding: 20px 0;
  }

  .tour-page-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: 1px solid var(--vy-border-gold-32);
    border-radius: 10px;
    background: var(--vy-surface-1);
    color: var(--vy-gold-pale);
    cursor: pointer;
    transition: background 160ms, color 160ms;
  }

  .tour-page-btn:hover:not(:disabled) {
    background: var(--vy-surface-2);
    color: var(--vy-text);
  }

  .tour-page-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .tour-page-info {
    color: var(--vy-muted);
    font-size: 13px;
    font-weight: 800;
    min-width: 60px;
    text-align: center;
  }

  html.vy-light .tour-page-btn {
    background: #ffffff;
    border-color: rgba(150, 116, 52, .22);
    color: #7a5e2a;
  }

  html.vy-light .tour-page-btn:hover:not(:disabled) {
    background: #f8f0e0;
    color: #5a4012;
  }

  /* Tour card */
  .tour-card {
    display: grid;
    grid-template-columns: 260px minmax(0, 1fr);
    border: 1px solid var(--vy-border-gold-22);
    border-radius: 16px;
    background: var(--vy-surface-1);
    overflow: hidden;
  }

  .tour-card-media {
    position: relative;
    display: block;
    aspect-ratio: 4/3;
    overflow: hidden;
    background: #18161c;
  }

  .tour-card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 340ms ease;
  }

  .tour-card:hover .tour-card-image {
    transform: scale(1.04);
  }

  .tour-media-shade {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(0, 0, 0, .34), transparent 60%);
  }

  .tour-status-pill {
    position: absolute;
    top: 12px;
    left: 12px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1px solid rgba(255, 255, 255, .18);
    border-radius: 999px;
    background: rgba(0, 0, 0, .52);
    backdrop-filter: blur(8px);
    color: #f0dda8;
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 850;
  }

  .tour-card-body {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 160px;
    gap: 0;
  }

  .tour-card-main {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 20px 20px 20px 24px;
    border-right: 1px solid var(--vy-border-gold-16);
  }

  .tour-name-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .tour-name-row a {
    color: var(--vy-text);
    font-size: 17px;
    font-weight: 900;
    line-height: 1.25;
    text-decoration: none;
  }

  .tour-name-row a:hover {
    color: var(--vy-gold);
  }

  .tour-name-row span {
    flex-shrink: 0;
    color: var(--vy-gold);
    font-size: 13px;
    font-weight: 900;
    letter-spacing: .04em;
  }

  .tour-subtitle {
    margin: 0;
    color: var(--vy-muted);
    font-size: 13px;
    line-height: 1.5;
  }

  .tour-meta-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 14px;
  }

  .tour-meta-grid span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: var(--vy-muted);
    font-size: 12px;
    font-weight: 750;
  }

  .tour-meta-grid svg {
    color: var(--vy-gold);
    flex-shrink: 0;
  }

  .tour-stop-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .tour-stop-list a {
    display: flex;
    align-items: center;
    gap: 8px;
    border-radius: 8px;
    background: var(--vy-surface-2);
    color: var(--vy-muted);
    padding: 5px 10px;
    font-size: 12px;
    text-decoration: none;
    transition: background 160ms;
  }

  .tour-stop-list a:hover {
    background: var(--vy-border-gold-16);
    color: var(--vy-text);
  }

  .tour-stop-list a span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    border-radius: 999px;
    background: var(--vy-gold-grad);
    color: var(--vy-on-gold);
    font-size: 10px;
    font-weight: 900;
  }

  .tour-stop-list a strong {
    flex: 1;
    min-width: 0;
    color: var(--vy-text);
    font-weight: 800;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tour-stop-list a em {
    flex-shrink: 0;
    font-style: normal;
    opacity: .7;
    font-size: 11px;
  }

  .tour-card-side {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 20px;
    gap: 12px;
  }

  .tour-card-side > a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border: 1px solid var(--vy-border-gold-32);
    border-radius: 10px;
    background: transparent;
    color: var(--vy-gold-pale);
    padding: 10px 14px;
    font-size: 13px;
    font-weight: 850;
    text-decoration: none;
    transition: background 160ms, color 160ms;
  }

  .tour-card-side > a:hover {
    background: var(--vy-gold-grad);
    color: var(--vy-on-gold);
    border-color: transparent;
  }

  /* Skeleton */
  .tour-skeleton .tour-card-media {
    background: var(--vy-surface-2);
    animation: tour-pulse 1.4s ease infinite;
  }

  .tour-skeleton-line {
    height: 14px;
    border-radius: 7px;
    background: var(--vy-surface-2);
    animation: tour-pulse 1.4s ease infinite;
    width: 65%;
  }

  .tour-skeleton-line.wide {
    width: 90%;
    height: 18px;
  }

  .tour-skeleton-tags {
    display: flex;
    gap: 8px;
  }

  .tour-skeleton-tags span {
    height: 26px;
    width: 70px;
    border-radius: 8px;
    background: var(--vy-surface-2);
    animation: tour-pulse 1.4s ease infinite;
  }

  @keyframes tour-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: .45; }
  }

  @media (max-width: 860px) {
    .tour-card {
      grid-template-columns: 1fr;
    }

    .tour-card-media {
      aspect-ratio: 16/9;
    }

    .tour-card-body {
      grid-template-columns: 1fr;
    }

    .tour-card-main {
      border-right: 0;
      border-bottom: 1px solid var(--vy-border-gold-16);
    }

    .tour-card-side {
      padding-top: 0;
    }

    .tour-search-controls {
      grid-template-columns: minmax(0, 1fr) 130px;
    }

    .tour-find-button {
      display: none;
    }
  }

  @media (max-width: 480px) {
    .tour-directory-shell {
      padding: 16px 16px 24px;
    }

    .tour-search-controls {
      grid-template-columns: 1fr;
    }
  }
`;
