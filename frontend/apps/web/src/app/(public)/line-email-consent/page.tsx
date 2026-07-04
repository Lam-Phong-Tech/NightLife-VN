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

const emailConsentBenefits = [
  "Không dùng email cho quảng cáo.",
  "Chỉ dùng để đăng nhập, lưu lịch đặt và gửi thông báo cần thiết.",
  "Bạn có thể yêu cầu hỗ trợ về dữ liệu cá nhân.",
];

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
              minHeight: 360,
              border: `1px solid ${colors.border}`,
              borderRadius: 22,
              padding: 26,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
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
                Cần email để tạo tài khoản hội viên.
              </h1>
              <p className="nl-line-consent-hero-copy" style={{ marginTop: 14, maxWidth: 560, color: colors.muted, fontSize: 15, lineHeight: 1.68 }}>
                Email từ LINE giúp bạn đăng nhập, lưu lịch đặt chỗ và bảo vệ tài khoản.
              </p>
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
              <h2 style={{ margin: 0, fontSize: 23, lineHeight: 1.12, fontWeight: 950 }}>
                Chia sẻ email qua LINE
              </h2>
            </div>
            <p style={{ marginTop: 10, color: colors.muted, fontSize: 13.5, lineHeight: 1.58 }}>
              Cho phép Vietyoru nhận email từ LINE để tạo hoặc đăng nhập tài khoản.
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
              <span style={{ color: colors.text, fontSize: 13.5, lineHeight: 1.52, fontWeight: 780 }}>
                Tôi đồng ý chia sẻ email từ LINE cho Vietyoru.
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
              Tiếp tục với LINE
            </button>

            <div
              style={{
                display: "grid",
                gap: 9,
                marginTop: 16,
                border: `1px solid ${colors.border}`,
                borderRadius: 15,
                padding: 14,
                background: "rgba(12,12,15,.34)",
              }}
            >
              {emailConsentBenefits.map((item) => (
                <div key={item} style={{ display: "flex", gap: 9, color: colors.muted, fontSize: 12.8, lineHeight: 1.45 }}>
                  <CheckCircle2 size={16} color={colors.line} style={{ flex: "none", marginTop: 1 }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <p style={{ marginTop: 12, color: colors.dim, fontSize: 12, lineHeight: 1.55 }}>
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
