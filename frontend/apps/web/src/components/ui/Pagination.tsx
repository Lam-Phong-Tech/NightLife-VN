"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const { t } = useLanguage();

  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        marginTop: "32px",
        marginBottom: "16px",
        fontFamily: "var(--nl-font-sans)",
      }}
      aria-label="Pagination"
    >
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "10px",
          border: "1px solid rgba(255,255,255,.12)",
          background: "rgba(255,255,255,.04)",
          color: currentPage <= 1 ? "#555" : "#c5c0b6",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: currentPage <= 1 ? "not-allowed" : "pointer",
        }}
        aria-label="Previous Page"
      >
        <ChevronLeft size={16} />
      </button>

      <span
        style={{
          color: "#d4b26a",
          fontSize: "13.5px",
          fontWeight: 700,
          padding: "0 8px",
        }}
      >
        {t("pageLabel", { current: currentPage, total: totalPages })}
      </span>

      {pages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            border: page === currentPage ? "0" : "1px solid rgba(255,255,255,.12)",
            background: page === currentPage ? "linear-gradient(135deg,#f4e3b4,#d4b26a)" : "rgba(255,255,255,.04)",
            color: page === currentPage ? "#241a0a" : "#c5c0b6",
            fontSize: "14px",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "10px",
          border: "1px solid rgba(255,255,255,.12)",
          background: "rgba(255,255,255,.04)",
          color: currentPage >= totalPages ? "#555" : "#c5c0b6",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
        }}
        aria-label="Next Page"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
