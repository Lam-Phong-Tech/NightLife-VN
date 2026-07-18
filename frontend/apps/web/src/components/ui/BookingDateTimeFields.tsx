"use client";

import { ConfigProvider, DatePicker } from "antd";
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
import { ChevronDown } from "lucide-react";
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
dayjs.locale("ja");

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
  dateFieldAddon?: ReactNode;
  dateError?: ReactNode;
  timeLabel?: ReactNode;
  timeError?: ReactNode;
  dateValue: string;
  timeValue: string;
  timeOptions: string[];
  disabledTimeOptions?: string[];
  timeOptionGroups?: BookingTimeSlotGroup[];
  minDate: string;
  maxDate: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  loadingTimes?: boolean;
  emptyMessage?: string;
  errorClassName?: string;
  className?: string;
  fieldClassName?: string;
  labelClassName?: string;
  layout?: "grid" | "stack";
  errorPlacement?: "inside" | "outside";
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
      activeBorderColor: "var(--vy-border-gold-22)",
      hoverBorderColor: "var(--vy-border-gold-40)",
      cellActiveWithRangeBg: "var(--vy-gold-soft-bg)",
    },
    Select: {
      activeBorderColor: "var(--vy-border-gold-22)",
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
  dateFieldAddon,
  dateError,
  timeLabel = "Khung giờ",
  timeError,
  dateValue,
  timeValue,
  timeOptions,
  disabledTimeOptions = [],
  timeOptionGroups,
  minDate,
  maxDate,
  onDateChange,
  onTimeChange,
  loadingTimes = false,
  emptyMessage = "Quán không có khung giờ đặt bàn trong ngày này.",
  errorClassName,
  className,
  fieldClassName,
  labelClassName,
  layout = "grid",
  errorPlacement = "inside",
  disabled = false,
}: BookingDateTimeFieldsProps) {
  const activeLanguage = useActiveLanguage();
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const [isTimeMenuOpen, setTimeMenuOpen] = useState(false);
  const currentDate = parseDate(dateValue) ?? parseDate(minDate) ?? dayjs();
  const min = parseDate(minDate) ?? dayjs();
  const max = parseDate(maxDate) ?? min.add(14, "day");
  const localizedDateLabel = translateNode(dateLabel, activeLanguage);
  const localizedTimeLabel = translateNode(timeLabel, activeLanguage);
  const localizedDateError = translateNode(dateError, activeLanguage);
  const localizedTimeError = translateNode(timeError, activeLanguage);
  const localizedEmptyMessage = translateText(emptyMessage, activeLanguage);
  const loadingTimesText = translateText("Đang tải khung giờ...", activeLanguage);
  const selectDateText = translateText("Chọn ngày", activeLanguage);
  const selectTimeText = translateText("Chọn khung giờ", activeLanguage);
  const hasTimeOptionGroups = Boolean(timeOptionGroups?.length);
  const groups = useMemo(
    () => (timeOptionGroups?.length ? timeOptionGroups : groupBookingTimeSlots(timeOptions)),
    [timeOptionGroups, timeOptions],
  );
  const disabledTimeOptionSet = useMemo(
    () => new Set(disabledTimeOptions),
    [disabledTimeOptions],
  );
  const selectedTimePeriod = hasTimeOptionGroups
    ? groups.find((group) => group.slots.includes(timeValue))?.key
    : undefined;
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
  const activeTimeOptions = hasTimeOptionGroups ? activeGroup?.slots ?? [] : timeOptions;
  const options = activeTimeOptions.map((time) => ({
    value: time,
    label: time,
    disabled: disabledTimeOptionSet.has(time),
  }));
  const shouldDisableTime = disabled || loadingTimes || !activeTimeOptions.length;
  const selectedTimeValue =
    activeTimeOptions.includes(timeValue) && !disabledTimeOptionSet.has(timeValue)
      ? timeValue
      : undefined;
  const selectedTimeLabel = options.find((option) => option.value === selectedTimeValue)?.label;
  const periodTabs = groups;
  const showPeriodTabs = hasTimeOptionGroups && periodTabs.length > 1;
  const dateFieldClassName = [fieldClassName, "nl-booking-date-field"].filter(Boolean).join(" ");
  const fieldErrorClassName = ["nl-booking-field-error", errorClassName]
    .filter(Boolean)
    .join(" ");
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

  useEffect(() => {
    setTimeMenuOpen(false);
  }, [activeLanguage, disabled, loadingTimes, selectedTimeValue, activeTimeOptions.length]);

  const selectPeriod = (period: BookingTimeSlotPeriod) => {
    const nextGroup = groups.find((group) => group.key === period);
    if (!nextGroup?.slots.length || disabled || loadingTimes) return;

    const nextEnabledTime = nextGroup.slots.find((time) => !disabledTimeOptionSet.has(time));

    setPreferredPeriod(period);
    if (nextEnabledTime && !nextGroup.slots.includes(timeValue)) {
      onTimeChange(nextEnabledTime);
    }
  };

  const dateErrorNode = dateError || errorPlacement === "outside" ? (
    <span
      className={`${fieldErrorClassName}${dateError ? "" : " is-empty"}`}
      aria-live="polite"
      aria-hidden={dateError ? undefined : true}
    >
      {dateError ? localizedDateError : ""}
    </span>
  ) : null;
  const timeErrorNode = timeError || errorPlacement === "outside" ? (
    <span
      className={`${fieldErrorClassName}${timeError ? "" : " is-empty"}`}
      aria-live="polite"
      aria-hidden={timeError ? undefined : true}
    >
      {timeError ? localizedTimeError : ""}
    </span>
  ) : null;
  const dateField = (
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
        placement="bottomLeft"
        placeholder={selectDateText}
        popupClassName="nl-booking-ant-popup"
        value={currentDate}
      />
      {errorPlacement === "inside" ? dateErrorNode : null}
      {dateFieldAddon ? (
        <div className="nl-booking-date-addon">{dateFieldAddon}</div>
      ) : null}
    </div>
  );
  const timeField = (
    <div className={timeFieldClassName}>
      <span className={labelClassName}>{localizedTimeLabel}</span>
      <div className="nl-booking-time-control">
        {showPeriodTabs ? (
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
        ) : null}
        <div
          className={`nl-booking-time-select${isTimeMenuOpen ? " is-open" : ""}`}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setTimeMenuOpen(false);
            }
          }}
        >
          <button
            type="button"
            className="nl-booking-time-trigger"
            aria-haspopup="listbox"
            aria-expanded={isTimeMenuOpen}
            disabled={shouldDisableTime}
            onClick={() => {
              if (shouldDisableTime) return;
              setTimeMenuOpen((current) => !current);
            }}
          >
            <span className={selectedTimeLabel ? "" : "is-placeholder"}>
              {selectedTimeLabel ?? (loadingTimes ? loadingTimesText : selectTimeText)}
            </span>
            <ChevronDown size={16} aria-hidden="true" />
          </button>

          {isTimeMenuOpen ? (
            <div className="nl-booking-time-menu" role="listbox" aria-label={selectTimeText}>
              {options.length ? (
                options.map((option) => {
                  const isSelected = option.value === selectedTimeValue;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={[
                        isSelected ? "is-selected" : "",
                        option.disabled ? "is-disabled" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      role="option"
                      aria-disabled={option.disabled}
                      aria-selected={isSelected}
                      disabled={option.disabled}
                      onClick={() => {
                        if (option.disabled) return;
                        onTimeChange(option.value);
                        setTimeMenuOpen(false);
                      }}
                    >
                      <span>{option.label}</span>
                      {option.disabled ? (
                        <small>{translateText("ÄÃ£ qua", activeLanguage)}</small>
                      ) : null}
                    </button>
                  );
                })
              ) : (
                <span className="nl-booking-time-empty">{localizedEmptyMessage}</span>
              )}
            </div>
          ) : null}
        </div>
      </div>
      {!timeError && !loadingTimes && !activeTimeOptions.length ? (
        <span className="nl-booking-empty-message">{localizedEmptyMessage}</span>
      ) : null}
      {errorPlacement === "inside" ? timeErrorNode : null}
    </div>
  );

  return (
    <ConfigProvider locale={antdLocales[activeLanguage]} theme={bookingPickerTheme}>
      <div
        className={["nl-booking-date-time", `nl-booking-date-time--${layout}`, className]
          .filter(Boolean)
          .join(" ")}
      >
        {errorPlacement === "outside" ? (
          <div className="nl-booking-field-stack">
            {dateField}
            {dateErrorNode}
          </div>
        ) : dateField}

        {errorPlacement === "outside" ? (
          <div className="nl-booking-field-stack">
            {timeField}
            {timeErrorNode}
          </div>
        ) : timeField}
      </div>
    </ConfigProvider>
  );
}
