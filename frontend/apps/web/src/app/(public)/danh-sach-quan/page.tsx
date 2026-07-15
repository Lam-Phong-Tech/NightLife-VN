"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
import { ApiError, resolveClientUrl } from "@/lib/api/client";
import { rankingsApi, type RankingCity } from "@/lib/api/rankings";
import { storeFavoriteApi } from "@/lib/api/store-favorite";
import { translateText } from "@/lib/i18n/client-translations";
import { useActiveLanguage, type LanguageCode } from "@/lib/i18n/use-active-language";
import { hasMemberFavoriteAccess, redirectToLoginForFavorite, requireMemberFavoriteAccess } from "@/lib/member-favorite-auth";
import { readFavoriteStoreSlugs, replaceFavoriteStores, writeFavoriteStore } from "@/lib/member-favorites";
import { formatPriceTier } from "@/lib/price-tier";
import { sortBySearchRelevance } from "@/lib/search-relevance";

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
  tags: string[];
  statusLabel: string;
  statusTone: "open" | "closed";
  dealLabel: string;
  image: string;
  isOpenNow: boolean;
  rating: number | null;
};

type VenueSearchCopy = {
  all: string;
  bookTable: string;
  chooseCity: string;
  emptyDescription: string;
  emptyTitle: string;
  filterArea: string;
  filterAria: string;
  filterCategory: string;
  filterClose: string;
  filterIntro: string;
  filterNeeds: string;
  filterTitle: string;
  find: string;
  hasDeals: string;
  listAria: string;
  locationPermissionAction: string;
  locationPermissionCancel: string;
  locationPermissionDescription: string;
  locationPermissionTitle: string;
  locating: string;
  mobileSubtitle: string;
  mobileTitle: string;
  nearMe: string;
  closedNow: string;
  openFilters: string;
  openNow: string;
  topRanking: string;
  resetFilters: string;
  saveVenue: string;
  searchAria: string;
  searchPlaceholder: string;
  sortAria: string;
  sortLabel: string;
  subtitleDesktop: string;
  titlePrefix: string;
  unsaveVenue: string;
  venuePhoto: string;
};

const emptyVenueImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop stop-color='%2318181c'/%3E%3Cstop offset='.52' stop-color='%23342d21'/%3E%3Cstop offset='1' stop-color='%23101114'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='800' fill='url(%23g)'/%3E%3Crect x='300' y='335' width='600' height='64' rx='32' fill='%23f0dda8' opacity='.18'/%3E%3Crect x='420' y='430' width='360' height='34' rx='17' fill='%23f0dda8' opacity='.12'/%3E%3C/svg%3E";

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

const venueCopyVi: VenueSearchCopy = {
  all: "Tất cả",
  bookTable: "Đặt bàn",
  chooseCity: "Chọn thành phố",
  emptyDescription: "Đổi khu vực, loại hình hoặc từ khóa để xem thêm.",
  emptyTitle: "Chưa có quán phù hợp",
  filterArea: "Khu vực",
  filterAria: "Bộ lọc nhanh",
  filterCategory: "Loại hình",
  filterClose: "Đóng bộ lọc",
  filterIntro: "Lọc quán theo nhu cầu",
  filterNeeds: "Nhu cầu",
  filterTitle: "Bộ lọc",
  find: "Tìm",
  hasDeals: "Có ưu đãi",
  listAria: "Danh sách quán",
  locationPermissionAction: "Cấp quyền vị trí",
  locationPermissionCancel: "Để sau",
  locationPermissionDescription:
    "Bạn cần cấp quyền truy cập vị trí cho website thì hệ thống mới lấy được vị trí hiện tại và lọc quán gần tôi.",
  locationPermissionTitle: "Cần quyền truy cập vị trí",
  locating: "Đang lấy vị trí",
  mobileSubtitle: "FIND VENUES",
  mobileTitle: "Tìm quán",
  nearMe: "Gần tôi",
  closedNow: "Đang đóng",
  openFilters: "Mở bộ lọc",
  openNow: "Đang mở",
  topRanking: "Top ranking",
  resetFilters: "Đặt lại bộ lọc",
  saveVenue: "Lưu quán",
  searchAria: "Tìm và lọc quán",
  searchPlaceholder: "Tìm quán, khu vực hoặc loại hình...",
  sortAria: "Sắp xếp danh sách",
  sortLabel: "Sắp xếp:",
  subtitleDesktop: "FIND YOUR VENUE TONIGHT",
  titlePrefix: "Tìm quán đêm",
  unsaveVenue: "Bỏ lưu quán",
  venuePhoto: "Ảnh",
};

const venueCopyEn: VenueSearchCopy = {
  all: "All",
  bookTable: "Book a table",
  chooseCity: "Choose city",
  emptyDescription: "Change area, category, or keyword to see more venues.",
  emptyTitle: "No matching venues yet",
  filterArea: "Area",
  filterAria: "Quick filters",
  filterCategory: "Category",
  filterClose: "Close filters",
  filterIntro: "Filter venues by your needs",
  filterNeeds: "Needs",
  filterTitle: "Filters",
  find: "Find",
  hasDeals: "Has deals",
  listAria: "Venue list",
  locationPermissionAction: "Allow location",
  locationPermissionCancel: "Later",
  locationPermissionDescription:
    "Please allow location access so the system can read your current position and filter venues near you.",
  locationPermissionTitle: "Location permission needed",
  locating: "Finding location",
  mobileSubtitle: "FIND VENUES",
  mobileTitle: "Find venues",
  nearMe: "Nearby",
  closedNow: "Closed now",
  openFilters: "Open filters",
  openNow: "Open now",
  topRanking: "Top ranking",
  resetFilters: "Reset filters",
  saveVenue: "Save venue",
  searchAria: "Search and filter venues",
  searchPlaceholder: "Search venues, areas, or categories...",
  sortAria: "Sort venues",
  sortLabel: "Sort:",
  subtitleDesktop: "FIND YOUR VENUE TONIGHT",
  titlePrefix: "Find night venues in",
  unsaveVenue: "Unsave venue",
  venuePhoto: "Photo of",
};

const englishCityLabels: Record<string, string> = {
  hn: "Hanoi",
  hcm: "Ho Chi Minh City",
};

const englishSortLabels: Record<DiscoverySort, string> = {
  priority: "Popular",
  nearest: "Nearest",
  newest: "Newest",
};

const englishCategoryLabels: Record<string, string> = {
  BAR: "Bar",
  CLUB: "Club",
  LOUNGE: "Lounge",
  GIRLS_BAR: "Girls bar",
  KARAOKE: "Karaoke",
  MASSAGE_SPA: "Spa",
  RESTAURANT: "Restaurant",
  CASINO: "Casino",
};

const stripVietnameseMarks = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\bQuan\b/g, "District")
    .replace(/\bTP\.HCM\b/g, "Ho Chi Minh City");

