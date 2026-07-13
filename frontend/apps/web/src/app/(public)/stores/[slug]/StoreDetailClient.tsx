"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  CalendarDays,
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
  WalletCards,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { bookingApi, rememberLastBooking, type BookingRecord, type CreateBookingPayload } from "@/lib/api/bookings";
import { ApiError, apiClient, getAuthToken, translateApiMessage } from "@/lib/api/client";
import { requestMemberNotificationsRefresh } from "@/lib/api/notifications";
import { BookingDateTimeFields } from "@/components/ui/BookingDateTimeFields";
import type { PublicStoreDetail, RelatedStore, StoreGalleryItem } from "@/lib/api/store-detail";
import { getAuthUser } from "@/lib/auth/session";
import {
  buildBookingTimeSlotGroups,
  buildScheduledAtFromBookingSlot,
  normalizeStoreOpeningHours,
  type BookingTimeSlotGroup,
} from "@/lib/booking-time-slots";
import {
  bookingValidationLimits,
  normalizeBookingDisplayName,
  normalizeBookingEmail,
  normalizeBookingNote,
  sanitizeBookingDisplayNameInput,
} from "@/lib/booking-validation";
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
import { hasMemberFavoriteAccess, requireMemberFavoriteAccess } from "@/lib/member-favorite-auth";
import { isFavoriteStore, writeFavoriteStore } from "@/lib/member-favorites";
import { formatPriceTier, formatPriceTierRange } from "@/lib/price-tier";
import {
  categoryLabels,
  formatDateOption,
  mapEmbedUrl,
  mediaBackground,
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
  autoComplete: "off",
  "data-1p-ignore": "true",
  "data-form-type": "other",
  "data-lpignore": "true",
} as const;

const bookingInputAutofillBlockProps = {
  autoComplete: "new-password",
  "aria-autocomplete": "none",
  "data-1p-ignore": "true",
  "data-form-type": "other",
  "data-lpignore": "true",
} as const;

const bookingNoteAutofillBlockProps = {
  autoComplete: "off",
  "aria-autocomplete": "none",
  "data-1p-ignore": "true",
  "data-form-type": "other",
  "data-lpignore": "true",
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

const formatNationalities = (languages: string[]) =>
  nationalitiesFromLanguages(languages).join(", ");

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

const todayKey = () =>
  ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][
    new Date().getDay()
  ];

const toDateInputValue = (date: Date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};

const getTodayDate = () => toDateInputValue(new Date());

const getMaxBookingDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + bookingDateWindowDays);
  return toDateInputValue(date);
};

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
  return (
    <div className="section-title" id={id}>
      <div>
        <h2>{title}</h2>
        {kicker ? (
          <span className={kickerTone === "address" ? "section-kicker-address" : undefined}>
            {kicker}
          </span>
        ) : null}
      </div>
      <i aria-hidden="true" />
      {meta ? <small>{meta}</small> : null}
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
  if (!store.casts.length) {
    return (
      <EmptyState
        icon={<Users size={20} />}
        title="Chưa có cast công khai"
        body="Quán sẽ cập nhật hồ sơ cast khi lịch phục vụ sẵn sàng."
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
              {formatNationalities(cast.languages) || "Cast"}
            </small>
          </Link>
        );
      })}
    </div>
  );
}

