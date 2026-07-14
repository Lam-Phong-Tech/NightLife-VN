"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
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
import { castFavoriteApi } from "@/lib/api/cast-detail";
import { ApiError } from "@/lib/api/client";
import { rankingsApi, type RankingCity } from "@/lib/api/rankings";
import { translateText } from "@/lib/i18n/client-translations";
import { useActiveLanguage, type LanguageCode } from "@/lib/i18n/use-active-language";
import { hasMemberFavoriteAccess, redirectToLoginForFavorite, requireMemberFavoriteAccess } from "@/lib/member-favorite-auth";
import { readFavoriteCastSlugs, writeFavoriteCast } from "@/lib/member-favorites";
import { sortBySearchRelevance } from "@/lib/search-relevance";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { PlaceholderMedia } from "@/components/ui/MediaPlaceholder";

type PriceRange = "" | "under400" | "400600" | "6001000" | "over1000";

type Coordinates = {
  lat: number;
  lng: number;
};

type Option = {
  value: string;
  label: string;
};

type CastSearchCopy = {
  all: string;
  applyLabel: (count: number) => string;
  area: string;
  category: string;
  city: string;
  closeFilters: string;
  emptyDescription: string;
  emptyTitle: string;
  filterIntro: string;
  filterTitle: string;
  find: string;
  findCast: string;
  hasDeals: string;
  language: string;
  listAria: string;
  locating: string;
  openFilters: string;
  priceRange: string;
  priceRangeNote: string;
  resetFilters: string;
  searchAria: string;
  searchPlaceholder: string;
  sortLabel: string;
  speaksJapanese: string;
  store: string;
  topRanking: string;
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
  { value: "newest", label: "Mới nhất" },
  { value: "priority", label: "Phổ biến" },
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

const favoriteCounts = ["1.2k", "1.0k", "947", "880", "812", "760", "690", "642"];
const recentSearches = ["Yuki", "Mei", "Cast Hoàn Kiếm"];
const popularKeywords = ["Nói tiếng Nhật", "Top ranking", "Còn lịch tối nay", "日本語 N1"];

const toRankingCity = (cityCode: string): RankingCity =>
  cityCode === "hcm" ? "hcm" : cityCode === "hn" ? "hn" : "all";

const castCopyVi: CastSearchCopy = {
  all: "Tất cả",
  applyLabel: (count) => `Xem ${count} cast`,
  area: "Khu vực",
  category: "Loại hình",
  city: "Thành phố",
  closeFilters: "Đóng bộ lọc",
  emptyDescription: "Đổi khu vực, ngôn ngữ hoặc khoảng giá để xem thêm.",
  emptyTitle: "Chưa có cast phù hợp",
  filterIntro: "Lọc cast theo nhu cầu",
  filterTitle: "Bộ lọc",
  find: "Tìm",
  findCast: "Tìm cast",
  hasDeals: "Có ưu đãi",
  language: "Ngôn ngữ",
  listAria: "Danh sách cast",
  locating: "Đang lấy vị trí",
  openFilters: "Mở bộ lọc",
  priceRange: "Khoảng giá",
  priceRangeNote: "/ 60 phút",
  resetFilters: "Đặt lại bộ lọc",
  searchAria: "Tìm và lọc cast",
  searchPlaceholder: "Tìm cast theo tên, quán hoặc ngôn ngữ...",
  sortLabel: "Sắp xếp:",
  speaksJapanese: "Nói tiếng Nhật",
  store: "Quán",
  topRanking: "Top ranking",
};

const castCopyEn: CastSearchCopy = {
  all: "All",
  applyLabel: (count) => `View ${count} Cast`,
  area: "Area",
  category: "Category",
  city: "City",
  closeFilters: "Close filters",
  emptyDescription: "Change area, language, or price range to see more Cast.",
  emptyTitle: "No matching Cast yet",
  filterIntro: "Filter Cast by your needs",
  filterTitle: "Filters",
  find: "Find",
  findCast: "Find Cast",
  hasDeals: "Has deals",
  language: "Language",
  listAria: "Cast list",
  locating: "Finding location",
  openFilters: "Open filters",
  priceRange: "Price range",
  priceRangeNote: "/ 60 minutes",
  resetFilters: "Reset filters",
  searchAria: "Search and filter Cast",
  searchPlaceholder: "Search Cast by name, venue, or language...",
  sortLabel: "Sort:",
  speaksJapanese: "Speaks Japanese",
  store: "Venue",
  topRanking: "Top ranking",
};

const englishCastCityLabels: Record<string, string> = {
  hn: "Hanoi",
  hcm: "Ho Chi Minh City",
};

const englishCastSortLabels: Record<DiscoverySort, string> = {
  newest: "Newest",
  priority: "Popular",
  nearest: "Nearest",
};

const englishCastCategoryLabels: Record<string, string> = {
  BAR: "Bar",
  CLUB: "Club",
  LOUNGE: "Lounge",
  GIRLS_BAR: "Girls Bar",
  KARAOKE: "Karaoke / KTV",
  MASSAGE_SPA: "Massage / Spa",
  RESTAURANT: "Restaurant",
  CASINO: "Casino",
};

const getCastCopy = (language: LanguageCode): CastSearchCopy => {
  if (language === "en") return castCopyEn;
  if (language === "vi") return castCopyVi;

  return {
    ...castCopyVi,
    all: translateText(castCopyVi.all, language),
    applyLabel: (count) => `${translateText("Xem", language)} ${count} cast`,
    area: translateText(castCopyVi.area, language),
    category: translateText(castCopyVi.category, language),
    city: translateText(castCopyVi.city, language),
    closeFilters: translateText(castCopyVi.closeFilters, language),
    emptyDescription: translateText(castCopyVi.emptyDescription, language),
    emptyTitle: translateText(castCopyVi.emptyTitle, language),
    filterIntro: translateText(castCopyVi.filterIntro, language),
    filterTitle: translateText(castCopyVi.filterTitle, language),
    find: translateText(castCopyVi.find, language),
    findCast: translateText(castCopyVi.findCast, language),
    hasDeals: translateText(castCopyVi.hasDeals, language),
    language: translateText(castCopyVi.language, language),
    listAria: translateText(castCopyVi.listAria, language),
    locating: translateText(castCopyVi.locating, language),
    openFilters: translateText(castCopyVi.openFilters, language),
    priceRange: translateText(castCopyVi.priceRange, language),
    priceRangeNote: translateText(castCopyVi.priceRangeNote, language),
    resetFilters: translateText(castCopyVi.resetFilters, language),
    searchAria: translateText(castCopyVi.searchAria, language),
    searchPlaceholder: translateText(castCopyVi.searchPlaceholder, language),
    sortLabel: translateText(castCopyVi.sortLabel, language),
    speaksJapanese: translateText(castCopyVi.speaksJapanese, language),
    store: translateText(castCopyVi.store, language),
    topRanking: translateText(castCopyVi.topRanking, language),
  };
};

const stripCastVietnameseMarks = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\bQuan\b/g, "District")
    .replace(/\bTP\.HCM\b/g, "Ho Chi Minh City");

