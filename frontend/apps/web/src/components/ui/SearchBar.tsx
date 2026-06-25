import React from 'react';
import Image from 'next/image';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  style?: React.CSSProperties;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  placeholder = "Tên quán, khu vực…", 
  onSearch, 
  style 
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '9px', background: '#f3f2f5', borderRadius: '12px', padding: '11px 13px', ...style }}>
      <Image src="https://img.icons8.com/ios/100/9A98A6/search.png" width={16} height={16} alt="Search" />
      <input 
        onInput={onSearch} 
        placeholder={placeholder} 
        style={{ flex: '1', border: 'none', fontSize: '13px', color: '#1f1d29', background: 'transparent', outline: 'none' }} 
      />
    </div>
  );
};
