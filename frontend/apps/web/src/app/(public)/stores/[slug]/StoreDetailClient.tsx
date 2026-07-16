"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Info,
  Minus,
  Navigation,
  PhoneCall,
  Play,
  Plus,
  ShieldCheck,
  Star,
  Users,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";
import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { bookingApi, rememberLastBooking, type BookingRecord, type CreateBookingPayload } from "@/lib/api/bookings";
import { ApiError, apiClient, getAuthToken, resolveClientUrl, translateApiMessage } from "@/lib/api/client";
import { requestMemberNotificationsRefresh } from "@/lib/api/notifications";
import { storeFavoriteApi } from "@/lib/api/store-favorite";
import { BookingDateTimeFields } from "@/components/ui/BookingDateTimeFields";
import { useMoneyFormatter } from "@/components/providers/CurrencyProvider";
import type {
  PublicStoreDetail,
  RelatedStore,
  StoreDetailCast,
  StoreGalleryItem,
  StoreOpeningHour,
} from "@/lib/api/store-detail";
import { getAuthUser } from "@/lib/auth/session";
import {
  buildBookingTimeSlots,
  buildScheduledAtFromBookingSlot,
  normalizeStoreOpeningHours,
} from "@/lib/booking-time-slots";
import {
  bookingValidationLimits,
  clampBookingGuestCount,
  normalizeBookingDisplayName,
  normalizeBookingEmail,
  normalizeBookingNote,
  sanitizeBookingDisplayNameInput,
  sanitizeBookingGuestCountInput,
} from "@/lib/booking-validation";
import {
  getBookingDateAfterDays,
  getTodayBookingDate,
  parseBookingDateInput,
} from "@/lib/booking-date";
import {
  buildBookingFieldErrors,
  firstBookingFieldError,
  touchAllBookingFields,
  visibleBookingFieldErrors,
  type BookingFieldErrors,
  type BookingTouchedFields,
  type BookingValidationField,
} from "@/lib/booking-field-validation";
import { translateText } from "@/lib/i18n/client-translations";
import { useActiveLanguage, type LanguageCode } from "@/lib/i18n/use-active-language";
import { hasMemberFavoriteAccess, redirectToLoginForFavorite, requireMemberFavoriteAccess } from "@/lib/member-favorite-auth";
import { isFavoriteStore, writeFavoriteStore } from "@/lib/member-favorites";
import { formatPriceTier, formatPriceTierRange } from "@/lib/price-tier";
import {
  categoryLabels,
  formatDateOption,
  mapEmbedUrl,
  mediaVisualUrl,
  openingText,
  readableName,
  videoEmbedUrl,
  weekdayLabels,
} from "./store-detail.helpers";
import { personalizeRelatedStores, recommendationLabel } from "./store-detail.recommendations";
import { buildStoreStructuredData } from "./store-detail.schema";
import { trackStoreDetailClick } from "./store-detail.tracking";

type StoreDetailClientProps = {
  store: PublicStoreDetail;
};

type LanguageStatCard = {
  label: string;
  value: string;
  title?: string;
};

type BookingCastOption = {
  slug: string;
  label: string;
  meta: string;
  thumbnailUrl?: string | null;
};

type IntroLanguageKey = Extract<LanguageCode, "vi" | "en" | "ja">;

const localizedApiErrorMessage = (
  error: unknown,
  language: LanguageCode,
  fallback: string,
) => {
  const vietnameseMessage =
    error instanceof ApiError
      ? translateApiMessage(error.message, error.status, fallback)
      : error instanceof Error
        ? translateApiMessage(error.message, undefined, fallback)
        : fallback;

  return translateText(vietnameseMessage, language);
};

type IntroLine = {
  key: IntroLanguageKey;
  text: string;
};

const introMarkerPattern = /(?:🇯🇵|🇻🇳|🇬🇧|🇺🇸|\bJP\b|\bVN\b|\bGB\b|\bEN\b)/gi;
const japaneseTextPattern = /[\u3040-\u30ff\u3400-\u9fff]/;
const vietnameseTextPattern =
  /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
const englishTextPattern = /[A-Za-z]/;

const introFallbackOrder: Record<LanguageCode, IntroLanguageKey[]> = {
  vi: ["vi", "en", "ja"],
  en: ["en", "vi", "ja"],
  ja: ["ja", "en", "vi"],
  ko: ["en", "vi", "ja"],
  zh: ["en", "vi", "ja"],
};

const languageLabels: Record<string, string> = {
  en: "Anh",
  ja: "Nhật",
  vi: "Việt",
};

const nationalityLabels: Record<string, string> = {
  ja: "Nhật Bản",
  ko: "Hàn Quốc",
  kr: "Hàn Quốc",
  vi: "Việt Nam",
};

const { bookingDateWindowDays, maxGuests: maxBookingGuests } = bookingValidationLimits;

const bookingFormAutofillBlockProps = {
  autoComplete: "one-time-code",
  "aria-autocomplete": "none",
  "data-1p-ignore": "true",
  "data-bwignore": "true",
  "data-form-type": "other",
  "data-lpignore": "true",
} as const;

const bookingInputAutofillBlockProps = {
  autoComplete: "one-time-code",
  "aria-autocomplete": "none",
  autoCapitalize: "none",
  autoCorrect: "off",
  "data-1p-ignore": "true",
  "data-bwignore": "true",
  "data-form-type": "other",
  "data-lpignore": "true",
  spellCheck: false,
} as const;

const bookingNoteAutofillBlockProps = {
  autoComplete: "one-time-code",
  "aria-autocomplete": "none",
  "data-1p-ignore": "true",
  "data-bwignore": "true",
  "data-form-type": "other",
  "data-lpignore": "true",
  spellCheck: false,
} as const;

const storeBookingFieldNames = {
  guestCount: "nlbf-sd-f3",
  guestEmail: "nlbf-sd-f2",
  guestName: "nlbf-sd-f1",
  note: "nlbf-sd-f4",
  selectedCast: "nlbf-sd-f5",
} as const;

const emptyMediaBackground =
  "linear-gradient(135deg, #18181c 0%, #2f2a22 48%, #111114 100%)";

const normalizeLanguageCode = (language: string) => language.trim().toLowerCase();

const languageToNationality = (language: string) =>
  nationalityLabels[normalizeLanguageCode(language)];

const languageToLabel = (language: string) => {
  const normalized = normalizeLanguageCode(language);
  return languageLabels[normalized] ?? language.trim().toUpperCase();
};

const nationalitiesFromLanguages = (languages: string[]) =>
  Array.from(
    new Set(
      languages
        .map(languageToNationality)
        .filter((nationality): nationality is string => Boolean(nationality)),
    ),
  );

const formatNationalities = (languages: string[], language: LanguageCode) =>
  nationalitiesFromLanguages(languages)
    .map((nationality) => translateText(nationality, language))
    .join(" · ");

const storeCastOptionLabel = (cast: Pick<StoreDetailCast, "publicAlias" | "stageName">) =>
  readableName(cast.publicAlias || cast.stageName);

const storeCastOptionMeta = (
  cast: Pick<StoreDetailCast, "publicHeadline" | "languages">,
  language: LanguageCode,
) =>
  [
    cast.publicHeadline ? translateText(cast.publicHeadline, language) : "",
    formatNationalities(cast.languages, language) || cast.languages.filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join(" - ");

const localizedStoreParts = (parts: Array<string | null | undefined>, language: LanguageCode) =>
  parts
    .filter((part): part is string => Boolean(part))
    .map((part) => translateText(part, language))
    .join(" · ");

const formatStoreCastCount = (count: number, language: LanguageCode) =>
  translateText(`${count} cast`, language);

const markerToIntroKey = (marker: string) => {
  const normalized = marker.toUpperCase();
  if (marker === "🇯🇵" || normalized === "JP") return "ja";
  if (marker === "🇻🇳" || normalized === "VN") return "vi";
  if (marker === "🇬🇧" || marker === "🇺🇸" || normalized === "GB" || normalized === "EN") {
    return "en";
  }
  return null;
};

const normalizeIntroSource = (description?: string | null) =>
  description
    ?.replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .trim();

function buildIntroLines(description?: string | null): IntroLine[] {
  const fallback = "Không gian, dịch vụ và cast của quán sẽ được cập nhật trước khi nhận đặt chỗ.";
  const source = normalizeIntroSource(description);

  if (!source) {
    return [{ key: "vi", text: fallback }];
  }

  const markers = [...source.matchAll(introMarkerPattern)];

  if (markers.length) {
    const byLanguage = new Map<IntroLine["key"], string>();

    markers.forEach((match, index) => {
      const key = markerToIntroKey(match[0]);
      if (!key || byLanguage.has(key)) return;

      const start = (match.index ?? 0) + match[0].length;
      const end = markers[index + 1]?.index ?? source.length;
      const text = source.slice(start, end).trim();
      if (text) byLanguage.set(key, text);
    });

    const markedLines = (["ja", "en", "vi"] as const)
      .map((key) => {
        const text = byLanguage.get(key);
        return text ? { key, text } : null;
      })
      .filter((line): line is IntroLine => Boolean(line));

    if (markedLines.length) return markedLines;
  }

  const chunks = source
    .split(/\n{2,}|(?<=[。.!?])\s+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
  const japaneseLine = chunks.filter((chunk) => japaneseTextPattern.test(chunk)).join(" ");
  const englishLine = chunks
    .filter(
      (chunk) =>
        englishTextPattern.test(chunk) &&
        !vietnameseTextPattern.test(chunk) &&
        !japaneseTextPattern.test(chunk),
    )
    .join(" ");
  const vietnameseLine = chunks.filter((chunk) => vietnameseTextPattern.test(chunk)).join(" ");
  const detectedLines: IntroLine[] = [
    japaneseLine ? { key: "ja", text: japaneseLine } : null,
    englishLine ? { key: "en", text: englishLine } : null,
    vietnameseLine ? { key: "vi", text: vietnameseLine } : null,
  ].filter((line): line is IntroLine => Boolean(line));

  return detectedLines.length ? detectedLines : [{ key: "vi", text: source }];
}

function selectIntroText(lines: IntroLine[], language: LanguageCode) {
  for (const key of introFallbackOrder[language]) {
    const line = lines.find((item) => item.key === key);
    if (line?.text) return line.text;
  }

  return lines[0]?.text ?? "";
}

function IntroCopy({ text }: { text: string }) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="intro-copy">
      {(paragraphs.length ? paragraphs : [text]).map((paragraph, index) => (
        <p key={`${paragraph.slice(0, 24)}-${index}`}>{paragraph}</p>
      ))}
    </div>
  );
}

const plainMapsUrl = (store: PublicStoreDetail) => {
  if (store.mapUrl) return store.mapUrl;
  if (typeof store.latitude === "number" && typeof store.longitude === "number") {
    return `https://www.google.com/maps?q=${store.latitude},${store.longitude}`;
  }

  return "";
};

const storeAddressText = (store: PublicStoreDetail) =>
  store.address || [store.area?.name, store.district, store.city].filter(Boolean).join(", ");

const imageBackground = (url: string) =>
  `linear-gradient(180deg, rgba(12,12,15,.05), rgba(12,12,15,.66)), url("${url}")`;

const galleryImageUrl = (media?: StoreGalleryItem | null, fallback?: StoreGalleryItem | null) => {
  const mediaUrl = mediaVisualUrl(media);
  if (mediaUrl) return mediaUrl;

  const fallbackUrl = mediaVisualUrl(fallback);
  if (fallbackUrl) return fallbackUrl;

  return "";
};

const galleryBackground = (media?: StoreGalleryItem | null, fallback?: StoreGalleryItem | null) => {
  const url = galleryImageUrl(media, fallback);
  return url ? imageBackground(url) : emptyMediaBackground;
};

const rawOpeningSummary = (store: PublicStoreDetail) => {
  const value = (store.openingHours as Record<string, unknown> | null | undefined)?.summary;
  return typeof value === "string" && value.trim() ? value.trim() : null;
};

const priceRangeText = (store: PublicStoreDetail) => {
  const values = store.priceReference.items
    .map((item) => item.amountVnd)
    .filter((value): value is number => typeof value === "number" && value > 0);

  return formatPriceTierRange(values, store.priceReference.startingFromVnd);
};

const storeTimeZone = "Asia/Bangkok";
const storeDayMinutes = 24 * 60;
const weekdayKeys = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;
type WeekdayKey = (typeof weekdayKeys)[number];

const weekdayByShortName: Record<string, WeekdayKey> = {
  sun: "sunday",
  mon: "monday",
  tue: "tuesday",
  wed: "wednesday",
  thu: "thursday",
  fri: "friday",
  sat: "saturday",
};

const todayKey = (date = new Date()) => {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: storeTimeZone,
    weekday: "short",
  })
    .format(date)
    .toLowerCase();

  return weekdayByShortName[weekday] ?? weekdayKeys[date.getDay()] ?? "monday";
};

const currentStoreMinutes = (date: Date) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: storeTimeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0") % 24;
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");

  return hour * 60 + minute;
};

const parseOpeningTime = (value?: string | null) => {
  if (!value) return null;

  const match = value.trim().match(/^(\d{1,2})(?::(\d{2}))?/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2] ?? "0");
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
  if (hours === 24) return minutes === 0 ? storeDayMinutes : null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  return hours * 60 + minutes;
};

type OpeningRange = {
  openMinutes: number;
  closeMinutes: number;
};

