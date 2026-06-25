import React from 'react';
import Link from 'next/link';

export const Header: React.FC = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 34px', background: '#0c0c0f', borderBottom: '1px solid rgba(212,178,106,.22)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '34px' }}>
        <Link href="/" style={{ fontFamily: 'Georgia, serif', fontWeight: '800', fontSize: '26px', color: '#f0dda8' }}>Vietyoru</Link>
        <div style={{ display: 'flex', gap: '22px', fontSize: '14px', color: '#b6b1a6', fontWeight: '500' }}>
          <Link href="/" className="lk">Trang chủ</Link>
          <Link href="/danh-sach-quan" className="lk">Tìm quán</Link>
          <Link href="/danh-sach-cast" className="lk">Cast</Link>
          <Link href="/xep-hang" className="lk">Bảng xếp hạng</Link>
          <Link href="/tour" className="lk">Tour</Link>
          <Link href="/blog" className="lk">Blog</Link>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ fontSize: '13px', color: '#d4b26a', background: 'rgba(255,255,255,.045)', border: '1px solid rgba(212,178,106,.22)', borderRadius: '20px', padding: '6px 12px', fontWeight: '600' }}>VI / JP</div>
        <Link href="/dang-nhap" className="lk" style={{ fontSize: '13px', color: '#b6b1a6' }}>Đăng nhập</Link>
        <Link href="/dang-ky-doi-tac" style={{ fontSize: '13px', fontWeight: '700', color: '#241a0a', background: '#d4b26a', borderRadius: '22px', padding: '9px 18px' }}>Đăng ký đối tác</Link>
      </div>
    </div>
  );
};
