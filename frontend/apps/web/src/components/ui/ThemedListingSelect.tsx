'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const colors = {
  bg: 'var(--partner-bg, #0c0c0f)',
  surface1: 'var(--partner-surface-1, rgba(255,255,255,.035))',
  surface2: 'var(--partner-surface-2, rgba(255,255,255,.04))',
  surface3: 'var(--partner-surface-3, rgba(255,255,255,.05))',
  navBg: 'var(--partner-nav-bg, rgba(8,8,11,.9))',
  headerBg: 'var(--partner-header-bg, rgba(12,12,15,.72))',
  popoverBg: 'var(--partner-popover-bg, linear-gradient(180deg,rgba(28,27,31,.98),rgba(12,12,15,.98)))',
  activeControlBg: 'var(--partner-active-control-bg, rgba(212,178,106,.16))',
  borderSoft: 'var(--partner-border-soft, rgba(255,255,255,.06))',
  borderHair: 'var(--partner-border-hair, rgba(255,255,255,.08))',
  borderGold12: 'var(--partner-border-gold-12, rgba(212,178,106,.18))',
  borderGold22: 'var(--partner-border-gold-22, rgba(212,178,106,.22))',
  borderGold32: 'var(--partner-border-gold-32, rgba(212,178,106,.32))',
  borderGold40: 'var(--partner-border-gold-40, rgba(212,178,106,.4))',
  text: 'var(--partner-text, #f3f0ea)',
  text2: 'var(--partner-text-2, #c5c0b6)',
  muted: 'var(--partner-muted, #8c8679)',
  onGold: 'var(--partner-on-gold, #241a0a)',
  gold: 'var(--partner-gold, #d4b26a)',
  goldBright: 'var(--partner-gold-bright, #e3c27e)',
  goldPale: 'var(--partner-gold-pale, #f0dda8)',
  goldGrad: 'var(--partner-gold-grad, linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a))',
  danger: 'var(--partner-danger, #ffb4a8)',
  success: 'var(--partner-success, #8de6b0)',
  neonPink: 'var(--partner-neon-pink, #e0729e)',
};

export function ThemedListingSelect({
  value,
  onChange,
  placeholder,
  options,
  hasError,
  disabled,
  ariaLabel,
  compact,
  style,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
  hasError?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  compact?: boolean;
  style?: React.CSSProperties;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);

  return (
    <div
      onBlur={(event) => {
        const nextFocus = event.relatedTarget;
        if (!nextFocus || !event.currentTarget.contains(nextFocus as Node)) {
          setIsOpen(false);
        }
      }}
      style={{
        position: 'relative',
        minWidth: compact ? '96px' : undefined,
        ...style,
      }}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((current) => (disabled ? false : !current))}
        aria-label={ariaLabel ?? placeholder}
        aria-expanded={isOpen}
        style={{
          width: '100%',
          minHeight: compact ? '34px' : '44px',
          border: `1px solid ${hasError ? colors.danger : colors.borderGold22}`,
          borderRadius: compact ? '9px' : '12px',
          background: colors.surface2,
          color: selectedOption ? colors.text : colors.muted,
          font: 'inherit',
          fontSize: compact ? '12px' : '13px',
          fontWeight: 900,
          padding: compact ? '0 8px' : '0 12px',
          outline: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          opacity: disabled ? 0.65 : 1,
          textAlign: 'left',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown
          size={compact ? 14 : 16}
          style={{ flex: '0 0 auto', color: colors.goldBright }}
        />
      </button>
      {isOpen && !disabled ? (
        <div
          className="partner-themed-select-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 180,
            maxHeight: compact ? '220px' : '280px',
            overflowY: 'auto',
            border: `1px solid ${colors.borderGold32}`,
            borderRadius: '12px',
            background: colors.popoverBg,
            boxShadow: '0 24px 50px -26px rgba(0,0,0,.86)',
            padding: '6px',
          }}
        >
          {options.length ? (
            options.map((option) => {
              const selected = option.value === value;
              return (
                <button
                  key={`${option.value}-${option.label}`}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  style={{
                    width: '100%',
                    minHeight: compact ? '32px' : '36px',
                    border: 0,
                    borderRadius: '9px',
                    background: selected ? colors.goldGrad : 'transparent',
                    color: selected ? colors.onGold : colors.text,
                    font: 'inherit',
                    fontSize: compact ? '12px' : '12.5px',
                    fontWeight: selected ? 900 : 800,
                    textAlign: 'left',
                    padding: '0 10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {option.label}
                  </span>
                </button>
              );
            })
          ) : (
            <div style={{ padding: '10px', color: colors.muted, fontSize: '12px', fontWeight: 800 }}>
              Chưa có dữ liệu
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
