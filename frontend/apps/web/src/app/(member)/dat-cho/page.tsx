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
import { getCastDetail, type PublicCastDetail } from "@/lib/api/cast-detail";
import { discoveryApi, type PublicCast } from "@/lib/api/discovery";
import { requestMemberNotificationsRefresh } from "@/lib/api/notifications";
import { getStoreDetail, type StoreDetailCast } from "@/lib/api/store-detail";
import { getAuthUser, type AuthUser } from "@/lib/auth/session";
import {
  buildBookingTimeSlotGroups,
  buildScheduledAtFromBookingSlot,
  pastBookingTimeSlots,
} from "@/lib/booking-time-slots";
import {
  bookingValidationLimits,
  clampBookingGuestCount,
  normalizeBookingDisplayName,
  normalizeBookingEmail,
  normalizeBookingNote,
  sanitizeBookingDisplayNameInput,
} from "@/lib/booking-validation";
import { getBookingDateAfterDays, getTodayBookingDate } from "@/lib/booking-date";
import {
  buildBookingFieldErrors,
  firstBookingFieldErrorKey,
  touchAllBookingFields,
  visibleBookingFieldErrors,
  type BookingTouchedFields,
  type BookingValidationField,
} from "@/lib/booking-field-validation";
import { scrollBookingValidationFieldIntoView, type BookingFieldScrollSelectors } from "@/lib/booking-field-scroll";
import { translateText } from "@/lib/i18n/client-translations";
import { useActiveLanguage, type LanguageCode } from "@/lib/i18n/use-active-language";
import { isServiceOnlyBookingCategory } from "@/lib/store-categories";
import { isNearStartTime, useUserActionFeedback } from "@/lib/user-action-feedback";
import styles from "../booking-flow.module.css";

const { bookingDateWindowDays, maxGuests } = bookingValidationLimits;

const sanitizeGuestCountDraftInput = (value: string) => value.replace(/\D/g, "");

