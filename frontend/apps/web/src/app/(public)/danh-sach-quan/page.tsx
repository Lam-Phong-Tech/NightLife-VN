"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Heart,
  LocateFixed,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { discoveryApi, type DiscoverySort, type PublicArea, type PublicStore } from "@/lib/api/discovery";
import { storeImageForSlug } from "@/lib/demo-media";
import { formatPriceTier } from "@/lib/price-tier";

type Coordinates = {
  lat: number;
  lng: number;
};

type FilterOption = {
  value: string;
  label: string;
};

type VenueView = {
  id: string;
  name: string;
  categoryLabel: string;
  areaLabel: string;
  cityLabel: string;
  distanceLabel: string;
  priceLabel: string;
  rating: number;
  tags: string[];
  statusLabel: string;
  dealLabel: string;
  image: string;
};

const cityOptions = [
  { value: "hn", label: "Hà Nội" },
  { value: "hcm", label: "TP.HCM" },
  { value: "", label: "Tất cả" },
];

const sortOptions: Array<{ value: DiscoverySort; label: string }> = [
  { value: "priority", label: "Phổ biến" },
  { value: "nearest", label: "Gần nhất" },
  { value: "newest", label: "Mới nhất" },
];

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

const cityLabels: Record<string, string> = {
  hn: "Hà Nội",
  hcm: "TP.HCM",
};

const sortLabels: Record<DiscoverySort, string> = {
  priority: "Phổ biến",
  nearest: "Gần nhất",
  newest: "Mới nhất",
};

const areaLabels: Record<string, string> = {
  "Hoan Kiem": "Hoàn Kiếm",
  "Tay Ho": "Tây Hồ",
  "Quan 1": "Quận 1",
  "Quan 3": "Quận 3",
  "Quan 7": "Quận 7",
};

const fallbackAreaOptionsByCity: Record<string, FilterOption[]> = {
  hn: [
    { value: "hn-hoan-kiem", label: "Hoàn Kiếm" },
    { value: "hn-tay-ho", label: "Tây Hồ" },
  ],
  hcm: [
    { value: "hcm-q1", label: "Quận 1" },
    { value: "hcm-q3", label: "Quận 3" },
    { value: "hcm-q7", label: "Quận 7" },
  ],
};

const getFallbackAreaOptions = (cityCode: string) =>
  cityCode
    ? fallbackAreaOptionsByCity[cityCode] ?? []
    : Object.values(fallbackAreaOptionsByCity).flat();

const categoryTags: Record<string, string[]> = {
  BAR: ["Live music", "Rooftop", "Whisky bar"],
  CLUB: ["Đặt bàn VIP", "Sân khấu DJ", "Mở đến 02:00"],
  LOUNGE: ["Hỗ trợ tiếng Nhật", "Phòng riêng", "Cocktail"],
  GIRLS_BAR: ["Host lounge", "VIP sofa", "Cocktail"],
  KARAOKE: ["Phòng riêng", "Âm thanh hay", "Combo nhóm"],
  MASSAGE_SPA: ["Thư giãn", "Mở muộn", "Gói đôi"],
  RESTAURANT: ["Izakaya", "Phòng riêng", "Ăn khuya"],
  CASINO: ["VIP table", "Private room", "Premium"],
};

const categoryPrices: Record<string, string> = {
  BAR: "từ 650.000đ",
  CLUB: "từ 2.500.000đ",
  LOUNGE: "từ 900.000đ",
  GIRLS_BAR: "từ 1.200.000đ",
  KARAOKE: "từ 1.500.000đ",
  MASSAGE_SPA: "từ 500.000đ",
  RESTAURANT: "từ 800.000đ",
  CASINO: "từ 3.000.000đ",
};

const dealLabels = [
  "-30% Happy Hour",
  "Combo nhóm",
  "2+1 Combo phòng",
  "Ưu đãi VIP",
  "Set Nhật Bản",
  "-20% gói đôi",
];

const distanceFallbacks = ["1.2 km", "2.4 km", "3.1 km", "3.8 km", "4.6 km", "5.2 km"];

const pickByIndex = <T,>(items: readonly T[], index: number, fallback: T) =>
  items[index % items.length] ?? fallback;

const roundRating = (index: number) => pickByIndex([4.9, 4.8, 4.8, 4.7, 4.7, 4.6], index, 4.7);

const formatDistance = (distanceKm: number | null | undefined, index: number) =>
  typeof distanceKm === "number" && Number.isFinite(distanceKm)
    ? `${distanceKm.toFixed(1)} km`
    : pickByIndex(distanceFallbacks, index, "1.2 km");

