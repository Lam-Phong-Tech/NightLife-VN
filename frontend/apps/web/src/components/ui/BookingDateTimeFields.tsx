"use client";

import { ConfigProvider, DatePicker, Select } from "antd";
import viVN from "antd/locale/vi_VN";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import customParseFormat from "dayjs/plugin/customParseFormat";
import type { ReactNode } from "react";

dayjs.extend(customParseFormat);
dayjs.locale("vi");

type BookingDateTimeFieldsProps = {
  dateLabel?: ReactNode;
  timeLabel?: ReactNode;
  dateValue: string;
  timeValue: string;
  timeOptions: string[];
  minDate: string;
  maxDate: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  loadingTimes?: boolean;
  emptyMessage?: string;
  className?: string;
  fieldClassName?: string;
  labelClassName?: string;
  layout?: "grid" | "stack";
  disabled?: boolean;
};

const bookingPickerTheme = {
  token: {
    colorPrimary: "var(--vy-gold)",
    colorBgContainer: "var(--vy-surface-2)",
    colorBgElevated: "var(--vy-surface)",
    colorBorder: "var(--vy-border-gold-22)",
    colorText: "var(--vy-text)",
    colorTextPlaceholder: "var(--vy-faint)",
    colorTextDisabled: "var(--vy-muted)",
    borderRadius: 12,
    controlHeight: 46,
    fontFamily: "inherit",
  },
  components: {
    DatePicker: {
      activeBorderColor: "var(--vy-gold)",
      hoverBorderColor: "var(--vy-border-gold-40)",
      cellActiveWithRangeBg: "var(--vy-gold-soft-bg)",
    },
    Select: {
      activeBorderColor: "var(--vy-gold)",
      hoverBorderColor: "var(--vy-border-gold-40)",
      optionActiveBg: "var(--vy-gold-soft-bg)",
      optionSelectedBg: "var(--vy-gold-soft-bg)",
      optionSelectedColor: "var(--vy-gold-hi)",
    },
  },
} as const;

const parseDate = (value: string) => {
  const parsed = dayjs(value, "YYYY-MM-DD", true);
  return parsed.isValid() ? parsed : null;
};

const formatBookingDateLabel = (value: dayjs.Dayjs) => {
  const label = value.format("dddd, DD/MM");
  return label.charAt(0).toLocaleUpperCase("vi-VN") + label.slice(1);
};

export function BookingDateTimeFields({
  dateLabel = "Ngày",
  timeLabel = "Khung giờ",
  dateValue,
  timeValue,
  timeOptions,
  minDate,
  maxDate,
  onDateChange,
  onTimeChange,
  loadingTimes = false,
  emptyMessage = "Quán không có khung giờ đặt bàn trong ngày này.",
  className,
  fieldClassName,
  labelClassName,
  layout = "grid",
  disabled = false,
}: BookingDateTimeFieldsProps) {
  const currentDate = parseDate(dateValue) ?? parseDate(minDate) ?? dayjs();
  const min = parseDate(minDate) ?? dayjs();
  const max = parseDate(maxDate) ?? min.add(14, "day");
  const options = timeOptions.map((time) => ({ value: time, label: time }));
  const shouldDisableTime = disabled || loadingTimes || !timeOptions.length;
  const selectedTimeValue = timeOptions.includes(timeValue) ? timeValue : undefined;

  return (
    <ConfigProvider locale={viVN} theme={bookingPickerTheme}>
      <div
        className={["nl-booking-date-time", `nl-booking-date-time--${layout}`, className]
          .filter(Boolean)
          .join(" ")}
      >
        <label className={fieldClassName}>
          <span className={labelClassName}>{dateLabel}</span>
          <DatePicker
            allowClear={false}
            autoComplete="off"
            className="nl-booking-ant-control nl-booking-ant-picker"
            disabled={disabled}
            disabledDate={(date) =>
              date ? date.isBefore(min, "day") || date.isAfter(max, "day") : false
            }
            format={formatBookingDateLabel}
            getPopupContainer={(trigger) => trigger.parentElement ?? document.body}
            inputReadOnly
            maxDate={max}
            minDate={min}
            onChange={(nextDate) => {
              if (!nextDate) return;
              onDateChange(nextDate.format("YYYY-MM-DD"));
            }}
            placeholder="Chọn ngày"
            popupClassName="nl-booking-ant-popup"
            value={currentDate}
          />
        </label>

        <label className={fieldClassName}>
          <span className={labelClassName}>{timeLabel}</span>
          <Select
            className="nl-booking-ant-control nl-booking-ant-select"
            disabled={shouldDisableTime}
            getPopupContainer={(trigger) => trigger.parentElement ?? document.body}
            loading={loadingTimes}
            notFoundContent={loadingTimes ? "Đang tải khung giờ..." : emptyMessage}
            onChange={onTimeChange}
            options={options}
            placeholder={loadingTimes ? "Đang tải khung giờ..." : "Chọn khung giờ"}
            popupClassName="nl-booking-select-popup"
            value={selectedTimeValue}
          />
          {!loadingTimes && !timeOptions.length ? (
            <span className="nl-booking-empty-message">{emptyMessage}</span>
          ) : null}
        </label>
      </div>
    </ConfigProvider>
  );
}