function PriceMenu({ store }: { store: PublicStoreDetail }) {
  const items = store.priceReference.items;
  const menuGroups = Array.from(
    new Set(items.map((item) => item.group).filter((group): group is string => Boolean(group))),
  );

  return (
    <section className="menu-panel">
      {menuGroups.length ? (
        <div className="menu-chips hscroll" aria-label="Nhóm thực đơn">
          {menuGroups.map((chip, index) => (
            <span className={index === 0 ? "active" : undefined} key={chip}>
              {chip}
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
                  {item.note ||
                    item.group ||
                    (item.unit === "hour" ? "Giá tham khảo theo giờ" : "Giá tham khảo tại quán")}
                </small>
              </span>
              <b>
                {item.displayPrice || formatPriceTier(item.amountVnd)}
                {item.unit === "hour" ? "/giờ" : ""}
              </b>
            </div>
          ))
        ) : (
          <EmptyState
            icon={<WalletCards size={20} />}
            title="Chưa có bảng giá"
            body="Quán chưa công khai thực đơn tham khảo."
          />
        )}
      </div>

      <div className="menu-note">
        <Info size={15} />
        <span>
          {store.priceReference.note ||
            "Giá chỉ dùng để tham khảo, có thể thay đổi theo ngày và khung giờ."}
        </span>
      </div>
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
  const summary = rawOpeningSummary(store);

  if (summary) {
    return (
      <div className="hours-list">
        <div className="today">
          <span>Giờ mở cửa</span>
          <strong>{summary}</strong>
        </div>
      </div>
    );
  }

  return (
    <div className="hours-list">
      {weekdayLabels.map(([key, label]) => (
        <div className={key === today ? "today" : undefined} key={key}>
          <span>{key === today ? `Hôm nay · ${label}` : label}</span>
          <strong>{openingText(openingHours?.[key])}</strong>
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
          Chỉ đường
        </a>
      ) : null}
    </div>
  );
}

function BookingFieldError({
  activeLanguage,
  message,
}: {
  activeLanguage: LanguageCode;
  message?: string;
}) {
  if (!message) return null;

  return (
    <span className="booking-field-error" aria-live="polite">
      {translateText(message, activeLanguage)}
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
  timeOptionGroups,
  guestCount,
  guestName,
  email,
  note,
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
  onFieldTouched,
  onSubmit,
}: {
  store: PublicStoreDetail;
  selectedDateIso: string;
  minDate: string;
  maxDate: string;
  selectedTime: string;
  timeOptions: string[];
  timeOptionGroups: BookingTimeSlotGroup[];
  guestCount: number;
  guestName: string;
  email: string;
  note: string;
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
  onFieldTouched: (field: BookingValidationField) => void;
  onSubmit: () => void;
}) {
  return (
    <aside className="booking-card" aria-label="Đặt bàn">
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
            <strong>Đặt bàn</strong>
            <small>Gửi yêu cầu · Admin xác nhận</small>
          </span>
          <b>{formatPriceTier(store.priceReference.startingFromVnd)}</b>
        </div>

        <div className="booking-form-grid booking-contact-grid">
          <label className="booking-field booking-input-field">
            <span>Họ tên</span>
            <input
              {...bookingInputAutofillBlockProps}
              name="nl-booking-store-display"
              value={guestName}
              onBlur={() => onFieldTouched("guestName")}
              onChange={(event) => {
                onFieldTouched("guestName");
                onGuestNameChange(sanitizeBookingDisplayNameInput(event.target.value));
              }}
              placeholder="Vui lòng nhập họ tên"
            />
            <BookingFieldError
              activeLanguage={activeLanguage}
              message={fieldErrors.guestName}
            />
          </label>
          <label className="booking-field booking-input-field">
            <span>Email</span>
            <input
              {...bookingInputAutofillBlockProps}
              type="email"
              name="nl-booking-store-contact"
              value={email}
              onBlur={() => onFieldTouched("email")}
              onChange={(event) => {
                onFieldTouched("email");
                onEmailChange(event.target.value);
              }}
              placeholder="Vui lòng nhập email"
              inputMode="email"
            />
            <BookingFieldError activeLanguage={activeLanguage} message={fieldErrors.email} />
          </label>
        </div>

        <div className="booking-schedule-grid">
          <div className="booking-field booking-guest-field">
            <span>Số người</span>
            <div className="guest-stepper">
              <button
                type="button"
                aria-label="Giảm số khách"
                onClick={() => {
                  onFieldTouched("guestCount");
                  onGuestCountChange(Math.max(1, guestCount - 1));
                }}
                disabled={guestCount <= 1}
              >
                <Minus size={15} />
              </button>
              <strong>{translateText(`${guestCount} người`, activeLanguage)}</strong>
              <button
                type="button"
                aria-label="Tăng số khách"
                onClick={() => {
                  onFieldTouched("guestCount");
                  onGuestCountChange(Math.min(maxBookingGuests, guestCount + 1));
                }}
                disabled={guestCount >= maxBookingGuests}
              >
                <Plus size={15} />
              </button>
            </div>
            <BookingFieldError activeLanguage={activeLanguage} message={fieldErrors.guestCount} />
          </div>

          <BookingDateTimeFields
            className="booking-date-time-fields"
            dateValue={selectedDateIso}
            timeValue={selectedTime}
            timeOptions={timeOptions}
            timeOptionGroups={timeOptionGroups}
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
          />
        </div>

        <label className="booking-note-label">Ghi chú tuỳ chọn</label>
        <textarea
          {...bookingNoteAutofillBlockProps}
          className="booking-note-box"
          name="nl-booking-store-note"
          value={note}
          onBlur={() => onFieldTouched("note")}
          onChange={(event) => {
            onFieldTouched("note");
            onNoteChange(event.target.value);
          }}
          placeholder="Vui lòng nhập ghi chú nếu có"
        />
        <BookingFieldError activeLanguage={activeLanguage} message={fieldErrors.note} />

        {errorMessage ? <div className="booking-error">{translateText(errorMessage, activeLanguage)}</div> : null}

        <button
          type="button"
          data-testid="store-booking-cta-sidebar"
          className="primary-action full"
          disabled={isSubmitting || !selectedTime}
          onClick={onSubmit}
        >
          <CalendarDays size={18} />
          {isSubmitting ? "Đang gửi yêu cầu..." : "Gửi yêu cầu đặt bàn"}
        </button>

        <div className="booking-safe">
          <ShieldCheck size={15} />
          <span>
            Không thanh toán online · không thu cọc · có thể hủy trước giờ hẹn theo chính sách quán.
          </span>
        </div>
      </form>
    </aside>
  );
}

function RelatedStores({ stores }: { stores: RelatedStore[] }) {
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
              <small>{recommendationLabel(related)}</small>
              <em>
                {[
                  categoryLabels[related.category] ?? related.category,
                  related.area?.name ?? related.district,
                ]
                  .filter(Boolean)
                  .join(" · ")}
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
  const activeLanguage = useActiveLanguage();
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState(0);
  const [guestCount, setGuestCount] = useState(4);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState("21:00");
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
  const gallery = store.gallery?.filter((item) => item.url) ?? [];
  const videoGallery = gallery.filter((item) => item.type === "VIDEO");
  const heroImage = gallery.find((item) => item.type === "IMAGE") ?? null;
  const selectedMedia = gallery[selectedGalleryIndex] ?? gallery[0] ?? heroImage;
  const heroMedia = selectedMedia?.type === "IMAGE" ? selectedMedia : heroImage;
  const heroBackground = mediaBackground(heroMedia);
  const galleryTiles = gallery.slice(0, 5);
  const tourMedia = videoGallery;
  const location = [store.area?.name, store.district, store.city].filter(Boolean).join(" · ");
  const addressText = storeAddressText(store);
  const mapsUrl = plainMapsUrl(store);
  const embedUrl = mapEmbedUrl(store);
  const today = todayKey() ?? "monday";
  const normalizedOpeningHours = useMemo(
    () => normalizeStoreOpeningHours(store.openingHours),
    [store.openingHours],
  );
  const openingSummary = rawOpeningSummary(store);
  const todayOpening = openingSummary ?? openingText(normalizedOpeningHours?.[today]);
  const openNow = todayOpening !== "Nghỉ" && todayOpening !== "Chưa cập nhật";
  const categoryLabel = categoryLabels[store.category] ?? store.category;
  const priceText = priceRangeText(store);
  const structuredData = useMemo(() => buildStoreStructuredData(store), [store]);
  const introLines = useMemo(() => buildIntroLines(store.description), [store.description]);
  const introText = useMemo(
    () => selectIntroText(introLines, activeLanguage),
    [activeLanguage, introLines],
  );
  const nationalityText = Array.from(
    new Set(store.casts.flatMap((cast) => nationalitiesFromLanguages(cast.languages))),
  )
    .slice(0, 3)
    .join(" · ");
  const languageCards = useMemo(() => {
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
        label: `Nói tiếng ${language}`,
        value: `${Math.round((count / totalCasts) * 100)}%`,
      }));

    return [
      ...cards,
      {
        label: "Quốc tịch cast",
        value: nationalityText || "Đang cập nhật",
      },
    ];
  }, [nationalityText, store.casts]);

  const dateOptions = useMemo(
    () =>
      Array.from({ length: bookingDateWindowDays + 1 }, (_, index) => {
        const date = new Date();
        date.setDate(date.getDate() + index);

        return {
          label: formatDateOption(date),
          iso: date.toISOString().slice(0, 10),
        };
      }),
    [],
  );
  const selectedDate = dateOptions[selectedDateIndex] ?? {
    label: "",
    iso: new Date().toISOString().slice(0, 10),
  };
  const bookingTimeOptionGroups = useMemo(
    () =>
      buildBookingTimeSlotGroups(normalizedOpeningHours ?? store.openingHours, selectedDate.iso, {
        fallback: "empty",
      }),
    [normalizedOpeningHours, selectedDate.iso, store.openingHours],
  );
  const bookingTimeOptions = useMemo(
    () => bookingTimeOptionGroups.flatMap((group) => group.slots),
    [bookingTimeOptionGroups],
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
  });

  const bookingHref = `/dat-cho?${bookingQuery.toString()}`;
  const phoneHref = store.phone ? `tel:${store.phone.replace(/[^\d+]/g, "")}` : "";
  const lightboxMedia = gallery[selectedGalleryIndex] ?? selectedMedia;
  const lightboxVideoUrl = lightboxMedia?.type === "VIDEO" ? videoEmbedUrl(lightboxMedia.url) : "";
  const showPreviousMedia = () =>
    setSelectedGalleryIndex((index) => (index <= 0 ? gallery.length - 1 : index - 1));
  const showNextMedia = () =>
    setSelectedGalleryIndex((index) => (index >= gallery.length - 1 ? 0 : index + 1));
  const toggleFavorite = () => {
    if (!requireMemberFavoriteAccess()) {
      return;
    }

    const nextValue = !isFavorite;
    setIsFavorite(nextValue);
    writeFavoriteStore(
      {
        slug: store.slug,
        name: displayName,
        categoryLabel,
        areaLabel: store.area?.name ?? store.district ?? "",
        cityLabel: store.cityCode ?? store.city,
        image: galleryImageUrl(heroImage),
      },
      nextValue,
    );
    trackStoreDetailClick(store, "favorite", { favorited: nextValue });
  };
  const openGallery = (index: number) => {
    if (!gallery.length) return;
    setSelectedGalleryIndex(index % gallery.length);
    setIsLightboxOpen(true);
  };
  const trackBookingClick = (surface: string) =>
    trackStoreDetailClick(store, "booking", {
      surface,
      guests: guestCount,
      date: selectedDate.iso,
      time: selectedTime,
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
      displayName,
      email: normalizedEmail,
      scheduledAt,
      partySize: guestCount,
      ...(trimmedNote ? { note: trimmedNote } : {}),
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
          <Link href="/">Trang chủ</Link>
          <span>/</span>
          <Link href="/danh-sach-quan">Tìm quán</Link>
          <span>/</span>
          <strong>{displayName}</strong>
        </nav>

        <div className="detail-layout">
          <div className="media-column">
            <section className="hero-panel" style={{ backgroundImage: heroBackground }}>
              <div className="hero-top">
                <Link
                  className="round-action hero-back"
                  href="/danh-sach-quan"
                  aria-label="Quay lại danh sách quán"
                >
                  <ChevronLeft size={20} />
                </Link>
                <div className="hero-actions">
                  <IconButton
                    label={isFavorite ? "Bỏ lưu quán" : "Lưu quán"}
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
                    onClick={showPreviousMedia}
                  >
                    <ChevronLeft size={30} />
                  </button>
                  <button
                    className="hero-media-nav next"
                    type="button"
                    aria-label="Media sau"
                    data-testid="store-hero-media-next"
                    onClick={showNextMedia}
                  >
                    <ChevronRight size={30} />
                  </button>
                </>
              ) : null}

              {tourMedia.length ? (
                <button
                  className="video-badge"
                  type="button"
                  onClick={() => openGallery(gallery.indexOf(tourMedia[0]!))}
                >
                  <Play size={13} fill="currentColor" />
                  Video quán
                </button>
              ) : null}

              <div className="hero-name">
                <h1>{displayName}</h1>
                <div>
                  <span>{[categoryLabel, location].filter(Boolean).join(" · ")}</span>
                  <b className={openNow ? "open" : "closed"}>
                    <i />
                    {openNow ? `Đang mở · ${todayOpening}` : "Đang nghỉ"}
                  </b>
                </div>
              </div>
            </section>

            {galleryTiles.length ? (
              <div className="mobile-gallery-strip" aria-label="Thư viện ảnh của quán">
                <div className="mobile-gallery-head">
                  <span>Thư viện ảnh</span>
                  <small>
                    {selectedGalleryIndex + 1}/{gallery.length}
                  </small>
                </div>
                <div className="mobile-gallery-rail hscroll">
                  {galleryTiles.map((item, index) => (
                    <button
                      key={`mobile-${item.id}-${index}`}
                      className={index === selectedGalleryIndex ? "active" : undefined}
                      type="button"
                      style={{ backgroundImage: galleryBackground(item, heroImage) }}
                      aria-label={`Mở nội dung ${index + 1}`}
                      onClick={() => openGallery(index)}
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
                <span>Giờ mở cửa</span>
              </div>
              <i />
              <div>
                <strong>{priceText}</strong>
                <span>Khoảng giá</span>
              </div>
              <i />
              <div>
                <strong>{store.casts.length || 0} cast</strong>
                <span>Đang phục vụ</span>
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
                  Chỉ đường
                </a>
              ) : null}
              {phoneHref ? (
                <a
                  href={phoneHref}
                  onClick={() => trackStoreDetailClick(store, "call", { surface: "hero-action" })}
                >
                  <PhoneCall size={16} />
                  Gọi điện
                </a>
              ) : null}
              <a href="#menu">
                <WalletCards size={16} />
                Thực đơn
              </a>
            </div>

            {galleryTiles.length ? (
              <div className="thumb-grid">
                {galleryTiles.map((item, index) => (
                  <button
                    key={`${item.id}-${index}`}
                    className={index === selectedGalleryIndex ? "active" : undefined}
                    type="button"
                    style={{ backgroundImage: galleryBackground(item, heroImage) }}
                    aria-label={`Mở nội dung ${index + 1}`}
                    onClick={() => openGallery(index)}
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
                      onClick={() =>
                        openGallery(gallery.indexOf(item) >= 0 ? gallery.indexOf(item) : index)
                      }
                    >
                      <Play size={18} fill="currentColor" />
                      <span>{item.purpose || "Video quán"}</span>
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
                <p>
                  <Star size={15} fill="currentColor" />
                  4.8 (18 đánh giá) · {[categoryLabel, location].filter(Boolean).join(" · ")}
                </p>
              </div>
              <b className={openNow ? "open-pill" : "closed-pill"}>
                <i />
                {openNow ? "Đang mở" : "Đang nghỉ"}
              </b>
            </div>

            <div className="desktop-stats">
              <div>
                <strong>{todayOpening}</strong>
                <span>Giờ mở cửa</span>
              </div>
              <div>
                <strong>{priceText}</strong>
                <span>Khoảng giá</span>
              </div>
              <div>
                <strong>{store.casts.length} cast</strong>
                <span>Đang phục vụ</span>
              </div>
            </div>

            <BookingCard
              store={store}
              selectedDateIso={selectedDate.iso}
              minDate={getTodayDate()}
              maxDate={getMaxBookingDate()}
              selectedTime={selectedTime}
              timeOptions={bookingTimeOptions}
              timeOptionGroups={bookingTimeOptionGroups}
              guestCount={guestCount}
              guestName={guestName}
              email={email}
              note={note}
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
              onFieldTouched={markBookingFieldTouched}
              onSubmit={submitDesktopBooking}
            />

            <section className="desktop-about-inline">
              <div className="feature-chips">
                {[categoryLabel, ...(store.tags || [])].map((chip) => (
                  <span key={chip}>{chip}</span>
                ))}
              </div>
              <IntroCopy text={introText} />
            </section>

            <section className="mobile-about-section">
              <SectionTitle title="Giới thiệu" />
              <IntroCopy text={introText} />
              <div className="feature-chips">
                {[categoryLabel, ...(store.tags || [])].map((chip) => (
                  <span key={chip}>{chip}</span>
                ))}
              </div>
              <div className="language-grid">
                {languageCards.map((card) => (
                  <div key={card.label}>
                    <span>{card.label}</span>
                    <strong>{card.value}</strong>
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
                      onClick={() =>
                        openGallery(gallery.indexOf(item) >= 0 ? gallery.indexOf(item) : index)
                      }
                    >
                      <Play size={18} fill="currentColor" />
                      <span>{item.purpose || "Video quán"}</span>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            <section>
              <SectionTitle title="Cast đang làm" meta={`${store.casts.length} cast`} />
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

        <RelatedStores stores={recommendedStores} />
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
            Đặt bàn ngay
            <small>Gửi yêu cầu · không thu cọc</small>
          </span>
        </Link>
        </div>,
        portalTarget,
      ) : null}

      {isLightboxOpen && lightboxMedia ? (
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
            onClick={() => setIsLightboxOpen(false)}
          >
            <X size={22} />
          </button>
          {gallery.length > 1 ? (
            <button
              className="lightbox-nav previous"
              type="button"
              aria-label="Media trước"
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
                <video src={lightboxVideoUrl || lightboxMedia.url} controls autoPlay />
              )
            ) : (
              <img src={lightboxMedia.url} alt={lightboxMedia.alt || displayName} />
            )}
          </div>
          {gallery.length > 1 ? (
            <button
              className="lightbox-nav next"
              type="button"
              aria-label="Media sau"
              onClick={showNextMedia}
            >
              <ChevronRight size={28} />
            </button>
          ) : null}
          <div className="lightbox-caption">
            {selectedGalleryIndex + 1}/{gallery.length}
            {lightboxMedia.purpose ? ` · ${lightboxMedia.purpose}` : ""}
          </div>
        </div>
      ) : null}

      <style>{`
        .store-detail-page {
          --store-mobile-nav-height: calc(74px + env(safe-area-inset-bottom));
          --store-mobile-cta-height: 76px;
          min-height: 100vh;
          background: var(--vy-bg);
          color: var(--vy-text);
          font-family: var(--nl-font-sans);
          padding-bottom: 86px;
        }

        .nl-page-content:has(.store-detail-page) {
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
        }

        .hero-top,
        .hero-name,
        .hero-media-nav,
        .video-badge {
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
          border: 1px solid rgba(182, 146, 74, .54);
          border-radius: 50%;
          background: linear-gradient(135deg, #f7e8b9, #d4b26a 56%, #b6924a);
          color: var(--vy-on-gold);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          box-shadow: 0 12px 26px rgba(79, 57, 19, .24);
          cursor: pointer;
          padding: 0;
        }

        .round-action.hero-back {
          display: none;
        }

        .store-favorite-action {
          color: #4f3710;
        }

        .store-favorite-action.is-active {
          background: linear-gradient(135deg, #ffe99d, #e0b747 54%, #c29636);
          border-color: rgba(143, 95, 27, .44);
          color: #7b4c11;
        }

        .hero-media-nav {
          top: 50%;
          width: 46px;
          height: 64px;
          border: 1px solid rgba(182, 146, 74, .5);
          border-radius: 999px;
          background: linear-gradient(135deg, #f7e8b9, #d4b26a 56%, #b6924a);
          color: var(--vy-on-gold);
          display: grid;
          place-items: center;
          transform: translateY(-50%);
          cursor: pointer;
          box-shadow: 0 14px 28px rgba(79, 57, 19, .22);
          text-shadow: none;
        }

        .hero-media-nav.previous {
          left: 14px;
        }

        .hero-media-nav.next {
          right: 14px;
        }

        .video-badge {
          left: 14px;
          top: 14px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border: 1px solid rgba(212, 178, 106, .42);
          border-radius: 999px;
          background: rgba(12, 12, 15, .5);
          color: #f0e6d2;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0;
          text-transform: uppercase;
          padding: 7px 12px;
          backdrop-filter: blur(6px);
          cursor: pointer;
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
          color: #bfb7aa;
          background: var(--vy-surface-2);
          border: 1px solid var(--vy-border);
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
          color: #8f6620;
          background: #fffaf0;
          border: 1px solid rgba(212, 178, 106, .32);
          box-shadow: 0 8px 20px rgba(182, 146, 74, .12);
        }

        .secondary-actions a:first-child {
          color: var(--vy-on-gold);
          background: linear-gradient(135deg, #fff3ca, #e8c46d 58%, #c89b3f);
          border-color: rgba(182, 146, 74, .46);
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
          padding-bottom: 2px;
        }

        .mobile-gallery-rail button {
          position: relative;
          flex: 0 0 78px;
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
          border: 1px solid rgba(212, 178, 106, .28);
          border-radius: 8px;
          background: linear-gradient(135deg, rgba(212, 178, 106, .1), rgba(255, 255, 255, .025));
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
          border-bottom: 1px solid rgba(212, 178, 106, .14);
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
          color: #e3c27e;
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
          border: 1px solid rgba(212, 178, 106, .28);
          border-radius: 8px;
          background: rgba(212, 178, 106, .1);
        }

        .member-nudge svg,
        .booking-safe svg,
        .menu-note svg {
          flex: none;
          color: #e3c27e;
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

        .booking-schedule-grid {
          display: grid;
          grid-template-columns: minmax(130px, .82fr) minmax(150px, 1fr) minmax(150px, 1fr);
          gap: 12px;
          align-items: stretch;
        }

        .booking-schedule-grid .booking-date-time-fields {
          display: contents;
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
          background: linear-gradient(135deg, #f4e3b4, #d4b26a 55%, #b6924a);
          border-color: transparent;
        }

        .slot-empty {
          display: block;
          width: 100%;
          padding: 9px 10px;
          border: 1px dashed rgba(212, 178, 106, .28);
          border-radius: 8px;
          color: #b7afa1;
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

        .guest-stepper strong {
          color: var(--vy-text);
          font-size: 13px;
        }

        .booking-note-box {
          display: block;
          width: 100%;
          min-height: 58px;
          max-height: 110px;
          margin-bottom: 0;
          padding: 12px;
          border: 1px solid rgba(212, 178, 106, .2);
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
          border-color: rgba(227, 194, 126, .58);
          box-shadow: 0 0 0 2px rgba(212, 178, 106, .1);
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
        .booking-card .booking-field .nl-booking-ant-select.ant-select-focused .ant-select-selector {
          border: 0 !important;
          box-shadow: none !important;
        }

        .booking-card .booking-field .nl-booking-ant-select .ant-select-selection-item,
        .booking-card .booking-field .nl-booking-ant-select .ant-select-selection-placeholder {
          color: var(--vy-text) !important;
          font-size: 13px;
          font-weight: 850;
          line-height: 28px !important;
          min-height: 28px !important;
        }

        .booking-card .booking-field .nl-booking-ant-select .ant-select-arrow {
          color: #d4b26a !important;
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

        .booking-field-error {
          display: block;
          margin-top: 6px;
          color: #ff9caf;
          font-size: 11.5px;
          font-weight: 760;
          line-height: 1.35;
        }

        :global(html.vy-light) .booking-error {
          border-color: rgba(194, 69, 92, .34);
          background: rgba(194, 69, 92, .12);
          color: #8f1f33;
          font-weight: 760;
        }

        :global(html.vy-light) .booking-field-error {
          color: #9b223a;
        }

        .primary-action {
          background: linear-gradient(135deg, #f0dda8, #d4b26a 55%, #b6924a);
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
          color: #e3c27e;
          background: var(--vy-surface-2);
          border: 1px solid rgba(212, 178, 106, .3);
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
          z-index: 120;
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
        }

        .lightbox-nav.previous {
          left: 22px;
        }

        .lightbox-nav.next {
          right: 22px;
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
            scroll-padding-bottom: calc(168px + env(safe-area-inset-bottom)) !important;
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
            border-color: rgba(182, 146, 74, .5);
            background: linear-gradient(135deg, #f7e8b9, #d4b26a 56%, #b6924a);
            color: var(--vy-on-gold);
          }

          .hero-media-nav.previous {
            left: 10px;
          }

          .hero-media-nav.next {
            right: 10px;
          }

          .video-badge {
            display: none;
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
            background: color-mix(in srgb, var(--vy-bg) 94%, #f0dda8 6%);
            border-top: 1px solid rgba(212, 178, 106, .34);
            box-sizing: border-box;
            box-shadow: 0 -12px 30px rgba(105, 75, 21, .16);
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
            box-shadow: 0 10px 22px rgba(105, 75, 21, .18);
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
