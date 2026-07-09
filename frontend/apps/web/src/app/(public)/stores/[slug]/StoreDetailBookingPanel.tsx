import Link from "next/link";
import { CalendarDays, Ticket } from "lucide-react";
import type { StoreActiveCoupon } from "@/lib/api/store-detail";
import { formatPriceTier } from "@/lib/price-tier";
import { formatDiscount } from "./store-detail.helpers";

type DateOption = {
  label: string;
  iso: string;
};

type StoreDetailBookingPanelProps = {
  startingFromVnd?: number | null;
  dateOptions: DateOption[];
  selectedDateIndex: number;
  selectedTime: string;
  timeOptions?: string[];
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

export function StoreDetailBookingPanel({
  startingFromVnd,
  dateOptions,
  selectedDateIndex,
  selectedTime,
  timeOptions = [],
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
        <strong>{formatPriceTier(startingFromVnd)}</strong>
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
        {timeOptions.length ? (
          timeOptions.map((time) => (
            <button
              key={time}
              type="button"
              className={time === selectedTime ? "slot active" : "slot"}
              onClick={() => onTimeSelect(time)}
            >
              {time}
            </button>
          ))
        ) : (
          <span className="slot-empty">Quán không có khung giờ đặt bàn trong ngày này.</span>
        )}
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
  startingFromVnd?: number | null;
  bookingHref: string;
  couponHref: string;
  firstCoupon?: StoreActiveCoupon | null;
  onBookingClick: (surface: string) => void;
  onCouponClick: (surface: string) => void;
};

type StoreDetailMobileBookingControlsProps = {
  dateOptions: DateOption[];
  selectedDateIndex: number;
  selectedTime: string;
  timeOptions?: string[];
  guestCount: number;
  onDateSelect: (index: number) => void;
  onTimeSelect: (time: string) => void;
  onGuestCountChange: (guestCount: number) => void;
};

export function StoreDetailMobileBookingControls({
  dateOptions,
  selectedDateIndex,
  selectedTime,
  timeOptions = [],
  guestCount,
  onDateSelect,
  onTimeSelect,
  onGuestCountChange,
}: StoreDetailMobileBookingControlsProps) {
  return (
    <section className="mobile-booking-controls" aria-label="Chọn thông tin đặt chỗ">
      <div className="mobile-booking-group">
        <h2>Chọn ngày</h2>
        <div className="mobile-booking-options">
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
      </div>
      <div className="mobile-booking-group">
        <h2>Khung giờ</h2>
        <div className="mobile-booking-options">
          {timeOptions.length ? (
            timeOptions.map((time) => (
              <button
                key={time}
                type="button"
                className={time === selectedTime ? "slot active" : "slot"}
                onClick={() => onTimeSelect(time)}
              >
                {time}
              </button>
            ))
          ) : (
            <span className="slot-empty">Quán không có khung giờ đặt bàn trong ngày này.</span>
          )}
        </div>
      </div>
      <div className="mobile-booking-group">
        <h2>Số khách</h2>
        <div className="mobile-booking-stepper">
        <button type="button" onClick={() => onGuestCountChange(Math.max(1, guestCount - 1))}>
          -
        </button>
          <strong>{guestCount} người</strong>
        <button type="button" onClick={() => onGuestCountChange(Math.min(20, guestCount + 1))}>
          +
        </button>
        </div>
      </div>
    </section>
  );
}

export function StoreDetailMobileCta({
  startingFromVnd,
  bookingHref,
  couponHref,
  firstCoupon,
  onBookingClick,
  onCouponClick,
}: StoreDetailMobileCtaProps) {
  return (
    <div className="mobile-cta">
      <div className="mobile-cta-summary">
        <span>Đặt bàn từ</span>
        <strong>{formatPriceTier(startingFromVnd)}</strong>
      </div>
      <div className="mobile-cta-actions">
        <Link
          data-testid="store-booking-cta-mobile"
          className="primary-action full"
          href={bookingHref}
          onClick={() => onBookingClick("mobile")}
        >
          Đặt chỗ ngay
        </Link>
        <Link className="secondary-action full" href={couponHref} onClick={() => onCouponClick("mobile")}>
          {firstCoupon ? `Coupon ${formatDiscount(firstCoupon)}` : "Coupon"}
        </Link>
      </div>
    </div>
  );
}
