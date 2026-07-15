"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  Mail,
  Minus,
  Plus,
  ShieldCheck,
  Star,
  UserRound,
} from "lucide-react";
import { BookingDateTimeFields } from "@/components/ui/BookingDateTimeFields";
import { bookingApi, rememberLastBooking, type CreateBookingPayload } from "@/lib/api/bookings";
import { ApiError, translateApiMessage } from "@/lib/api/client";
import { getCastDetail } from "@/lib/api/cast-detail";
import { discoveryApi, type PublicCast } from "@/lib/api/discovery";
import { requestMemberNotificationsRefresh } from "@/lib/api/notifications";
import { getStoreDetail, type StoreDetailCast } from "@/lib/api/store-detail";
import { getAuthUser, type AuthUser } from "@/lib/auth/session";
import {
  buildBookingTimeSlotGroups,
  buildScheduledAtFromBookingSlot,
} from "@/lib/booking-time-slots";
import {
  bookingValidationLimits,
  clampBookingGuestCount,
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
  type BookingTouchedFields,
  type BookingValidationField,
} from "@/lib/booking-field-validation";
import { translateText } from "@/lib/i18n/client-translations";
import { useActiveLanguage, type LanguageCode } from "@/lib/i18n/use-active-language";
import styles from "../booking-flow.module.css";

const { bookingDateWindowDays, maxGuests } = bookingValidationLimits;

const sanitizeGuestCountDraftInput = (value: string) => value.replace(/\D/g, "");

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

const castOptionLabel = (cast: Pick<StoreDetailCast, "publicAlias" | "stageName">) =>
  cast.publicAlias || cast.stageName;

const castOptionMeta = (cast: Pick<StoreDetailCast, "publicHeadline" | "languages">) =>
  [cast.publicHeadline, cast.languages?.filter(Boolean).join(", ")]
    .filter(Boolean)
    .join(" · ");

const publicCastToStoreCast = (cast: PublicCast): StoreDetailCast => ({
  id: cast.id,
  slug: cast.slug,
  stageName: cast.stageName,
  publicAlias: cast.publicAlias,
  publicHeadline: cast.publicHeadline,
  thumbnailUrl: cast.thumbnailUrl,
  tags: cast.tags,
  languages: cast.languages,
  hourlyRateVnd: cast.hourlyRateVnd,
});

