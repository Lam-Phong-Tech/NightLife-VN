export type BookingConfirmationFlashTone = "success" | "info" | "warning" | "error" | "gold";

export type BookingConfirmationFlashToast = {
  tone: BookingConfirmationFlashTone;
  title: string;
  description?: string;
  durationMs?: number;
};

const bookingConfirmationFlashKey = "nightlife:booking-confirmation-flash";

export const writeBookingConfirmationFlashToast = (toast: BookingConfirmationFlashToast) => {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(bookingConfirmationFlashKey, JSON.stringify(toast));
  } catch {
    // Flash toast is a convenience after redirect; failing storage must not block the flow.
  }
};

export const readBookingConfirmationFlashToast = (): BookingConfirmationFlashToast | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(bookingConfirmationFlashKey);
    window.sessionStorage.removeItem(bookingConfirmationFlashKey);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<BookingConfirmationFlashToast>;
    if (!parsed || typeof parsed.title !== "string" || !parsed.title.trim()) return null;

    return {
      tone: parsed.tone ?? "success",
      title: parsed.title,
      description: typeof parsed.description === "string" ? parsed.description : undefined,
      durationMs: typeof parsed.durationMs === "number" ? parsed.durationMs : undefined,
    };
  } catch {
    try {
      window.sessionStorage.removeItem(bookingConfirmationFlashKey);
    } catch {
      // Ignore cleanup failures.
    }
    return null;
  }
};
