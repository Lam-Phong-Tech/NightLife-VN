import { Search } from 'lucide-react';
import React from 'react';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onSearch?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Tên quán, khu vực...',
  value,
  onSearch,
  style,
  inputStyle,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '9px',
        background: 'var(--vy-surface-2)',
        border: '1px solid var(--vy-border-gold-22)',
        borderRadius: '12px',
        padding: '11px 13px',
        ...style,
      }}
    >
      <Search size={16} strokeWidth={2.5} color="var(--vy-gold)" />
      <input
        value={value}
        onChange={onSearch}
        placeholder={placeholder}
        style={{
          flex: '1',
          border: 'none',
          fontSize: '13px',
          color: 'var(--vy-text)',
          background: 'transparent',
          outline: 'none',
          ...inputStyle,
        }}
      />
    </div>
  );
};
