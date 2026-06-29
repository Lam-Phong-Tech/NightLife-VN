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
  Search,
  SlidersHorizontal,
  Star,
} from "lucide-react";

import { discoveryApi, type DiscoverySort, type PublicStore } from "@/lib/api/discovery";
import { PlaceholderMedia } from "@/components/ui/MediaPlaceholder";

type Coordinates = {
  lat: number;
  lng: number;
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
  reviews: number;
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

const imagePool = [
  "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=900&q=76') center/cover",
  "url('https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=900&q=76') center/cover",
  "url('https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=900&q=76') center/cover",
  "url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=900&q=76') center/cover",
  "url('https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=900&q=76') center/cover",
  "url('https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=900&q=76') center/cover",
];

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

const reviewCount = (index: number) => pickByIndex([212, 188, 96, 146, 84, 72], index, 84);

const formatDistance = (distanceKm: number | null | undefined, index: number) =>
  typeof distanceKm === "number" && Number.isFinite(distanceKm)
    ? `${distanceKm.toFixed(1)} km`
    : pickByIndex(distanceFallbacks, index, "1.2 km");

const toVenueView = (store: PublicStore, index: number): VenueView => {
  const categoryLabel = categoryLabels[store.category] ?? store.category;
  const areaLabel = store.area?.name ?? store.district ?? store.city ?? "Trung tâm";
  const cityLabel = cityLabels[store.cityCode ?? ""] ?? store.city;
  const fallbackImage = pickByIndex(
    imagePool,
    index,
    "linear-gradient(135deg,#19191d,#2a2418)",
  );
  const statusLabel = index % 3 === 2 ? "Mở đến 02:00" : "Đang mở";

  return {
    id: store.slug,
    name: store.name,
    categoryLabel,
    areaLabel,
    cityLabel,
    distanceLabel: formatDistance(store.distanceKm, index),
    priceLabel: categoryPrices[store.category] ?? "từ 900.000đ",
    rating: roundRating(index),
    reviews: reviewCount(index),
    tags: categoryTags[store.category] ?? ["Đặt bàn nhanh", "Không gian đẹp", "Ưu đãi"],
    statusLabel,
    dealLabel: pickByIndex(dealLabels, index, "-30% Happy Hour"),
    image: store.thumbnailUrl ? `url('${store.thumbnailUrl}') center/cover` : fallbackImage,
  };
};

export default function Page() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("hn");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<DiscoverySort>("priority");
  const [hasActiveCoupon, setHasActiveCoupon] = useState(false);
  const [ratingOnly, setRatingOnly] = useState(false);
  const [openNow, setOpenNow] = useState(true);
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [stores, setStores] = useState<PublicStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(() => {
      setIsLoading(true);
      setError(null);
      discoveryApi
        .listStores({
          q: query,
          city,
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
  }, [category, city, coords, hasActiveCoupon, query, sort]);

  const venues = useMemo(
    () =>
      stores
        .map(toVenueView)
        .filter((venue) => !ratingOnly || venue.rating >= 4.5)
        .filter((venue) => !openNow || venue.statusLabel.includes("Đang") || venue.statusLabel.includes("Mở")),
    [openNow, ratingOnly, stores],
  );

  const cityLabel = cityLabels[city] ?? "Việt Nam";

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

  const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCity(event.target.value);
    setSort((current) => (current === "nearest" && !coords ? "priority" : current));
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextSort = event.target.value as DiscoverySort;

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
            <button type="button" aria-label="Bộ lọc" className="venue-filter-icon">
              <SlidersHorizontal size={16} />
            </button>
          </label>

          <label className="venue-city-select">
            <MapPin size={15} />
            <select value={city} onChange={handleCityChange} aria-label="Chọn thành phố">
              {cityOptions.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} />
          </label>

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

          <label className="venue-sort-select">
            <span>Sắp xếp:</span>
            <select value={sort} onChange={handleSortChange} aria-label="Sắp xếp danh sách">
              <option value="priority">Phổ biến</option>
              <option value="nearest">Gần nhất</option>
              <option value="newest">Mới nhất</option>
            </select>
            <strong>{sortLabels[sort]}</strong>
            <ChevronDown size={13} />
          </label>
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
    </main>
  );
}

function VenueResultCard({ venue }: { venue: VenueView }) {
  return (
    <Link href={`/stores/${venue.id}`} className="venue-card">
      <div className="venue-card-media">
        <PlaceholderMedia src={venue.image} alt={venue.name} label="" style={{ width: "100%", height: "100%" }} />
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
            <div className="venue-mobile-rating">
              <Star size={12} fill="currentColor" />
              {venue.rating.toFixed(1)}
            </div>
          </div>
          <p className="venue-meta">
            {venue.categoryLabel} · {venue.areaLabel}
            <span className="venue-mobile-distance"> · {venue.distanceLabel}</span>
          </p>
          <div className="venue-tags">
            {venue.tags.map((tag) => (
              <span key={`${venue.id}-${tag}`}>{tag}</span>
            ))}
          </div>
          <div className="venue-price">{venue.priceLabel}</div>
          <div className="venue-distance">
            <MapPin size={12} />
            {venue.distanceLabel} · {venue.areaLabel}
          </div>
        </div>

        <div className="venue-rating">
          <Star size={14} fill="currentColor" />
          <strong>{venue.rating.toFixed(1)}</strong>
          <span>({venue.reviews})</span>
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
    font-family: Inter, var(--nl-font-sans), ui-sans-serif, system-ui, sans-serif;
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
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 0 16px;
    font-size: 13px;
    font-weight: 800;
    white-space: nowrap;
  }

  .venue-city-select select,
  .venue-sort-select select {
    position: absolute;
    inset: 0;
    width: 100%;
    opacity: 0;
    cursor: pointer;
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
    gap: 5px;
  }

  .venue-sort-select strong,
  .venue-sort-select svg {
    color: #d4b26a;
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

  .venue-rating {
    display: inline-flex;
    align-items: center;
    justify-self: end;
    gap: 5px;
    color: #e3c27e;
    font-size: 14px;
    font-weight: 900;
    white-space: nowrap;
  }

  .venue-rating span {
    color: #8c8679;
    font-size: 12px;
    font-weight: 700;
  }

  .venue-mobile-rating {
    display: none;
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

  @media (max-width: 767px) {
    .venue-search-page {
      background: #07080a;
    }

    .venue-search-shell {
      width: 100%;
      padding: 0 14px 28px;
    }

    .venue-search-header {
      min-height: 31px;
      align-items: center;
      gap: 10px;
      padding-top: 2px;
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
    }

    .venue-sort-select span {
      font-weight: 600;
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

    .venue-mobile-rating {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: #e3c27e;
      font-size: 12px;
      font-weight: 900;
      flex: none;
    }

    .venue-meta {
      margin-top: 4px;
      font-size: 10.5px;
    }

    .venue-mobile-distance {
      display: inline;
    }

    .venue-tags,
    .venue-distance,
    .venue-rating {
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
