"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
import { ArrowLeft, Eye, EyeOff, LockKeyhole, LogIn, Mail, ShieldCheck, Sparkles, Ticket } from "lucide-react";
import { loginMember, registerMember } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { setAuthSession } from "@/lib/auth/session";

const colors = {
  bg: "#0c0c0f",
  panel: "rgba(255,255,255,.045)",
  panelStrong: "rgba(255,255,255,.075)",
  border: "rgba(212,178,106,.22)",
  borderStrong: "rgba(212,178,106,.34)",
  text: "#f3f0ea",
  muted: "#b6b1a6",
  dim: "#8c8679",
  gold: "#d4b26a",
  goldPale: "#f0dda8",
  onGold: "#241a0a",
  danger: "#fca5a5",
  success: "#86efac",
  goldGrad: "linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)",
};

export default function Page() {
  const [isReg, setIsReg] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"error" | "success">("error");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectTo = useMemo(() => {
    if (typeof window === "undefined") return "/tai-khoan";

    const redirect = new URLSearchParams(window.location.search).get("redirect");

    if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) {
      return "/tai-khoan";
    }

    return redirect;
  }, []);

  const title = isReg ? "Tạo tài khoản hội viên" : "Đăng nhập hội viên";
  const subtitle = isReg ? "Tạo tài khoản để lưu ưu đãi, lịch đặt chỗ và điểm tích luỹ." : "Tiếp tục đặt chỗ, lưu quán yêu thích và quản lý mã ưu đãi.";

  const switchMode = (nextIsReg: boolean) => {
    setIsReg(nextIsReg);
    setMessage("");
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedDisplayName = displayName.trim();

    if (!normalizedEmail || !password) {
      setMessageTone("error");
      setMessage("Vui lòng nhập email và mật khẩu.");
      return;
    }

    if (!normalizedEmail.includes("@")) {
      setMessageTone("error");
      setMessage("Vui lòng nhập email hợp lệ để tiếp tục.");
      return;
    }

    if (isReg && password.length < 8) {
      setMessageTone("error");
      setMessage("Mật khẩu đăng ký cần tối thiểu 8 ký tự.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      if (isReg) {
        await registerMember({
          email: normalizedEmail,
          password,
          displayName: trimmedDisplayName || undefined,
        });
        setIsReg(false);
        setPassword("");
        setShowPassword(false);
        setMessageTone("success");
        setMessage("Đăng ký thành công. Vui lòng đăng nhập để vào hệ thống.");
        return;
      }

      const session = await loginMember({ email: normalizedEmail, password });
      setAuthSession(session);
      window.location.href = redirectTo;
    } catch (error) {
      const detail =
        error instanceof ApiError
          ? error.message
          : isReg
            ? "Không kết nối được API đăng ký."
            : "Không kết nối được API đăng nhập.";
      setMessageTone("error");
      setMessage(detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="nl-login-page" style={{ minHeight: "100vh", background: colors.bg, color: colors.text }}>
      <div className="nl-login-shell" style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "minmax(0,1.05fr) minmax(0,.95fr)" }}>
        <section
          className="nl-login-visual"
          style={{
            position: "relative",
            minHeight: "100vh",
            padding: "34px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background:
              "linear-gradient(180deg,rgba(12,12,15,.2),rgba(12,12,15,.88)),url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1400&q=80') center/cover",
          }}
        >
          <Link href="/" style={{ display: "inline-flex", flexDirection: "column", textDecoration: "none", width: "fit-content" }}>
            <span style={{ fontSize: 28, fontWeight: 900, lineHeight: 1, background: colors.goldGrad, WebkitBackgroundClip: "text", color: "transparent" }}>Vietyoru</span>
            <span style={{ marginTop: 5, color: colors.goldPale, fontSize: 9, letterSpacing: ".38em" }}>VIETNAM NIGHTLIFE GUIDE</span>
          </Link>

          <div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: colors.goldPale, border: `1px solid ${colors.borderStrong}`, borderRadius: 999, padding: "7px 12px", fontSize: 12, fontWeight: 800, background: "rgba(12,12,15,.42)" }}>
              <Sparkles size={15} />
              MEMBER ACCESS
            </span>
            <h1 style={{ marginTop: 18, maxWidth: 560, fontSize: 46, lineHeight: 1.05, fontWeight: 900 }}>Giữ mọi cuộc hẹn nightlife trong một tài khoản.</h1>
            <p style={{ marginTop: 16, maxWidth: 500, color: colors.muted, fontSize: 15, lineHeight: 1.7 }}>
              Lưu quán, nhận mã ưu đãi, theo dõi trạng thái đặt chỗ và sử dụng ví coupon khi đến quán.
            </p>
          </div>

          <div style={{ color: colors.muted, fontSize: 12 }}>© 2026 Vietyoru</div>
        </section>

        <section className="nl-login-form-section" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "34px" }}>
          <div style={{ width: "100%", maxWidth: 430 }}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: colors.muted, fontSize: 13, fontWeight: 800, marginBottom: 24 }}>
              <ArrowLeft size={17} />
              Quay về trang chủ
            </Link>

            <div className="nl-login-card" style={{ border: `1px solid ${colors.border}`, background: colors.panel, borderRadius: 18, padding: 22, boxShadow: "0 22px 60px rgba(0,0,0,.32)" }}>
              <div style={{ display: "flex", background: colors.panelStrong, border: `1px solid ${colors.border}`, borderRadius: 14, padding: 5 }}>
                <Tab active={!isReg} label="Đăng nhập" onClick={() => switchMode(false)} />
                <Tab active={isReg} label="Đăng ký" onClick={() => switchMode(true)} />
              </div>

              <h2 style={{ marginTop: 24, fontSize: 26, lineHeight: 1.12, fontWeight: 900 }}>{title}</h2>
              <p style={{ marginTop: 8, color: colors.muted, fontSize: 13.5, lineHeight: 1.6 }}>{subtitle}</p>

              <form onSubmit={submit} style={{ marginTop: 24, display: "grid", gap: 14 }}>
                {isReg ? (
                  <Field
                    label="Họ tên"
                    value={displayName}
                    onChange={setDisplayName}
                    placeholder="Nguyễn Văn A"
                    autoComplete="name"
                    name="name"
                  />
                ) : null}
                <Field
                  icon={<Mail size={16} />}
                  label="Email"
                  value={email}
                  onChange={setEmail}
                  placeholder="member@nightlife.vn"
                  autoComplete="email"
                  inputMode="email"
                  name="email"
                />
                <Field
                  icon={<LockKeyhole size={16} />}
                  label="Mật khẩu"
                  value={password}
                  onChange={setPassword}
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isReg ? "new-password" : "current-password"}
                  name="password"
                  action={
                    <button
                      type="button"
                      aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      onClick={() => setShowPassword((current) => !current)}
                      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, border: 0, borderRadius: 8, background: "transparent", color: colors.gold, cursor: "pointer" }}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  }
                />

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, color: colors.muted, fontSize: 13 }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input type="checkbox" defaultChecked style={{ accentColor: colors.gold }} />
                    Ghi nhớ
                  </label>
                  <Link href="#" style={{ color: colors.gold, fontWeight: 800 }}>Quên mật khẩu?</Link>
                </div>

                {message ? (
                  <div
                    style={{
                      color: messageTone === "success" ? colors.success : colors.danger,
                      background: messageTone === "success" ? "rgba(134,239,172,.10)" : "rgba(252,165,165,.08)",
                      border: messageTone === "success" ? "1px solid rgba(134,239,172,.28)" : "1px solid rgba(252,165,165,.24)",
                      borderRadius: 12,
                      padding: "10px 12px",
                      fontSize: 12.5,
                      lineHeight: 1.5,
                    }}
                  >
                    {message}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ border: 0, borderRadius: 14, background: colors.goldGrad, color: colors.onGold, padding: "15px 18px", fontWeight: 900, fontSize: 15, cursor: isSubmitting ? "default" : "pointer", opacity: isSubmitting ? .72 : 1 }}
                >
                  {isSubmitting ? "Đang xác thực..." : isReg ? "Tạo tài khoản" : "Đăng nhập"}
                </button>
              </form>
            </div>
            <div className="nl-login-metrics" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12, marginTop: 16 }}>
              <Metric icon={<Ticket size={18} />} value="30%" label="ưu đãi hot" />
              <Metric icon={<ShieldCheck size={18} />} value="24h" label="giữ mã guest" />
              <Metric icon={<LogIn size={18} />} value="1 chạm" label="đặt lại lịch" />
            </div>
          </div>
        </section>
      </div>
      <style jsx global>{`
        @media (max-width: 767px) {
          .nl-login-page {
            overflow-x: hidden;
          }

          .nl-login-page .nl-login-shell {
            display: block !important;
            min-height: 100vh !important;
          }

          .nl-login-page .nl-login-visual {
            min-height: 300px !important;
            padding: 22px 20px !important;
            justify-content: space-between !important;
          }

          .nl-login-page .nl-login-visual h1 {
            max-width: 330px !important;
            font-size: 34px !important;
            line-height: 1.08 !important;
            margin-top: 18px !important;
          }

          .nl-login-page .nl-login-visual p {
            max-width: 320px !important;
            font-size: 13.5px !important;
            line-height: 1.55 !important;
          }

          .nl-login-page .nl-login-metrics {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 8px !important;
            margin-top: 18px !important;
          }

          .nl-login-page .nl-login-metrics > div {
            min-width: 0 !important;
            padding: 10px !important;
            border-radius: 12px !important;
          }

          .nl-login-page .nl-login-metrics > div > div:nth-child(2) {
            font-size: 18px !important;
          }

          .nl-login-page .nl-login-form-section {
            min-height: auto !important;
            padding: 20px !important;
            align-items: flex-start !important;
          }

          .nl-login-page .nl-login-card {
            width: 100% !important;
            padding: 18px !important;
            border-radius: 16px !important;
            background: rgba(255, 255, 255, 0.055) !important;
          }
        }
      `}</style>
    </main>
  );
}

