"use client";

import {
  authSessionChangeEvent,
  clearAuthSession,
  getAuthSessionExpiresAt,
  getAuthUser,
  type AuthUser,
} from "@/lib/auth/session";
import { logoutBrowserProfile } from "@/lib/api/auth";
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
import { InlineLoading } from "@/components/ui/DataLoading";
import { useActiveLanguage } from "@/lib/i18n/use-active-language";
import { translateText } from "@/lib/i18n/client-translations";

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

const pointFormatter = new Intl.NumberFormat("vi-VN");

const getBaTierLabel = (tier?: string | null) => {
  const normalizedTier = tier?.trim().toUpperCase();
  if (normalizedTier === "VIP" || normalizedTier === "PREMIUM") return "VIP";
  if (normalizedTier === "GUEST") return "GUEST";
  return "MEMBER";
};

const menuItems = [
  { title: "Lịch sử đặt chỗ", desc: "Theo dõi yêu cầu và trạng thái xác nhận", href: "/lich-su-dat-cho", icon: CalendarDays },
  { title: "Hóa đơn của tôi", desc: "Gửi hóa đơn để tích điểm thành viên", href: "/gui-hoa-don", icon: FileText },
  { title: "Quán & Cast đã lưu", desc: "Danh sách yêu thích để đặt lại nhanh", href: "/da-luu", icon: Heart },
  { title: "Bảo mật tài khoản", desc: "Thông tin cá nhân và quyền truy cập", href: "/bao-mat-tai-khoan", icon: ShieldCheck },
];

export default function Page() {
  const activeLanguage = useActiveLanguage();
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
  const canLoadPoints = authUser?.role === "USER";
  const rewardPoints = Math.max(0, pointSummary?.availablePoints ?? 0);
  const tier = getBaTierLabel(pointSummary?.currentTier ?? authUser?.tier);
  const rewardProgress = Math.max(0, Math.min(100, pointSummary?.progressPercent ?? 0));
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
      await logoutBrowserProfile();
    } catch {
      // Local logout still clears the browser session if token revocation is unavailable.
    } finally {
      clearAuthSession();
      window.location.replace("/dang-nhap");
    }
  };

  if (authStatus !== "ready" || !authUser) {
    return (
      <main style={{ background: colors.bg, color: colors.text }}>
        <section style={{ maxWidth: 1120, margin: "0 auto", padding: "42px 18px" }}>
          <div style={{ color: colors.muted, fontSize: 14, fontWeight: 800 }}>
            {translateText(
              authStatus === "redirecting"
                ? "Đang chuyển về trang đăng nhập..."
                : "Đang kiểm tra phiên đăng nhập...",
              activeLanguage,
            )}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main style={{ background: colors.bg, color: colors.text }}>
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "24px 18px 28px" }}>
        <div className="nl-account-layout">
          <aside style={{ display: "grid", gap: 16 }}>
            <section
              className="nl-account-profile-card"
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
                  className="nl-account-avatar"
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    background: "var(--vy-surface)",
                    color: colors.goldPale,
                    border: "2px solid rgba(36,26,10,.18)",
                    flex: "none",
                  }}
                >
                  <UserRound size={28} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h1
                    className="notranslate"
                    translate="no"
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
                    className="notranslate"
                    translate="no"
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
                <span className="nl-account-tier notranslate" translate="no" style={{ borderRadius: 999, background: colors.onGold, color: colors.goldPale, padding: "7px 10px", fontSize: 11, fontWeight: 950 }}>
                  {tier}
                </span>
              </div>

              <div className="nl-account-points-panel" style={{ marginTop: 18, borderRadius: 16, background: "rgba(36,26,10,.16)", padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12, fontWeight: 900 }}>
                  <span>{translateText("Điểm thưởng", activeLanguage)}</span>
                  <span>
                    <span className="notranslate" translate="no" data-no-translate="true">
                      {pointFormatter.format(rewardPoints)}
                    </span>{" "}
                    {translateText("điểm", activeLanguage)}
                  </span>
                </div>
                <div className="nl-account-points-track" style={{ marginTop: 10, height: 7, borderRadius: 999, background: "rgba(36,26,10,.22)", overflow: "hidden" }}>
                  <div className="nl-account-points-fill" style={{ width: `${rewardProgress}%`, height: "100%", borderRadius: "inherit", background: "#fff2b6" }} />
                </div>
                <p className="nl-account-points-note" style={{ marginTop: 8, fontSize: 11.5, color: "rgba(36,26,10,.76)" }}>
                  {isLoadingPoints
                    ? <InlineLoading label={translateText("Đang cập nhật điểm thưởng", activeLanguage)} />
                    : pointSummaryError
                      ? translateText("Chưa tải được điểm thật, vui lòng thử lại.", activeLanguage)
                      : translateText(
                          `Điểm được cộng sau khi Admin duyệt hóa đơn. Hạng khách hiện tại: ${tier}.`,
                          activeLanguage,
                        )}
                </p>
              </div>
            </section>

            <section style={{ border: `1px solid ${colors.border}`, borderRadius: 18, background: colors.panel, padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: colors.goldPale, fontWeight: 950 }}>
                <Crown size={18} />
                {translateText("Quyền lợi thành viên", activeLanguage)}
              </div>
              <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                <Benefit icon={<Star size={15} />} text={translateText("Ưu tiên xác nhận bàn VIP", activeLanguage)} />
                <Benefit icon={<Percent size={15} />} text={translateText("Nhận coupon riêng theo hạng", activeLanguage)} />
                <Benefit icon={<CalendarDays size={15} />} text={translateText("Lưu lịch đặt chỗ và đặt lại nhanh", activeLanguage)} />
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
                      <strong style={{ display: "block", fontSize: 14.5, fontWeight: 900 }}>{translateText(item.title, activeLanguage)}</strong>
                      <small style={{ display: "block", marginTop: 4, color: colors.muted, fontSize: 12 }}>{translateText(item.desc, activeLanguage)}</small>
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
                <strong style={{ fontSize: 14.5, fontWeight: 900 }}>{translateText("Đăng xuất", activeLanguage)}</strong>
                <ChevronRight size={18} color={colors.danger} />
              </Link>
            </section>
          </div>
        </div>
      </section>
      <style>{`
        html.vy-light .nl-account-profile-card {
          background:
            radial-gradient(circle at 82% 12%, rgba(212,178,106,.16), transparent 28%),
            linear-gradient(135deg, #fffaf1, #f6ead2 58%, #ead19c) !important;
          color: #241a0a !important;
          box-shadow: 0 18px 42px -30px rgba(80,55,18,.34);
        }

        html.vy-light .nl-account-avatar {
          background: #fff !important;
          color: #9c742c !important;
          border-color: rgba(150,116,52,.24) !important;
        }

        html.vy-light .nl-account-tier {
          border: 1px solid rgba(150,116,52,.26);
          background: #fff7e8 !important;
          color: #7a551b !important;
        }

        html.vy-light .nl-account-points-panel {
          background: rgba(255,255,255,.5) !important;
          border: 1px solid rgba(150,116,52,.18);
        }

        html.vy-light .nl-account-points-track {
          background: rgba(150,116,52,.18) !important;
        }

        html.vy-light .nl-account-points-fill {
          background: linear-gradient(90deg, #c89222, #f0cf69) !important;
          box-shadow: none;
        }

        html.vy-light .nl-account-points-note {
          color: #6f6658 !important;
        }
      `}</style>
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
