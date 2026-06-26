"use client";

import Link from "next/link";
import React, { useState } from "react";
import { ArrowLeft, Eye, LockKeyhole, LogIn, Mail, ShieldCheck, Sparkles, Ticket } from "lucide-react";
import { loginMember } from "@/lib/api/auth";
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
  goldGrad: "linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)",
};

export default function Page() {
  const [isReg, setIsReg] = useState(false);
  const [email, setEmail] = useState("member@nightlife.vn");
  const [password, setPassword] = useState("Str0ngPass!");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const title = isReg ? "Tạo tài khoản hội viên" : "Đăng nhập hội viên";
  const subtitle = isReg ? "Tạo tài khoản để lưu ưu đãi, lịch đặt chỗ và điểm tích luỹ." : "Tiếp tục đặt chỗ, lưu quán yêu thích và quản lý mã ưu đãi.";

  const submit = async () => {
    if (isReg) {
      setMessage("Đăng ký member sẽ nối API riêng sau. Tài khoản test: member@nightlife.vn / Str0ngPass!");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const session = await loginMember({ email: email.trim(), password });
      setAuthSession(session);
      window.location.href = "/tai-khoan";
    } catch (error) {
      const detail = error instanceof ApiError ? error.message : "Không kết nối được API đăng nhập.";
      setMessage(`${detail} Tài khoản seed: member@nightlife.vn / Str0ngPass!`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: colors.bg, color: colors.text }}>
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
            <div className="nl-login-metrics" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12, maxWidth: 540, marginTop: 28 }}>
              <Metric icon={<Ticket size={18} />} value="30%" label="ưu đãi hot" />
              <Metric icon={<ShieldCheck size={18} />} value="24h" label="giữ mã guest" />
              <Metric icon={<LogIn size={18} />} value="1 chạm" label="đặt lại lịch" />
            </div>
          </div>

          <div style={{ color: colors.muted, fontSize: 12 }}>© 2026 Vietyoru</div>
        </section>

        <section className="nl-login-form-section" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "34px" }}>
          <div style={{ width: "100%", maxWidth: 430 }}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: colors.muted, fontSize: 13, fontWeight: 800, marginBottom: 24 }}>
              <ArrowLeft size={17} />
              Quay về trang chủ
            </Link>

            <div style={{ border: `1px solid ${colors.border}`, background: colors.panel, borderRadius: 18, padding: 22, boxShadow: "0 22px 60px rgba(0,0,0,.32)" }}>
              <div style={{ display: "flex", background: colors.panelStrong, border: `1px solid ${colors.border}`, borderRadius: 14, padding: 5 }}>
                <Tab active={!isReg} label="Đăng nhập" onClick={() => setIsReg(false)} />
                <Tab active={isReg} label="Đăng ký" onClick={() => setIsReg(true)} />
              </div>

              <h2 style={{ marginTop: 24, fontSize: 26, lineHeight: 1.12, fontWeight: 900 }}>{title}</h2>
              <p style={{ marginTop: 8, color: colors.muted, fontSize: 13.5, lineHeight: 1.6 }}>{subtitle}</p>

              <div style={{ marginTop: 24, display: "grid", gap: 14 }}>
                {isReg ? <Field label="Họ tên" placeholder="Nguyễn Văn A" /> : null}
                <Field icon={<Mail size={16} />} label="Email / số điện thoại" value={email} onChange={setEmail} placeholder="member@nightlife.vn" />
                <Field icon={<LockKeyhole size={16} />} label="Mật khẩu" value={password} onChange={setPassword} placeholder="••••••••" type="password" action={<Eye size={17} />} />

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, color: colors.muted, fontSize: 13 }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input type="checkbox" defaultChecked style={{ accentColor: colors.gold }} />
                    Ghi nhớ
                  </label>
                  <Link href="#" style={{ color: colors.gold, fontWeight: 800 }}>Quên mật khẩu?</Link>
                </div>

                {message ? <div style={{ color: colors.danger, background: "rgba(252,165,165,.08)", border: "1px solid rgba(252,165,165,.24)", borderRadius: 12, padding: "10px 12px", fontSize: 12.5, lineHeight: 1.5 }}>{message}</div> : null}

                <button
                  type="button"
                  onClick={isSubmitting ? undefined : submit}
                  style={{ border: 0, borderRadius: 14, background: colors.goldGrad, color: colors.onGold, padding: "15px 18px", fontWeight: 900, fontSize: 15, cursor: isSubmitting ? "default" : "pointer", opacity: isSubmitting ? .72 : 1 }}
                >
                  {isSubmitting ? "Đang xác thực..." : isReg ? "Tạo tài khoản" : "Đăng nhập"}
                </button>
              </div>

              <div style={{ marginTop: 22, borderTop: `1px solid ${colors.border}`, paddingTop: 18, color: colors.muted, fontSize: 13, lineHeight: 1.6 }}>
                Bạn là chủ quán? <Link href="/dang-ky-doi-tac" style={{ color: colors.gold, fontWeight: 900 }}>Đăng ký đối tác</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
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
  action,
}: {
  icon?: React.ReactNode;
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder: string;
  type?: string;
  action?: React.ReactNode;
}) {
  return (
    <label style={{ display: "grid", gap: 7 }}>
      <span style={{ color: colors.muted, fontSize: 12.5, fontWeight: 800 }}>{label}</span>
      <span style={{ height: 48, display: "flex", alignItems: "center", gap: 9, border: `1px solid ${colors.border}`, borderRadius: 12, background: colors.panelStrong, padding: "0 13px", color: colors.text }}>
        {icon ? <span style={{ color: colors.gold, display: "inline-flex" }}>{icon}</span> : null}
        <input
          type={type}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
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
