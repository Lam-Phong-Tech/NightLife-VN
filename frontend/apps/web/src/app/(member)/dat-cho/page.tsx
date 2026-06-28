"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, Clock, Minus, Plus, Sparkles } from "lucide-react";
import { getAuthUser, type AuthUser } from "@/lib/auth/session";
import { bookingApi, rememberLastBooking, type CreateBookingPayload } from "@/lib/api/bookings";

const colors = {
  bg: "#0c0c0f",
  panel: "rgba(255,255,255,.045)",
  panelStrong: "rgba(255,255,255,.07)",
  border: "rgba(212,178,106,.22)",
  borderStrong: "rgba(212,178,106,.34)",
  text: "#f3f0ea",
  muted: "#b6b1a6",
  gold: "#d4b26a",
  goldPale: "#f0dda8",
  onGold: "#241a0a",
  danger: "#ff8aa0",
  goldGrad: "linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)",
};

const couponItems = ["Happy Hour -30%", "Combo VIP 2+1", "Welcome -8%", "Không dùng mã"] as const;

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

const getTomorrowDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
};

const buildScheduledAt = (date: string, time: string) => {
  const [hours = "21", minutes = "00"] = time.split(":");
  const value = new Date(`${date}T${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:00`);
  return value.toISOString();
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
    mode: params.get("mode") === "member" ? "member" : "guest",
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
  const [bookingTime, setBookingTime] = useState("21:00");
  const [guests, setGuests] = useState(4);
  const [coupon, setCoupon] = useState<(typeof couponItems)[number]>(couponItems[0]);
  const [note, setNote] = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const parsed = parseContext();
    const authUser = getAuthUser();

    queueMicrotask(() => {
      setContext(parsed.context);
      setBookingDate(parsed.date);
      setBookingTime(parsed.time);
      setGuests(Number.isFinite(parsed.guests) ? Math.max(1, parsed.guests) : 4);

      if (authUser) {
        setGuestName(authUser.displayName ?? authUser.email ?? "");
        setPhone(authUser.phone ?? "");
      }

      if (parsed.mode === "member") {
        if (isMemberUser(authUser)) {
          setMode("member");
        } else {
          setShowLoginPrompt(true);
        }
      }
    });
  }, []);

  const memberLoginPath = useMemo(
    () =>
      `/dang-nhap?redirect=${encodeURIComponent(
        `/dat-cho?${new URLSearchParams({
          mode: "member",
          ...(context.storeSlug ? { storeSlug: context.storeSlug } : {}),
          storeName: context.storeName,
          ...(context.area ? { area: context.area } : {}),
          ...(context.castSlug ? { castSlug: context.castSlug } : {}),
          ...(context.castName ? { castName: context.castName } : {}),
          date: bookingDate,
          time: bookingTime,
          guests: String(guests),
        }).toString()}`,
      )}`,
    [bookingDate, bookingTime, context, guests],
  );

  const targetLabel = context.castName
    ? `${context.castName} @ ${context.storeName}`
    : context.storeName;
  const contextSubtitle = context.castName ? "Đặt theo cast" : "Đặt bàn";

  const selectMode = (nextMode: "guest" | "member") => {
    if (nextMode === "member" && !isMemberUser(getAuthUser())) {
      setShowLoginPrompt(true);
      return;
    }

    setMode(nextMode);
    const authUser = getAuthUser();
    if (nextMode === "member" && authUser) {
      setGuestName((value) => value || authUser.displayName || authUser.email || "");
      setPhone((value) => value || authUser.phone || "");
    }
  };

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

    if (mode === "member" && !isMemberUser(getAuthUser())) {
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
      const booking =
        mode === "member"
          ? await bookingApi.createMemberBooking(payload)
          : await bookingApi.createGuestBooking(payload);

      rememberLastBooking(booking, { guestHistory: mode === "guest" });
      router.push(`/xac-nhan?bookingId=${booking.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không gửi được yêu cầu đặt chỗ.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: colors.bg, color: colors.text }}>
      <section style={{ maxWidth: "1120px", margin: "0 auto", padding: "24px 18px 54px" }}>
        <Link href={context.fromHref} style={{ display: "inline-flex", alignItems: "center", gap: 8, color: colors.muted, fontSize: 13, fontWeight: 800 }}>
          <ChevronLeft size={17} />
          {targetLabel}
        </Link>

        <div className="nl-booking-layout" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", gap: 22, marginTop: 18 }}>
          <div style={{ border: `1px solid ${colors.border}`, background: colors.panel, borderRadius: 18, overflow: "hidden" }}>
            <div
              style={{
                minHeight: 178,
                padding: 24,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                background:
                  "linear-gradient(180deg,rgba(12,12,15,.12),rgba(12,12,15,.9)),url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1200&q=80') center/cover",
              }}
            >
              <span style={{ color: colors.goldPale, fontSize: 12, fontWeight: 900, letterSpacing: ".16em" }}>YÊU CẦU ĐẶT CHỖ</span>
              <h1 style={{ marginTop: 8, fontSize: "clamp(26px,4vw,36px)", lineHeight: 1.08, fontWeight: 950 }}>{contextSubtitle} tại {targetLabel}</h1>
              <p style={{ marginTop: 10, color: colors.muted, maxWidth: 620, fontSize: 14, lineHeight: 1.6 }}>
                Gửi yêu cầu cho admin xác nhận với quán. Không thu cọc, không thanh toán online.
              </p>
            </div>

            <div style={{ padding: 22, display: "grid", gap: 18 }}>
              <div style={{ display: "flex", gap: 8, background: colors.panelStrong, border: `1px solid ${colors.border}`, borderRadius: 14, padding: 5, maxWidth: 420 }}>
                {[
                  ["guest", "Đặt nhanh"],
                  ["member", "Hội viên"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => selectMode(value as "guest" | "member")}
                    style={{
                      flex: 1,
                      border: 0,
                      borderRadius: 10,
                      padding: "11px 14px",
                      background: mode === value ? colors.goldGrad : "transparent",
                      color: mode === value ? colors.onGold : colors.muted,
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div style={{ color: colors.goldPale, background: "rgba(212,178,106,.09)", border: `1px solid ${colors.border}`, borderRadius: 12, padding: "11px 13px", fontSize: 13 }}>
                {mode === "guest"
                  ? "Guest: gửi yêu cầu nhanh, admin xác nhận qua điện thoại."
                  : "Hội viên: booking được lưu vào lịch sử tài khoản."}
              </div>

              <div className="nl-booking-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Họ tên" placeholder="Nguyễn Văn A" value={guestName} onChange={setGuestName} />
                <Field label="Số điện thoại" placeholder="0912 345 678" value={phone} onChange={setPhone} />
                <Field label="Ngày" type="date" value={bookingDate} onChange={setBookingDate} icon={<CalendarDays size={16} />} />
                <Field label="Giờ" type="time" value={bookingTime} onChange={setBookingTime} icon={<Clock size={16} />} />
              </div>

              <div className="nl-booking-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
                <div>
                  <Label>Số khách</Label>
                  <div style={{ marginTop: 7, height: 48, border: `1px solid ${colors.border}`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", background: colors.panelStrong }}>
                    <button type="button" onClick={() => setGuests((value) => Math.max(1, value - 1))} style={stepButtonStyle}><Minus size={15} /></button>
                    <span style={{ fontWeight: 900 }}>{guests} người</span>
                    <button type="button" onClick={() => setGuests((value) => Math.min(50, value + 1))} style={{ ...stepButtonStyle, background: colors.gold, color: colors.onGold }}><Plus size={15} /></button>
                  </div>
                </div>
              </div>

              <div>
                <Label>Mã ưu đãi</Label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                  {couponItems.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCoupon(item)}
                      style={{
                        border: `1px solid ${coupon === item ? colors.gold : colors.border}`,
                        background: coupon === item ? colors.goldGrad : colors.panelStrong,
                        color: coupon === item ? colors.onGold : colors.muted,
                        borderRadius: 999,
                        padding: "8px 12px",
                        fontSize: 12,
                        fontWeight: 900,
                        cursor: "pointer",
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Ghi chú</Label>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Yêu cầu phòng VIP, nhân viên nói tiếng Nhật..."
                  style={{ marginTop: 7, width: "100%", minHeight: 86, resize: "vertical", border: `1px solid ${colors.border}`, borderRadius: 12, background: colors.panelStrong, color: colors.text, padding: "13px 14px", fontSize: 14, outline: "none" }}
                />
              </div>

              {errorMessage ? <div style={{ color: colors.danger, fontSize: 13, fontWeight: 800 }}>{errorMessage}</div> : null}

              <button type="button" onClick={submit} disabled={isSubmitting} style={{ border: 0, borderRadius: 14, background: colors.goldGrad, color: colors.onGold, padding: "15px 18px", fontWeight: 950, fontSize: 15, cursor: isSubmitting ? "wait" : "pointer", opacity: isSubmitting ? 0.72 : 1 }}>
                {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu đặt chỗ"}
              </button>
            </div>
          </div>

          <aside style={{ border: `1px solid ${colors.border}`, background: colors.panel, borderRadius: 18, padding: 20, height: "fit-content", position: "sticky", top: 104 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: colors.goldPale, fontWeight: 950 }}>
              <Sparkles size={18} />
              Tóm tắt
            </div>
            <Summary label="Quán" value={context.storeName} />
            {context.castName ? <Summary label="Cast" value={context.castName} /> : null}
            <Summary label="Khu vực" value={context.area ?? "Chưa chọn"} />
            <Summary label="Thời gian" value={`${bookingDate} · ${bookingTime}`} />
            <Summary label="Số khách" value={`${guests} người`} />
            <Summary label="Ưu đãi" value={coupon} />
            <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${colors.border}`, color: colors.muted, fontSize: 12.5, lineHeight: 1.6 }}>
              Admin sẽ liên hệ xác nhận sau khi bạn gửi yêu cầu.
            </div>
          </aside>
        </div>
      </section>
      {showLoginPrompt ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="member-login-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            display: "grid",
            placeItems: "center",
            padding: 18,
            background: "rgba(0,0,0,.66)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              width: "min(100%, 360px)",
              border: `1px solid ${colors.borderStrong}`,
              borderRadius: 18,
              background: "linear-gradient(180deg,#18181c,#111114)",
              color: colors.text,
              boxShadow: "0 24px 70px rgba(0,0,0,.48)",
              padding: 20,
              textAlign: "center",
            }}
          >
            <div id="member-login-title" style={{ fontSize: 18, fontWeight: 950, color: colors.goldPale }}>
              Yêu cầu đăng nhập
            </div>
            <p style={{ marginTop: 10, color: colors.muted, fontSize: 13.5, lineHeight: 1.6 }}>
              Bạn cần đăng nhập tài khoản để lưu booking vào lịch sử Hội viên.
            </p>
            <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowLoginPrompt(false)}
                style={{
                  border: `1px solid ${colors.border}`,
                  borderRadius: 12,
                  background: colors.panelStrong,
                  color: colors.muted,
                  padding: "12px 14px",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
              <Link
                href={memberLoginPath}
                style={{
                  borderRadius: 12,
                  background: colors.goldGrad,
                  color: colors.onGold,
                  padding: "12px 14px",
                  fontWeight: 950,
                  textDecoration: "none",
                }}
              >
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label style={{ color: colors.muted, fontSize: 12.5, fontWeight: 900 }}>{children}</label>;
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  icon,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div style={{ marginTop: 7, position: "relative" }}>
        {icon ? <span style={{ position: "absolute", left: 12, top: 15, color: colors.gold }}>{icon}</span> : null}
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          style={{
            width: "100%",
            height: 48,
            border: `1px solid ${colors.border}`,
            borderRadius: 12,
            background: colors.panelStrong,
            color: colors.text,
            padding: icon ? "0 14px 0 38px" : "0 14px",
            fontSize: 14,
            outline: "none",
          }}
        />
      </div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginTop: 15, color: colors.text, fontSize: 13 }}>
      <span style={{ color: colors.muted }}>{label}</span>
      <span style={{ fontWeight: 900, textAlign: "right" }}>{value}</span>
    </div>
  );
}

const stepButtonStyle: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: 9,
  border: 0,
  background: "rgba(255,255,255,.08)",
  color: colors.text,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};
