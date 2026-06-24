import React from 'react';
import Link from 'next/link';

export const Header: React.FC = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 34px', background: '#fff', borderBottom: '1px solid #ececec' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '34px' }}>
        <Link href="/" style={{ fontWeight: '800', fontSize: '20px', color: '#6d28d9' }}>nightlife<span style={{ color: '#1f1d29' }}>.hn</span></Link>
        <div style={{ display: 'flex', gap: '22px', fontSize: '14px', color: '#5b5870', fontWeight: '500' }}>
          <Link href="/" className="lk">Trang chủ</Link>
          <Link href="/danh-sach-quan" className="lk">Tìm quán</Link>
          <Link href="/danh-sach-cast" className="lk">Cast</Link>
          <Link href="/xep-hang" className="lk">Bảng xếp hạng</Link>
          <Link href="/tour" className="lk">Tour</Link>
          <Link href="/blog" className="lk">Blog</Link>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ fontSize: '13px', color: '#6d28d9', background: '#f1ebff', borderRadius: '20px', padding: '6px 12px', fontWeight: '600' }}>VI · 日本語</div>
        <Link href="/dang-nhap" className="lk" style={{ fontSize: '13px', color: '#5b5870' }}>Đăng nhập</Link>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff', background: '#6d28d9', borderRadius: '22px', padding: '9px 18px', cursor: 'pointer' }}>Đăng ký đối tác</div>
      </div>
    </div>
  );
};