const toVenueView = (store: PublicStore, index: number): VenueView => {
  const categoryLabel = categoryLabels[store.category] ?? store.category;
  const areaLabel = store.area?.name ?? store.district ?? store.city ?? "Trung tâm";
  const cityLabel = cityLabels[store.cityCode ?? ""] ?? store.city;
  const image = storeImageForSlug(store.slug, index);
  const statusLabel = index % 3 === 2 ? "Mở đến 02:00" : "Đang mở";

  return {
    id: store.slug,
    name: store.name,
    categoryLabel,
    areaLabel,
    cityLabel,
    distanceLabel: formatDistance(store.distanceKm, index),
    priceLabel: formatPriceTier(categoryPrices[store.category] ?? "từ 900.000đ"),
    rating: roundRating(index),
    tags: categoryTags[store.category] ?? ["Đặt bàn nhanh", "Không gian đẹp", "Ưu đãi"],
    statusLabel,
    dealLabel: pickByIndex(dealLabels, index, "-30% Happy Hour"),
    image,
  };
};

export default function Page() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("hn");
  const [area, setArea] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<DiscoverySort>("priority");
  const [hasActiveCoupon, setHasActiveCoupon] = useState(false);
  const [ratingOnly, setRatingOnly] = useState(false);
  const [openNow, setOpenNow] = useState(true);
  const [isFilterSheetOpen, setFilterSheetOpen] = useState(false);
  const [isCityMenuOpen, setCityMenuOpen] = useState(false);
  const [isSortMenuOpen, setSortMenuOpen] = useState(false);
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [areas, setAreas] = useState<PublicArea[]>([]);
  const [stores, setStores] = useState<PublicStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
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
        .listStores({
          q: query,
          city,
          area,
          category,
          lat: coords?.lat,
          lng: coords?.lng,
          limit: 48,
          sort,
          hasActiveCoupon,
        })
        .then((items) => {
          if (!cancelled) setStores(items);
        })
        .catch(() => {
          if (!cancelled) {
            setStores([]);
            setError("Chưa kết nối được dữ liệu quán.");
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
  }, [area, category, city, coords, hasActiveCoupon, query, sort]);

  useEffect(() => {
    if (!isFilterSheetOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFilterSheetOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isFilterSheetOpen]);

  const venues = useMemo(
    () =>
      stores
        .map(toVenueView)
        .filter((venue) => !ratingOnly || venue.rating >= 4.5)
        .filter(
          (venue) =>
            !openNow || venue.statusLabel.includes("Đang") || venue.statusLabel.includes("Mở"),
        ),
    [openNow, ratingOnly, stores],
  );

  const cityLabel = cityLabels[city] ?? "Việt Nam";
  const selectedCityLabel = cityOptions.find((option) => option.value === city)?.label ?? cityLabel;

  const areaOptions = useMemo<FilterOption[]>(() => {
    const dynamicOptions = areas.map((item) => ({
      value: item.code || item.name,
      label: areaLabels[item.name] ?? item.name,
    }));

    return [{ value: "", label: "Tất cả" }, ...(dynamicOptions.length ? dynamicOptions : getFallbackAreaOptions(city))];
  }, [areas, city]);

  const requestNearby = () => {
    if (!navigator.geolocation) {
      setError("Thiết bị chưa hỗ trợ lấy vị trí.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setSort("nearest");
        setIsLocating(false);
      },
      () => {
        setError("Chưa lấy được vị trí hiện tại.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const handleCityChange = (nextCity: string) => {
    setCity(nextCity);
    setArea("");
    setCityMenuOpen(false);
    setSort((current) => (current === "nearest" && !coords ? "priority" : current));
  };

  const handleSortChange = (nextSort: DiscoverySort) => {
    setSortMenuOpen(false);

    if (nextSort === "nearest" && !coords) {
      requestNearby();
      return;
    }

    setSort(nextSort);
  };

  const categoryChips = [
    { label: "Lounge", value: "LOUNGE" },
    { label: "Bar", value: "BAR" },
    { label: "Club", value: "CLUB" },
    { label: "Karaoke", value: "KARAOKE" },
    { label: "Spa", value: "MASSAGE_SPA" },
  ];
  const categoryOptions = [{ label: "Tất cả", value: "" }, ...categoryChips];
  const activeFilterCount = [
    city !== "hn",
    area,
    category,
    sort !== "priority",
    hasActiveCoupon,
    ratingOnly,
    !openNow,
  ].filter(Boolean).length;

  const resetFilters = () => {
    setCity("hn");
    setArea("");
    setCategory("");
    setSort("priority");
    setHasActiveCoupon(false);
    setRatingOnly(false);
    setOpenNow(true);
    setSortMenuOpen(false);
    setCityMenuOpen(false);
  };

  return (
    <main className="venue-search-page">
      <style>{venueSearchCss}</style>

      <div className="venue-search-shell">
        <header className="venue-search-header">
          <Link href="/" aria-label="Quay lại trang chủ" className="venue-search-back">
            <ArrowLeft size={17} />
          </Link>

          <div className="venue-search-title">
            <h1>
              <span className="venue-title-desktop">Tìm quán đêm {cityLabel}</span>
              <span className="venue-title-mobile">Tìm quán</span>
            </h1>
            <p>
              <span className="venue-subtitle-desktop">FIND YOUR VENUE TONIGHT</span>
              <span className="venue-subtitle-mobile">FIND VENUES</span>
            </p>
          </div>
        </header>

        <section className="venue-search-controls" aria-label="Tìm và lọc quán">
          <label className="venue-search-input">
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm quán, khu vực hoặc loại hình..."
            />
            <button
              type="button"
              aria-label="Bộ lọc"
              className="venue-filter-icon"
              data-testid="venue-filter-button"
              onClick={() => setFilterSheetOpen(true)}
            >
              <SlidersHorizontal size={16} />
            </button>
          </label>

          <div
            className="venue-city-select"
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setCityMenuOpen(false);
              }
            }}
          >
            <button
              type="button"
              className="venue-city-trigger"
              aria-haspopup="listbox"
              aria-expanded={isCityMenuOpen}
              onClick={() => setCityMenuOpen((current) => !current)}
            >
              <MapPin size={15} />
              <span className="venue-city-current">{selectedCityLabel}</span>
              <ChevronDown size={14} />
            </button>
            {isCityMenuOpen ? (
              <div className="venue-city-menu" role="listbox" aria-label="Chọn thành phố">
                {cityOptions.map((option) => (
                  <button
                    key={option.value || "all"}
                    type="button"
                    role="option"
                    aria-selected={option.value === city}
                    className={option.value === city ? "is-selected" : ""}
                    onClick={() => handleCityChange(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <button type="button" className="venue-find-button">
            Tìm
          </button>
        </section>

        <nav className="venue-chip-row hscroll" aria-label="Bộ lọc nhanh">
          <button
            type="button"
            className={`venue-chip ${openNow ? "is-active" : ""}`}
            onClick={() => setOpenNow((current) => !current)}
          >
            Đang mở
          </button>
          <button
            type="button"
            className={`venue-chip ${sort === "nearest" ? "is-active" : ""}`}
            onClick={requestNearby}
            disabled={isLocating}
          >
            <LocateFixed size={13} />
            {isLocating ? "Đang lấy vị trí" : "Gần tôi"}
          </button>
          <button
            type="button"
            className={`venue-chip ${hasActiveCoupon ? "is-active" : ""}`}
            onClick={() => setHasActiveCoupon((current) => !current)}
          >
            Có ưu đãi
          </button>
          <button
            type="button"
            className={`venue-chip ${ratingOnly ? "is-active" : ""}`}
            onClick={() => setRatingOnly((current) => !current)}
          >
            4.5★ trở lên
          </button>
          {categoryChips.map((chip) => (
            <button
              key={chip.value}
              type="button"
              className={`venue-chip ${category === chip.value ? "is-active" : ""}`}
              onClick={() => setCategory((current) => (current === chip.value ? "" : chip.value))}
            >
              {chip.label}
            </button>
          ))}
        </nav>

        <div className="venue-result-bar">
          <div>
            <strong>{isLoading ? "..." : venues.length} quán</strong>
            <span> · {cityLabel}</span>
          </div>

          <div
            className="venue-sort-select"
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setSortMenuOpen(false);
              }
            }}
          >
            <button
              type="button"
              className="venue-sort-trigger"
              aria-haspopup="listbox"
              aria-expanded={isSortMenuOpen}
              onClick={() => setSortMenuOpen((current) => !current)}
            >
              <span>Sắp xếp:</span>
              <strong>{sortLabels[sort]}</strong>
              <ChevronDown size={13} />
            </button>
            {isSortMenuOpen ? (
              <div className="venue-sort-menu" role="listbox" aria-label="Sắp xếp danh sách">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={option.value === sort}
                    className={option.value === sort ? "is-selected" : ""}
                    onClick={() => handleSortChange(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {error ? <div className="venue-error">{error}</div> : null}

        <section className="venue-list" aria-label="Danh sách quán">
          {isLoading ? (
            <VenueSkeletons />
          ) : venues.length > 0 ? (
            venues.map((venue) => <VenueResultCard key={venue.id} venue={venue} />)
          ) : (
            <div className="venue-empty">
              <strong>Chưa có quán phù hợp</strong>
              <span>Đổi khu vực, loại hình hoặc từ khóa để xem thêm.</span>
            </div>
          )}
        </section>
      </div>

      {isFilterSheetOpen ? (
        <MobileVenueFilterSheet
          activeCount={activeFilterCount}
          area={area}
          areaOptions={areaOptions}
          category={category}
          categoryOptions={categoryOptions}
          city={city}
          hasActiveCoupon={hasActiveCoupon}
          openNow={openNow}
          ratingOnly={ratingOnly}
          sort={sort}
          total={venues.length}
          onArea={setArea}
          onCategory={setCategory}
          onCity={handleCityChange}
          onClose={() => setFilterSheetOpen(false)}
          onReset={resetFilters}
          onSort={handleSortChange}
          onToggleCoupon={() => setHasActiveCoupon((current) => !current)}
          onToggleOpenNow={() => setOpenNow((current) => !current)}
          onToggleRating={() => setRatingOnly((current) => !current)}
        />
      ) : null}
    </main>
  );
}

function MobileVenueFilterSheet({
  activeCount,
  area,
  areaOptions,
  category,
  categoryOptions,
  city,
  hasActiveCoupon,
  openNow,
  ratingOnly,
  sort,
  total,
  onArea,
  onCategory,
  onCity,
  onClose,
  onReset,
  onSort,
  onToggleCoupon,
  onToggleOpenNow,
  onToggleRating,
}: {
  activeCount: number;
  area: string;
  areaOptions: FilterOption[];
  category: string;
  categoryOptions: FilterOption[];
  city: string;
  hasActiveCoupon: boolean;
  openNow: boolean;
  ratingOnly: boolean;
  sort: DiscoverySort;
  total: number;
  onArea: (value: string) => void;
  onCategory: (value: string) => void;
  onCity: (value: string) => void;
  onClose: () => void;
  onReset: () => void;
  onSort: (value: DiscoverySort) => void;
  onToggleCoupon: () => void;
  onToggleOpenNow: () => void;
  onToggleRating: () => void;
}) {
  return (
    <div className="venue-filter-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="venue-filter-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="venue-filter-title"
        data-testid="venue-filter-sheet"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="venue-filter-handle" />
        <header className="venue-filter-head">
          <div>
            <h2 id="venue-filter-title">Bộ lọc</h2>
            <p>{activeCount ? `${activeCount} bộ lọc đang bật` : "Lọc quán theo nhu cầu"}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng bộ lọc">
            <X size={18} />
          </button>
        </header>

        <div className="venue-filter-scroll">
          <VenueFilterChipGroup
            label="Thành phố"
            options={cityOptions}
            value={city}
            onChange={onCity}
          />
          <VenueFilterChipGroup
            label="Khu vực"
            options={areaOptions}
            value={area}
            onChange={onArea}
          />
          <VenueFilterChipGroup
            label="Loại hình"
            options={categoryOptions}
            value={category}
            onChange={onCategory}
          />

          <section className="venue-filter-group" aria-label="Nhu cầu">
            <h3>Nhu cầu</h3>
            <div>
              <button type="button" className={openNow ? "is-active" : ""} onClick={onToggleOpenNow}>
                Đang mở
              </button>
              <button
                type="button"
                className={hasActiveCoupon ? "is-active" : ""}
                onClick={onToggleCoupon}
              >
                Có ưu đãi
              </button>
              <button
                type="button"
                className={ratingOnly ? "is-active" : ""}
                onClick={onToggleRating}
              >
                4.5★ trở lên
              </button>
            </div>
          </section>

          <VenueFilterChipGroup
            label="Sắp xếp"
            options={sortOptions}
            value={sort}
            onChange={(value) => onSort(value as DiscoverySort)}
          />
        </div>

        <footer className="venue-filter-actions">
          <button
            type="button"
            className="venue-filter-reset"
            data-testid="venue-filter-reset"
            onClick={onReset}
          >
            <RotateCcw size={15} />
            Đặt lại
          </button>
          <button
            type="button"
            className="venue-filter-apply"
            data-testid="venue-filter-submit"
            onClick={onClose}
          >
            Xem {total} quán
          </button>
        </footer>
      </section>
    </div>
  );
}

function VenueFilterChipGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <section className="venue-filter-group" aria-label={label}>
      <h3>{label}</h3>
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

function VenueResultCard({ venue }: { venue: VenueView }) {
  return (
    <Link href={`/stores/${venue.id}`} className="venue-card">
      <div
        className="venue-card-media"
        aria-label={`Ảnh ${venue.name}`}
        style={{ backgroundImage: `url("${venue.image}")` }}
      >
        <div className="venue-image-shade" />
        <span className={`venue-status ${venue.statusLabel.includes("02:00") ? "is-late" : ""}`}>
          <span />
          {venue.statusLabel}
        </span>
        <span className="venue-deal">{venue.dealLabel}</span>
        <span className="venue-heart" aria-hidden="true">
          <Heart size={18} />
        </span>
      </div>

      <div className="venue-card-body">
        <div className="venue-card-main">
          <div className="venue-name-row">
            <h2>{venue.name}</h2>
          </div>
          <p className="venue-meta">
            {venue.categoryLabel} · {venue.areaLabel}
            <span className="venue-mobile-distance">
              {" "}
              · {venue.distanceLabel} · {venue.cityLabel}
            </span>
          </p>
          <div className="venue-tags">
            {venue.tags.map((tag) => (
              <span key={`${venue.id}-${tag}`}>{tag}</span>
            ))}
          </div>
          <div className="venue-price">{venue.priceLabel}</div>
          <div className="venue-distance">
            <MapPin size={12} />
            {venue.distanceLabel} · {venue.areaLabel} · {venue.cityLabel}
          </div>
        </div>

        <span className="venue-book-button">
          Đặt bàn
          <ChevronRight size={16} />
        </span>
      </div>
    </Link>
  );
}

function VenueSkeletons() {
  return (
    <div className="venue-skeleton-stack">
      {[1, 2, 3].map((item) => (
        <div key={item} className="venue-card venue-skeleton">
          <div className="venue-card-media" />
          <div className="venue-card-body">
            <div className="venue-card-main">
              <span className="venue-skeleton-line is-title" />
              <span className="venue-skeleton-line is-short" />
              <span className="venue-skeleton-line" />
            </div>
            <span className="venue-skeleton-pill" />
          </div>
        </div>
      ))}
    </div>
  );
}

const venueSearchCss = `
  .venue-search-page {
    min-height: 100vh;
    background: #0c0c0f;
    color: #f3f0ea;
    font-family: var(--nl-font-sans);
  }

  .venue-search-page * {
    box-sizing: border-box;
  }

  .venue-search-shell {
    width: min(100%, 1180px);
    margin: 0 auto;
    padding: 28px 26px 54px;
  }

  .venue-search-header {
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }

  .venue-search-back {
    display: none;
  }

  .venue-search-title h1 {
    margin: 0;
    color: #f3f0ea;
    font-size: 30px;
    line-height: 1.05;
    font-weight: 800;
    letter-spacing: 0;
  }

  .venue-search-title p {
    margin: 8px 0 0;
    color: #8c8679;
    font-size: 10px;
    line-height: 1;
    font-weight: 800;
    letter-spacing: .18em;
  }

  .venue-title-mobile,
  .venue-subtitle-mobile {
    display: none;
  }

  .venue-search-controls {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 140px 108px;
    gap: 12px;
    margin-top: 24px;
  }

  .venue-search-input,
  .venue-city-select,
  .venue-find-button,
  .venue-sort-select {
    min-height: 56px;
    border: 1px solid rgba(212, 178, 106, .35);
    border-radius: 14px;
    background: rgba(255, 255, 255, .035);
    color: #f0dda8;
  }

  .venue-search-input {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 0 18px;
  }

  .venue-search-input svg {
    color: #d4b26a;
    flex: none;
  }

  .venue-search-input input {
    width: 100%;
    min-width: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: #f3f0ea;
    font-size: 15px;
    font-weight: 600;
  }

  .venue-search-input input::placeholder {
    color: #8c8679;
  }

  .venue-filter-icon {
    display: none;
    border: 0;
    background: transparent;
    color: #8c8679;
    padding: 0;
  }

  .venue-city-select,
  .venue-sort-select {
    position: relative;
    display: block;
    padding: 0;
    font-size: 13px;
    font-weight: 800;
    white-space: nowrap;
  }

  .venue-city-trigger {
    width: 100%;
    min-height: 54px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 0;
    border-radius: inherit;
    background: transparent;
    color: #f0dda8;
    padding: 0 16px;
    font: inherit;
    cursor: pointer;
  }

  .venue-sort-trigger {
    width: 100%;
    min-height: 30px;
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 3px;
    border: 0;
    background: transparent;
    color: #8c8679;
    padding: 0;
    font: inherit;
    white-space: nowrap;
    cursor: pointer;
  }

  .venue-city-current {
    overflow: hidden;
    max-width: 74px;
    color: #f0dda8;
    text-overflow: ellipsis;
  }

  .venue-city-menu,
  .venue-sort-menu {
    position: absolute;
    top: calc(100% + 8px);
    z-index: 40;
    overflow: hidden;
    border: 1px solid rgba(212, 178, 106, .35);
    border-radius: 12px;
    background: #141316;
    box-shadow: 0 18px 38px rgba(0, 0, 0, .36);
  }

  .venue-city-menu {
    left: 0;
    right: 0;
  }

  .venue-sort-menu {
    right: 0;
    width: 142px;
  }

  .venue-city-menu button,
  .venue-sort-menu button {
    width: 100%;
    min-height: 40px;
    display: flex;
    align-items: center;
    border: 0;
    border-bottom: 1px solid rgba(255, 255, 255, .06);
    background: transparent;
    color: #c5c0b6;
    padding: 0 14px;
    font-size: 13px;
    font-weight: 800;
    text-align: left;
    cursor: pointer;
  }

  .venue-city-menu button:last-child,
  .venue-sort-menu button:last-child {
    border-bottom: 0;
  }

  .venue-city-menu button:hover,
  .venue-city-menu button:focus-visible,
  .venue-city-menu button.is-selected,
  .venue-sort-menu button:hover,
  .venue-sort-menu button:focus-visible,
  .venue-sort-menu button.is-selected {
    background: rgba(212, 178, 106, .16);
    color: #f0dda8;
    outline: 0;
  }

  .venue-find-button {
    cursor: pointer;
    border-color: transparent;
    background: linear-gradient(135deg, #f4e3b4, #d4b26a 55%, #b6924a);
    color: #241a0a;
    font-size: 14px;
    font-weight: 900;
  }

  .venue-chip-row {
    display: flex;
    align-items: center;
    gap: 10px;
    overflow-x: auto;
    margin-top: 18px;
    padding-bottom: 2px;
  }

  .venue-chip {
    min-height: 36px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1px solid rgba(255, 255, 255, .11);
    border-radius: 999px;
    background: rgba(255, 255, 255, .045);
    color: #c5c0b6;
    padding: 0 17px;
    font-size: 12px;
    font-weight: 800;
    white-space: nowrap;
    cursor: pointer;
  }

  .venue-chip.is-active {
    border-color: rgba(244, 227, 180, .72);
    background: linear-gradient(135deg, #f4e3b4, #d4b26a 55%, #b6924a);
    color: #241a0a;
  }

  .venue-chip:disabled {
    opacity: .7;
    cursor: progress;
  }

  .venue-result-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    margin-top: 24px;
    color: #8c8679;
    font-size: 14px;
    font-weight: 600;
  }

  .venue-result-bar strong {
    color: #f3f0ea;
    font-weight: 900;
  }

  .venue-sort-select {
    min-height: 30px;
    border: 0;
    background: transparent;
    color: #8c8679;
    padding: 0;
    min-width: 128px;
  }

  .venue-sort-trigger strong,
  .venue-sort-trigger svg {
    color: #d4b26a;
    flex: none;
  }

  .venue-list,
  .venue-skeleton-stack {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-top: 14px;
  }

  .venue-card {
    min-height: 168px;
    display: grid;
    grid-template-columns: minmax(260px, 386px) minmax(0, 1fr);
    overflow: hidden;
    border: 1px solid rgba(212, 178, 106, .18);
    border-radius: 18px;
    background: #141316;
    color: inherit;
    text-decoration: none;
    box-shadow: 0 18px 44px rgba(0, 0, 0, .22);
  }

  .venue-card-media {
    position: relative;
    min-height: 168px;
    overflow: hidden;
    background: linear-gradient(135deg, #19191d, #2a2418);
    background-position: center;
    background-size: cover;
    transition: filter 360ms ease;
  }

  .venue-card:hover .venue-card-media {
    filter: saturate(1.08) contrast(1.04);
  }

  .venue-image-shade {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(12, 12, 15, .05), rgba(12, 12, 15, .2) 42%, rgba(12, 12, 15, .78));
    pointer-events: none;
  }

  .venue-status,
  .venue-deal,
  .venue-heart {
    position: absolute;
    z-index: 2;
  }

  .venue-status {
    top: 12px;
    left: 14px;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    min-height: 22px;
    border: 1px solid rgba(58, 222, 143, .34);
    border-radius: 999px;
    background: rgba(9, 28, 22, .74);
    color: #8df0ba;
    padding: 0 9px;
    font-size: 10px;
    font-weight: 900;
  }

  .venue-status.is-late {
    border-color: rgba(212, 178, 106, .36);
    background: rgba(42, 32, 16, .78);
    color: #f0dda8;
  }

  .venue-status span {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: currentColor;
  }

  .venue-deal {
    left: 14px;
    bottom: 14px;
    min-height: 23px;
    display: inline-flex;
    align-items: center;
    border-radius: 7px;
    background: #f0dda8;
    color: #241a0a;
    padding: 0 10px;
    font-size: 11px;
    font-weight: 900;
  }

  .venue-heart {
    top: 12px;
    right: 12px;
    width: 36px;
    height: 36px;
    display: inline-grid;
    place-items: center;
    border: 1px solid rgba(255, 255, 255, .28);
    border-radius: 50%;
    background: rgba(12, 12, 15, .46);
    color: #f3f0ea;
    backdrop-filter: blur(8px);
  }

  .venue-card-body {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-rows: 1fr auto;
    gap: 12px 18px;
    padding: 22px 24px 22px 26px;
  }

  .venue-card-main {
    min-width: 0;
  }

  .venue-name-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .venue-name-row h2 {
    margin: 0;
    overflow: hidden;
    color: #f3f0ea;
    font-size: 22px;
    line-height: 1.1;
    font-weight: 850;
    letter-spacing: 0;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .venue-meta {
    margin: 7px 0 0;
    color: #8c8679;
    font-size: 13px;
    font-weight: 700;
  }

  .venue-mobile-distance {
    display: none;
  }

  .venue-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 17px;
  }

  .venue-tags span {
    min-height: 27px;
    display: inline-flex;
    align-items: center;
    border: 1px solid rgba(255, 255, 255, .1);
    border-radius: 7px;
    background: rgba(255, 255, 255, .045);
    color: #c5c0b6;
    padding: 0 10px;
    font-size: 11px;
    font-weight: 800;
  }

  .venue-price {
    margin-top: 18px;
    color: #e3c27e;
    font-size: 18px;
    line-height: 1;
    font-weight: 950;
  }

  .venue-distance {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 8px;
    color: #8c8679;
    font-size: 12px;
    font-weight: 700;
  }

  .venue-book-button {
    grid-column: 2;
    align-self: end;
    justify-self: end;
    min-width: 112px;
    min-height: 46px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border-radius: 12px;
    background: linear-gradient(135deg, #f4e3b4, #d4b26a 55%, #b6924a);
    color: #241a0a;
    font-size: 13px;
    font-weight: 950;
  }

  .venue-error {
    margin-top: 14px;
    border: 1px solid rgba(248, 113, 113, .35);
    border-radius: 14px;
    background: rgba(127, 29, 29, .22);
    color: #fecaca;
    padding: 12px 14px;
    font-size: 13px;
    font-weight: 800;
  }

  .venue-empty {
    display: grid;
    gap: 8px;
    border: 1px solid rgba(212, 178, 106, .18);
    border-radius: 18px;
    background: rgba(255, 255, 255, .035);
    padding: 28px;
    color: #8c8679;
  }

  .venue-empty strong {
    color: #f3f0ea;
    font-size: 18px;
  }

  .venue-skeleton {
    pointer-events: none;
  }

  .venue-skeleton .venue-card-media,
  .venue-skeleton-line,
  .venue-skeleton-pill {
    background: linear-gradient(90deg, rgba(255,255,255,.045), rgba(255,255,255,.09), rgba(255,255,255,.045));
    background-size: 220% 100%;
    animation: venue-skeleton 1.4s ease-in-out infinite;
  }

  .venue-skeleton-line {
    display: block;
    width: 82%;
    height: 13px;
    border-radius: 999px;
    margin-top: 13px;
  }

  .venue-skeleton-line.is-title {
    width: 48%;
    height: 22px;
    margin-top: 0;
  }

  .venue-skeleton-line.is-short {
    width: 34%;
  }

  .venue-skeleton-pill {
    align-self: end;
    justify-self: end;
    width: 112px;
    height: 46px;
    border-radius: 12px;
  }

  @keyframes venue-skeleton {
    0% { background-position: 120% 0; }
    100% { background-position: -120% 0; }
  }

  .venue-filter-backdrop {
    position: fixed;
    inset: 0;
    z-index: 120;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    background: rgba(6, 6, 8, .68);
    color: #f3f0ea;
  }

  .venue-filter-sheet {
    width: min(420px, 100%);
    max-height: calc(100vh - 58px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid rgba(212, 178, 106, .2);
    border-bottom: 0;
    border-radius: 24px 24px 0 0;
    background: #121116;
    box-shadow: 0 -20px 50px -20px rgba(0, 0, 0, .7);
  }

  .venue-filter-handle {
    width: 38px;
    height: 4px;
    border-radius: 3px;
    margin: 10px auto 4px;
    background: rgba(255, 255, 255, .18);
  }

  .venue-filter-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 8px 18px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, .06);
  }

  .venue-filter-head h2 {
    margin: 0;
    color: #f3f0ea;
    font-size: 18px;
    line-height: 1.15;
    font-weight: 850;
  }

  .venue-filter-head p {
    margin: 4px 0 0;
    color: #9b958a;
    font-size: 12px;
    font-weight: 600;
  }

  .venue-filter-head button {
    width: 36px;
    height: 36px;
    display: inline-grid;
    place-items: center;
    flex: none;
    border: 1px solid rgba(255, 255, 255, .1);
    border-radius: 50%;
    background: rgba(255, 255, 255, .035);
    color: #f3f0ea;
    cursor: pointer;
  }

  .venue-filter-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 14px 18px 4px;
  }

  .venue-filter-group {
    margin-bottom: 18px;
  }

  .venue-filter-group h3 {
    margin: 0 0 9px;
    color: #f3f0ea;
    font-size: 13.5px;
    line-height: 1.2;
    font-weight: 800;
  }

  .venue-filter-group div {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .venue-filter-group button {
    min-height: 36px;
    border: 1px solid rgba(255, 255, 255, .1);
    border-radius: 16px;
    background: rgba(255, 255, 255, .05);
    color: #c5c0b6;
    padding: 8px 14px;
    font-family: var(--nl-font-sans);
    font-size: 12.5px;
    font-weight: 700;
    cursor: pointer;
  }

  .venue-filter-group button.is-active {
    border-color: transparent;
    background: linear-gradient(135deg, #f0dda8, #d4b26a);
    color: #241a0a;
    font-weight: 850;
  }

  .venue-filter-actions {
    display: grid;
    grid-template-columns: minmax(0, .78fr) minmax(0, 1.82fr);
    gap: 10px;
    padding: 12px 18px calc(12px + env(safe-area-inset-bottom));
    border-top: 1px solid rgba(255, 255, 255, .06);
    background: rgba(18, 17, 22, .96);
  }

  .venue-filter-actions button {
    min-height: 44px;
    border-radius: 12px;
    font-family: var(--nl-font-sans);
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
  }

  .venue-filter-reset {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    border: 1px solid rgba(255, 255, 255, .1);
    background: rgba(255, 255, 255, .035);
    color: #c5c0b6;
  }

  .venue-filter-apply {
    border: 0;
    background: linear-gradient(135deg, #f4e3b4, #d4b26a 55%, #b6924a);
    color: #241a0a;
  }

  @media (max-width: 767px) {
    .venue-search-page {
      background: #07080a;
    }

    .venue-search-shell {
      width: 100%;
      padding: 12px 14px 28px;
    }

    .venue-search-header {
      min-height: 31px;
      align-items: center;
      gap: 10px;
      padding-top: 0;
    }

    .venue-search-back {
      width: 28px;
      height: 28px;
      display: inline-grid;
      place-items: center;
      border: 1px solid rgba(255, 255, 255, .11);
      border-radius: 50%;
      color: #f3f0ea;
      background: rgba(255, 255, 255, .03);
      text-decoration: none;
      flex: none;
    }

    .venue-search-title h1 {
      font-size: 17px;
      line-height: 1;
      font-weight: 900;
    }

    .venue-search-title p {
      margin-top: 3px;
      font-size: 7.5px;
      letter-spacing: .16em;
    }

    .venue-title-desktop,
    .venue-subtitle-desktop {
      display: none;
    }

    .venue-title-mobile,
    .venue-subtitle-mobile {
      display: inline;
    }

    .venue-search-controls {
      grid-template-columns: minmax(0, 1fr);
      margin-top: 2px;
      gap: 0;
    }

    .venue-search-input {
      min-height: 31px;
      gap: 9px;
      border-radius: 8px;
      padding: 0 11px;
    }

    .venue-search-input input {
      font-size: 12px;
      font-weight: 700;
    }

    .venue-search-input svg {
      width: 14px;
      height: 14px;
    }

    .venue-filter-icon {
      width: 22px;
      height: 22px;
      display: inline-grid;
      place-items: center;
      flex: none;
    }

    .venue-city-select,
    .venue-find-button {
      display: none;
    }

    .venue-chip-row {
      gap: 7px;
      margin: 7px -14px 0;
      padding: 0 14px 2px;
    }

    .venue-chip {
      min-height: 28px;
      padding: 0 13px;
      font-size: 10.5px;
      border-radius: 999px;
    }

    .venue-result-bar {
      margin-top: 7px;
      font-size: 11px;
      gap: 8px;
    }

    .venue-sort-select {
      min-height: 22px;
      font-size: 11px;
      min-width: 118px;
    }

    .venue-sort-trigger {
      min-height: 24px;
    }

    .venue-sort-trigger span {
      font-weight: 600;
    }

    .venue-sort-menu {
      top: calc(100% + 6px);
      width: 118px;
    }

    .venue-sort-menu button {
      min-height: 34px;
      padding: 0 10px;
      font-size: 11px;
    }

    .venue-list,
    .venue-skeleton-stack {
      gap: 10px;
      margin-top: 7px;
    }

    .venue-card {
      min-height: 0;
      display: block;
      border-radius: 12px;
      background: #111114;
      box-shadow: 0 14px 34px rgba(0, 0, 0, .28);
    }

    .venue-card-media {
      min-height: 0;
      height: 105px;
      border-radius: 12px 12px 0 0;
    }

    .venue-status {
      top: 8px;
      left: 9px;
      min-height: 18px;
      padding: 0 7px;
      font-size: 8.5px;
    }

    .venue-deal {
      left: 9px;
      bottom: 8px;
      min-height: 18px;
      border-radius: 5px;
      padding: 0 7px;
      font-size: 9px;
    }

    .venue-heart {
      top: 8px;
      right: 8px;
      width: 30px;
      height: 30px;
    }

    .venue-heart svg {
      width: 15px;
      height: 15px;
    }

    .venue-card-body {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 6px 10px;
      padding: 11px 10px 12px;
    }

    .venue-card-main {
      display: contents;
    }

    .venue-name-row,
    .venue-meta {
      grid-column: 1 / -1;
    }

    .venue-name-row h2 {
      font-size: 16px;
      line-height: 1.15;
    }

    .venue-meta {
      margin-top: 4px;
      font-size: 10.5px;
    }

    .venue-mobile-distance {
      display: inline;
    }

    .venue-tags,
    .venue-distance {
      display: none;
    }

    .venue-price {
      grid-column: 1;
      margin-top: 8px;
      font-size: 14px;
      align-self: center;
    }

    .venue-book-button {
      grid-column: 2;
      min-width: 75px;
      min-height: 32px;
      border-radius: 9px;
      font-size: 10px;
      align-self: end;
    }

    .venue-book-button svg {
      display: none;
    }

    .venue-error {
      margin-top: 8px;
      border-radius: 10px;
      padding: 9px 10px;
      font-size: 11px;
    }

    .venue-empty {
      border-radius: 12px;
      padding: 18px;
      font-size: 12px;
    }

    .venue-empty strong {
      font-size: 15px;
    }

    .venue-skeleton-line.is-title {
      width: 60%;
      height: 16px;
    }

    .venue-skeleton-pill {
      width: 75px;
      height: 32px;
      border-radius: 9px;
    }
  }
`;
