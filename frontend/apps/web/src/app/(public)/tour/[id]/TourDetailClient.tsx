"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Mail,
  Minus,
  Plus,
  Route,
  ShieldCheck,
  Sparkles,
  Tag,
  UserRound,
  Users,
} from "lucide-react";
import { BookingDateTimeFields } from "@/components/ui/BookingDateTimeFields";
import { PlaceholderMedia } from "@/components/ui/MediaPlaceholder";
import { bookingApi, rememberLastBooking, type CreateBookingPayload } from "@/lib/api/bookings";
import { ApiError, getAuthToken, translateApiMessage } from "@/lib/api/client";
import { requestMemberNotificationsRefresh } from "@/lib/api/notifications";
import type { PublicTour, TourStopStore, TourStoreCast } from "@/lib/api/tours";
import { getAuthUser } from "@/lib/auth/session";
import {
  buildBookingTimeSlots,
  buildScheduledAtFromBookingSlot,
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
  buildBookingFieldErrors,
  firstBookingFieldError,
  touchAllBookingFields,
  visibleBookingFieldErrors,
  type BookingTouchedFields,
  type BookingValidationField,
} from "@/lib/booking-field-validation";
import { translateText } from "@/lib/i18n/client-translations";
import { useActiveLanguage, type LanguageCode } from "@/lib/i18n/use-active-language";
import styles from "./TourDetailClient.module.css";

const { bookingDateWindowDays, maxGuests } = bookingValidationLimits;

const bookingAutofillBlockProps = {
  autoComplete: "new-password",
  "aria-autocomplete": "none",
  "data-1p-ignore": "true",
  "data-form-type": "other",
  "data-lpignore": "true",
} as const;

const categoryLabels: Record<string, string> = {
  BAR: "Bar",
  CLUB: "Club",
  LOUNGE: "Lounge",
  GIRLS_BAR: "Girls bar",
  KARAOKE: "Karaoke/KTV",
  MASSAGE_SPA: "Spa",
  RESTAURANT: "Nhà hàng",
  CASINO: "Casino",
};

type TourCastOption = TourStoreCast & {
  storeId: string;
  storeSlug: string;
  storeName: string;
  storeOpeningHours?: Record<string, unknown> | null;
};

type TourDetailClientProps = {
  tour: PublicTour;
};

const priceTierLabel = (tier: number) => "$".repeat(Math.max(1, Math.min(4, Math.trunc(tier || 3))));

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

