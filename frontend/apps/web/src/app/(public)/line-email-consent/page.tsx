"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Mail, ShieldCheck } from "lucide-react";

const colors = {
  bg: "#0c0c0f",
  panel: "rgba(255,255,255,.05)",
  panelStrong: "rgba(255,255,255,.08)",
  border: "rgba(212,178,106,.22)",
  borderStrong: "rgba(212,178,106,.38)",
  text: "#f3f0ea",
  muted: "#b6b1a6",
  dim: "#8c8679",
  gold: "#d4b26a",
  goldPale: "#f0dda8",
  onGold: "#241a0a",
  line: "#06C755",
  goldGrad: "linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)",
};

const normalizeRedirect = (value: string | null) => {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/tai-khoan";
  }

  return value;
};

export default function LineEmailConsentPage() {
  const [accepted, setAccepted] = useState(false);
  const redirectTo = useMemo(() => {
    if (typeof window === "undefined") return "/tai-khoan";
    return normalizeRedirect(new URLSearchParams(window.location.search).get("redirect"));
  }, []);

  const continueWithLine = () => {
    if (!accepted) return;

    const params = new URLSearchParams({ redirect: redirectTo });
    window.location.href = `/api/backend/auth/line/start?${params.toString()}`;
  };

  return (
    <main style={{ minHeight: "100vh", background: colors.bg, color: colors.text }}>
      <section
        style={{
          maxWidth: 1040,
          margin: "0 auto",
          padding: "28px 18px 56px",
          display: "grid",
          gap: 22,
        }}
      >
        <Link
          href="/dang-nhap"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            width: "fit-content",
            color: colors.muted,
            fontSize: 13,
            fontWeight: 800,
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={17} />
          Quay lại đăng nhập
        </Link>

        <div
          className="nl-line-consent-layout"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
            gap: 20,
            alignItems: "stretch",
          }}
        >
          <section
            className="nl-line-consent-hero"
            style={{
              minHeight: 480,
              border: `1px solid ${colors.border}`,
              borderRadius: 22,
              padding: 26,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              background:
                "linear-gradient(180deg,rgba(12,12,15,.28),rgba(12,12,15,.92)),url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1400&q=80') center/cover",
              overflow: "hidden",
            }}
          >
            <div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  border: `1px solid ${colors.borderStrong}`,
                  borderRadius: 999,
                  padding: "8px 12px",
                  color: colors.goldPale,
                  background: "rgba(12,12,15,.48)",
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                <Mail size={15} />
                LINE Login email permission
              </span>
              <h1
                className="nl-line-consent-hero-title"
                style={{
                  marginTop: 18,
                  maxWidth: 600,
                  fontSize: "clamp(30px, 5.2vw, 42px)",
                  lineHeight: 1.06,
                  fontWeight: 950,
                }}
              >
                Vietyoru cần email để tạo và bảo vệ tài khoản hội viên.
              </h1>
              <p className="nl-line-consent-hero-copy" style={{ marginTop: 14, maxWidth: 560, color: colors.muted, fontSize: 15, lineHeight: 1.68 }}>
                Chúng tôi chỉ yêu cầu LINE chia sẻ email sau khi bạn đồng ý rõ ràng. Email được dùng để đăng nhập, nhận diện tài khoản,
                lưu lịch đặt chỗ, quản lý ưu đãi và gửi thông báo quan trọng liên quan đến dịch vụ.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gap: 10,
                maxWidth: 560,
                border: `1px solid ${colors.border}`,
                borderRadius: 18,
                padding: 16,
                background: "rgba(12,12,15,.58)",
              }}
            >
              {[
                "Không bán hoặc chia sẻ email cho bên thứ ba để quảng cáo.",
                "Email được lưu cùng tài khoản hội viên và được xử lý theo Chính sách bảo mật.",
                "Bạn có thể liên hệ Vietyoru để yêu cầu hỗ trợ về dữ liệu cá nhân.",
              ].map((item) => (
                <div key={item} style={{ display: "flex", gap: 10, color: colors.muted, fontSize: 13.5, lineHeight: 1.55 }}>
                  <CheckCircle2 size={17} color={colors.line} style={{ flex: "none", marginTop: 1 }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section
            className="nl-line-consent-card"
            style={{
              border: `1px solid ${colors.borderStrong}`,
              borderRadius: 22,
              padding: 24,
              background: colors.panel,
              boxShadow: "0 22px 60px rgba(0,0,0,.26)",
              alignSelf: "center",
            }}
          >
            <div
              className="nl-line-consent-card-head"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                className="nl-line-consent-card-icon"
                style={{
                  width: 52,
                  height: 52,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 17,
                  background: colors.goldGrad,
                  color: colors.onGold,
                  flex: "none",
                }}
              >
                <ShieldCheck size={26} />
              </div>
              <h2 style={{ margin: 0, fontSize: 24, lineHeight: 1.12, fontWeight: 950 }}>
                Đồng ý chia sẻ email qua LINE
              </h2>
            </div>
            <p style={{ marginTop: 12, color: colors.muted, fontSize: 13.5, lineHeight: 1.7 }}>
              Bằng cách tiếp tục, bạn cho phép Vietyoru nhận địa chỉ email từ LINE để tạo hoặc đăng nhập tài khoản hội viên.
            </p>

            <label
              style={{
                display: "grid",
                marginTop: 18,
                gridTemplateColumns: "22px minmax(0,1fr)",
                gap: 11,
                alignItems: "flex-start",
                border: `1px solid ${accepted ? colors.borderStrong : colors.border}`,
                borderRadius: 15,
                padding: 14,
                background: accepted ? "rgba(6,199,85,.08)" : colors.panelStrong,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={accepted}
                onChange={(event) => setAccepted(event.target.checked)}
                style={{ width: 18, height: 18, marginTop: 2, accentColor: colors.line }}
              />
              <span style={{ color: colors.text, fontSize: 13.5, lineHeight: 1.6, fontWeight: 780 }}>
                Tôi đồng ý cho Vietyoru thu thập email từ LINE cho mục đích đăng nhập, quản lý tài khoản hội viên, đặt chỗ,
                ưu đãi và bảo mật tài khoản.
              </span>
            </label>

            <button
              type="button"
              disabled={!accepted}
              onClick={continueWithLine}
              style={{
                marginTop: 18,
                width: "100%",
                minHeight: 50,
                border: 0,
                borderRadius: 14,
                background: accepted ? colors.line : "rgba(255,255,255,.12)",
                color: accepted ? "#fff" : colors.dim,
                fontSize: 14.5,
                fontWeight: 950,
                cursor: accepted ? "pointer" : "not-allowed",
              }}
            >
              Đồng ý và tiếp tục với LINE
            </button>

            <p style={{ marginTop: 14, color: colors.dim, fontSize: 12, lineHeight: 1.65 }}>
              Xem thêm tại{" "}
              <Link href="/legal" style={{ color: colors.goldPale, fontWeight: 900 }}>
                Chính sách bảo mật
              </Link>
              .
            </p>
          </section>
        </div>
      </section>

      <style jsx global>{`
        @media (max-width: 767px) {
          .nl-line-consent-layout {
            grid-template-columns: 1fr !important;
          }

          .nl-line-consent-hero {
            min-height: auto !important;
            padding: 24px !important;
            gap: 22px !important;
          }

          .nl-line-consent-hero-title {
            max-width: 100% !important;
            font-size: clamp(30px, 9vw, 36px) !important;
            line-height: 1.08 !important;
          }

          .nl-line-consent-hero-copy {
            font-size: 14px !important;
            line-height: 1.62 !important;
          }

          .nl-line-consent-card {
            padding: 22px !important;
          }

          .nl-line-consent-card-head {
            align-items: center !important;
            gap: 11px !important;
          }

          .nl-line-consent-card-icon {
            width: 48px !important;
            height: 48px !important;
            border-radius: 16px !important;
          }

          .nl-line-consent-card-head h2 {
            font-size: 22px !important;
            line-height: 1.12 !important;
          }
        }
      `}</style>
    </main>
  );
}