const normalizeAreaKey = (value?: string | null) =>
  (value ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const isGenericArea = (area: PublicArea) => {
  const code = normalizeAreaKey(area.code);
  const name = normalizeAreaKey(area.name);
  const district = normalizeAreaKey(area.district);

  return (
    code.endsWith("-tong-hop") ||
    code.endsWith("-general") ||
    ["tong-hop", "general", "all"].includes(name) ||
    ["tong-hop", "general", "all"].includes(district)
  );
};

const getVenueCopy = (language: LanguageCode): VenueSearchCopy => {
  if (language === "en") return venueCopyEn;
  if (language === "vi") return venueCopyVi;

  return Object.fromEntries(
    Object.entries(venueCopyVi).map(([key, value]) => [key, translateText(value, language)]),
  ) as VenueSearchCopy;
};

const getLocalizedCityLabel = (cityCode: string, language: LanguageCode) => {
  if (!cityCode) return language === "en" ? "Vietnam" : translateText("Việt Nam", language);
  if (language === "en") return englishCityLabels[cityCode] ?? cityCode;
  return translateText(cityLabels[cityCode] ?? cityCode, language);
};

const getLocalizedSortLabel = (sort: DiscoverySort, language: LanguageCode) =>
  language === "en" ? englishSortLabels[sort] : translateText(sortLabels[sort], language);

const getLocalizedCategoryLabel = (category: string, language: LanguageCode) => {
  if (language === "en") return englishCategoryLabels[category] ?? category;
  return translateText(categoryLabels[category] ?? category, language);
};

const getLocalizedAreaLabel = (areaName: string, language: LanguageCode) => {
  const base = areaLabels[areaName] ?? areaName;
  if (language === "en") return stripVietnameseMarks(areaName);
  return translateText(base, language);
};

const toRankingCity = (cityCode: string): RankingCity =>
  cityCode === "hcm" ? "hcm" : cityCode === "hn" ? "hn" : "all";

const formatVenueCount = (count: number, language: LanguageCode) => {
  if (language === "en") return `${count} ${count === 1 ? "venue" : "venues"}`;
  return `${count} ${translateText("quán", language)}`;
};

const formatVenueActiveFilters = (count: number, language: LanguageCode) => {
  if (language === "en") return `${count} ${count === 1 ? "filter" : "filters"} active`;
  return `${count} ${translateText("bộ lọc đang bật", language)}`;
};

const formatVenueApplyLabel = (count: number, language: LanguageCode) => {
  if (language === "en") return `View ${formatVenueCount(count, language)}`;
  return `${translateText("Xem", language)} ${formatVenueCount(count, language)}`;
};

const isMobileViewport = () =>
  typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;

const readGeolocationPermissionState = async () => {
  if (typeof navigator === "undefined" || !navigator.permissions?.query) return null;

  try {
    const status = await navigator.permissions.query({ name: "geolocation" as PermissionName });
    return status.state;
  } catch {
    return null;
  }
};

const formatVenueSearchTitle = (
  cityLabel: string,
  language: LanguageCode,
  copy: VenueSearchCopy,
) => {
  if (language === "en") return `${copy.titlePrefix} ${cityLabel}`;
  if (language === "ja") return `${cityLabel}のナイトスポットを探す`;
  if (language === "ko") return `${cityLabel} 나이트 장소 찾기`;
  if (language === "zh") return `查找${cityLabel}夜生活场所`;
  return `${copy.titlePrefix} ${cityLabel}`;
};

const formatCategoryVenueSearchTitle = (category: string, cityLabel: string, language: LanguageCode) => {
  const categoryLabel = getLocalizedCategoryLabel(category, language);
  if (language === "en") {
    return category === "RESTAURANT" ? `Restaurants in ${cityLabel}` : `${categoryLabel} in ${cityLabel}`;
  }
  return translateText(`${categoryLabel} tại ${cityLabel}`, language);
};

const getCategoryVenueMobileTitle = (category: string, language: LanguageCode) =>
  getLocalizedCategoryLabel(category, language);

const getCategoryVenueSubtitle = (category: string, language: LanguageCode) => {
  if (language === "en") {
    return category === "RESTAURANT" ? "RESTAURANTS" : "SPA & WELLNESS";
  }
  return translateText(category === "RESTAURANT" ? "NHÀ HÀNG" : "SPA & WELLNESS", language);
};

const getLocalizedCategoryTags = (category: string, fallback: string, language: LanguageCode) =>
  (categoryTags[category] ?? [fallback]).map((tag) => translateText(tag, language));

const weekdayKeys = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

type OpeningSlot = NonNullable<PublicStore["openingHours"]>[string];

const parseClockMinutes = (value?: string | null) => {
  if (typeof value !== "string") return null;

  const match = value.trim().match(/^(\d{1,2})(?::(\d{2}))?/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2] ?? "0");
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  return hours * 60 + minutes;
};

const openingRangeFromSlot = (slot?: OpeningSlot | null) => {
  if (!slot || slot.closed) return null;

  const openMinutes = parseClockMinutes(slot.open);
  const closeMinutes = parseClockMinutes(slot.close);

  return openMinutes !== null && closeMinutes !== null ? { openMinutes, closeMinutes } : null;
};

const openingLabelFromSlot = (slot: OpeningSlot | undefined, language: LanguageCode) => {
  if (!slot) return translateText("Chưa có giờ mở cửa", language);
  if (slot.closed) return slot.note || translateText("Tạm nghỉ", language);
  if (slot.open && slot.close) return `${slot.open} - ${slot.close}`;
  return slot.note || translateText("Chưa có giờ mở cửa", language);
};

const openingStatus = (store: PublicStore, language: LanguageCode, now = new Date()) => {
  const currentDayIndex = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const previousDayKey = weekdayKeys[(currentDayIndex + 6) % weekdayKeys.length] ?? "monday";
  const todayKey = weekdayKeys[currentDayIndex] ?? "monday";
  const previousSlot = store.openingHours?.[previousDayKey];
  const todaySlot = store.openingHours?.[todayKey];
  const previousRange = openingRangeFromSlot(previousSlot);

  if (
    previousRange &&
    previousRange.closeMinutes <= previousRange.openMinutes &&
    currentMinutes < previousRange.closeMinutes
  ) {
    return {
      label: openingLabelFromSlot(previousSlot, language),
      isOpen: true,
      tone: "open" as const,
    };
  }

  const todayRange = openingRangeFromSlot(todaySlot);
  if (todayRange) {
    const crossesMidnight = todayRange.closeMinutes <= todayRange.openMinutes;
    const isOpen = crossesMidnight
      ? currentMinutes >= todayRange.openMinutes
      : currentMinutes >= todayRange.openMinutes && currentMinutes < todayRange.closeMinutes;

    return {
      label: openingLabelFromSlot(todaySlot, language),
      isOpen,
      tone: isOpen ? ("open" as const) : ("closed" as const),
    };
  }

  return {
    label: openingLabelFromSlot(todaySlot, language),
    isOpen: false,
    tone: "closed" as const,
  };
};

const formatDistance = (distanceKm: number | null | undefined, language: LanguageCode) =>
  typeof distanceKm === "number" && Number.isFinite(distanceKm)
    ? `${distanceKm.toFixed(1)} km`
    : language === "en"
      ? "By area"
      : translateText("Theo khu vực", language);

const toVenueView = (store: PublicStore, language: LanguageCode, now: Date): VenueView => {
  const categoryLabel = getLocalizedCategoryLabel(store.category, language);
  const areaLabel = getLocalizedAreaLabel(store.area?.name ?? store.district ?? store.city ?? "Trung tâm", language);
  const cityLabel = getLocalizedCityLabel(store.cityCode ?? "", language) || store.city;
  const backendImage = resolveClientUrl(store.thumbnailUrl);
  const image = backendImage ?? emptyVenueImage;
  const { label: statusLabel, isOpen, tone } = openingStatus(store, language, now);
  const adminTags = store.tags?.filter(Boolean) ?? [];
  const localizedAdminTags = adminTags.map((tag) => translateText(tag, language));
  const localizedDealLabel = store.activeCoupon?.name
    ? translateText(store.activeCoupon.name, language)
    : "";

  return {
    id: store.slug,
    name: store.name,
    categoryLabel,
    areaLabel,
    cityLabel,
    distanceLabel: formatDistance(store.distanceKm, language),
    priceLabel: formatPriceTier(store.priceReference?.startingFromVnd),
    rating: null,
    tags: (
      localizedAdminTags.length
        ? localizedAdminTags
        : getLocalizedCategoryTags(store.category, categoryLabel, language)
    ).slice(0, 3),
    statusLabel,
    statusTone: tone,
    dealLabel: localizedDealLabel || localizedAdminTags[0] || categoryLabel,
    image,
    isOpenNow: isOpen,
  };
};

type VenueDirectoryPageProps = {
  fixedCategory?: string;
};

