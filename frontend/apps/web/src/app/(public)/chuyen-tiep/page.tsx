"use client";

import { useEffect, useState } from "react";

import { handoffActiveAuthSession } from "@/lib/api/auth";
import { nightlifeOrigins } from "@/lib/auth/hosts";

export default function AuthHandoffPage() {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const handoffTimer = window.setTimeout(() => {
      if (!handoffActiveAuthSession()) {
        setFailed(true);
      }
    }, 0);
    const timeoutTimer = window.setTimeout(() => {
      setFailed(true);
    }, 10_000);

    return () => {
      window.clearTimeout(handoffTimer);
      window.clearTimeout(timeoutTimer);
    };
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "#09090b",
        color: "#f6f1e5",
        fontFamily: "var(--nl-font-sans)",
      }}
    >
      <section style={{ maxWidth: 460, textAlign: "center" }}>
        <h1 style={{ fontSize: 24, marginBottom: 12 }}>
          {failed ? "Không thể mở cổng làm việc" : "Đang mở cổng làm việc phù hợp…"}
        </h1>
        <p style={{ color: "#aaa39a", lineHeight: 1.6 }}>
          {failed
            ? "Không thể chuyển sang cổng làm việc. Vui lòng tải lại trang hoặc đăng nhập lại."
            : "Hệ thống đang chuyển phiên đăng nhập an toàn sang đúng cổng quyền hạn của bạn."}
        </p>
        {failed ? (
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 18 }}>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                border: 0,
                padding: 0,
                background: "transparent",
                color: "#e8c86a",
                cursor: "pointer",
                font: "inherit",
                textDecoration: "underline",
              }}
            >
              Thử lại
            </button>
            <a href={nightlifeOrigins.auth} style={{ color: "#e8c86a" }}>
              Quay lại đăng nhập
            </a>
          </div>
        ) : null}
      </section>
    </main>
  );
}
