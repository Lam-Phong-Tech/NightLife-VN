"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  CalendarDays,
  Check,
  ChevronRight,
  Mail,
  Minus,
  Plus,
  Route,
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
  getBookingDateAfterDays,
  getTodayBookingDate,
} from "@/lib/booking-date";
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
import styles from "./TourDetailClient.module.css";

const { bookingDateWindowDays, maxGuests } = bookingValidationLimits;

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

const tourBookingFieldNames = {
  guestCount: "nlbf-tour-f3",
  guestEmail: "nlbf-tour-f2",
  guestName: "nlbf-tour-f1",
  note: "nlbf-tour-f4",
} as const;

const tourBookingFieldScrollSelectors: BookingFieldScrollSelectors = {
  bookingDate: ".nl-booking-date-field",
  bookingTime: ".nl-booking-time-field",
  email: `[name="${tourBookingFieldNames.guestEmail}"]`,
  guestCount: `[name="${tourBookingFieldNames.guestCount}"]`,
  guestName: `[name="${tourBookingFieldNames.guestName}"]`,
  note: `[name="${tourBookingFieldNames.note}"]`,
};

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

const getTodayDate = getTodayBookingDate;

const getMaxBookingDate = () => getBookingDateAfterDays(bookingDateWindowDays);

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