const openingRangesFromText = (value?: string | null): OpeningRange[] => {
  if (!value) return [];

  return [...value.matchAll(/(\d{1,2})(?::(\d{2}))?\s*[^0-9:]+\s*(\d{1,2})(?::(\d{2}))?/g)]
    .map((match) => {
      const openMinutes = parseOpeningTime(`${match[1]}:${match[2] ?? "00"}`);
      const closeMinutes = parseOpeningTime(`${match[3]}:${match[4] ?? "00"}`);

      return openMinutes === null || closeMinutes === null ? null : { openMinutes, closeMinutes };
    })
    .filter((range): range is OpeningRange => Boolean(range));
};

const openingRangesFromSlot = (slot?: StoreOpeningHour | null): OpeningRange[] => {
  if (!slot || slot.closed) return [];

  const openMinutes = parseOpeningTime(slot.open);
  const closeMinutes = parseOpeningTime(slot.close);
  if (openMinutes !== null && closeMinutes !== null) {
    return [{ openMinutes, closeMinutes }];
  }

  return openingRangesFromText(slot.note);
};

const isOvernightRange = (range: OpeningRange) => range.closeMinutes <= range.openMinutes;

const isStoreMinuteInRange = (minute: number, range: OpeningRange) => {
  if (range.openMinutes === range.closeMinutes) return true;

  if (isOvernightRange(range)) {
    return minute >= range.openMinutes || minute < range.closeMinutes;
  }

  return minute >= range.openMinutes && minute < range.closeMinutes;
};

const previousWeekdayKey = (weekday: WeekdayKey) => {
  const index = weekdayKeys.indexOf(weekday);
  return weekdayKeys[(index + weekdayKeys.length - 1) % weekdayKeys.length] ?? "monday";
};

const isStoreOpenAt = (
  openingHours: Record<string, StoreOpeningHour> | null | undefined,
  summary: string | null,
  date: Date,
) => {
  const currentWeekday = todayKey(date);
  const minutes = currentStoreMinutes(date);
  const previousRanges = openingRangesFromSlot(openingHours?.[previousWeekdayKey(currentWeekday)])
    .filter(isOvernightRange);

  if (previousRanges.some((range) => isStoreMinuteInRange(minutes, range))) {
    return true;
  }

  const todaySlot = openingHours?.[currentWeekday];
  if (todaySlot?.closed) return false;

  const todayRanges = openingRangesFromSlot(todaySlot);
  if (todayRanges.length) {
    return todayRanges.some((range) => isStoreMinuteInRange(minutes, range));
  }

  return openingRangesFromText(summary).some((range) => isStoreMinuteInRange(minutes, range));
};

const getTodayDate = getTodayBookingDate;

const getMaxBookingDate = () => getBookingDateAfterDays(bookingDateWindowDays);

function EmptyState({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="empty-state">
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <p>{body}</p>
      </div>
    </div>
  );
}

function SectionTitle({
  title,
  kicker,
  kickerTone = "label",
  meta,
  id,
}: {
  title: string;
  kicker?: string;
  kickerTone?: "label" | "address";
  meta?: string;
  id?: string;
}) {
  const activeLanguage = useActiveLanguage();
  const localizedTitle = translateText(title, activeLanguage);
  const localizedKicker =
    kicker && kickerTone !== "address" ? translateText(kicker, activeLanguage) : kicker;
  const localizedMeta = meta ? translateText(meta, activeLanguage) : "";

  return (
    <div className="section-title" id={id}>
      <div>
        <h2>{localizedTitle}</h2>
        {localizedKicker ? (
          <span className={kickerTone === "address" ? "section-kicker-address" : undefined}>
            {localizedKicker}
          </span>
        ) : null}
      </div>
      <i aria-hidden="true" />
      {localizedMeta ? <small>{localizedMeta}</small> : null}
    </div>
  );
}

