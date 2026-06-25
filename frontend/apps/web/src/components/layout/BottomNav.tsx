import React from 'react';
import Link from 'next/link';
import { CalendarDays, Home, Search, Ticket, UserRound } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Trang chủ', icon: Home, active: true },
  { href: '/danh-sach-quan', label: 'Tìm quán', icon: Search },
  { href: '/uu-dai', label: 'Ưu đãi', icon: Ticket },
  { href: '/lich-su-dat-cho', label: 'Đặt chỗ', icon: CalendarDays },
  { href: '/tai-khoan', label: 'Tài khoản', icon: UserRound },
];

export const BottomNav: React.FC = () => {
  return (
    <div style={{ height: '68px', background: 'rgba(8,8,11,.95)', borderTop: '1px solid rgba(212,178,106,.22)', display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', alignItems: 'center', paddingBottom: '6px', backdropFilter: 'blur(16px)' }}>
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: item.active ? '#d4b26a' : '#8c8679' }}>
            <Icon size={20} />
            <span style={{ fontSize: '10px', fontWeight: item.active ? 800 : 600 }}>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};
