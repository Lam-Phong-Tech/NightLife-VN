"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { bookingApi, rememberLastBooking, type CreateBookingPayload } from "@/lib/api/bookings";
import { apiClient } from "@/lib/api/client";
import type { PublicStoreDetail, RelatedStore, StoreGalleryItem } from "@/lib/api/store-detail";
import {
  buildBookingTimeSlots,
  buildScheduledAtFromBookingSlot,
  normalizeStoreOpeningHours,
} from "@/lib/booking-time-slots";
import { isFavoriteStore, writeFavoriteStore } from "@/lib/member-favorites";
import { formatPriceTier, formatPriceTierRange } from "@/lib/price-tier";
import {
  categoryLabels,
  formatDateOption,
  mapEmbedUrl,
  mediaBackground,
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

type IntroLine = {
  key: "ja" | "vi";
  text: string;
};

const introMarkerPattern = /(?:🇯🇵|🇻🇳|🇬🇧|🇺🇸|\bJP\b|\bVN\b|\bGB\b|\bEN\b)/gi;
const japaneseTextPattern = /[\u3040-\u30ff\u3400-\u9fff]/;
const vietnameseTextPattern =
  /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

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

const bookingDateWindowDays = 14;
const maxBookingGuests = 50;
const minBookingNameLength = 2;
const maxBookingNameLength = 80;
const maxBookingEmailLength = 160;
const maxBookingNoteLength = 300;
const bookingEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const bookingEmailDomainLabelPattern = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
const bookingDisplayNamePattern = /^[\p{L}\s]+$/u;

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
  return null;
};

