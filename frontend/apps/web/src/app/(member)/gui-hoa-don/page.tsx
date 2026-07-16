"use client";

import { ConfigProvider, Select } from "antd";
import enUS from "antd/locale/en_US";
import jaJP from "antd/locale/ja_JP";
import koKR from "antd/locale/ko_KR";
import viVN from "antd/locale/vi_VN";
import zhCN from "antd/locale/zh_CN";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { ApiError, translateApiMessage } from "@/lib/api/client";
import {
  billApi,
  type BillOcrPreview,
  type BillRecord,
  type BillStoreOption,
} from "@/lib/api/bills";
import { bookingApi, getLastBooking, type BookingRecord } from "@/lib/api/bookings";
import { couponApi, type CouponIssue } from "@/lib/api/coupons";
import { useMoneyFormatter } from "@/components/providers/CurrencyProvider";
import {
  intlLocaleByLanguage,
  useActiveLanguage,
  type LanguageCode,
} from "@/lib/i18n/use-active-language";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Clock,
  FileText,
  Info,
  Sparkles,
  Trash2,
  UploadCloud,
} from "lucide-react";

const colors = {
  bg: "var(--vy-bg)",
  panel: "var(--vy-surface-2)",
  panelStrong: "var(--vy-surface-3)",
  border: "var(--vy-border-gold-22)",
  borderStrong: "var(--vy-border-gold-32)",
  text: "var(--vy-text)",
  muted: "var(--vy-muted)",
  dim: "var(--vy-faint)",
  gold: "var(--vy-gold)",
  goldPale: "var(--vy-gold-pale)",
  onGold: "var(--vy-on-gold)",
  danger: "var(--vy-error)",
  success: "var(--vy-success)",
  warning: "var(--vy-warn)",
};

const antdLocaleByLanguage: Record<LanguageCode, typeof viVN> = {
  vi: viVN,
  en: enUS,
  ja: jaJP,
  ko: koKR,
  zh: zhCN,
};

const billPickerTheme = {
  token: {
    colorPrimary: "var(--vy-gold)",
    colorBgContainer: "var(--vy-surface-3)",
    colorBgElevated: "var(--vy-surface)",
    colorBorder: "var(--vy-border-gold-22)",
    colorText: "var(--vy-text)",
    colorTextPlaceholder: "var(--vy-faint)",
    colorTextDisabled: "var(--vy-muted)",
    borderRadius: 8,
    controlHeight: 48,
    fontFamily: "inherit",
  },
  components: {
    Select: {
      activeBorderColor: "var(--vy-gold)",
      hoverBorderColor: "var(--vy-border-gold-40)",
      optionActiveBg: "var(--vy-gold-soft-bg)",
      optionSelectedBg: "var(--vy-gold-soft-bg)",
      optionSelectedColor: "var(--vy-gold-hi)",
    },
  },
} as const;

const tenDaysMs = 10 * 24 * 60 * 60 * 1000;
const maxBillTotalVnd = 100_000_000;
const maxEvidenceSizeBytes = 25 * 1024 * 1024;
const allowedEvidenceMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);
const allowedEvidenceExtension = /\.(jpe?g|png|webp|gif|pdf)$/i;

type FormNotice =
  | { tone: "success"; message: string; bill?: BillRecord }
  | { tone: "warning" | "danger"; message: string };

const billStatusLabel = (status?: string | null) => {
  switch (status) {
    case "VERIFIED":
      return "Đã duyệt";
    case "REJECTED":
      return "Từ chối";
    case "SUBMITTED":
      return "Chờ duyệt";
    case "PAID":
      return "Đã thanh toán";
    case "VOIDED":
      return "Đã hủy";
    default:
      return "Member";
  }
};

const toDatetimeLocalValue = (date: Date) => {
  const localTime = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localTime.toISOString().slice(0, 16);
};

const emptyDateLabel = (language: LanguageCode) =>
  ({
    vi: "Chưa có",
    en: "Not set",
    ja: "未設定",
    ko: "없음",
    zh: "未设置",
  })[language];

const formatDateTime = (value: string | null | undefined, language: LanguageCode) => {
  if (!value) return emptyDateLabel(language);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return emptyDateLabel(language);

  const tzString = date.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" });
  const tzDate = new Date(tzString);
  const pad = (n: number) => String(n).padStart(2, "0");
  
  const day = pad(tzDate.getDate());
  const month = pad(tzDate.getMonth() + 1);
  const year = tzDate.getFullYear();
  const hours = pad(tzDate.getHours());
  const minutes = pad(tzDate.getMinutes());

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};


const bookingTitle = (booking: BookingRecord) => {
  const storeName = booking.store?.name ?? "NightLife";
  if (!booking.cast) return storeName;
  return `${booking.cast.publicAlias ?? booking.cast.stageName} @ ${storeName}`;
};

const isBookingAdminConfirmedForBill = (booking: BookingRecord | null | undefined) =>
  ["CONFIRMED", "CHECKED_IN", "COMPLETED"].includes(
    String(booking?.status ?? "").toUpperCase(),
  );

const bookingConfirmedUsageAt = (booking: BookingRecord | null | undefined) =>
  booking?.qr?.usedAt ??
  booking?.couponIssue?.usedAt ??
  (isBookingAdminConfirmedForBill(booking)
    ? booking?.confirmedAt ?? booking?.updatedAt ?? null
    : null);

const confirmedUsageSourceLabel = (
  booking: BookingRecord | null,
  couponIssue: CouponIssue | null,
) => {
  if (booking?.qr?.usedAt) return "QR booking đã được partner xác nhận";
  if (booking?.couponIssue?.usedAt) return "Coupon gắn booking đã được partner xác nhận";
  if (isBookingAdminConfirmedForBill(booking) && (booking?.confirmedAt || booking?.updatedAt)) {
    return "Booking đã được Admin xác nhận";
  }
  if (couponIssue?.usedAt) return "Coupon đã được partner xác nhận";
  if (booking || couponIssue) return "Chưa có xác nhận sử dụng từ Admin/partner";
  return "Chọn booking hoặc coupon đã được Admin/partner xác nhận";
};

const sanitizeMoneyInput = (value: string) => value.replace(/[^\d]/g, "");
const parseMoneyInput = (value: string) => Number(sanitizeMoneyInput(value));
const formatMoneyInput = (value: string) => {
  const digits = sanitizeMoneyInput(value);
  return digits ? Number(digits).toLocaleString("vi-VN") : "";
};

const validateEvidenceFile = (file: File | null) => {
  if (!file) return "";

  const hasAllowedMime = allowedEvidenceMimeTypes.has(file.type);
  const hasAllowedExtension = allowedEvidenceExtension.test(file.name);

  if (!hasAllowedMime && !hasAllowedExtension) {
    return "Ảnh/chứng từ chỉ hỗ trợ JPG, PNG, WEBP, GIF hoặc PDF.";
  }

  if (file.size > maxEvidenceSizeBytes) {
    return "Ảnh/chứng từ không được vượt quá 25MB.";
  }

  return "";
};

