import React from 'react';

export const Header: React.FC = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 34px', background: '#fff', borderBottom: '1px solid #ececec' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '34px' }}>
        <a href="/" style={{ fontWeight: '800', fontSize: '20px', color: '#6d28d9' }}>nightlife<span style={{ color: '#1f1d29' }}>.hn</span></a>
        <div style={{ display: 'flex', gap: '22px', fontSize: '14px', color: '#5b5870', fontWeight: '500' }}>
          <a href="/" className="lk">Trang chủ</a>
          <a href="/danh-sach-quan" className="lk">Tìm quán</a>
          <a href="/danh-sach-cast" className="lk">Cast</a>
          <a href="/xep-hang" className="lk">Bảng xếp hạng</a>
          <a href="/tour" className="lk">Tour</a>
          <a href="/blog" className="lk">Blog</a>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ fontSize: '13px', color: '#6d28d9', background: '#f1ebff', borderRadius: '20px', padding: '6px 12px', fontWeight: '600' }}>VI · 日本語</div>
        <a href="/dang-nhap" className="lk" style={{ fontSize: '13px', color: '#5b5870' }}>Đăng nhập</a>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff', background: '#6d28d9', borderRadius: '22px', padding: '9px 18px', cursor: 'pointer' }}>Đăng ký đối tác</div>
      </div>
    </div>
  );
};