function buildIntroLines(description?: string | null): IntroLine[] {
  const fallback = "Không gian, dịch vụ và cast của quán sẽ được cập nhật trước khi nhận đặt chỗ.";
  const source = description?.trim();

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

    const markedLines = (["ja", "vi"] as const)
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
  const vietnameseLine = chunks.filter((chunk) => vietnameseTextPattern.test(chunk)).join(" ");
  const detectedLines: IntroLine[] = [
    japaneseLine ? { key: "ja", text: japaneseLine } : null,
    vietnameseLine ? { key: "vi", text: vietnameseLine } : null,
  ].filter((line): line is IntroLine => Boolean(line));

  return detectedLines.length ? detectedLines : [{ key: "vi", text: source }];
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
  if (media?.type === "IMAGE" && media.url) return media.url;
  if (fallback?.type === "IMAGE" && fallback.url) return fallback.url;
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

const normalizeBookingDisplayName = (value: string) => value.trim().replace(/\s+/g, " ");
const sanitizeBookingDisplayNameInput = (value: string) =>
  value.replace(/[^\p{L}\s]/gu, "").replace(/\s{2,}/g, " ");
const normalizeBookingEmail = (value: string) => value.trim().toLowerCase();

function validateBookingEmail(value: string) {
  if (!value) {
    return "Vui lòng nhập email.";
  }

  if (value.length > maxBookingEmailLength) {
    return `Email tối đa ${maxBookingEmailLength} ký tự.`;
  }

  const atParts = value.split("@");
  if (atParts.length !== 2) {
    return "Email chưa đúng định dạng.";
  }

  const [localPart, domainPart] = atParts;

  if (!localPart) {
    return "Phần trước dấu @ không được để trống.";
  }

  if (localPart.length > 64) {
    return "Phần trước dấu @ không được vượt quá 64 ký tự.";
  }

  if (!domainPart) {
    return "Phần sau dấu @ không được để trống.";
  }

  if (domainPart.length > 253) {
    return "Phần sau dấu @ không được vượt quá 253 ký tự.";
  }

  const domainLabels = domainPart.split(".");

  if (domainLabels.length < 2 || domainLabels.some((label) => !label)) {
    return "Phần sau dấu @ phải là tên miền hợp lệ, ví dụ gmail.com.";
  }

  if (domainLabels.some((label) => label.length > 63)) {
    return "Mỗi phần của tên miền sau dấu @ không được vượt quá 63 ký tự.";
  }

  if (!domainLabels.every((label) => bookingEmailDomainLabelPattern.test(label))) {
    return "Tên miền sau dấu @ chỉ được gồm chữ, số, dấu gạch ngang và không bắt đầu/kết thúc bằng dấu gạch ngang.";
  }

  if (!bookingEmailPattern.test(value)) {
    return "Email chưa đúng định dạng.";
  }

  return "";
}

const validateStoreBookingForm = ({
  displayName,
  email,
  guestCount,
  bookingDate,
  note,
}: {
  displayName: string;
  email: string;
  guestCount: number;
  bookingDate: string;
  note: string;
}) => {
  if (displayName.length < minBookingNameLength) {
    return `Vui lòng nhập họ tên từ ${minBookingNameLength} ký tự.`;
  }

  if (displayName.length > maxBookingNameLength) {
    return `Họ tên tối đa ${maxBookingNameLength} ký tự.`;
  }

  if (!bookingDisplayNamePattern.test(displayName)) {
    return "Họ tên chỉ được nhập chữ cái và khoảng trắng.";
  }

  const emailValidationMessage = validateBookingEmail(email);
  if (emailValidationMessage) {
    return emailValidationMessage;
  }

  if (!bookingEmailPattern.test(email)) {
    return "Vui lòng nhập email hợp lệ.";
  }

  if (email.length > maxBookingEmailLength) {
    return `Email tối đa ${maxBookingEmailLength} ký tự.`;
  }

  if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > maxBookingGuests) {
    return `Số người chỉ được từ 1 đến ${maxBookingGuests}.`;
  }

  if (bookingDate < getTodayDate() || bookingDate > getMaxBookingDate()) {
    return `Ngày đặt bàn chỉ được chọn từ hôm nay đến ${bookingDateWindowDays} ngày tới.`;
  }

  if (note.length > maxBookingNoteLength) {
    return `Ghi chú tối đa ${maxBookingNoteLength} ký tự.`;
  }

  return "";
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
  onClick,
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button className="round-action" type="button" aria-label={label} onClick={onClick}>
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

function BookingCard({
  store,
  dateOptions,
  selectedDateIndex,
  selectedTime,
  timeOptions,
  guestCount,
  guestName,
  email,
  note,
  isSubmitting,
  errorMessage,
  onDateSelect,
  onTimeSelect,
  onGuestCountChange,
  onGuestNameChange,
  onEmailChange,
  onNoteChange,
  onSubmit,
}: {
  store: PublicStoreDetail;
  dateOptions: Array<{ label: string; iso: string }>;
  selectedDateIndex: number;
  selectedTime: string;
  timeOptions: string[];
  guestCount: number;
  guestName: string;
  email: string;
  note: string;
  isSubmitting: boolean;
  errorMessage: string;
  onDateSelect: (index: number) => void;
  onTimeSelect: (time: string) => void;
  onGuestCountChange: (guestCount: number) => void;
  onGuestNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <aside className="booking-card" aria-label="Đặt bàn">
      <form
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

        <div className="booking-form-grid">
          <label className="booking-field booking-input-field">
            <span>Họ tên</span>
            <input
              value={guestName}
              onChange={(event) => onGuestNameChange(sanitizeBookingDisplayNameInput(event.target.value))}
              placeholder="Vui lòng nhập họ tên"
              autoComplete="name"
              maxLength={maxBookingNameLength}
            />
          </label>
          <label className="booking-field booking-input-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              placeholder="Vui lòng nhập email"
              autoComplete="email"
              inputMode="email"
              maxLength={maxBookingEmailLength}
            />
          </label>
          <div className="booking-field">
            <span>Số người</span>
            <div className="guest-stepper">
              <button
                type="button"
                aria-label="Giảm số khách"
                onClick={() => onGuestCountChange(Math.max(1, guestCount - 1))}
                disabled={guestCount <= 1}
              >
                <Minus size={15} />
              </button>
              <strong>{guestCount} người</strong>
              <button
                type="button"
                aria-label="Tăng số khách"
                onClick={() => onGuestCountChange(Math.min(maxBookingGuests, guestCount + 1))}
                disabled={guestCount >= maxBookingGuests}
              >
                <Plus size={15} />
              </button>
            </div>
          </div>
          <label className="booking-field">
            <span>Ngày</span>
            <select
              aria-label="Chọn ngày"
              value={selectedDateIndex}
              onChange={(event) => onDateSelect(Number(event.target.value))}
            >
              {dateOptions.map((date, index) => (
                <option key={date.iso} value={index}>
                  {date.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label>Khung giờ</label>
        <div className="slot-row">
          {timeOptions.length ? (
            timeOptions.map((time) => (
              <button
                key={time}
                type="button"
                className={time === selectedTime ? "slot active" : "slot"}
                onClick={() => onTimeSelect(time)}
              >
                {time}
              </button>
            ))
          ) : (
            <span className="slot-empty">Quán không có khung giờ đặt bàn trong ngày này.</span>
          )}
        </div>

        <label>Ghi chú tuỳ chọn</label>
        <textarea
          className="booking-note-box"
          value={note}
          onChange={(event) => onNoteChange(event.target.value)}
          placeholder="Vui lòng nhập ghi chú nếu có"
          maxLength={maxBookingNoteLength}
        />

        {errorMessage ? <div className="booking-error">{errorMessage}</div> : null}

        <button
          type="submit"
          data-testid="store-booking-cta-sidebar"
          className="primary-action full"
          disabled={isSubmitting}
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
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState(0);
  const [guestCount, setGuestCount] = useState(4);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState("21:00");
  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);
  const [bookingErrorMessage, setBookingErrorMessage] = useState("");
  const [isFavorite, setIsFavorite] = useState(() => isFavoriteStore(store.slug));
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const recommendedStores = useMemo(
    () => personalizeRelatedStores(store.relatedStores),
    [store.relatedStores],
  );

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
  const bookingTimeOptions = useMemo(
    () => buildBookingTimeSlots(normalizedOpeningHours ?? store.openingHours, selectedDate.iso),
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
    setBookingErrorMessage("");

    if (!selectedTime) {
      setBookingErrorMessage("Quán không có khung giờ đặt bàn trong ngày này.");
      return;
    }

    const displayName = normalizeBookingDisplayName(guestName);
    const normalizedEmail = normalizeBookingEmail(email);
    const trimmedNote = note.trim();

    const validationError = validateStoreBookingForm({
      displayName,
      email: normalizedEmail,
      guestCount,
      bookingDate: selectedDate.iso,
      note: trimmedNote,
    });

    if (validationError) {
      setBookingErrorMessage(validationError);
      return;
    }

    const payload: CreateBookingPayload = {
      storeSlug: store.slug,
      displayName,
      email: normalizedEmail,
      scheduledAt: buildScheduledAtFromBookingSlot(
        selectedDate.iso,
        selectedTime,
        normalizedOpeningHours ?? store.openingHours,
      ),
      partySize: guestCount,
      ...(trimmedNote ? { note: trimmedNote } : {}),
    };

    try {
      setIsBookingSubmitting(true);
      trackBookingClick("desktop-booking-card");
      const booking = await bookingApi.createGuestBooking(payload);

      rememberLastBooking(booking);
      router.push(`/xac-nhan?bookingId=${booking.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không gửi được yêu cầu đặt bàn.";
      setBookingErrorMessage(message);
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
                    onClick={toggleFavorite}
                  >
                    <Heart size={18} fill={isFavorite ? "var(--vy-favorite)" : "none"} color={isFavorite ? "var(--vy-favorite)" : "currentColor"} />
                  </IconButton>
                </div>
              </div>

              {selectedMedia ? (
                <button
                  className="hero-play"
                  type="button"
                  aria-label={selectedMedia.type === "VIDEO" ? "Mở video tour" : "Mở ảnh quán"}
                  onClick={() => openGallery(selectedGalleryIndex)}
                >
                  <Play size={25} fill="currentColor" />
                </button>
              ) : null}

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
              dateOptions={dateOptions}
              selectedDateIndex={selectedDateIndex}
              selectedTime={selectedTime}
              timeOptions={bookingTimeOptions}
              guestCount={guestCount}
              guestName={guestName}
              email={email}
              note={note}
              isSubmitting={isBookingSubmitting}
              errorMessage={bookingErrorMessage}
              onDateSelect={setSelectedDateIndex}
              onTimeSelect={setSelectedTime}
              onGuestCountChange={setGuestCount}
              onGuestNameChange={setGuestName}
              onEmailChange={setEmail}
              onNoteChange={setNote}
              onSubmit={submitDesktopBooking}
            />

            <section className="desktop-about-inline">
              <div className="feature-chips">
                {[categoryLabel, ...(store.tags || [])].map((chip) => (
                  <span key={chip}>{chip}</span>
                ))}
              </div>
              <div className="intro-copy" dangerouslySetInnerHTML={{ __html: store.description || '<p>Chưa có mô tả quán.</p>' }} />
            </section>

            <section className="mobile-about-section">
              <SectionTitle title="Giới thiệu" />
              <div className="intro-copy" dangerouslySetInnerHTML={{ __html: store.description || '<p>Chưa có mô tả quán.</p>' }} />
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

      <div className="mobile-cta">
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
      </div>

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
        .hero-play,
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
          border: 1px solid rgba(212, 178, 106, .34);
          border-radius: 50%;
          background: rgba(12, 12, 15, .48);
          color: var(--vy-text);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          backdrop-filter: blur(8px);
          cursor: pointer;
          padding: 0;
        }

        .round-action.hero-back {
          display: none;
        }

        .hero-play {
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 70px;
          height: 70px;
          border: 1px solid rgba(212, 178, 106, .62);
          border-radius: 50%;
          background: rgba(12, 12, 15, .42);
          color: var(--vy-gold-pale);
          display: flex;
          align-items: center;
          justify-content: center;
          padding-left: 4px;
          backdrop-filter: blur(8px);
          cursor: pointer;
          box-shadow: 0 12px 30px -12px rgba(0, 0, 0, .8);
        }

        .hero-media-nav {
          top: 50%;
          width: 46px;
          height: 64px;
          border: 1px solid rgba(244, 221, 155, .22);
          border-radius: 999px;
          background: rgba(12, 12, 15, .2);
          color: #f4dd9b;
          display: grid;
          place-items: center;
          transform: translateY(-50%);
          cursor: pointer;
          backdrop-filter: blur(6px);
          text-shadow: 0 2px 16px rgba(0, 0, 0, .72);
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
          color: #8be4ad;
          background: rgba(95, 191, 134, .13);
          border: 1px solid rgba(95, 191, 134, .38);
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
          color: #e3c27e;
          background: var(--vy-surface-2);
          border: 1px solid rgba(212, 178, 106, .28);
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
          background: rgba(12, 12, 15, .66);
          color: var(--vy-gold-pale);
          border: 1px solid rgba(212, 178, 106, .32);
          text-decoration: none;
          font-size: 12px;
          font-weight: 900;
          backdrop-filter: blur(8px);
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
          padding: 12px 16px;
          box-sizing: border-box;
          overflow: hidden;
        }

        .booking-card-form {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 0;
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
          justify-content: space-between;
          gap: 14px;
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
          gap: 8px;
          margin-top: 8px;
        }

        .booking-field {
          display: grid;
          align-content: center;
          min-height: 44px;
          padding: 7px 10px;
          border: 1px solid var(--vy-border);
          border-radius: 8px;
          background: var(--vy-surface-2);
        }

        .booking-card label.booking-field {
          margin: 0;
          letter-spacing: 0;
          text-transform: none;
        }

        .booking-field span,
        .booking-field strong {
          display: block;
        }

        .booking-field span {
          color: var(--vy-muted);
          font-size: 10px;
          font-weight: 900;
          line-height: 1.2;
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
          margin-top: 4px;
          border: 0;
          outline: none;
          background: transparent;
          color: var(--vy-text);
          font-size: 12px;
          font-weight: 800;
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
          margin-top: 4px;
        }

        .guest-stepper button {
          width: 24px;
          min-height: 24px;
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
          font-size: 12px;
        }

        .booking-note-box {
          display: block;
          width: 100%;
          min-height: 52px;
          padding: 9px 12px;
          border: 1px solid rgba(212, 178, 106, .2);
          border-radius: 8px;
          background: var(--vy-surface-2);
          color: var(--vy-text);
          font-size: 12px;
          font-family: inherit;
          line-height: 1.55;
          resize: vertical;
          outline: none;
        }

        .booking-field:focus-within,
        .booking-note-box:focus {
          border-color: rgba(227, 194, 126, .58);
          box-shadow: 0 0 0 2px rgba(212, 178, 106, .1);
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
          padding: 0 12px;
          text-align: center;
          white-space: normal;
          min-height: 40px;
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

        .mobile-cta {
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
            padding-bottom: 0;
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

          .hero-play {
            width: 64px;
            height: 64px;
          }

          .hero-media-nav {
            width: 42px;
            height: 60px;
            border-color: transparent;
            background: rgba(12, 12, 15, .12);
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

          .mobile-cta {
            position: fixed;
            left: 0;
            right: 0;
            bottom: calc(74px + env(safe-area-inset-bottom));
            z-index: 70;
            display: grid;
            grid-template-columns: minmax(0, 1fr);
            align-items: center;
            min-height: 76px;
            padding: 10px 14px;
            background: rgba(8, 8, 11, .94);
            border-top: 1px solid rgba(212, 178, 106, .2);
            box-shadow: 0 -18px 40px rgba(0, 0, 0, .34);
            backdrop-filter: blur(12px);
          }

          .mobile-cta div span,
          .mobile-cta div strong {
            display: block;
          }

          .mobile-cta div span {
            color: var(--vy-muted);
            font-size: 11px;
            font-weight: 800;
          }

          .mobile-cta div strong {
            margin-top: 3px;
            color: var(--vy-text);
            font-size: 16px;
            line-height: 1.2;
          }

          .mobile-cta .primary-action {
            min-height: 52px;
            padding: 0 12px;
            width: 100%;
          }

          .mobile-cta .primary-action span {
            display: grid;
            gap: 2px;
            line-height: 1.15;
          }

          .mobile-cta .primary-action small {
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