const decodeHtmlEntity = (entity: string) => {
  const namedEntities: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };
  const normalized = entity.slice(1, -1).toLowerCase();

  if (namedEntities[normalized] !== undefined) return namedEntities[normalized];

  if (normalized.startsWith("#x")) {
    const codePoint = Number.parseInt(normalized.slice(2), 16);
    return Number.isInteger(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff
      ? String.fromCodePoint(codePoint)
      : entity;
  }

  if (normalized.startsWith("#")) {
    const codePoint = Number.parseInt(normalized.slice(1), 10);
    return Number.isInteger(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff
      ? String.fromCodePoint(codePoint)
      : entity;
  }

  return entity;
};

const cleanRichText = (value?: string | null) =>
  (value ?? "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(nbsp|amp|lt|gt|quot|apos|#\d+|#x[\da-f]+);/gi, decodeHtmlEntity)
    .replace(/\s+/g, " ")
    .trim();

const tourCover = (tour: PublicTour) =>
  tour.coverUrl || tour.stops.find((stop) => stop.store.media[0])?.store.media[0]?.url || "";

const storeImage = (store: TourStopStore) => store.media[0]?.url || "";

const castName = (cast: TourStoreCast) => cast.publicAlias || cast.stageName;

const castOptionKey = (cast: Pick<TourCastOption, "storeId" | "id">) => `${cast.storeId}:${cast.id}`;

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

const tourUiCopy = {
  home: {
    vi: "Trang chủ",
    en: "Home",
    ja: "ホーム",
    ko: "홈",
    zh: "首页",
  },
  noTourImage: {
    vi: "Chưa có ảnh tour",
    en: "No tour image yet",
    ja: "ツアー画像はまだありません",
    ko: "투어 이미지가 아직 없습니다",
    zh: "暂无旅游图片",
  },
  experienceTour: {
    vi: "Tour trải nghiệm",
    en: "Experience tour",
    ja: "体験ツアー",
    ko: "체험 투어",
    zh: "体验行程",
  },
  stopsUnit: {
    vi: "điểm",
    en: "stops",
    ja: "スポット",
    ko: "장소",
    zh: "站",
  },
  stopStatsLabel: {
    vi: "Điểm dừng chân",
    en: "Stops",
    ja: "立ち寄り先",
    ko: "방문 장소",
    zh: "停靠点",
  },
  hoursUnit: {
    vi: "giờ",
    en: "hours",
    ja: "時間",
    ko: "시간",
    zh: "小时",
  },
  durationLabel: {
    vi: "Tổng thời lượng",
    en: "Duration",
    ja: "所要時間",
    ko: "소요 시간",
    zh: "总时长",
  },
  costTier: {
    vi: "Mức chi phí",
    en: "Price tier",
    ja: "価格帯",
    ko: "가격대",
    zh: "价格等级",
  },
  route: {
    vi: "Hành trình",
    en: "Route",
    ja: "行程",
    ko: "동선",
    zh: "行程",
  },
  routeTitle: {
    vi: "Lịch trình chi tiết các điểm dừng",
    en: "Detailed route stops",
    ja: "立ち寄り先の詳細",
    ko: "상세 방문 일정",
    zh: "详细停靠行程",
  },
  noVenueImage: {
    vi: "Chưa có ảnh quán",
    en: "No venue image yet",
    ja: "店舗画像はまだありません",
    ko: "매장 이미지가 아직 없습니다",
    zh: "暂无店铺图片",
  },
  companionCast: {
    vi: "Cast đồng hành",
    en: "Companion Cast",
    ja: "同行キャスト",
    ko: "동행 Cast",
    zh: "同行 Cast",
  },
  chooseCast: {
    vi: "Chọn cast trong hành trình nếu muốn",
    en: "Choose a Cast for the tour if you want",
    ja: "必要に応じて同行キャストを選択",
    ko: "원하면 동행 Cast를 선택하세요",
    zh: "可按需选择同行 Cast",
  },
  noCast: {
    vi: "Không chọn cast",
    en: "No Cast selected",
    ja: "キャストを選択しない",
    ko: "Cast 선택 안 함",
    zh: "不选择 Cast",
  },
  freeExperience: {
    vi: "Trải nghiệm tự do",
    en: "Free experience",
    ja: "自由に楽しむ",
    ko: "자유롭게 이용",
    zh: "自由体验",
  },
  bookThisTour: {
    vi: "Đặt tour này",
    en: "Book this tour",
    ja: "このツアーを予約",
    ko: "이 투어 예약",
    zh: "预订此行程",
  },
  bookingPoint: {
    vi: "Điểm đặt tour",
    en: "Booking point",
    ja: "予約先",
    ko: "예약 장소",
    zh: "预订点",
  },
  invalidTour: {
    vi: "Tour chưa có điểm dừng hợp lệ",
    en: "This tour has no valid stop yet",
    ja: "有効な立ち寄り先がまだありません",
    ko: "유효한 방문 장소가 아직 없습니다",
    zh: "该行程暂无有效停靠点",
  },
  nameLabel: {
    vi: "Họ tên",
    en: "Full name",
    ja: "お名前",
    ko: "이름",
    zh: "姓名",
  },
  namePlaceholder: {
    vi: "Vui lòng nhập họ tên",
    en: "Enter your full name",
    ja: "お名前を入力してください",
    ko: "이름을 입력해 주세요",
    zh: "请输入姓名",
  },
  emailPlaceholder: {
    vi: "Vui lòng nhập email",
    en: "Enter your email",
    ja: "メールアドレスを入力してください",
    ko: "이메일을 입력해 주세요",
    zh: "请输入邮箱",
  },
  dateLabel: {
    vi: "Ngày",
    en: "Date",
    ja: "日付",
    ko: "날짜",
    zh: "日期",
  },
  timeLabel: {
    vi: "Khung giờ",
    en: "Time slot",
    ja: "時間帯",
    ko: "시간대",
    zh: "时间段",
  },
  noTimeSlots: {
    vi: "Tour chưa có khung giờ khả dụng trong ngày này.",
    en: "No available time slot for this tour on this date.",
    ja: "この日程で利用できる時間帯はありません。",
    ko: "이 날짜에 이용 가능한 시간이 없습니다.",
    zh: "该日期暂无可用时间段。",
  },
  guestsLabel: {
    vi: "Số người",
    en: "Guests",
    ja: "人数",
    ko: "인원",
    zh: "人数",
  },
  decreaseGuests: {
    vi: "Giảm số người",
    en: "Decrease guests",
    ja: "人数を減らす",
    ko: "인원 줄이기",
    zh: "减少人数",
  },
  increaseGuests: {
    vi: "Tăng số người",
    en: "Increase guests",
    ja: "人数を増やす",
    ko: "인원 늘리기",
    zh: "增加人数",
  },
  optionalNote: {
    vi: "Ghi chú tuỳ chọn",
    en: "Optional note",
    ja: "任意メモ",
    ko: "선택 메모",
    zh: "可选备注",
  },
  notePlaceholder: {
    vi: "Ví dụ: cần bàn yên tĩnh, đi theo nhóm...",
    en: "Example: quiet table, traveling as a group...",
    ja: "例: 静かな席希望、グループで利用...",
    ko: "예: 조용한 자리, 단체 이용...",
    zh: "例如：需要安静座位、多人同行...",
  },
  submitting: {
    vi: "Đang gửi yêu cầu...",
    en: "Sending request...",
    ja: "リクエストを送信中...",
    ko: "요청 전송 중...",
    zh: "正在发送请求...",
  },
  submitTour: {
    vi: "Gửi yêu cầu đặt tour",
    en: "Send tour request",
    ja: "ツアー予約を送信",
    ko: "투어 예약 요청",
    zh: "发送行程预订请求",
  },
  bookingFailed: {
    vi: "Không gửi được yêu cầu đặt tour.",
    en: "Could not send the tour request.",
    ja: "ツアー予約を送信できませんでした。",
    ko: "투어 예약 요청을 보낼 수 없습니다.",
    zh: "无法发送行程预订请求。",
  },
} satisfies Record<string, Record<LanguageCode, string>>;

type TourUiCopyKey = keyof typeof tourUiCopy;

const tourUiText = (key: TourUiCopyKey, language: LanguageCode) =>
  tourUiCopy[key][language] ?? tourUiCopy[key].vi;

const tourBookingSummary = (tour: PublicTour, selectedCasts: TourCastOption[]) =>
  tour.stops.map((stop, index) => {
    const casts = selectedCasts
      .filter((cast) => cast.storeId === stop.store.id)
      .map((cast) => ({
        id: cast.id,
        slug: cast.slug,
        name: castName(cast),
      }));

    return {
      order: stop.order || index + 1,
      storeId: stop.store.id,
      storeSlug: stop.store.slug,
      storeName: stop.store.name,
      casts,
    };
  });

const tourBookingNote = (tour: PublicTour, selectedCasts: TourCastOption[], customerNote: string) => {
  const stopNames = tour.stops.map((stop) => stop.store.name).join(" > ");
  const castByStop = tourBookingSummary(tour, selectedCasts)
    .map((stop) => {
      const castText = stop.casts.length ? stop.casts.map((cast) => cast.name).join(", ") : "khong chon cast";
      return `${stop.order}. ${stop.storeName}: ${castText}`;
    })
    .join("; ");
  const lines = [
    `Tour: ${tour.title}`,
    stopNames ? `Diem dung: ${stopNames}` : "",
    castByStop ? `Cast theo quan: ${castByStop}` : "",
    customerNote ? `Ghi chu khach: ${customerNote}` : "",
  ].filter(Boolean);

  return normalizeBookingNote(lines.join(" | ")).slice(0, bookingValidationLimits.maxNoteLength);
};

export default function TourDetailClient({ tour }: TourDetailClientProps) {
  const router = useRouter();
  const activeLanguage = useActiveLanguage();
  const t = (value: string) => translateText(value, activeLanguage);
  const tx = (key: TourUiCopyKey) => tourUiText(key, activeLanguage);
  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [bookingDate, setBookingDate] = useState(getTodayDate);
  const [bookingTime, setBookingTime] = useState("");
  const [guests, setGuests] = useState(2);
  const [note, setNote] = useState("");
  const [selectedCastKeys, setSelectedCastKeys] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [touchedFields, setTouchedFields] = useState<BookingTouchedFields>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  const firstStop = tour.stops[0];
  const firstStore = firstStop?.store;
  const cleanSubtitle = cleanRichText(tour.subtitle);
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
  const selectedCasts = useMemo(
    () => selectedCastKeys.map((key) => tourCasts.find((cast) => castOptionKey(cast) === key)).filter(Boolean) as TourCastOption[],
    [selectedCastKeys, tourCasts],
  );
  const singleSelectedCast = selectedCasts.length === 1 ? selectedCasts[0] : null;
  const bookingStore =
    singleSelectedCast && tour.stops.find((stop) => stop.store.slug === singleSelectedCast.storeSlug)?.store
      ? tour.stops.find((stop) => stop.store.slug === singleSelectedCast.storeSlug)!.store
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
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setPortalTarget(document.body);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const validCastKeys = new Set(tourCasts.map(castOptionKey));
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setSelectedCastKeys((current) => current.filter((key) => validCastKeys.has(key)));
    });
    return () => {
      cancelled = true;
    };
  }, [tourCasts]);

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

  const targetLabel = tour.title || firstStore?.name;
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
    const validationErrors = buildBookingFieldErrors({
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
    });
    const validationErrorField = firstBookingFieldErrorKey(validationErrors);

    setGuestName(displayName);
    setEmail(normalizedEmail);
    setNote(trimmedNote);

    if (validationErrorField) {
      scrollBookingValidationFieldIntoView(validationErrorField, tourBookingFieldScrollSelectors);
      return;
    }
    if (!bookingStore) {
      setErrorMessage(tx("invalidTour"));
      return;
    }

    const payload: CreateBookingPayload = {
      storeSlug: bookingStore.slug,
      ...(singleSelectedCast ? { castSlug: singleSelectedCast.slug } : {}),
      displayName,
      email: normalizedEmail,
      scheduledAt,
      partySize: guests,
      note: tourBookingNote(tour, selectedCasts, trimmedNote),
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

      const tourBooking = {
        ...booking,
        tour: {
          id: tour.id,
          title: tour.title,
          stops: tourBookingSummary(tour, selectedCasts),
        },
      };
      rememberLastBooking(tourBooking, { history: true });
      if (savedAsMemberBooking) {
        requestMemberNotificationsRefresh();
      }
      router.push(`/xac-nhan?bookingId=${booking.id}`);
    } catch (error) {
      setErrorMessage(
        localizedApiErrorMessage(error, activeLanguage, tourUiText("bookingFailed", "vi")),
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
            {tx("home")}
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
                label={tx("noTourImage")}
                className={styles.heroMedia}
              >
                <div className={styles.heroOverlay}>
                  <div className={styles.heroCopy}>
                    <span className={styles.eyebrow}>
                      <Sparkles size={14} /> {tx("experienceTour")}
                    </span>
                    <h1 className={styles.heroTitle}>{tour.title}</h1>
                    {cleanSubtitle ? <p className={styles.heroText}>{cleanSubtitle}</p> : null}
                  </div>
                </div>
              </PlaceholderMedia>
              <div className={styles.heroStats}>
                <div className={styles.heroStat}>
                  <strong>{tour.stops.length} {tx("stopsUnit")}</strong>
                  <span>{tx("stopStatsLabel")}</span>
                </div>
                <div className={styles.heroStat}>
                  <strong>{tour.durationHours} {tx("hoursUnit")}</strong>
                  <span>{tx("durationLabel")}</span>
                </div>
                <div className={styles.heroStat}>
                  <strong>{priceTierLabel(tour.priceTier)}</strong>
                  <span>{tx("costTier")}</span>
                </div>
              </div>
            </section>

            <section className={styles.sectionCard}>
              <span className={styles.sectionEyebrow}>
                <Route size={14} /> {tx("route")}
              </span>
              <h2 className={styles.sectionTitle}>{tx("routeTitle")}</h2>

              <div className={styles.timeline}>
                {tour.stops.map((stop) => {
                  const stopDescription = cleanRichText(stop.store.description);
                  const couponName = cleanRichText(stop.store.coupons[0]?.name);

                  return (
                    <article key={stop.id} className={styles.stopCard}>
                      <div className={styles.stopIndex}>{stop.order}</div>
                      <PlaceholderMedia
                        src={storeImage(stop.store)}
                        alt={stop.store.name}
                        label={tx("noVenueImage")}
                        className={styles.stopMedia}
                      />
                      <div className={styles.stopCopy}>
                        <div className={styles.stopMeta}>
                          <span>{t(categoryLabels[stop.store.category] ?? stop.store.category)}</span>
                          <span>{stop.store.area?.name || stop.store.district || formatCity(tour)}</span>
                        </div>
                        <h3 className={styles.stopTitle}>{stop.store.name}</h3>
                        {stopDescription ? <p className={styles.stopText}>{stopDescription}</p> : null}
                        {couponName ? (
                          <span className={styles.couponPill}>
                            <Tag size={13} /> <span className={styles.couponText}>{couponName}</span>
                          </span>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            {tourCasts.length ? (
              <section className={styles.sectionCard}>
                <span className={styles.sectionEyebrow}>
                  <Users size={14} /> {tx("companionCast")}
                </span>
                <h2 className={styles.sectionTitle}>{tx("chooseCast")}</h2>
                <div className={styles.castGrid}>
                  <button
                    type="button"
                    className={styles.castButton}
                    data-selected={selectedCastKeys.length === 0}
                    onClick={() => setSelectedCastKeys([])}
                  >
                    <span className={styles.castAvatar} />
                    <span className={styles.castCopy}>
                      <span className={styles.castName}>{tx("noCast")}</span>
                      <span className={styles.castMeta}>{tx("freeExperience")}</span>
                    </span>
                    {selectedCastKeys.length === 0 ? <Check size={17} color="var(--vy-gold)" /> : null}
                  </button>
                  {tourCasts.map((cast) => {
                    const key = castOptionKey(cast);
                    const isSelected = selectedCastKeys.includes(key);

                    return (
                      <button
                        type="button"
                        key={key}
                        className={styles.castButton}
                        data-selected={isSelected}
                        onClick={() =>
                          setSelectedCastKeys((current) =>
                            current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
                          )
                        }
                      >
                        <span
                          className={styles.castAvatar}
                          role={cast.thumbnailUrl ? "img" : undefined}
                          aria-label={cast.thumbnailUrl ? castName(cast) : undefined}
                          style={cast.thumbnailUrl ? { backgroundImage: `url(${JSON.stringify(cast.thumbnailUrl)})` } : undefined}
                        />
                        <span className={styles.castCopy}>
                          <span className={styles.castName}>{castName(cast)}</span>
                          <span className={styles.castMeta}>{cast.storeName}</span>
                        </span>
                        {isSelected ? <Check size={17} color="var(--vy-gold)" /> : null}
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : null}
          </div>

          <aside className={styles.bookingCard} id="tour-booking">
            <div className={styles.bookingHeader}>
              <div>
                <h2>{tx("bookThisTour")}</h2>
                <p>{targetLabel ? `${tx("bookingPoint")}: ${targetLabel}` : tx("invalidTour")}</p>
              </div>
              <div className={styles.priceTier}>{priceTierLabel(tour.priceTier)}</div>
            </div>

            <form
              id="tour-booking-form"
              className={styles.form}
              autoComplete="off"
              data-1p-ignore="true"
              data-bwignore="true"
              data-form-type="other"
              data-lpignore="true"
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                submitBooking();
              }}
            >
              <TextField
                label={tx("nameLabel")}
                name={tourBookingFieldNames.guestName}
                value={guestName}
                placeholder={tx("namePlaceholder")}
                icon={<UserRound size={16} />}
                error={visibleFieldErrors.guestName ? t(visibleFieldErrors.guestName) : undefined}
                onChange={(value) => setGuestName(sanitizeBookingDisplayNameInput(value))}
                onTouched={() => markFieldTouched("guestName")}
              />

              <TextField
                label="Email"
                name={tourBookingFieldNames.guestEmail}
                value={email}
                placeholder={tx("emailPlaceholder")}
                icon={<Mail size={16} />}
                error={visibleFieldErrors.email ? t(visibleFieldErrors.email) : undefined}
                onChange={setEmail}
                onTouched={() => markFieldTouched("email")}
              />

              <div className={styles.dateTime}>
                <BookingDateTimeFields
                  dateValue={bookingDate}
                  dateLabel={tx("dateLabel")}
                  timeValue={bookingTime}
                  timeLabel={tx("timeLabel")}
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
                  dateError={visibleFieldErrors.bookingDate ? t(visibleFieldErrors.bookingDate) : undefined}
                  timeError={visibleFieldErrors.bookingTime ? t(visibleFieldErrors.bookingTime) : undefined}
                  errorPlacement="outside"
                  labelClassName={styles.label}
                  emptyMessage={tx("noTimeSlots")}
                />
              </div>

              <div className={styles.field}>
                <span className={styles.label}>{tx("guestsLabel")}</span>
                <div className={styles.guestControl}>
                  <button
                    type="button"
                    className={styles.guestButton}
                    onClick={() => {
                      markFieldTouched("guestCount");
                      setGuests((value) => clampBookingGuestCount(value - 1));
                    }}
                    disabled={guests <= 1}
                    aria-label={tx("decreaseGuests")}
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    {...bookingAutofillBlockProps}
                    className={`${styles.input} ${styles.guestInput}`}
                    type="text"
                    inputMode="numeric"
                    name={tourBookingFieldNames.guestCount}
                    value={String(guests)}
                    onBlur={() => markFieldTouched("guestCount")}
                    onChange={(event) => {
                      markFieldTouched("guestCount");
                      setGuests(sanitizeBookingGuestCountInput(event.target.value));
                    }}
                    aria-label={tx("guestsLabel")}
                  />
                  <button
                    type="button"
                    className={styles.guestButton}
                    onClick={() => {
                      markFieldTouched("guestCount");
                      setGuests((value) => clampBookingGuestCount(value + 1));
                    }}
                    disabled={guests >= maxGuests}
                    aria-label={tx("increaseGuests")}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <span className={styles.fieldError}>
                  {visibleFieldErrors.guestCount ? t(visibleFieldErrors.guestCount) : ""}
                </span>
              </div>

              <div className={styles.field}>
                <span className={styles.label}>{tx("optionalNote")}</span>
                <textarea
                  {...bookingAutofillBlockProps}
                  className={styles.textarea}
                  name={tourBookingFieldNames.note}
                  value={note}
                  onBlur={() => markFieldTouched("note")}
                  onChange={(event) => {
                    markFieldTouched("note");
                    setNote(event.target.value);
                  }}
                  placeholder={tx("notePlaceholder")}
                />
                <span className={styles.fieldError}>{visibleFieldErrors.note ? t(visibleFieldErrors.note) : ""}</span>
              </div>

              {errorMessage ? <div className={styles.formError}>{t(errorMessage)}</div> : null}

              <button
                type="submit"
                className={`${styles.submitButton} ${styles.formSubmitButton}`}
                disabled={!canSubmit || isSubmitting}
              >
                <CalendarDays size={17} />
                {isSubmitting ? tx("submitting") : tx("submitTour")}
              </button>
            </form>
          </aside>
        </div>
      </div>

      {portalTarget
        ? createPortal(
            <div className={styles.mobileCtaBar} data-no-scroll-reveal>
              <button
                type="submit"
                form="tour-booking-form"
                className={`${styles.submitButton} ${styles.mobileSubmitButton}`}
                disabled={!canSubmit || isSubmitting}
              >
                <CalendarDays size={17} />
                <span>
                  <strong>{isSubmitting ? tx("submitting") : tx("submitTour")}</strong>
                </span>
              </button>
            </div>,
            portalTarget,
          )
        : null}
    </main>
  );
}

function TextField({
  label,
  name,
  value,
  placeholder,
  icon,
  error,
  onChange,
  onTouched,
}: {
  label: string;
  name: string;
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
            color: "var(--vy-gold)",
            display: "grid",
            placeItems: "center",
          }}
        >
          {icon}
        </span>
        <input
          {...bookingAutofillBlockProps}
          className={styles.input}
          name={name}
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
