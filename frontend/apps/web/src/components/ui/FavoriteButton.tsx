"use client";

import type { CSSProperties, KeyboardEvent, MouseEvent, ReactNode } from "react";
import { Heart } from "lucide-react";

type FavoriteButtonSize = "card" | "detail" | "compact";

type FavoriteButtonProps = {
  isFavorite: boolean;
  label: string;
  onClick?: (event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => void;
  as?: "button" | "span";
  size?: FavoriteButtonSize;
  className?: string;
  style?: CSSProperties;
  title?: string;
  disabled?: boolean;
  children?: ReactNode;
};

const iconSizeBySize: Record<FavoriteButtonSize, number> = {
  compact: 20,
  card: 22,
  detail: 24,
};

export function FavoriteButton({
  isFavorite,
  label,
  onClick,
  as = "button",
  size = "card",
  className,
  style,
  title,
  disabled = false,
  children,
}: FavoriteButtonProps) {
  const buttonClassName = [
    "nl-favorite-button",
    `nl-favorite-button--${size}`,
    isFavorite ? "is-active" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = children ?? (
    <Heart
      className="nl-favorite-button__icon"
      size={iconSizeBySize[size]}
      strokeWidth={2.25}
      fill={isFavorite ? "currentColor" : "none"}
    />
  );

  if (as === "span") {
    return (
      <span
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-pressed={isFavorite}
        aria-disabled={disabled || undefined}
        title={title ?? label}
        className={buttonClassName}
        style={style}
        onClick={disabled ? undefined : onClick}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClick?.(event);
          }
        }}
      >
        {content}
      </span>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isFavorite}
      title={title ?? label}
      className={buttonClassName}
      style={style}
      onClick={onClick}
      disabled={disabled}
    >
      {content}
    </button>
  );
}
