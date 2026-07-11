"use client";

import { ConfigProvider, DatePicker, Select } from "antd";
import enUS from "antd/locale/en_US";
import jaJP from "antd/locale/ja_JP";
import koKR from "antd/locale/ko_KR";
import viVN from "antd/locale/vi_VN";
import zhCN from "antd/locale/zh_CN";
import dayjs from "dayjs";
import "dayjs/locale/en";
import "dayjs/locale/ja";
import "dayjs/locale/ko";
import "dayjs/locale/vi";
import "dayjs/locale/zh-cn";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  groupBookingTimeSlots,
  type BookingTimeSlotGroup,
  type BookingTimeSlotPeriod,
} from "@/lib/booking-time-slots";
import { translateText } from "@/lib/i18n/client-translations";
import {
  intlLocaleByLanguage,
  useActiveLanguage,
  type LanguageCode,
} from "@/lib/i18n/use-active-language";

dayjs.extend(customParseFormat);
dayjs.locale("vi");

const antdLocales = {
  vi: viVN,
  en: enUS,
  ja: jaJP,
  ko: koKR,
  zh: zhCN,
} as const;

const dayjsLocales: Record<LanguageCode, string> = {
  vi: "vi",
  en: "en",
  ja: "ja",
  ko: "ko",
  zh: "zh-cn",
};

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

const formatBookingDateLabel = (value: dayjs.Dayjs, language: LanguageCode) => {
  const label = new Intl.DateTimeFormat(intlLocaleByLanguage[language], {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  }).format(value.toDate());

  return language === "vi" ? label.charAt(0).toLocaleUpperCase("vi-VN") + label.slice(1) : label;
};

const translateNode = (value: ReactNode, language: LanguageCode) =>
  typeof value === "string" ? translateText(value, language) : value;

const translateSlotPeriod = (group: BookingTimeSlotGroup, language: LanguageCode) =>
  translateText(group.label, language);