const localizeCastOption = (option: Option, language: LanguageCode, copy: CastSearchCopy): Option => {
  if (!option.value) return { ...option, label: copy.all };
  const englishLabel = englishCastCityLabels[option.value];
  if (language === "en" && englishLabel) {
    return { ...option, label: englishLabel };
  }
  return { ...option, label: translateText(option.label, language) };
};

const getCastCityLabel = (cityCode: string, language: LanguageCode) => {
  if (!cityCode) return language === "en" ? "Vietnam" : translateText("Việt Nam", language);
  if (language === "en") return englishCastCityLabels[cityCode] ?? cityCode;
  return translateText(cityLabels[cityCode] ?? cityCode, language);
};

const getCastSortLabel = (sort: DiscoverySort, language: LanguageCode) =>
  language === "en" ? englishCastSortLabels[sort] : translateText(sortOptions.find((item) => item.value === sort)?.label ?? sort, language);

const getCastCategoryLabel = (category: string, language: LanguageCode) =>
  language === "en" ? englishCastCategoryLabels[category] ?? category : translateText(categoryLabels[category] ?? category, language);

const formatCastActiveFilters = (count: number, language: LanguageCode) =>
  language === "en" ? `${count} ${count === 1 ? "filter" : "filters"} active` : `${count} ${translateText("bộ lọc đang bật", language)}`;

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
  const [sort, setSort] = useState<DiscoverySort>("newest");
  const [topRankingOnly, setTopRankingOnly] = useState(false);
  const [topRankingCastSlugs, setTopRankingCastSlugs] = useState<string[]>([]);
  const [isTopRankingLoading, setTopRankingLoading] = useState(false);
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [hasActiveCoupon, setHasActiveCoupon] = useState(false);
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [isSearchFocused, setSearchFocused] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [areas, setAreas] = useState<PublicArea[]>([]);
  const [casts, setCasts] = useState<PublicCast[]>([]);
  const [favoriteCastSlugs, setFavoriteCastSlugs] = useState<string[]>(
    () => (hasMemberFavoriteAccess() ? readFavoriteCastSlugs() : []),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const activeLanguage = useActiveLanguage();
  const copy = useMemo(() => getCastCopy(activeLanguage), [activeLanguage]);

  useEffect(() => {
    let cancelled = false;

    if (!hasMemberFavoriteAccess()) {
      setFavoriteCastSlugs([]);
      return () => {
        cancelled = true;
      };
    }

    castFavoriteApi
      .list()
      .then((items) => {
        if (cancelled) return;
        items.forEach((item) => {
          writeFavoriteCast(
            {
              slug: item.cast.slug,
              name: item.cast.publicAlias ?? item.cast.name ?? item.cast.stageName,
              storeName: item.cast.store.name,
              categoryLabel: getCastCategoryLabel(item.cast.store.category, activeLanguage),
              areaLabel: [
                item.cast.store.area?.name ?? item.cast.store.district,
                getCastCityLabel(item.cast.store.cityCode ?? "", activeLanguage),
              ]
                .filter(Boolean)
                .join(" Â· "),
              image: item.cast.thumbnailUrl ?? undefined,
              favoritedAt: item.favoritedAt,
            },
            true,
          );
        });
        setFavoriteCastSlugs(items.map((item) => item.cast.slug));
      })
      .catch(() => {
        if (!cancelled) setFavoriteCastSlugs(readFavoriteCastSlugs());
      });

    return () => {
      cancelled = true;
    };
  }, [activeLanguage]);

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
          lat: coords?.lat,
          limit: 60,
          lng: coords?.lng,
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
  }, [area, category, city, coords, hasActiveCoupon, language, query, sort]);

  useEffect(() => {
    if (!topRankingOnly) {
      queueMicrotask(() => {
        setTopRankingCastSlugs([]);
        setTopRankingLoading(false);
      });
      return;
    }

    const controller = new AbortController();
    queueMicrotask(() => {
      if (!controller.signal.aborted) setTopRankingLoading(true);
    });

    rankingsApi
      .list({ targetType: "CAST", city: toRankingCity(city), limit: 5 }, { signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted) return;
        setTopRankingCastSlugs(response.data.slice(0, 5).map((item) => item.slug).filter(Boolean));
      })
      .catch(() => {
        if (!controller.signal.aborted) setTopRankingCastSlugs([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setTopRankingLoading(false);
      });

    return () => controller.abort();
  }, [city, topRankingOnly]);

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
      { value: "", label: copy.all },
      ...Array.from(seen, ([value, label]) => ({ value, label })),
    ];
  }, [casts, copy.all]);

  const areaOptions = useMemo<Option[]>(
    () => [
      { value: "", label: copy.all },
      ...areas.map((item) => ({
        value: item.code,
        label: activeLanguage === "en" ? stripCastVietnameseMarks(item.name) : translateText(item.name, activeLanguage),
      })),
    ],
    [activeLanguage, areas, copy.all],
  );

  const topRankingOrder = useMemo(
    () => new Map(topRankingCastSlugs.map((slug, index) => [slug, index])),
    [topRankingCastSlugs],
  );
  const visibleCasts = useMemo(() => {
    const filteredCasts = casts
      .filter((cast) => !storeSlug || cast.store.slug === storeSlug)
      .filter((cast) => matchesPriceRange(priceRange, cast.hourlyRateVnd))
      .filter((cast) => !topRankingOnly || topRankingOrder.has(cast.slug));
    const searchSortedCasts = sortBySearchRelevance(filteredCasts, query, (cast) => ({
      primary: [cast.name, cast.publicAlias, cast.stageName],
      secondary: [
        cast.publicHeadline,
        cast.store.name,
        cast.store.category,
        cast.store.area?.name,
        cast.store.district,
        cast.store.city,
        cast.languages.join(" "),
        cast.tags.join(" "),
      ],
    }));

    if (!topRankingOnly) return searchSortedCasts;

    return [...searchSortedCasts].sort(
      (left, right) =>
        (topRankingOrder.get(left.slug) ?? Number.MAX_SAFE_INTEGER) -
        (topRankingOrder.get(right.slug) ?? Number.MAX_SAFE_INTEGER),
    );
  }, [casts, priceRange, query, storeSlug, topRankingOnly, topRankingOrder]);

  const suggestions = useMemo(() => visibleCasts.slice(0, 4), [visibleCasts]);
  const cityLabel = getCastCityLabel(city, activeLanguage);
  const localizedCityOptions = useMemo(
    () => cityOptions.map((option) => localizeCastOption(option, activeLanguage, copy)),
    [activeLanguage, copy],
  );
  const localizedCategoryOptions = useMemo(
    () =>
      categoryOptions.map((option) => ({
        value: option.value,
        label: option.value ? getCastCategoryLabel(option.value, activeLanguage) : copy.all,
      })),
    [activeLanguage, copy.all],
  );
  const localizedLanguageOptions = useMemo(
    () => languageOptions.map((option) => localizeCastOption(option, activeLanguage, copy)),
    [activeLanguage, copy],
  );
  const localizedPriceRangeOptions = useMemo(
    () => priceRangeOptions.map((option) => localizeCastOption(option, activeLanguage, copy)),
    [activeLanguage, copy],
  );
  const effectiveSortOptions = useMemo(
    () =>
      sortOptions.map((option) =>
        option.value === "nearest" && isLocating
          ? { ...option, label: copy.locating }
          : { ...option, label: getCastSortLabel(option.value, activeLanguage) },
      ),
    [activeLanguage, copy.locating, isLocating],
  );
  const activeFilterCount = [
    area,
    category,
    language,
    storeSlug,
    priceRange,
    topRankingOnly,
    sort !== "newest",
    hasActiveCoupon,
  ].filter(Boolean).length;
  const isResultsLoading = isLoading || isTopRankingLoading;
  const showSuggestions = isSearchFocused && query.trim().length > 0;

  const resetFilters = () => {
    setArea("");
    setCategory("");
    setLanguage("");
    setStoreSlug("");
    setPriceRange("");
    setTopRankingOnly(false);
    setHasActiveCoupon(false);
    setSort("newest");
  };

  const handleCityChange = (nextCity: string) => {
    setCity(nextCity);
    setArea("");
    setStoreSlug("");
    setSort((current) => (current === "nearest" && !coords ? "newest" : current));
  };

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

  const handleSortChange = (nextSort: DiscoverySort) => {
    if (nextSort === "nearest" && !coords) {
      requestNearby();
      return;
    }

    setSort(nextSort);
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

  const toggleCastFavorite = async (cast: PublicCast) => {
    if (!requireMemberFavoriteAccess()) {
      return;
    }

    const nextValue = !favoriteCastSlugs.includes(cast.slug);
    writeFavoriteCast(
      {
        slug: cast.slug,
        name: cast.publicAlias ?? cast.name ?? cast.stageName,
        storeName: cast.store.name,
        categoryLabel: getCastCategoryLabel(cast.store.category, activeLanguage),
        areaLabel: [
          cast.store.area?.name ?? cast.store.district,
          getCastCityLabel(cast.store.cityCode ?? "", activeLanguage),
        ]
          .filter(Boolean)
          .join(" · "),
        image: cast.thumbnailUrl ?? undefined,
      },
      nextValue,
    );
    setFavoriteCastSlugs(readFavoriteCastSlugs());

    try {
      const state = nextValue
        ? await castFavoriteApi.favorite(cast.slug)
        : await castFavoriteApi.unfavorite(cast.slug);
      writeFavoriteCast(
        {
          slug: cast.slug,
          name: cast.publicAlias ?? cast.name ?? cast.stageName,
          storeName: cast.store.name,
          categoryLabel: getCastCategoryLabel(cast.store.category, activeLanguage),
          areaLabel: [
            cast.store.area?.name ?? cast.store.district,
            getCastCityLabel(cast.store.cityCode ?? "", activeLanguage),
          ]
            .filter(Boolean)
            .join(" Â· "),
          image: cast.thumbnailUrl ?? undefined,
        },
        state.favorited,
      );
      setFavoriteCastSlugs(readFavoriteCastSlugs());
    } catch (error) {
      const rollbackValue = !nextValue;
      writeFavoriteCast(
        {
          slug: cast.slug,
          name: cast.publicAlias ?? cast.name ?? cast.stageName,
          storeName: cast.store.name,
          categoryLabel: getCastCategoryLabel(cast.store.category, activeLanguage),
          areaLabel: [
            cast.store.area?.name ?? cast.store.district,
            getCastCityLabel(cast.store.cityCode ?? "", activeLanguage),
          ]
            .filter(Boolean)
            .join(" Â· "),
          image: cast.thumbnailUrl ?? undefined,
        },
        error instanceof ApiError && [401, 403].includes(error.status) ? false : rollbackValue,
      );
      setFavoriteCastSlugs(readFavoriteCastSlugs());

      if (error instanceof ApiError && [401, 403].includes(error.status)) {
        redirectToLoginForFavorite();
      }
    }
  };

  return (
    <main className="cast-search-page">
      <style>{castSearchCss}</style>

      <div className="cast-search-shell">
        <header className="cast-mobile-topbar">
          <Link href="/" aria-label={translateText("Quay lại trang chủ", activeLanguage)} className="cast-round-icon">
            <ArrowLeft size={17} />
          </Link>
          <div>
            <h1>{copy.findCast}</h1>
          </div>
        </header>

        <section className="cast-hero" aria-label={copy.searchAria}>
          <div className="cast-hero-copy">
            <h1>
              {copy.findCast} {cityLabel}
            </h1>
            <p>{translateText("Lưới chân dung theo mẫu Vietyoru, ưu tiên ảnh, ngôn ngữ và quán làm việc.", activeLanguage)}</p>
          </div>

          <div className="cast-search-controls">
            <label className={`cast-search-input ${isSearchFocused ? "is-focused" : ""}`}>
              <Search size={19} />
              <input
                value={query}
                onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder={copy.searchPlaceholder}
              />
              {query ? (
                <button
                  type="button"
                  aria-label={translateText("Xóa tìm kiếm", activeLanguage)}
                  className="cast-input-clear"
                  onClick={() => setQuery("")}
                >
                  <X size={14} />
                </button>
              ) : null}
              <button
                type="button"
                aria-label={copy.openFilters}
                className="cast-input-filter"
                onClick={() => setFilterOpen(true)}
              >
                <SlidersHorizontal size={16} />
              </button>
            </label>

            <CastDropdown
              ariaLabel={copy.city}
              className="cast-city-select"
              icon={<MapPin size={16} />}
              options={localizedCityOptions}
              value={city}
              onChange={handleCityChange}
            />

            <button type="button" className="cast-find-button">
              {copy.find}
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

          <nav className="cast-chip-row hscroll" aria-label={translateText("Bộ lọc nhanh", activeLanguage)}>
            <button
              type="button"
              className={`cast-chip ${hasActiveCoupon ? "is-active" : ""}`}
              onClick={() => setHasActiveCoupon((current) => !current)}
            >
              <span className="cast-live-dot" />
              {copy.hasDeals}
            </button>
            <button
              type="button"
              className={`cast-chip ${language === "ja" ? "is-active" : ""}`}
              onClick={() => setLanguage((current) => (current === "ja" ? "" : "ja"))}
            >
              {copy.speaksJapanese}
            </button>
            <button
              type="button"
              className={`cast-chip ${topRankingOnly ? "is-active" : ""}`}
              onClick={() => setTopRankingOnly((current) => !current)}
            >
              {copy.topRanking}
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
              {copy.filterTitle}
              {activeFilterCount ? <b>{activeFilterCount}</b> : null}
            </button>
          </nav>
        </section>

        {error ? <div className="cast-error">{translateText(error, activeLanguage)}</div> : null}

        <section className="cast-results-section" aria-label={copy.listAria}>
          <div className="cast-results-head">
            <span>
              <b>{isResultsLoading ? "..." : visibleCasts.length} cast</b>
              <span> · {cityLabel}</span>
            </span>

            <CastDropdown
              ariaLabel={copy.sortLabel}
              className="cast-sort-select"
              label={copy.sortLabel}
              options={effectiveSortOptions}
              value={sort}
              onChange={(value) => handleSortChange(value as DiscoverySort)}
            />
          </div>

          {isResultsLoading ? (
            <LoadingSkeleton />
          ) : visibleCasts.length > 0 ? (
            <div className="cast-card-grid">
              {visibleCasts.map((cast, index) => (
                <CastDiscoveryCard
                  key={cast.id}
                  cast={cast}
                  index={index}
                  language={activeLanguage}
                  isFavorite={favoriteCastSlugs.includes(cast.slug)}
                  onToggleFavorite={toggleCastFavorite}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title={copy.emptyTitle}
              description={copy.emptyDescription}
            />
          )}
        </section>
      </div>

      {isFilterOpen ? (
        <MobileFilterSheet
          area={area}
          areaOptions={areaOptions}
          category={category}
          categoryOptions={localizedCategoryOptions}
          city={city}
          cityOptions={localizedCityOptions}
          copy={copy}
          language={language}
          languageOptions={localizedLanguageOptions}
          priceRangeOptions={localizedPriceRangeOptions}
          priceRange={priceRange}
          sort={sort}
          sortOptions={effectiveSortOptions}
          subtitle={activeFilterCount ? formatCastActiveFilters(activeFilterCount, activeLanguage) : copy.filterIntro}
          storeOptions={storeOptions}
          storeSlug={storeSlug}
          total={visibleCasts.length}
          hasActiveCoupon={hasActiveCoupon}
          topRankingOnly={topRankingOnly}
          onArea={setArea}
          onCategory={setCategory}
          onCity={handleCityChange}
          onClose={() => setFilterOpen(false)}
          onLanguage={setLanguage}
          onPrice={(value) => setPriceRange(value as PriceRange)}
          onReset={resetFilters}
          onSort={handleSortChange}
          onStore={setStoreSlug}
          onToggleCoupon={() => setHasActiveCoupon((current) => !current)}
          onToggleTopRanking={() => setTopRankingOnly((current) => !current)}
        />
      ) : null}
    </main>
  );
}

function CastDropdown({
  ariaLabel,
  className,
  icon,
  label,
  options,
  value,
  onChange,
}: {
  ariaLabel: string;
  className?: string;
  icon?: React.ReactNode;
  label?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value) ?? options[0];

  return (
    <div
      className={`cast-dropdown ${className ?? ""} ${isOpen ? "is-open" : ""}`}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        className="cast-dropdown-trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setOpen((current) => !current)}
      >
        {icon}
        {label ? <span className="cast-dropdown-label">{label}</span> : null}
        <b>{selected?.label}</b>
        <ChevronDown size={14} />
      </button>

      {isOpen ? (
        <div className="cast-dropdown-menu" role="listbox" aria-label={ariaLabel}>
          {options.map((option) => (
            <button
              key={option.value || "all"}
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={`cast-dropdown-option ${option.value === value ? "is-selected" : ""}`}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
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
                src={cast.thumbnailUrl}
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

function CastDiscoveryCard({
  cast,
  index,
  language,
  isFavorite,
  onToggleFavorite,
}: {
  cast: PublicCast;
  index: number;
  language: LanguageCode;
  isFavorite: boolean;
  onToggleFavorite: (cast: PublicCast) => void;
}) {
  const image = cast.thumbnailUrl;
  const areaLabel = [
    cast.store.area?.name ?? cast.store.district,
    getCastCityLabel(cast.store.cityCode ?? "", language),
  ]
    .filter(Boolean)
    .join(" · ");
  const langText =
    cast.languages.map((item) => compactLanguageLabels[item] ?? item.toUpperCase()).join(" · ") ||
    "VI";
  const categoryLabel = getCastCategoryLabel(cast.store.category, language);
  const rating = (4.9 - Math.min(index, 4) * 0.1).toFixed(1);
  const badgeLabel = index < 3 ? `#${index + 1}` : index % 3 === 0 ? "Tối nay" : "Mới";
  const isRanked = index < 3;
  const handleFavoriteClick = (event: React.MouseEvent | React.KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onToggleFavorite(cast);
  };

  return (
    <Link href={`/casts/${cast.slug}`} className="cast-card">
      <PlaceholderMedia
        src={image}
        label={translateText("Chưa có ảnh cast", language)}
        tone="dark"
        className="cast-card-media"
      >
        <span className="cast-media-shade" />
        <span className={`cast-rank-badge ${isRanked ? "is-ranked" : ""}`}>
          {isRanked ? <Star size={11} fill="currentColor" /> : <span className="cast-live-dot" />}
          {badgeLabel}
        </span>
        <span
          className={`cast-fav-button ${isFavorite ? "is-active" : ""}`}
          role="button"
          tabIndex={0}
          aria-label={isFavorite ? translateText("Bỏ lưu cast", language) : translateText("Lưu cast", language)}
          aria-pressed={isFavorite}
          onClick={handleFavoriteClick}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") handleFavoriteClick(event);
          }}
        >
          <Heart size={15} fill={isFavorite ? "currentColor" : "none"} />
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
          <span className="cast-rating">
            <Star size={13} fill="currentColor" />
            {rating}
          </span>
          <span className="cast-card-cta">
            {translateText("Đặt", language)}
            <ChevronRight size={13} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function MobileFilterSheet({
  area,
  areaOptions,
  category,
  categoryOptions,
  city,
  cityOptions,
  copy,
  language,
  languageOptions,
  priceRange,
  priceRangeOptions,
  storeOptions,
  storeSlug,
  sort,
  sortOptions,
  subtitle,
  total,
  hasActiveCoupon,
  topRankingOnly,
  onArea,
  onCategory,
  onCity,
  onClose,
  onLanguage,
  onPrice,
  onReset,
  onSort,
  onStore,
  onToggleCoupon,
  onToggleTopRanking,
}: {
  area: string;
  areaOptions: Option[];
  category: string;
  categoryOptions: Option[];
  city: string;
  cityOptions: Option[];
  copy: CastSearchCopy;
  language: string;
  languageOptions: Option[];
  priceRange: PriceRange;
  priceRangeOptions: Option[];
  sort: DiscoverySort;
  sortOptions: Array<{ value: DiscoverySort; label: string }>;
  subtitle: string;
  storeOptions: Option[];
  storeSlug: string;
  total: number;
  hasActiveCoupon: boolean;
  topRankingOnly: boolean;
  onArea: (value: string) => void;
  onCategory: (value: string) => void;
  onCity: (value: string) => void;
  onClose: () => void;
  onLanguage: (value: string) => void;
  onPrice: (value: string) => void;
  onReset: () => void;
  onSort: (value: DiscoverySort) => void;
  onStore: (value: string) => void;
  onToggleCoupon: () => void;
  onToggleTopRanking: () => void;
}) {
  const sheet = (
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
            <h2 id="cast-filter-title">{copy.filterTitle}</h2>
            <p>{subtitle}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={copy.closeFilters}>
            <X size={18} />
          </button>
        </header>

        <div className="cast-sheet-scroll hscroll">
          <FilterChipGroup label={copy.city} options={cityOptions} value={city} onChange={onCity} />
          <FilterChipGroup label={copy.area} options={areaOptions} value={area} onChange={onArea} />
          <FilterChipGroup
            label={copy.store}
            options={storeOptions}
            value={storeSlug}
            onChange={onStore}
          />
          <FilterChipGroup
            label={copy.category}
            options={categoryOptions}
            value={category}
            onChange={onCategory}
          />
          <FilterChipGroup
            label={copy.language}
            options={languageOptions}
            value={language}
            onChange={onLanguage}
          />
          <FilterChipGroup
            label={copy.priceRange}
            note={copy.priceRangeNote}
            options={priceRangeOptions}
            value={priceRange}
            onChange={onPrice}
          />
          <FilterChipGroup
            label={copy.sortLabel.replace(":", "")}
            options={sortOptions}
            value={sort}
            onChange={(value) => onSort(value as DiscoverySort)}
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
              {copy.hasDeals}
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
              <i />
              {copy.topRanking}
            </span>
            <button
              type="button"
              aria-pressed={topRankingOnly}
              className={topRankingOnly ? "is-on" : ""}
              onClick={onToggleTopRanking}
            >
              <b />
            </button>
          </div>
        </div>

        <footer className="cast-sheet-actions">
          <button type="button" className="cast-reset-button" onClick={onReset}>
            <RotateCcw size={15} />
            {copy.resetFilters}
          </button>
          <button type="button" className="cast-apply-button" onClick={onClose}>
            {copy.applyLabel(total)}
          </button>
        </footer>
      </section>
    </div>
  );

  return createPortal(sheet, document.body);
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
  color: var(--vy-text);
  font-family: var(--nl-font-sans);
  padding: 28px 28px 58px;
}

.nl-page-content:has(.cast-search-page) {
  padding-bottom: 0 !important;
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
  color: var(--vy-gold);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.8px;
  text-transform: uppercase;
}

.cast-hero h1,
.cast-mobile-topbar h1 {
  margin: 7px 0 0;
  color: var(--vy-text);
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
.cast-dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
  border: 1px solid rgba(212, 178, 106, 0.28);
  background: rgba(255, 255, 255, 0.04);
  color: var(--vy-muted);
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
.cast-dropdown-trigger svg {
  color: #c9a86a;
  flex: none;
}

.cast-search-input input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--vy-text);
  font-family: var(--nl-font-sans);
}

.cast-search-input input {
  font-size: 14.5px;
}

.cast-search-input input::placeholder {
  color: var(--vy-muted);
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

.cast-dropdown {
  position: relative;
  min-width: 0;
}

.cast-dropdown-trigger {
  width: 100%;
  min-height: 52px;
  border-radius: 14px;
  padding: 0 13px;
  font-family: var(--nl-font-sans);
  cursor: pointer;
}

.cast-dropdown-trigger b {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: var(--vy-text);
  font-size: 14px;
  font-weight: 800;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cast-dropdown-trigger > svg:last-child {
  color: var(--vy-gold);
  transition: transform 180ms ease;
}

.cast-dropdown.is-open .cast-dropdown-trigger {
  border-color: rgba(212, 178, 106, 0.72);
  box-shadow: 0 0 0 3px rgba(212, 178, 106, 0.12);
}

.cast-dropdown.is-open .cast-dropdown-trigger > svg:last-child {
  transform: rotate(180deg);
}

.cast-dropdown-label {
  color: #9b958a;
  font-size: 13px;
  font-weight: 650;
  white-space: nowrap;
}

.cast-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 35;
  display: grid;
  gap: 3px;
  min-width: 100%;
  border: 1px solid rgba(212, 178, 106, 0.28);
  border-radius: 12px;
  background: #16141b;
  padding: 6px;
  box-shadow: 0 20px 48px -24px rgba(0, 0, 0, 0.9);
}

.cast-dropdown-option {
  width: 100%;
  min-height: 36px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--vy-muted);
  padding: 0 10px;
  font-family: var(--nl-font-sans);
  font-size: 13px;
  font-weight: 650;
  text-align: left;
  cursor: pointer;
}

.cast-dropdown-option:hover,
.cast-dropdown-option:focus-visible {
  background: rgba(255, 255, 255, 0.06);
  color: var(--vy-text);
  outline: none;
}

.cast-dropdown-option.is-selected {
  background: linear-gradient(135deg, #f0dda8, #d4b26a);
  color: var(--vy-on-gold);
  font-weight: 850;
}

.cast-find-button,
.cast-apply-button,
.cast-card-cta {
  border: 0;
  background: linear-gradient(135deg, #f4e3b4, #d4b26a 55%, #b6924a);
  color: var(--vy-on-gold);
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
  color: var(--vy-muted);
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
  color: var(--vy-on-gold);
}

.cast-filter-chip b {
  display: inline-grid;
  place-items: center;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  background: #241a0a;
  color: var(--vy-gold-pale);
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
  color: var(--vy-text);
  font-size: 14px;
}

.cast-sort-select {
  font-size: 13px;
}

.cast-sort-select .cast-dropdown-trigger {
  min-height: 38px;
  border-radius: 13px;
  gap: 7px;
  padding: 0 12px;
}

.cast-sort-select .cast-dropdown-label {
  font-size: 13px;
}

.cast-sort-select .cast-dropdown-trigger b {
  flex: none;
  color: #e3c27e;
  font-size: 13px;
  font-weight: 700;
}

.cast-sort-select .cast-dropdown-menu {
  left: auto;
  right: 0;
  min-width: 148px;
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
  color: var(--vy-text);
  text-decoration: none;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.22);
}

.cast-card:first-child {
  border-color: rgba(212, 178, 106, 0.28);
}

.cast-card-media {
  height: 250px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #19191d, #2a2418);
  background-position: center;
  background-size: cover;
  transition: filter 360ms ease;
}

.cast-card:hover .cast-card-media {
  filter: saturate(1.08) contrast(1.04);
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
  color: var(--vy-on-gold);
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
  cursor: pointer;
}

.cast-fav-button.is-active {
  border-color: rgba(255, 61, 113, 0.58);
  background: rgba(255, 61, 113, 0.18);
  color: #ff3d71;
}

.cast-fav-button:focus-visible {
  outline: 2px solid var(--vy-gold-pale);
  outline-offset: 2px;
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
  color: var(--vy-gold);
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
  color: var(--vy-muted);
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
  color: var(--vy-muted);
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
  color: var(--vy-gold);
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
  color: var(--vy-muted);
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
  color: var(--vy-muted);
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
  color: var(--vy-muted);
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
  z-index: 320;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(6, 6, 8, 0.68);
  color: #f3f0ea;
  padding: 0 12px;
}

.cast-filter-sheet {
  position: fixed;
  z-index: 342;
  left: 12px;
  right: 12px;
  bottom: calc(10px + env(safe-area-inset-bottom));
  width: min(420px, calc(100vw - 24px));
  max-height: min(82vh, calc(100dvh - 72px));
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(212, 178, 106, 0.2);
  border-radius: 24px;
  background: #121116;
  box-shadow: 0 -20px 50px -20px rgba(0, 0, 0, 0.7);
  overflow: hidden;
  animation: cast-filter-sheet-in 0.28s var(--vy-motion-ease, cubic-bezier(.2, .8, .2, 1)) both;
}

@keyframes cast-filter-sheet-in {
  from {
    opacity: 0;
    transform: translate3d(0, 18px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
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
  color: var(--vy-muted);
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
  color: var(--vy-muted);
  padding: 8px 14px;
  font-family: var(--nl-font-sans);
  font-size: 12.5px;
  cursor: pointer;
}

.cast-sheet-group button.is-active {
  border-color: transparent;
  background: linear-gradient(135deg, #f0dda8, #d4b26a);
  color: var(--vy-on-gold);
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
  color: var(--vy-muted);
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
  color: var(--vy-muted);
  padding: 0 17px;
  white-space: nowrap;
}

.cast-reset-button svg {
  flex: none;
}

.cast-apply-button {
  flex: 1;
}

html.vy-light .cast-search-page {
  background:
    radial-gradient(circle at 14% 0%, rgba(212, 178, 106, 0.18), transparent 30%),
    linear-gradient(180deg, #fffaf1 0%, #f7f2e8 52%, #efe7db 100%);
  color: var(--vy-text);
}

html.vy-light .cast-hero {
  border-color: rgba(150, 116, 52, 0.2);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.94), rgba(246, 238, 219, 0.88));
  box-shadow: 0 24px 70px -42px rgba(84, 62, 25, 0.34);
}

html.vy-light .cast-hero p,
html.vy-light .cast-results-head,
html.vy-light .cast-dropdown-label,
html.vy-light .cast-suggestion-empty,
html.vy-light .cast-suggestion-split button {
  color: #716756;
}

html.vy-light .cast-search-input,
html.vy-light .cast-dropdown-trigger,
html.vy-light .cast-chip,
html.vy-light .cast-card,
html.vy-light .cast-suggestions,
html.vy-light .cast-filter-sheet,
html.vy-light .cast-toggle-row,
html.vy-light .cast-sheet-group button,
html.vy-light .cast-suggestion-tags button {
  border-color: rgba(150, 116, 52, 0.2);
  background: rgba(255, 255, 255, 0.78);
  color: #6f6658;
}

html.vy-light .cast-search-input,
html.vy-light .cast-dropdown-trigger,
html.vy-light .cast-chip,
html.vy-light .cast-card,
html.vy-light .cast-suggestions {
  box-shadow: 0 18px 42px -32px rgba(68, 48, 18, 0.42);
}

html.vy-light .cast-search-input input,
html.vy-light .cast-dropdown-trigger b,
html.vy-light .cast-results-head b,
html.vy-light .cast-suggestion-searchline span,
html.vy-light .cast-suggestion-row b,
html.vy-light .cast-sheet-head h2,
html.vy-light .cast-sheet-group h3,
html.vy-light .cast-range-preview > div,
html.vy-light .cast-toggle-row span {
  color: #241a0a;
}

html.vy-light .cast-search-input input::placeholder {
  color: #8d8272;
}

html.vy-light .cast-input-clear {
  background: rgba(150, 116, 52, 0.12);
  color: #7a705f;
}

html.vy-light .cast-round-icon {
  border-color: rgba(150, 116, 52, 0.24);
  background: rgba(255, 255, 255, 0.86);
  color: #8f6a2a;
  box-shadow: 0 12px 24px -18px rgba(68, 48, 18, 0.5);
}

html.vy-light .cast-input-filter {
  background: rgba(212, 178, 106, 0.16);
  color: #8f6a2a;
}

html.vy-light .cast-round-icon svg,
html.vy-light .cast-input-filter svg {
  color: currentColor;
  stroke: currentColor;
}

html.vy-light .cast-dropdown.is-open .cast-dropdown-trigger,
html.vy-light .cast-search-input.is-focused {
  border-color: rgba(150, 116, 52, 0.56);
  box-shadow: 0 0 0 3px rgba(150, 116, 52, 0.13);
}

html.vy-light .cast-dropdown-menu {
  border-color: rgba(150, 116, 52, 0.22);
  background: #fffaf1;
  box-shadow: 0 24px 58px -32px rgba(62, 42, 16, 0.44);
}

html.vy-light .cast-dropdown-option:hover,
html.vy-light .cast-dropdown-option:focus-visible {
  background: rgba(212, 178, 106, 0.16);
  color: #241a0a;
}

html.vy-light .cast-filter-chip b {
  background: rgba(150, 116, 52, 0.14);
  color: #7b5a18;
}

html.vy-light .cast-card {
  background: rgba(255, 255, 255, 0.82);
}

html.vy-light .cast-card:first-child {
  border-color: rgba(150, 116, 52, 0.34);
}

html.vy-light .cast-card-body {
  background: rgba(255, 255, 255, 0.72);
}

html.vy-light .cast-language-pill,
html.vy-light .cast-suggestion-tags.is-gold button {
  border-color: rgba(150, 116, 52, 0.24);
  background: rgba(212, 178, 106, 0.14);
  color: #77591f;
}

html.vy-light .cast-like-count,
html.vy-light .cast-card-foot small,
html.vy-light .cast-suggestion-row small,
html.vy-light .cast-suggestion-label,
html.vy-light .cast-suggestion-split,
html.vy-light .cast-sheet-head p,
html.vy-light .cast-sheet-group h3 span,
html.vy-light .cast-range-preview small {
  color: #766c5b;
}

html.vy-light .cast-card-foot b,
html.vy-light .cast-rating,
html.vy-light .cast-sort-select .cast-dropdown-trigger b,
html.vy-light .cast-suggestions mark,
html.vy-light .cast-range-preview > div b {
  color: #8f6a2a;
}

html.vy-light .cast-suggestion-searchline,
html.vy-light .cast-suggestion-row,
html.vy-light .cast-sheet-head,
html.vy-light .cast-sheet-actions {
  border-color: rgba(150, 116, 52, 0.12);
}

html.vy-light .cast-suggestion-row > svg {
  color: #a79d8c;
}

html.vy-light .cast-sheet-backdrop {
  background: rgba(35, 27, 14, 0.34);
}

html.vy-light .cast-filter-sheet {
  background: #fffaf1;
  box-shadow: 0 -20px 52px -28px rgba(62, 42, 16, 0.42);
}

html.vy-light .cast-sheet-handle,
html.vy-light .cast-range-preview > i,
html.vy-light .cast-toggle-row button {
  background: rgba(150, 116, 52, 0.16);
}

html.vy-light .cast-sheet-head button,
html.vy-light .cast-reset-button {
  border-color: rgba(150, 116, 52, 0.18);
  background: rgba(255, 255, 255, 0.76);
  color: #6f6658;
}

html.vy-light .cast-sheet-actions {
  background: rgba(255, 250, 241, 0.92);
}

@media (max-width: 1040px) {
  .cast-card-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .cast-search-page {
    min-height: auto;
    padding: 0 0 14px;
    background: var(--vy-bg);
  }

  .cast-search-shell {
    width: 100%;
  }

  .cast-mobile-topbar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px 10px;
    background: var(--vy-bg);
  }

  .cast-sheet-backdrop {
    z-index: 340;
    padding: 0 10px;
  }

  .cast-filter-sheet {
    z-index: 362;
    left: 10px;
    right: 10px;
    bottom: calc(82px + env(safe-area-inset-bottom));
    width: min(430px, calc(100vw - 20px));
    max-height: min(86dvh, calc(100dvh - 94px));
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
    background: var(--vy-bg);
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
    color: var(--vy-muted);
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
    font-size: 12px;
  }

  .cast-sort-select .cast-dropdown-trigger {
    min-height: auto;
    border: 0;
    background: transparent;
    padding: 0;
    gap: 5px;
    box-shadow: none;
  }

  .cast-sort-select.is-open .cast-dropdown-trigger {
    box-shadow: none;
  }

  .cast-sort-select .cast-dropdown-label {
    display: inline;
    font-size: 12px;
  }

  .cast-sort-select .cast-dropdown-trigger b {
    font-size: 12px;
  }

  .cast-sort-select .cast-dropdown-menu {
    top: calc(100% + 8px);
    min-width: 128px;
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
    display: none;
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
    background: var(--vy-bg);
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
