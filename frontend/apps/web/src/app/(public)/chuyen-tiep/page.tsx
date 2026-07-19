"use client";

import { useEffect, useState } from "react";

import { handoffActiveAuthSession } from "@/lib/api/auth";
import { nightlifeOrigins } from "@/lib/auth/hosts";

export default function AuthHandoffPage() {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!handoffActiveAuthSession()) {
        setFailed(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
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
          {failed ? "Phiên đăng nhập không hợp lệ" : "Đang mở cổng làm việc phù hợp…"}
        </h1>
        <p style={{ color: "#aaa39a", lineHeight: 1.6 }}>
          {failed
            ? "Vui lòng quay lại trang đăng nhập và thử lại."
            : "Hệ thống đang chuyển phiên đăng nhập an toàn sang đúng cổng quyền hạn của bạn."}
        </p>
        {failed ? (
          <a
            href={nightlifeOrigins.auth}
            style={{ display: "inline-block", marginTop: 18, color: "#e8c86a" }}
          >
            Quay lại đăng nhập
          </a>
        ) : null}
      </section>
    </main>
  );
}
