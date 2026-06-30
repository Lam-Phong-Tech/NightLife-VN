"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  Minus,
  Phone,
  Plus,
  ShieldCheck,
  Star,
  UserRound,
} from "lucide-react";
import { getAuthUser, type AuthUser } from "@/lib/auth/session";
import { bookingApi, rememberLastBooking, type CreateBookingPayload } from "@/lib/api/bookings";
import styles from "../booking-flow.module.css";

const bookingTimes = ["20:00", "21:00", "22:00", "23:00"] as const;

type BookingContext = {
  storeSlug?: string;
  storeName: string;
  area?: string;
  castSlug?: string;
  castName?: string;
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

const getTomorrowDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return toDateInputValue(date);
};

const buildScheduledAt = (date: string, time: string) => {
  const [hours = "21", minutes = "00"] = time.split(":");
  const value = new Date(`${date}T${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:00`);
  return value.toISOString();
};

const parseRequestedMode = (value: string | null) => {
  if (value === "guest" || value === "member") return value;
  return null;
};

const parseContext = () => {
  const params = new URLSearchParams(window.location.search);
  const castSlug = params.get("castSlug") || undefined;
  const rawStoreSlug = params.get("storeSlug") || undefined;
  const storeSlug = rawStoreSlug || (castSlug ? undefined : defaultContext.storeSlug);

  return {
    context: {
      storeSlug,
      storeName: params.get("storeName") || defaultContext.storeName,
      area: params.get("area") || defaultContext.area,
      castSlug,
      castName: params.get("castName") || undefined,
      fromHref: castSlug ? `/casts/${castSlug}` : `/stores/${storeSlug ?? defaultContext.storeSlug}`,
    },
    mode: parseRequestedMode(params.get("mode")),
    date: params.get("date") || getTomorrowDate(),
    time: params.get("time") || "21:00",
    guests: Number(params.get("guests") || 4),
  } as const;
};

