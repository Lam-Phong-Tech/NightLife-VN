'use client';

import React from 'react';
import { ConfigProvider, DatePicker } from 'antd';
import viVN from 'antd/locale/vi_VN';
import dayjs from 'dayjs';
import { CalendarDays } from 'lucide-react';

const colors = {
  surface2: 'var(--partner-surface-2, rgba(255,255,255,.04))',
  borderGold22: 'var(--partner-border-gold-22, rgba(212,178,106,.22))',
  borderGold32: 'var(--partner-border-gold-32, rgba(212,178,106,.32))',
  text: 'var(--partner-text, #f3f0ea)',
  muted: 'var(--partner-muted, #8c8679)',
  gold: 'var(--partner-gold, #d4b26a)',
  goldBright: 'var(--partner-gold-bright, #e3c27e)',
};

export interface ThemedDatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  ariaLabel?: string;
  style?: React.CSSProperties;
  className?: string;
  inputReadOnly?: boolean;
  getPopupContainer?: (node: HTMLElement) => HTMLElement;
}

export function ThemedDatePicker({
  value,
  onChange,
  placeholder = 'YYYY-MM-DD',
  disabled = false,
  allowClear = true,
  ariaLabel,
  style,
  className,
  inputReadOnly = true,
  getPopupContainer,
}: ThemedDatePickerProps) {
  const dayjsValue = value && dayjs(value).isValid() ? dayjs(value) : null;

  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: '#d4b26a',
          colorBgContainer: 'rgba(255,255,255,.04)',
          colorBgElevated: '#1c1b1f',
          colorText: '#f3f0ea',
          colorTextDescription: '#c5c0b6',
          colorTextHeading: '#f3f0ea',
          colorTextPlaceholder: '#8c8679',
          colorBorder: 'rgba(212,178,106,.22)',
          borderRadius: 11,
          controlHeight: 44,
        },
        components: {
          DatePicker: {
            activeBorderColor: '#d4b26a',
            hoverBorderColor: 'rgba(212,178,106,.55)',
            cellActiveWithRangeBg: 'rgba(212,178,106,.15)',
            cellHoverWithRangeBg: 'rgba(212,178,106,.15)',
          },
        },
      }}
    >
      <DatePicker
        value={dayjsValue}
        onChange={(nextDate) => {
          if (!nextDate) {
            onChange('');
          } else {
            onChange(nextDate.format('YYYY-MM-DD'));
          }
        }}
        format="YYYY-MM-DD"
        placeholder={placeholder}
        disabled={disabled}
        allowClear={allowClear}
        inputReadOnly={inputReadOnly}
        getPopupContainer={(triggerNode) =>
          getPopupContainer ? getPopupContainer(triggerNode) : (triggerNode?.parentElement || document.body)
        }
        aria-label={ariaLabel}
        className={className}
        suffixIcon={<CalendarDays size={16} style={{ color: colors.goldBright }} />}
        style={{
          width: '100%',
          minHeight: '44px',
          background: colors.surface2,
          border: `1px solid ${colors.borderGold22}`,
          borderRadius: '11px',
          color: colors.text,
          ...style,
        }}
      />
    </ConfigProvider>
  );
}
