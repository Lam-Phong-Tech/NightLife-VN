import Link from "next/link";
import { CalendarDays, Ticket } from "lucide-react";
import type { StoreActiveCoupon } from "@/lib/api/store-detail";
import { formatDiscount, formatVnd } from "./store-detail.helpers";

type DateOption = {
  label: string;
  iso: string;
};

type StoreDetailBookingPanelProps = {
  startingFromVnd?: number | null;
  dateOptions: DateOption[];
  selectedDateIndex: number;
  selectedTime: string;
  guestCount: number;
  bookingHref: string;
  couponHref: string;
  firstCoupon?: StoreActiveCoupon | null;
  onDateSelect: (index: number) => void;
  onTimeSelect: (time: string) => void;
  onGuestCountChange: (guestCount: number) => void;
  onBookingClick: (surface: string) => void;
  onCouponClick: (surface: string) => void;
};

const bookingTimes = ["20:00", "21:00", "22:00", "23:00"];

export function StoreDetailBookingPanel({
  startingFromVnd,
  dateOptions,
  selectedDateIndex,
  selectedTime,
  guestCount,
  bookingHref,
  couponHref,
  firstCoupon,
  onDateSelect,
  onTimeSelect,
  onGuestCountChange,
  onBookingClick,
  onCouponClick,
}: StoreDetailBookingPanelProps) {
  return (
    <aside className="booking-panel">
      <div className="booking-title">
        <span>Đặt chỗ từ</span>
        <strong>{formatVnd(startingFromVnd)}</strong>
      </div>
      <label>Chọn ngày</label>
      <div className="slot-row">
        {dateOptions.map((date, index) => (
          <button
            key={date.iso}
            type="button"
            className={index === selectedDateIndex ? "slot active" : "slot"}
            onClick={() => onDateSelect(index)}
          >
            {date.label}
          </button>
        ))}
      </div>
      <label>Khung giờ</label>
      <div className="slot-row">
        {bookingTimes.map((time) => (
          <button
            key={time}
            type="button"
            className={time === selectedTime ? "slot active" : "slot"}
            onClick={() => onTimeSelect(time)}
          >
            {time}
          </button>
        ))}
      </div>
      <label>Số khách</label>
      <div className="guest-stepper">
        <button type="button" onClick={() => onGuestCountChange(Math.max(1, guestCount - 1))}>
          -
        </button>
        <strong>{guestCount} người</strong>
        <button type="button" onClick={() => onGuestCountChange(Math.min(20, guestCount + 1))}>
          +
        </button>
      </div>
      <Link
        data-testid="store-booking-cta-sidebar"
        className="primary-action full"
        href={bookingHref}
        onClick={() => onBookingClick("sidebar")}
      >
        <CalendarDays size={18} />
        Đặt chỗ ngay
      </Link>
      <Link
        data-testid="store-coupon-cta-sidebar"
        className="secondary-action full"
        href={couponHref}
        onClick={() => onCouponClick("sidebar")}
      >
        <Ticket size={18} />
        {firstCoupon ? `Coupon ${formatDiscount(firstCoupon)}` : "Ưu đãi của quán"}
      </Link>
    </aside>
  );
}

type StoreDetailMobileCtaProps = {
  bookingHref: string;
  couponHref: string;
  onBookingClick: (surface: string) => void;
  onCouponClick: (surface: string) => void;
};

export function StoreDetailMobileCta({
  bookingHref,
  couponHref,
  onBookingClick,
  onCouponClick,
}: StoreDetailMobileCtaProps) {
  return (
    <div className="mobile-cta">
      <Link
        data-testid="store-booking-cta-mobile"
        className="primary-action full"
        href={bookingHref}
        onClick={() => onBookingClick("mobile")}
      >
        Đặt chỗ
      </Link>
      <Link className="secondary-action full" href={couponHref} onClick={() => onCouponClick("mobile")}>
        Coupon
      </Link>
    </div>
  );
}
