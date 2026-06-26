"use client";

import { Clock3, QrCode, ShieldCheck, TicketCheck, WalletCards } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

type CouponStatus = "held" | "used" | "expired";

type Coupon = {
  id: string;
  title: string;
  place: string;
  expiry: string;
  value: string;
  status: CouponStatus;
  statusLabel: string;
  badgeColor: string;
  badgeBg: string;
  dim?: boolean;
};

const colors = {
  bg: "#0c0c0f",
  panel: "#151518",
  panel2: "#111113",
  border: "rgba(212,178,106,.24)",
  borderStrong: "rgba(212,178,106,.36)",
  text: "#f7f2e8",
  text2: "#d8d1c1",
  muted: "#9b9488",
  gold: "#d4b26a",
  goldPale: "#f2dfaa",
  onGold: "#241a0a",
  goldGrad: "linear-gradient(135deg,#fff1bf 0%,#e4bf63 52%,#c09035 100%)",
};

const tabs: Array<{ key: CouponStatus; label: string }> = [
  { key: "held", label: "Đang giữ chỗ" },
  { key: "used", label: "Đã sử dụng" },
  { key: "expired", label: "Hết hạn" },
];

const coupons: Coupon[] = [
  {
    id: "NL-HH30-7K2A",
    title: "Happy Hour -30%",
    place: "KTV Hoàng Gia · Kim Mã",
    expiry: "Còn 22:13:56",
    value: "-30%",
    status: "held",
    statusLabel: "Chờ duyệt",
    badgeColor: "#f9a8d4",
    badgeBg: "rgba(236,72,153,.16)",
  },
  {
    id: "NL-VIP-12TR",
    title: "Combo phòng VIP",
    place: "Diamond Bar · Quận 3",
    expiry: "Hôm nay",
    value: "1.2tr",
    status: "held",
    statusLabel: "Đã xác nhận",
    badgeColor: "#a7f3d0",
    badgeBg: "rgba(16,185,129,.16)",
  },
];