const bookingAutofillBlockProps = {
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

const bookingFieldNames = {
  guestCount: "nlbf-dc-f3",
  guestEmail: "nlbf-dc-f2",
  guestName: "nlbf-dc-f1",
  note: "nlbf-dc-f4",
  selectedCast: "nlbf-dc-f5",
} as const;

const bookingFieldScrollSelectors: BookingFieldScrollSelectors = {
  bookingDate: ".nl-booking-date-field",
  bookingTime: ".nl-booking-time-field",
  email: `[name="${bookingFieldNames.guestEmail}"]`,
  guestCount: `[name="${bookingFieldNames.guestCount}"]`,
  guestName: `[name="${bookingFieldNames.guestName}"]`,
  note: `[name="${bookingFieldNames.note}"]`,
};

type BookingContext = {
  storeSlug?: string;
  storeName: string;
  category?: string;
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

const localizedApiErrorMessage = (error: unknown, language: LanguageCode, fallback: string) => {
  const vietnameseMessage =
    error instanceof ApiError
      ? translateApiMessage(error.message, error.status, fallback)
      : error instanceof Error
        ? translateApiMessage(error.message, undefined, fallback)
        : fallback;

  return translateText(vietnameseMessage, language);
};

const getTodayDate = getTodayBookingDate;

const getMaxBookingDate = () => getBookingDateAfterDays(bookingDateWindowDays);

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

const castOptionMeta = (cast: Pick<StoreDetailCast, "languages">) =>
  cast.languages?.filter(Boolean).join(", ") || "";

const publicCastToStoreCast = (cast: PublicCast): StoreDetailCast => ({
  id: cast.id,
  slug: cast.slug,
  stageName: cast.stageName,
  publicAlias: cast.publicAlias,
  thumbnailUrl: cast.thumbnailUrl,
  tags: cast.tags,
  languages: cast.languages,
  hourlyRateVnd: cast.hourlyRateVnd,
});

const castDetailToStoreCast = (cast: PublicCastDetail): StoreDetailCast => ({
  id: cast.id,
  slug: cast.slug,
  stageName: cast.stageName,
  publicAlias: cast.publicAlias,
  thumbnailUrl: cast.thumbnailUrl,
  tags: cast.tags,
  languages: cast.languages,
  hourlyRateVnd: cast.hourlyRateVnd,
});

const upsertCastOption = (casts: StoreDetailCast[], nextCast: StoreDetailCast) => {
  const index = casts.findIndex((cast) => cast.slug === nextCast.slug);

  if (index === -1) {
    return [nextCast, ...casts];
  }

  return casts.map((cast, castIndex) =>
    castIndex === index
      ? {
          ...cast,
          ...nextCast,
          thumbnailUrl: nextCast.thumbnailUrl ?? cast.thumbnailUrl,
        }
      : cast,
  );
};

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
  return allCasts.filter((cast) => cast.store.slug === storeSlug).map(publicCastToStoreCast);
};

const parseContext = () => {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category") || undefined;
  const isServiceOnlyBooking = isServiceOnlyBookingCategory(category);
  const castSlug = isServiceOnlyBooking ? undefined : params.get("castSlug") || undefined;
  const rawStoreSlug = params.get("storeSlug") || undefined;
  const storeSlug = rawStoreSlug || (castSlug ? undefined : defaultContext.storeSlug);
  const couponId = isServiceOnlyBooking ? undefined : params.get("couponId") || undefined;
  const couponIssueId = isServiceOnlyBooking ? undefined : params.get("couponIssueId") || undefined;

  return {
    context: {
      storeSlug,
      storeName: params.get("storeName") || defaultContext.storeName,
      category,
      area: params.get("area") || defaultContext.area,
      castSlug,
      castName: isServiceOnlyBooking ? undefined : params.get("castName") || undefined,
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
  const userFeedback = useUserActionFeedback();
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
  const [resolvedCastOption, setResolvedCastOption] = useState<StoreDetailCast | null>(null);
  const [storeHoursResolved, setStoreHoursResolved] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [touchedFields, setTouchedFields] = useState<BookingTouchedFields>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [bookingNow, setBookingNow] = useState(() => new Date());
  const isServiceOnlyBooking = isServiceOnlyBookingCategory(context.category);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setBookingNow(new Date());
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

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
    let cancelled = false;

    if (!context.castSlug) {
      queueMicrotask(() => {
        if (!cancelled) setResolvedCastOption(null);
      });
      return () => {
        cancelled = true;
      };
    }

    getCastDetail(context.castSlug)
      .then((cast) => {
        if (cancelled) return;

        const castName = cast.publicAlias ?? cast.name ?? cast.stageName;
        const castOption = castDetailToStoreCast(cast);
        setResolvedCastOption(castOption);
        setStoreCasts((current) => upsertCastOption(current, castOption));
        setContext((current) => {
          if (current.castSlug !== cast.slug) return current;
          const castStoreCategory = cast.store.category;
          const isCastStoreServiceOnly = isServiceOnlyBookingCategory(castStoreCategory);

          return {
            ...current,
            category: castStoreCategory ?? current.category,
            castSlug: isCastStoreServiceOnly ? undefined : current.castSlug,
            castName: isCastStoreServiceOnly ? undefined : (current.castName ?? castName),
            storeSlug: cast.store.slug ?? current.storeSlug,
            storeName: cast.store.name || current.storeName,
            area: current.area ?? cast.store.area?.name ?? cast.store.district ?? undefined,
            couponId: isCastStoreServiceOnly ? undefined : current.couponId,
            couponIssueId: isCastStoreServiceOnly ? undefined : current.couponIssueId,
            fromHref: isCastStoreServiceOnly
              ? `/stores/${cast.store.slug ?? current.storeSlug ?? defaultContext.storeSlug}`
              : current.fromHref,
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
        const isStoreServiceOnly = isServiceOnlyBookingCategory(store.category);
        setStoreOpeningHours(store.openingHours ?? null);
        setStoreCasts(isStoreServiceOnly ? [] : (store.casts ?? []));
        setContext((current) => {
          if (current.storeSlug !== store.slug) return current;
          const selectedCast = store.casts.find((cast) => cast.slug === current.castSlug);

          return {
            ...current,
            category: store.category ?? current.category,
            storeName: current.storeName || store.name,
            area: current.area ?? store.area?.name ?? store.district ?? undefined,
            castSlug: isStoreServiceOnly ? undefined : current.castSlug,
            castName: isStoreServiceOnly
              ? undefined
              : selectedCast
                ? castOptionLabel(selectedCast)
                : current.castName,
            couponId: isStoreServiceOnly ? undefined : current.couponId,
            couponIssueId: isStoreServiceOnly ? undefined : current.couponIssueId,
            fromHref: isStoreServiceOnly ? `/stores/${store.slug}` : current.fromHref,
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
    if (!context.storeSlug || isServiceOnlyBooking) return;

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
  }, [context.storeSlug, isServiceOnlyBooking]);

  const bookingTimeOptionGroups = useMemo(() => {
    return storeHoursResolved
      ? buildBookingTimeSlotGroups(storeOpeningHours, bookingDate, { fallback: "empty" })
      : [];
  }, [bookingDate, storeHoursResolved, storeOpeningHours]);
  const bookingTimeOptions = useMemo(
    () => bookingTimeOptionGroups.flatMap((group) => group.slots),
    [bookingTimeOptionGroups],
  );
  const disabledBookingTimeOptions = useMemo(
    () => pastBookingTimeSlots(bookingTimeOptions, bookingDate, storeOpeningHours, bookingNow),
    [bookingDate, bookingNow, bookingTimeOptions, storeOpeningHours],
  );
  const availableBookingTimeOptions = useMemo(
    () =>
      bookingTimeOptions.filter((time) => !disabledBookingTimeOptions.includes(time)),
    [bookingTimeOptions, disabledBookingTimeOptions],
  );

  useEffect(() => {
    if (!storeHoursResolved) return;

    let nextBookingTime = bookingTime;
    if (!availableBookingTimeOptions.length) {
      nextBookingTime = "";
    } else if (
      !availableBookingTimeOptions.includes(bookingTime) ||
      disabledBookingTimeOptions.includes(bookingTime)
    ) {
      const nextTime = availableBookingTimeOptions[0];
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
  }, [
    availableBookingTimeOptions,
    bookingTime,
    disabledBookingTimeOptions,
    storeHoursResolved,
  ]);

  const scheduledPreviewAt = buildScheduledAtFromBookingSlot(
    bookingDate,
    bookingTime,
    storeOpeningHours,
  );
  const fieldErrors = useMemo(
    () =>
      buildBookingFieldErrors({
        availableTimes: availableBookingTimeOptions,
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
      availableBookingTimeOptions,
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
    if (isServiceOnlyBooking) return [];

    const sourceCasts = resolvedCastOption
      ? upsertCastOption(storeCasts, resolvedCastOption)
      : storeCasts;
    const options = sourceCasts.map((cast) => ({
      slug: cast.slug,
      label: castOptionLabel(cast),
      meta: castOptionMeta(cast),
      thumbnailUrl: cast.thumbnailUrl,
    }));

    if (context.castSlug && !options.some((option) => option.slug === context.castSlug)) {
      options.unshift({
        slug: context.castSlug,
        label: context.castName ?? fallbackCastNameFromSlug(context.castSlug),
        meta: context.storeName,
        thumbnailUrl:
          resolvedCastOption?.slug === context.castSlug
            ? resolvedCastOption.thumbnailUrl
            : undefined,
      });
    }

    return options;
  }, [
    context.castName,
    context.castSlug,
    context.storeName,
    isServiceOnlyBooking,
    resolvedCastOption,
    storeCasts,
  ]);
  const markFieldTouched = (field: BookingValidationField) => {
    setTouchedFields((current) => (current[field] ? current : { ...current, [field]: true }));
    setErrorMessage("");
  };
  const updateSelectedCast = (castSlug: string) => {
    if (isServiceOnlyBooking) return;

    const nextCast = storeCasts.find((cast) => cast.slug === castSlug);

    setContext((current) => ({
      ...current,
      castSlug: castSlug || undefined,
      castName: castSlug
        ? nextCast
          ? castOptionLabel(nextCast)
          : (current.castName ?? fallbackCastNameFromSlug(castSlug))
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
      ...(context.category ? { category: context.category } : {}),
      ...(context.area ? { area: context.area } : {}),
      ...(!isServiceOnlyBooking && context.castSlug ? { castSlug: context.castSlug } : {}),
      ...(!isServiceOnlyBooking && context.couponId ? { couponId: context.couponId } : {}),
      ...(!isServiceOnlyBooking && context.couponIssueId
        ? { couponIssueId: context.couponIssueId }
        : {}),
      ...(!isServiceOnlyBooking && context.castName ? { castName: context.castName } : {}),
      date: bookingDate,
      time: bookingTime,
      guests: String(guests),
    });

    return `/dang-nhap?redirect=${encodeURIComponent(`/dat-cho?${redirectParams.toString()}`)}`;
  }, [bookingDate, bookingTime, context, guests, isServiceOnlyBooking]);

  const targetLabel =
    !isServiceOnlyBooking && context.castName
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

  const createBooking = async (
    payload: CreateBookingPayload,
    normalizedEmail: string,
    actionLabel: "đặt bàn" | "đặt cast",
  ) => {
    try {
      setIsSubmitting(true);
      const booking = isMemberMode
        ? await bookingApi.createMemberBooking(payload)
        : await bookingApi.createGuestBooking(payload);

      rememberLastBooking(booking);
      if (isMemberMode) {
        requestMemberNotificationsRefresh();
      }
      userFeedback.success({
        title: `${actionLabel === "đặt cast" ? "Đặt cast" : "Đặt bàn"} thành công`,
        description: "Yêu cầu đã được ghi nhận, đang chuyển sang trang xác nhận.",
      });
      const confirmParams = new URLSearchParams({ bookingId: booking.id });
      if (!isMemberMode) {
        confirmParams.set("email", normalizedEmail);
      }
      router.push(`/xac-nhan?${confirmParams.toString()}`);
    } catch (error) {
      const message = localizedApiErrorMessage(
        error,
        activeLanguage,
        "Không gửi được yêu cầu đặt chỗ.",
      );
      setErrorMessage(message);
      userFeedback.error({
        title: `${actionLabel === "đặt cast" ? "Đặt cast" : "Đặt bàn"} thất bại`,
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submit = async () => {
    if (isSubmitting) return;

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

    const validationErrors = buildBookingFieldErrors({
      displayName,
      email: normalizedEmail,
      guestCount: partySize,
      bookingDate,
      bookingTime,
      availableTimes: availableBookingTimeOptions,
      loadingTimes: !storeHoursResolved,
      maxDate: getMaxBookingDate(),
      scheduledAt,
      note: trimmedNote,
      todayDate: getTodayDate(),
    });
    const validationErrorField = firstBookingFieldErrorKey(validationErrors);

    setGuestName(displayName);
    setEmail(normalizedEmail);
    setNote(trimmedNote);

    if (validationErrorField) {
      scrollBookingValidationFieldIntoView(validationErrorField, bookingFieldScrollSelectors);
      return;
    }

    const bookingCastSlug = isServiceOnlyBooking ? undefined : context.castSlug;
    const bookingCouponId = isServiceOnlyBooking ? undefined : context.couponId;
    const bookingCouponIssueId = isServiceOnlyBooking ? undefined : context.couponIssueId;

    if (!context.storeSlug && !bookingCastSlug) {
      setErrorMessage(translateText("Thiếu thông tin quán hoặc cast để đặt chỗ.", activeLanguage));
      return;
    }

    if (isMemberMode && !isMemberUser(getAuthUser())) {
      setShowLoginPrompt(true);
      return;
    }

    const payload: CreateBookingPayload = {
      ...(context.storeSlug ? { storeSlug: context.storeSlug } : {}),
      ...(bookingCastSlug ? { castSlug: bookingCastSlug } : {}),
      ...(bookingCouponId ? { couponId: bookingCouponId } : {}),
      ...(bookingCouponIssueId ? { couponIssueId: bookingCouponIssueId } : {}),
      displayName,
      email: normalizedEmail,
      scheduledAt,
      partySize,
      ...(trimmedNote ? { note: trimmedNote } : {}),
    };

    const actionLabel = bookingCastSlug ? "đặt cast" : "đặt bàn";
    const nearStart = isNearStartTime(scheduledAt);

    userFeedback.confirmAction({
      title: nearStart
        ? `Xác nhận ${actionLabel} sát giờ`
        : `Xác nhận ${actionLabel}`,
      description: nearStart
        ? `Lịch ${bookingTime} ngày ${bookingDate} đang rất gần giờ bắt đầu. Bạn có chắc muốn ${actionLabel} giờ này không?`
        : `Bạn có chắc muốn gửi yêu cầu ${actionLabel} lúc ${bookingTime} ngày ${bookingDate}?`,
      confirmLabel: nearStart ? "Vẫn đặt giờ này" : "Xác nhận đặt",
      tone: nearStart ? "warning" : "gold",
      onConfirm: () => createBooking(payload, normalizedEmail, actionLabel),
    });
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
                  {!isServiceOnlyBooking && context.castName ? context.storeName : "Lounge cao cấp"}{" "}
                  · {context.area ?? "NightLife"}
                </div>
                {!isServiceOnlyBooking && (context.couponIssueId || context.couponId) ? (
                  <div className={styles.venueMeta}>
                    Coupon link: {(context.couponIssueId ?? context.couponId)?.slice(0, 8)}
                  </div>
                ) : null}
              </div>
            </section>

            {!isServiceOnlyBooking && isMemberMode ? (
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
            ) : !isServiceOnlyBooking ? (
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
            ) : null}

            <form
              id="nl-booking-request-form"
              className={styles.formStack}
              autoComplete="off"
              data-1p-ignore="true"
              data-bwignore="true"
              data-form-type="other"
              data-lpignore="true"
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                void submit();
              }}
            >
              <TextField
                label="Họ tên"
                value={guestName}
                onChange={(value) => setGuestName(sanitizeBookingDisplayNameInput(value))}
                onTouched={() => markFieldTouched("guestName")}
                placeholder="Vui lòng nhập họ tên"
                icon={<UserRound size={16} />}
                error={visibleFieldErrors.guestName}
                name={bookingFieldNames.guestName}
                activeLanguage={activeLanguage}
              />

              <EmailField
                value={email}
                onChange={setEmail}
                onTouched={() => markFieldTouched("email")}
                error={visibleFieldErrors.email}
                name={bookingFieldNames.guestEmail}
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
                          name={bookingFieldNames.guestCount}
                          value={guestInput}
                          style={{ width: `${Math.max(1, guestInput.length)}ch` }}
                          onBlur={() => {
                            markFieldTouched("guestCount");
                            commitGuestInput();
                          }}
                          onKeyDown={(event) => {
                            if (event.ctrlKey || event.metaKey || event.altKey) return;
                            if (event.key.length === 1 && !/\d/.test(event.key))
                              event.preventDefault();
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
                disabledTimeOptions={disabledBookingTimeOptions}
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

              {!isServiceOnlyBooking ? (
                <CastSelectField
                  label="Cast đã chọn"
                  value={context.castSlug ?? ""}
                  options={castOptions}
                  onChange={updateSelectedCast}
                  activeLanguage={activeLanguage}
                />
              ) : null}

              <label className={styles.field}>
                <span className={styles.fieldLabel}>
                  Ghi chú{" "}
                  <span style={{ textTransform: "none", letterSpacing: 0 }}>(tùy chọn)</span>
                </span>
                <textarea
                  {...bookingNoteAutofillBlockProps}
                  name={bookingFieldNames.note}
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
                <div className={styles.errorMessage}>
                  {translateText(errorMessage, activeLanguage)}
                </div>
              ) : null}
            </form>
          </div>

          <div className={styles.bookingStickyCta}>
            <button
              type="submit"
              form="nl-booking-request-form"
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
              {isServiceOnlyBooking
                ? "Bạn cần đăng nhập tài khoản để lưu booking vào lịch sử Hội viên."
                : "Bạn cần đăng nhập tài khoản để lưu booking vào lịch sử Hội viên và nhận ưu đãi cao hơn."}
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
  options: Array<{ slug: string; label: string; meta?: string; thumbnailUrl?: string | null }>;
  onChange: (value: string) => void;
  activeLanguage: LanguageCode;
}) {
  const [isOpen, setOpen] = useState(false);
  const selectedOption = options.find((option) => option.slug === value);
  const fallbackOption = {
    slug: "",
    label: translateText("Không chọn cast", activeLanguage),
    meta: undefined,
    thumbnailUrl: null,
  };
  const selected = selectedOption ?? fallbackOption;
  const optionList = [fallbackOption, ...options];
  const initial = selected.label.trim().charAt(0).toUpperCase() || "C";
  const selectedAvatarClassName = [
    value ? styles.castAvatar : styles.castAvatarEmpty,
    selected.thumbnailUrl ? styles.castAvatarImage : "",
  ]
    .filter(Boolean)
    .join(" ");
  const selectedAvatarStyle = selected.thumbnailUrl
    ? { backgroundImage: `url("${selected.thumbnailUrl}")` }
    : undefined;

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
            <span
              className={selectedAvatarClassName}
              style={selectedAvatarStyle}
              aria-hidden="true"
            >
              {value ? selected.thumbnailUrl ? null : initial : <UserRound size={16} />}
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
              const optionAvatarClassName = [
                option.slug ? styles.castAvatar : styles.castAvatarEmpty,
                option.thumbnailUrl ? styles.castAvatarImage : "",
              ]
                .filter(Boolean)
                .join(" ");
              const optionAvatarStyle = option.thumbnailUrl
                ? { backgroundImage: `url("${option.thumbnailUrl}")` }
                : undefined;

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
                    className={optionAvatarClassName}
                    style={optionAvatarStyle}
                    aria-hidden="true"
                  >
                    {option.slug ? (
                      option.thumbnailUrl ? null : (
                        optionInitial
                      )
                    ) : (
                      <UserRound size={15} />
                    )}
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
          name={bookingFieldNames.selectedCast}
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
  name,
  value,
  onChange,
  onTouched,
  placeholder,
  icon,
  error,
  activeLanguage,
}: {
  label: string;
  name: string;
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
          name={name}
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
  name,
  value,
  onChange,
  onTouched,
  error,
  activeLanguage,
}: {
  name: string;
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
          type="text"
          {...bookingAutofillBlockProps}
          name={name}
          value={value}
          placeholder="Vui lòng nhập email"
          onBlur={onTouched}
          onChange={(event) => {
            onTouched();
            onChange(event.target.value);
          }}
          inputMode="email"
          autoCapitalize="none"
          autoCorrect="off"
          className={styles.input}
          spellCheck={false}
        />
      </span>
      <FieldError activeLanguage={activeLanguage} message={error} />
    </label>
  );
}