const loadStoreCastOptions = async (storeSlug: string) => {
  try {
    const filteredCasts = await discoveryApi.listCastsStrict({
      city: "all",
      limit: 100,
      storeSlug,
    });

    if (filteredCasts.length) {
      return filteredCasts.map(publicCastToStoreCast);
    }
  } catch {
    // Production can lag behind this backend filter; fall back to the broad public list.
  }

  const allCasts = await discoveryApi.listCasts({ city: "all", limit: 100 });
  return allCasts
    .filter((cast) => cast.store.slug === storeSlug)
    .map(publicCastToStoreCast);
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
  const [guestInput, setGuestInput] = useState("4");
  const [note, setNote] = useState("");
  const [storeOpeningHours, setStoreOpeningHours] = useState<Record<string, unknown> | null>(null);
  const [storeCasts, setStoreCasts] = useState<StoreDetailCast[]>([]);
  const [storeHoursResolved, setStoreHoursResolved] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [touchedFields, setTouchedFields] = useState<BookingTouchedFields>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    const parsed = parseContext();
    const authUser = getAuthUser();
    const memberAccount = isMemberUser(authUser);

    queueMicrotask(() => {
      setContext(parsed.context);
      setBookingDate(parsed.date);
      setBookingTime(parsed.time || "21:00");
      const initialGuests = Number.isFinite(parsed.guests)
        ? clampBookingGuestCount(parsed.guests)
        : 4;
      setGuests(initialGuests);
      setGuestInput(String(initialGuests));

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
        setStoreCasts([]);
        setStoreHoursResolved(true);
      });
      return () => {
        cancelled = true;
      };
    }

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setStoreCasts([]);
        setStoreHoursResolved(false);
      }
    });

    getStoreDetail(context.storeSlug)
      .then((store) => {
        if (cancelled) return;
        setStoreOpeningHours(store.openingHours ?? null);
        setStoreCasts(store.casts ?? []);
        setContext((current) => {
          if (current.storeSlug !== store.slug) return current;
          const selectedCast = store.casts.find((cast) => cast.slug === current.castSlug);

          return {
            ...current,
            storeName: current.storeName || store.name,
            area: current.area ?? store.area?.name ?? store.district ?? undefined,
            castName: selectedCast ? castOptionLabel(selectedCast) : current.castName,
          };
        });
      })
      .catch(() => {
        if (!cancelled) {
          setStoreOpeningHours(null);
        }
      })
      .finally(() => {
        if (!cancelled) setStoreHoursResolved(true);
      });

    return () => {
      cancelled = true;
    };
  }, [context.storeSlug]);

  useEffect(() => {
    if (!context.storeSlug) return;

    let cancelled = false;

    loadStoreCastOptions(context.storeSlug)
      .then((casts) => {
        if (cancelled || !casts.length) return;
        setStoreCasts(casts);
        setContext((current) => {
          if (current.storeSlug !== context.storeSlug) return current;
          const selectedCast = casts.find((cast) => cast.slug === current.castSlug);

          return selectedCast
            ? {
                ...current,
                castName: castOptionLabel(selectedCast),
              }
            : current;
        });
      })
      .catch(() => {
        // Store detail cast data remains as the fallback option source.
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

  const scheduledPreviewAt = buildScheduledAtFromBookingSlot(
    bookingDate,
    bookingTime,
    storeOpeningHours,
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
        loadingTimes: !storeHoursResolved,
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
      storeHoursResolved,
    ],
  );
  const visibleFieldErrors = useMemo(
    () => visibleBookingFieldErrors(fieldErrors, touchedFields, submitAttempted),
    [fieldErrors, submitAttempted, touchedFields],
  );
  const castOptions = useMemo(() => {
    const options = storeCasts.map((cast) => ({
      slug: cast.slug,
      label: castOptionLabel(cast),
      meta: castOptionMeta(cast),
    }));

    if (context.castSlug && !options.some((option) => option.slug === context.castSlug)) {
      options.unshift({
        slug: context.castSlug,
        label: context.castName ?? fallbackCastNameFromSlug(context.castSlug),
        meta: context.storeName,
      });
    }

    return options;
  }, [context.castName, context.castSlug, context.storeName, storeCasts]);
  const markFieldTouched = (field: BookingValidationField) => {
    setTouchedFields((current) => (current[field] ? current : { ...current, [field]: true }));
    setErrorMessage("");
  };
  const updateSelectedCast = (castSlug: string) => {
    const nextCast = storeCasts.find((cast) => cast.slug === castSlug);

    setContext((current) => ({
      ...current,
      castSlug: castSlug || undefined,
      castName: castSlug
        ? nextCast
          ? castOptionLabel(nextCast)
          : current.castName ?? fallbackCastNameFromSlug(castSlug)
        : undefined,
      fromHref: castSlug
        ? `/casts/${castSlug}`
        : `/stores/${current.storeSlug ?? defaultContext.storeSlug}`,
    }));
  };

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
  const isMemberMode = mode === "member";
  const parsedGuestInput = Number(guestInput);
  const stepperGuestCount =
    guestInput.trim() && Number.isFinite(parsedGuestInput)
      ? clampBookingGuestCount(parsedGuestInput)
      : guests;

  const applyGuestCount = (value: number) => {
    const nextGuests = clampBookingGuestCount(value);
    setGuests(nextGuests);
    setGuestInput(String(nextGuests));
  };

  const updateGuestInput = (value: string) => {
    const digits = sanitizeGuestCountDraftInput(value);
    setGuestInput(digits);

    const parsed = Number(digits);
    if (digits && Number.isFinite(parsed) && parsed >= 1 && parsed <= maxGuests) {
      setGuests(parsed);
    }
  };

  const commitGuestInput = () => {
    const parsed = Number(guestInput);
    const nextGuests =
      guestInput.trim() && Number.isFinite(parsed)
        ? clampBookingGuestCount(parsed)
        : clampBookingGuestCount(guests);

    setGuests(nextGuests);
    setGuestInput(String(nextGuests));
    return nextGuests;
  };

  const submit = async () => {
    setErrorMessage("");
    setSubmitAttempted(true);
    setTouchedFields(touchAllBookingFields());
    const displayName = normalizeBookingDisplayName(guestName);
    const normalizedEmail = normalizeBookingEmail(email);
    const trimmedNote = normalizeBookingNote(note);
    const partySize = commitGuestInput();

    const scheduledAt = buildScheduledAtFromBookingSlot(
      bookingDate,
      bookingTime,
      storeOpeningHours,
    );

    const validationError = firstBookingFieldError(buildBookingFieldErrors({
      displayName,
      email: normalizedEmail,
      guestCount: partySize,
      bookingDate,
      bookingTime,
      availableTimes: bookingTimeOptions,
      loadingTimes: !storeHoursResolved,
      maxDate: getMaxBookingDate(),
      scheduledAt,
      note: trimmedNote,
      todayDate: getTodayDate(),
    }));

    setGuestName(displayName);
    setEmail(normalizedEmail);
    setNote(trimmedNote);

    if (validationError) {
      return;
    }

    if (!context.storeSlug && !context.castSlug) {
      setErrorMessage(
        translateText("Thiếu thông tin quán hoặc cast để đặt chỗ.", activeLanguage),
      );
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
      partySize,
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
      setErrorMessage(
        localizedApiErrorMessage(error, activeLanguage, "Không gửi được yêu cầu đặt chỗ."),
      );
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
                onTouched={() => markFieldTouched("guestName")}
                placeholder="Vui lòng nhập họ tên"
                icon={<UserRound size={16} />}
                error={visibleFieldErrors.guestName}
                activeLanguage={activeLanguage}
              />

              <EmailField
                value={email}
                onChange={setEmail}
                onTouched={() => markFieldTouched("email")}
                error={visibleFieldErrors.email}
                activeLanguage={activeLanguage}
              />

              <BookingDateTimeFields
                dateValue={bookingDate}
                dateFieldAddon={
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>Số người</span>
                    <div className={styles.stepper}>
                      <button
                        type="button"
                        className={styles.stepButton}
                        onClick={() => {
                          markFieldTouched("guestCount");
                          applyGuestCount(stepperGuestCount - 1);
                        }}
                        aria-label="Giảm số người"
                        disabled={stepperGuestCount <= 1}
                      >
                        <Minus size={15} />
                      </button>
                      <label className={styles.stepInputWrap}>
                        <input
                          {...bookingAutofillBlockProps}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          name="nl-booking-guests"
                          value={guestInput}
                          style={{ width: `${Math.max(1, guestInput.length)}ch` }}
                          onBlur={() => {
                            markFieldTouched("guestCount");
                            commitGuestInput();
                          }}
                          onKeyDown={(event) => {
                            if (event.ctrlKey || event.metaKey || event.altKey) return;
                            if (event.key.length === 1 && !/\d/.test(event.key)) event.preventDefault();
                          }}
                          onChange={(event) => {
                            markFieldTouched("guestCount");
                            updateGuestInput(event.target.value);
                          }}
                          aria-label="Số người"
                        />
                        <span aria-hidden="true">người</span>
                      </label>
                      <button
                        type="button"
                        className={`${styles.stepButton} ${styles.stepButtonActive}`}
                        onClick={() => {
                          markFieldTouched("guestCount");
                          applyGuestCount(stepperGuestCount + 1);
                        }}
                        aria-label="Tăng số người"
                        disabled={stepperGuestCount >= maxGuests}
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                    <FieldError
                      activeLanguage={activeLanguage}
                      message={visibleFieldErrors.guestCount}
                    />
                  </div>
                }
                timeValue={bookingTime}
                timeOptions={bookingTimeOptions}
                minDate={getTodayDate()}
                maxDate={getMaxBookingDate()}
                onDateChange={(value) => {
                  markFieldTouched("bookingDate");
                  setBookingDate(clampBookingDate(value));
                }}
                onTimeChange={(value) => {
                  markFieldTouched("bookingTime");
                  setBookingTime(value);
                }}
                loadingTimes={!storeHoursResolved}
                emptyMessage="Quán không có khung giờ đặt bàn trong ngày này."
                dateError={visibleFieldErrors.bookingDate}
                timeError={visibleFieldErrors.bookingTime}
                errorClassName={styles.fieldError}
                className={styles.dateTimeFields}
                fieldClassName={styles.field}
                labelClassName={styles.fieldLabel}
              />

              <CastSelectField
                label="Cast đã chọn"
                value={context.castSlug ?? ""}
                options={castOptions}
                onChange={updateSelectedCast}
                activeLanguage={activeLanguage}
              />

              <label className={styles.field}>
                <span className={styles.fieldLabel}>
                  Ghi chú{" "}
                  <span style={{ textTransform: "none", letterSpacing: 0 }}>(tùy chọn)</span>
                </span>
                <textarea
                  {...bookingNoteAutofillBlockProps}
                  name="nl-booking-cast-note"
                  value={note}
                  onBlur={() => markFieldTouched("note")}
                  onChange={(event) => {
                    markFieldTouched("note");
                    setNote(event.target.value);
                  }}
                  placeholder="Vui lòng nhập ghi chú nếu có"
                  className={styles.noteArea}
                />
                <FieldError activeLanguage={activeLanguage} message={visibleFieldErrors.note} />
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

function FieldError({
  activeLanguage,
  message,
}: {
  activeLanguage: LanguageCode;
  message?: string;
}) {
  const translatedMessage = message ? translateText(message, activeLanguage) : "\u00a0";

  return (
    <span
      className={styles.fieldError}
      data-empty={message ? undefined : "true"}
      aria-live={message ? "polite" : "off"}
      aria-hidden={message ? undefined : true}
    >
      {translatedMessage}
    </span>
  );
}

function CastSelectField({
  label,
  value,
  options,
  onChange,
  activeLanguage,
}: {
  label: string;
  value: string;
  options: Array<{ slug: string; label: string; meta?: string }>;
  onChange: (value: string) => void;
  activeLanguage: LanguageCode;
}) {
  const [isOpen, setOpen] = useState(false);
  const selectedOption = options.find((option) => option.slug === value);
  const fallbackOption = {
    slug: "",
    label: translateText("Không chọn cast", activeLanguage),
    meta: undefined,
  };
  const selected = selectedOption ?? fallbackOption;
  const optionList = [fallbackOption, ...options];
  const initial = selected.label.trim().charAt(0).toUpperCase() || "C";

  const chooseCast = (slug: string) => {
    onChange(slug);
    setOpen(false);
  };

  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <span
        className={styles.castSelect}
        onBlur={(event) => {
          const nextTarget = event.relatedTarget;
          if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
            setOpen(false);
          }
        }}
      >
        <button
          type="button"
          className={styles.castSelectTrigger}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setOpen((current) => !current)}
        >
          <span className={styles.castSelectValue}>
            <span className={value ? styles.castAvatar : styles.castAvatarEmpty} aria-hidden="true">
              {value ? initial : <UserRound size={16} />}
            </span>
            <span className={styles.castSelectText}>
              <strong>{selected.label}</strong>
              {selected.meta ? <small>{selected.meta}</small> : null}
            </span>
          </span>
          <ChevronDown size={18} className={styles.castSelectChevron} aria-hidden="true" />
        </button>
        {isOpen ? (
          <div className={styles.castSelectMenu} role="listbox">
            {optionList.map((option) => {
              const isSelected = option.slug === value;
              const optionInitial = option.label.trim().charAt(0).toUpperCase() || "C";

              return (
                <button
                  key={option.slug || "none"}
                  type="button"
                  className={styles.castSelectOption}
                  role="option"
                  aria-selected={isSelected}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => chooseCast(option.slug)}
                >
                  <span
                    className={option.slug ? styles.castAvatar : styles.castAvatarEmpty}
                    aria-hidden="true"
                  >
                    {option.slug ? optionInitial : <UserRound size={15} />}
                  </span>
                  <span className={styles.castSelectText}>
                    <strong>{option.label}</strong>
                    {option.meta ? <small>{option.meta}</small> : null}
                  </span>
                  {isSelected ? (
                    <Check size={16} className={styles.castSelectCheck} aria-hidden="true" />
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
        <select
          aria-hidden="true"
          tabIndex={-1}
          name="nl-booking-selected-cast"
          value={value}
          autoComplete="off"
          className={styles.selectInput}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">{translateText("Không chọn cast", activeLanguage)}</option>
          {options.map((option) => (
            <option key={option.slug} value={option.slug}>
              {option.meta ? `${option.label} - ${option.meta}` : option.label}
            </option>
          ))}
        </select>
      </span>
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  onTouched,
  placeholder,
  icon,
  error,
  activeLanguage,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onTouched: () => void;
  placeholder?: string;
  icon?: React.ReactNode;
  error?: string;
  activeLanguage: LanguageCode;
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
          onBlur={onTouched}
          onChange={(event) => {
            onTouched();
            onChange(event.target.value);
          }}
          className={styles.input}
        />
      </span>
      <FieldError activeLanguage={activeLanguage} message={error} />
    </label>
  );
}

function EmailField({
  value,
  onChange,
  onTouched,
  error,
  activeLanguage,
}: {
  value: string;
  onChange: (value: string) => void;
  onTouched: () => void;
  error?: string;
  activeLanguage: LanguageCode;
}) {
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
          onBlur={onTouched}
          onChange={(event) => {
            onTouched();
            onChange(event.target.value);
          }}
          inputMode="email"
          className={styles.input}
        />
      </span>
      <FieldError activeLanguage={activeLanguage} message={error} />
    </label>
  );
}
