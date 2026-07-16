import Link from "next/link";
import { Heart } from "lucide-react";
import { translateText } from "@/lib/i18n/client-translations";
import type { LanguageCode } from "@/lib/i18n/use-active-language";
import { isServiceOnlyBookingCategory } from "@/lib/store-categories";
import { getCastProfileCopy } from "./cast-profile.copy";
import type { CastProfile, CastProfileTrack } from "./cast-profile.types";

type CastBookingCTAProps = {
  profile: CastProfile;
  area: string;
  bookingHref: string;
  variant: "mobile" | "desktop";
  language: LanguageCode;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onTrack?: CastProfileTrack;
};

export function CastBookingCTA({
  profile,
  bookingHref,
  variant,
  language,
  isFavorite = false,
  onToggleFavorite,
  onTrack,
}: CastBookingCTAProps) {
  const copy = getCastProfileCopy(language);
  const bookingLabel = isServiceOnlyBookingCategory(profile.store.category)
    ? translateText("Đặt chỗ tại quán", language)
    : copy.bookThisCast;

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
          aria-label={isFavorite ? copy.removeFavorite : copy.favorite}
          aria-pressed={isFavorite}
          onClick={onToggleFavorite}
        >
          <Heart size={19} strokeWidth={1.9} fill={isFavorite ? "currentColor" : "none"} />
        </button>
        <Link
          href={bookingHref}
          className="cast-booking-button"
          onClick={() => onTrack?.("booking", { surface: "mobile-sticky" })}
        >
          <strong>{bookingLabel}</strong>
        </Link>
      </section>
    );
  }

  return (
    <section className="cast-desktop-booking" data-testid="cast-booking-cta-desktop">
      <div className="cast-desktop-booking-actions">
        <Link
          href={bookingHref}
          className="cast-booking-button"
          onClick={() => onTrack?.("booking", { surface: "desktop-panel" })}
        >
          <strong>{bookingLabel}</strong>
        </Link>
      </div>
    </section>
  );
}
