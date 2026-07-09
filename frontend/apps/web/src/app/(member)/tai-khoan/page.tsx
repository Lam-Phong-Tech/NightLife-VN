"use client";

import {
  authSessionChangeEvent,
  clearAuthSession,
  getAuthSessionExpiresAt,
  getAuthUser,
  type AuthUser,
} from "@/lib/auth/session";
import { logoutCurrentUser } from "@/lib/api/auth";
import { memberApi, type MemberPointSummary } from "@/lib/api/member";
import {
  CalendarDays,
  ChevronRight,
  Crown,
  FileText,
  Heart,
  LogOut,
  Percent,
  ShieldCheck,
  Star,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

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
  goldGrad: "var(--vy-gold-grad)",
};

const defaultPointTarget = 250;
const defaultNextTierName = "Premium+";
const pointFormatter = new Intl.NumberFormat("vi-VN");

const menuItems = [
  { title: "Lịch sử đặt chỗ", desc: "Theo dõi yêu cầu và trạng thái xác nhận", href: "/lich-su-dat-cho", icon: CalendarDays },
  { title: "Hóa đơn của tôi", desc: "Gửi hóa đơn để tích điểm thành viên", href: "/gui-hoa-don", icon: FileText },
  { title: "Quán & Cast đã lưu", desc: "Danh sách yêu thích để đặt lại nhanh", href: "/da-luu", icon: Heart },
  { title: "Bảo mật tài khoản", desc: "Thông tin cá nhân và quyền truy cập", href: "/bao-mat-tai-khoan", icon: ShieldCheck },
];

