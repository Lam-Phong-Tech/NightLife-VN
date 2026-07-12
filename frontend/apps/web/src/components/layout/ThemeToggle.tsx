"use client";

import React, { useEffect, useState } from "react";

interface ThemeToggleProps {
  isMobile?: boolean;
}

export function ThemeToggle({ isMobile }: ThemeToggleProps) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    // Chỉ render khi client-side để tránh hydration mismatch
    try {
      const storedTheme = localStorage.getItem("vy-user-theme");
      if (storedTheme === "light" || storedTheme === "dark") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTheme(storedTheme);
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    try {
      localStorage.setItem("vy-user-theme", nextTheme);
      if (nextTheme === "light") {
        document.documentElement.classList.add("vy-light");
      } else {
        document.documentElement.classList.remove("vy-light");
      }
    } catch {
      // ignore
    }
  };

  const size = isMobile ? 36 : 39;

  return (
    <button
      onClick={toggleTheme}
      title="Chuyển giao diện sáng/tối"
      aria-label="Chuyển giao diện sáng/tối"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: "1px solid var(--vy-border-gold-32)",
        background: "transparent",
        color: "var(--vy-gold)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "background-color 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--vy-gold-soft-bg)")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
    >
      {theme === "dark" ? (
        // Mặt trời
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" />
        </svg>
      ) : (
        // Mặt trăng
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 14.5A8.3 8.3 0 0 1 9.5 4 8.3 8.3 0 1 0 20 14.5z" />
        </svg>
      )}
    </button>
  );
}