const getDocumentBodyPopupContainer = (trigger: HTMLElement) => trigger.ownerDocument.body;

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
  const activeLanguage = useActiveLanguage();
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const currentDate = parseDate(dateValue) ?? parseDate(minDate) ?? dayjs();
  const min = parseDate(minDate) ?? dayjs();
  const max = parseDate(maxDate) ?? min.add(14, "day");
  const localizedDateLabel = translateNode(dateLabel, activeLanguage);
  const localizedTimeLabel = translateNode(timeLabel, activeLanguage);
  const localizedEmptyMessage = translateText(emptyMessage, activeLanguage);
  const loadingTimesText = translateText("Đang tải khung giờ...", activeLanguage);
  const selectDateText = translateText("Chọn ngày", activeLanguage);
  const selectTimeText = translateText("Chọn khung giờ", activeLanguage);
  const groups = useMemo(
    () => (timeOptionGroups?.length ? timeOptionGroups : groupBookingTimeSlots(timeOptions)),
    [timeOptionGroups, timeOptions],
  );
  const selectedTimePeriod = groups.find((group) => group.slots.includes(timeValue))?.key;
  const firstAvailablePeriod = groups.find((group) => group.slots.length)?.key ?? "morning";
  const [preferredPeriod, setPreferredPeriod] = useState<BookingTimeSlotPeriod>(
    selectedTimePeriod ?? firstAvailablePeriod,
  );
  const activePeriod =
    selectedTimePeriod ??
    (groups.find((group) => group.key === preferredPeriod)?.slots.length
      ? preferredPeriod
      : firstAvailablePeriod);
  const activeGroup =
    groups.find((group) => group.key === activePeriod) ??
    groups.find((group) => group.key === firstAvailablePeriod) ??
    groups[0];
  const activeTimeOptions = activeGroup?.slots ?? [];
  const options = activeTimeOptions.map((time) => ({ value: time, label: time }));
  const shouldDisableTime = disabled || loadingTimes || !activeTimeOptions.length;
  const selectedTimeValue = activeTimeOptions.includes(timeValue) ? timeValue : undefined;
  const periodTabs = groups;
  const showPeriodTabs = periodTabs.length > 1;
  const dateFieldClassName = [fieldClassName, "nl-booking-date-field"].filter(Boolean).join(" ");
  const timeFieldClassName = [
    fieldClassName,
    "nl-booking-time-field",
    showPeriodTabs ? "nl-booking-field-with-period-tabs" : "",
  ]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    dayjs.locale(dayjsLocales[activeLanguage]);
  }, [activeLanguage]);

  const selectPeriod = (period: BookingTimeSlotPeriod) => {
    const nextGroup = groups.find((group) => group.key === period);
    if (!nextGroup?.slots.length || disabled || loadingTimes) return;

    setPreferredPeriod(period);
    if (!nextGroup.slots.includes(timeValue)) {
      const nextTime = nextGroup.slots[0];
      if (nextTime) onTimeChange(nextTime);
    }
  };

  return (
    <ConfigProvider locale={antdLocales[activeLanguage]} theme={bookingPickerTheme}>
      <div
        className={["nl-booking-date-time", `nl-booking-date-time--${layout}`, className]
          .filter(Boolean)
          .join(" ")}
      >
        <div className={dateFieldClassName}>
          <span className={labelClassName}>{localizedDateLabel}</span>
          <DatePicker
            allowClear={false}
            autoComplete="off"
            className="nl-booking-ant-control nl-booking-ant-picker"
            disabled={disabled}
            disabledDate={(date) =>
              date ? date.isBefore(min, "day") || date.isAfter(max, "day") : false
            }
            format={(value) => formatBookingDateLabel(value, activeLanguage)}
            getPopupContainer={getDocumentBodyPopupContainer}
            inputReadOnly
            maxDate={max}
            minDate={min}
            onChange={(nextDate) => {
              if (!nextDate) return;
              onDateChange(nextDate.format("YYYY-MM-DD"));
              setDatePickerOpen(false);
            }}
            onOpenChange={(open) => setDatePickerOpen(open && !disabled)}
            open={isDatePickerOpen && !disabled}
            placeholder={selectDateText}
            popupClassName="nl-booking-ant-popup"
            value={currentDate}
          />
        </div>

        <div className={timeFieldClassName}>
          <span className={labelClassName}>{localizedTimeLabel}</span>
          <div className="nl-booking-time-control">
            <div
              className="nl-booking-period-tabs"
              role="tablist"
              aria-label={translateText("Chọn buổi đặt bàn", activeLanguage)}
            >
              {periodTabs.map((group) => {
                const isActive = Boolean(group.slots.length) && group.key === activeGroup?.key;
                const isDisabled = disabled || loadingTimes || !group.slots.length;

                return (
                  <button
                    key={group.key}
                    type="button"
                    className={`nl-booking-period-tab${isActive ? " is-active" : ""}`}
                    aria-selected={isActive}
                    aria-disabled={isDisabled}
                    disabled={isDisabled}
                    role="tab"
                    onClick={() => selectPeriod(group.key)}
                  >
                    {translateSlotPeriod(group, activeLanguage)}
                  </button>
                );
              })}
            </div>
            <Select
              className="nl-booking-ant-control nl-booking-ant-select"
              disabled={shouldDisableTime}
              getPopupContainer={getDocumentBodyPopupContainer}
              loading={loadingTimes}
              notFoundContent={loadingTimes ? loadingTimesText : localizedEmptyMessage}
              onChange={onTimeChange}
              options={options}
              placeholder={loadingTimes ? loadingTimesText : selectTimeText}
              popupClassName="nl-booking-select-popup"
              value={selectedTimeValue}
            />
          </div>
          {!loadingTimes && !activeTimeOptions.length ? (
            <span className="nl-booking-empty-message">{localizedEmptyMessage}</span>
          ) : null}
        </div>
      </div>
    </ConfigProvider>
  );
}
