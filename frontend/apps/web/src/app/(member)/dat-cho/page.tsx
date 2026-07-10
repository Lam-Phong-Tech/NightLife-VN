"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  Mail,
  Minus,
  Plus,
  ShieldCheck,
  Star,
  UserRound,
} from "lucide-react";
import { BookingDateTimeFields } from "@/components/ui/BookingDateTimeFields";
import { getAuthUser, type AuthUser } from "@/lib/auth/session";
import { bookingApi, rememberLastBooking, type CreateBookingPayload } from "@/lib/api/bookings";
import { getCastDetail } from "@/lib/api/cast-detail";
import { requestMemberNotificationsRefresh } from "@/lib/api/notifications";
import { getStoreDetail } from "@/lib/api/store-detail";
import {
  buildBookingTimeSlotGroups,
  buildScheduledAtFromBookingSlot,
} from "@/lib/booking-time-slots";
import {
  bookingValidationLimits,
  normalizeBookingDisplayName,
  normalizeBookingEmail,
  normalizeBookingNote,
  sanitizeBookingDisplayNameInput,
  validateBookingFormFields,
} from "@/lib/booking-validation";
import { translateText } from "@/lib/i18n/client-translations";
import { useActiveLanguage } from "@/lib/i18n/use-active-language";
import styles from "../booking-flow.module.css";

const { bookingDateWindowDays, maxGuests } = bookingValidationLimits;

