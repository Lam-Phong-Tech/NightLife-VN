"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Clock3,
  Heart,
  History,
  Languages,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Star,
  X,
} from "lucide-react";

import {
  discoveryApi,
  type DiscoverySort,
  type PublicArea,
  type PublicCast,
} from "@/lib/api/discovery";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { PlaceholderMedia } from "@/components/ui/MediaPlaceholder";

type PriceRange = "" | "under400" | "400600" | "6001000" | "over1000";

type Option = {
  value: string;
  label: string;
};

const cityOptions: Option[] = [
  { value: "hn", label: "Hà Nội" },
  { value: "hcm", label: "TP.HCM" },
  { value: "", label: "Tất cả" },
];

const categoryOptions: Option[] = [
  { value: "", label: "Tất cả" },
  { value: "GIRLS_BAR", label: "Girls Bar" },
  { value: "LOUNGE", label: "Lounge" },
  { value: "CLUB", label: "Club" },
  { value: "BAR", label: "Bar" },
  { value: "KARAOKE", label: "Karaoke / KTV" },
  { value: "MASSAGE_SPA", label: "Massage / Spa" },
  { value: "RESTAURANT", label: "Nhà hàng" },
  { value: "CASINO", label: "Casino" },
];

const languageOptions: Option[] = [
  { value: "", label: "Tất cả" },
  { value: "ja", label: "日本語" },
  { value: "en", label: "English" },
  { value: "vi", label: "Tiếng Việt" },
];

const sortOptions: Array<{ value: DiscoverySort; label: string }> = [
  { value: "priority", label: "Phổ biến" },
  { value: "newest", label: "Mới nhất" },
  { value: "nearest", label: "Gần nhất" },
];

const priceRangeOptions: Array<{ value: PriceRange; label: string }> = [
  { value: "", label: "Tất cả" },
  { value: "under400", label: "< 400k" },
  { value: "400600", label: "400 - 600k" },
  { value: "6001000", label: "600k - 1tr" },
  { value: "over1000", label: "1tr+" },
];

const categoryLabels: Record<string, string> = {
  BAR: "Bar",
  CLUB: "Club",
  LOUNGE: "Lounge",
  GIRLS_BAR: "Girls Bar",
  KARAOKE: "Karaoke / KTV",
  MASSAGE_SPA: "Massage / Spa",
  RESTAURANT: "Nhà hàng",
  CASINO: "Casino",
};

const cityLabels: Record<string, string> = {
  hn: "Hà Nội",
  hcm: "TP.HCM",
};

const compactLanguageLabels: Record<string, string> = {
  vi: "VI",
  ja: "日本語",
  en: "EN",
  ko: "KR",
};

const castFallbackImages = [
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=700&q=78",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=78",
  "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=700&q=78",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=78",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=700&q=78",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=700&q=78",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=700&q=78",
  "https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=700&q=78",
];

const favoriteCounts = ["1.2k", "1.0k", "947", "880", "812", "760", "690", "642"];
const recentSearches = ["Yuki", "Mei", "Cast Hoàn Kiếm"];
const popularKeywords = ["Nói tiếng Nhật", "Top ranking", "Còn lịch tối nay", "日本語 N1"];

const formatVnd = (value?: number | null) =>
  value ? `từ ${new Intl.NumberFormat("vi-VN").format(value)}₫` : "Theo booking";

const pickByIndex = <T,>(items: readonly T[], index: number, fallback: T) =>
  items[index % items.length] ?? fallback;

const matchesPriceRange = (range: PriceRange, value?: number | null) => {
  if (!range) return true;
  if (!value) return false;

  if (range === "under400") return value < 400_000;
  if (range === "400600") return value >= 400_000 && value <= 600_000;
  if (range === "6001000") return value > 600_000 && value <= 1_000_000;
  return value > 1_000_000;
};

const highlightMatch = (text: string, query: string) => {
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedText = text.toLowerCase();
  const index = normalizedText.indexOf(normalizedQuery);

  if (!normalizedQuery || index < 0) return text;

  return (
    <>
      {text.slice(0, index)}
      <mark>{text.slice(index, index + normalizedQuery.length)}</mark>
      {text.slice(index + normalizedQuery.length)}
    </>
  );
};