function CouponCard({ coupon }: { coupon: Coupon }) {
  return (
    <article
      style={{
        minHeight: "186px",
        background:
          "linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,.015)), #141416",
        border: `1px solid ${colors.border}`,
        borderRadius: "18px",
        overflow: "hidden",
        boxShadow: "0 18px 46px rgba(0,0,0,.24)",
        opacity: coupon.dim ? 0.5 : 1,
      }}
    >
      <div
        style={{
          padding: "20px",
          display: "flex",
          alignItems: "center",
          gap: "18px",
        }}
      >
        <div
          style={{
            width: "82px",
            height: "82px",
            borderRadius: "14px",
            border: `1px solid ${colors.borderStrong}`,
            background: "rgba(244,238,222,.96)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "none",
          }}
        >
          <Image
            width={76}
            height={76}
            src="https://img.icons8.com/ios/200/000000/qr-code.png"
            style={{ width: "62px", height: "62px", display: "block" }}
            alt="QR"
          />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h2
              style={{
                margin: 0,
                color: colors.text,
                fontSize: "18px",
                lineHeight: 1.25,
                fontWeight: 800,
              }}
            >
              {coupon.title}
            </h2>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                minHeight: "28px",
                borderRadius: "10px",
                padding: "0 11px",
                color: coupon.badgeColor,
                background: coupon.badgeBg,
                fontSize: "12px",
                fontWeight: 800,
              }}
            >
              {coupon.statusLabel}
            </span>
          </div>
          <p
            style={{
              margin: "8px 0 0",
              color: colors.text2,
              fontSize: "13.5px",
              lineHeight: 1.5,
            }}
          >
            {coupon.place}
          </p>
          <div
            style={{
              marginTop: "14px",
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              color: colors.muted,
              fontSize: "12.5px",
              fontWeight: 600,
            }}
          >
            <QrCode size={15} color={colors.gold} />
            {coupon.id}
          </div>
        </div>
      </div>

      <div
        style={{
          borderTop: `1px dashed ${colors.borderStrong}`,
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          color: colors.text2,
          fontSize: "13px",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
          <Clock3 size={16} color={colors.gold} />
          {coupon.expiry}
        </span>
        <strong style={{ color: colors.goldPale, fontSize: "16px" }}>{coupon.value}</strong>
      </div>
    </article>
  );
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<CouponStatus>("held");
  const visibleCoupons = coupons.filter((coupon) => coupon.status === activeTab);

  return (
    <main
      style={{
        minHeight: "calc(100vh - 82px)",
        background:
          "radial-gradient(circle at 12% 0%,rgba(212,178,106,.12),transparent 30%), linear-gradient(180deg,#121216 0%,#0c0c0f 100%)",
        color: colors.text,
        fontFamily: "var(--nl-font-sans)",
        padding: "42px clamp(18px,3.2vw,48px) 58px",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "none",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "24px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                minHeight: "32px",
                borderRadius: "16px",
                padding: "0 12px",
                border: `1px solid ${colors.border}`,
                color: colors.goldPale,
                background: "rgba(212,178,106,.09)",
                fontSize: "12px",
                fontWeight: 800,
                textTransform: "uppercase",
              }}
            >
              <WalletCards size={15} />
              Ví ưu đãi
            </div>
            <h1
              style={{
                margin: "18px 0 0",
                fontSize: "clamp(28px,3.2vw,44px)",
                lineHeight: 1.08,
                fontWeight: 900,
              }}
            >
              Ví ưu đãi của tôi
            </h1>
            <p
              style={{
                margin: "12px 0 0",
                maxWidth: "720px",
                color: colors.text2,
                fontSize: "15px",
                lineHeight: 1.7,
              }}
            >
              Quản lý mã giảm giá đã lấy, giữ mã đang chờ và đưa cho nhân viên quán quét khi tới
              nơi.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2,minmax(132px,1fr))",
              gap: "12px",
              width: "min(360px,100%)",
            }}
          >
            <div
              style={{
                minHeight: "82px",
                borderRadius: "16px",
                border: `1px solid ${colors.border}`,
                background: "rgba(255,255,255,.035)",
                padding: "14px",
              }}
            >
              <TicketCheck size={19} color={colors.gold} />
              <div style={{ marginTop: "8px", color: colors.text, fontSize: "22px", fontWeight: 900 }}>
                {coupons.length}
              </div>
              <div style={{ color: colors.muted, fontSize: "12px" }}>mã trong ví</div>
            </div>
            <div
              style={{
                minHeight: "82px",
                borderRadius: "16px",
                border: `1px solid ${colors.border}`,
                background: "rgba(255,255,255,.035)",
                padding: "14px",
              }}
            >
              <ShieldCheck size={19} color={colors.gold} />
              <div style={{ marginTop: "8px", color: colors.text, fontSize: "22px", fontWeight: 900 }}>
                24h
              </div>
              <div style={{ color: colors.muted, fontSize: "12px" }}>giữ mã guest</div>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "28px",
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          {tabs.map((tab) => {
            const active = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  minHeight: "42px",
                  borderRadius: "21px",
                  padding: "0 18px",
                  border: `1px solid ${active ? "rgba(244,223,168,.62)" : colors.border}`,
                  background: active ? colors.goldGrad : "rgba(255,255,255,.035)",
                  color: active ? colors.onGold : colors.text2,
                  fontSize: "14px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div
          style={{
            marginTop: "22px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(430px,100%),1fr))",
            gap: "20px",
          }}
        >
          {visibleCoupons.map((coupon) => (
            <CouponCard key={coupon.id} coupon={coupon} />
          ))}
        </div>

        {visibleCoupons.length === 0 ? (
          <div
            style={{
              marginTop: "22px",
              minHeight: "180px",
              borderRadius: "18px",
              border: `1px dashed ${colors.borderStrong}`,
              background: "rgba(255,255,255,.025)",
              color: colors.muted,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              fontSize: "15px",
            }}
          >
            Không có mã ở mục này.
          </div>
        ) : null}
      </section>
    </main>
  );
}