const validateBillForm = ({
  isLoadingOptions,
  hasBookedStores,
  hasStore,
  hasConfirmedUsageSource,
  amountInput,
  amount,
  usedAt,
  isUsedAtInvalid,
  isFutureUsage,
  isPastDeadline,
  evidenceFile,
  timeReady,
}: {
  isLoadingOptions: boolean;
  hasBookedStores: boolean;
  hasStore: boolean;
  hasConfirmedUsageSource: boolean;
  amountInput: string;
  amount: number;
  usedAt: string;
  isUsedAtInvalid: boolean;
  isFutureUsage: boolean;
  isPastDeadline: boolean;
  evidenceFile: File | null;
  timeReady: boolean;
}) => {
  if (isLoadingOptions) {
    return "Đang tải danh sách quán, vui lòng thử lại sau vài giây.";
  }

  if (!hasBookedStores) {
    return "Bạn cần có ít nhất một lịch đặt chỗ trước khi gửi hóa đơn.";
  }

  if (!hasStore) {
    return "Vui lòng chọn quán/cơ sở.";
  }

  if (!hasConfirmedUsageSource) {
    return "Vui lòng liên kết booking/coupon đã được Admin hoặc partner xác nhận.";
  }

  if (!amountInput.trim()) {
    return "Vui lòng nhập tổng tiền bill gốc.";
  }

  if (!Number.isSafeInteger(amount) || amount < 1) {
    return "Tổng tiền bill gốc phải là số nguyên lớn hơn 0.";
  }

  if (amount > maxBillTotalVnd) {
    return "Tổng tiền bill gốc không được vượt quá 100.000.000đ.";
  }

  if (!usedAt.trim()) {
    return "Booking/coupon này chưa có thời gian xác nhận sử dụng từ Admin/partner.";
  }

  if (isUsedAtInvalid) {
    return "Thời gian sử dụng không hợp lệ.";
  }

  if (!timeReady) {
    return "Đang đồng bộ thời gian, vui lòng thử lại sau vài giây.";
  }

  if (isFutureUsage) {
    return "Thời gian sử dụng không được ở tương lai.";
  }

  if (isPastDeadline) {
    return "Bill quá 10 ngày sẽ không được nhận.";
  }

  return validateEvidenceFile(evidenceFile);
};

const canAttachCouponIssueToBill = (issue: CouponIssue) =>
  issue.status === "USED" && Boolean(issue.usedAt);

const couponIssueOptionLabel = (issue: CouponIssue) => {
  const storeName = issue.coupon.store?.name ?? "Coupon";
  const status = issue.statusLabel ?? issue.status;
  return `${issue.coupon.name} - ${storeName} - ${status}`;
};

type CouponDiscountSource = {
  discountType?: "PERCENT" | "FIXED_AMOUNT" | string;
  discountValue?: number;
  maxDiscountVnd?: number | null;
  minSpendVnd?: number | null;
};

const couponDiscountLabel = (
  coupon: CouponDiscountSource | null | undefined,
  issue: CouponIssue | null | undefined,
  formatMoney: (value: number) => string,
) => {
  const snapshot = issue?.discountRuleSnapshot;
  const discountType = snapshot?.type ?? coupon?.discountType;
  const discountValue =
    snapshot?.value ??
    snapshot?.sourceValue ??
    coupon?.discountValue ??
    snapshot?.discountPercent ??
    issue?.discountPercent ??
    null;
  const maxDiscountVnd = snapshot?.maxDiscountVnd ?? coupon?.maxDiscountVnd ?? null;
  const minSpendVnd = snapshot?.minSpendVnd ?? coupon?.minSpendVnd ?? null;

  if (!discountType && !discountValue) return "";

  const mainLabel =
    discountType === "FIXED_AMOUNT"
      ? `-${formatMoney(Number(discountValue ?? 0))}`
      : `-${Number(discountValue ?? 0)}%`;
  const detailParts = [
    typeof maxDiscountVnd === "number" && maxDiscountVnd > 0
      ? `tối đa ${formatMoney(maxDiscountVnd)}`
      : "",
    typeof minSpendVnd === "number" && minSpendVnd > 0
      ? `từ ${formatMoney(minSpendVnd)}`
      : "",
  ].filter(Boolean);

  return detailParts.length ? `${mainLabel} (${detailParts.join(", ")})` : mainLabel;
};

const bookedStoreOptionsFromBookings = (bookings: BookingRecord[]) => {
  const storesBySlug = new Map<string, BillStoreOption>();

  bookings.forEach((booking) => {
    const store = booking.store;
    if (!store?.slug || storesBySlug.has(store.slug)) return;

    storesBySlug.set(store.slug, {
      id: store.id,
      name: store.name,
      slug: store.slug,
    });
  });

  return Array.from(storesBySlug.values());
};

const cleanApiMessage = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "Guest chưa đăng nhập không gửi bill trong MVP; vui lòng đăng nhập/đăng ký Member.";
    }

    return translateApiMessage(error.message, error.status);
  }

  return translateApiMessage(
    error instanceof Error ? error.message : undefined,
    undefined,
    "Chưa gửi được bill. Vui lòng thử lại.",
  );
};

