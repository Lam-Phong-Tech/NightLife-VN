"use client";

import { ConfigProvider, DatePicker, Select } from "antd";
import viVN from "antd/locale/vi_VN";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  groupBookingTimeSlots,
  type BookingTimeSlotGroup,
  type BookingTimeSlotPeriod,
} from "@/lib/booking-time-slots";

dayjs.extend(customParseFormat);
dayjs.locale("vi");

type BookingDateTimeFieldsProps = {
  dateLabel?: ReactNode;
  timeLabel?: ReactNode;
  dateValue: string;
  timeValue: string;
  timeOptions: string[];
  timeOptionGroups?: BookingTimeSlotGroup[];
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
  timeOptionGroups,
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
  const groups = useMemo(
    () => (timeOptionGroups?.length ? timeOptionGroups : groupBookingTimeSlots(timeOptions)),
    [timeOptionGroups, timeOptions],
  );
  const selectedTimePeriod = groups.find((group) => group.slots.includes(timeValue))?.key;
  const firstAvailablePeriod = groups.find((group) => group.slots.length)?.key ?? "morning";
  const [activePeriod, setActivePeriod] = useState<BookingTimeSlotPeriod>(
    selectedTimePeriod ?? firstAvailablePeriod,
  );
  const activeGroup =
    groups.find((group) => group.key === activePeriod) ??
    groups.find((group) => group.key === firstAvailablePeriod) ??
    groups[0];
  const activeTimeOptions = activeGroup?.slots ?? [];
  const options = activeTimeOptions.map((time) => ({ value: time, label: time }));
  const shouldDisableTime = disabled || loadingTimes || !activeTimeOptions.length;
  const selectedTimeValue = activeTimeOptions.includes(timeValue) ? timeValue : undefined;
  const periodTabs = groups.filter((group) => group.slots.length);
  const showPeriodTabs = periodTabs.length > 1;
  const timeFieldClassName = [fieldClassName, showPeriodTabs ? "nl-booking-field-with-period-tabs" : ""]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    setActivePeriod((current) => {
      if (selectedTimePeriod) return selectedTimePeriod;
      if (groups.find((group) => group.key === current)?.slots.length) return current;
      return firstAvailablePeriod;
    });
  }, [firstAvailablePeriod, groups, selectedTimePeriod]);

  const selectPeriod = (period: BookingTimeSlotPeriod) => {
    const nextGroup = groups.find((group) => group.key === period);
    if (!nextGroup?.slots.length || disabled || loadingTimes) return;

    setActivePeriod(period);
    if (!nextGroup.slots.includes(timeValue)) {
      const nextTime = nextGroup.slots[0];
      if (nextTime) onTimeChange(nextTime);
    }
  };

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

        <label className={timeFieldClassName}>
          <span className={labelClassName}>{timeLabel}</span>
          <div className="nl-booking-period-tabs" role="tablist" aria-label="Chọn buổi đặt bàn">
            {periodTabs.map((group) => {
              const isActive = group.key === activeGroup?.key;

              return (
                <button
                  key={group.key}
                  type="button"
                  className={`nl-booking-period-tab${isActive ? " is-active" : ""}`}
                  aria-selected={isActive}
                  role="tab"
                  onClick={() => selectPeriod(group.key)}
                >
                  {group.label}
                </button>
              );
            })}
          </div>
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
          {!loadingTimes && !activeTimeOptions.length ? (
            <span className="nl-booking-empty-message">{emptyMessage}</span>
          ) : null}
        </label>
      </div>
    </ConfigProvider>
  );
}
