import type { BookingValidationField } from "@/lib/booking-field-validation";

export type BookingFieldScrollSelectors = Record<BookingValidationField, string>;

export function scrollBookingValidationFieldIntoView(
  field: BookingValidationField,
  selectors: BookingFieldScrollSelectors,
) {
  if (typeof window === "undefined" || !window.matchMedia("(max-width: 767px)").matches) return;

  window.requestAnimationFrame(() => {
    const target = document.querySelector<HTMLElement>(selectors[field]);
    const scrollTarget =
      target?.closest<HTMLElement>(
        "[data-booking-validation-field], .booking-field-stack, .booking-field, .booking-note-label, label",
      ) ?? target;

    scrollTarget?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}