export default function Page() {
  const searchParams = useSearchParams();
  const activeLanguage = useActiveLanguage();
  const { formatMoney } = useMoneyFormatter(activeLanguage);
  const focusedBillId = searchParams.get("billId") || "";
  const requestedBookingId = searchParams.get("bookingId")?.trim() || "";
  const requestedStoreSlug = searchParams.get("storeSlug")?.trim() || "";
  const [stores, setStores] = useState<BillStoreOption[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [couponIssues, setCouponIssues] = useState<CouponIssue[]>([]);
  const [storeSlug, setStoreSlug] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [couponIssueId, setCouponIssueId] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ocrPreview, setOcrPreview] = useState<BillOcrPreview | null>(null);
  const [notice, setNotice] = useState<FormNotice | null>(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReadingEvidence, setIsReadingEvidence] = useState(false);
  const [submittedBills, setSubmittedBills] = useState<BillRecord[]>([]);
  const [appliedBookingId, setAppliedBookingId] = useState("");
  const [timeWindow, setTimeWindow] = useState({
    nowMs: 0,
  });

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleEvidenceFileChange = (input: HTMLInputElement) => {
    const file = input.files?.[0] ?? null;
    const fileError = validateEvidenceFile(file);
    if (fileError) {
      input.value = "";
      setEvidenceFile(null);
      setOcrPreview(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setNotice({ tone: "danger", message: fileError });
      return;
    }

    setNotice(null);
    setEvidenceFile(file);
    setOcrPreview(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    if (file && file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const readEvidenceText = async (file: File) => {
    if (
      file.type.startsWith("text/") ||
      file.type === "application/pdf" ||
      /\.(txt|csv|pdf)$/i.test(file.name)
    ) {
      try {
        return (await file.text()).slice(0, 8000);
      } catch {
        return "";
      }
    }

    return "";
  };

  const handleReadEvidence = async () => {
    if (!evidenceFile) return;
    const fileError = validateEvidenceFile(evidenceFile);
    if (fileError) {
      setNotice({ tone: "danger", message: fileError });
      return;
    }

    setIsReadingEvidence(true);
    setNotice(null);
    try {
      const preview = await billApi.previewBillOcr({
        fileName: evidenceFile.name,
        text: await readEvidenceText(evidenceFile),
      });
      setOcrPreview(preview);
      if (preview.suggestions.totalVnd) {
        setAmountInput(preview.suggestions.totalVnd.toLocaleString("vi-VN"));
      }
      setNotice({
        tone: preview.requiresManualReview ? "warning" : "success",
        message: preview.requiresManualReview
          ? "AI đọc bill đã gợi ý dữ liệu, vui lòng kiểm tra lại trước khi gửi."
          : "AI đọc bill đã điền tổng tiền. Thời gian sử dụng vẫn lấy từ mốc Admin/partner xác nhận.",
      });
    } catch (error) {
      setNotice({ tone: "danger", message: cleanApiMessage(error) });
    } finally {
      setIsReadingEvidence(false);
    }
  };

  useEffect(() => {
    let active = true;

    const loadOptions = async () => {
      setIsLoadingOptions(true);
      try {
        const [bookingItems, couponIssueItems, billItems] = await Promise.all([
          bookingApi.listMemberBookings().catch(() => [] as BookingRecord[]),
          couponApi.listMemberCouponIssues().catch(() => [] as CouponIssue[]),
          billApi.listMemberBills().catch(() => [] as BillRecord[]),
        ]);

        if (!active) return;
        const rememberedBooking = requestedBookingId ? getLastBooking(requestedBookingId) : null;
        const mergedBookingItems =
          rememberedBooking && !bookingItems.some((booking) => booking.id === rememberedBooking.id)
            ? [rememberedBooking, ...bookingItems]
            : bookingItems;
        const requestedBooking = requestedBookingId
          ? mergedBookingItems.find((booking) => booking.id === requestedBookingId) ?? null
          : null;
        const preferredStoreSlug = requestedBooking?.store?.slug || requestedStoreSlug;
        const bookedStoreItems = bookedStoreOptionsFromBookings(mergedBookingItems);
        const bookedStoreSlugs = new Set(bookedStoreItems.map((storeItem) => storeItem.slug));

        setStores(bookedStoreItems);
        setBookings(mergedBookingItems);
        if (requestedBooking) {
          setBookingId(requestedBooking.id);
        } else if (mergedBookingItems.length === 1 && mergedBookingItems[0]) {
          setBookingId(mergedBookingItems[0].id);
          if (mergedBookingItems[0].store?.slug) {
            setStoreSlug(mergedBookingItems[0].store.slug);
          }
        }
        if (preferredStoreSlug && mergedBookingItems.length !== 1) {
          setStoreSlug(preferredStoreSlug);
        }
        setCouponIssues(
          couponIssueItems.filter((issue) => {
            const issueStoreSlug = issue.coupon.store?.slug;
            return Boolean(
              canAttachCouponIssueToBill(issue) &&
                issueStoreSlug &&
                bookedStoreSlugs.has(issueStoreSlug),
            );
          }),
        );
        setSubmittedBills(billItems);
        setStoreSlug((current) => {
          if (
            preferredStoreSlug &&
            bookedStoreItems.some((storeItem) => storeItem.slug === preferredStoreSlug)
          ) {
            return preferredStoreSlug;
          }

          return current && bookedStoreItems.some((storeItem) => storeItem.slug === current)
            ? current
            : bookedStoreItems[0]?.slug || "";
        });
      } catch (error) {
        if (!active) return;
        setStores([]);
        setBookings([]);
        setCouponIssues([]);
        setSubmittedBills([]);
        setStoreSlug("");
        setNotice({ tone: "danger", message: cleanApiMessage(error) });
      } finally {
        if (active) {
          setIsLoadingOptions(false);
        }
      }
    };

    void loadOptions();

    return () => {
      active = false;
    };
  }, [requestedBookingId, requestedStoreSlug]);

  useEffect(() => {
    const refreshWindow = () => {
      const now = new Date();
      setTimeWindow({
        nowMs: now.getTime(),
      });
    };

    refreshWindow();
    const interval = window.setInterval(refreshWindow, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const selectedBooking = useMemo(
    () => bookings.find((booking) => booking.id === bookingId) ?? null,
    [bookingId, bookings],
  );

  useEffect(() => {
    if (!requestedBookingId || requestedBookingId === appliedBookingId) return;

    const booking = bookings.find((item) => item.id === requestedBookingId);
    if (!booking) return;

    queueMicrotask(() => {
      setBookingId(booking.id);
      setCouponIssueId("");
      if (booking.store?.slug) {
        setStoreSlug(booking.store.slug);
      }
      setNotice({
        tone: "success",
        message: `Đã liên kết booking ${booking.bookingCode}. Thời gian sử dụng sẽ lấy từ mốc Admin/partner xác nhận.`,
      });
      setAppliedBookingId(requestedBookingId);
    });
  }, [appliedBookingId, bookings, requestedBookingId]);

  const selectedCouponIssue = useMemo(
    () => couponIssues.find((issue) => issue.id === couponIssueId) ?? null,
    [couponIssueId, couponIssues],
  );

  const confirmedUsageAt = useMemo(() => {
    if (selectedBooking) return bookingConfirmedUsageAt(selectedBooking);
    if (selectedCouponIssue) return selectedCouponIssue.usedAt ?? null;
    return null;
  }, [selectedBooking, selectedCouponIssue]);
  const usedAt = useMemo(
    () => {
      if (!confirmedUsageAt) return "";
      const date = new Date(confirmedUsageAt);
      return Number.isNaN(date.getTime()) ? "" : toDatetimeLocalValue(date);
    },
    [confirmedUsageAt],
  );
  const confirmedUsageLabel = useMemo(
    () => confirmedUsageSourceLabel(selectedBooking, selectedCouponIssue),
    [selectedBooking, selectedCouponIssue],
  );

  const selectedStore = useMemo(() => {
    if (selectedBooking?.store?.slug) {
      return stores.find((storeItem) => storeItem.slug === selectedBooking.store?.slug) ?? null;
    }

    if (selectedCouponIssue?.coupon.store?.slug) {
      return (
        stores.find((storeItem) => storeItem.slug === selectedCouponIssue.coupon.store?.slug) ??
        null
      );
    }

    return stores.find((storeItem) => storeItem.slug === storeSlug) ?? null;
  }, [selectedBooking, selectedCouponIssue, storeSlug, stores]);
  const linkedCouponDiscount = useMemo(
    () =>
      couponDiscountLabel(
        selectedBooking?.coupon ?? selectedCouponIssue?.coupon,
        selectedCouponIssue,
        formatMoney,
      ),
    [formatMoney, selectedBooking?.coupon, selectedCouponIssue],
  );

  const amount = useMemo(() => parseMoneyInput(amountInput), [amountInput]);
  const visibleSubmittedBills = useMemo(() => {
    const topBills = submittedBills.slice(0, 5);
    if (!focusedBillId || topBills.some((bill) => bill.id === focusedBillId)) {
      return topBills;
    }

    const focusedBill = submittedBills.find((bill) => bill.id === focusedBillId);
    return focusedBill ? [focusedBill, ...topBills].slice(0, 6) : topBills;
  }, [focusedBillId, submittedBills]);
  const usedAtDate = useMemo(() => new Date(usedAt), [usedAt]);
  const isUsedAtInvalid = Number.isNaN(usedAtDate.getTime());
  const isFutureUsage =
    Boolean(timeWindow.nowMs) && !isUsedAtInvalid && usedAtDate.getTime() > timeWindow.nowMs;
  const isPastDeadline =
    Boolean(timeWindow.nowMs) &&
    !isUsedAtInvalid &&
    timeWindow.nowMs - usedAtDate.getTime() > tenDaysMs;
  const isMissingUsageConfirmation = !usedAt.trim();
  const deadlineStatusLabel = isMissingUsageConfirmation
    ? "Chưa xác nhận"
    : isFutureUsage
      ? "Sai thời gian"
      : isPastDeadline
        ? "Quá hạn"
        : "Hợp lệ";
  const deadlineStatusColor =
    isFutureUsage || isPastDeadline
      ? colors.danger
      : isMissingUsageConfirmation
        ? colors.warning
        : colors.success;
  const billValidationMessage = useMemo(
    () =>
      validateBillForm({
        isLoadingOptions,
        hasBookedStores: stores.length > 0,
        hasStore: Boolean(bookingId || storeSlug),
        hasConfirmedUsageSource: Boolean(selectedBooking || selectedCouponIssue),
        amountInput,
        amount,
        usedAt,
        isUsedAtInvalid,
        isFutureUsage,
        isPastDeadline,
        evidenceFile,
        timeReady: Boolean(timeWindow.nowMs),
      }),
    [
      amount,
      amountInput,
      bookingId,
      evidenceFile,
      isFutureUsage,
      isLoadingOptions,
      isPastDeadline,
      isUsedAtInvalid,
      storeSlug,
      stores.length,
      selectedBooking,
      selectedCouponIssue,
      timeWindow.nowMs,
      usedAt,
    ],
  );
  const canSubmit =
    !isSubmitting &&
    !billValidationMessage;

  const handleBookingChange = (value: string) => {
    setBookingId(value);
    if (value) {
      setCouponIssueId("");
    }
    const booking = bookings.find((item) => item.id === value);
    if (booking?.store?.slug) {
      setStoreSlug(booking.store.slug);
    }
  };

  const handleCouponIssueChange = (value: string) => {
    setCouponIssueId(value);
    const issue = couponIssues.find((item) => item.id === value);
    if (issue?.coupon.store?.slug) {
      setStoreSlug(issue.coupon.store.slug);
    }
  };

  const handleAmountChange = (value: string) => {
    setAmountInput(sanitizeMoneyInput(value));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);

    if (billValidationMessage) {
      setNotice({
        tone: "danger",
        message: billValidationMessage,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        storeSlug,
        ...(bookingId ? { bookingId } : {}),
        ...(selectedCouponIssue
          ? {
              couponId: selectedCouponIssue.coupon.id,
              couponIssueId: selectedCouponIssue.id,
            }
          : {}),
        totalVnd: amount,
        usedAt: usedAtDate.toISOString(),
      };
      const bill = await billApi.submitMemberBill(payload);

      let uploadWarning = "";
      if (evidenceFile) {
        try {
          await billApi.uploadEvidence(bill.id, evidenceFile);
        } catch {
          uploadWarning = " Bill đã được gửi, nhưng ảnh/chứng từ chưa upload được.";
        }
      }

      setSubmittedBills((current) => [bill, ...current]);
      setNotice({
        tone: uploadWarning ? "warning" : "success",
        message: `Đã gửi bill ${bill.id.slice(0, 8)} để Admin duyệt.${uploadWarning}`,
        bill,
      });
      setAmountInput("");
      setBookingId("");
      setCouponIssueId("");
      setEvidenceFile(null);
      setOcrPreview(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } catch (error) {
      setNotice({ tone: "danger", message: cleanApiMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ConfigProvider locale={antdLocaleByLanguage[activeLanguage]} theme={billPickerTheme}>
      <main className="nl-bill-page">
        <section className="nl-bill-shell">
          <Link href="/tai-khoan" className="nl-back-link">
            <ChevronLeft size={16} />
            <span>Tài khoản</span>
          </Link>

          <div className="nl-bill-head">
            <div className="nl-bill-title-container">
              <div className="nl-bill-title-row">
                <h1 className="nl-bill-title">Gửi hóa đơn</h1>
                <span className="nl-bill-rule-pill">
                  <Clock size={12} />
                  <span>Trong 10 ngày</span>
                </span>
              </div>
              <div className="nl-bill-title-en">SUBMIT BILL</div>
              <div className="nl-title-divider"></div>
              <p className="nl-bill-desc">
                Gửi bill gốc để Admin đối soát điểm, ưu đãi và công nợ với quán.
              </p>
            </div>
          </div>

          <div className="nl-bill-layout">
            <form className="nl-bill-form" noValidate onSubmit={handleSubmit}>
              {/* Hidden inputs for test compatibility */}
              <input type="hidden" id="bill-used-at" value={usedAt ? formatDateTime(confirmedUsageAt, activeLanguage) : ""} readOnly />
              <input type="hidden" id="bill-booking" value={bookingId} readOnly />

              <div className="nl-field">
                <label htmlFor="bill-store-select">
                  Quán / cơ sở * <span className="nl-label-en">STORE / VENUE</span>
                </label>
                {selectedBooking || selectedCouponIssue ? (
                  <>
                    <div className="nl-static-value" id="bill-store-static">
                      {selectedStore?.name || storeSlug}
                    </div>
                    {/* Hidden input for test compatibility */}
                    <input type="hidden" id="bill-store-select" value={storeSlug} readOnly />
                  </>
                ) : (
                  <Select
                    className="nl-bill-ant-select"
                    disabled={isLoadingOptions || !stores.length}
                    id="bill-store-select"
                    onChange={(value) => setStoreSlug(value)}
                    options={
                      stores.length
                        ? stores.map((storeItem) => ({
                            label: `${storeItem.name}${storeItem.district ? ` - ${storeItem.district}` : ""}`,
                            value: storeItem.slug,
                          }))
                        : [{ label: "Chưa có quán đã đặt", value: "" }]
                    }
                    popupClassName="nl-bill-select-popup"
                    value={storeSlug}
                  />
                )}
                {!isLoadingOptions && !stores.length ? (
                  <span className="nl-field-help">
                    Bạn cần đặt chỗ ở một quán trước khi gửi hóa đơn.
                  </span>
                ) : null}
              </div>

              {bookings.length ? (
                <div className="nl-field">
                  <label htmlFor="bill-booking-select">
                    Liên kết booking <span className="nl-label-en">LINKED BOOKING</span>
                  </label>
                  {bookingId ? (
                    <>
                      <div className="nl-static-value" id="bill-booking-static">
                        {selectedBooking
                          ? `${selectedBooking.store?.name ?? "Booking"} - ${formatDateTime(
                              selectedBooking.scheduledAt,
                              activeLanguage,
                            )}`
                          : "Đã liên kết"}
                      </div>
                    </>
                  ) : (
                    <Select
                      className="nl-bill-ant-select"
                      id="bill-booking-select"
                      onChange={handleBookingChange}
                      options={[
                        { label: "Không liên kết booking", value: "" },
                        ...bookings.map((booking) => ({
                          label: `${booking.store?.name ?? "Booking"} - ${formatDateTime(
                            booking.scheduledAt,
                            activeLanguage,
                          )}`,
                          value: booking.id,
                        })),
                      ]}
                      popupClassName="nl-bill-select-popup"
                      value={bookingId}
                    />
                  )}
                </div>
              ) : null}

              {selectedBooking ? (
                <section className="nl-linked-booking" aria-label="Booking đang gắn với hóa đơn">
                  <div className="nl-receipt-ticket">
                    <div className="nl-receipt-header">
                      <span className="nl-receipt-title">Đơn hàng đang liên kết</span>
                      <strong className="nl-receipt-store">{bookingTitle(selectedBooking)}</strong>
                    </div>
                    <div className="nl-receipt-body">
                      <div className="nl-receipt-row">
                        <span className="nl-receipt-label">Mã booking</span>
                        <div className="nl-receipt-line"></div>
                        <span className="nl-receipt-value highlight">#{selectedBooking.bookingCode || selectedBooking.id.slice(0, 8).toUpperCase()}</span>
                      </div>
                      <div className="nl-receipt-row">
                        <span className="nl-receipt-label">Giờ hẹn</span>
                        <div className="nl-receipt-line"></div>
                        <span className="nl-receipt-value">{formatDateTime(selectedBooking.scheduledAt, activeLanguage)}</span>
                      </div>
                      <div className="nl-receipt-row">
                        <span className="nl-receipt-label">Xác nhận sử dụng</span>
                        <div className="nl-receipt-line"></div>
                        <span className="nl-receipt-value">
                          {bookingConfirmedUsageAt(selectedBooking)
                            ? formatDateTime(bookingConfirmedUsageAt(selectedBooking), activeLanguage)
                            : "Chưa Admin/partner xác nhận"}
                        </span>
                      </div>
                      <div className="nl-receipt-row">
                        <span className="nl-receipt-label">Số người</span>
                        <div className="nl-receipt-line"></div>
                        <span className="nl-receipt-value">{selectedBooking.partySize} người</span>
                      </div>
                      <div className="nl-receipt-row">
                        <span className="nl-receipt-label">Coupon/QR</span>
                        <div className="nl-receipt-line"></div>
                        <span className="nl-receipt-value">
                          {selectedBooking.coupon?.name ??
                            selectedBooking.couponIssue?.code ??
                            "QR đặt chỗ"}
                        </span>
                      </div>
                      {linkedCouponDiscount ? (
                        <div className="nl-receipt-row">
                          <span className="nl-receipt-label">Mức giảm</span>
                          <div className="nl-receipt-line"></div>
                          <span className="nl-receipt-value discount">{linkedCouponDiscount}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </section>
              ) : null}

              {!selectedBooking && couponIssues.length ? (
                <div className="nl-field">
                  <label htmlFor="bill-coupon-issue-select">
                    Coupon link <span className="nl-label-en">COUPON LINK</span>
                  </label>
                  {couponIssueId ? (
                    <>
                      <div className="nl-static-value" id="bill-coupon-issue-static">
                        {selectedCouponIssue
                          ? couponIssueOptionLabel(selectedCouponIssue)
                          : "Đã liên kết coupon"}
                      </div>
                      <input type="hidden" id="bill-coupon-issue-select" value={couponIssueId} readOnly />
                    </>
                  ) : (
                    <Select
                      className="nl-bill-ant-select"
                      id="bill-coupon-issue-select"
                      onChange={handleCouponIssueChange}
                      options={[
                        { label: "Không liên kết coupon", value: "" },
                        ...couponIssues.map((issue) => ({
                          label: couponIssueOptionLabel(issue),
                          value: issue.id,
                        })),
                      ]}
                      popupClassName="nl-bill-select-popup"
                      value={couponIssueId}
                    />
                  )}
                </div>
              ) : null}

              <div className="nl-form-grid">
                <div className="nl-field">
                  <label htmlFor="bill-total">
                    Tổng tiền bill gốc * <span className="nl-label-en">ORIGINAL BILL TOTAL</span>
                  </label>
                  <div className="nl-amount-input-wrapper">
                    <input
                      id="bill-total"
                      inputMode="numeric"
                      placeholder="Vui lòng nhập tổng tiền"
                      value={amountInput}
                      onChange={(event) => handleAmountChange(event.target.value)}
                      onBlur={() => setAmountInput((current) => formatMoneyInput(current))}
                      onFocus={() => setAmountInput((current) => sanitizeMoneyInput(current))}
                    />
                    <span className="nl-amount-suffix">₫</span>
                  </div>
                </div>

                <div className="nl-field">
                  <label>
                    Thời gian xác nhận sử dụng * <span className="nl-label-en">CONFIRMED USAGE TIME</span>
                  </label>
                  <div
                    className={usedAt ? "nl-confirmed-time" : "nl-confirmed-time pending"}
                  >
                    <div className="nl-confirmed-time-icon">
                      {usedAt ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                    </div>
                    <div className="nl-confirmed-time-content">
                      <strong>
                        {usedAt
                          ? formatDateTime(confirmedUsageAt, activeLanguage)
                          : "Chưa có thời gian xác nhận"}
                      </strong>
                      <span>{confirmedUsageLabel}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="nl-field">
                <label>
                  Ảnh / chứng từ <span className="nl-label-en">RECEIPT EVIDENCE / PHOTO</span>
                </label>
                
                <div className="nl-upload-zone-wrapper">
                  {!evidenceFile ? (
                    <label className="nl-upload-zone">
                      <UploadCloud className="nl-upload-icon" size={28} />
                      <span className="nl-upload-title">Nhấn để tải ảnh hoặc file PDF</span>
                      <span className="nl-upload-subtitle">Hỗ trợ JPG, PNG, WEBP, GIF, PDF (Tối đa 25MB)</span>
                      <span className="nl-upload-hint">Khuyến khích gửi kèm để duyệt nhanh hơn.</span>
                      <input
                        className="nl-upload-input-hidden"
                        type="file"
                        accept="image/*,.pdf"
                        onInput={(event) => handleEvidenceFileChange(event.currentTarget)}
                        onChange={(event) => handleEvidenceFileChange(event.currentTarget)}
                      />
                    </label>
                  ) : (
                    <div className="nl-upload-preview-card">
                      {previewUrl ? (
                        <div className="nl-preview-thumb-container">
                          <img src={previewUrl} alt="Thumbnail preview" className="nl-preview-thumb" />
                        </div>
                      ) : (
                        <div className="nl-preview-file-icon">
                          <FileText size={32} />
                        </div>
                      )}
                      <div className="nl-preview-info">
                        <span className="nl-preview-filename">{evidenceFile.name}</span>
                        <span className="nl-preview-filesize">
                          {Number(evidenceFile.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <div className="nl-preview-actions">
                        {evidenceFile ? (
                          <button
                            type="button"
                            className="nl-ocr-btn-premium"
                            disabled={isReadingEvidence}
                            onClick={handleReadEvidence}
                          >
                            <Sparkles size={12} />
                            <span>{isReadingEvidence ? "Đang đọc..." : "AI đọc bill"}</span>
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="nl-delete-file-btn"
                          aria-label="Bỏ file"
                          onClick={() => {
                            setEvidenceFile(null);
                            setOcrPreview(null);
                            if (previewUrl) {
                              URL.revokeObjectURL(previewUrl);
                              setPreviewUrl(null);
                            }
                          }}
                        >
                          <Trash2 size={14} />
                          <span>Xóa</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {ocrPreview ? (
                  <div className="nl-ocr-preview-premium">
                    <div className="nl-ocr-header">
                      <Sparkles size={14} className="nl-ocr-sparkle" />
                      <strong>Gợi ý từ Trí tuệ Nhân tạo (Độ tin cậy {Math.round(ocrPreview.confidence * 100)}%)</strong>
                    </div>
                    <div className="nl-ocr-results-grid">
                      <div className="nl-ocr-result-item">
                        <span className="nl-ocr-label">TỔNG TIỀN</span>
                        <strong className="nl-ocr-val">
                          {ocrPreview.suggestions.totalVnd
                            ? formatMoney(ocrPreview.suggestions.totalVnd)
                            : "Không đọc được (cần nhập tay)"}
                        </strong>
                      </div>
                      <div className="nl-ocr-result-item">
                        <span className="nl-ocr-label">THỜI GIAN TRÊN BILL</span>
                        <strong className="nl-ocr-val">
                          {ocrPreview.suggestions.usedAt
                            ? formatDateTime(ocrPreview.suggestions.usedAt, "vi")
                            : "Không đọc được"}
                        </strong>
                      </div>
                    </div>
                    <div className="nl-ocr-notes">
                      <span>* Thời gian gửi hệ thống vẫn được lấy từ mốc QR partner xác nhận.</span>
                      {ocrPreview.warnings.length ? (
                        <span className="nl-ocr-warn-text">{ocrPreview.warnings.slice(0, 2).join(" ")}</span>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className={isPastDeadline || isFutureUsage ? "nl-rule danger" : "nl-rule"}>
                <div className="nl-rule-icon">
                  <AlertCircle size={16} />
                </div>
                <span>
                  Chỉ nhập tổng tiền bill gốc, không nhập chi tiết món/dịch vụ. Thời gian sử dụng lấy
                  từ mốc Admin/partner xác nhận; bill quá 10 ngày sẽ không được nhận.
                </span>
              </div>

              {notice ? (
                <div className={`nl-notice ${notice.tone}`}>
                  <div className="nl-notice-icon">
                    {notice.tone === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  </div>
                  <span>{notice.message}</span>
                </div>
              ) : null}

              <button type="submit" className="nl-submit-premium" disabled={!canSubmit}>
                {isSubmitting ? (
                  <>
                    <span className="spin-loader"></span>
                    <span>Đang gửi bill...</span>
                  </>
                ) : (
                  <span>Gửi bill</span>
                )}
              </button>
            </form>

            <aside className="nl-bill-side">
              <section className="nl-recent">
                <div className="nl-recent-header-container">
                  <h2 className="nl-recent-title">Hóa đơn đã gửi</h2>
                  <span className="nl-recent-title-en">RECENT SUBMISSIONS</span>
                  <div className="nl-recent-divider"></div>
                </div>

                <div className="nl-recent-list">
                  {visibleSubmittedBills.length === 0 ? (
                    <div className="nl-recent-empty">
                      <FileText size={32} className="nl-empty-icon" />
                      <p>Bạn chưa gửi hóa đơn nào gần đây.</p>
                    </div>
                  ) : (
                    visibleSubmittedBills.map((bill) => (
                      <article
                        key={bill.id}
                        className={focusedBillId === bill.id ? "nl-recent-card active" : "nl-recent-card"}
                      >
                        <div className="nl-recent-card-header">
                          <span className="nl-recent-number">Bill #{bill.billNumber || bill.id.slice(0, 8).toUpperCase()}</span>
                          <span className={`nl-status-tag ${bill.status.toLowerCase()}`}>
                            {billStatusLabel(bill.status)}
                          </span>
                        </div>
                        <div className="nl-recent-card-body">
                          <div className="nl-recent-card-row">
                            <span className="nl-recent-card-lbl">Quán:</span>
                            <span className="nl-recent-card-val highlight">{bill.store?.name || "NightLife"}</span>
                          </div>
                          <div className="nl-recent-card-row">
                            <span className="nl-recent-card-lbl">Tổng tiền:</span>
                            <span className="nl-recent-card-val gold">{formatMoney(bill.totalVnd)}</span>
                          </div>
                          <div className="nl-recent-card-row">
                            <span className="nl-recent-card-lbl">Ngày sử dụng:</span>
                            <span className="nl-recent-card-val">{formatDateTime(bill.usedAt, activeLanguage)}</span>
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            </aside>
          </div>
        </section>

      <style jsx>{`
        .nl-bill-page {
          width: 100%;
          min-height: 100vh;
          overflow-x: hidden;
          background: var(--vy-bg);
          color: var(--vy-text);
        }

        .nl-bill-shell {
          width: min(100%, 1120px);
          max-width: 100%;
          box-sizing: border-box;
          margin: 0 auto;
          padding: 24px 18px 80px;
        }

        .nl-bill-page *,
        .nl-bill-page *::before,
        .nl-bill-page *::after {
          box-sizing: border-box;
        }

        .nl-back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--vy-muted);
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s ease;
          margin-bottom: 14px;
        }

        .nl-back-link:hover {
          color: var(--vy-gold);
        }

        .nl-bill-head {
          margin-top: 4px;
          margin-bottom: 24px;
        }

        .nl-bill-title-container {
          display: grid;
          gap: 2px;
          width: 100%;
        }

        .nl-bill-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .nl-bill-title {
          margin: 0;
          font-size: 21px;
          font-weight: 600;
          color: var(--vy-text);
        }

        .nl-bill-rule-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid var(--vy-border-gold-22);
          border-radius: 20px;
          background: var(--vy-gold-soft-bg);
          color: var(--vy-gold-pale);
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 700;
        }

        .nl-bill-title-en {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 1.6px;
          color: var(--vy-muted);
          text-transform: uppercase;
          margin-top: -2px;
        }

        .nl-title-divider {
          background: linear-gradient(90deg, rgba(212,178,106,.45), transparent);
          height: 1px;
          margin-top: 5px;
          margin-bottom: 8px;
          width: 100%;
        }

        .nl-bill-desc {
          margin: 4px 0 0;
          color: var(--vy-muted);
          font-size: 13px;
          line-height: 1.5;
        }

        .nl-bill-layout {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 24px;
          align-items: start;
          min-width: 0;
        }

        .nl-bill-form,
        .nl-bill-side {
          min-width: 0;
          border: 1px solid var(--vy-border);
          border-radius: 16px;
          background: var(--vy-surface-1);
          padding: 24px;
          box-shadow: var(--vy-shadow);
        }

        .nl-field {
          display: grid;
          gap: 6px;
          margin-top: 18px;
          min-width: 0;
        }

        .nl-field:first-of-type {
          margin-top: 0;
        }

        .nl-field label {
          color: var(--vy-gold);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nl-label-en {
          color: var(--vy-muted);
          font-size: 8.5px;
          letter-spacing: 1px;
        }

        .nl-field-help {
          color: var(--vy-error);
          font-size: 11px;
          font-weight: 500;
          line-height: 1.45;
        }

        .nl-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          min-width: 0;
          margin-top: 18px;
        }

        .nl-form-grid > * {
          min-width: 0;
          margin-top: 0;
        }

        input {
          width: 100%;
          min-width: 0;
          max-width: 100%;
          min-height: 48px;
          border: 1px solid var(--vy-border);
          border-radius: 11px;
          background: var(--vy-surface-3);
          color: var(--vy-text);
          padding: 0 16px;
          font-size: 14px;
          outline: none;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: all 0.3s ease;
        }

        input:focus {
          border-color: var(--vy-gold);
          box-shadow: 0 0 0 3px rgba(212, 178, 106, 0.15);
        }

        .nl-static-value {
          width: 100%;
          min-height: 48px;
          border: 1px solid var(--vy-border);
          border-radius: 11px;
          background: rgba(255, 255, 255, 0.015);
          color: var(--vy-text-2);
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          user-select: none;
        }

        .nl-amount-input-wrapper {
          position: relative;
          width: 100%;
          min-width: 0;
        }

        .nl-amount-input-wrapper input {
          padding-right: 32px;
          font-weight: 600;
        }

        .nl-amount-suffix {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--vy-gold);
          font-size: 15px;
          font-weight: 600;
          pointer-events: none;
        }

        .nl-confirmed-time {
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 48px;
          border: 1px solid rgba(127, 211, 162, 0.22);
          border-radius: 11px;
          background: linear-gradient(135deg, rgba(127, 211, 162, 0.05), rgba(255, 255, 255, 0.01));
          padding: 10px 16px;
        }

        .nl-confirmed-time.pending {
          border-color: var(--vy-border-gold-22);
          background: linear-gradient(135deg, rgba(212, 178, 106, 0.05), rgba(255, 255, 255, 0.01));
        }

        .nl-confirmed-time-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--vy-success);
          flex-shrink: 0;
        }

        .nl-confirmed-time.pending .nl-confirmed-time-icon {
          color: var(--vy-gold);
        }

        .nl-confirmed-time-content {
          display: grid;
          gap: 2px;
          min-width: 0;
        }

        .nl-confirmed-time-content strong {
          color: var(--vy-text);
          font-size: 13.5px;
          font-weight: 700;
          line-height: 1.2;
          overflow-wrap: anywhere;
        }

        .nl-confirmed-time-content span {
          color: var(--vy-muted);
          font-size: 11px;
          line-height: 1.3;
          overflow-wrap: anywhere;
        }

        .nl-receipt-ticket {
          border: 1px solid var(--vy-border-gold-22);
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(212, 178, 106, 0.06), rgba(255, 255, 255, 0.015));
          padding: 18px;
          margin-top: 16px;
          box-shadow: var(--vy-shadow-card);
        }

        .nl-receipt-header {
          border-bottom: 1px dashed var(--vy-border-gold-22);
          padding-bottom: 12px;
          margin-bottom: 12px;
          display: grid;
          gap: 4px;
        }

        .nl-receipt-title {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 1.5px;
          color: var(--vy-gold);
          text-transform: uppercase;
        }

        .nl-receipt-store {
          font-size: 15px;
          font-weight: 700;
          color: var(--vy-text);
        }

        .nl-receipt-body {
          display: grid;
          gap: 10px;
        }

        .nl-receipt-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
        }

        .nl-receipt-label {
          color: var(--vy-muted);
          font-weight: 500;
          flex-shrink: 0;
        }

        .nl-receipt-line {
          flex-grow: 1;
          border-bottom: 1px dotted var(--vy-border);
          margin: 0 10px;
          opacity: 0.5;
        }

        .nl-receipt-value {
          color: var(--vy-text);
          font-weight: 600;
          flex-shrink: 0;
        }

        .nl-receipt-value.highlight {
          color: var(--vy-gold-pale);
        }

        .nl-receipt-value.discount {
          color: var(--vy-pink);
        }

        .nl-upload-zone-wrapper {
          margin-top: 4px;
          width: 100%;
        }

        .nl-upload-zone {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1px dashed var(--vy-border-gold-32);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.01);
          padding: 24px 16px;
          cursor: pointer;
          text-align: center;
          transition: all 0.3s ease;
          width: 100%;
        }

        .nl-upload-zone:hover {
          border-color: var(--vy-gold);
          background: rgba(212, 178, 106, 0.02);
        }

        .nl-upload-icon {
          color: var(--vy-gold);
          margin-bottom: 8px;
          opacity: 0.8;
        }

        .nl-upload-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--vy-text);
          margin-bottom: 4px;
        }

        .nl-upload-subtitle {
          font-size: 10.5px;
          color: var(--vy-muted);
          margin-bottom: 8px;
        }

        .nl-upload-hint {
          font-size: 11px;
          color: var(--vy-faint);
        }

        .nl-upload-input-hidden {
          display: none;
        }

        .nl-upload-preview-card {
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid var(--vy-border);
          border-radius: 12px;
          background: var(--vy-surface-3);
          padding: 12px;
          width: 100%;
          min-width: 0;
        }

        .nl-preview-thumb-container {
          width: 48px;
          height: 48px;
          border-radius: 6px;
          overflow: hidden;
          flex-shrink: 0;
          border: 1px solid var(--vy-border-gold-12);
        }

        .nl-preview-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .nl-preview-file-icon {
          width: 48px;
          height: 48px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.04);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--vy-muted);
          flex-shrink: 0;
        }

        .nl-preview-info {
          display: grid;
          gap: 2px;
          min-width: 0;
          flex-grow: 1;
        }

        .nl-preview-filename {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--vy-text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .nl-preview-filesize {
          font-size: 11px;
          color: var(--vy-muted);
        }

        .nl-preview-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .nl-ocr-btn-premium {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          border: 1px solid var(--vy-border-gold-32);
          border-radius: 8px;
          background: var(--vy-gold-soft-bg);
          color: var(--vy-gold-pale);
          padding: 6px 10px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nl-ocr-btn-premium:hover:not(:disabled) {
          background: rgba(212, 178, 106, 0.2);
          border-color: var(--vy-gold);
        }

        .nl-ocr-btn-premium:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .nl-delete-file-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          border: 1px solid rgba(232, 139, 153, 0.3);
          border-radius: 8px;
          background: rgba(232, 139, 153, 0.06);
          color: var(--vy-error);
          padding: 6px 10px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nl-delete-file-btn:hover {
          background: rgba(232, 139, 153, 0.15);
          border-color: var(--vy-error);
        }

        .nl-ocr-preview-premium {
          margin-top: 12px;
          border: 1px solid rgba(127, 211, 162, 0.22);
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(127, 211, 162, 0.05), rgba(255, 255, 255, 0.01));
          padding: 14px;
          width: 100%;
          min-width: 0;
        }

        .nl-ocr-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 10px;
        }

        .nl-ocr-sparkle {
          color: var(--vy-gold);
        }

        .nl-ocr-header strong {
          font-size: 12px;
          font-weight: 700;
          color: var(--vy-gold-pale);
        }

        .nl-ocr-results-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          padding: 10px;
          margin-bottom: 8px;
        }

        .nl-ocr-result-item {
          display: grid;
          gap: 2px;
        }

        .nl-ocr-label {
          font-size: 9px;
          font-weight: 600;
          color: var(--vy-muted);
          letter-spacing: 0.5px;
        }

        .nl-ocr-val {
          font-size: 13px;
          color: var(--vy-text);
          font-weight: 700;
        }

        .nl-ocr-notes {
          display: grid;
          gap: 2px;
          font-size: 11px;
          color: var(--vy-faint);
          line-height: 1.4;
        }

        .nl-ocr-warn-text {
          color: var(--vy-warn);
        }

        :global(.nl-bill-ant-select.ant-select) {
          width: 100%;
          min-width: 0;
          max-width: 100%;
        }

        :global(.nl-bill-ant-select.ant-select .ant-select-selector) {
          min-height: 48px;
          border: 1px solid var(--vy-border) !important;
          border-radius: 11px !important;
          background: var(--vy-surface-3) !important;
          color: var(--vy-text) !important;
          padding: 0 16px !important;
          box-shadow: none !important;
        }

        :global(.nl-bill-ant-select.ant-select:hover .ant-select-selector),
        :global(.nl-bill-ant-select.ant-select-focused .ant-select-selector) {
          border-color: var(--vy-gold) !important;
          box-shadow: 0 0 0 3px rgba(212, 178, 106, 0.12) !important;
        }

        :global(.nl-bill-ant-select.ant-select-disabled .ant-select-selector) {
          opacity: 0.55 !important;
        }

        :global(.nl-bill-ant-select .ant-select-selection-item),
        :global(.nl-bill-ant-select .ant-select-selection-placeholder) {
          min-width: 0;
          color: var(--vy-text) !important;
          font-size: 14px;
          font-weight: 600;
          line-height: 46px !important;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        :global(.nl-bill-ant-select .ant-select-selection-placeholder) {
          color: var(--vy-faint) !important;
        }

        :global(.nl-bill-ant-select .ant-select-arrow),
        :global(.nl-bill-ant-select .ant-select-clear) {
          color: var(--vy-gold-pale) !important;
        }

        :global(.nl-bill-select-popup) {
          border: 1px solid var(--vy-border-gold-22) !important;
          border-radius: 11px !important;
          background: var(--vy-surface) !important;
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.42) !important;
          overflow: hidden;
        }

        :global(.nl-bill-select-popup .ant-select-item) {
          color: var(--vy-text-2) !important;
          font-weight: 600;
          min-height: 40px;
          padding: 8px 12px !important;
        }

        :global(.nl-bill-select-popup .ant-select-item-option-active),
        :global(.nl-bill-select-popup .ant-select-item-option-selected) {
          background: var(--vy-gold-soft-bg) !important;
          color: var(--vy-gold-hi) !important;
        }

        .nl-rule,
        .nl-notice {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          border: 1px solid var(--vy-border);
          border-radius: 11px;
          background: var(--vy-surface-3);
          color: var(--vy-muted);
          padding: 12px 14px;
          font-size: 12.5px;
          line-height: 1.5;
          margin-top: 18px;
          width: 100%;
          min-width: 0;
        }

        .nl-rule-icon,
        .nl-notice-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: var(--vy-gold);
          margin-top: 1px;
        }

        .nl-rule.danger,
        .nl-notice.danger {
          color: var(--vy-error);
          border-color: rgba(232, 139, 153, 0.25);
          background: rgba(232, 139, 153, 0.06);
        }

        .nl-rule.danger .nl-rule-icon,
        .nl-notice.danger .nl-notice-icon {
          color: var(--vy-error);
        }

        .nl-notice.success {
          color: var(--vy-success);
          border-color: rgba(127, 211, 162, 0.25);
          background: rgba(127, 211, 162, 0.06);
        }

        .nl-notice.success .nl-notice-icon {
          color: var(--vy-success);
        }

        .nl-notice.warning {
          color: var(--vy-warn);
          border-color: rgba(231, 184, 105, 0.25);
          background: rgba(231, 184, 105, 0.06);
        }

        .nl-notice.warning .nl-notice-icon {
          color: var(--vy-warn);
        }

        .nl-submit-premium {
          width: 100%;
          margin-top: 20px;
          min-height: 50px;
          border: none;
          border-radius: 11px;
          background: var(--vy-gold-grad);
          color: var(--vy-on-gold);
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.5px;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(212, 178, 106, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .nl-submit-premium:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(212, 178, 106, 0.35);
        }

        .nl-submit-premium:active:not(:disabled) {
          transform: translateY(0);
        }

        .nl-submit-premium:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          box-shadow: none;
        }

        .spin-loader {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(36, 26, 10, 0.2);
          border-top: 2px solid var(--vy-on-gold);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .nl-recent-header-container {
          display: grid;
          gap: 2px;
          margin-bottom: 16px;
          width: 100%;
        }

        .nl-recent-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--vy-text);
        }

        .nl-recent-title-en {
          font-size: 8px;
          font-weight: 600;
          letter-spacing: 1.2px;
          color: var(--vy-muted);
          text-transform: uppercase;
        }

        .nl-recent-divider {
          background: linear-gradient(90deg, rgba(212,178,106,.45), transparent);
          height: 1px;
          margin-top: 5px;
          width: 100%;
        }

        .nl-recent-list {
          display: grid;
          gap: 12px;
          width: 100%;
        }

        .nl-recent-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 16px;
          text-align: center;
          color: var(--vy-faint);
          width: 100%;
        }

        .nl-empty-icon {
          margin-bottom: 12px;
          opacity: 0.35;
        }

        .nl-recent-empty p {
          font-size: 13px;
          margin: 0;
        }

        .nl-recent-card {
          border: 1px solid var(--vy-border);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.02);
          padding: 14px;
          display: grid;
          gap: 10px;
          width: 100%;
          min-width: 0;
          transition: all 0.3s ease;
        }

        .nl-recent-card.active {
          border-color: var(--vy-gold);
          background: rgba(212, 178, 106, 0.05);
          box-shadow: 0 0 0 3px rgba(212, 178, 106, 0.08);
        }

        .nl-recent-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }

        .nl-recent-number {
          font-size: 12px;
          font-weight: 700;
          color: var(--vy-text-2);
        }

        .nl-status-tag {
          font-size: 9px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 20px;
          text-transform: uppercase;
          border: 1px solid transparent;
        }

        .nl-status-tag.submitted {
          background: rgba(231, 184, 105, 0.12);
          color: var(--vy-warn);
          border-color: rgba(231, 184, 105, 0.25);
        }

        .nl-status-tag.verified,
        .nl-status-tag.paid {
          background: rgba(127, 211, 162, 0.12);
          color: var(--vy-success);
          border-color: rgba(127, 211, 162, 0.25);
        }

        .nl-status-tag.rejected {
          background: rgba(232, 139, 153, 0.12);
          color: var(--vy-error);
          border-color: rgba(232, 139, 153, 0.25);
        }

        .nl-recent-card-body {
          display: grid;
          gap: 5px;
          width: 100%;
        }

        .nl-recent-card-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11.5px;
          width: 100%;
        }

        .nl-recent-card-lbl {
          color: var(--vy-muted);
        }

        .nl-recent-card-val {
          color: var(--vy-text-2);
          font-weight: 600;
        }

        .nl-recent-card-val.highlight {
          color: var(--vy-text);
        }

        .nl-recent-card-val.gold {
          color: var(--vy-gold);
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 860px) {
          .nl-bill-layout {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }

        @media (max-width: 620px) {
          .nl-bill-shell {
            padding: 16px 14px 80px;
          }

          .nl-bill-form,
          .nl-bill-side {
            padding: 16px;
            border-radius: 12px;
          }

          .nl-form-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }
        }
      `}</style>
      </main>
    </ConfigProvider>
  );
}
