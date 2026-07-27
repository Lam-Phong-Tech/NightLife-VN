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
          border: "1px solid var(--vy-border)",
          background: "var(--vy-surface-2)",
          color: currentPage <= 1 ? "var(--vy-faint)" : "var(--vy-text-2)",
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
          color: "var(--vy-gold)",
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
            border: page === currentPage ? "0" : "1px solid var(--vy-border)",
            background: page === currentPage ? "var(--vy-gold-grad)" : "var(--vy-surface-2)",
            color: page === currentPage ? "var(--vy-on-gold)" : "var(--vy-text-2)",
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
          border: "1px solid var(--vy-border)",
          background: "var(--vy-surface-2)",
          color: currentPage >= totalPages ? "var(--vy-faint)" : "var(--vy-text-2)",
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
