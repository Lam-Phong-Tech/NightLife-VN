import React from 'react';

export const BottomNav: React.FC = () => {
  // In a real app we'd use usePathname from next/navigation to determine active state
  // Here we just provide a generic styled block matching the original structure
  return (
    <div style={{ height: '64px', background: '#fff', borderTop: '1px solid #ececec', display: 'flex', alignItems: 'center', justifyContent: 'space-around', paddingBottom: '6px' }}>
      <a href="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
        <img src="https://img.icons8.com/ios-filled/100/6D28D9/home.png" style={{ width: '21px', height: '21px', display: 'inline-block' }} alt="" />
        <span style={{ fontSize: '10px', color: '#6d28d9', fontWeight: '600' }}>Trang chủ</span>
      </a>
      <a href="/danh-sach-quan" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
        <img src="https://img.icons8.com/ios-filled/100/B6B3C0/search.png" style={{ width: '21px', height: '21px', display: 'inline-block' }} alt="" />
        <span style={{ fontSize: '10px', color: '#b6b3c0' }}>Tìm quán</span>
      </a>
      <a href="/uu-dai" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
        <img src="https://img.icons8.com/ios/100/B6B3C0/gift.png" style={{ width: '21px', height: '21px', display: 'inline-block' }} alt="" />
        <span style={{ fontSize: '10px', color: '#b6b3c0' }}>Ưu đãi</span>
      </a>
      <a href="/lich-su-dat-cho" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
        <img src="https://img.icons8.com/ios/100/B6B3C0/calendar.png" style={{ width: '21px', height: '21px', display: 'inline-block' }} alt="" />
        <span style={{ fontSize: '10px', color: '#b6b3c0' }}>Đặt chỗ</span>
      </a>
      <a href="/tai-khoan" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
        <img src="https://img.icons8.com/ios/100/B6B3C0/user.png" style={{ width: '21px', height: '21px', display: 'inline-block' }} alt="" />
        <span style={{ fontSize: '10px', color: '#b6b3c0' }}>Tài khoản</span>
      </a>
    </div>
  );
};
