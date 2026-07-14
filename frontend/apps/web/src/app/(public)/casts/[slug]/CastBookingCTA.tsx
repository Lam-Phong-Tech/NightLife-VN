import Link from "next/link";
import { Heart } from "lucide-react";
import type { CastProfile, CastProfileTrack } from "./cast-profile.types";

type CastBookingCTAProps = {
  profile: CastProfile;
  area: string;
  bookingHref: string;
  variant: "mobile" | "desktop";
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onTrack?: CastProfileTrack;
};

export function CastBookingCTA({
  bookingHref,
  variant,
  isFavorite = false,
  onToggleFavorite,
  onTrack,
}: CastBookingCTAProps) {
  if (variant === "mobile") {
    return (
      <section
        className="cast-booking-cta mobile nl-scroll-reveal-skip"
        data-no-scroll-reveal="true"
        data-testid="cast-booking-cta-mobile"
      >
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
        </Link>
      </section>
    );
  }

  return (
    <section className="cast-desktop-booking" data-testid="cast-booking-cta-desktop">
      <div className="cast-desktop-booking-actions">
        <Link href={bookingHref} className="cast-booking-button" onClick={() => onTrack?.("booking", { surface: "desktop-panel" })}>
          <strong>Đặt cast này</strong>
        </Link>
      </div>
    </section>
  );
}
