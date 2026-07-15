"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Clock3,
  MapPin,
  Route,
  Search,
  SlidersHorizontal,
  Sparkles,
  Ticket,
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

const filterOptions = [
  { id: "all", label: "Tất cả" },
  { id: "short", label: "2-3 điểm dừng" },
  { id: "deal", label: "Có ưu đãi" },
  { id: "premium", label: "Premium" },
] as const;

type CityFilter = (typeof cityOptions)[number]["id"];
type TourFilter = (typeof filterOptions)[number]["id"];

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

const formatTourCount = (count: number, language: LanguageCode) => {
  if (language === "en") return `${count} ${count === 1 ? "tour" : "tours"}`;
  return `${count} tour`;
};

const formatStopCount = (count: number, language: LanguageCode) => {
  if (language === "en") return `${count} ${count === 1 ? "stop" : "stops"}`;
  return `${count} điểm dừng`;
};

const formatDuration = (hours: number, language: LanguageCode) => {
  if (language === "en") return `${hours}h`;
  return `${hours} giờ`;
};

const formatCastCount = (count: number, language: LanguageCode) => {
  if (language === "en") return `${count} Cast`;
  return `${count} cast`;
};

const priceTierLabel = (tier: number) =>
  "$".repeat(Math.max(1, Math.min(4, Math.trunc(tier || 3))));

const tourImage = (tour: PublicTour) =>
  tour.coverUrl || tour.stops.find((stop) => stop.store.media[0])?.store.media[0]?.url || emptyTourImage;

const hasTourDeal = (tour: PublicTour) =>
  tour.stops.some((stop) => stop.store.coupons.length > 0);

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