const bookingAutofillBlockProps = {
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

type BookingContext = {
  storeSlug?: string;
  storeName: string;
  area?: string;
  castSlug?: string;
  castName?: string;
  couponId?: string;
  couponIssueId?: string;
  fromHref: string;
};

const defaultContext: BookingContext = {
  storeSlug: "neon-club",
  storeName: "Neon Club",
  area: "Tây Hồ",
  fromHref: "/stores/neon-club",
};

const isMemberUser = (user: AuthUser | null) => user?.role?.toUpperCase() === "USER";

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

const clampBookingDate = (value?: string | null) => {
  const today = getTodayDate();
  const maxDate = getMaxBookingDate();

  if (!value) return today;
  if (value < today) return today;
  if (value > maxDate) return maxDate;
  return value;
};

const parseRequestedMode = (value: string | null) => {
  if (value === "guest" || value === "member") return value;
  return null;
};

const fallbackCastNameFromSlug = (slug: string) => {
  const name = slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return name || "Cast đã chọn";
};

const parseContext = () => {
  const params = new URLSearchParams(window.location.search);
  const castSlug = params.get("castSlug") || undefined;
  const rawStoreSlug = params.get("storeSlug") || undefined;
  const storeSlug = rawStoreSlug || (castSlug ? undefined : defaultContext.storeSlug);
  const couponId = params.get("couponId") || undefined;
  const couponIssueId = params.get("couponIssueId") || undefined;

  return {
    context: {
      storeSlug,
      storeName: params.get("storeName") || defaultContext.storeName,
      area: params.get("area") || defaultContext.area,
      castSlug,
      castName: params.get("castName") || undefined,
      couponId,
      couponIssueId,
      fromHref: castSlug
        ? `/casts/${castSlug}`
        : `/stores/${storeSlug ?? defaultContext.storeSlug}`,
    },
    mode: parseRequestedMode(params.get("mode")),
    date: clampBookingDate(params.get("date")),
    time: params.get("time") || "21:00",
    guests: Number(params.get("guests") || 4),
  } as const;
};

export default function Page() {
  const router = useRouter();
  const activeLanguage = useActiveLanguage();
  const [mode, setMode] = useState<"guest" | "member">("guest");
  const [context, setContext] = useState<BookingContext>(defaultContext);
  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [bookingDate, setBookingDate] = useState(getTodayDate);
  const [bookingTime, setBookingTime] = useState("21:00");
  const [guests, setGuests] = useState(4);
  const [note, setNote] = useState("");
  const [storeOpeningHours, setStoreOpeningHours] = useState<Record<string, unknown> | null>(null);
  const [storeHoursResolved, setStoreHoursResolved] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const parsed = parseContext();
    const authUser = getAuthUser();
    const memberAccount = isMemberUser(authUser);

    queueMicrotask(() => {
      setContext(parsed.context);
      setBookingDate(parsed.date);
      setBookingTime(parsed.time || "21:00");
      setGuests(
        Number.isFinite(parsed.guests) ? Math.min(maxGuests, Math.max(1, parsed.guests)) : 4,
      );

      if (authUser) {
        setGuestName(authUser.displayName ?? authUser.email ?? "");
        setEmail(authUser.email ?? "");
      }

      if (memberAccount) {
        setMode("member");
        return;
      }

      if (parsed.mode === "member") {
        setShowLoginPrompt(true);
      }

      setMode("guest");
    });
  }, []);

  useEffect(() => {
    if (!context.castSlug) return;

    let cancelled = false;

    getCastDetail(context.castSlug)
      .then((cast) => {
        if (cancelled) return;

        const castName = cast.publicAlias ?? cast.name ?? cast.stageName;
        setContext((current) => {
          if (current.castSlug !== cast.slug) return current;

          return {
            ...current,
            castName: current.castName ?? castName,
            storeSlug: cast.store.slug ?? current.storeSlug,
            storeName: cast.store.name || current.storeName,
            area: current.area ?? cast.store.area?.name ?? cast.store.district ?? undefined,
          };
        });
      })
      .catch(() => {
        if (!cancelled) {
          setContext((current) => ({
            ...current,
            castName: current.castName ?? fallbackCastNameFromSlug(current.castSlug ?? ""),
          }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [context.castSlug]);

  useEffect(() => {
    if (!context.storeSlug) {
      let cancelled = false;
      queueMicrotask(() => {
        if (cancelled) return;
        setStoreOpeningHours(null);
        setStoreHoursResolved(true);
      });
      return () => {
        cancelled = true;
      };
    }

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStoreHoursResolved(false);
    });

    getStoreDetail(context.storeSlug)
      .then((store) => {
        if (cancelled) return;
        setStoreOpeningHours(store.openingHours ?? null);
        setContext((current) => {
          if (current.storeSlug !== store.slug) return current;

          return {
            ...current,
            storeName: current.storeName || store.name,
            area: current.area ?? store.area?.name ?? store.district ?? undefined,
          };
        });
      })
      .catch(() => {
        if (!cancelled) setStoreOpeningHours(null);
      })
      .finally(() => {
        if (!cancelled) setStoreHoursResolved(true);
      });

    return () => {
      cancelled = true;
    };
  }, [context.storeSlug]);

  const bookingTimeOptionGroups = useMemo(() => {
    return storeHoursResolved
      ? buildBookingTimeSlotGroups(storeOpeningHours, bookingDate, { fallback: "empty" })
      : [];
  }, [bookingDate, storeHoursResolved, storeOpeningHours]);
  const bookingTimeOptions = useMemo(
    () => bookingTimeOptionGroups.flatMap((group) => group.slots),
    [bookingTimeOptionGroups],
  );

  useEffect(() => {
    if (!storeHoursResolved) return;

    let nextBookingTime = bookingTime;
    if (!bookingTimeOptions.length) {
      nextBookingTime = "";
    } else if (!bookingTimeOptions.includes(bookingTime)) {
      const nextTime = bookingTimeOptions[0];
      if (nextTime) nextBookingTime = nextTime;
    }

    if (nextBookingTime === bookingTime) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setBookingTime(nextBookingTime);
    });
    return () => {
      cancelled = true;
    };
  }, [bookingTime, bookingTimeOptions, storeHoursResolved]);

  const memberLoginPath = useMemo(() => {
    const redirectParams = new URLSearchParams({
      mode: "member",
      ...(context.storeSlug ? { storeSlug: context.storeSlug } : {}),
      storeName: context.storeName,
      ...(context.area ? { area: context.area } : {}),
      ...(context.castSlug ? { castSlug: context.castSlug } : {}),
      ...(context.couponId ? { couponId: context.couponId } : {}),
      ...(context.couponIssueId ? { couponIssueId: context.couponIssueId } : {}),
      ...(context.castName ? { castName: context.castName } : {}),
      date: bookingDate,
      time: bookingTime,
      guests: String(guests),
    });

    return `/dang-nhap?redirect=${encodeURIComponent(`/dat-cho?${redirectParams.toString()}`)}`;
  }, [bookingDate, bookingTime, context, guests]);

  const targetLabel = context.castName
    ? `${context.castName} @ ${context.storeName}`
    : context.storeName;
  const castDisplayName = context.castSlug
    ? (context.castName ?? "Đang tải cast...")
    : "Không chọn cast";
  const isMemberMode = mode === "member";

  const submit = async () => {
    setErrorMessage("");
    const displayName = normalizeBookingDisplayName(guestName);
    const normalizedEmail = normalizeBookingEmail(email);
    const trimmedNote = normalizeBookingNote(note);

    if (!bookingTime) {
      setErrorMessage("Quán không có khung giờ đặt bàn trong ngày này.");
      return;
    }

    if (!storeHoursResolved) {
      setErrorMessage("Đang tải khung giờ của quán. Vui lòng thử lại sau vài giây.");
      return;
    }

    const scheduledAt = buildScheduledAtFromBookingSlot(
      bookingDate,
      bookingTime,
      storeOpeningHours,
    );

    const validationError = validateBookingFormFields({
      displayName,
      email: normalizedEmail,
      guestCount: guests,
      bookingDate,
      bookingTime,
      availableTimes: bookingTimeOptions,
      maxDate: getMaxBookingDate(),
      scheduledAt,
      note: trimmedNote,
      todayDate: getTodayDate(),
    });

    setGuestName(displayName);
    setEmail(normalizedEmail);
    setNote(trimmedNote);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    if (!context.storeSlug && !context.castSlug) {
      setErrorMessage("Thiếu thông tin quán hoặc cast để đặt chỗ.");
      return;
    }

    if (isMemberMode && !isMemberUser(getAuthUser())) {
      setShowLoginPrompt(true);
      return;
    }

    const payload: CreateBookingPayload = {
      ...(context.storeSlug ? { storeSlug: context.storeSlug } : {}),
      ...(context.castSlug ? { castSlug: context.castSlug } : {}),
      ...(context.couponId ? { couponId: context.couponId } : {}),
      ...(context.couponIssueId ? { couponIssueId: context.couponIssueId } : {}),
      displayName,
      email: normalizedEmail,
      scheduledAt,
      partySize: guests,
      ...(trimmedNote ? { note: trimmedNote } : {}),
    };

    try {
      setIsSubmitting(true);
      const booking = isMemberMode
        ? await bookingApi.createMemberBooking(payload)
        : await bookingApi.createGuestBooking(payload);

      rememberLastBooking(booking);
      if (isMemberMode) {
        requestMemberNotificationsRefresh();
      }
      router.push(`/xac-nhan?bookingId=${booking.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không gửi được yêu cầu đặt chỗ.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={`${styles.bookingPage} ${styles.bookingFormPage}`}>
      <section className={`${styles.bookingViewport} ${styles.bookingFormViewport}`}>
        <div className={`${styles.bookingFrame} ${styles.bookingFormFrame}`}>
          <header className={styles.bookingHeader}>
            <Link href={context.fromHref} className={styles.backButton} aria-label="Quay lại">
              <ChevronLeft size={18} />
            </Link>
            <div className={styles.headerCopy}>
              <h1 className={styles.headerTitle}>Đặt bàn</h1>
              <p className={styles.headerSubtitle}>Gửi yêu cầu · Admin xác nhận</p>
            </div>
          </header>

          <div className={styles.bookingBody}>
            <section className={styles.venueCard}>
              <span
                className={styles.venueImage}
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=160&q=72')",
                }}
              />
              <div className={styles.venueCopy}>
                <div className={styles.venueName}>{targetLabel}</div>
                <div className={styles.venueMeta}>
                  {context.castName ? context.storeName : "Lounge cao cấp"} ·{" "}
                  {context.area ?? "NightLife"}
                </div>
                {context.couponIssueId || context.couponId ? (
                  <div className={styles.venueMeta}>
                    Coupon link: {(context.couponIssueId ?? context.couponId)?.slice(0, 8)}
                  </div>
                ) : null}
              </div>
            </section>

            {isMemberMode ? (
              <section className={styles.memberNudge}>
                <span className={styles.nudgeIcon}>
                  <ShieldCheck size={16} />
                </span>
                <div className={styles.nudgeCopy}>
                  <div className={styles.nudgeTitle}>Hội viên NightLife</div>
                  <div className={styles.nudgeText}>
                    Booking được lưu vào lịch sử · ưu đãi 8-10%
                  </div>
                </div>
              </section>
            ) : (
              <section className={styles.loginNudge}>
                <span className={styles.nudgeIcon}>
                  <Star size={16} />
                </span>
                <div className={styles.nudgeCopy}>
                  <div className={styles.nudgeTitle}>Đăng nhập nhận giảm 8-10%</div>
                  <div className={styles.nudgeText}>Bạn đang là Khách · ưu đãi -5%</div>
                </div>
                <Link href={memberLoginPath} className={styles.nudgeButton}>
                  Đăng nhập
                </Link>
              </section>
            )}

            <div className={styles.formStack}>
              <TextField
                label="Họ tên"
                value={guestName}
                onChange={(value) => setGuestName(sanitizeBookingDisplayNameInput(value))}
                placeholder="Vui lòng nhập họ tên"
                icon={<UserRound size={16} />}
              />

              <EmailField value={email} onChange={setEmail} />

              <div className={styles.twoColumn}>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Số người</span>
                  <div className={styles.stepper}>
                    <button
                      type="button"
                      className={styles.stepButton}
                      onClick={() => setGuests((value) => Math.max(1, value - 1))}
                      aria-label="Giảm số người"
                      disabled={guests <= 1}
                    >
                      <Minus size={15} />
                    </button>
                    <span className={styles.stepValue}>{guests}</span>
                    <button
                      type="button"
                      className={`${styles.stepButton} ${styles.stepButtonActive}`}
                      onClick={() => setGuests((value) => Math.min(maxGuests, value + 1))}
                      aria-label="Tăng số người"
                      disabled={guests >= maxGuests}
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </div>

              </div>

              <BookingDateTimeFields
                dateValue={bookingDate}
                timeValue={bookingTime}
                timeOptions={bookingTimeOptions}
                timeOptionGroups={bookingTimeOptionGroups}
                minDate={getTodayDate()}
                maxDate={getMaxBookingDate()}
                onDateChange={(value) => setBookingDate(clampBookingDate(value))}
                onTimeChange={setBookingTime}
                loadingTimes={!storeHoursResolved}
                emptyMessage="Quán không có khung giờ đặt bàn trong ngày này."
                className={styles.dateTimeFields}
                fieldClassName={styles.field}
                labelClassName={styles.fieldLabel}
              />

              <ReadOnlyTextField label="Cast đã chọn" value={castDisplayName} />

              <label className={styles.field}>
                <span className={styles.fieldLabel}>
                  Ghi chú{" "}
                  <span style={{ textTransform: "none", letterSpacing: 0 }}>(tùy chọn)</span>
                </span>
                <textarea
                  {...bookingNoteAutofillBlockProps}
                  name="nl-booking-cast-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Vui lòng nhập ghi chú nếu có"
                  className={styles.noteArea}
                />
              </label>

              <div className={styles.infoNote}>
                <ShieldCheck size={15} />
                <span>
                  Không thanh toán online, không thu cọc. Yêu cầu được gửi tới đội điều phối - Admin
                  liên hệ xác nhận chỗ.
                </span>
              </div>

              {errorMessage ? (
                <div className={styles.errorMessage}>{translateText(errorMessage, activeLanguage)}</div>
              ) : null}
            </div>
          </div>

          <div className={styles.bookingStickyCta}>
            <button
              type="button"
              onClick={submit}
              disabled={isSubmitting}
              className={styles.primaryCta}
              style={{
                opacity: isSubmitting ? 0.72 : 1,
                cursor: isSubmitting ? "wait" : "pointer",
              }}
            >
              <strong>{isSubmitting ? "Đang gửi yêu cầu..." : "Gửi yêu cầu đặt bàn"}</strong>
              <small>Miễn phí · mã QR gửi qua email sau khi đặt</small>
            </button>
          </div>
        </div>
      </section>

      {showLoginPrompt ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="member-login-title"
          className={styles.dialogOverlay}
        >
          <div className={styles.dialogPanel}>
            <h2 id="member-login-title">Yêu cầu đăng nhập</h2>
            <p>
              Bạn cần đăng nhập tài khoản để lưu booking vào lịch sử Hội viên và nhận ưu đãi cao
              hơn.
            </p>
            <div className={styles.dialogActions}>
              <button
                type="button"
                className={styles.ghostCta}
                onClick={() => setShowLoginPrompt(false)}
              >
                Hủy
              </button>
              <Link href={memberLoginPath} className={styles.primaryCta}>
                <strong>Đăng nhập</strong>
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
function ReadOnlyTextField({ label, value }: { label: string; value: string }) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={`${styles.inputWrap} ${styles.readOnlyInputWrap}`}>
        <input
          type="text"
          name="nl-booking-selected-cast"
          value={value}
          readOnly
          aria-readonly="true"
          autoComplete="off"
          className={`${styles.input} ${styles.readOnlyInput}`}
        />
      </span>
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={styles.inputWrap}>
        {icon}
        <input
          type="text"
          {...bookingAutofillBlockProps}
          name="nl-booking-cast-display"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={styles.input}
        />
      </span>
    </label>
  );
}

function EmailField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>Email</span>
      <span className={styles.phoneInput}>
        <Mail size={15} />
        <input
          type="email"
          {...bookingAutofillBlockProps}
          name="nl-booking-cast-contact"
          value={value}
          placeholder="Vui lòng nhập email"
          onChange={(event) => onChange(event.target.value)}
          inputMode="email"
          className={styles.input}
        />
      </span>
    </label>
  );
}