function Tab({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ flex: 1, border: 0, borderRadius: 10, padding: "11px 12px", background: active ? colors.goldGrad : "transparent", color: active ? colors.onGold : colors.muted, fontWeight: 900, cursor: "pointer" }}
    >
      {label}
    </button>
  );
}

function Field({
  icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  inputMode,
  name,
  action,
}: {
  icon?: React.ReactNode;
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder: string;
  type?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  name?: string;
  action?: React.ReactNode;
}) {
  return (
    <label style={{ display: "grid", gap: 7 }}>
      <span style={{ color: colors.muted, fontSize: 12.5, fontWeight: 800 }}>{label}</span>
      <span style={{ height: 48, display: "flex", alignItems: "center", gap: 9, border: `1px solid ${colors.border}`, borderRadius: 12, background: colors.panelStrong, padding: "0 13px", color: colors.text }}>
        {icon ? <span style={{ color: colors.gold, display: "inline-flex" }}>{icon}</span> : null}
        <input
          name={name}
          type={type}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          style={{ flex: 1, minWidth: 0, border: 0, outline: "none", background: "transparent", color: colors.text, fontSize: 14 }}
        />
        {action ? <span style={{ color: colors.gold, display: "inline-flex" }}>{action}</span> : null}
      </span>
    </label>
  );
}

function Metric({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div style={{ border: `1px solid ${colors.border}`, background: "rgba(12,12,15,.5)", borderRadius: 14, padding: 13 }}>
      <div style={{ color: colors.gold, display: "inline-flex" }}>{icon}</div>
      <div style={{ marginTop: 8, color: colors.goldPale, fontSize: 22, fontWeight: 900 }}>{value}</div>
      <div style={{ marginTop: 3, color: colors.muted, fontSize: 12 }}>{label}</div>
    </div>
  );
}
