import React, { type CSSProperties } from "react";

type LoadingSkeletonProps = {
  rows?: number;
  variant?: "list" | "home" | "mobile-home";
};

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ rows = 3, variant = "list" }) => {
  if (variant === "home" || variant === "mobile-home") {
    return <HomeLoadingSkeleton mobile={variant === "mobile-home"} />;
  }

  return (
    <div style={listStyle}>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} style={rowStyle}>
          <div className="nl-system-skeleton" style={thumbStyle} />
          <div style={copyStyle}>
            <div className="nl-system-skeleton" style={{ ...lineStyle, width: "70%" }} />
            <div className="nl-system-skeleton" style={{ ...lineStyle, width: "46%", height: 12 }} />
            <div className="nl-system-skeleton" style={{ ...lineStyle, width: "28%", height: 12, marginTop: 8 }} />
          </div>
        </div>
      ))}
      <SkeletonStyle />
    </div>
  );
};

export function HomeLoadingSkeleton({ mobile = false }: { mobile?: boolean }) {
  const sections = mobile ? 4 : 3;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--vy-bg)",
        color: "var(--vy-text)",
        padding: mobile ? "16px 18px calc(96px + env(safe-area-inset-bottom))" : "34px",
        fontFamily: "var(--nl-font-sans)",
      }}
    >
      <div style={{ maxWidth: mobile ? 430 : 1120, margin: "0 auto", display: "grid", gap: mobile ? 18 : 22 }}>
        <div className="nl-system-skeleton" style={{ height: mobile ? 46 : 54, borderRadius: 14 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: mobile ? "14px 12px" : 14 }}>
          {Array.from({ length: mobile ? 8 : 4 }, (_, index) => (
            <div key={index} style={{ display: "grid", justifyItems: "center", gap: 8 }}>
              <div className="nl-system-skeleton" style={{ width: mobile ? 54 : 64, height: mobile ? 54 : 64, borderRadius: 16 }} />
              <div className="nl-system-skeleton" style={{ width: mobile ? 42 : 56, height: 10, borderRadius: 6 }} />
            </div>
          ))}
        </div>
        <div className="nl-system-skeleton" style={{ height: mobile ? 182 : 240, borderRadius: 18 }} />
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)", gap: 14 }}>
          {Array.from({ length: sections }, (_, index) => (
            <div key={index} style={{ border: "1px solid var(--vy-border-gold-12)", borderRadius: 16, padding: 12 }}>
              <div className="nl-system-skeleton" style={{ height: mobile ? 108 : 136, borderRadius: 12 }} />
              <div className="nl-system-skeleton" style={{ ...lineStyle, width: "68%", marginTop: 12 }} />
              <div className="nl-system-skeleton" style={{ ...lineStyle, width: "44%", height: 12, marginTop: 9 }} />
            </div>
          ))}
        </div>
      </div>
      <SkeletonStyle />
    </main>
  );
}

function SkeletonStyle() {
  return (
    <style>{`
      .nl-system-skeleton {
        position: relative;
        overflow: hidden;
        background: var(--vy-surface-3);
      }

      .nl-system-skeleton::after {
        content: "";
        position: absolute;
        inset: 0;
        transform: translateX(-100%);
        background: linear-gradient(90deg, transparent, var(--vy-gold-soft-bg), transparent);
        animation: nl-system-shimmer 1.5s infinite;
      }

      @keyframes nl-system-shimmer {
        100% {
          transform: translateX(100%);
        }
      }
    `}</style>
  );
}

const listStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  padding: "16px 0",
};

const rowStyle: CSSProperties = {
  display: "flex",
  gap: 12,
  border: "1px solid var(--vy-border-gold-12)",
  borderRadius: 14,
  background: "var(--vy-surface-1)",
  padding: 12,
};

const thumbStyle: CSSProperties = {
  width: 80,
  height: 80,
  borderRadius: 12,
  flex: "none",
};

const copyStyle: CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: 8,
  justifyContent: "center",
};

const lineStyle: CSSProperties = {
  height: 14,
  borderRadius: 6,
};
