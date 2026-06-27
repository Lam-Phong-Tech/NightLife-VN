import Image from 'next/image';
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
        background: 'rgba(255,255,255,.045)',
        border: '1px solid rgba(212,178,106,.22)',
        borderRadius: '12px',
        padding: '11px 13px',
        ...style,
      }}
    >
      <Image
        src="https://img.icons8.com/ios/100/D4B26A/search.png"
        width={16}
        height={16}
        alt="Search"
      />
      <input
        value={value}
        onChange={onSearch}
        placeholder={placeholder}
        style={{
          flex: '1',
          border: 'none',
          fontSize: '13px',
          color: '#f3f0ea',
          background: 'transparent',
          outline: 'none',
          ...inputStyle,
        }}
      />
    </div>
  );
};