function IconButton({
  label,
  children,
  className,
  onClick,
}: {
  label: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const buttonClassName = ["round-action", className].filter(Boolean).join(" ");

  return (
    <button className={buttonClassName} type="button" aria-label={label} onClick={onClick}>
      {children}
    </button>
  );
}

function CastRail({ store }: { store: PublicStoreDetail }) {
  const activeLanguage = useActiveLanguage();

  if (!store.casts.length) {
    return (
      <EmptyState
        icon={<Users size={20} />}
        title={translateText("Chưa có cast công khai", activeLanguage)}
        body={translateText("Quán sẽ cập nhật hồ sơ cast khi lịch phục vụ sẵn sàng.", activeLanguage)}
      />
    );
  }

  return (
    <div className="cast-rail hscroll">
      {store.casts.slice(0, 10).map((cast) => {
        const avatarUrl = cast.thumbnailUrl || "";

        return (
          <Link className="cast-bubble" key={cast.id} href={`/casts/${cast.slug}`}>
            <span
              className="cast-avatar"
              style={{
                backgroundImage: avatarUrl ? imageBackground(avatarUrl) : emptyMediaBackground,
              }}
            />
            <strong>{cast.publicAlias || cast.stageName}</strong>
            <small>
              <Star size={11} fill="currentColor" />
              {formatNationalities(cast.languages, activeLanguage) || translateText("Cast", activeLanguage)}
            </small>
          </Link>
        );
      })}
    </div>
  );
}

function PriceMenu({ store }: { store: PublicStoreDetail }) {
  const activeLanguage = useActiveLanguage();
  const { formatMoney } = useMoneyFormatter(activeLanguage);
  const items = store.priceReference.items;
  const menuNote = items.length
    ? store.priceReference.note ||
      translateText(
        "Giá chỉ dùng để tham khảo, có thể thay đổi theo ngày và khung giờ.",
        activeLanguage,
      )
    : null;
  const menuGroups = Array.from(
    new Set(items.map((item) => item.group).filter((group): group is string => Boolean(group))),
  );

  return (
    <section className="menu-panel">
      {menuGroups.length ? (
        <div className="menu-chips hscroll" aria-label={translateText("Nhóm thực đơn", activeLanguage)}>
          {menuGroups.map((chip, index) => (
            <span className={index === 0 ? "active" : undefined} key={chip}>
              {translateText(chip, activeLanguage)}
            </span>
          ))}
        </div>
      ) : null}

      <div className="menu-list">
        {items.length ? (
          items.map((item, index) => (
            <div className="menu-row" key={`${item.label}-${item.amountVnd ?? index}`}>
              <span
                className="menu-photo"
                style={{
                  backgroundImage: item.imageUrl ? imageBackground(item.imageUrl) : emptyMediaBackground,
                }}
                aria-hidden="true"
              />
              <span className="menu-copy">
                <strong>
                  {item.label}
                  {item.hot ? <em>HOT</em> : null}
                </strong>
                <small>
                  {item.note
                    ? translateText(item.note, activeLanguage)
                    : item.group
                      ? translateText(item.group, activeLanguage)
                      : translateText(
                          item.unit === "hour" ? "Giá tham khảo theo giờ" : "Giá tham khảo tại quán",
                          activeLanguage,
                        )}
                </small>
              </span>
              <b>
                {typeof item.amountVnd === "number" && item.amountVnd > 0
                  ? formatMoney(item.amountVnd)
                  : item.displayPrice || formatPriceTier(item.amountVnd)}
                {item.unit === "hour" ? translateText("/giờ", activeLanguage) : ""}
              </b>
            </div>
          ))
        ) : (
          <EmptyState
            icon={<WalletCards size={20} />}
            title={translateText("Chưa có bảng giá", activeLanguage)}
            body={translateText("Quán chưa công khai thực đơn tham khảo.", activeLanguage)}
          />
        )}
      </div>

      {menuNote ? (
        <div className="menu-note">
          <Info size={15} />
          <span>{menuNote}</span>
        </div>
      ) : null}
    </section>
  );
}

function HoursList({
  store,
  today,
  openingHours,
}: {
  store: PublicStoreDetail;
  today: string;
  openingHours: ReturnType<typeof normalizeStoreOpeningHours>;
}) {
  const activeLanguage = useActiveLanguage();
  const summary = rawOpeningSummary(store);

  if (summary) {
    return (
      <div className="hours-list">
        <div className="today">
          <span>{translateText("Giờ mở cửa", activeLanguage)}</span>
          <strong>{summary}</strong>
        </div>
      </div>
    );
  }

  return (
    <div className="hours-list">
      {weekdayLabels.map(([key, label]) => (
        <div className={key === today ? "today" : undefined} key={key}>
          <span>
            {key === today
              ? `${translateText("Hôm nay", activeLanguage)} · ${translateText(label, activeLanguage)}`
              : translateText(label, activeLanguage)}
          </span>
          <strong>{translateText(openingText(openingHours?.[key]), activeLanguage)}</strong>
        </div>
      ))}
    </div>
  );
}

function MapBlock({
  displayName,
  embedUrl,
  mapsUrl,
  onMapClick,
}: {
  displayName: string;
  embedUrl: string;
  mapsUrl: string;
  onMapClick: () => void;
}) {
  const activeLanguage = useActiveLanguage();

  return (
    <div className="map-block">
      {embedUrl ? (
        <iframe
          title={`${displayName} Google Map`}
          src={embedUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <span className="map-fallback" aria-hidden="true" />
      )}
      {mapsUrl ? (
        <a
          className="map-open-link"
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          onClick={onMapClick}
        >
          <Navigation size={15} />
          {translateText("Chỉ đường", activeLanguage)}
        </a>
      ) : null}
    </div>
  );
}

function BookingFieldError({
  activeLanguage,
  message,
  reserveSpace = false,
}: {
  activeLanguage: LanguageCode;
  message?: string;
  reserveSpace?: boolean;
}) {
  if (!message && !reserveSpace) return null;

  return (
    <span
      className={`booking-field-error${message ? "" : " is-empty"}`}
      aria-live="polite"
      aria-hidden={message ? undefined : true}
    >
      {message ? translateText(message, activeLanguage) : ""}
    </span>
  );
}

function BookingCard({
  store,
  selectedDateIso,
  minDate,
  maxDate,
  selectedTime,
  timeOptions,
  guestCount,
  guestName,
  email,
  note,
  selectedCastSlug,
  castOptions,
  isSubmitting,
  errorMessage,
  fieldErrors,
  activeLanguage,
  onDateSelect,
  onTimeSelect,
  onGuestCountChange,
  onGuestNameChange,
  onEmailChange,
  onNoteChange,
  onCastSelect,
  onFieldTouched,
  onSubmit,
}: {
  store: PublicStoreDetail;
  selectedDateIso: string;
  minDate: string;
  maxDate: string;
  selectedTime: string;
  timeOptions: string[];
  guestCount: number;
  guestName: string;
  email: string;
  note: string;
  selectedCastSlug: string;
  castOptions: BookingCastOption[];
  isSubmitting: boolean;
  errorMessage: string;
  fieldErrors: BookingFieldErrors;
  activeLanguage: LanguageCode;
  onDateSelect: (value: string) => void;
  onTimeSelect: (time: string) => void;
  onGuestCountChange: (guestCount: number) => void;
  onGuestNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onCastSelect: (value: string) => void;
  onFieldTouched: (field: BookingValidationField) => void;
  onSubmit: () => void;
}) {
  const bookingPriceText = priceRangeText(store);

  return (
    <aside className="booking-card" aria-label={translateText("Đặt bàn", activeLanguage)}>
      <form
        {...bookingFormAutofillBlockProps}
        className="booking-card-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="booking-card-head">
          <span>
            <strong>{translateText("Đặt bàn", activeLanguage)}</strong>
            <small>{translateText("Gửi yêu cầu · Admin xác nhận", activeLanguage)}</small>
          </span>
          <b>{bookingPriceText}</b>
        </div>

        <div className="booking-form-grid booking-contact-grid">
          <div className="booking-field-stack">
            <label className="booking-field booking-input-field">
              <span>{translateText("Họ tên", activeLanguage)}</span>
              <input
                {...bookingInputAutofillBlockProps}
                name={storeBookingFieldNames.guestName}
                value={guestName}
                onBlur={() => onFieldTouched("guestName")}
                onChange={(event) => {
                  onFieldTouched("guestName");
                  onGuestNameChange(sanitizeBookingDisplayNameInput(event.target.value));
                }}
                placeholder={translateText("Vui lòng nhập họ tên", activeLanguage)}
              />
            </label>
            <BookingFieldError
              activeLanguage={activeLanguage}
              message={fieldErrors.guestName}
              reserveSpace
            />
          </div>
          <div className="booking-field-stack">
            <label className="booking-field booking-input-field">
              <span>{translateText("Email", activeLanguage)}</span>
              <input
                {...bookingInputAutofillBlockProps}
                type="text"
                name={storeBookingFieldNames.guestEmail}
                value={email}
                onBlur={() => onFieldTouched("email")}
                onChange={(event) => {
                  onFieldTouched("email");
                  onEmailChange(event.target.value);
                }}
                placeholder={translateText("Vui lòng nhập email", activeLanguage)}
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
              />
            </label>
            <BookingFieldError activeLanguage={activeLanguage} message={fieldErrors.email} reserveSpace />
          </div>
        </div>

        <div className="booking-schedule-grid">
          <div className="booking-field-stack">
            <div className="booking-field booking-guest-field">
              <span>{translateText("Số người", activeLanguage)}</span>
              <div className="guest-stepper">
                <button
                  type="button"
                  aria-label={translateText("Giảm số khách", activeLanguage)}
                  onClick={() => {
                    onFieldTouched("guestCount");
                    onGuestCountChange(clampBookingGuestCount(guestCount - 1));
                  }}
                  disabled={guestCount <= 1}
                >
                  <Minus size={15} />
                </button>
                <label className="guest-count-input-wrap">
                  <input
                    {...bookingInputAutofillBlockProps}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    name={storeBookingFieldNames.guestCount}
                    value={String(guestCount)}
                    style={{ width: `${String(guestCount).length}ch` }}
                    onBlur={() => onFieldTouched("guestCount")}
                    onKeyDown={(event) => {
                      if (event.ctrlKey || event.metaKey || event.altKey) return;
                      if (event.key.length === 1 && !/\d/.test(event.key)) event.preventDefault();
                    }}
                    onChange={(event) => {
                      onFieldTouched("guestCount");
                      onGuestCountChange(sanitizeBookingGuestCountInput(event.target.value));
                    }}
                    aria-label={translateText("Số người", activeLanguage)}
                  />
                  <span aria-hidden="true">{translateText("người", activeLanguage)}</span>
                </label>
                <button
                  type="button"
                  aria-label={translateText("Tăng số khách", activeLanguage)}
                  onClick={() => {
                    onFieldTouched("guestCount");
                    onGuestCountChange(clampBookingGuestCount(guestCount + 1));
                  }}
                  disabled={guestCount >= maxBookingGuests}
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>
            <BookingFieldError activeLanguage={activeLanguage} message={fieldErrors.guestCount} reserveSpace />
          </div>

          <BookingDateTimeFields
            className="booking-date-time-fields"
            dateValue={selectedDateIso}
            timeValue={selectedTime}
            timeOptions={timeOptions}
            minDate={minDate}
            maxDate={maxDate}
            onDateChange={(value) => {
              onFieldTouched("bookingDate");
              onDateSelect(value);
            }}
            onTimeChange={(value) => {
              onFieldTouched("bookingTime");
              onTimeSelect(value);
            }}
            emptyMessage="Quán không có khung giờ đặt bàn trong ngày này."
            dateError={fieldErrors.bookingDate}
            timeError={fieldErrors.bookingTime}
            fieldClassName="booking-field"
            errorClassName="booking-field-error"
            errorPlacement="outside"
          />
        </div>

        {castOptions.length ? (
          <div className="booking-form-grid booking-cast-grid">
            <StoreBookingCastSelect
              activeLanguage={activeLanguage}
              options={castOptions}
              value={selectedCastSlug}
              onChange={onCastSelect}
            />
          </div>
        ) : null}

        <label className="booking-note-label">
          {translateText("Ghi chú tuỳ chọn", activeLanguage)}
        </label>
        <textarea
          {...bookingNoteAutofillBlockProps}
          className="booking-note-box"
          name={storeBookingFieldNames.note}
          value={note}
          onBlur={() => onFieldTouched("note")}
          onChange={(event) => {
            onFieldTouched("note");
            onNoteChange(event.target.value);
          }}
          placeholder={translateText("Vui lòng nhập ghi chú nếu có", activeLanguage)}
        />
        <BookingFieldError activeLanguage={activeLanguage} message={fieldErrors.note} reserveSpace />

        {errorMessage ? (
          <div className="booking-error" role="alert" aria-live="polite">
            {translateText(errorMessage, activeLanguage)}
          </div>
        ) : null}

        <button
          type="button"
          data-testid="store-booking-cta-sidebar"
          className="primary-action full"
          disabled={isSubmitting || !selectedTime}
          onClick={onSubmit}
        >
          <CalendarDays size={18} />
          {isSubmitting
            ? translateText("Đang gửi yêu cầu...", activeLanguage)
            : translateText("Gửi yêu cầu đặt bàn", activeLanguage)}
        </button>

        <div className="booking-safe">
          <ShieldCheck size={15} />
          <span>
            {translateText(
              "Không thanh toán online · không thu cọc · có thể hủy trước giờ hẹn theo chính sách quán.",
              activeLanguage,
            )}
          </span>
        </div>
      </form>
    </aside>
  );
}

function StoreBookingCastSelect({
  activeLanguage,
  options,
  value,
  onChange,
}: {
  activeLanguage: LanguageCode;
  options: BookingCastOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setOpen] = useState(false);
  const fallbackOption: BookingCastOption = {
    slug: "",
    label: translateText("Không chọn cast", activeLanguage),
    meta: "",
    thumbnailUrl: null,
  };
  const selected = options.find((option) => option.slug === value) ?? fallbackOption;
  const optionList = [fallbackOption, ...options];

  const chooseCast = (slug: string) => {
    onChange(slug);
    setOpen(false);
  };

  return (
    <div className="booking-field booking-cast-field">
      <span className="booking-cast-label">{translateText("Cast đã chọn", activeLanguage)}</span>
      <div
        className="booking-cast-select"
        onBlur={(event) => {
          const nextTarget = event.relatedTarget;
          if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
            setOpen(false);
          }
        }}
      >
        <button
          type="button"
          className="booking-cast-trigger"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setOpen((current) => !current)}
        >
          <StoreBookingCastAvatar option={selected} active={!selected.slug} size={34} />
          <span className="booking-cast-copy">
            <strong>{selected.label}</strong>
            {selected.meta ? <small>{selected.meta}</small> : null}
          </span>
          <ChevronDown size={18} className="booking-cast-chevron" aria-hidden="true" />
        </button>

        {isOpen ? (
          <div className="booking-cast-menu" role="listbox">
            {optionList.map((option) => {
              const isSelected = option.slug === value;

              return (
                <button
                  key={option.slug || "none"}
                  type="button"
                  className="booking-cast-option"
                  role="option"
                  aria-selected={isSelected}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => chooseCast(option.slug)}
                >
                  <StoreBookingCastAvatar option={option} active={!option.slug} size={30} />
                  <span className="booking-cast-copy">
                    <strong>{option.label}</strong>
                    {option.meta ? <small>{option.meta}</small> : null}
                  </span>
                  {isSelected ? <Check size={16} className="booking-cast-check" aria-hidden="true" /> : null}
                </button>
              );
            })}
          </div>
        ) : null}

        <select
          aria-hidden="true"
          tabIndex={-1}
          name={storeBookingFieldNames.selectedCast}
          value={value}
          autoComplete="off"
          className="booking-cast-native-select"
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">{translateText("Không chọn cast", activeLanguage)}</option>
          {options.map((option) => (
            <option key={option.slug} value={option.slug}>
              {option.meta ? `${option.label} - ${option.meta}` : option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function StoreBookingCastAvatar({
  active,
  option,
  size,
}: {
  active: boolean;
  option: BookingCastOption;
  size: number;
}) {
  const initial = option.label.trim().charAt(0).toUpperCase() || "C";

  return (
    <span
      className={[
        "booking-cast-avatar",
        active ? "is-empty" : "",
        option.thumbnailUrl ? "has-image" : "",
      ].filter(Boolean).join(" ")}
      style={{
        width: size,
        height: size,
        ...(option.thumbnailUrl ? { backgroundImage: `url("${option.thumbnailUrl}")` } : {}),
      }}
      aria-hidden="true"
    >
      {option.slug ? option.thumbnailUrl ? null : initial : <UserRound size={15} />}
    </span>
  );
}

function RelatedStores({
  stores,
  activeLanguage,
}: {
  stores: RelatedStore[];
  activeLanguage: LanguageCode;
}) {
  if (!stores.length) return null;

  return (
    <section className="related-section">
      <SectionTitle title="Quán tương tự" meta="Xem thêm" />
      <div className="related-grid">
        {stores.slice(0, 4).map((related) => (
          <Link className="related-card" key={related.id} href={`/stores/${related.slug}`}>
            <span
              className="related-photo"
              style={{
                backgroundImage: related.thumbnailUrl
                  ? imageBackground(related.thumbnailUrl)
                  : emptyMediaBackground,
              }}
            />
            <span className="related-copy">
              <strong>{readableName(related.name)}</strong>
              <small>{translateText(recommendationLabel(related), activeLanguage)}</small>
              <em>
                {localizedStoreParts(
                  [categoryLabels[related.category] ?? related.category, related.area?.name ?? related.district],
                  activeLanguage,
                )}
              </em>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function StoreDetailClient({ store }: StoreDetailClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const couponId = searchParams.get("couponId") || undefined;
  const activeLanguage = useActiveLanguage();
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState(0);
  const [guestCount, setGuestCount] = useState(4);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState("21:00");
  const [selectedCastSlug, setSelectedCastSlug] = useState("");
  const [statusNow, setStatusNow] = useState(() => new Date());
  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [isMemberBooking, setIsMemberBooking] = useState(false);
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);
  const [bookingErrorMessage, setBookingErrorMessage] = useState("");
  const [bookingTouchedFields, setBookingTouchedFields] = useState<BookingTouchedFields>({});
  const [bookingSubmitAttempted, setBookingSubmitAttempted] = useState(false);
  const [isFavorite, setIsFavorite] = useState(
    () => hasMemberFavoriteAccess() && isFavoriteStore(store.slug),
  );
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const recommendedStores = useMemo(
    () => personalizeRelatedStores(store.relatedStores),
    [store.relatedStores],
  );

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) setPortalTarget(document.body);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setStatusNow(new Date());
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const authUser = getAuthUser();
    const isMemberAccount = authUser?.role?.toUpperCase() === "USER";
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      setIsMemberBooking(isMemberAccount);

      if (isMemberAccount) {
        setGuestName((current) => current || authUser?.displayName || authUser?.email || "");
        setEmail((current) => current || authUser?.email || "");
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    void apiClient<{ recorded: boolean }>("/analytics/profile-view", {
      data: { targetType: "STORE", targetId: store.id },
    }).catch(() => undefined);
  }, [store.id]);

  const displayName = readableName(store.name);
  const rawGallery = store.gallery?.filter((item) => item.url) ?? [];
  const videoGallery = rawGallery.filter((item) => item.type === "VIDEO");
  const gallery = [...videoGallery, ...rawGallery.filter((item) => item.type !== "VIDEO")];
  const heroImage = gallery.find((item) => item.type === "IMAGE") ?? null;
  const selectedMedia = gallery[selectedGalleryIndex] ?? gallery[0] ?? heroImage;
  const heroBackground = galleryBackground(selectedMedia, heroImage);
  const selectedMediaUrl = selectedMedia ? (resolveClientUrl(selectedMedia.url) ?? selectedMedia.url) : "";
  const selectedVideoUrl = selectedMedia?.type === "VIDEO" ? videoEmbedUrl(selectedMediaUrl) : "";
  const selectedVideoIndex =
    selectedMedia?.type === "VIDEO"
      ? selectedGalleryIndex
      : gallery.findIndex((item) => item.type === "VIDEO");
  const shouldShowHeroVideoPreview =
    selectedMedia?.type === "VIDEO" &&
    Boolean(selectedVideoUrl) &&
    !selectedVideoUrl.includes("youtube.com/embed") &&
    !selectedVideoUrl.includes("player.vimeo.com");
  const desktopGalleryTiles = gallery.slice(0, 5);
  const mobileGalleryTiles = gallery;
  const tourMedia = videoGallery;
  const location = localizedStoreParts([store.area?.name, store.district, store.city], activeLanguage);
  const addressText = storeAddressText(store);
  const mapsUrl = plainMapsUrl(store);
  const embedUrl = mapEmbedUrl(store);
  const today = todayKey(statusNow);
  const normalizedOpeningHours = useMemo(
    () => normalizeStoreOpeningHours(store.openingHours),
    [store.openingHours],
  );
  const openingSummary = rawOpeningSummary(store);
  const rawTodayOpening = openingSummary ?? openingText(normalizedOpeningHours?.[today]);
  const todayOpening = translateText(rawTodayOpening, activeLanguage);
  const openNow = isStoreOpenAt(normalizedOpeningHours, openingSummary, statusNow);
  const categoryLabel = translateText(categoryLabels[store.category] ?? store.category, activeLanguage);
  const favoriteAreaLabel = store.area?.name ?? store.district ?? "";
  const favoriteCityLabel = store.cityCode ?? store.city;
  const heroFavoriteImage = galleryImageUrl(heroImage);
  const favoriteSnapshot = {
    slug: store.slug,
    name: displayName,
    categoryLabel,
    areaLabel: favoriteAreaLabel,
    cityLabel: favoriteCityLabel,
    image: heroFavoriteImage,
  };
  const featureChips = [categoryLabel, ...(store.tags ?? []).map((chip) => translateText(chip, activeLanguage))];
  const priceText = priceRangeText(store);
  const bookingCastOptions = useMemo<BookingCastOption[]>(
    () =>
      store.casts.map((cast) => ({
        slug: cast.slug,
        label: storeCastOptionLabel(cast),
        meta: storeCastOptionMeta(cast, activeLanguage),
        thumbnailUrl: cast.thumbnailUrl,
      })),
    [activeLanguage, store.casts],
  );
  const activeSelectedCastSlug = bookingCastOptions.some((option) => option.slug === selectedCastSlug)
    ? selectedCastSlug
    : "";
  const selectedBookingCast = bookingCastOptions.find((option) => option.slug === activeSelectedCastSlug);
  const structuredData = useMemo(() => buildStoreStructuredData(store), [store]);
  const introLines = useMemo(() => buildIntroLines(store.description), [store.description]);
  const introText = useMemo(
    () => selectIntroText(introLines, activeLanguage),
    [activeLanguage, introLines],
  );
  const nationalityNames = Array.from(
    new Set(store.casts.flatMap((cast) => nationalitiesFromLanguages(cast.languages))),
  )
    .slice(0, 3)
    .map((nationality) => translateText(nationality, activeLanguage));
  const nationalityText = nationalityNames.join(" · ");
  const firstNationality = nationalityNames[0] ?? "";
  const nationalityCardText =
    nationalityNames.length > 1 && firstNationality
      ? `${firstNationality} +${nationalityNames.length - 1}`
      : nationalityText;
  const languageCards = useMemo<LanguageStatCard[]>(() => {
    const languageCounts = new Map<string, number>();
    store.casts.forEach((cast) => {
      cast.languages.forEach((language) => {
        const label = languageToLabel(language);
        languageCounts.set(label, (languageCounts.get(label) ?? 0) + 1);
      });
    });

    const totalCasts = Math.max(store.casts.length, 1);
    const cards = [...languageCounts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 2)
      .map(([language, count]) => ({
        label: translateText(`Nói tiếng ${language}`, activeLanguage),
        value: `${Math.round((count / totalCasts) * 100)}%`,
      }));

    return [
      ...cards,
      {
        label: translateText("Quốc tịch cast", activeLanguage),
        value: nationalityCardText || translateText("Đang cập nhật", activeLanguage),
        title: nationalityText || undefined,
      },
    ];
  }, [activeLanguage, nationalityCardText, nationalityText, store.casts]);

  const dateOptions = useMemo(
    () =>
      Array.from({ length: bookingDateWindowDays + 1 }, (_, index) => {
        const iso = getBookingDateAfterDays(index, statusNow);
        const date = parseBookingDateInput(iso) ?? new Date();

        return {
          label: formatDateOption(date),
          iso,
        };
      }),
    [statusNow],
  );
  const selectedDate = dateOptions[selectedDateIndex] ?? {
    label: "",
    iso: getTodayDate(),
  };
  const bookingTimeOptions = useMemo(
    () =>
      buildBookingTimeSlots(normalizedOpeningHours ?? store.openingHours, selectedDate.iso, {
        fallback: "empty",
      }),
    [normalizedOpeningHours, selectedDate.iso, store.openingHours],
  );

  useEffect(() => {
    let nextSelectedTime = selectedTime;
    if (!bookingTimeOptions.length) {
      nextSelectedTime = "";
    } else if (!bookingTimeOptions.includes(selectedTime)) {
      const nextTime = bookingTimeOptions[0];
      if (nextTime) nextSelectedTime = nextTime;
    }

    if (nextSelectedTime === selectedTime) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setSelectedTime(nextSelectedTime);
    });
    return () => {
      cancelled = true;
    };
  }, [bookingTimeOptions, selectedTime]);

  const bookingScheduledAt = buildScheduledAtFromBookingSlot(
    selectedDate.iso,
    selectedTime,
    normalizedOpeningHours ?? store.openingHours,
  );
  const bookingFieldErrors = useMemo(
    () =>
      buildBookingFieldErrors({
        availableTimes: bookingTimeOptions,
        bookingDate: selectedDate.iso,
        bookingTime: selectedTime,
        displayName: normalizeBookingDisplayName(guestName),
        email: normalizeBookingEmail(email),
        guestCount,
        maxDate: getMaxBookingDate(),
        note: normalizeBookingNote(note),
        scheduledAt: bookingScheduledAt,
        todayDate: getTodayDate(),
      }),
    [
      bookingScheduledAt,
      bookingTimeOptions,
      email,
      guestCount,
      guestName,
      note,
      selectedDate.iso,
      selectedTime,
    ],
  );
  const visibleFieldErrors = useMemo(
    () => visibleBookingFieldErrors(bookingFieldErrors, bookingTouchedFields, bookingSubmitAttempted),
    [bookingFieldErrors, bookingSubmitAttempted, bookingTouchedFields],
  );
  const markBookingFieldTouched = (field: BookingValidationField) => {
    setBookingTouchedFields((current) => (current[field] ? current : { ...current, [field]: true }));
    setBookingErrorMessage("");
  };

  const bookingQuery = new URLSearchParams({
    storeId: store.id,
    storeSlug: store.slug,
    storeName: displayName,
    guests: String(guestCount),
    date: selectedDate.iso,
    time: selectedTime,
    ...(activeSelectedCastSlug ? { castSlug: activeSelectedCastSlug } : {}),
    ...(selectedBookingCast?.label ? { castName: selectedBookingCast.label } : {}),
    ...(couponId ? { couponId } : {}),
  });

  const bookingHref = `/dat-cho?${bookingQuery.toString()}`;
  const phoneHref = store.phone ? `tel:${store.phone.replace(/[^\d+]/g, "")}` : "";
  const lightboxMedia = gallery[selectedGalleryIndex] ?? selectedMedia;
  const lightboxMediaUrl = lightboxMedia ? (resolveClientUrl(lightboxMedia.url) ?? lightboxMedia.url) : "";
  const lightboxVideoUrl = lightboxMedia?.type === "VIDEO" ? videoEmbedUrl(lightboxMediaUrl) : "";

  useEffect(() => {
    let ignore = false;
    const syncFavoriteSnapshot = {
      slug: store.slug,
      name: displayName,
      categoryLabel,
      areaLabel: favoriteAreaLabel,
      cityLabel: favoriteCityLabel,
      image: heroFavoriteImage,
    };

    if (!hasMemberFavoriteAccess()) {
      Promise.resolve().then(() => {
        if (!ignore) setIsFavorite(false);
      });
      return () => {
        ignore = true;
      };
    }

    Promise.resolve(isFavoriteStore(syncFavoriteSnapshot.slug)).then((favorited) => {
      if (!ignore) setIsFavorite(favorited);
    });
    storeFavoriteApi
      .getState(syncFavoriteSnapshot.slug)
      .then((state) => {
        if (ignore) return;
        setIsFavorite(state.favorited);
        writeFavoriteStore(syncFavoriteSnapshot, state.favorited);
      })
      .catch(() => undefined);

    return () => {
      ignore = true;
    };
  }, [categoryLabel, displayName, favoriteAreaLabel, favoriteCityLabel, heroFavoriteImage, store.slug]);

  const showPreviousMedia = (event?: ReactMouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    event?.stopPropagation();
    setSelectedGalleryIndex((index) => (index <= 0 ? gallery.length - 1 : index - 1));
  };
  const showNextMedia = (event?: ReactMouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    event?.stopPropagation();
    setSelectedGalleryIndex((index) => (index >= gallery.length - 1 ? 0 : index + 1));
  };
  const preventHeroControlMouseDown = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };
  const toggleFavorite = async () => {
    if (!requireMemberFavoriteAccess()) {
      return;
    }

    const nextValue = !isFavorite;
    setIsFavorite(nextValue);
    writeFavoriteStore(favoriteSnapshot, nextValue);
    trackStoreDetailClick(store, "favorite", { favorited: nextValue });

    try {
      const state = nextValue
        ? await storeFavoriteApi.favorite(store.slug)
        : await storeFavoriteApi.unfavorite(store.slug);
      setIsFavorite(state.favorited);
      writeFavoriteStore(favoriteSnapshot, state.favorited);
    } catch (error) {
      if (error instanceof ApiError && [401, 403].includes(error.status)) {
        setIsFavorite(false);
        writeFavoriteStore(favoriteSnapshot, false);
        redirectToLoginForFavorite();
        return;
      }

      setIsFavorite(!nextValue);
      writeFavoriteStore(favoriteSnapshot, !nextValue);
    }
  };
  const openGallery = (index: number, event?: ReactMouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    event?.stopPropagation();
    if (!gallery.length) return;
    setSelectedGalleryIndex(((index % gallery.length) + gallery.length) % gallery.length);
    setIsLightboxOpen(true);
  };
  const openSelectedVideo = (event: ReactMouseEvent<HTMLButtonElement>) => {
    const videoIndex = selectedMedia?.type === "VIDEO" ? selectedGalleryIndex : selectedVideoIndex;
    if (videoIndex < 0) return;
    openGallery(videoIndex, event);
  };
  const trackBookingClick = (surface: string) =>
    trackStoreDetailClick(store, "booking", {
      surface,
      guests: guestCount,
      date: selectedDate.iso,
      time: selectedTime,
      castSlug: activeSelectedCastSlug || undefined,
    });
  const submitDesktopBooking = async () => {
    if (isBookingSubmitting) return;

    setBookingErrorMessage("");
    setBookingSubmitAttempted(true);
    setBookingTouchedFields(touchAllBookingFields());

    const displayName = normalizeBookingDisplayName(guestName);
    const normalizedEmail = normalizeBookingEmail(email);
    const trimmedNote = normalizeBookingNote(note);
    const scheduledAt = buildScheduledAtFromBookingSlot(
      selectedDate.iso,
      selectedTime,
      normalizedOpeningHours ?? store.openingHours,
    );

    setGuestName(displayName);
    setEmail(normalizedEmail);
    setNote(trimmedNote);

    const validationError = firstBookingFieldError(buildBookingFieldErrors({
      availableTimes: bookingTimeOptions,
      bookingDate: selectedDate.iso,
      bookingTime: selectedTime,
      displayName,
      email: normalizedEmail,
      guestCount,
      maxDate: getMaxBookingDate(),
      note: trimmedNote,
      scheduledAt,
      todayDate: getTodayDate(),
    }));

    if (validationError) {
      return;
    }

    const payload: CreateBookingPayload = {
      storeSlug: store.slug,
      ...(activeSelectedCastSlug ? { castSlug: activeSelectedCastSlug } : {}),
      displayName,
      email: normalizedEmail,
      scheduledAt,
      partySize: guestCount,
      ...(trimmedNote ? { note: trimmedNote } : {}),
      ...(couponId ? { couponId } : {}),
    };

    try {
      setIsBookingSubmitting(true);
      trackBookingClick("desktop-booking-card");
      const currentUser = getAuthUser();
      const shouldUseMemberBooking =
        isMemberBooking && currentUser?.role?.toUpperCase() === "USER" && Boolean(getAuthToken());

      let booking: BookingRecord;
      let savedAsMemberBooking = false;

      if (shouldUseMemberBooking) {
        try {
          booking = await bookingApi.createMemberBooking(payload);
          savedAsMemberBooking = true;
        } catch (error) {
          if (!(error instanceof ApiError) || (error.status !== 401 && error.status !== 403)) {
            throw error;
          }

          booking = await bookingApi.createGuestBooking(payload);
        }
      } else {
        booking = await bookingApi.createGuestBooking(payload);
      }

      rememberLastBooking(booking, savedAsMemberBooking ? undefined : { guestHistory: true });
      if (savedAsMemberBooking) {
        requestMemberNotificationsRefresh();
      }
      router.push(`/xac-nhan?bookingId=${booking.id}`);
    } catch (error) {
      setBookingErrorMessage(
        localizedApiErrorMessage(error, activeLanguage, "Không gửi được yêu cầu đặt bàn."),
      );
    } finally {
      setIsBookingSubmitting(false);
    }
  };

  return (
    <main
      className="store-detail-page"
      data-testid="store-detail-page"
      data-no-scroll-reveal="true"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section className="detail-shell">
        <nav className="desktop-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">{translateText("Trang chủ", activeLanguage)}</Link>
          <span>/</span>
          <Link href="/danh-sach-quan">{translateText("Tìm quán", activeLanguage)}</Link>
          <span>/</span>
          <strong>{displayName}</strong>
        </nav>

        <div className="detail-layout">
          <div className="media-column">
            <section className="hero-panel" style={{ backgroundImage: heroBackground }}>
              {shouldShowHeroVideoPreview ? (
                <video
                  className="hero-video-preview"
                  src={selectedVideoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  aria-hidden="true"
                />
              ) : null}
              <div className="hero-top">
                <Link
                  className="round-action hero-back"
                  href="/danh-sach-quan"
                  aria-label={translateText("Quay lại danh sách quán", activeLanguage)}
                >
                  <ChevronLeft size={20} />
                </Link>
                <div className="hero-actions">
                  <IconButton
                    label={translateText(isFavorite ? "Bỏ lưu quán" : "Lưu quán", activeLanguage)}
                    className={`store-favorite-action${isFavorite ? " is-active" : ""}`}
                    onClick={toggleFavorite}
                  >
                    <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
                  </IconButton>
                </div>
              </div>

              {gallery.length > 1 ? (
                <>
                  <button
                    className="hero-media-nav previous"
                    type="button"
                    aria-label="Media trước"
                    data-testid="store-hero-media-previous"
                    onMouseDown={preventHeroControlMouseDown}
                    onClick={showPreviousMedia}
                  >
                    <ChevronLeft size={30} />
                  </button>
                  <button
                    className="hero-media-nav next"
                    type="button"
                    aria-label="Media sau"
                    data-testid="store-hero-media-next"
                    onMouseDown={preventHeroControlMouseDown}
                    onClick={showNextMedia}
                  >
                    <ChevronRight size={30} />
                  </button>
                </>
              ) : null}

              {selectedMedia?.type === "VIDEO" ? (
                <button
                  className="hero-video-play"
                  type="button"
                  aria-label={translateText("Xem video", activeLanguage)}
                  onMouseDown={preventHeroControlMouseDown}
                  onClick={openSelectedVideo}
                >
                  <Play size={34} fill="currentColor" />
                </button>
              ) : null}

              <div className="hero-name">
                <h1>{displayName}</h1>
                <div>
                  <span>{[categoryLabel, location].filter(Boolean).join(" · ")}</span>
                </div>
              </div>
            </section>

            {mobileGalleryTiles.length ? (
              <div
                className="mobile-gallery-strip"
                aria-label={translateText("Thư viện ảnh của quán", activeLanguage)}
              >
                <div className="mobile-gallery-head">
                  <span>{translateText("Thư viện ảnh", activeLanguage)}</span>
                  <small>
                    {selectedGalleryIndex + 1}/{gallery.length}
                  </small>
                </div>
                <div className="mobile-gallery-rail hscroll">
                  {mobileGalleryTiles.map((item, index) => (
                    <button
                      key={`mobile-${item.id}-${index}`}
                      className={index === selectedGalleryIndex ? "active" : undefined}
                      type="button"
                      style={{ backgroundImage: galleryBackground(item, heroImage) }}
                      aria-label={translateText(`Mở nội dung ${index + 1}`, activeLanguage)}
                      onClick={(event) => openGallery(index, event)}
                    >
                      {item.type === "VIDEO" ? <Play size={14} fill="currentColor" /> : null}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="quick-stats">
              <div>
                <strong>{todayOpening}</strong>
                <span>{translateText("Giờ mở cửa", activeLanguage)}</span>
              </div>
              <i />
              <div>
                <strong>{priceText}</strong>
                <span>{translateText("Khoảng giá", activeLanguage)}</span>
              </div>
              <i />
              <div>
                <strong>{formatStoreCastCount(store.casts.length || 0, activeLanguage)}</strong>
                <span>{translateText("Đang phục vụ", activeLanguage)}</span>
              </div>
            </div>

            <div className="secondary-actions">
              {mapsUrl ? (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackStoreDetailClick(store, "map", { surface: "hero-action" })}
                >
                  <Navigation size={16} />
                  {translateText("Chỉ đường", activeLanguage)}
                </a>
              ) : null}
              {phoneHref ? (
                <a
                  href={phoneHref}
                  onClick={() => trackStoreDetailClick(store, "call", { surface: "hero-action" })}
                >
                  <PhoneCall size={16} />
                  {translateText("Gọi điện", activeLanguage)}
                </a>
              ) : null}
              <a href="#menu">
                <WalletCards size={16} />
                {translateText("Thực đơn", activeLanguage)}
              </a>
            </div>

            {desktopGalleryTiles.length ? (
              <div className="thumb-grid">
                {desktopGalleryTiles.map((item, index) => (
                  <button
                    key={`${item.id}-${index}`}
                    className={index === selectedGalleryIndex ? "active" : undefined}
                    type="button"
                    style={{ backgroundImage: galleryBackground(item, heroImage) }}
                    aria-label={translateText(`Mở nội dung ${index + 1}`, activeLanguage)}
                    onClick={(event) => openGallery(index, event)}
                  >
                    {item.type === "VIDEO" ? <Play size={14} fill="currentColor" /> : null}
                  </button>
                ))}
              </div>
            ) : null}

            {tourMedia.length ? (
              <section className="desktop-only">
                <SectionTitle title="Video quán" meta={`${tourMedia.length} nội dung`} />
                <div className="tour-grid">
                  {tourMedia.slice(0, 4).map((item, index) => (
                    <button
                      className="tour-card"
                      type="button"
                      key={`${item.id}-${index}`}
                      style={{ backgroundImage: galleryBackground(item, heroImage) }}
                      onClick={(event) =>
                        openGallery(gallery.indexOf(item) >= 0 ? gallery.indexOf(item) : index, event)
                      }
                    >
                      <Play size={18} fill="currentColor" />
                      <span>{item.purpose || translateText("Video quán", activeLanguage)}</span>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="desktop-only">
              <SectionTitle title="Vị trí" kicker={addressText || undefined} kickerTone="address" />
              <MapBlock
                displayName={displayName}
                embedUrl={embedUrl}
                mapsUrl={mapsUrl}
                onMapClick={() => trackStoreDetailClick(store, "map", { surface: "desktop-map" })}
              />
            </section>
          </div>

          <div className="info-column">
            <div className="desktop-title">
              <div>
                <h1>{displayName}</h1>
                <p>{[categoryLabel, location].filter(Boolean).join(" · ")}</p>
              </div>
              <b className={openNow ? "open-pill" : "closed-pill"}>
                <i />
                {translateText(openNow ? "Đang mở" : "Đang đóng", activeLanguage)}
              </b>
            </div>

            <div className="desktop-stats">
              <div>
                <strong>{todayOpening}</strong>
                <span>{translateText("Giờ mở cửa", activeLanguage)}</span>
              </div>
              <div>
                <strong>{priceText}</strong>
                <span>{translateText("Khoảng giá", activeLanguage)}</span>
              </div>
              <div>
                <strong>{formatStoreCastCount(store.casts.length, activeLanguage)}</strong>
                <span>{translateText("Đang phục vụ", activeLanguage)}</span>
              </div>
            </div>

            <BookingCard
              store={store}
              selectedDateIso={selectedDate.iso}
              minDate={getTodayDate()}
              maxDate={getMaxBookingDate()}
              selectedTime={selectedTime}
              timeOptions={bookingTimeOptions}
              guestCount={guestCount}
              guestName={guestName}
              email={email}
              note={note}
              selectedCastSlug={activeSelectedCastSlug}
              castOptions={bookingCastOptions}
              isSubmitting={isBookingSubmitting}
              errorMessage={bookingErrorMessage}
              fieldErrors={visibleFieldErrors}
              activeLanguage={activeLanguage}
              onDateSelect={(value) => {
                const nextIndex = dateOptions.findIndex((date) => date.iso === value);
                setSelectedDateIndex(nextIndex >= 0 ? nextIndex : 0);
              }}
              onTimeSelect={setSelectedTime}
              onGuestCountChange={setGuestCount}
              onGuestNameChange={setGuestName}
              onEmailChange={setEmail}
              onNoteChange={setNote}
              onCastSelect={setSelectedCastSlug}
              onFieldTouched={markBookingFieldTouched}
              onSubmit={submitDesktopBooking}
            />

            <section className="desktop-about-inline">
              <div className="feature-chips">
                {featureChips.map((chip) => (
                  <span key={chip}>{chip}</span>
                ))}
              </div>
              <IntroCopy text={introText} />
            </section>

            <section className="mobile-about-section">
              <SectionTitle title="Giới thiệu" />
              <IntroCopy text={introText} />
              <div className="feature-chips">
                {featureChips.map((chip) => (
                  <span key={chip}>{chip}</span>
                ))}
              </div>
              <div className="language-grid">
                {languageCards.map((card) => (
                  <div key={card.label}>
                    <span>{card.label}</span>
                    <strong title={card.title ?? card.value}>{card.value}</strong>
                  </div>
                ))}
              </div>
            </section>

            {tourMedia.length ? (
              <section className="mobile-only">
                <SectionTitle title="Video quán" meta={`${tourMedia.length} nội dung`} />
                <div className="tour-rail hscroll">
                  {tourMedia.slice(0, 6).map((item, index) => (
                    <button
                      className="tour-card"
                      type="button"
                      key={`${item.id}-${index}`}
                      style={{ backgroundImage: galleryBackground(item, heroImage) }}
                      onClick={(event) =>
                        openGallery(gallery.indexOf(item) >= 0 ? gallery.indexOf(item) : index, event)
                      }
                    >
                      <Play size={18} fill="currentColor" />
                      <span>{item.purpose || translateText("Video quán", activeLanguage)}</span>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            <section>
              <SectionTitle title="Cast đang làm" meta={formatStoreCastCount(store.casts.length, activeLanguage)} />
              <CastRail store={store} />
            </section>

            <section id="menu" className="mobile-only">
              <SectionTitle title="Thực đơn" />
              <PriceMenu store={store} />
            </section>

            <section>
              <SectionTitle title="Giờ mở cửa" />
              <HoursList store={store} today={today} openingHours={normalizedOpeningHours} />
            </section>

            <section className="mobile-only">
              <SectionTitle title="Vị trí" kicker={addressText || undefined} kickerTone="address" />
              <MapBlock
                displayName={displayName}
                embedUrl={embedUrl}
                mapsUrl={mapsUrl}
                onMapClick={() => trackStoreDetailClick(store, "map", { surface: "mobile-map" })}
              />
            </section>
          </div>
        </div>

        <RelatedStores stores={recommendedStores} activeLanguage={activeLanguage} />
      </section>

      {portalTarget ? createPortal(
        <div className="store-mobile-footer-cta nl-scroll-reveal-skip" data-no-scroll-reveal>
        <Link
          data-testid="store-booking-cta-mobile"
          className="primary-action"
          href={bookingHref}
          onClick={() => trackBookingClick("mobile-sticky")}
        >
          <CalendarDays size={17} />
          <span>
            {translateText("Đặt bàn ngay", activeLanguage)}
            <small>{translateText("Gửi yêu cầu · không thu cọc", activeLanguage)}</small>
          </span>
        </Link>
        </div>,
        portalTarget,
      ) : null}

      {portalTarget && isLightboxOpen && lightboxMedia ? createPortal(
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Store gallery lightbox"
        >
          <button
            className="lightbox-close"
            type="button"
            aria-label="Đóng gallery"
            onMouseDown={preventHeroControlMouseDown}
            onClick={() => setIsLightboxOpen(false)}
          >
            <X size={22} />
          </button>
          {gallery.length > 1 ? (
            <button
              className="lightbox-nav previous"
              type="button"
              aria-label="Media trước"
              onMouseDown={preventHeroControlMouseDown}
              onClick={showPreviousMedia}
            >
              <ChevronLeft size={28} />
            </button>
          ) : null}
          <div className="lightbox-media">
            {lightboxMedia.type === "VIDEO" ? (
              lightboxVideoUrl.includes("youtube.com/embed") ||
              lightboxVideoUrl.includes("player.vimeo.com") ? (
                <iframe
                  title={`${displayName} gallery video`}
                  src={lightboxVideoUrl}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={lightboxVideoUrl || lightboxMediaUrl} controls autoPlay />
              )
            ) : (
              <img src={lightboxMediaUrl} alt={lightboxMedia.alt || displayName} />
            )}
          </div>
          {gallery.length > 1 ? (
            <button
              className="lightbox-nav next"
              type="button"
              aria-label="Media sau"
              onMouseDown={preventHeroControlMouseDown}
              onClick={showNextMedia}
            >
              <ChevronRight size={28} />
            </button>
          ) : null}
          <div className="lightbox-caption">
            {selectedGalleryIndex + 1}/{gallery.length}
            {lightboxMedia.purpose ? ` · ${lightboxMedia.purpose}` : ""}
          </div>
        </div>,
        portalTarget,
      ) : null}

      <style>{`
        .store-detail-page {
          --store-mobile-nav-height: calc(74px + env(safe-area-inset-bottom));
          --store-mobile-cta-height: 76px;
          --store-mobile-fixed-space: calc(var(--store-mobile-nav-height) + var(--store-mobile-cta-height) + 28px);
          --store-hero-control-bg: transparent;
          --store-hero-control-bg-strong: transparent;
          --store-hero-control-border: transparent;
          --store-hero-control-icon: #f7cf5c;
          --store-hero-control-shadow: none;
          --store-hero-control-icon-shadow: none;
          min-height: 100vh;
          background: var(--vy-bg);
          color: var(--vy-text);
          font-family: var(--nl-font-sans);
          padding-bottom: 86px;
        }

        html.vy-light .store-detail-page {
          --store-hero-control-bg: transparent;
          --store-hero-control-bg-strong: transparent;
          --store-hero-control-border: transparent;
          --store-hero-control-icon: #d4a72f;
          --store-hero-control-shadow: none;
          --store-hero-control-icon-shadow: none;
        }

        .nl-page-content:has(.store-detail-page) {
          --store-mobile-nav-height: calc(74px + env(safe-area-inset-bottom));
          --store-mobile-cta-height: 76px;
          --store-mobile-fixed-space: calc(var(--store-mobile-nav-height) + var(--store-mobile-cta-height) + 28px);
          padding-bottom: 0 !important;
          scroll-padding-bottom: calc(152px + env(safe-area-inset-bottom)) !important;
        }

        .detail-shell {
          width: min(1240px, calc(100% - 36px));
          margin: 0 auto;
          padding: 18px 0 42px;
        }

        .desktop-breadcrumb {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 18px;
          color: var(--vy-muted);
          font-size: 12px;
          font-weight: 700;
        }

        .desktop-breadcrumb a,
        .desktop-breadcrumb strong {
          color: inherit;
          text-decoration: none;
        }

        .desktop-breadcrumb strong {
          color: var(--vy-muted);
        }

        .detail-layout {
          display: grid;
          grid-template-columns: minmax(0, 512px) minmax(0, 1fr);
          gap: 34px;
          align-items: start;
          min-width: 0;
        }

        .media-column,
        .info-column {
          min-width: 0;
        }

        .info-column {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 12px;
          width: 100%;
          max-width: 100%;
          overflow: hidden;
        }

        .hero-panel {
          position: relative;
          min-height: 418px;
          overflow: hidden;
          border-radius: 8px;
          background-size: cover;
          background-position: center;
          box-shadow: 0 24px 50px -28px rgba(0, 0, 0, .78);
        }

        .hero-panel::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(12, 12, 15, .08), rgba(12, 12, 15, .15) 36%, rgba(12, 12, 15, .9));
          pointer-events: none;
          z-index: 1;
        }

        .hero-video-preview {
          position: absolute;
          inset: 0;
          z-index: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          pointer-events: none;
        }

        .hero-top,
        .hero-name,
        .hero-media-nav,
        .hero-video-play {
          position: absolute;
          z-index: 2;
        }

        .hero-top {
          top: 14px;
          left: 14px;
          right: 14px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
        }

        .hero-actions {
          display: flex;
          gap: 9px;
        }

        .hero-back {
          display: none;
        }

        .round-action {
          width: 40px;
          height: 40px;
          border: 0;
          border-radius: 50%;
          background: var(--store-hero-control-bg);
          color: var(--store-hero-control-icon);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          box-shadow: var(--store-hero-control-shadow);
          cursor: pointer;
          padding: 0;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
        }

        .round-action svg,
        .hero-media-nav svg,
        .hero-video-play svg {
          filter: var(--store-hero-control-icon-shadow);
          pointer-events: none;
        }

        .round-action svg *,
        .hero-media-nav svg *,
        .hero-video-play svg * {
          pointer-events: none;
        }

        .round-action.hero-back {
          display: none;
        }

        .store-favorite-action {
          color: var(--store-hero-control-icon);
        }

        .store-favorite-action.is-active {
          background: var(--store-hero-control-bg-strong);
          border-color: transparent;
          color: var(--store-hero-control-icon);
        }

        .hero-media-nav {
          top: 50%;
          width: 46px;
          height: 64px;
          border: 0;
          border-radius: 999px;
          background: var(--store-hero-control-bg);
          color: var(--store-hero-control-icon);
          display: grid;
          place-items: center;
          transform: translateY(-50%);
          transition: none;
          animation: none;
          will-change: auto;
          cursor: pointer;
          box-shadow: var(--store-hero-control-shadow);
          text-shadow: none;
          filter: none !important;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
        }

        .hero-media-nav.previous {
          left: 14px;
        }

        .hero-media-nav.next {
          right: 14px;
        }

        .hero-media-nav:active,
        .hero-media-nav:where(:hover, :focus-visible) {
          filter: none !important;
          transform: translateY(-50%) !important;
        }

        .hero-video-play {
          left: 50%;
          top: 50%;
          width: 70px;
          height: 70px;
          border: 0;
          border-radius: 50%;
          background: var(--store-hero-control-bg-strong);
          color: var(--store-hero-control-icon);
          display: grid;
          place-items: center;
          padding: 0 0 0 5px;
          transform: translate(-50%, -50%);
          transition: none;
          animation: none;
          will-change: auto;
          cursor: pointer;
          box-shadow: var(--store-hero-control-shadow);
          filter: none !important;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
        }

        .hero-video-play:active,
        .hero-video-play:where(:hover, :focus-visible) {
          background: var(--store-hero-control-bg-strong);
          filter: none !important;
          transform: translate(-50%, -50%) !important;
        }

        .hero-name {
          left: 14px;
          right: auto;
          bottom: 14px;
        }

        .hero-name h1 {
          margin: 0;
          color: #fff;
          line-height: 1.02;
          letter-spacing: 0;
        }

        .desktop-title h1 {
          margin: 0;
          color: var(--vy-text);
          line-height: 1.02;
          letter-spacing: 0;
        }

        .hero-name h1 {
          font-size: 30px;
          text-shadow: 0 1px 16px rgba(0, 0, 0, .56);
        }

        .hero-name h1,
        .hero-name div > span {
          display: none;
        }

        .hero-name div,
        .desktop-title p {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 9px;
          margin: 10px 0 0;
          color: #cfc9bd;
          font-size: 12px;
        }

        .hero-name div {
          margin-top: 0;
        }

        .hero-name b,
        .open-pill,
        .closed-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 8px;
          padding: 4px 9px;
          font-size: 11px;
          font-weight: 800;
        }

        .hero-name b.open,
        .open-pill {
          color: #086335;
          background: rgba(218, 255, 232, .92);
          border: 1px solid rgba(21, 155, 83, .36);
          box-shadow: 0 8px 20px rgba(21, 155, 83, .12);
        }

        .hero-name b.closed,
        .closed-pill {
          color: #7b4d05;
          background: linear-gradient(135deg, rgba(255, 236, 168, .96), rgba(226, 174, 58, .88));
          border: 1px solid rgba(188, 130, 22, .46);
          box-shadow: 0 8px 20px rgba(188, 130, 22, .16);
        }

        .hero-name i,
        .open-pill i,
        .closed-pill i {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .desktop-stats {
          display: flex;
          align-items: stretch;
          border-top: 1px solid var(--vy-border);
          border-bottom: 1px solid var(--vy-border);
        }

        .quick-stats {
          display: none;
          align-items: stretch;
          border-top: 1px solid var(--vy-border);
          border-bottom: 1px solid var(--vy-border);
          padding: 16px 4px 10px;
        }

        .quick-stats div,
        .desktop-stats div {
          flex: 1;
          min-width: 0;
        }

        .quick-stats div {
          text-align: center;
        }

        .quick-stats i,
        .desktop-stats div + div {
          border-left: 1px solid var(--vy-border);
        }

        .quick-stats strong,
        .desktop-stats strong {
          display: block;
          color: var(--vy-gold-hi);
          font-size: 14px;
          line-height: 1.25;
        }

        .quick-stats span,
        .desktop-stats span {
          display: block;
          margin-top: 5px;
          color: var(--vy-muted);
          font-size: 11px;
        }

        .secondary-actions {
          display: none;
          gap: 9px;
          padding: 12px 0 0;
        }

        .secondary-actions a,
        .primary-action,
        .secondary-action {
          min-height: 44px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 900;
          text-decoration: none;
        }

        .secondary-actions a {
          flex: 1;
          color: var(--vy-gold-hi);
          background: var(--vy-surface-2);
          border: 1px solid var(--vy-border-gold-32);
          box-shadow: var(--vy-shadow-card);
        }

        .secondary-actions a:first-child {
          color: var(--vy-on-gold);
          background: var(--vy-gold-grad);
          border-color: var(--vy-border-gold-40);
        }

        .thumb-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 8px;
          margin-top: 12px;
        }

        .thumb-grid button {
          position: relative;
          aspect-ratio: 1 / .76;
          border: 1px solid transparent;
          border-radius: 8px;
          background-size: cover;
          background-position: center;
          color: #fff;
          display: grid;
          place-items: center;
          cursor: pointer;
          overflow: hidden;
        }

        .thumb-grid button.active {
          border-color: var(--vy-gold);
          box-shadow: inset 0 0 0 1px rgba(212, 178, 106, .6);
        }

        .mobile-gallery-strip {
          display: none;
        }

        .mobile-gallery-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 9px;
        }

        .mobile-gallery-head span {
          color: var(--vy-text);
          font-size: 13px;
          font-weight: 900;
        }

        .mobile-gallery-head small {
          color: var(--vy-muted);
          font-size: 11px;
          font-weight: 800;
        }

        .mobile-gallery-rail {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          max-width: 100%;
          padding: 0 2px 4px 0;
          scroll-padding: 0 18px;
          scroll-snap-type: x proximity;
          touch-action: pan-x;
          -webkit-overflow-scrolling: touch;
        }

        .mobile-gallery-rail button {
          position: relative;
          flex: 0 0 clamp(78px, 22vw, 96px);
          height: 56px;
          border: 1px solid rgba(255, 255, 255, .08);
          border-radius: 8px;
          background-size: cover;
          background-position: center;
          color: #f4dd9b;
          display: grid;
          place-items: center;
          overflow: hidden;
          cursor: pointer;
          scroll-snap-align: start;
        }

        .mobile-gallery-rail button.active {
          border-color: var(--vy-gold);
          box-shadow: inset 0 0 0 1px rgba(212, 178, 106, .72);
        }

        .desktop-only {
          display: block;
          margin-top: 26px;
        }

        .mobile-only {
          display: none;
        }

        .section-title {
          display: flex;
          align-items: flex-end;
          gap: 12px;
          margin-bottom: 13px;
          scroll-margin-top: 96px;
        }

        .section-title h2 {
          margin: 0;
          color: var(--vy-text);
          font-size: 21px;
          line-height: 1.08;
          font-weight: 700;
          letter-spacing: 0;
        }

        .section-title span {
          display: block;
          margin-top: 4px;
          color: var(--vy-muted);
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0;
          text-transform: uppercase;
        }

        .section-title > div {
          min-width: 0;
        }

        .section-title span.section-kicker-address {
          max-width: min(440px, 72vw);
          color: var(--vy-muted);
          font-size: 12px;
          font-weight: 700;
          line-height: 1.35;
          text-transform: none;
          overflow-wrap: anywhere;
        }

        .section-title i {
          flex: 1;
          height: 1px;
          margin-bottom: 8px;
          background: linear-gradient(90deg, rgba(212, 178, 106, .45), transparent);
        }

        .section-title small {
          flex: none;
          margin-bottom: 4px;
          color: #9b958a;
          font-size: 12px;
        }

        .tour-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .tour-rail {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 2px;
        }

        .tour-rail .tour-card {
          flex: 0 0 228px;
        }

        .tour-card {
          position: relative;
          min-height: 136px;
          border: 0;
          border-radius: 8px;
          overflow: hidden;
          background-size: cover;
          background-position: center;
          color: var(--vy-gold-pale);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tour-card::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0, 0, 0, .08), rgba(12, 12, 15, .72));
        }

        .tour-card svg,
        .tour-card span {
          position: relative;
          z-index: 1;
        }

        .tour-card svg {
          width: 44px;
          height: 44px;
          padding: 13px;
          border-radius: 50%;
          border: 1px solid rgba(212, 178, 106, .55);
          background: rgba(12, 12, 15, .46);
        }

        .tour-card span {
          position: absolute;
          left: 12px;
          right: 12px;
          bottom: 10px;
          color: var(--vy-text);
          font-size: 13px;
          font-weight: 800;
          text-align: left;
        }

        .map-block {
          position: relative;
          min-height: 186px;
          border-radius: 8px;
          overflow: hidden;
          background: var(--vy-surface-2);
          border: 1px solid var(--vy-border-gold-12);
        }

        .map-block iframe {
          width: 100%;
          height: 100%;
          min-height: 186px;
          border: 0;
          display: block;
          filter: saturate(.86) contrast(.94);
        }

        .map-fallback {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(212, 178, 106, .16), rgba(255, 255, 255, .04));
        }

        .map-open-link {
          position: absolute;
          right: 12px;
          top: 12px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          min-height: 34px;
          padding: 0 11px;
          border-radius: 8px;
          background: linear-gradient(135deg, #fff3ca, #e8c46d 58%, #c89b3f);
          color: var(--vy-on-gold);
          border: 1px solid rgba(182, 146, 74, .5);
          text-decoration: none;
          font-size: 12px;
          font-weight: 900;
          box-shadow: 0 10px 22px rgba(88, 61, 18, .2);
        }

        .desktop-title {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
        }

        .desktop-title h1 {
          font-size: 34px;
        }

        .desktop-title p {
          color: var(--vy-muted);
        }

        .desktop-title p svg {
          color: #e3c27e;
        }

        .open-pill,
        .closed-pill {
          flex: none;
          margin-top: 2px;
        }

        .desktop-stats {
          padding: 10px 0;
        }

        .desktop-stats div {
          padding-left: 22px;
        }

        .desktop-stats div:first-child {
          padding-left: 0;
        }

        .booking-card,
        .menu-panel {
          border: 1px solid var(--vy-border-gold-32);
          border-radius: 8px;
          background: linear-gradient(135deg, var(--vy-gold-soft-bg), var(--vy-surface-1));
          box-shadow: var(--vy-shadow-card);
        }

        .booking-card {
          width: 100%;
          min-width: 0;
          max-width: 100%;
          padding: 16px;
          box-sizing: border-box;
          overflow: hidden;
        }

        .booking-card-form {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 12px;
          width: 100%;
          min-width: 0;
          max-width: 100%;
          margin: 0;
        }

        .booking-card *,
        .booking-card *::before,
        .booking-card *::after {
          box-sizing: border-box;
          min-width: 0;
        }

        .booking-card-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--vy-border-gold-12);
        }

        .booking-card-head strong,
        .booking-card-head small,
        .booking-card-head b {
          display: block;
        }

        .booking-card-head strong {
          color: var(--vy-text);
          font-size: 15px;
        }

        .booking-card-head small {
          margin-top: 3px;
          color: var(--vy-muted);
          font-size: 11px;
        }

        .booking-card-head b {
          color: var(--vy-gold-hi);
          font-size: 14px;
          white-space: nowrap;
        }

        .member-nudge,
        .booking-safe,
        .menu-note {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          color: var(--vy-muted);
          font-size: 12px;
          line-height: 1.55;
        }

        .member-nudge {
          align-items: center;
          margin: 9px 0 10px;
          padding: 7px 10px;
          border: 1px solid var(--vy-border-gold-32);
          border-radius: 8px;
          background: var(--vy-gold-soft-bg);
        }

        .member-nudge svg,
        .booking-safe svg,
        .menu-note svg {
          flex: none;
          color: var(--vy-gold-hi);
          margin-top: 2px;
        }

        .booking-card label {
          display: block;
          margin: 8px 0 6px;
          color: var(--vy-muted);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0;
          text-transform: uppercase;
        }

        .booking-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-top: 0;
        }

        .booking-cast-grid {
          grid-template-columns: minmax(0, 1fr);
        }

        .booking-schedule-grid {
          display: grid;
          grid-template-columns: minmax(130px, .82fr) minmax(150px, 1fr) minmax(150px, 1fr);
          gap: 12px;
          align-items: stretch;
        }

        .booking-schedule-grid .booking-date-time-fields {
          display: contents;
        }

        .booking-field-stack,
        .booking-card .nl-booking-field-stack {
          display: grid;
          grid-template-rows: auto minmax(18px, auto);
          gap: 5px;
          min-width: 0;
          align-self: stretch;
        }

        .booking-field {
          display: grid;
          align-content: center;
          min-height: 62px;
          padding: 10px 12px;
          border: 1px solid var(--vy-border);
          border-radius: 10px;
          background: var(--vy-surface-2);
        }

        .booking-card .booking-field {
          margin: 0;
          letter-spacing: 0;
          text-transform: none;
        }

        .booking-card .booking-field.nl-booking-field-with-period-tabs {
          min-height: 98px;
          align-content: start;
        }

        .booking-card label.booking-note-label {
          margin: 2px 0 -5px;
        }

        .booking-field span,
        .booking-field strong {
          display: block;
        }

        .booking-field span {
          color: var(--vy-muted);
          font-size: 10px;
          font-weight: 900;
          line-height: 1.1;
        }

        .booking-field strong {
          margin-top: 4px;
          color: var(--vy-text);
          font-size: 12px;
          line-height: 1.25;
        }

        .booking-field input,
        .booking-field select {
          width: 100%;
          margin-top: 7px;
          border: 0;
          outline: none;
          background: transparent;
          color: var(--vy-text);
          font-size: 13px;
          font-weight: 850;
          line-height: 1.25;
          appearance: none;
          cursor: pointer;
        }

        .booking-field input {
          cursor: text;
        }

        .booking-field input::placeholder,
        .booking-note-box::placeholder {
          color: var(--vy-faint);
          opacity: 1;
        }

        .booking-field select option {
          color: #17151a;
        }

        .booking-cast-field {
          position: relative;
          min-height: 72px;
          align-content: start;
          padding: 10px 10px 12px;
          overflow: visible;
          background: #201d18;
        }

        .booking-cast-label {
          display: block;
          color: var(--vy-muted);
          font-size: 10px;
          font-weight: 900;
          line-height: 1.1;
        }

        .booking-cast-select {
          position: relative;
          margin-top: 8px;
        }

        .booking-cast-trigger,
        .booking-cast-option {
          width: 100%;
          border: 0;
          background: transparent;
          color: var(--vy-text);
          display: flex;
          align-items: center;
          gap: 10px;
          font: inherit;
          text-align: left;
        }

        .booking-cast-trigger {
          min-height: 38px;
          padding: 0 2px 0 0;
          cursor: pointer;
        }

        .booking-cast-avatar {
          flex: none;
          border-radius: 999px;
          border: 1px solid var(--vy-border-gold-32);
          background: var(--vy-gold-soft-bg);
          color: var(--vy-gold-hi);
          display: inline-grid;
          place-items: center;
          overflow: hidden;
          font-size: 12px;
          font-weight: 950;
          line-height: 1;
          background-position: center;
          background-size: cover;
        }

        .booking-cast-avatar svg {
          display: block;
          width: 16px;
          height: 16px;
          margin: 0;
          transform: none;
        }

        .booking-cast-avatar.has-image {
          border-color: rgba(212, 178, 106, .45);
          background-color: rgba(15, 14, 18, .5);
        }

        .booking-cast-avatar.is-empty {
          color: var(--vy-gold);
          background: #292416;
        }

        .booking-cast-copy {
          min-width: 0;
          flex: 1;
          display: block;
        }

        .booking-field .booking-cast-copy strong,
        .booking-field .booking-cast-copy small {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .booking-field .booking-cast-copy strong {
          margin: 0;
          color: var(--vy-text);
          font-size: 13px;
          font-weight: 900;
          line-height: 1.2;
        }

        .booking-field .booking-cast-copy small {
          margin-top: 3px;
          color: var(--vy-muted);
          font-size: 10.5px;
          font-weight: 750;
          line-height: 1.25;
        }

        .booking-cast-chevron {
          flex: none;
          color: var(--vy-gold);
        }

        .booking-cast-menu {
          position: absolute;
          z-index: 30;
          top: calc(100% + 8px);
          left: -2px;
          right: -2px;
          max-height: 220px;
          overflow-y: auto;
          border: 1px solid var(--vy-border-gold-32);
          border-radius: 12px;
          background: #1b1814;
          box-shadow: 0 18px 42px rgba(0, 0, 0, .52);
          padding: 6px;
        }

        .booking-cast-option {
          min-height: 46px;
          border-radius: 9px;
          padding: 7px 9px;
          cursor: pointer;
        }

        .booking-cast-option:hover,
        .booking-cast-option:focus-visible,
        .booking-cast-option[aria-selected="true"] {
          background: #332a18;
          outline: none;
        }

        .booking-cast-check {
          flex: none;
          color: var(--vy-gold-hi);
        }

        .booking-cast-native-select {
          position: absolute;
          width: 1px !important;
          height: 1px !important;
          margin: -1px !important;
          padding: 0 !important;
          border: 0 !important;
          overflow: hidden !important;
          clip: rect(0 0 0 0) !important;
          white-space: nowrap !important;
          opacity: 0;
          pointer-events: none;
        }

        html.vy-light .booking-cast-menu {
          background: #fffdf8;
          box-shadow: 0 18px 38px rgba(98, 73, 25, .18);
        }

        html.vy-light .booking-cast-field {
          background: var(--vy-surface-2);
        }

        html.vy-light .booking-cast-avatar.is-empty {
          background: rgba(212, 178, 106, .12);
        }

        html.vy-light .booking-cast-option:hover,
        html.vy-light .booking-cast-option:focus-visible,
        html.vy-light .booking-cast-option[aria-selected="true"] {
          background: #fff4cc;
        }

        .slot-row {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          width: 100%;
          max-width: 100%;
        }

        .slot {
          min-height: 31px;
          border: 1px solid var(--vy-border);
          border-radius: 8px;
          background: var(--vy-surface-2);
          color: var(--vy-muted);
          padding: 0 12px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .slot.active,
        .guest-stepper button {
          color: var(--vy-on-gold);
          background: var(--vy-gold-grad);
          border-color: transparent;
        }

        .slot-empty {
          display: block;
          width: 100%;
          padding: 9px 10px;
          border: 1px dashed var(--vy-border-gold-32);
          border-radius: 8px;
          color: var(--vy-muted);
          background: var(--vy-surface-1);
          font-size: 12px;
          line-height: 1.45;
        }

        .guest-stepper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-top: 8px;
        }

        .guest-stepper button {
          width: 26px;
          min-height: 26px;
          border: 0;
          border-radius: 7px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .guest-stepper button:disabled {
          cursor: not-allowed;
          opacity: .45;
        }

        .booking-card .guest-count-input-wrap {
          min-width: 0;
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          margin: 0;
          color: var(--vy-text);
          font-size: 13px;
          font-weight: 850;
          letter-spacing: 0;
          line-height: 1.2;
          text-transform: none;
        }

        .booking-card .guest-count-input-wrap input {
          width: auto;
          min-width: 1ch;
          max-width: 2ch;
          height: 26px;
          margin: 0;
          padding: 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: inherit;
          font: inherit;
          line-height: 26px;
          text-align: center;
          appearance: textfield;
          cursor: text;
        }

        .booking-card .guest-count-input-wrap input::-webkit-outer-spin-button,
        .booking-card .guest-count-input-wrap input::-webkit-inner-spin-button {
          margin: 0;
          appearance: none;
        }

        .booking-card .guest-count-input-wrap span {
          display: inline;
          color: var(--vy-text);
          font-size: 13px;
          font-weight: 850;
          letter-spacing: 0;
          line-height: 1.2;
          text-transform: none;
        }

        .booking-note-box {
          display: block;
          width: 100%;
          min-height: 58px;
          max-height: 110px;
          margin-bottom: 0;
          padding: 12px;
          border: 1px solid var(--vy-border-gold-22);
          border-radius: 10px;
          background: var(--vy-surface-2);
          color: var(--vy-text);
          font-size: 12px;
          font-family: inherit;
          line-height: 1.55;
          resize: none;
          outline: none;
        }

        .booking-field:focus-within,
        .booking-note-box:focus {
          border-color: var(--vy-border-gold-40);
          box-shadow: 0 0 0 2px var(--vy-gold-soft-bg);
        }

        .booking-card .booking-field .nl-booking-ant-control.ant-picker {
          min-height: 28px;
          height: 28px;
          margin-top: 7px;
          padding: 0;
          border: 0;
          background: transparent;
          box-shadow: none;
          display: flex;
          align-items: center;
        }

        .booking-card .booking-field .nl-booking-ant-control.ant-picker:hover,
        .booking-card .booking-field .nl-booking-ant-control.ant-picker-focused {
          border: 0;
          box-shadow: none;
        }

        .booking-card .booking-field .nl-booking-ant-control.ant-picker .ant-picker-input > input {
          color: var(--vy-text);
          font-size: 13px;
          font-weight: 850;
          height: 28px;
          line-height: 28px;
        }

        .booking-card .booking-field .nl-booking-ant-select.ant-select {
          min-height: 28px;
          height: 28px;
          margin-top: 0;
        }

        .booking-card .booking-field .nl-booking-time-select {
          min-height: 28px;
          margin-top: 0;
        }

        .booking-card .booking-field .nl-booking-time-trigger {
          min-height: 28px;
          height: 28px;
          border: 0;
          border-radius: 0;
          background: transparent;
          padding: 0;
          box-shadow: none;
        }

        .booking-card .booking-field .nl-booking-time-control {
          gap: 5px;
          margin-top: 7px;
        }

        .booking-card .booking-field .nl-booking-period-tabs {
          gap: 3px;
          margin: 0;
          border-radius: 9px;
          padding: 3px;
        }

        .booking-card .booking-field .nl-booking-period-tab {
          min-height: 22px;
          border-radius: 7px;
          font-size: 10.5px;
          padding: 0 6px;
        }

        .booking-card .booking-field.nl-booking-field-with-period-tabs .nl-booking-ant-select.ant-select {
          margin-top: 0;
        }

        .booking-card .booking-field .nl-booking-ant-select.ant-select .ant-select-selector {
          min-height: 28px !important;
          height: 28px !important;
          padding: 0 !important;
          border: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
          align-items: center !important;
        }

        .booking-card .booking-field .nl-booking-ant-select.ant-select:hover .ant-select-selector,
        .booking-card .booking-field .nl-booking-ant-select.ant-select-focused .ant-select-selector,
        .booking-card .booking-field .nl-booking-time-trigger:hover,
        .booking-card .booking-field .nl-booking-time-trigger:focus-visible {
          border: 0 !important;
          box-shadow: none !important;
        }

        .booking-card .booking-field .nl-booking-ant-select .ant-select-selection-item,
        .booking-card .booking-field .nl-booking-ant-select .ant-select-selection-placeholder,
        .booking-card .booking-field .nl-booking-time-trigger span {
          color: var(--vy-text) !important;
          font-size: 13px;
          font-weight: 850;
          line-height: 28px !important;
          min-height: 28px !important;
        }

        .booking-card .booking-field .nl-booking-ant-select .ant-select-arrow,
        .booking-card .booking-field .nl-booking-time-trigger svg {
          color: var(--vy-gold) !important;
        }

        .booking-error {
          margin-top: 8px;
          padding: 8px 10px;
          border: 1px solid rgba(248, 113, 113, .3);
          border-radius: 8px;
          background: rgba(127, 29, 29, .16);
          color: #fecaca;
          font-size: 12px;
          line-height: 1.45;
        }

        .booking-field-error,
        .booking-card .nl-booking-field-error {
          display: block;
          min-height: 18px;
          margin: 0;
          padding: 0 2px;
          color: #ff86a0;
          font-size: 13px;
          font-weight: 850;
          line-height: 1.35;
          letter-spacing: 0;
          text-transform: none;
        }

        .booking-field-error.is-empty {
          visibility: hidden;
        }

        :global(html.vy-light) .booking-error {
          border-color: rgba(172, 32, 55, .5);
          background: #fff1f2;
          color: #7f1025;
          box-shadow: 0 10px 22px rgba(127, 16, 37, .12);
          font-size: 13px;
          font-weight: 850;
        }

        :global(html.vy-light) .booking-field-error,
        :global(html.vy-light) .booking-card .nl-booking-field-error {
          color: #b01632;
        }

        .primary-action {
          background: var(--vy-gold-grad);
          color: var(--vy-on-gold);
          border: 0;
        }

        button.primary-action {
          cursor: pointer;
        }

        button.primary-action:disabled {
          cursor: wait;
          opacity: .72;
        }

        .secondary-action {
          color: var(--vy-gold-hi);
          background: var(--vy-surface-2);
          border: 1px solid var(--vy-border-gold-32);
        }

        .full {
          width: 100%;
        }

        .booking-card .primary-action + .secondary-action {
          margin-top: 10px;
        }

        .booking-card .primary-action {
          width: 100%;
          max-width: 100%;
          position: relative;
          z-index: 2;
          flex: none;
          padding: 0 12px;
          text-align: center;
          white-space: normal;
          min-height: 40px;
          pointer-events: auto;
        }

        .booking-card .secondary-action {
          display: none;
        }

        .booking-safe {
          margin-top: 8px;
        }

        .intro-copy {
          color: var(--vy-muted);
          font-size: 14px;
          line-height: 1.8;
          max-width: 100%;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .desktop-about-inline {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 12px;
          width: 100%;
          min-width: 0;
          max-width: 100%;
        }

        .desktop-about-inline .intro-copy {
          font-size: 13px;
          line-height: 1.78;
        }

        .mobile-about-section {
          display: none;
        }

        .intro-copy p {
          margin: 0;
        }

        .intro-copy p + p {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid rgba(212, 178, 106, .14);
        }

        .feature-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 14px;
          max-width: 100%;
        }

        .feature-chips span,
        .menu-chips span {
          display: inline-flex;
          align-items: center;
          min-height: 31px;
          border-radius: 999px;
          padding: 0 12px;
          color: #d9c08a;
          background: rgba(212, 178, 106, .1);
          border: 1px solid rgba(212, 178, 106, .26);
          font-size: 12px;
          font-weight: 800;
        }

        .feature-chips span:nth-child(n + 3) {
          color: var(--vy-muted);
          background: var(--vy-surface-2);
          border-color: rgba(255, 255, 255, .1);
        }

        .language-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          margin-top: 14px;
        }

        .language-grid div {
          min-height: 74px;
          min-width: 0;
          padding: 12px;
          border-radius: 8px;
          background: var(--vy-surface-3);
          border: 1px solid rgba(212, 178, 106, .16);
        }

        .language-grid span,
        .language-grid strong {
          display: block;
        }

        .language-grid span {
          color: #9b958a;
          font-size: 11px;
          line-height: 1.35;
        }

        .language-grid strong {
          margin-top: 6px;
          color: var(--vy-gold-pale);
          font-size: 14px;
          line-height: 1.3;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .cast-rail {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          padding-bottom: 2px;
        }

        .cast-bubble {
          flex: 0 0 78px;
          color: var(--vy-text);
          text-align: center;
          text-decoration: none;
          transition: none;
          animation: none;
          will-change: auto;
        }

        .cast-bubble:active,
        .cast-bubble:where(:hover, :focus-visible) {
          filter: none !important;
          transform: none !important;
        }

        .cast-avatar {
          display: block;
          width: 76px;
          height: 76px;
          border-radius: 50%;
          background-size: cover;
          background-position: center;
          border: 1px solid rgba(255, 255, 255, .14);
        }

        .cast-bubble:first-child .cast-avatar {
          border-color: rgba(212, 178, 106, .52);
        }

        .cast-bubble strong {
          display: block;
          margin-top: 8px;
          font-size: 12px;
          line-height: 1.25;
        }

        .cast-bubble small {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 4px;
          margin-top: 3px;
          color: var(--vy-gold-hi);
          font-size: 10px;
          line-height: 1.25;
        }

        .coupon-strip {
          display: flex;
          align-items: stretch;
          min-height: 88px;
          border: 1px solid var(--vy-border-gold-22);
          border-radius: 8px;
          overflow: hidden;
          background: var(--vy-surface-1);
          color: var(--vy-text);
          text-decoration: none;
        }

        .coupon-photo {
          width: 78px;
          flex: none;
          background: ${emptyMediaBackground};
          background-size: cover;
          background-position: center;
        }

        .coupon-copy {
          flex: 1;
          min-width: 0;
          padding: 12px 13px;
        }

        .coupon-copy b {
          color: var(--vy-gold-hi);
          font-size: 20px;
          margin-right: 8px;
        }

        .coupon-copy strong {
          color: var(--vy-text);
          font-size: 13px;
        }

        .coupon-copy small {
          display: block;
          margin-top: 6px;
          color: var(--vy-muted);
          font-size: 11px;
          line-height: 1.45;
        }

        .coupon-ticket {
          width: 58px;
          flex: none;
          border-left: 1px dashed rgba(212, 178, 106, .42);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--vy-gold);
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          writing-mode: vertical-rl;
          transform: rotate(180deg);
        }

        .menu-panel {
          padding: 14px;
        }

        .menu-chips {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 8px;
        }

        .menu-chips span {
          flex: none;
          color: var(--vy-muted);
          background: var(--vy-surface-2);
          border-color: rgba(255, 255, 255, .1);
        }

        .menu-chips span.active {
          color: var(--vy-on-gold);
          background: linear-gradient(135deg, #f4e3b4, #d4b26a 55%, #b6924a);
          border-color: transparent;
        }

        .menu-list {
          display: grid;
        }

        .menu-row {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 13px 0;
          border-bottom: 1px solid var(--vy-border);
        }

        .menu-row:last-child {
          border-bottom: 0;
        }

        .menu-photo {
          width: 66px;
          height: 66px;
          flex: none;
          border-radius: 8px;
          background-size: cover;
          background-position: center;
        }

        .menu-copy {
          flex: 1;
          min-width: 0;
        }

        .menu-copy strong {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 7px;
          color: var(--vy-text);
          font-size: 14px;
          line-height: 1.35;
        }

        .menu-copy em {
          border-radius: 6px;
          background: linear-gradient(135deg, #f4e3b4, #d4b26a);
          color: var(--vy-on-gold);
          padding: 2px 6px;
          font-size: 9px;
          font-style: normal;
          font-weight: 900;
          text-transform: uppercase;
        }

        .menu-copy small {
          display: block;
          margin-top: 4px;
          color: var(--vy-muted);
          font-size: 12px;
          line-height: 1.5;
        }

        .menu-row > b {
          flex: none;
          color: var(--vy-gold-hi);
          font-size: 13px;
          white-space: nowrap;
        }

        .menu-note {
          margin-top: 10px;
          padding: 11px 12px;
          border-radius: 8px;
          background: var(--vy-surface-1);
          border: 1px solid rgba(255, 255, 255, .07);
        }

        .hours-list {
          display: grid;
          gap: 8px;
        }

        .hours-list div {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          min-height: 42px;
          padding: 10px 13px;
          border-radius: 8px;
          background: var(--vy-surface-1);
          border: 1px solid var(--vy-border);
        }

        .hours-list div.today {
          background: linear-gradient(135deg, rgba(212, 178, 106, .14), transparent);
          border-color: rgba(212, 178, 106, .4);
        }

        .hours-list span {
          color: var(--vy-text);
          font-size: 13px;
        }

        .hours-list strong {
          color: var(--vy-gold-hi);
          font-size: 13px;
          text-align: right;
        }

        .empty-state {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          border: 1px solid rgba(212, 178, 106, .16);
          border-radius: 8px;
          background: var(--vy-surface-1);
        }

        .empty-state > span {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          flex: none;
          color: #e3c27e;
          background: rgba(212, 178, 106, .1);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .empty-state strong {
          color: var(--vy-text);
          font-size: 14px;
        }

        .empty-state p {
          margin: 3px 0 0;
          color: #9b958a;
          font-size: 12px;
          line-height: 1.5;
        }

        .related-section {
          margin-top: 34px;
        }

        .related-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }

        .related-card {
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, .08);
          border-radius: 8px;
          background: var(--vy-surface-1);
          color: var(--vy-text);
          text-decoration: none;
        }

        .related-photo {
          display: block;
          height: 140px;
          background-size: cover;
          background-position: center;
        }

        .related-copy {
          display: block;
          padding: 12px 13px 14px;
        }

        .related-copy strong,
        .related-copy small,
        .related-copy em {
          display: block;
        }

        .related-copy strong {
          color: var(--vy-text);
          font-size: 15px;
          line-height: 1.3;
        }

        .related-copy small {
          margin-top: 6px;
          color: #e3c27e;
          font-size: 11px;
          font-weight: 900;
        }

        .related-copy em {
          margin-top: 4px;
          color: var(--vy-muted);
          font-size: 11px;
          font-style: normal;
          line-height: 1.35;
        }

        .store-mobile-footer-cta {
          display: none;
        }

        .lightbox {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(5, 6, 8, .94);
          display: grid;
          place-items: center;
          padding: 28px;
        }

        .lightbox-media {
          width: min(100%, 980px);
          aspect-ratio: 16 / 9;
          display: grid;
          place-items: center;
        }

        .lightbox-media img,
        .lightbox-media video,
        .lightbox-media iframe {
          width: 100%;
          height: 100%;
          border: 0;
          object-fit: contain;
          border-radius: 8px;
          background: #050608;
        }

        .lightbox-close,
        .lightbox-nav {
          position: absolute;
          border: 1px solid rgba(244, 221, 155, .28);
          border-radius: 999px;
          background: rgba(255, 255, 255, .08);
          color: #f7f1e7;
          cursor: pointer;
          display: grid;
          place-items: center;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
        }

        .lightbox-close svg,
        .lightbox-close svg *,
        .lightbox-nav svg,
        .lightbox-nav svg * {
          pointer-events: none;
        }

        .lightbox-close {
          top: 22px;
          right: 22px;
          width: 44px;
          height: 44px;
        }

        .lightbox-nav {
          width: 52px;
          height: 52px;
          top: 50%;
          transform: translateY(-50%);
          transition: none;
          animation: none;
          will-change: auto;
        }

        .lightbox-nav.previous {
          left: 22px;
        }

        .lightbox-nav.next {
          right: 22px;
        }

        .lightbox-nav:active,
        .lightbox-nav:where(:hover, :focus-visible) {
          filter: none !important;
          transform: translateY(-50%) !important;
        }

        .lightbox-caption {
          position: absolute;
          left: 50%;
          bottom: 22px;
          transform: translateX(-50%);
          color: #f4dd9b;
          font-size: 13px;
          font-weight: 800;
        }

        .hscroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .hscroll::-webkit-scrollbar {
          display: none;
        }

        @media (max-width: 980px) {
          .store-detail-page {
            padding-bottom: 18px;
          }

          .nl-page-content:has(.store-detail-page) {
            padding-bottom: 0 !important;
            scroll-padding-bottom: var(--store-mobile-fixed-space) !important;
          }

          .nl-page-content:has(.store-detail-page) + .nl-site-footer {
            padding-bottom: calc(168px + env(safe-area-inset-bottom)) !important;
          }

          .detail-shell {
            width: 100%;
            padding: 0;
          }

          .desktop-breadcrumb {
            display: none;
          }

          .detail-layout {
            display: block;
          }

          .media-column {
            display: contents;
          }

          .info-column {
            display: grid;
            gap: 22px;
            padding: 0 18px;
          }

          .hero-panel {
            min-height: 326px;
            border-radius: 0;
          }

          .hero-top {
            top: 12px;
            left: 16px;
            right: 16px;
            justify-content: space-between;
          }

          .round-action.hero-back {
            display: inline-flex;
          }

          .hero-media-nav {
            width: 42px;
            height: 60px;
            background: var(--store-hero-control-bg);
            color: var(--store-hero-control-icon);
          }

          .hero-media-nav.previous {
            left: 10px;
          }

          .hero-media-nav.next {
            right: 10px;
          }

          .hero-name {
            left: 20px;
            right: 20px;
            bottom: 18px;
          }

          .hero-name h1 {
            display: block;
            font-size: 28px;
          }

          .hero-name div {
            margin-top: 10px;
          }

          .hero-name div > span {
            display: inline;
          }

          .quick-stats {
            display: flex;
            margin: 0 18px;
          }

          .secondary-actions {
            display: flex;
            gap: 8px;
            padding: 12px 18px 4px;
          }

          .secondary-actions a {
            min-width: 0;
            min-height: 44px;
            font-size: 12px;
            padding: 0 8px;
          }

          .mobile-gallery-strip {
            display: block;
            margin: 0 18px;
            padding: 12px 0 8px;
            border-bottom: 1px solid rgba(255, 255, 255, .07);
          }

          .thumb-grid,
          .desktop-only,
          .desktop-title,
          .desktop-stats,
          .desktop-about-inline,
          .booking-card {
            display: none;
          }

          .mobile-about-section,
          .mobile-only {
            display: block;
          }

          .mobile-about-section {
            margin-top: 10px;
          }

          .section-title {
            margin-bottom: 12px;
          }

          .section-title span.section-kicker-address {
            max-width: 82vw;
            font-size: 11px;
          }

          .tour-rail .tour-card {
            flex: 0 0 min(100%, 340px);
            min-height: 188px;
          }

          .language-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 8px;
          }

          .language-grid div {
            min-height: 74px;
            padding: 10px;
          }

          .language-grid span {
            font-size: 10px;
          }

          .language-grid strong {
            font-size: 13px;
          }

          .menu-panel {
            margin-left: -2px;
            margin-right: -2px;
          }

          .related-section {
            margin: 24px 18px 0;
          }

          .related-grid {
            display: flex;
            overflow-x: auto;
            gap: 12px;
            padding-bottom: 2px;
            scrollbar-width: none;
          }

          .related-grid::-webkit-scrollbar {
            display: none;
          }

          .related-card {
            flex: 0 0 226px;
          }

          .related-photo {
            height: 118px;
          }

          .store-mobile-footer-cta {
            --store-mobile-nav-height: calc(74px + env(safe-area-inset-bottom));
            --store-mobile-cta-height: 76px;
            position: fixed !important;
            left: 0 !important;
            right: 0 !important;
            top: auto !important;
            bottom: var(--store-mobile-nav-height) !important;
            z-index: 70;
            display: grid;
            grid-template-columns: minmax(0, 1fr);
            align-items: center;
            height: var(--store-mobile-cta-height);
            margin: 0 !important;
            padding: 10px 12px;
            background: color-mix(in srgb, var(--vy-surface) 90%, var(--vy-bg) 10%);
            border-top: 1px solid var(--vy-border-gold-32);
            box-sizing: border-box;
            box-shadow: var(--vy-shadow);
            backdrop-filter: blur(14px);
            transform: translateZ(0);
          }

          .store-mobile-footer-cta div span,
          .store-mobile-footer-cta div strong {
            display: block;
          }

          .store-mobile-footer-cta div span {
            color: var(--vy-muted);
            font-size: 11px;
            font-weight: 800;
          }

          .store-mobile-footer-cta div strong {
            margin-top: 3px;
            color: var(--vy-text);
            font-size: 16px;
            line-height: 1.2;
          }

          .store-mobile-footer-cta .primary-action {
            min-height: 52px;
            padding: 0 14px;
            width: 100%;
            border-radius: 8px;
            box-shadow: var(--vy-shadow-card);
            pointer-events: auto;
          }

          .store-mobile-footer-cta .primary-action span {
            display: grid;
            gap: 2px;
            line-height: 1.15;
          }

          .store-mobile-footer-cta .primary-action small {
            font-size: 10px;
            font-weight: 700;
            opacity: .82;
          }
        }

        @media (max-width: 620px) {
          .info-column {
            padding: 0 16px;
          }

          .quick-stats {
            margin: 0 18px;
          }

          .quick-stats strong {
            font-size: 12px;
          }

          .quick-stats span {
            font-size: 10px;
          }

          .section-title h2 {
            font-size: 21px;
          }

          .tour-rail .tour-card {
            flex-basis: 100%;
            min-height: 188px;
          }

          .menu-row {
            align-items: flex-start;
          }

          .menu-row > b {
            max-width: 92px;
            text-align: right;
            white-space: normal;
          }

          .hours-list div {
            align-items: flex-start;
          }

          .hours-list strong {
            max-width: 45%;
          }

          .lightbox {
            padding: 18px;
          }

          .lightbox-nav {
            width: 42px;
            height: 42px;
          }
        }
      `}</style>
    </main>
  );
}
