"use client";

export const adminPageSize = 8;

export function clampAdminPage(page: number, totalItems: number, pageSize = adminPageSize) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.min(page, totalPages);
}

export function paginateAdminItems<T>(items: T[], page: number, pageSize = adminPageSize) {
  const safePage = clampAdminPage(page, items.length, pageSize);
  const start = (safePage - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

type AdminPaginationProps = {
  page: number;
  totalItems: number;
  pageSize?: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
};

export function AdminPagination({
  page,
  totalItems,
  pageSize = adminPageSize,
  itemLabel = "mục",
  onPageChange,
}: AdminPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = clampAdminPage(page, totalItems, pageSize);
  const start = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(totalItems, safePage * pageSize);

  const getPageButtons = () => {
    const pages = new Set<number>([1, totalPages, safePage - 1, safePage, safePage + 1]);
    return Array.from(pages)
      .filter((p) => p >= 1 && p <= totalPages)
      .sort((a, b) => a - b);
  };

  if (totalItems <= pageSize && totalPages <= 1) {
    return (
      <div style={summaryStyle}>
        Hiển thị {totalItems} {itemLabel}
      </div>
    );
  }

  const buttonBase = {
    border: "1px solid rgba(255,255,255,.09)",
    borderRadius: 10,
    height: 34,
    minWidth: 34,
    padding: "0 12px",
    fontSize: 12,
    fontWeight: 700,
    transition: "background .18s ease, color .18s ease, opacity .18s ease",
  } as const;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        flexWrap: "wrap",
        padding: "14px 18px",
        borderTop: "1px solid rgba(255,255,255,.06)",
        background: "rgba(255,255,255,.015)",
      }}
    >
      <div style={{ fontSize: 12, color: "#8c8679", fontWeight: 600 }}>
        Hiển thị {start}-{end} / {totalItems} {itemLabel}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <button
          type="button"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
          style={{
            ...buttonBase,
            color: safePage <= 1 ? "#57534b" : "#c5c0b6",
            background: "rgba(255,255,255,.035)",
            cursor: safePage <= 1 ? "not-allowed" : "pointer",
            opacity: safePage <= 1 ? 0.55 : 1,
          }}
        >
          Trước
        </button>

        {getPageButtons().map((pageNumber, index, pages) => {
          const hasGapBefore = index > 0 && pageNumber - pages[index - 1] > 1;
          const isActive = pageNumber === safePage;
          return (
            <span key={pageNumber} style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
              {hasGapBefore && <span style={{ color: "#57534b", fontSize: 12 }}>...</span>}
              <button
                type="button"
                onClick={() => onPageChange(pageNumber)}
                style={{
                  ...buttonBase,
                  color: isActive ? "#241a0a" : "#c5c0b6",
                  background: isActive
                    ? "linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)"
                    : "rgba(255,255,255,.035)",
                  cursor: "pointer",
                  boxShadow: isActive ? "0 10px 24px -18px rgba(244,227,180,.8)" : "none",
                }}
              >
                {pageNumber}
              </button>
            </span>
          );
        })}

        <button
          type="button"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
          style={{
            ...buttonBase,
            color: safePage >= totalPages ? "#57534b" : "#c5c0b6",
            background: "rgba(255,255,255,.035)",
            cursor: safePage >= totalPages ? "not-allowed" : "pointer",
            opacity: safePage >= totalPages ? 0.55 : 1,
          }}
        >
          Sau
        </button>
      </div>
    </div>
  );
}

const summaryStyle = {
  padding: "12px 18px",
  borderTop: "1px solid rgba(255,255,255,.06)",
  background: "rgba(255,255,255,.012)",
  color: "#8c8679",
  fontSize: 12,
  fontWeight: 600,
} as const;
