import Link from "next/link";
import { Check, Heart } from "lucide-react";
import { formatVnd } from "./cast-profile.helpers";
import type { CastProfile, CastProfileTrack } from "./cast-profile.types";

type CastBookingCTAProps = {
  profile: CastProfile;
  area: string;
  bookingHref: string;
  storeHref: string;
  variant: "mobile" | "desktop";
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onTrack?: CastProfileTrack;
};

export function CastBookingCTA({
  profile,
  area,
  bookingHref,
  storeHref,
  variant,
  isFavorite = false,
  onToggleFavorite,
  onTrack,
}: CastBookingCTAProps) {
  const priceLabel = formatVnd(profile.hourlyRateVnd);

  if (variant === "mobile") {
    return (
      <section className="cast-booking-cta mobile" data-testid="cast-booking-cta-mobile">
        <button
          type="button"
          className={`cast-booking-favorite${isFavorite ? " is-active" : ""}`}
          aria-label={isFavorite ? "Bỏ lưu cast" : "Lưu cast"}
          aria-pressed={isFavorite}
          onClick={onToggleFavorite}
        >
          <Heart size={19} strokeWidth={1.9} fill={isFavorite ? "currentColor" : "none"} />
        </button>
        <Link href={bookingHref} className="cast-booking-button" onClick={() => onTrack?.("booking", { surface: "mobile-sticky" })}>
          <strong>Đặt cast này</strong>
          <span>từ {priceLabel} / 60 phút</span>
        </Link>
      </section>
    );
  }

  return (
    <section className="cast-desktop-booking" data-testid="cast-booking-cta-desktop">
      <div className="cast-desktop-booking-actions">
        <Link href={bookingHref} className="cast-booking-button" onClick={() => onTrack?.("booking", { surface: "desktop-panel" })}>
          <strong>Đặt cast này</strong>
          <span>từ {priceLabel} / 60 phút</span>
        </Link>
        <Link
          href={storeHref}
          className="cast-secondary-button"
          onClick={() => onTrack?.("store", { surface: "booking-secondary" })}
        >
          Xem quán
        </Link>
      </div>
      <p>
        <Check size={14} strokeWidth={2} />
        Xác nhận trong 5 phút · Miễn phí huỷ trước 2 giờ
        {area ? ` · ${area}` : ""}
      </p>
    </section>
  );
}