export default function Page() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authStatus, setAuthStatus] = useState<"checking" | "ready" | "redirecting">("checking");
  const [pointSummary, setPointSummary] = useState<MemberPointSummary | null>(null);
  const [pointSummaryStatus, setPointSummaryStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let redirected = false;
    let expiryTimer: number | undefined;

    const redirectToLogin = () => {
      if (redirected) return;
      redirected = true;
      setAuthStatus("redirecting");
      window.location.replace("/dang-nhap?redirect=/tai-khoan");
    };

    const scheduleExpiryCheck = () => {
      if (expiryTimer) {
        window.clearTimeout(expiryTimer);
        expiryTimer = undefined;
      }

      const expiresAt = getAuthSessionExpiresAt();
      if (!expiresAt) return;

      const delay = Math.max(0, Math.min(expiresAt - Date.now() + 250, 2_147_483_647));
      expiryTimer = window.setTimeout(verifyAuthUser, delay);
    };

    const verifyAuthUser = () => {
      const currentUser = getAuthUser();

      if (!currentUser || currentUser.role !== "USER") {
        if (currentUser) {
          clearAuthSession();
        }
        redirectToLogin();
        return;
      }

      setAuthUser(currentUser);
      setAuthStatus("ready");
      scheduleExpiryCheck();
    };

    const timer = window.setTimeout(verifyAuthUser, 0);
    window.addEventListener("focus", verifyAuthUser);
    window.addEventListener(authSessionChangeEvent, verifyAuthUser);

    return () => {
      window.clearTimeout(timer);
      if (expiryTimer) {
        window.clearTimeout(expiryTimer);
      }
      window.removeEventListener("focus", verifyAuthUser);
      window.removeEventListener(authSessionChangeEvent, verifyAuthUser);
    };
  }, []);

  const name = authUser?.displayName || authUser?.email?.split("@")[0] || "";
  const accountEmail = authUser?.email || "";
  const tier = authUser?.tier || "FREE";
  const canLoadPoints = authUser?.role === "USER";
  const rewardPoints = Math.max(0, pointSummary?.availablePoints ?? 0);
  const rewardTarget = Math.max(pointSummary?.nextTierThreshold ?? defaultPointTarget, 1);
  const rewardProgress = Math.min(100, Math.max(0, pointSummary?.progressPercent ?? Math.round((rewardPoints / rewardTarget) * 100)));
  const nextTierName = pointSummary?.nextTierName ?? defaultNextTierName;
  const pointsToNextTier = Math.max(0, pointSummary?.pointsToNextTier ?? rewardTarget - rewardPoints);
  const isLoadingPoints = Boolean(canLoadPoints && pointSummaryStatus === "loading");
  const pointSummaryError = Boolean(canLoadPoints && pointSummaryStatus === "error");

  useEffect(() => {
    let ignoreResult = false;

    if (!canLoadPoints) {
      return undefined;
    }

    memberApi
      .getPointSummary()
      .then((summary) => {
        if (!ignoreResult) {
          setPointSummary(summary);
          setPointSummaryStatus("ready");
        }
      })
      .catch(() => {
        if (!ignoreResult) {
          setPointSummaryStatus("error");
        }
      });

    return () => {
      ignoreResult = true;
    };
  }, [canLoadPoints]);

  const logout = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    try {
      await logoutCurrentUser();
    } catch {
      // Local logout still clears the browser session if the server token is already invalid.
    } finally {
      clearAuthSession();
      window.location.replace("/dang-nhap");
    }
  };

  if (authStatus !== "ready" || !authUser) {
    return (
      <main style={{ minHeight: "100vh", background: colors.bg, color: colors.text }}>
        <section style={{ maxWidth: 1120, margin: "0 auto", padding: "42px 18px" }}>
          <div style={{ color: colors.muted, fontSize: 14, fontWeight: 800 }}>
            {authStatus === "redirecting" ? "Đang chuyển về trang đăng nhập..." : "Đang kiểm tra phiên đăng nhập..."}
          </div>
        </section>
      </main>
    );
  }

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
                overflow: "hidden",
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
                  <h1
                    style={{
                      display: "-webkit-box",
                      margin: 0,
                      maxWidth: "100%",
                      overflow: "hidden",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: 2,
                      overflowWrap: "anywhere",
                      wordBreak: "break-word",
                      fontSize: 22,
                      fontWeight: 950,
                      lineHeight: 1.08,
                    }}
                  >
                    {name}
                  </h1>
                  <p
                    style={{
                      marginTop: 5,
                      fontSize: 13,
                      color: "rgba(36,26,10,.75)",
                      fontWeight: 800,
                      lineHeight: 1.25,
                      overflowWrap: "anywhere",
                      wordBreak: "break-word",
                    }}
                  >
                    {accountEmail}
                  </p>
                </div>
                <span style={{ borderRadius: 999, background: colors.onGold, color: colors.goldPale, padding: "7px 10px", fontSize: 11, fontWeight: 950 }}>
                  {tier}
                </span>
              </div>

              <div style={{ marginTop: 18, borderRadius: 16, background: "rgba(36,26,10,.16)", padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12, fontWeight: 900 }}>
                  <span>Điểm thưởng</span>
                  <span>{pointFormatter.format(rewardPoints)} / {pointFormatter.format(rewardTarget)}</span>
                </div>
                <div style={{ marginTop: 10, height: 7, borderRadius: 999, background: "rgba(36,26,10,.22)", overflow: "hidden" }}>
                  <div style={{ width: `${rewardProgress}%`, height: "100%", borderRadius: "inherit", background: "#fff2b6" }} />
                </div>
                <p style={{ marginTop: 8, fontSize: 11.5, color: "rgba(36,26,10,.76)" }}>
                  {isLoadingPoints
                    ? "Đang cập nhật điểm thưởng..."
                    : pointSummaryError
                      ? "Chưa tải được điểm thật, vui lòng thử lại."
                      : pointsToNextTier > 0
                        ? `Cần thêm ${pointFormatter.format(pointsToNextTier)} điểm để lên hạng ${nextTierName}`
                        : `Đã đủ điểm để lên hạng ${nextTierName}`}
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