export function TourClient() {
  const activeLanguage = useActiveLanguage();
  const [city, setCity] = useState<CityFilter>("all");
  const [filter, setFilter] = useState<TourFilter>("all");
  const [query, setQuery] = useState("");
  const [tours, setTours] = useState<PublicTour[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        limit: 48,
      })
      .then((response) => {
        if (!cancelled) setTours(response.data);
      })
      .catch(() => {
        if (!cancelled) {
          setTours([]);
          setError("Chưa tải được danh sách tour. Vui lòng thử lại sau.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCity.value]);

  const visibleTours = useMemo(() => {
    const normalizedQuery = normalizeSearch(query);

    return tours.filter((tour) => {
      const matchesQuery = !normalizedQuery || tourSearchText(tour).includes(normalizedQuery);
      const matchesFilter =
        filter === "all" ||
        (filter === "short" && tour.stops.length <= 3) ||
        (filter === "deal" && hasTourDeal(tour)) ||
        (filter === "premium" && tour.priceTier >= 3);

      return matchesQuery && matchesFilter;
    });
  }, [filter, query, tours]);

  const hasActiveFilter = city !== "all" || filter !== "all" || query.trim().length > 0;

  const resetFilters = () => {
    setCity("all");
    setFilter("all");
    setQuery("");
  };

  return (
    <>
      <style>{tourDirectoryCss}</style>

      <div className="tour-directory-shell">
        <header className="tour-directory-header">
          <Link href="/" aria-label={localize("Quay lại trang chủ", activeLanguage)} className="tour-directory-back">
            <ArrowLeft size={17} />
          </Link>

          <div className="tour-directory-title">
            <h1>{localize("Danh sách tour nightlife", activeLanguage)}</h1>
            <p>{localize("TOUR DIRECTORY", activeLanguage)}</p>
          </div>
        </header>

        <section className="tour-search-controls" aria-label={localize("Tìm và lọc tour", activeLanguage)}>
          <label className="tour-search-input">
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={localize("Tìm tour, quán hoặc khu vực...", activeLanguage)}
              autoComplete="off"
            />
            <SlidersHorizontal size={16} />
          </label>

          <label className="tour-city-select">
            <MapPin size={15} />
            <select
              aria-label={localize("Chọn thành phố", activeLanguage)}
              value={city}
              onChange={(event) => setCity(event.target.value as CityFilter)}
            >
              {cityOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {localize(option.label, activeLanguage)}
                </option>
              ))}
            </select>
            <ChevronDown size={14} />
          </label>

          <button type="button" className="tour-find-button">
            {localize("Tìm", activeLanguage)}
          </button>
        </section>

        <nav className="tour-chip-row hscroll" aria-label={localize("Bộ lọc tour", activeLanguage)}>
          {filterOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`tour-chip ${filter === option.id ? "is-active" : ""}`}
              onClick={() => setFilter(option.id)}
            >
              {localize(option.label, activeLanguage)}
            </button>
          ))}
        </nav>

        <div className="tour-result-bar">
          <div>
            <strong>{isLoading ? "..." : formatTourCount(visibleTours.length, activeLanguage)}</strong>
            <span> · {localize(selectedCity.label, activeLanguage)}</span>
          </div>

          {hasActiveFilter ? (
            <button type="button" onClick={resetFilters}>
              {localize("Đặt lại", activeLanguage)}
            </button>
          ) : null}
        </div>

        {error ? <div className="tour-error">{localize(error, activeLanguage)}</div> : null}

        <section className="tour-list" aria-label={localize("Danh sách tour", activeLanguage)}>
          {isLoading ? (
            <TourSkeletons />
          ) : visibleTours.length > 0 ? (
            visibleTours.map((tour) => (
              <TourResultCard key={tour.id} tour={tour} language={activeLanguage} />
            ))
          ) : (
            <div className="tour-empty">
              <strong>{localize("Chưa có tour phù hợp", activeLanguage)}</strong>
              <span>{localize("Đổi thành phố, từ khóa hoặc bộ lọc để xem thêm hành trình.", activeLanguage)}</span>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function TourResultCard({ tour, language }: { tour: PublicTour; language: LanguageCode }) {
  const stopCount = tour.stops.length;
  const castCount = countTourCasts(tour);
  const deal = tour.stops.find((stop) => stop.store.coupons[0])?.store.coupons[0];
  const departureLabel = tour.departureTimes.slice(0, 2).join(", ") || localize("Theo yêu cầu", language);

  return (
    <article className="tour-card">
      <Link href={`/tour/${tour.id}`} className="tour-card-media" aria-label={tour.title}>
        <PlaceholderMedia
          src={tourImage(tour)}
          alt={tour.title}
          label={localize("Chưa có ảnh tour", language)}
          className="tour-card-image"
        >
          <span className="tour-media-shade" />
          <span className="tour-status-pill">
            <Route size={14} />
            {formatStopCount(stopCount, language)}
          </span>
          {deal ? <span className="tour-deal-pill">{deal.name}</span> : null}
        </PlaceholderMedia>
      </Link>

      <div className="tour-card-body">
        <div className="tour-card-main">
          <div className="tour-name-row">
            <Link href={`/tour/${tour.id}`}>{tour.title}</Link>
            <span>{priceTierLabel(tour.priceTier)}</span>
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
              {castCount ? formatCastCount(castCount, language) : localize("Trải nghiệm tự do", language)}
            </span>
          </div>

          <div className="tour-stop-list">
            {tour.stops.slice(0, 3).map((stop) => (
              <Link key={stop.id} href={`/stores/${stop.store.slug}`}>
                <span>{stop.order}</span>
                <strong>{stop.store.name}</strong>
                <em>{localize(categoryLabels[stop.store.category] ?? stop.store.category, language)}</em>
              </Link>
            ))}
          </div>
        </div>

        <div className="tour-card-side">
          <div>
            <Ticket size={17} />
            <strong>{deal ? localize("Có ưu đãi", language) : localize("Theo lịch trình", language)}</strong>
            <span>{localize("Admin xác nhận sau khi gửi yêu cầu", language)}</span>
          </div>
          <Link href={`/tour/${tour.id}`}>
            {localize("Xem tour", language)}
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </article>
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
    min-height: 100vh;
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
    padding: 28px 26px 54px;
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
    font-size: 30px;
    line-height: 1.05;
    font-weight: 850;
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
  .tour-city-select {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 0 18px;
  }

  .tour-search-input svg,
  .tour-city-select svg {
    color: var(--vy-gold);
    flex: none;
  }

  .tour-search-input input,
  .tour-city-select select {
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

  .tour-city-select select {
    appearance: none;
    cursor: pointer;
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

  .tour-chip-row {
    display: flex;
    gap: 9px;
    margin-top: 14px;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .tour-chip-row::-webkit-scrollbar {
    display: none;
  }

  .tour-chip {
    min-height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    border: 1px solid var(--vy-border);
    border-radius: 999px;
    background: var(--vy-surface-1);
    color: var(--vy-muted);
    padding: 0 16px;
    font-family: inherit;
    font-size: 12px;
    font-weight: 850;
    cursor: pointer;
  }

  .tour-chip.is-active {
    border-color: var(--vy-border-gold-40);
    background: var(--vy-gold-grad);
    color: var(--vy-on-gold);
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
    background: var(--vy-surface-1);
    color: var(--vy-muted);
    padding: 22px;
  }

  .tour-error {
    margin-top: 16px;
  }

  .tour-empty {
    display: grid;
    gap: 7px;
  }

  .tour-empty strong {
    color: var(--vy-text);
    font-size: 18px;
  }

  .tour-list {
    display: grid;
    gap: 14px;
    margin-top: 14px;
  }

  .tour-card {
    min-height: 210px;
    display: grid;
    grid-template-columns: minmax(260px, 386px) minmax(0, 1fr);
    overflow: hidden;
    border: 1px solid var(--vy-border-gold-12);
    border-radius: 18px;
    background: var(--vy-surface-2);
    color: inherit;
    box-shadow: var(--vy-shadow-card);
  }

  .tour-card-media,
  .tour-card-image {
    position: relative;
    min-height: 210px;
    color: inherit;
    text-decoration: none;
  }

  .tour-card-image {
    width: 100%;
    height: 100%;
  }

  .tour-media-shade {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(12, 12, 15, .04), rgba(12, 12, 15, .2) 42%, rgba(12, 12, 15, .82));
    pointer-events: none;
  }

  .tour-status-pill,
  .tour-deal-pill {
    position: absolute;
    z-index: 2;
    left: 14px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 950;
  }

  .tour-status-pill {
    top: 12px;
    min-height: 24px;
    border: 1px solid rgba(212, 178, 106, .42);
    border-radius: 999px;
    background: rgba(42, 32, 16, .78);
    color: var(--vy-gold-pale);
    padding: 0 10px;
  }

  .tour-deal-pill {
    bottom: 14px;
    min-height: 24px;
    max-width: calc(100% - 28px);
    overflow: hidden;
    border-radius: 7px;
    background: #f0dda8;
    color: var(--vy-on-gold);
    padding: 0 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tour-card-body {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 178px;
    gap: 18px;
    padding: 22px 24px 22px 26px;
  }

  .tour-card-main {
    min-width: 0;
  }

  .tour-name-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .tour-name-row a {
    min-width: 0;
    color: var(--vy-text);
    font-size: 23px;
    line-height: 1.1;
    font-weight: 950;
    letter-spacing: 0;
    text-decoration: none;
  }

  .tour-name-row span {
    color: var(--vy-gold-pale);
    font-size: 15px;
    font-weight: 950;
    white-space: nowrap;
  }

  .tour-subtitle {
    display: -webkit-box;
    margin: 8px 0 0;
    overflow: hidden;
    color: var(--vy-muted);
    font-size: 13px;
    line-height: 1.55;
    font-weight: 650;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .tour-meta-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 9px 12px;
    margin-top: 16px;
  }

  .tour-meta-grid span {
    min-width: 0;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: var(--vy-muted);
    font-size: 12px;
    font-weight: 800;
  }

  .tour-meta-grid svg {
    color: var(--vy-gold);
    flex: none;
  }

  .tour-stop-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 17px;
  }

  .tour-stop-list a {
    min-height: 36px;
    display: inline-grid;
    grid-template-columns: 22px minmax(0, auto) auto;
    align-items: center;
    gap: 7px;
    min-width: 0;
    max-width: 100%;
    border: 1px solid var(--vy-border);
    border-radius: 8px;
    background: var(--vy-surface-1);
    color: var(--vy-text);
    padding: 6px 9px;
    text-decoration: none;
  }

  .tour-stop-list span {
    width: 22px;
    height: 22px;
    display: inline-grid;
    place-items: center;
    border-radius: 7px;
    background: var(--vy-gold-soft-bg);
    color: var(--vy-gold-pale);
    font-size: 11px;
    font-weight: 950;
  }

  .tour-stop-list strong {
    overflow: hidden;
    font-size: 12px;
    font-weight: 900;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tour-stop-list em {
    color: var(--vy-muted);
    font-size: 11px;
    font-style: normal;
    font-weight: 700;
  }

  .tour-card-side {
    display: grid;
    align-content: space-between;
    gap: 16px;
    border-left: 1px solid var(--vy-border);
    padding-left: 20px;
  }

  .tour-card-side div {
    display: grid;
    gap: 6px;
    color: var(--vy-muted);
    font-size: 12px;
    font-weight: 750;
  }

  .tour-card-side svg {
    color: var(--vy-gold);
  }

  .tour-card-side strong {
    color: var(--vy-text);
    font-size: 15px;
    font-weight: 950;
  }

  .tour-card-side a {
    min-height: 42px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    border-radius: 11px;
    background: var(--vy-gold-grad);
    color: var(--vy-on-gold);
    padding: 0 14px;
    font-size: 13px;
    font-weight: 950;
    text-decoration: none;
  }

  .tour-skeleton {
    pointer-events: none;
  }

  .tour-skeleton .tour-card-media,
  .tour-skeleton-line,
  .tour-skeleton-tags span {
    overflow: hidden;
    background: linear-gradient(90deg, var(--vy-surface-1), var(--vy-surface-3), var(--vy-surface-1));
    background-size: 220% 100%;
    animation: tour-skeleton 1.4s ease-in-out infinite;
  }

  .tour-skeleton-line {
    width: 58%;
    height: 18px;
    border-radius: 999px;
  }

  .tour-skeleton-line.wide {
    width: 78%;
    height: 25px;
    margin-bottom: 14px;
  }

  .tour-skeleton-tags {
    display: flex;
    gap: 8px;
    margin-top: 26px;
  }

  .tour-skeleton-tags span {
    width: 96px;
    height: 32px;
    border-radius: 8px;
  }

  @keyframes tour-skeleton {
    0% { background-position: 120% 0; }
    100% { background-position: -120% 0; }
  }

  @media (max-width: 767px) {
    .tour-directory-page {
      min-height: auto;
      background: var(--vy-bg);
    }

    .tour-directory-shell {
      width: 100%;
      padding: 12px 14px calc(96px + env(safe-area-inset-bottom));
    }

    .tour-directory-header {
      min-height: 31px;
      align-items: center;
      gap: 10px;
    }

    .tour-directory-back {
      width: 28px;
      height: 28px;
      display: inline-grid;
      place-items: center;
      border: 1px solid var(--vy-border);
      border-radius: 50%;
      color: var(--vy-text);
      background: rgba(255, 255, 255, .03);
      text-decoration: none;
      flex: none;
    }

    .tour-directory-title h1 {
      font-size: 17px;
      line-height: 1;
      font-weight: 900;
    }

    .tour-directory-title p {
      margin-top: 3px;
      font-size: 7.5px;
      letter-spacing: .16em;
    }

    .tour-search-controls {
      grid-template-columns: minmax(0, 1fr);
      margin-top: 8px;
      gap: 8px;
    }

    .tour-search-input {
      min-height: 34px;
      gap: 9px;
      border-radius: 8px;
      padding: 0 11px;
    }

    .tour-search-input input {
      font-size: 12px;
      font-weight: 750;
    }

    .tour-search-input svg {
      width: 14px;
      height: 14px;
    }

    .tour-city-select {
      min-height: 34px;
      border-radius: 8px;
      padding: 0 11px;
    }

    .tour-city-select select {
      font-size: 12px;
      font-weight: 800;
    }

    .tour-find-button {
      display: none;
    }

    .tour-chip-row {
      gap: 7px;
      margin: 8px -14px 0;
      padding: 0 14px 2px;
    }

    .tour-chip {
      min-height: 28px;
      padding: 0 13px;
      font-size: 10.5px;
    }

    .tour-result-bar {
      margin-top: 8px;
      font-size: 11px;
      gap: 8px;
    }

    .tour-result-bar button {
      min-height: 24px;
      padding: 0 10px;
      font-size: 10.5px;
    }

    .tour-list {
      gap: 10px;
      margin-top: 8px;
    }

    .tour-card {
      min-height: 0;
      display: block;
      border-radius: 12px;
      background: var(--vy-surface-2);
      box-shadow: 0 14px 34px rgba(0, 0, 0, .28);
    }

    .tour-card-media,
    .tour-card-image {
      min-height: 0;
      height: 128px;
      border-radius: 12px 12px 0 0;
    }

    .tour-status-pill {
      top: 8px;
      left: 9px;
      min-height: 19px;
      padding: 0 7px;
      font-size: 9px;
    }

    .tour-deal-pill {
      left: 9px;
      bottom: 8px;
      min-height: 18px;
      border-radius: 5px;
      padding: 0 7px;
      font-size: 9px;
    }

    .tour-card-body {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 10px;
      padding: 12px 10px 13px;
    }

    .tour-name-row a {
      font-size: 17px;
      line-height: 1.15;
    }

    .tour-name-row span {
      font-size: 12px;
    }

    .tour-subtitle {
      margin-top: 6px;
      font-size: 12px;
      line-height: 1.45;
      -webkit-line-clamp: 2;
    }

    .tour-meta-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 7px 9px;
      margin-top: 10px;
    }

    .tour-meta-grid span {
      font-size: 10.5px;
    }

    .tour-stop-list {
      gap: 6px;
      margin-top: 11px;
    }

    .tour-stop-list a {
      min-height: 31px;
      grid-template-columns: 20px minmax(0, auto);
      gap: 6px;
      padding: 5px 7px;
    }

    .tour-stop-list span {
      width: 20px;
      height: 20px;
      font-size: 10px;
    }

    .tour-stop-list strong {
      font-size: 11px;
    }

    .tour-stop-list em {
      display: none;
    }

    .tour-card-side {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      border-left: 0;
      border-top: 1px solid var(--vy-border);
      padding: 10px 0 0;
    }

    .tour-card-side div {
      gap: 2px;
      font-size: 10.5px;
    }

    .tour-card-side div svg {
      display: none;
    }

    .tour-card-side strong {
      font-size: 12px;
    }

    .tour-card-side a {
      min-height: 34px;
      border-radius: 8px;
      padding: 0 11px;
      font-size: 11px;
    }

    .tour-empty,
    .tour-error {
      border-radius: 12px;
      padding: 16px;
      font-size: 12px;
    }
  }
`;
