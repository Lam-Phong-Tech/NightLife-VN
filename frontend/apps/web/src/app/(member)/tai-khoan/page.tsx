"use client";

import { clearAuthSession, getAuthUser, type AuthUser } from "@/lib/auth/session";
import {
  CalendarDays,
  ChevronRight,
  Crown,
  FileText,
  Heart,
  Languages,
  LogOut,
  Percent,
  ShieldCheck,
  Star,
  UserRound,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const colors = {
  bg: "#0c0c0f",
  panel: "rgba(255,255,255,.045)",
  panelStrong: "rgba(255,255,255,.07)",
  border: "rgba(212,178,106,.22)",
  borderStrong: "rgba(212,178,106,.34)",
  text: "#f3f0ea",
  muted: "#b6b1a6",
  dim: "#8c8679",
  gold: "#d4b26a",
  goldPale: "#f0dda8",
  onGold: "#241a0a",
  danger: "#ff6b8b",
  goldGrad: "linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)",
};

const stats = [
  { label: "Đặt chỗ", value: "12", icon: CalendarDays },
  { label: "Mã trong ví", value: "5", icon: WalletCards },
  { label: "Hóa đơn", value: "8", icon: FileText },
];

const menuItems = [
  { title: "Lịch sử đặt chỗ", desc: "Theo dõi yêu cầu và trạng thái xác nhận", href: "/lich-su-dat-cho", icon: CalendarDays },
  { title: "Ví ưu đãi", desc: "Coupon đã lưu và mã sắp hết hạn", href: "/vi-uu-dai", icon: Percent },
  { title: "Hóa đơn của tôi", desc: "Gửi hóa đơn để tích điểm thành viên", href: "/gui-hoa-don", icon: FileText },
  { title: "Quán & Cast đã lưu", desc: "Danh sách yêu thích để đặt lại nhanh", href: "/da-luu", icon: Heart },
  { title: "Ngôn ngữ", desc: "Tiếng Việt · 日本語", href: "#", icon: Languages },
  { title: "Bảo mật tài khoản", desc: "Trạng thái đăng nhập và quyền truy cập", href: "#", icon: ShieldCheck },
];

export default function Page() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setAuthUser(getAuthUser());
  }, []);

  const name = authUser?.displayName || authUser?.email?.split("@")[0] || "Demo Member";
  const phone = authUser?.phone || "0912 345 678";
  const tier = authUser?.tier || "VIP";

  const logout = () => {
    clearAuthSession();
  };

  return (
    <main style={{ minHeight: "100vh", background: colors.bg, color: colors.text }}>
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "24px 18px 54px" }}>
        <div className="nl-account-layout">
          <aside style={{ display: "grid", gap: 16 }}>
            <section
              style={{
                border: `1px solid ${colors.borderStrong}`,
                borderRadius: 22,
                padding: 20,
                background:
                  "radial-gradient(circle at 82% 12%,rgba(255,255,255,.22),transparent 24%), linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#9c742c)",
                color: colors.onGold,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    background: "#141417",
                    color: colors.goldPale,
                    border: "2px solid rgba(36,26,10,.18)",
                    flex: "none",
                  }}
                >
                  <UserRound size={28} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h1 style={{ fontSize: 22, fontWeight: 950, lineHeight: 1.05 }}>{name}</h1>
                  <p style={{ marginTop: 5, fontSize: 13, color: "rgba(36,26,10,.75)", fontWeight: 800 }}>
                    {phone}
                  </p>
                </div>
                <span style={{ borderRadius: 999, background: colors.onGold, color: colors.goldPale, padding: "7px 10px", fontSize: 11, fontWeight: 950 }}>
                  {tier}
                </span>
              </div>

              <div style={{ marginTop: 18, borderRadius: 16, background: "rgba(36,26,10,.16)", padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12, fontWeight: 900 }}>
                  <span>Điểm thưởng</span>
                  <span>156 / 250</span>
                </div>
                <div style={{ marginTop: 10, height: 7, borderRadius: 999, background: "rgba(36,26,10,.22)", overflow: "hidden" }}>
                  <div style={{ width: "62%", height: "100%", borderRadius: "inherit", background: "#fff2b6" }} />
                </div>
                <p style={{ marginTop: 8, fontSize: 11.5, color: "rgba(36,26,10,.76)" }}>
                  Cần thêm 94 điểm để lên hạng Premium+
                </p>
              </div>
            </section>

            <section style={{ border: `1px solid ${colors.border}`, borderRadius: 18, background: colors.panel, padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: colors.goldPale, fontWeight: 950 }}>
                <Crown size={18} />
                Quyền lợi thành viên
              </div>
              <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                <Benefit icon={<Star size={15} />} text="Ưu tiên xác nhận bàn VIP" />
                <Benefit icon={<Percent size={15} />} text="Nhận coupon riêng theo hạng" />
                <Benefit icon={<CalendarDays size={15} />} text="Lưu lịch đặt chỗ và đặt lại nhanh" />
              </div>
            </section>
          </aside>

          <div style={{ display: "grid", gap: 16 }}>
            <section className="nl-account-stat-grid">
              {stats.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} style={{ border: `1px solid ${colors.border}`, borderRadius: 18, background: colors.panel, padding: 18 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 13, display: "grid", placeItems: "center", background: "rgba(212,178,106,.11)", color: colors.gold }}>
                      <Icon size={20} />
                    </div>
                    <div style={{ marginTop: 14, fontSize: 28, fontWeight: 950, color: colors.goldPale }}>{item.value}</div>
                    <div style={{ marginTop: 3, color: colors.muted, fontSize: 13 }}>{item.label}</div>
                  </div>
                );
              })}
            </section>

            <section style={{ border: `1px solid ${colors.border}`, borderRadius: 18, background: colors.panel, overflow: "hidden" }}>
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "44px minmax(0,1fr) auto",
                      alignItems: "center",
                      gap: 14,
                      padding: "15px 16px",
                      borderBottom: `1px solid ${colors.border}`,
                      color: colors.text,
                      textDecoration: "none",
                    }}
                  >
                    <span style={accountIconStyle}>
                      <Icon size={19} />
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <strong style={{ display: "block", fontSize: 14.5, fontWeight: 900 }}>{item.title}</strong>
                      <small style={{ display: "block", marginTop: 4, color: colors.muted, fontSize: 12 }}>{item.desc}</small>
                    </span>
                    <ChevronRight size={18} color={colors.dim} />
                  </Link>
                );
              })}
              <Link
                href="/dang-nhap"
                onClick={logout}
                style={{
                  display: "grid",
                  gridTemplateColumns: "44px minmax(0,1fr) auto",
                  alignItems: "center",
                  gap: 14,
                  padding: "15px 16px",
                  color: colors.danger,
                  textDecoration: "none",
                }}
              >
                <span style={{ ...accountIconStyle, color: colors.danger, background: "rgba(255,107,139,.1)", borderColor: "rgba(255,107,139,.24)" }}>
                  <LogOut size={19} />
                </span>
                <strong style={{ fontSize: 14.5, fontWeight: 900 }}>Đăng xuất</strong>
                <ChevronRight size={18} color={colors.danger} />
              </Link>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

function Benefit({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, color: colors.muted, fontSize: 13 }}>
      <span style={{ color: colors.gold }}>{icon}</span>
      {text}
    </div>
  );
}

const accountIconStyle: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 14,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: `1px solid ${colors.border}`,
  background: "rgba(212,178,106,.1)",
  color: colors.gold,
};
