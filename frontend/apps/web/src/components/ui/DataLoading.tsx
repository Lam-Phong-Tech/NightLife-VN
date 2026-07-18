import React, { type CSSProperties } from "react";

type DataSkeletonVariant = "cards" | "list" | "stats" | "media" | "form";

type DataSkeletonProps = {
  variant?: DataSkeletonVariant;
  count?: number;
  columns?: number;
  compact?: boolean;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
};

export function DataSkeleton({
  variant = "list",
  count,
  columns,
  compact = false,
  ariaLabel = "Đang tải nội dung",
  className = "",
  style,
}: DataSkeletonProps) {
  const itemCount =
    count ?? (variant === "stats" ? 4 : variant === "cards" || variant === "media" ? 3 : 4);
  const columnCount =
    columns ?? (variant === "stats" ? 4 : variant === "cards" || variant === "media" ? 3 : 1);
  const skeletonStyle = {
    ...style,
    "--nl-data-columns": columnCount,
  } as CSSProperties;

  return (
    <div
      className={`nl-data-skeleton nl-data-skeleton-${variant}${compact ? " is-compact" : ""}${className ? ` ${className}` : ""}`}
      style={skeletonStyle}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={ariaLabel}
    >
      <span className="sr-only">{ariaLabel}</span>
      {Array.from({ length: itemCount }, (_, index) => (
        <div className="nl-data-skeleton-item" aria-hidden="true" key={index}>
          {variant === "cards" || variant === "media" ? (
            <span className="nl-data-skeleton-block nl-data-skeleton-media" />
          ) : null}
          {variant === "list" ? (
            <span className="nl-data-skeleton-block nl-data-skeleton-thumb" />
          ) : null}
          {variant === "form" ? (
            <>
              <span className="nl-data-skeleton-block nl-data-skeleton-label" />
              <span className="nl-data-skeleton-block nl-data-skeleton-input" />
            </>
          ) : (
            <span className="nl-data-skeleton-copy">
              <span className="nl-data-skeleton-block nl-data-skeleton-title" />
              <span className="nl-data-skeleton-block nl-data-skeleton-line" />
              {variant !== "stats" ? (
                <span className="nl-data-skeleton-block nl-data-skeleton-line is-short" />
              ) : null}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export function TableLoadingRows({
  columns,
  rows = 6,
  ariaLabel = "Đang tải dữ liệu bảng",
}: {
  columns: number;
  rows?: number;
  ariaLabel?: string;
}) {
  return (
    <>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <tr className="nl-table-skeleton-row" aria-hidden={rowIndex > 0 ? "true" : undefined} key={rowIndex}>
          <td colSpan={columns}>
            {rowIndex === 0 ? <span className="sr-only">{ariaLabel}</span> : null}
            <div
              className="nl-table-skeleton-cells"
              role={rowIndex === 0 ? "status" : undefined}
              aria-live={rowIndex === 0 ? "polite" : undefined}
              aria-busy={rowIndex === 0 ? "true" : undefined}
              aria-label={rowIndex === 0 ? ariaLabel : undefined}
            >
              {Array.from({ length: Math.min(columns, 6) }, (_, columnIndex) => (
                <span
                  className={`nl-data-skeleton-block${columnIndex === 0 ? " is-wide" : ""}`}
                  key={columnIndex}
                />
              ))}
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

export function InlineLoading({
  label = "Đang xử lý",
  showLabel = true,
}: {
  label?: string;
  showLabel?: boolean;
}) {
  return (
    <span className="nl-inline-loading" role="status" aria-live="polite">
      <span className="nl-inline-loading-spinner" aria-hidden="true" />
      <span className={showLabel ? undefined : "sr-only"}>{label}</span>
    </span>
  );
}