export default function Page() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("hn");
  const [area, setArea] = useState("");
  const [category, setCategory] = useState("");
  const [language, setLanguage] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [priceRange, setPriceRange] = useState<PriceRange>("");
  const [sort, setSort] = useState<DiscoverySort>("priority");
  const [hasActiveCoupon, setHasActiveCoupon] = useState(false);
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [isSearchFocused, setSearchFocused] = useState(false);
  const [areas, setAreas] = useState<PublicArea[]>([]);
  const [casts, setCasts] = useState<PublicCast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    discoveryApi
      .listAreas({ city })
      .then((items) => {
        if (!cancelled) setAreas(items);
      })
      .catch(() => {
        if (!cancelled) setAreas([]);
      });

    return () => {
      cancelled = true;
    };
  }, [city]);

  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(() => {
      setIsLoading(true);
      setError(null);
      discoveryApi
        .listCasts({
          q: query,
          city,
          area,
          category,
          language,
          limit: 60,
          sort,
          hasActiveCoupon,
        })
        .then((items) => {
          if (!cancelled) setCasts(items);
        })
        .catch(() => {
          if (!cancelled) {
            setCasts([]);
            setError("Chưa kết nối được dữ liệu cast.");
          }
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [area, category, city, hasActiveCoupon, language, query, sort]);

  useEffect(() => {
    if (!isFilterOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFilterOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isFilterOpen]);

  const storeOptions = useMemo<Option[]>(() => {
    const seen = new Map<string, string>();

    casts.forEach((cast) => {
      if (cast.store.slug) seen.set(cast.store.slug, cast.store.name);
    });

    return [
      { value: "", label: "Tất cả" },
      ...Array.from(seen, ([value, label]) => ({ value, label })),
    ];
  }, [casts]);

  const areaOptions = useMemo<Option[]>(
    () => [
      { value: "", label: "Tất cả" },
      ...areas.map((item) => ({
        value: item.code,
        label: item.name,
      })),
    ],
    [areas],
  );

  const visibleCasts = useMemo(
    () =>
      casts
        .filter((cast) => !storeSlug || cast.store.slug === storeSlug)
        .filter((cast) => matchesPriceRange(priceRange, cast.hourlyRateVnd)),
    [casts, priceRange, storeSlug],
  );

  const suggestions = useMemo(() => visibleCasts.slice(0, 4), [visibleCasts]);
  const cityLabel = city ? (cityLabels[city] ?? city) : "Việt Nam";
  const sortLabel = sortOptions.find((option) => option.value === sort)?.label ?? "Phổ biến";
  const activeFilterCount = [
    area,
    category,
    language,
    storeSlug,
    priceRange,
    hasActiveCoupon,
  ].filter(Boolean).length;
  const showSuggestions = isSearchFocused && query.trim().length > 0;

  const resetFilters = () => {
    setArea("");
    setCategory("");
    setLanguage("");
    setStoreSlug("");
    setPriceRange("");
    setHasActiveCoupon(false);
    setSort("priority");
  };

  const handleCityChange = (nextCity: string) => {
    setCity(nextCity);
    setArea("");
    setStoreSlug("");
  };

  const setPopularKeyword = (keyword: string) => {
    if (keyword.includes("Nhật") || keyword.includes("日本語")) {
      setLanguage("ja");
      return;
    }

    if (keyword.includes("Top")) {
      setSort("priority");
      return;
    }

    setHasActiveCoupon(true);
  };

  return (
    <main className="cast-search-page">
      <style>{castSearchCss}</style>

      <div className="cast-search-shell">
        <header className="cast-mobile-topbar">
          <Link href="/" aria-label="Quay lại trang chủ" className="cast-round-icon">
            <ArrowLeft size={17} />
          </Link>
          <div>
            <h1>Tìm cast</h1>
            <p>FIND CAST</p>
          </div>
        </header>

        <section className="cast-hero" aria-label="Tìm và lọc cast">
          <div className="cast-hero-copy">
            <div className="cast-eyebrow">Find Cast</div>
            <h1>Tìm cast đêm {cityLabel}</h1>
            <p>
              Lưới chân dung theo mẫu Vietyoru, ưu tiên ảnh, ngôn ngữ, quán làm việc và giá tham
              khảo mỗi 60 phút.
            </p>
          </div>

          <div className="cast-search-controls">
            <label className={`cast-search-input ${isSearchFocused ? "is-focused" : ""}`}>
              <Search size={19} />
              <input
                value={query}
                onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder="Tìm cast theo tên, quán hoặc ngôn ngữ..."
              />
              {query ? (
                <button
                  type="button"
                  aria-label="Xóa tìm kiếm"
                  className="cast-input-clear"
                  onClick={() => setQuery("")}
                >
                  <X size={14} />
                </button>
              ) : null}
              <button
                type="button"
                aria-label="Mở bộ lọc"
                className="cast-input-filter"
                onClick={() => setFilterOpen(true)}
              >
                <SlidersHorizontal size={16} />
              </button>
            </label>

            <label className="cast-select-control cast-city-select">
              <MapPin size={16} />
              <select value={city} onChange={(event) => handleCityChange(event.target.value)}>
                {cityOptions.map((option) => (
                  <option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} />
            </label>

            <button type="button" className="cast-find-button">
              Tìm
            </button>

            {showSuggestions ? (
              <SearchSuggestions
                casts={suggestions}
                popularKeywords={popularKeywords}
                query={query}
                recentSearches={recentSearches}
                onKeyword={setPopularKeyword}
                onRecent={(value) => setQuery(value)}
              />
            ) : null}
          </div>

          <nav className="cast-chip-row hscroll" aria-label="Bộ lọc nhanh">
            <button
              type="button"
              className={`cast-chip ${hasActiveCoupon ? "is-active" : ""}`}
              onClick={() => setHasActiveCoupon((current) => !current)}
            >
              <span className="cast-live-dot" />
              Có ưu đãi
            </button>
            <button
              type="button"
              className={`cast-chip ${language === "ja" ? "is-active" : ""}`}
              onClick={() => setLanguage((current) => (current === "ja" ? "" : "ja"))}
            >
              Nói tiếng Nhật
            </button>
            <button
              type="button"
              className={`cast-chip ${sort === "priority" ? "is-active" : ""}`}
              onClick={() => setSort("priority")}
            >
              Top ranking
            </button>
            {areaOptions.slice(1, 5).map((option) => (
              <button
                key={option.value}
                type="button"
                className={`cast-chip ${area === option.value ? "is-active" : ""}`}
                onClick={() => setArea((current) => (current === option.value ? "" : option.value))}
              >
                {option.label}
              </button>
            ))}
            <button
              type="button"
              className="cast-chip cast-filter-chip"
              onClick={() => setFilterOpen(true)}
            >
              <SlidersHorizontal size={14} />
              Bộ lọc
              {activeFilterCount ? <b>{activeFilterCount}</b> : null}
            </button>
          </nav>
        </section>

        {error ? <div className="cast-error">{error}</div> : null}

        <section className="cast-results-section" aria-label="Danh sách cast">
          <div className="cast-results-head">
            <span>
              <b>{visibleCasts.length} cast</b>
              <span> · {cityLabel}</span>
            </span>

            <label className="cast-sort-select">
              <span>Sắp xếp:</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as DiscoverySort)}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={13} />
            </label>
          </div>

          {isLoading ? (
            <LoadingSkeleton />
          ) : visibleCasts.length > 0 ? (
            <div className="cast-card-grid">
              {visibleCasts.map((cast, index) => (
                <CastDiscoveryCard key={cast.id} cast={cast} index={index} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Chưa có cast phù hợp"
              description="Đổi khu vực, ngôn ngữ hoặc khoảng giá để xem thêm."
            />
          )}
        </section>
      </div>

      {isFilterOpen ? (
        <MobileFilterSheet
          activeCount={activeFilterCount}
          area={area}
          areaOptions={areaOptions}
          category={category}
          city={city}
          language={language}
          priceRange={priceRange}
          sortLabel={sortLabel}
          storeOptions={storeOptions}
          storeSlug={storeSlug}
          total={visibleCasts.length}
          hasActiveCoupon={hasActiveCoupon}
          onArea={setArea}
          onCategory={setCategory}
          onCity={handleCityChange}
          onClose={() => setFilterOpen(false)}
          onLanguage={setLanguage}
          onPrice={(value) => setPriceRange(value as PriceRange)}
          onReset={resetFilters}
          onStore={setStoreSlug}
          onToggleCoupon={() => setHasActiveCoupon((current) => !current)}
        />
      ) : null}
    </main>
  );
}

function SearchSuggestions({
  casts,
  popularKeywords,
  query,
  recentSearches,
  onKeyword,
  onRecent,
}: {
  casts: PublicCast[];
  popularKeywords: string[];
  query: string;
  recentSearches: string[];
  onKeyword: (value: string) => void;
  onRecent: (value: string) => void;
}) {
  return (
    <div className="cast-suggestions" role="listbox" aria-label="Gợi ý tìm kiếm">
      <div className="cast-suggestion-searchline">
        <Search size={18} />
        <span>
          {query}
          <i />
        </span>
      </div>

      {casts.length ? (
        <>
          <div className="cast-suggestion-label">Gợi ý cast</div>
          {casts.map((cast, index) => (
            <Link key={cast.id} href={`/casts/${cast.slug}`} className="cast-suggestion-row">
              <PlaceholderMedia
                src={
                  cast.thumbnailUrl ?? pickByIndex(castFallbackImages, index, castFallbackImages[0])
                }
                alt={cast.name}
                label=""
                className="cast-suggestion-avatar"
              />
              <span>
                <b>{highlightMatch(cast.name, query)}</b>
                <small>
                  {cast.store.name} ·{" "}
                  {index < 3
                    ? `#${index + 1} Ranking`
                    : (cast.store.area?.name ?? cast.store.district)}
                </small>
              </span>
              <ChevronRight size={15} />
            </Link>
          ))}
        </>
      ) : (
        <div className="cast-suggestion-empty">Không có gợi ý trùng khớp.</div>
      )}

      <div className="cast-suggestion-split">
        <span>Tìm gần đây</span>
        <button type="button">Xóa lịch sử</button>
      </div>
      <div className="cast-suggestion-tags">
        {recentSearches.map((item) => (
          <button
            key={item}
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onRecent(item)}
          >
            <History size={13} />
            {item}
          </button>
        ))}
      </div>

      <div className="cast-suggestion-label">Từ khóa phổ biến</div>
      <div className="cast-suggestion-tags is-gold">
        {popularKeywords.map((item) => (
          <button
            key={item}
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onKeyword(item)}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function CastDiscoveryCard({ cast, index }: { cast: PublicCast; index: number }) {
  const image = cast.thumbnailUrl ?? pickByIndex(castFallbackImages, index, castFallbackImages[0]);
  const areaLabel = [
    cast.store.area?.name ?? cast.store.district,
    cityLabels[cast.store.cityCode ?? ""],
  ]
    .filter(Boolean)
    .join(" · ");
  const langText =
    cast.languages.map((item) => compactLanguageLabels[item] ?? item.toUpperCase()).join(" · ") ||
    "VI";
  const categoryLabel = categoryLabels[cast.store.category] ?? cast.store.category;
  const rating = (4.9 - Math.min(index, 4) * 0.1).toFixed(1);
  const badgeLabel = index < 3 ? `#${index + 1}` : index % 3 === 0 ? "Tối nay" : "Mới";
  const isRanked = index < 3;

  return (
    <Link href={`/casts/${cast.slug}`} className="cast-card">
      <PlaceholderMedia src={image} alt={cast.name} label="Ảnh cast" className="cast-card-media">
        <span className="cast-media-shade" />
        <span className={`cast-rank-badge ${isRanked ? "is-ranked" : ""}`}>
          {isRanked ? <Star size={11} fill="currentColor" /> : <span className="cast-live-dot" />}
          {badgeLabel}
        </span>
        <span className="cast-fav-button" aria-hidden="true">
          <Heart size={15} fill={index === 0 ? "currentColor" : "none"} />
        </span>
        <span className="cast-card-name">
          <b>{cast.name}</b>
          <small>{categoryLabel}</small>
        </span>
        <span className="cast-card-place">
          <MapPin size={12} />
          <b>{cast.store.name}</b>
          {areaLabel ? <small>· {areaLabel}</small> : null}
        </span>
      </PlaceholderMedia>

      <div className="cast-card-body">
        <div className="cast-card-meta">
          <span className="cast-language-pill">
            <Languages size={12} />
            {langText}
          </span>
          <span className="cast-like-count">
            <Heart size={12} fill="currentColor" />
            {pickByIndex(favoriteCounts, index, "640")}
          </span>
        </div>

        <div className="cast-card-foot">
          <span>
            <b>{formatVnd(cast.hourlyRateVnd)}</b>
            <small> /60p</small>
          </span>
          <span className="cast-rating">
            <Star size={13} fill="currentColor" />
            {rating}
          </span>
          <span className="cast-card-cta">
            Đặt
            <ChevronRight size={13} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function MobileFilterSheet({
  activeCount,
  area,
  areaOptions,
  category,
  city,
  language,
  priceRange,
  storeOptions,
  storeSlug,
  total,
  hasActiveCoupon,
  onArea,
  onCategory,
  onCity,
  onClose,
  onLanguage,
  onPrice,
  onReset,
  onStore,
  onToggleCoupon,
}: {
  activeCount: number;
  area: string;
  areaOptions: Option[];
  category: string;
  city: string;
  language: string;
  priceRange: PriceRange;
  sortLabel: string;
  storeOptions: Option[];
  storeSlug: string;
  total: number;
  hasActiveCoupon: boolean;
  onArea: (value: string) => void;
  onCategory: (value: string) => void;
  onCity: (value: string) => void;
  onClose: () => void;
  onLanguage: (value: string) => void;
  onPrice: (value: string) => void;
  onReset: () => void;
  onStore: (value: string) => void;
  onToggleCoupon: () => void;
}) {
  return (
    <div className="cast-sheet-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="cast-filter-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cast-filter-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="cast-sheet-handle" />
        <header className="cast-sheet-head">
          <div>
            <h2 id="cast-filter-title">Bộ lọc</h2>
            <p>{activeCount ? `${activeCount} bộ lọc đang bật` : "Lọc cast theo nhu cầu"}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng bộ lọc">
            <X size={18} />
          </button>
        </header>

        <div className="cast-sheet-scroll hscroll">
          <FilterChipGroup label="Thành phố" options={cityOptions} value={city} onChange={onCity} />
          <FilterChipGroup label="Khu vực" options={areaOptions} value={area} onChange={onArea} />
          <FilterChipGroup
            label="Quán"
            options={storeOptions}
            value={storeSlug}
            onChange={onStore}
          />
          <FilterChipGroup
            label="Loại hình"
            options={categoryOptions}
            value={category}
            onChange={onCategory}
          />
          <FilterChipGroup
            label="Ngôn ngữ"
            options={languageOptions}
            value={language}
            onChange={onLanguage}
          />
          <FilterChipGroup
            label="Khoảng giá"
            note="/ 60 phút"
            options={priceRangeOptions}
            value={priceRange}
            onChange={onPrice}
          />

          <div className="cast-range-preview" aria-hidden="true">
            <div>
              <span>Độ tuổi</span>
              <b>22 - 28</b>
            </div>
            <i>
              <span />
              <b />
              <b />
            </i>
            <small>
              <span>20</span>
              <span>40+</span>
            </small>
          </div>

          <div className="cast-toggle-row">
            <span>
              <i />
              Có ưu đãi đang chạy
            </span>
            <button
              type="button"
              aria-pressed={hasActiveCoupon}
              className={hasActiveCoupon ? "is-on" : ""}
              onClick={onToggleCoupon}
            >
              <b />
            </button>
          </div>
          <div className="cast-toggle-row">
            <span>
              <Clock3 size={15} />
              Còn lịch trống tuần này
            </span>
            <button type="button" aria-pressed="false">
              <b />
            </button>
          </div>
        </div>

        <footer className="cast-sheet-actions">
          <button type="button" className="cast-reset-button" onClick={onReset}>
            <RotateCcw size={15} />
            Đặt lại
          </button>
          <button type="button" className="cast-apply-button" onClick={onClose}>
            Xem {total} cast
          </button>
        </footer>
      </section>
    </div>
  );
}

function FilterChipGroup({
  label,
  note,
  options,
  value,
  onChange,
}: {
  label: string;
  note?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <section className="cast-sheet-group" aria-label={label}>
      <h3>
        {label}
        {note ? <span>{note}</span> : null}
      </h3>
      <div>
        {options.map((option) => (
          <button
            key={`${label}-${option.value || "all"}`}
            type="button"
            className={value === option.value ? "is-active" : ""}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </section>
  );
}

const castSearchCss = `
.cast-search-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #0e0d12 0%, #111015 48%, #09090b 100%);
  color: #f3f0ea;
  font-family: var(--nl-font-sans);
  padding: 28px 28px 58px;
}

.cast-search-shell {
  width: min(1180px, 100%);
  margin: 0 auto;
}

.cast-mobile-topbar {
  display: none;
}

.cast-hero {
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(21, 19, 26, 0.96), rgba(13, 12, 17, 0.98));
  box-shadow: 0 30px 70px -34px rgba(0, 0, 0, 0.7);
  padding: 26px 28px 24px;
}

.cast-hero-copy {
  max-width: 720px;
}

.cast-eyebrow {
  color: #d4b26a;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.8px;
  text-transform: uppercase;
}

.cast-hero h1,
.cast-mobile-topbar h1 {
  margin: 7px 0 0;
  color: #f3f0ea;
  font-size: 28px;
  line-height: 1.15;
  font-weight: 800;
  letter-spacing: 0;
}

.cast-hero p,
.cast-mobile-topbar p {
  margin: 8px 0 0;
  max-width: 720px;
  color: #9b958a;
  font-size: 13px;
  line-height: 1.55;
}

.cast-search-controls {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 176px 116px;
  gap: 10px;
  margin-top: 18px;
}

.cast-search-input,
.cast-select-control,
.cast-sort-select {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
  border: 1px solid rgba(212, 178, 106, 0.28);
  background: rgba(255, 255, 255, 0.04);
  color: #c5c0b6;
}

.cast-search-input {
  min-height: 52px;
  border-radius: 14px;
  padding: 0 14px 0 18px;
}

.cast-search-input.is-focused {
  border-color: rgba(212, 178, 106, 0.85);
  box-shadow: 0 0 0 3px rgba(212, 178, 106, 0.14);
}

.cast-search-input svg,
.cast-select-control svg,
.cast-sort-select svg {
  color: #c9a86a;
  flex: none;
}

.cast-search-input input,
.cast-select-control select,
.cast-sort-select select {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #f3f0ea;
  font-family: var(--nl-font-sans);
}

.cast-search-input input {
  font-size: 14.5px;
}

.cast-search-input input::placeholder {
  color: #8c8679;
}

.cast-input-clear,
.cast-input-filter,
.cast-round-icon,
.cast-sheet-head button {
  border: 0;
  background: transparent;
  color: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  cursor: pointer;
}

.cast-input-clear {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: #9b958a;
}

.cast-input-filter {
  display: none;
}

.cast-select-control {
  position: relative;
  min-height: 52px;
  border-radius: 14px;
  padding: 0 13px;
}

.cast-select-control select,
.cast-sort-select select {
  appearance: none;
  cursor: pointer;
}

.cast-select-control option,
.cast-sort-select option {
  color: #16151a;
  background: #fff;
}

.cast-find-button,
.cast-apply-button,
.cast-card-cta {
  border: 0;
  background: linear-gradient(135deg, #f4e3b4, #d4b26a 55%, #b6924a);
  color: #241a0a;
  font-family: var(--nl-font-sans);
  font-weight: 800;
  cursor: pointer;
}

.cast-find-button {
  min-height: 52px;
  border-radius: 14px;
  font-size: 14px;
}

.cast-chip-row {
  display: flex;
  gap: 9px;
  align-items: center;
  margin-top: 16px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.cast-chip {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 34px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.05);
  color: #c5c0b6;
  padding: 7px 14px;
  font-family: var(--nl-font-sans);
  font-size: 12.5px;
  font-weight: 650;
  cursor: pointer;
  white-space: nowrap;
}

.cast-chip.is-active {
  border-color: transparent;
  background: linear-gradient(135deg, #f0dda8, #d4b26a);
  color: #241a0a;
}

.cast-filter-chip b {
  display: inline-grid;
  place-items: center;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  background: #241a0a;
  color: #f0dda8;
  font-size: 10px;
}

.cast-live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #e0729e;
  box-shadow: 0 0 7px #e0729e;
  flex: none;
}

.cast-error {
  margin-top: 14px;
  border: 1px solid rgba(248, 113, 113, 0.35);
  background: rgba(127, 29, 29, 0.2);
  color: #fecaca;
  border-radius: 14px;
  padding: 12px 14px;
  font-size: 13px;
  font-weight: 700;
}

.cast-results-section {
  margin-top: 22px;
}

.cast-results-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 14px;
  color: #9b958a;
  font-size: 13px;
}

.cast-results-head b {
  color: #f3f0ea;
  font-size: 14px;
}

.cast-sort-select {
  min-height: 38px;
  border-radius: 13px;
  padding: 0 12px;
  font-size: 13px;
}

.cast-sort-select span {
  white-space: nowrap;
}

.cast-sort-select select {
  width: auto;
  color: #e3c27e;
  font-weight: 700;
}

.cast-card-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.cast-card {
  display: block;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.035);
  color: #f3f0ea;
  text-decoration: none;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.22);
}

.cast-card:first-child {
  border-color: rgba(212, 178, 106, 0.28);
}

.cast-card-media {
  height: 250px;
  position: relative;
}

.cast-card-media img {
  transition: transform 360ms ease;
}

.cast-card:hover .cast-card-media img {
  transform: scale(1.035);
}

.cast-media-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(12, 12, 15, 0.02) 35%, rgba(12, 12, 15, 0.92) 100%);
}

.cast-rank-badge,
.cast-fav-button {
  position: absolute;
  top: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.cast-rank-badge {
  left: 11px;
  gap: 5px;
  min-height: 28px;
  border: 1px solid rgba(212, 178, 106, 0.4);
  border-radius: 9px;
  background: rgba(12, 12, 15, 0.55);
  color: #f0e6d2;
  padding: 5px 10px;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  backdrop-filter: blur(4px);
}

.cast-rank-badge.is-ranked {
  border-color: transparent;
  background: linear-gradient(135deg, #f4e3b4, #d4b26a 55%, #b6924a);
  color: #241a0a;
  box-shadow: 0 6px 16px -8px rgba(168, 124, 60, 0.8);
}

.cast-fav-button {
  right: 11px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(12, 12, 15, 0.5);
  color: #e0729e;
  backdrop-filter: blur(4px);
}

.cast-card-name,
.cast-card-place {
  position: absolute;
  left: 12px;
  right: 12px;
  min-width: 0;
}

.cast-card-name {
  bottom: 34px;
  display: flex;
  align-items: flex-end;
  gap: 7px;
}

.cast-card-name b {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #fff;
  font-size: 20px;
  line-height: 1;
  font-weight: 800;
  text-shadow: 0 1px 10px rgba(0, 0, 0, 0.5);
}

.cast-card-name small {
  color: #e7e1d4;
  font-size: 11px;
  white-space: nowrap;
}

.cast-card-place {
  bottom: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
  color: #a7a294;
  font-size: 11px;
}

.cast-card-place svg {
  color: #d4b26a;
  flex: none;
}

.cast-card-place b,
.cast-card-place small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cast-card-place b {
  color: #e3c27e;
  font-weight: 700;
}

.cast-card-body {
  padding: 11px 13px 13px;
}

.cast-card-meta,
.cast-card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.cast-language-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  max-width: 66%;
  border: 1px solid rgba(212, 178, 106, 0.24);
  border-radius: 7px;
  background: rgba(212, 178, 106, 0.1);
  color: #cdb579;
  padding: 3px 7px;
  font-size: 10.5px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cast-like-count {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #c5c0b6;
  font-size: 11.5px;
}

.cast-like-count svg {
  color: #e0729e;
}

.cast-card-foot {
  margin-top: 11px;
}

.cast-card-foot span:first-child {
  min-width: 0;
}

.cast-card-foot b {
  color: #e3c27e;
  font-size: 14px;
  font-weight: 800;
}

.cast-card-foot small {
  color: #8c8679;
  font-size: 10.5px;
}

.cast-rating {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #e3c27e;
  font-size: 12px;
  font-weight: 800;
}

.cast-card-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 12px;
}

.cast-suggestions {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  z-index: 20;
  width: min(560px, 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  background: #16141b;
  box-shadow: 0 30px 70px -28px rgba(0, 0, 0, 0.8);
  overflow: hidden;
}

.cast-suggestion-searchline {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.cast-suggestion-searchline svg {
  color: #d4b26a;
}

.cast-suggestion-searchline span {
  flex: 1;
  color: #f3f0ea;
  font-size: 15px;
}

.cast-suggestion-searchline i {
  display: inline-block;
  width: 2px;
  height: 17px;
  margin-left: 1px;
  vertical-align: -3px;
  background: #d4b26a;
}

.cast-suggestions mark {
  background: transparent;
  color: #e3c27e;
  font-weight: 800;
}

.cast-suggestion-label,
.cast-suggestion-split {
  color: #8c8679;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 1.4px;
  text-transform: uppercase;
}

.cast-suggestion-label {
  padding: 14px 16px 4px;
}

.cast-suggestion-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 58px;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: #f3f0ea;
  text-decoration: none;
}

.cast-suggestion-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid rgba(212, 178, 106, 0.4);
  flex: none;
}

.cast-suggestion-row > span {
  display: grid;
  min-width: 0;
  flex: 1;
  gap: 2px;
}

.cast-suggestion-row b,
.cast-suggestion-row small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cast-suggestion-row b {
  color: #f3f0ea;
  font-size: 14px;
}

.cast-suggestion-row small {
  color: #8c8679;
  font-size: 11px;
}

.cast-suggestion-row > svg {
  color: #6f6b62;
}

.cast-suggestion-empty {
  padding: 16px;
  color: #9b958a;
  font-size: 13px;
}

.cast-suggestion-split {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 8px;
}

.cast-suggestion-split button {
  border: 0;
  background: transparent;
  color: #9b958a;
  font-family: var(--nl-font-sans);
  font-size: 11px;
  cursor: pointer;
  text-transform: none;
  letter-spacing: 0;
}

.cast-suggestion-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 16px 14px;
}

.cast-suggestion-tags button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  color: #c5c0b6;
  padding: 7px 13px;
  font-family: var(--nl-font-sans);
  font-size: 12.5px;
  cursor: pointer;
}

.cast-suggestion-tags.is-gold button {
  border-color: rgba(212, 178, 106, 0.26);
  background: rgba(212, 178, 106, 0.1);
  color: #d9c08a;
}

.cast-sheet-backdrop {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(6, 6, 8, 0.68);
  color: #f3f0ea;
}

.cast-filter-sheet {
  width: min(420px, 100%);
  max-height: calc(100vh - 58px);
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(212, 178, 106, 0.2);
  border-bottom: 0;
  border-radius: 24px 24px 0 0;
  background: #121116;
  box-shadow: 0 -20px 50px -20px rgba(0, 0, 0, 0.7);
  overflow: hidden;
}

.cast-sheet-handle {
  width: 38px;
  height: 4px;
  border-radius: 3px;
  margin: 10px auto 4px;
  background: rgba(255, 255, 255, 0.18);
}

.cast-sheet-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 18px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.cast-sheet-head h2 {
  margin: 0;
  color: #f3f0ea;
  font-size: 18px;
  font-weight: 800;
}

.cast-sheet-head p {
  margin: 4px 0 0;
  color: #9b958a;
  font-size: 12px;
}

.cast-sheet-head button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.cast-sheet-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 14px 18px 4px;
}

.cast-sheet-group {
  margin-bottom: 18px;
}

.cast-sheet-group h3 {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin: 0 0 9px;
  color: #f3f0ea;
  font-size: 13.5px;
  font-weight: 750;
}

.cast-sheet-group h3 span {
  color: #8c8679;
  font-size: 11px;
  font-weight: 500;
}

.cast-sheet-group div {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cast-sheet-group button {
  min-height: 36px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  color: #c5c0b6;
  padding: 8px 14px;
  font-family: var(--nl-font-sans);
  font-size: 12.5px;
  cursor: pointer;
}

.cast-sheet-group button.is-active {
  border-color: transparent;
  background: linear-gradient(135deg, #f0dda8, #d4b26a);
  color: #241a0a;
  font-weight: 800;
}

.cast-range-preview {
  margin: 4px 0 20px;
}

.cast-range-preview > div,
.cast-range-preview small {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cast-range-preview > div {
  margin-bottom: 12px;
  color: #f3f0ea;
  font-size: 13.5px;
  font-weight: 750;
}

.cast-range-preview > div b {
  color: #e3c27e;
  font-size: 12px;
}

.cast-range-preview > i {
  position: relative;
  display: block;
  height: 4px;
  margin: 0 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.1);
}

.cast-range-preview > i span {
  position: absolute;
  left: 18%;
  right: 32%;
  top: 0;
  bottom: 0;
  border-radius: 3px;
  background: linear-gradient(90deg, #d4b26a, #e3c27e);
}

.cast-range-preview > i b {
  position: absolute;
  top: 50%;
  width: 18px;
  height: 18px;
  border: 2px solid #d4b26a;
  border-radius: 50%;
  background: #f3efe6;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

.cast-range-preview > i b:nth-child(2) {
  left: 18%;
  transform: translate(-50%, -50%);
}

.cast-range-preview > i b:nth-child(3) {
  left: 68%;
  transform: translate(-50%, -50%);
}

.cast-range-preview small {
  margin: 9px 4px 0;
  color: #8c8679;
  font-size: 10.5px;
}

.cast-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.035);
  padding: 11px 13px;
}

.cast-toggle-row:first-of-type {
  border-color: rgba(212, 178, 106, 0.22);
}

.cast-toggle-row span {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: #e7e1d4;
  font-size: 13px;
}

.cast-toggle-row span i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #e0729e;
  box-shadow: 0 0 7px #e0729e;
}

.cast-toggle-row button {
  position: relative;
  width: 40px;
  height: 23px;
  border: 0;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.12);
  cursor: pointer;
  flex: none;
}

.cast-toggle-row button b {
  position: absolute;
  left: 2px;
  top: 2px;
  width: 19px;
  height: 19px;
  border-radius: 50%;
  background: #8c8679;
}

.cast-toggle-row button.is-on {
  background: linear-gradient(135deg, #f0dda8, #d4b26a);
}

.cast-toggle-row button.is-on b {
  left: auto;
  right: 2px;
  background: #241a0a;
}

.cast-sheet-actions {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 12px 18px calc(18px + env(safe-area-inset-bottom));
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(8, 8, 11, 0.72);
}

.cast-reset-button,
.cast-apply-button {
  min-height: 48px;
  border-radius: 12px;
  font-family: var(--nl-font-sans);
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}

.cast-reset-button {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.05);
  color: #c5c0b6;
  padding: 0 17px;
}

.cast-apply-button {
  flex: 1;
}

@media (max-width: 1040px) {
  .cast-card-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .cast-search-page {
    padding: 0 0 calc(20px + env(safe-area-inset-bottom));
    background: #0c0c0f;
  }

  .cast-search-shell {
    width: 100%;
  }

  .cast-mobile-topbar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px 10px;
    background: #0c0c0f;
  }

  .cast-round-icon {
    width: 36px;
    height: 36px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 50%;
    color: #f3f0ea;
  }

  .cast-mobile-topbar h1 {
    margin: 0;
    font-size: 17px;
  }

  .cast-mobile-topbar p {
    margin-top: 2px;
    font-size: 8px;
    font-weight: 800;
    letter-spacing: 1.8px;
    text-transform: uppercase;
  }

  .cast-hero {
    border: 0;
    border-radius: 0;
    box-shadow: none;
    padding: 0 16px 8px;
    background: #0c0c0f;
  }

  .cast-hero-copy {
    display: none;
  }

  .cast-search-controls {
    display: block;
    margin-top: 0;
  }

  .cast-search-input {
    min-height: 45px;
    border-radius: 13px;
    padding: 0 11px 0 14px;
  }

  .cast-search-input input {
    font-size: 13.5px;
  }

  .cast-input-filter {
    display: inline-flex;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    color: #8c8679;
  }

  .cast-city-select,
  .cast-find-button {
    display: none;
  }

  .cast-chip-row {
    margin: 12px -16px 0;
    padding: 0 16px 4px;
  }

  .cast-chip {
    min-height: 32px;
    border-radius: 16px;
    padding: 7px 13px;
    font-size: 12px;
  }

  .cast-results-section {
    margin-top: 8px;
  }

  .cast-results-head {
    padding: 0 16px;
    margin-bottom: 10px;
    font-size: 12px;
  }

  .cast-results-head b {
    font-size: 12px;
  }

  .cast-sort-select {
    min-height: auto;
    border: 0;
    background: transparent;
    padding: 0;
    font-size: 12px;
  }

  .cast-sort-select span {
    display: inline;
  }

  .cast-card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    padding: 0 16px;
  }

  .cast-card {
    border-radius: 15px;
  }

  .cast-card-media {
    height: 190px;
  }

  .cast-rank-badge {
    top: 9px;
    left: 9px;
    min-height: 25px;
    border-radius: 8px;
    padding: 4px 8px;
    font-size: 9px;
  }

  .cast-fav-button {
    top: 8px;
    right: 8px;
    width: 28px;
    height: 28px;
  }

  .cast-card-name {
    left: 10px;
    right: 10px;
    bottom: 29px;
  }

  .cast-card-name b {
    font-size: 16px;
  }

  .cast-card-name small {
    font-size: 10px;
  }

  .cast-card-place {
    left: 10px;
    right: 10px;
    bottom: 9px;
    font-size: 10px;
  }

  .cast-card-place svg,
  .cast-card-place small {
    display: none;
  }

  .cast-card-body {
    padding: 9px 11px 11px;
  }

  .cast-language-pill {
    border: 0;
    background: transparent;
    padding: 0;
    color: #9b8f6f;
    font-size: 9.5px;
  }

  .cast-language-pill svg {
    display: none;
  }

  .cast-like-count {
    font-size: 10.5px;
  }

  .cast-card-foot {
    align-items: flex-end;
    margin-top: 9px;
  }

  .cast-card-foot b {
    font-size: 13px;
  }

  .cast-rating,
  .cast-card-cta {
    display: none;
  }

  .cast-suggestions {
    position: fixed;
    inset: 56px 0 0;
    width: auto;
    border: 0;
    border-radius: 0;
    background: #0c0c0f;
    box-shadow: none;
    overflow-y: auto;
  }

  .cast-suggestion-searchline {
    padding: 8px 14px 12px;
  }

  .cast-suggestion-tags {
    padding-bottom: 12px;
  }
}

@media (max-width: 360px) {
  .cast-card-grid {
    gap: 10px;
    padding: 0 12px;
  }

  .cast-card-media {
    height: 176px;
  }
}
`;