export default function Page() {
  const router = useRouter();
  const [mode, setMode] = useState<"guest" | "member">("guest");
  const [context, setContext] = useState<BookingContext>(defaultContext);
  const [guestName, setGuestName] = useState("");
  const [phone, setPhone] = useState("");
  const [bookingDate, setBookingDate] = useState(getTomorrowDate);
  const [bookingTime, setBookingTime] = useState<(typeof bookingTimes)[number]>("21:00");
  const [guests, setGuests] = useState(4);
  const [note, setNote] = useState("");
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
      setBookingTime(bookingTimes.includes(parsed.time as (typeof bookingTimes)[number]) ? (parsed.time as (typeof bookingTimes)[number]) : "21:00");
      setGuests(Number.isFinite(parsed.guests) ? Math.max(1, parsed.guests) : 4);

      if (authUser) {
        setGuestName(authUser.displayName ?? authUser.email ?? "");
        setPhone(authUser.phone ?? "");
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

  const memberLoginPath = useMemo(() => {
    const redirectParams = new URLSearchParams({
      mode: "member",
      ...(context.storeSlug ? { storeSlug: context.storeSlug } : {}),
      storeName: context.storeName,
      ...(context.area ? { area: context.area } : {}),
      ...(context.castSlug ? { castSlug: context.castSlug } : {}),
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

  const submit = async () => {
    setErrorMessage("");
    const displayName = guestName.trim();
    const normalizedPhone = phone.trim();

    if (!displayName || !normalizedPhone) {
      setErrorMessage("Vui lòng nhập tên và số điện thoại.");
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
      displayName,
      phone: normalizedPhone,
      scheduledAt: buildScheduledAt(bookingDate, bookingTime),
      partySize: guests,
      ...(note.trim() ? { note: note.trim() } : {}),
    };

    try {
      setIsSubmitting(true);
      const booking = isMemberMode
        ? await bookingApi.createMemberBooking(payload)
        : await bookingApi.createGuestBooking(payload);

      rememberLastBooking(booking, { history: true });
      router.push(`/xac-nhan?bookingId=${booking.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không gửi được yêu cầu đặt chỗ.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.bookingPage}>
      <section className={styles.bookingViewport}>
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
                  {context.castName ? context.storeName : "Lounge cao cấp"} · {context.area ?? "NightLife"}
                </div>
              </div>
              <Link href={context.fromHref} className={styles.changeLink}>
                Đổi
              </Link>
            </section>

            {isMemberMode ? (
              <section className={styles.memberNudge}>
                <span className={styles.nudgeIcon}>
                  <ShieldCheck size={16} />
                </span>
                <div className={styles.nudgeCopy}>
                  <div className={styles.nudgeTitle}>Hội viên NightLife</div>
                  <div className={styles.nudgeText}>Booking được lưu vào lịch sử · ưu đãi 8-10%</div>
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
                onChange={setGuestName}
                placeholder="Nguyễn Minh"
                icon={<UserRound size={16} />}
              />

              <PhoneField value={phone} onChange={setPhone} />

              <div className={styles.twoColumn}>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Số người</span>
                  <div className={styles.stepper}>
                    <button
                      type="button"
                      className={styles.stepButton}
                      onClick={() => setGuests((value) => Math.max(1, value - 1))}
                      aria-label="Giảm số người"
                    >
                      <Minus size={15} />
                    </button>
                    <span className={styles.stepValue}>{guests}</span>
                    <button
                      type="button"
                      className={`${styles.stepButton} ${styles.stepButtonActive}`}
                      onClick={() => setGuests((value) => Math.min(50, value + 1))}
                      aria-label="Tăng số người"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </div>

                <DateField value={bookingDate} onChange={setBookingDate} />
              </div>

              <div className={styles.field}>
                <span className={styles.fieldLabel}>Khung giờ</span>
                <div className={styles.timeChips} role="listbox" aria-label="Chọn khung giờ">
                  {bookingTimes.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setBookingTime(time)}
                      className={`${styles.timeChip} ${bookingTime === time ? styles.selectedChip : ""}`}
                      aria-selected={bookingTime === time}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Ghi chú <span style={{ textTransform: "none", letterSpacing: 0 }}>(tùy chọn)</span></span>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Bàn gần sân khấu, có sinh nhật nhỏ - chuẩn bị giúp nến."
                  className={styles.noteArea}
                />
              </label>

              <div className={styles.infoNote}>
                <ShieldCheck size={15} />
                <span>
                  Không thanh toán online, không thu cọc. Yêu cầu được gửi tới đội điều phối - Admin liên hệ xác nhận chỗ.
                </span>
              </div>

              {errorMessage ? <div className={styles.errorMessage}>{errorMessage}</div> : null}
            </div>
          </div>

          <div className={styles.bookingStickyCta}>
            <button
              type="button"
              onClick={submit}
              disabled={isSubmitting}
              className={styles.primaryCta}
              style={{ opacity: isSubmitting ? 0.72 : 1, cursor: isSubmitting ? "wait" : "pointer" }}
            >
              <strong>{isSubmitting ? "Đang gửi yêu cầu..." : "Gửi yêu cầu đặt bàn"}</strong>
              <small>Miễn phí · phản hồi nhanh qua LINE / điện thoại</small>
            </button>
          </div>
        </div>
      </section>

      {showLoginPrompt ? (
        <div role="dialog" aria-modal="true" aria-labelledby="member-login-title" className={styles.dialogOverlay}>
          <div className={styles.dialogPanel}>
            <h2 id="member-login-title">Yêu cầu đăng nhập</h2>
            <p>Bạn cần đăng nhập tài khoản để lưu booking vào lịch sử Hội viên và nhận ưu đãi cao hơn.</p>
            <div className={styles.dialogActions}>
              <button type="button" className={styles.ghostCta} onClick={() => setShowLoginPrompt(false)}>
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
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={styles.input}
        />
      </span>
    </label>
  );
}

function PhoneField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>Số điện thoại</span>
      <span className={styles.phoneInput}>
        <Phone size={15} />
        <span className={styles.phonePrefix}>+84</span>
        <span className={styles.phoneDivider} />
        <input
          type="tel"
          value={value}
          placeholder="0901 234 567"
          onChange={(event) => onChange(event.target.value)}
          className={styles.input}
        />
      </span>
    </label>
  );
}

function DateField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>Ngày</span>
      <span className={styles.dateInput}>
        <CalendarDays size={15} />
        <input type="date" value={value} onChange={(event) => onChange(event.target.value)} />
      </span>
    </label>
  );
}