const normalizeTimeOption = (value: string) => {
  const match = value.trim().match(/^(\d{1,2})(?::(\d{2}))?$/);
  if (!match) return "";

  const hours = Number(match[1]);
  const minutes = Number(match[2] ?? "0");
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return "";
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return "";

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const formatCity = (tour: PublicTour) => tour.stops[0]?.store.area?.city || tour.city || "NightLife";

const tourCover = (tour: PublicTour) =>
  tour.coverUrl || tour.stops.find((stop) => stop.store.media[0])?.store.media[0]?.url || "";

const storeImage = (store: TourStopStore) => store.media[0]?.url || "";

const castName = (cast: TourStoreCast) => cast.publicAlias || cast.stageName;

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

const tourAdminNote = (tour: PublicTour, selectedCast: TourCastOption | null, customerNote: string) => {
  const stopNames = tour.stops.map((stop) => stop.store.name).join(" > ");
  const lines = [
    `Tour: ${tour.title}`,
    stopNames ? `Diem dung: ${stopNames}` : "",
    selectedCast ? `Cast dong hanh: ${castName(selectedCast)} @ ${selectedCast.storeName}` : "",
    customerNote ? `Ghi chu khach: ${customerNote}` : "",
  ].filter(Boolean);

  return normalizeBookingNote(lines.join(" | ")).slice(0, bookingValidationLimits.maxNoteLength);
};

export default function TourDetailClient({ tour }: TourDetailClientProps) {
  const router = useRouter();
  const activeLanguage = useActiveLanguage();
  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [bookingDate, setBookingDate] = useState(getTodayDate);
  const [bookingTime, setBookingTime] = useState("");
  const [guests, setGuests] = useState(2);
  const [note, setNote] = useState("");
  const [selectedCastSlug, setSelectedCastSlug] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [touchedFields, setTouchedFields] = useState<BookingTouchedFields>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const firstStop = tour.stops[0];
  const firstStore = firstStop?.store;
  const tourCasts = useMemo<TourCastOption[]>(
    () =>
      tour.stops.flatMap((stop) =>
        stop.store.casts.map((cast) => ({
          ...cast,
          storeId: stop.store.id,
          storeSlug: stop.store.slug,
          storeName: stop.store.name,
          storeOpeningHours: stop.store.openingHours,
        })),
      ),
    [tour.stops],
  );
  const selectedCast = tourCasts.find((cast) => cast.slug === selectedCastSlug) ?? null;
  const bookingStore =
    selectedCast && tour.stops.find((stop) => stop.store.slug === selectedCast.storeSlug)?.store
      ? tour.stops.find((stop) => stop.store.slug === selectedCast.storeSlug)!.store
      : firstStore;
  const explicitDepartureTimes = useMemo(
    () =>
      Array.from(
        new Set(tour.departureTimes.map(normalizeTimeOption).filter(Boolean)),
      ).sort(),
    [tour.departureTimes],
  );
  const bookingTimeOptions = useMemo(
    () =>
      explicitDepartureTimes.length
        ? explicitDepartureTimes
        : buildBookingTimeSlots(bookingStore?.openingHours, bookingDate, { fallback: "empty" }),
    [bookingDate, bookingStore?.openingHours, explicitDepartureTimes],
  );

  useEffect(() => {
    const user = getAuthUser();
    if (!user) return;

    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setGuestName(user.displayName ?? user.email ?? "");
      setEmail(user.email ?? "");
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!bookingTimeOptions.length) {
      if (bookingTime) {
        let cancelled = false;
        queueMicrotask(() => {
          if (!cancelled) setBookingTime("");
        });
        return () => {
          cancelled = true;
        };
      }
      return;
    }

    if (!bookingTimeOptions.includes(bookingTime)) {
      let cancelled = false;
      queueMicrotask(() => {
        if (!cancelled) setBookingTime(bookingTimeOptions[0] ?? "");
      });
      return () => {
        cancelled = true;
      };
    }
  }, [bookingTime, bookingTimeOptions]);

  const scheduledPreviewAt = buildScheduledAtFromBookingSlot(
    bookingDate,
    bookingTime,
    explicitDepartureTimes.length ? undefined : bookingStore?.openingHours,
  );
  const fieldErrors = useMemo(
    () =>
      buildBookingFieldErrors({
        availableTimes: bookingTimeOptions,
        bookingDate,
        bookingTime,
        displayName: normalizeBookingDisplayName(guestName),
        email: normalizeBookingEmail(email),
        guestCount: guests,
        maxDate: getMaxBookingDate(),
        note: normalizeBookingNote(note),
        scheduledAt: scheduledPreviewAt,
        todayDate: getTodayDate(),
      }),
    [
      bookingDate,
      bookingTime,
      bookingTimeOptions,
      email,
      guestName,
      guests,
      note,
      scheduledPreviewAt,
    ],
  );
  const visibleFieldErrors = useMemo(
    () => visibleBookingFieldErrors(fieldErrors, touchedFields, submitAttempted),
    [fieldErrors, submitAttempted, touchedFields],
  );
  const markFieldTouched = (field: BookingValidationField) => {
    setTouchedFields((current) => (current[field] ? current : { ...current, [field]: true }));
    setErrorMessage("");
  };

  const targetLabel = selectedCast ? `${castName(selectedCast)} @ ${selectedCast.storeName}` : firstStore?.name;
  const canSubmit = Boolean(firstStore && bookingStore && bookingTimeOptions.length);

  const submitBooking = async () => {
    if (isSubmitting) return;

    setErrorMessage("");
    setSubmitAttempted(true);
    setTouchedFields(touchAllBookingFields());

    const displayName = normalizeBookingDisplayName(guestName);
    const normalizedEmail = normalizeBookingEmail(email);
    const trimmedNote = normalizeBookingNote(note);
    const scheduledAt = buildScheduledAtFromBookingSlot(
      bookingDate,
      bookingTime,
      explicitDepartureTimes.length ? undefined : bookingStore?.openingHours,
    );
    const validationError = firstBookingFieldError(buildBookingFieldErrors({
      availableTimes: bookingTimeOptions,
      bookingDate,
      bookingTime,
      displayName,
      email: normalizedEmail,
      guestCount: guests,
      maxDate: getMaxBookingDate(),
      note: trimmedNote,
      scheduledAt,
      todayDate: getTodayDate(),
    }));

    setGuestName(displayName);
    setEmail(normalizedEmail);
    setNote(trimmedNote);

    if (validationError) return;
    if (!bookingStore) {
      setErrorMessage("Tour này chưa có điểm dừng hợp lệ để đặt.");
      return;
    }

    const payload: CreateBookingPayload = {
      storeSlug: bookingStore.slug,
      ...(selectedCast ? { castSlug: selectedCast.slug } : {}),
      displayName,
      email: normalizedEmail,
      scheduledAt,
      partySize: guests,
      note: tourAdminNote(tour, selectedCast, trimmedNote),
    };

    try {
      setIsSubmitting(true);
      const currentUser = getAuthUser();
      const shouldUseMemberBooking = currentUser?.role?.toUpperCase() === "USER" && Boolean(getAuthToken());
      let savedAsMemberBooking = false;
      let booking;

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
      setErrorMessage(
        localizedApiErrorMessage(error, activeLanguage, "Không gửi được yêu cầu đặt tour."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.page} data-no-scroll-reveal="true">
      <div className={styles.shell}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">
            Trang chủ
          </Link>
          <ChevronRight size={14} />
          <Link href="/tour">Tour</Link>
          <ChevronRight size={14} />
          <strong>{tour.title}</strong>
        </nav>

        <div className={styles.layout}>
          <div className={styles.mainColumn}>
            <section className={styles.hero}>
              <PlaceholderMedia
                src={tourCover(tour)}
                alt={tour.title}
                label="Chưa có ảnh tour"
                className={styles.heroMedia}
              >
                <div className={styles.heroOverlay}>
                  <div className={styles.heroCopy}>
                    <span className={styles.eyebrow}>
                      <Sparkles size={14} /> Tour trải nghiệm
                    </span>
                    <h1 className={styles.heroTitle}>{tour.title}</h1>
                    {tour.subtitle ? <p className={styles.heroText}>{tour.subtitle}</p> : null}
                  </div>
                </div>
              </PlaceholderMedia>
              <div className={styles.heroStats}>
                <div className={styles.heroStat}>
                  <strong>{tour.stops.length} điểm</strong>
                  <span>Điểm dừng chân</span>
                </div>
                <div className={styles.heroStat}>
                  <strong>{tour.durationHours} giờ</strong>
                  <span>Tổng thời lượng</span>
                </div>
                <div className={styles.heroStat}>
                  <strong>{priceTierLabel(tour.priceTier)}</strong>
                  <span>Mức chi phí</span>
                </div>
              </div>
            </section>

            <section className={styles.sectionCard}>
              <span className={styles.sectionEyebrow}>
                <Route size={14} /> Hành trình
              </span>
              <h2 className={styles.sectionTitle}>Lịch trình chi tiết các điểm dừng</h2>
              <p className={styles.sectionText}>
                Mỗi điểm dừng lấy từ dữ liệu quán thật trong admin, gồm loại hình, khu vực và ưu đãi đang còn hiệu lực.
              </p>

              <div className={styles.timeline}>
                {tour.stops.map((stop) => (
                  <article key={stop.id} className={styles.stopCard}>
                    <div className={styles.stopIndex}>{stop.order}</div>
                    <PlaceholderMedia
                      src={storeImage(stop.store)}
                      alt={stop.store.name}
                      label="Chưa có ảnh quán"
                      className={styles.stopMedia}
                    />
                    <div className={styles.stopCopy}>
                      <div className={styles.stopMeta}>
                        <span>{categoryLabels[stop.store.category] ?? stop.store.category}</span>
                        <span>{stop.store.area?.name || stop.store.district || formatCity(tour)}</span>
                      </div>
                      <h3 className={styles.stopTitle}>{stop.store.name}</h3>
                      {stop.store.description ? <p className={styles.stopText}>{stop.store.description}</p> : null}
                      {stop.store.coupons[0] ? (
                        <span className={styles.couponPill}>
                          <Tag size={13} /> {stop.store.coupons[0].name}
                        </span>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {tourCasts.length ? (
              <section className={styles.sectionCard}>
                <span className={styles.sectionEyebrow}>
                  <Users size={14} /> Cast đồng hành
                </span>
                <h2 className={styles.sectionTitle}>Chọn cast trong hành trình nếu muốn</h2>
                <p className={styles.sectionText}>
                  Nếu chọn cast, booking tour sẽ gắn vào đúng quán của cast đó để admin điều phối chính xác.
                </p>
                <div className={styles.castGrid}>
                  <button
                    type="button"
                    className={styles.castButton}
                    data-selected={!selectedCastSlug}
                    onClick={() => setSelectedCastSlug("")}
                  >
                    <span className={styles.castAvatar} />
                    <span>
                      <span className={styles.castName}>Không chọn cast</span>
                      <span className={styles.castMeta}>Trải nghiệm tự do</span>
                    </span>
                    {!selectedCastSlug ? <Check size={17} color="#d4b26a" /> : null}
                  </button>
                  {tourCasts.map((cast) => (
                    <button
                      type="button"
                      key={`${cast.storeId}-${cast.id}`}
                      className={styles.castButton}
                      data-selected={selectedCastSlug === cast.slug}
                      onClick={() => setSelectedCastSlug(cast.slug)}
                    >
                      <span
                        className={styles.castAvatar}
                        role={cast.thumbnailUrl ? "img" : undefined}
                        aria-label={cast.thumbnailUrl ? castName(cast) : undefined}
                        style={cast.thumbnailUrl ? { backgroundImage: `url(${JSON.stringify(cast.thumbnailUrl)})` } : undefined}
                      />
                      <span>
                        <span className={styles.castName}>{castName(cast)}</span>
                        <span className={styles.castMeta}>{cast.storeName}</span>
                      </span>
                      {selectedCastSlug === cast.slug ? <Check size={17} color="#d4b26a" /> : null}
                    </button>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className={styles.bookingCard} id="tour-booking">
            <div className={styles.bookingHeader}>
              <div>
                <h2>Đặt tour này</h2>
                <p>{targetLabel ? `Điểm điều phối: ${targetLabel}` : "Tour chưa có điểm dừng hợp lệ"}</p>
              </div>
              <div className={styles.priceTier}>{priceTierLabel(tour.priceTier)}</div>
            </div>

            <form
              className={styles.form}
              onSubmit={(event) => {
                event.preventDefault();
                submitBooking();
              }}
            >
              <TextField
                label="Họ tên"
                value={guestName}
                placeholder="Vui lòng nhập họ tên"
                icon={<UserRound size={16} />}
                error={visibleFieldErrors.guestName}
                onChange={(value) => setGuestName(sanitizeBookingDisplayNameInput(value))}
                onTouched={() => markFieldTouched("guestName")}
              />

              <TextField
                label="Email"
                value={email}
                placeholder="Vui lòng nhập email"
                icon={<Mail size={16} />}
                error={visibleFieldErrors.email}
                onChange={setEmail}
                onTouched={() => markFieldTouched("email")}
              />

              <div className={styles.dateTime}>
                <BookingDateTimeFields
                  dateValue={bookingDate}
                  dateLabel="Ngày"
                  timeValue={bookingTime}
                  timeLabel="Khung giờ"
                  timeOptions={bookingTimeOptions}
                  minDate={getTodayDate()}
                  maxDate={getMaxBookingDate()}
                  onDateChange={(value) => {
                    markFieldTouched("bookingDate");
                    setBookingDate(value);
                  }}
                  onTimeChange={(value) => {
                    markFieldTouched("bookingTime");
                    setBookingTime(value);
                  }}
                  dateError={visibleFieldErrors.bookingDate}
                  timeError={visibleFieldErrors.bookingTime}
                  errorPlacement="outside"
                  labelClassName={styles.label}
                  emptyMessage="Tour chưa có khung giờ khả dụng trong ngày này."
                />
              </div>

              <div className={styles.field}>
                <span className={styles.label}>Số khách</span>
                <div className={styles.guestControl}>
                  <button
                    type="button"
                    className={styles.guestButton}
                    onClick={() => {
                      markFieldTouched("guestCount");
                      setGuests((value) => clampBookingGuestCount(value - 1));
                    }}
                    disabled={guests <= 1}
                    aria-label="Giảm số khách"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    {...bookingAutofillBlockProps}
                    className={`${styles.input} ${styles.guestInput}`}
                    type="text"
                    inputMode="numeric"
                    value={String(guests)}
                    onBlur={() => markFieldTouched("guestCount")}
                    onChange={(event) => {
                      markFieldTouched("guestCount");
                      setGuests(sanitizeBookingGuestCountInput(event.target.value));
                    }}
                    aria-label="Số khách"
                  />
                  <button
                    type="button"
                    className={styles.guestButton}
                    onClick={() => {
                      markFieldTouched("guestCount");
                      setGuests((value) => clampBookingGuestCount(value + 1));
                    }}
                    disabled={guests >= maxGuests}
                    aria-label="Tăng số khách"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <span className={styles.fieldError}>{visibleFieldErrors.guestCount}</span>
              </div>

              <div className={styles.field}>
                <span className={styles.label}>Ghi chú tuỳ chọn</span>
                <textarea
                  autoComplete="off"
                  className={styles.textarea}
                  value={note}
                  onBlur={() => markFieldTouched("note")}
                  onChange={(event) => {
                    markFieldTouched("note");
                    setNote(event.target.value);
                  }}
                  placeholder="Ví dụ: cần bàn yên tĩnh, đi theo nhóm..."
                />
                <span className={styles.fieldError}>{visibleFieldErrors.note}</span>
              </div>

              {errorMessage ? <div className={styles.formError}>{errorMessage}</div> : null}

              <button type="submit" className={styles.submitButton} disabled={!canSubmit || isSubmitting}>
                <CalendarDays size={17} />
                {isSubmitting ? "Đang gửi yêu cầu..." : "Gửi yêu cầu đặt tour"}
              </button>

              <div className={styles.note}>
                <ShieldCheck size={15} />
                <span>Không thanh toán online. Admin xác nhận tour và gửi QR ưu đãi theo booking sau khi đặt thành công.</span>
              </div>
            </form>
          </aside>
        </div>
      </div>

      <a className={styles.mobileCta} href="#tour-booking">
        <Clock3 size={17} /> Đặt tour này
      </a>
    </main>
  );
}

function TextField({
  label,
  value,
  placeholder,
  icon,
  error,
  onChange,
  onTouched,
}: {
  label: string;
  value: string;
  placeholder: string;
  icon: ReactNode;
  error?: string;
  onChange: (value: string) => void;
  onTouched: () => void;
}) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <span style={{ position: "relative", display: "block" }}>
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 13,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#d4b26a",
            display: "grid",
            placeItems: "center",
          }}
        >
          {icon}
        </span>
        <input
          {...bookingAutofillBlockProps}
          className={styles.input}
          value={value}
          onBlur={onTouched}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          style={{ paddingLeft: 40 }}
        />
      </span>
      <span className={styles.fieldError}>{error}</span>
    </label>
  );
}