export function VenueDirectoryPage({ fixedCategory }: VenueDirectoryPageProps = {}) {
  const defaultOpenNow = !fixedCategory;
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("hn");
  const [area, setArea] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<DiscoverySort>("priority");
  const [hasActiveCoupon, setHasActiveCoupon] = useState(false);
  const [topRankingOnly, setTopRankingOnly] = useState(false);
  const [topRankingStoreSlugs, setTopRankingStoreSlugs] = useState<string[]>([]);
  const [isTopRankingLoading, setTopRankingLoading] = useState(false);
  const [openNow, setOpenNow] = useState(defaultOpenNow);
  const [closedNow, setClosedNow] = useState(false);
  const [openingClock, setOpeningClock] = useState(() => Date.now());
  const [isFilterSheetOpen, setFilterSheetOpen] = useState(false);
  const [isDesktopFilterOpen, setDesktopFilterOpen] = useState(false);
  const [isLocationPermissionOpen, setLocationPermissionOpen] = useState(false);
  const [isCityMenuOpen, setCityMenuOpen] = useState(false);
  const [isSortMenuOpen, setSortMenuOpen] = useState(false);
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [areas, setAreas] = useState<PublicArea[]>([]);
  const [stores, setStores] = useState<PublicStore[]>([]);
  const [favoriteStoreSlugs, setFavoriteStoreSlugs] = useState<string[]>(
    () => (hasMemberFavoriteAccess() ? readFavoriteStoreSlugs() : []),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const desktopFilterRef = useRef<HTMLDivElement | null>(null);
  const activeLanguage = useActiveLanguage();
  const copy = useMemo(() => getVenueCopy(activeLanguage), [activeLanguage]);
  const isCategoryLocked = Boolean(fixedCategory);
  const effectiveCategory = fixedCategory || category;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setOpeningClock(Date.now());
    }, 60 * 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!hasMemberFavoriteAccess()) {
      queueMicrotask(() => {
        if (!cancelled) setFavoriteStoreSlugs([]);
      });
      return () => {
        cancelled = true;
      };
    }

    storeFavoriteApi
      .list()
      .then((items) => {
        if (cancelled) return;
        const favoriteSnapshots = items.map((item) => ({
          slug: item.store.slug,
          name: item.store.name,
          categoryLabel: getLocalizedCategoryLabel(item.store.category, activeLanguage),
          areaLabel: [
            item.store.area?.name ?? item.store.district,
            getLocalizedCityLabel(item.store.cityCode ?? "", activeLanguage),
          ]
            .filter(Boolean)
            .join(" Â· "),
          cityLabel: item.store.city,
          image: item.store.thumbnailUrl ?? undefined,
          favoritedAt: item.favoritedAt,
        }));
        replaceFavoriteStores(favoriteSnapshots);
        setFavoriteStoreSlugs(favoriteSnapshots.map((item) => item.slug));
      })
      .catch(() => {
        if (!cancelled) setFavoriteStoreSlugs(readFavoriteStoreSlugs());
      });

    return () => {
      cancelled = true;
    };
  }, [activeLanguage]);

  useEffect(() => {
    let cancelled = false;

    if (!city) {
      queueMicrotask(() => {
        if (!cancelled) setAreas([]);
      });
      return () => {
        cancelled = true;
      };
    }

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
        .listStoresStrict({
          q: query,
          city,
          area,
          category: effectiveCategory,
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
  }, [area, city, coords, effectiveCategory, hasActiveCoupon, query, sort]);

  useEffect(() => {
    if (!topRankingOnly) {
      queueMicrotask(() => {
        setTopRankingStoreSlugs([]);
        setTopRankingLoading(false);
      });
      return;
    }

    const controller = new AbortController();
    queueMicrotask(() => {
      if (!controller.signal.aborted) setTopRankingLoading(true);
    });

    rankingsApi
      .list({ targetType: "STORE", city: toRankingCity(city), limit: 5 }, { signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted) return;
        setTopRankingStoreSlugs(response.data.slice(0, 5).map((item) => item.slug).filter(Boolean));
      })
      .catch(() => {
        if (!controller.signal.aborted) setTopRankingStoreSlugs([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setTopRankingLoading(false);
      });

    return () => controller.abort();
  }, [city, topRankingOnly]);

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

  useEffect(() => {
    if (!isDesktopFilterOpen) return;

    const closeOnPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target;
      if (target instanceof Node && desktopFilterRef.current?.contains(target)) return;
      setDesktopFilterOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDesktopFilterOpen(false);
    };

    document.addEventListener("mousedown", closeOnPointerDown);
    document.addEventListener("touchstart", closeOnPointerDown);
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnPointerDown);
      document.removeEventListener("touchstart", closeOnPointerDown);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isDesktopFilterOpen]);

  useEffect(() => {
    if (!isLocationPermissionOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLocationPermissionOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isLocationPermissionOpen]);

  const topRankingOrder = useMemo(
    () => new Map(topRankingStoreSlugs.map((slug, index) => [slug, index])),
    [topRankingStoreSlugs],
  );
  const openingNow = useMemo(() => new Date(openingClock), [openingClock]);

  const venues = useMemo(() => {
    const searchSortedVenues = sortBySearchRelevance(stores, query, (store) => ({
      primary: [store.name],
      secondary: [
        store.category,
        categoryLabels[store.category],
        store.description,
        store.address,
        store.area?.name,
        store.area?.code,
        store.district,
        store.city,
        store.cityCode,
        store.slug,
      ],
    }))
      .map((store) => toVenueView(store, activeLanguage, openingNow))
      .filter((venue) => !openNow || venue.isOpenNow)
      .filter((venue) => !closedNow || !venue.isOpenNow)
      .filter((venue) => !topRankingOnly || topRankingOrder.has(venue.id));

    if (!topRankingOnly) return searchSortedVenues;

    return [...searchSortedVenues].sort(
      (left, right) =>
        (topRankingOrder.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
        (topRankingOrder.get(right.id) ?? Number.MAX_SAFE_INTEGER),
    );
  }, [activeLanguage, closedNow, openNow, openingNow, query, stores, topRankingOnly, topRankingOrder]);

  const cityLabel = getLocalizedCityLabel(city, activeLanguage);
  const selectedCityLabel = cityLabel;
  const localizedCityOptions = useMemo(
    () =>
      cityOptions.map((option) => ({
        value: option.value,
        label: option.value ? getLocalizedCityLabel(option.value, activeLanguage) : copy.all,
      })),
    [activeLanguage, copy.all],
  );
  const localizedSortOptions = useMemo(
    () =>
      sortOptions.map((option) => ({
        value: option.value,
        label: getLocalizedSortLabel(option.value, activeLanguage),
      })),
    [activeLanguage],
  );

  const areaOptions = useMemo<FilterOption[]>(() => {
    if (!city) {
      return [{ value: "", label: copy.all }];
    }

    const seenAreaLabels = new Set<string>();
    const dynamicOptions = areas.reduce<FilterOption[]>((options, item) => {
      if (isGenericArea(item)) return options;

      const labelSource = item.name || item.district || item.city;
      const value = item.code || item.name || item.district || item.city;
      const dedupeKey = normalizeAreaKey(labelSource);

      if (!value || !dedupeKey || seenAreaLabels.has(dedupeKey)) return options;
      seenAreaLabels.add(dedupeKey);

      options.push({
        value,
        label: getLocalizedAreaLabel(labelSource, activeLanguage),
      });

      return options;
    }, []);

    const fallbackOptions = getFallbackAreaOptions(city).map((option) => ({
      ...option,
      label: translateText(option.label, activeLanguage),
    }));

    return [{ value: "", label: copy.all }, ...(dynamicOptions.length ? dynamicOptions : fallbackOptions)];
  }, [activeLanguage, areas, city, copy.all]);

  const startNearbyLocationRequest = () => {
    if (!navigator.geolocation) {
      setError("Thiết bị chưa hỗ trợ lấy vị trí.");
      return;
    }

    setLocationPermissionOpen(false);
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setError(null);
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setSort("nearest");
        setIsLocating(false);
      },
      (positionError) => {
        const deniedMessage =
          "Trình duyệt đang chặn quyền vị trí. Hãy mở quyền vị trí trong cài đặt trình duyệt rồi thử lại.";
        setError(positionError.code === positionError.PERMISSION_DENIED ? deniedMessage : "Chưa lấy được vị trí hiện tại.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const requestNearby = async ({ bypassPermissionNotice = false } = {}) => {
    if (!navigator.geolocation) {
      setError("Thiết bị chưa hỗ trợ lấy vị trí.");
      return;
    }

    if (isMobileViewport() && !bypassPermissionNotice && !coords) {
      const permissionState = await readGeolocationPermissionState();
      if (permissionState !== "granted") {
        setLocationPermissionOpen(true);
        return;
      }
    }

    startNearbyLocationRequest();
  };

  const confirmLocationPermission = () => {
    startNearbyLocationRequest();
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
      void requestNearby();
      return;
    }

    setSort(nextSort);
  };

  const categoryChips = useMemo(
    () => [
      { label: getLocalizedCategoryLabel("LOUNGE", activeLanguage), value: "LOUNGE" },
      { label: getLocalizedCategoryLabel("BAR", activeLanguage), value: "BAR" },
      { label: getLocalizedCategoryLabel("CLUB", activeLanguage), value: "CLUB" },
      { label: getLocalizedCategoryLabel("KARAOKE", activeLanguage), value: "KARAOKE" },
      { label: getLocalizedCategoryLabel("MASSAGE_SPA", activeLanguage), value: "MASSAGE_SPA" },
      { label: getLocalizedCategoryLabel("RESTAURANT", activeLanguage), value: "RESTAURANT" },
    ],
    [activeLanguage],
  );
  const categoryOptions = useMemo(() => [{ label: copy.all, value: "" }, ...categoryChips], [categoryChips, copy.all]);
  const activeFilterCount = [
    city !== "hn",
    area,
    !isCategoryLocked && category,
    sort !== "priority",
    hasActiveCoupon,
    topRankingOnly,
    closedNow || openNow !== defaultOpenNow,
  ].filter(Boolean).length;
  const isResultsLoading = isLoading || isTopRankingLoading;
  const pageTitle = fixedCategory
    ? formatCategoryVenueSearchTitle(fixedCategory, cityLabel, activeLanguage)
    : formatVenueSearchTitle(cityLabel, activeLanguage, copy);
  const pageMobileTitle = fixedCategory
    ? getCategoryVenueMobileTitle(fixedCategory, activeLanguage)
    : copy.mobileTitle;
  const pageSubtitle = fixedCategory
    ? getCategoryVenueSubtitle(fixedCategory, activeLanguage)
    : copy.subtitleDesktop;

  const resetFilters = () => {
    setCity("hn");
    setArea("");
    setCategory("");
    setSort("priority");
    setHasActiveCoupon(false);
    setTopRankingOnly(false);
    setOpenNow(defaultOpenNow);
    setClosedNow(false);
    setSortMenuOpen(false);
    setCityMenuOpen(false);
  };

  const toggleOpenNow = () => {
    const nextOpenNow = !openNow;
    setOpenNow(nextOpenNow);
    if (nextOpenNow) setClosedNow(false);
  };

  const toggleClosedNow = () => {
    const nextClosedNow = !closedNow;
    setClosedNow(nextClosedNow);
    if (nextClosedNow) setOpenNow(false);
  };

  const handleFilterButtonClick = () => {
    setCityMenuOpen(false);
    setSortMenuOpen(false);

    if (typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches) {
      setDesktopFilterOpen(false);
      setFilterSheetOpen(true);
      return;
    }

    setDesktopFilterOpen((current) => !current);
  };

  const toggleTopRankingOnly = () => {
    const nextValue = !topRankingOnly;
    setTopRankingOnly(nextValue);
    if (nextValue) setOpenNow(false);
  };

  const toggleVenueFavorite = async (venue: VenueView) => {
    if (!requireMemberFavoriteAccess()) {
      return;
    }

    const nextValue = !favoriteStoreSlugs.includes(venue.id);
    const snapshot = {
      slug: venue.id,
      name: venue.name,
      categoryLabel: venue.categoryLabel,
      areaLabel: venue.areaLabel,
      cityLabel: venue.cityLabel,
      image: venue.image,
    };
    const applyFavorite = (favorited: boolean) => {
      writeFavoriteStore(snapshot, favorited);
      setFavoriteStoreSlugs((current) =>
        favorited
          ? [venue.id, ...current.filter((slug) => slug !== venue.id)]
          : current.filter((slug) => slug !== venue.id),
      );
    };

    applyFavorite(nextValue);

    try {
      const state = nextValue
        ? await storeFavoriteApi.favorite(venue.id)
        : await storeFavoriteApi.unfavorite(venue.id);
      applyFavorite(state.favorited);
    } catch (error) {
      if (error instanceof ApiError && [401, 403].includes(error.status)) {
        applyFavorite(false);
        redirectToLoginForFavorite();
        return;
      }

      applyFavorite(!nextValue);
    }
  };

  return (
    <main className="venue-search-page">
      <style>{venueSearchCss}</style>

      <div className="venue-search-shell">
        <header className="venue-search-header">
          <Link href="/" aria-label={translateText("Quay lại trang chủ", activeLanguage)} className="venue-search-back">
            <ArrowLeft size={17} />
          </Link>

          <div className="venue-search-title">
            <h1>
              <span className="venue-title-desktop">
                {pageTitle}
              </span>
              <span className="venue-title-mobile">{pageMobileTitle}</span>
            </h1>
            <p>
              <span className="venue-subtitle-desktop">{pageSubtitle}</span>
              <span className="venue-subtitle-mobile">{fixedCategory ? pageSubtitle : copy.mobileSubtitle}</span>
            </p>
          </div>
        </header>

        <section className="venue-search-controls" aria-label={copy.searchAria}>
          <div className="venue-search-field" ref={desktopFilterRef}>
            <label className="venue-search-input">
              <Search size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={copy.searchPlaceholder}
              />
              <button
                type="button"
                aria-label={copy.openFilters}
                aria-haspopup="dialog"
                aria-expanded={isDesktopFilterOpen || isFilterSheetOpen}
                className={`venue-filter-icon ${isDesktopFilterOpen ? "is-active" : ""}`}
                data-testid="venue-filter-button"
                onClick={(event) => {
                  event.preventDefault();
                  handleFilterButtonClick();
                }}
              >
                <SlidersHorizontal size={16} />
              </button>
            </label>

            {isDesktopFilterOpen ? (
              <DesktopVenueFilterPopover
                area={area}
                areaOptions={areaOptions}
                applyLabel={formatVenueApplyLabel(venues.length, activeLanguage)}
                category={category}
                categoryOptions={categoryOptions}
                city={city}
                cityOptions={localizedCityOptions}
                closedNow={closedNow}
                copy={copy}
                hasActiveCoupon={hasActiveCoupon}
                hideCategory={isCategoryLocked}
                openNow={openNow}
                topRankingOnly={topRankingOnly}
                sort={sort}
                sortOptions={localizedSortOptions}
                subtitle={activeFilterCount ? formatVenueActiveFilters(activeFilterCount, activeLanguage) : copy.filterIntro}
                onArea={setArea}
                onCategory={setCategory}
                onCity={handleCityChange}
                onClose={() => setDesktopFilterOpen(false)}
                onReset={resetFilters}
                onSort={handleSortChange}
                onToggleCoupon={() => setHasActiveCoupon((current) => !current)}
                onToggleClosedNow={toggleClosedNow}
                onToggleOpenNow={toggleOpenNow}
                onToggleTopRanking={toggleTopRankingOnly}
              />
            ) : null}
          </div>

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
              <div className="venue-city-menu" role="listbox" aria-label={copy.chooseCity}>
                {localizedCityOptions.map((option) => (
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
            {copy.find}
          </button>
        </section>

        <nav className="venue-chip-row hscroll" aria-label={copy.filterAria}>
          <button
            type="button"
            className={`venue-chip ${openNow ? "is-active" : ""}`}
            onClick={toggleOpenNow}
          >
            {copy.openNow}
          </button>
          <button
            type="button"
            className={`venue-chip ${closedNow ? "is-active" : ""}`}
            onClick={toggleClosedNow}
          >
            {copy.closedNow}
          </button>
          <button
            type="button"
            className={`venue-chip ${sort === "nearest" ? "is-active" : ""}`}
            onClick={() => {
              void requestNearby();
            }}
            disabled={isLocating}
          >
            <LocateFixed size={13} />
            {isLocating ? copy.locating : copy.nearMe}
          </button>
          <button
            type="button"
            className={`venue-chip ${hasActiveCoupon ? "is-active" : ""}`}
            onClick={() => setHasActiveCoupon((current) => !current)}
          >
            {copy.hasDeals}
          </button>
          <button
            type="button"
            className={`venue-chip ${topRankingOnly ? "is-active" : ""}`}
            onClick={toggleTopRankingOnly}
          >
            {copy.topRanking}
          </button>
          {!isCategoryLocked ? categoryChips.map((chip) => (
            <button
              key={chip.value}
              type="button"
              className={`venue-chip ${category === chip.value ? "is-active" : ""}`}
              onClick={() => setCategory((current) => (current === chip.value ? "" : chip.value))}
            >
              {chip.label}
            </button>
          )) : null}
        </nav>

        <div className="venue-result-bar">
          <div>
            <strong>{isResultsLoading ? "..." : formatVenueCount(venues.length, activeLanguage)}</strong>
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
              <span>{copy.sortLabel}</span>
              <strong>{getLocalizedSortLabel(sort, activeLanguage)}</strong>
              <ChevronDown size={13} />
            </button>
            {isSortMenuOpen ? (
              <div className="venue-sort-menu" role="listbox" aria-label={copy.sortAria}>
                {localizedSortOptions.map((option) => (
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

        {error ? <div className="venue-error">{translateText(error, activeLanguage)}</div> : null}

        <section className="venue-list" aria-label={copy.listAria}>
          {isResultsLoading ? (
            <VenueSkeletons />
          ) : venues.length > 0 ? (
            venues.map((venue) => (
              <VenueResultCard
                key={venue.id}
                venue={venue}
                copy={copy}
                isFavorite={favoriteStoreSlugs.includes(venue.id)}
                onToggleFavorite={toggleVenueFavorite}
              />
            ))
          ) : (
            <div className="venue-empty">
              <strong>{copy.emptyTitle}</strong>
              <span>{copy.emptyDescription}</span>
            </div>
          )}
        </section>
      </div>

      {isFilterSheetOpen ? (
        <MobileVenueFilterSheet
          area={area}
          areaOptions={areaOptions}
          applyLabel={formatVenueApplyLabel(venues.length, activeLanguage)}
          category={category}
          categoryOptions={categoryOptions}
          city={city}
          cityOptions={localizedCityOptions}
          closedNow={closedNow}
          copy={copy}
          hasActiveCoupon={hasActiveCoupon}
          hideCategory={isCategoryLocked}
          openNow={openNow}
          topRankingOnly={topRankingOnly}
          sort={sort}
          sortOptions={localizedSortOptions}
          subtitle={activeFilterCount ? formatVenueActiveFilters(activeFilterCount, activeLanguage) : copy.filterIntro}
          onArea={setArea}
          onCategory={setCategory}
          onCity={handleCityChange}
          onClose={() => setFilterSheetOpen(false)}
          onReset={resetFilters}
          onSort={handleSortChange}
          onToggleCoupon={() => setHasActiveCoupon((current) => !current)}
          onToggleClosedNow={toggleClosedNow}
          onToggleOpenNow={toggleOpenNow}
          onToggleTopRanking={toggleTopRankingOnly}
        />
      ) : null}

      {isLocationPermissionOpen ? (
        <LocationPermissionDialog
          copy={copy}
          onAllow={confirmLocationPermission}
          onClose={() => setLocationPermissionOpen(false)}
        />
      ) : null}
    </main>
  );
}

export default function Page() {
  return <VenueDirectoryPage />;
}

function LocationPermissionDialog({
  copy,
  onAllow,
  onClose,
}: {
  copy: VenueSearchCopy;
  onAllow: () => void;
  onClose: () => void;
}) {
  const dialog = (
    <div className="venue-location-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="venue-location-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="venue-location-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button type="button" className="venue-location-close" onClick={onClose} aria-label={copy.filterClose}>
          <X size={16} />
        </button>
        <div className="venue-location-icon" aria-hidden="true">
          <LocateFixed size={22} />
        </div>
        <h2 id="venue-location-title">{copy.locationPermissionTitle}</h2>
        <p>{copy.locationPermissionDescription}</p>
        <div className="venue-location-actions">
          <button type="button" className="venue-location-secondary" onClick={onClose}>
            {copy.locationPermissionCancel}
          </button>
          <button type="button" className="venue-location-primary" onClick={onAllow}>
            {copy.locationPermissionAction}
          </button>
        </div>
      </section>
    </div>
  );

  return createPortal(dialog, document.body);
}

function DesktopVenueFilterPopover({
  area,
  areaOptions,
  applyLabel,
  category,
  categoryOptions,
  city,
  cityOptions,
  closedNow,
  copy,
  hasActiveCoupon,
  hideCategory,
  openNow,
  topRankingOnly,
  sort,
  sortOptions,
  subtitle,
  onArea,
  onCategory,
  onCity,
  onClose,
  onReset,
  onSort,
  onToggleCoupon,
  onToggleClosedNow,
  onToggleOpenNow,
  onToggleTopRanking,
}: {
  area: string;
  areaOptions: FilterOption[];
  applyLabel: string;
  category: string;
  categoryOptions: FilterOption[];
  city: string;
  cityOptions: FilterOption[];
  closedNow: boolean;
  copy: VenueSearchCopy;
  hasActiveCoupon: boolean;
  hideCategory?: boolean;
  openNow: boolean;
  topRankingOnly: boolean;
  sort: DiscoverySort;
  sortOptions: Array<{ value: DiscoverySort; label: string }>;
  subtitle: string;
  onArea: (value: string) => void;
  onCategory: (value: string) => void;
  onCity: (value: string) => void;
  onClose: () => void;
  onReset: () => void;
  onSort: (value: DiscoverySort) => void;
  onToggleCoupon: () => void;
  onToggleClosedNow: () => void;
  onToggleOpenNow: () => void;
  onToggleTopRanking: () => void;
}) {
  return (
    <div className="venue-desktop-filter-popover" role="dialog" aria-label={copy.filterTitle}>
      <header className="venue-desktop-filter-head">
        <div>
          <span>{copy.filterIntro}</span>
          <strong>{copy.filterTitle}</strong>
          <p>{subtitle}</p>
        </div>
        <button type="button" onClick={onClose} aria-label={copy.filterClose}>
          <X size={16} />
        </button>
      </header>

      <div className="venue-desktop-filter-body">
        <section className="venue-desktop-filter-section is-wide" aria-label={copy.filterNeeds}>
          <h3>{copy.filterNeeds}</h3>
          <div className="venue-desktop-filter-options">
            <button type="button" className={openNow ? "is-active" : ""} onClick={onToggleOpenNow}>
              {copy.openNow}
            </button>
            <button type="button" className={closedNow ? "is-active" : ""} onClick={onToggleClosedNow}>
              {copy.closedNow}
            </button>
            <button type="button" className={hasActiveCoupon ? "is-active" : ""} onClick={onToggleCoupon}>
              {copy.hasDeals}
            </button>
            <button type="button" className={topRankingOnly ? "is-active" : ""} onClick={onToggleTopRanking}>
              {copy.topRanking}
            </button>
          </div>
        </section>

        <DesktopVenueFilterOptionGroup
          label={copy.chooseCity}
          options={cityOptions}
          value={city}
          onChange={onCity}
        />
        <DesktopVenueFilterOptionGroup
          label={copy.filterArea}
          options={areaOptions}
          value={area}
          onChange={onArea}
        />
        {!hideCategory ? (
          <DesktopVenueFilterOptionGroup
            label={copy.filterCategory}
            options={categoryOptions}
            value={category}
            onChange={onCategory}
          />
        ) : null}
        <DesktopVenueFilterOptionGroup
          label={copy.sortLabel.replace(":", "")}
          options={sortOptions}
          value={sort}
          onChange={(value) => onSort(value as DiscoverySort)}
        />
      </div>

      <footer className="venue-desktop-filter-actions">
        <button type="button" className="venue-desktop-filter-reset" onClick={onReset}>
          <RotateCcw size={14} />
          {copy.resetFilters}
        </button>
        <button type="button" className="venue-desktop-filter-apply" onClick={onClose}>
          {applyLabel}
        </button>
      </footer>
    </div>
  );
}

function DesktopVenueFilterOptionGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: FilterOption[] | Array<{ value: DiscoverySort; label: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <section className="venue-desktop-filter-section" aria-label={label}>
      <h3>{label}</h3>
      <div className="venue-desktop-filter-options">
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

function MobileVenueFilterSheet({
  area,
  areaOptions,
  applyLabel,
  category,
  categoryOptions,
  city,
  cityOptions,
  closedNow,
  copy,
  hasActiveCoupon,
  hideCategory,
  openNow,
  topRankingOnly,
  sort,
  sortOptions,
  subtitle,
  onArea,
  onCategory,
  onCity,
  onClose,
  onReset,
  onSort,
  onToggleCoupon,
  onToggleClosedNow,
  onToggleOpenNow,
  onToggleTopRanking,
}: {
  area: string;
  areaOptions: FilterOption[];
  applyLabel: string;
  category: string;
  categoryOptions: FilterOption[];
  city: string;
  cityOptions: FilterOption[];
  closedNow: boolean;
  copy: VenueSearchCopy;
  hasActiveCoupon: boolean;
  hideCategory?: boolean;
  openNow: boolean;
  topRankingOnly: boolean;
  sort: DiscoverySort;
  sortOptions: Array<{ value: DiscoverySort; label: string }>;
  subtitle: string;
  onArea: (value: string) => void;
  onCategory: (value: string) => void;
  onCity: (value: string) => void;
  onClose: () => void;
  onReset: () => void;
  onSort: (value: DiscoverySort) => void;
  onToggleCoupon: () => void;
  onToggleClosedNow: () => void;
  onToggleOpenNow: () => void;
  onToggleTopRanking: () => void;
}) {
  const sheet = (
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
            <h2 id="venue-filter-title">{copy.filterTitle}</h2>
            <p>{subtitle}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={copy.filterClose}>
            <X size={18} />
          </button>
        </header>

        <div className="venue-filter-scroll">
          <VenueFilterChipGroup
            label={copy.chooseCity}
            options={cityOptions}
            value={city}
            onChange={onCity}
          />
          <VenueFilterChipGroup
            label={copy.filterArea}
            options={areaOptions}
            value={area}
            onChange={onArea}
          />
          {!hideCategory ? (
            <VenueFilterChipGroup
              label={copy.filterCategory}
              options={categoryOptions}
              value={category}
              onChange={onCategory}
            />
          ) : null}

          <section className="venue-filter-group" aria-label={copy.filterNeeds}>
            <h3>{copy.filterNeeds}</h3>
            <div>
              <button type="button" className={openNow ? "is-active" : ""} onClick={onToggleOpenNow}>
                {copy.openNow}
              </button>
              <button type="button" className={closedNow ? "is-active" : ""} onClick={onToggleClosedNow}>
                {copy.closedNow}
              </button>
              <button
                type="button"
                className={hasActiveCoupon ? "is-active" : ""}
                onClick={onToggleCoupon}
              >
                {copy.hasDeals}
              </button>
              <button
                type="button"
                className={topRankingOnly ? "is-active" : ""}
                onClick={onToggleTopRanking}
              >
                {copy.topRanking}
              </button>
            </div>
          </section>

          <VenueFilterChipGroup
            label={copy.sortLabel.replace(":", "")}
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
            {copy.resetFilters}
          </button>
          <button
            type="button"
            className="venue-filter-apply"
            data-testid="venue-filter-submit"
            onClick={onClose}
          >
            {applyLabel}
          </button>
        </footer>
      </section>
    </div>
  );

  return createPortal(sheet, document.body);
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

function VenueResultCard({
  venue,
  copy,
  isFavorite,
  onToggleFavorite,
}: {
  venue: VenueView;
  copy: VenueSearchCopy;
  isFavorite: boolean;
  onToggleFavorite: (venue: VenueView) => void;
}) {
  const handleFavoriteClick = (event: React.MouseEvent | React.KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onToggleFavorite(venue);
  };

  return (
    <Link href={`/stores/${venue.id}`} className="venue-card">
      <div
        className="venue-card-media"
        aria-label={`${copy.venuePhoto} ${venue.name}`}
        style={{ backgroundImage: `url(${JSON.stringify(venue.image)})` }}
      >
        <div className="venue-image-shade" />
        <span className={`venue-status is-${venue.statusTone}`}>
          <span />
          {venue.statusLabel}
        </span>
        <span className="venue-deal">{venue.dealLabel}</span>
        <span
          className={`venue-heart ${isFavorite ? "is-active" : ""}`}
          role="button"
          tabIndex={0}
          aria-label={isFavorite ? copy.unsaveVenue : copy.saveVenue}
          aria-pressed={isFavorite}
          onClick={handleFavoriteClick}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") handleFavoriteClick(event);
          }}
        >
          <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
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
          {copy.bookTable}
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
    background: var(--vy-bg);
    color: var(--vy-text);
    font-family: var(--nl-font-sans);
  }

  .nl-page-content:has(.venue-search-page) {
    padding-bottom: 0 !important;
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
    color: var(--vy-text);
    font-size: 30px;
    line-height: 1.05;
    font-weight: 800;
    letter-spacing: 0;
  }

  .venue-search-title p {
    margin: 8px 0 0;
    color: var(--vy-muted);
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

  .venue-search-field {
    position: relative;
    min-width: 0;
  }

  .venue-search-input,
  .venue-city-select,
  .venue-find-button,
  .venue-sort-select {
    min-height: 56px;
    border: 1px solid var(--vy-border-gold-32);
    border-radius: 14px;
    background: var(--vy-surface-1);
    color: var(--vy-gold-pale);
  }

  .venue-search-input {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 0 18px;
  }

  .venue-search-input svg {
    color: var(--vy-gold);
    flex: none;
  }

  .venue-search-input input {
    width: 100%;
    min-width: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: var(--vy-text);
    font-size: 15px;
    font-weight: 600;
  }

  .venue-search-input input::placeholder {
    color: var(--vy-muted);
  }

  .venue-filter-icon {
    width: 38px;
    height: 38px;
    display: inline-grid;
    place-items: center;
    flex: none;
    border: 1px solid var(--vy-border-gold-32);
    border-radius: 11px;
    background: var(--vy-surface-2);
    color: var(--vy-gold);
    padding: 0;
    cursor: pointer;
  }

  .venue-filter-icon:hover,
  .venue-filter-icon:focus-visible,
  .venue-filter-icon.is-active {
    border-color: var(--vy-border-gold-40);
    background: var(--vy-gold-soft-bg);
    color: var(--vy-gold-pale);
    outline: 0;
  }

  .venue-desktop-filter-popover {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    z-index: 80;
    width: min(640px, calc(100vw - 52px));
    overflow: hidden;
    border: 1px solid var(--vy-border-gold-32);
    border-radius: 18px;
    background: var(--vy-surface);
    color: var(--vy-text);
    box-shadow: 0 24px 70px -34px rgba(0, 0, 0, .72);
  }

  .venue-desktop-filter-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
    padding: 18px 18px 14px;
    border-bottom: 1px solid var(--vy-border);
    background:
      radial-gradient(circle at 20% 0%, rgba(212, 178, 106, .18), transparent 34%),
      var(--vy-surface-1);
  }

  .venue-desktop-filter-head span {
    display: block;
    color: var(--vy-gold);
    font-size: 10px;
    font-weight: 900;
    letter-spacing: .14em;
    text-transform: uppercase;
  }

  .venue-desktop-filter-head strong {
    display: block;
    margin-top: 5px;
    color: var(--vy-text);
    font-size: 20px;
    line-height: 1.1;
    font-weight: 900;
  }

  .venue-desktop-filter-head p {
    margin: 6px 0 0;
    color: var(--vy-muted);
    font-size: 12.5px;
    font-weight: 700;
  }

  .venue-desktop-filter-head button {
    width: 34px;
    height: 34px;
    display: inline-grid;
    place-items: center;
    flex: none;
    border: 1px solid var(--vy-border);
    border-radius: 50%;
    background: var(--vy-surface-2);
    color: var(--vy-muted);
    cursor: pointer;
  }

  .venue-desktop-filter-body {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px 18px;
    padding: 16px 18px 14px;
  }

  .venue-desktop-filter-section {
    min-width: 0;
  }

  .venue-desktop-filter-section.is-wide {
    grid-column: 1 / -1;
  }

  .venue-desktop-filter-section h3 {
    margin: 0 0 9px;
    color: var(--vy-text);
    font-size: 12.5px;
    line-height: 1.2;
    font-weight: 900;
  }

  .venue-desktop-filter-options {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .venue-desktop-filter-options button {
    min-height: 34px;
    border: 1px solid var(--vy-border);
    border-radius: 999px;
    background: var(--vy-surface-2);
    color: var(--vy-muted);
    padding: 0 13px;
    font-family: var(--nl-font-sans);
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
  }

  .venue-desktop-filter-options button:hover,
  .venue-desktop-filter-options button:focus-visible {
    border-color: var(--vy-border-gold-32);
    color: var(--vy-gold-pale);
    outline: 0;
  }

  .venue-desktop-filter-options button.is-active {
    border-color: transparent;
    background: linear-gradient(135deg, #f4e3b4, #d4b26a 55%, #b6924a);
    color: var(--vy-on-gold);
    box-shadow: 0 14px 30px -24px rgba(212, 178, 106, .72);
  }

  .venue-desktop-filter-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    padding: 14px 18px 18px;
    border-top: 1px solid var(--vy-border);
    background: var(--vy-surface-1);
  }

  .venue-desktop-filter-actions button {
    min-height: 40px;
    border-radius: 11px;
    font-family: var(--nl-font-sans);
    font-size: 12.5px;
    font-weight: 900;
    cursor: pointer;
  }

  .venue-desktop-filter-reset {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    border: 1px solid var(--vy-border);
    background: var(--vy-surface-2);
    color: var(--vy-muted);
    padding: 0 13px;
  }

  .venue-desktop-filter-apply {
    min-width: 150px;
    border: 0;
    background: linear-gradient(135deg, #f4e3b4, #d4b26a 55%, #b6924a);
    color: var(--vy-on-gold);
    padding: 0 18px;
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
    color: var(--vy-gold-pale);
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
    color: var(--vy-muted);
    padding: 0;
    font: inherit;
    white-space: nowrap;
    cursor: pointer;
  }

  .venue-city-current {
    overflow: hidden;
    max-width: 74px;
    color: var(--vy-gold-pale);
    text-overflow: ellipsis;
  }

  .venue-city-menu,
  .venue-sort-menu {
    position: absolute;
    top: calc(100% + 8px);
    z-index: 40;
    overflow: hidden;
    border: 1px solid var(--vy-border-gold-32);
    border-radius: 12px;
    background: var(--vy-surface-2);
    box-shadow: var(--vy-shadow);
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
    border-bottom: 1px solid var(--vy-border);
    background: transparent;
    color: var(--vy-muted);
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
    background: var(--vy-gold-soft-bg);
    color: var(--vy-gold-pale);
    outline: 0;
  }

  .venue-find-button {
    cursor: pointer;
    border-color: transparent;
    background: linear-gradient(135deg, #f4e3b4, #d4b26a 55%, #b6924a);
    color: var(--vy-on-gold);
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
    border: 1px solid var(--vy-border);
    border-radius: 999px;
    background: var(--vy-surface-2);
    color: var(--vy-muted);
    padding: 0 17px;
    font-size: 12px;
    font-weight: 800;
    white-space: nowrap;
    cursor: pointer;
  }

  .venue-chip.is-active {
    border-color: rgba(244, 227, 180, .72);
    background: linear-gradient(135deg, #f4e3b4, #d4b26a 55%, #b6924a);
    color: var(--vy-on-gold);
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
    color: var(--vy-muted);
    font-size: 14px;
    font-weight: 600;
  }

  .venue-result-bar strong {
    color: var(--vy-text);
    font-weight: 900;
  }

  .venue-sort-select {
    min-height: 30px;
    border: 0;
    background: transparent;
    color: var(--vy-muted);
    padding: 0;
    min-width: 128px;
  }

  .venue-sort-trigger strong,
  .venue-sort-trigger svg {
    color: var(--vy-gold);
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
    border: 1px solid var(--vy-border-gold-12);
    border-radius: 18px;
    background: var(--vy-surface-2);
    color: inherit;
    text-decoration: none;
    box-shadow: var(--vy-shadow-card);
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
    min-height: 22px;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    border: 1px solid rgba(212, 178, 106, .42);
    border-radius: 999px;
    background: rgba(42, 32, 16, .78);
    color: var(--vy-gold-pale);
    padding: 0 9px;
    font-size: 10px;
    font-weight: 900;
  }

  .venue-status.is-open {
    border-color: rgba(58, 222, 143, .42);
    background: rgba(9, 32, 22, .78);
    color: #8df0ba;
  }

  .venue-status.is-closed {
    border-color: rgba(212, 178, 106, .46);
    background: rgba(42, 32, 16, .8);
    color: #f0d481;
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
    color: var(--vy-on-gold);
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
    border: 1.5px solid rgba(255, 255, 255, .92);
    border-radius: 50%;
    background: rgba(12, 12, 15, .22);
    color: #ffffff;
    backdrop-filter: blur(8px);
    box-shadow: 0 8px 22px rgba(0, 0, 0, .28);
    cursor: pointer;
  }

  .venue-heart.is-active {
    border-color: rgba(255, 255, 255, .95);
    background: rgba(12, 12, 15, .28);
    color: #ff3d71;
  }

  html.vy-light .venue-heart {
    border-color: rgba(151, 112, 37, .42);
    background: rgba(255, 248, 230, .76);
    color: #7a5a24;
    box-shadow: 0 10px 24px rgba(86, 62, 18, .18);
  }

  html.vy-light .venue-heart.is-active {
    border-color: rgba(229, 49, 103, .42);
    background: rgba(255, 232, 241, .88);
    color: #e53167;
  }

  .venue-heart:focus-visible {
    outline: 2px solid var(--vy-gold-pale);
    outline-offset: 2px;
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
    color: var(--vy-text);
    font-size: 22px;
    line-height: 1.1;
    font-weight: 850;
    letter-spacing: 0;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .venue-meta {
    margin: 7px 0 0;
    color: var(--vy-muted);
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
    border: 1px solid var(--vy-border);
    border-radius: 7px;
    background: var(--vy-surface-2);
    color: var(--vy-muted);
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
    color: var(--vy-muted);
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
    color: var(--vy-on-gold);
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
    border: 1px solid var(--vy-border-gold-12);
    border-radius: 18px;
    background: var(--vy-surface-1);
    padding: 28px;
    color: var(--vy-muted);
  }

  .venue-empty strong {
    color: var(--vy-text);
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
    z-index: 320;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    background: rgba(6, 6, 8, .68);
    color: var(--vy-text);
    padding: 0 12px;
  }

  .venue-filter-sheet {
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
    overflow: hidden;
    border: 1px solid rgba(212, 178, 106, .2);
    border-radius: 24px;
    background: #121116;
    box-shadow: 0 -20px 50px -20px rgba(0, 0, 0, .7);
    animation: venue-filter-sheet-in .28s var(--vy-motion-ease, cubic-bezier(.2, .8, .2, 1)) both;
  }

  @keyframes venue-filter-sheet-in {
    from {
      opacity: 0;
      transform: translate3d(0, 18px, 0);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
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
    border-bottom: 1px solid var(--vy-border);
  }

  .venue-filter-head h2 {
    margin: 0;
    color: var(--vy-text);
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
    border: 1px solid var(--vy-border);
    border-radius: 50%;
    background: var(--vy-surface-1);
    color: var(--vy-text);
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
    color: var(--vy-text);
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
    border: 1px solid var(--vy-border);
    border-radius: 16px;
    background: var(--vy-surface-2);
    color: var(--vy-muted);
    padding: 8px 14px;
    font-family: var(--nl-font-sans);
    font-size: 12.5px;
    font-weight: 700;
    cursor: pointer;
  }

  .venue-filter-group button.is-active {
    border-color: transparent;
    background: linear-gradient(135deg, #f0dda8, #d4b26a);
    color: var(--vy-on-gold);
    font-weight: 850;
  }

  .venue-filter-actions {
    display: grid;
    grid-template-columns: minmax(126px, .98fr) minmax(0, 1.62fr);
    gap: 10px;
    padding: 12px 18px calc(12px + env(safe-area-inset-bottom));
    border-top: 1px solid var(--vy-border);
    background: var(--vy-surface-1);
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
    border: 1px solid var(--vy-border);
    background: var(--vy-surface-1);
    color: var(--vy-muted);
    padding: 0 12px;
    white-space: nowrap;
  }

  .venue-filter-reset svg {
    flex: none;
  }

  .venue-filter-apply {
    border: 0;
    background: linear-gradient(135deg, #f4e3b4, #d4b26a 55%, #b6924a);
    color: var(--vy-on-gold);
  }

  .venue-location-backdrop {
    position: fixed;
    inset: 0;
    z-index: 390;
    display: grid;
    place-items: center;
    background: rgba(6, 6, 8, .72);
    color: var(--vy-text);
    padding: 20px;
  }

  .venue-location-dialog {
    position: relative;
    width: min(360px, calc(100vw - 34px));
    overflow: hidden;
    border: 1px solid rgba(212, 178, 106, .22);
    border-radius: 20px;
    background:
      radial-gradient(circle at 18% 0%, rgba(212, 178, 106, .18), transparent 34%),
      #121116;
    box-shadow: 0 26px 70px -30px rgba(0, 0, 0, .86);
    padding: 22px 18px 18px;
    text-align: center;
  }

  .venue-location-close {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 32px;
    height: 32px;
    display: inline-grid;
    place-items: center;
    border: 1px solid var(--vy-border);
    border-radius: 50%;
    background: var(--vy-surface-1);
    color: var(--vy-muted);
    cursor: pointer;
  }

  .venue-location-icon {
    width: 52px;
    height: 52px;
    display: inline-grid;
    place-items: center;
    border: 1px solid rgba(212, 178, 106, .36);
    border-radius: 16px;
    background: rgba(212, 178, 106, .12);
    color: var(--vy-gold);
    margin-bottom: 14px;
  }

  .venue-location-dialog h2 {
    margin: 0;
    color: var(--vy-text);
    font-size: 19px;
    line-height: 1.18;
    font-weight: 900;
  }

  .venue-location-dialog p {
    margin: 10px 0 0;
    color: var(--vy-muted);
    font-size: 13px;
    line-height: 1.45;
    font-weight: 650;
  }

  .venue-location-actions {
    display: grid;
    grid-template-columns: .86fr 1.14fr;
    gap: 10px;
    margin-top: 18px;
  }

  .venue-location-actions button {
    min-height: 42px;
    border-radius: 12px;
    font-family: var(--nl-font-sans);
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
  }

  .venue-location-secondary {
    border: 1px solid var(--vy-border);
    background: var(--vy-surface-1);
    color: var(--vy-muted);
  }

  .venue-location-primary {
    border: 0;
    background: linear-gradient(135deg, #f4e3b4, #d4b26a 55%, #b6924a);
    color: var(--vy-on-gold);
  }

  html.vy-light .venue-filter-backdrop {
    background: rgba(35, 27, 14, .32);
    color: #241a0a;
  }

  html.vy-light .venue-filter-sheet {
    border-color: rgba(150, 116, 52, .2);
    background: linear-gradient(180deg, #fffaf1 0%, #f7f0e4 100%);
    box-shadow: 0 -22px 54px -28px rgba(62, 42, 16, .46);
  }

  html.vy-light .venue-filter-handle {
    background: rgba(150, 116, 52, .24);
  }

  html.vy-light .venue-filter-head,
  html.vy-light .venue-filter-actions {
    border-color: rgba(150, 116, 52, .14);
  }

  html.vy-light .venue-filter-head h2,
  html.vy-light .venue-filter-group h3 {
    color: #241a0a;
  }

  html.vy-light .venue-filter-head p {
    color: #6f6658;
  }

  html.vy-light .venue-filter-head button,
  html.vy-light .venue-filter-reset {
    border-color: rgba(150, 116, 52, .2);
    background: rgba(255, 255, 255, .82);
    color: #8f6a2a;
    box-shadow: 0 12px 28px -22px rgba(68, 48, 18, .48);
  }

  html.vy-light .venue-filter-scroll {
    scrollbar-color: rgba(150, 116, 52, .46) rgba(150, 116, 52, .12);
  }

  html.vy-light .venue-filter-scroll::-webkit-scrollbar-thumb {
    background: rgba(150, 116, 52, .46);
  }

  html.vy-light .venue-filter-scroll::-webkit-scrollbar-track {
    background: rgba(150, 116, 52, .12);
  }

  html.vy-light .venue-filter-group button {
    border-color: rgba(150, 116, 52, .18);
    background: rgba(255, 255, 255, .86);
    color: #6f6658;
    box-shadow: 0 10px 24px -22px rgba(68, 48, 18, .44);
  }

  html.vy-light .venue-filter-group button.is-active {
    border-color: transparent;
    background: linear-gradient(135deg, #ffe9a8, #d7ae4b);
    color: #241a0a;
    box-shadow: 0 14px 28px -20px rgba(126, 86, 18, .62);
  }

  html.vy-light .venue-filter-actions {
    background: rgba(255, 250, 241, .94);
    box-shadow: 0 -12px 28px -24px rgba(68, 48, 18, .38);
  }

  html.vy-light .venue-filter-apply {
    background: linear-gradient(135deg, #ffe9a8 0%, #d7ae4b 66%, #b98f35 100%);
    color: #241a0a;
  }

  html.vy-light .venue-location-backdrop {
    background: rgba(35, 27, 14, .34);
    color: #241a0a;
  }

  html.vy-light .venue-location-dialog {
    border-color: rgba(150, 116, 52, .24);
    background:
      radial-gradient(circle at 18% 0%, rgba(212, 178, 106, .22), transparent 34%),
      #fffaf1;
    box-shadow: 0 24px 68px -34px rgba(68, 48, 18, .58);
  }

  html.vy-light .venue-location-close,
  html.vy-light .venue-location-secondary {
    border-color: rgba(150, 116, 52, .22);
    background: rgba(255, 255, 255, .82);
    color: #8f6a2a;
  }

  html.vy-light .venue-location-icon {
    border-color: rgba(150, 116, 52, .32);
    background: rgba(255, 232, 170, .52);
    color: #8f6a2a;
  }

  html.vy-light .venue-location-dialog h2 {
    color: #241a0a;
  }

  html.vy-light .venue-location-dialog p {
    color: #6f6658;
  }

  html.vy-light .venue-location-primary {
    background: linear-gradient(135deg, #ffe9a8 0%, #d7ae4b 66%, #b98f35 100%);
    color: #241a0a;
  }

  html.vy-light .venue-filter-icon {
    border-color: rgba(150, 116, 52, .28);
    background: rgba(255, 255, 255, .72);
    color: #9a732d;
    box-shadow: 0 10px 24px -20px rgba(68, 48, 18, .46);
  }

  html.vy-light .venue-filter-icon:hover,
  html.vy-light .venue-filter-icon:focus-visible,
  html.vy-light .venue-filter-icon.is-active {
    border-color: rgba(150, 116, 52, .42);
    background: rgba(255, 248, 229, .96);
    color: #7b591f;
  }

  html.vy-light .venue-desktop-filter-popover {
    border-color: rgba(150, 116, 52, .28);
    background: #fffaf1;
    color: #241a0a;
    box-shadow: 0 24px 70px -36px rgba(68, 48, 18, .52);
  }

  html.vy-light .venue-desktop-filter-head,
  html.vy-light .venue-desktop-filter-actions {
    border-color: rgba(150, 116, 52, .16);
    background:
      radial-gradient(circle at 16% 0%, rgba(212, 178, 106, .24), transparent 34%),
      rgba(255, 248, 236, .94);
  }

  html.vy-light .venue-desktop-filter-head strong,
  html.vy-light .venue-desktop-filter-section h3 {
    color: #241a0a;
  }

  html.vy-light .venue-desktop-filter-head span {
    color: #8f6a2a;
  }

  html.vy-light .venue-desktop-filter-head p,
  html.vy-light .venue-desktop-filter-options button,
  html.vy-light .venue-desktop-filter-reset {
    color: #6f6658;
  }

  html.vy-light .venue-desktop-filter-head button,
  html.vy-light .venue-desktop-filter-options button,
  html.vy-light .venue-desktop-filter-reset {
    border-color: rgba(150, 116, 52, .2);
    background: rgba(255, 255, 255, .86);
  }

  html.vy-light .venue-desktop-filter-options button:hover,
  html.vy-light .venue-desktop-filter-options button:focus-visible {
    border-color: rgba(150, 116, 52, .38);
    color: #8f6a2a;
  }

  html.vy-light .venue-desktop-filter-options button.is-active,
  html.vy-light .venue-desktop-filter-apply {
    background: linear-gradient(135deg, #ffe9a8 0%, #d7ae4b 66%, #b98f35 100%);
    color: #241a0a;
  }

  @media (max-width: 767px) {
    .venue-search-page {
      min-height: auto;
      background: var(--vy-bg);
    }

    .venue-filter-backdrop {
      z-index: 340;
      padding: 0 10px;
    }

    .venue-filter-sheet {
      z-index: 362;
      left: 10px;
      right: 10px;
      bottom: calc(82px + env(safe-area-inset-bottom));
      width: min(430px, calc(100vw - 20px));
      max-height: min(86dvh, calc(100dvh - 94px));
    }

    .venue-search-shell {
      width: 100%;
      padding: 12px 14px 14px;
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
      border: 1px solid var(--vy-border);
      border-radius: 50%;
      color: var(--vy-text);
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

    .venue-desktop-filter-popover {
      display: none;
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
      border: 0;
      border-radius: 6px;
      background: transparent;
      box-shadow: none;
      color: var(--vy-gold);
      flex: none;
    }

    html.vy-light .venue-filter-icon {
      border: 0;
      background: transparent;
      box-shadow: none;
      color: #a1782d;
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
      background: var(--vy-surface-2);
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
