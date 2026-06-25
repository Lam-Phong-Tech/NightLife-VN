import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const BottomNav: React.FC = () => {
  return (
    <div style={{ height: '64px', background: '#fff', borderTop: '1px solid #ececec', display: 'flex', alignItems: 'center', justifyContent: 'space-around', paddingBottom: '6px' }}>
      <Link href="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
        <Image src="https://img.icons8.com/ios-filled/100/6D28D9/home.png" width={21} height={21} alt="" />
        <span style={{ fontSize: '10px', color: '#6d28d9', fontWeight: '600' }}>Trang chủ</span>
      </Link>
      <Link href="/danh-sach-quan" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
        <Image src="https://img.icons8.com/ios-filled/100/B6B3C0/search.png" width={21} height={21} alt="" />
        <span style={{ fontSize: '10px', color: '#b6b3c0' }}>Tìm quán</span>
      </Link>
      <Link href="/uu-dai" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
        <Image src="https://img.icons8.com/ios/100/B6B3C0/gift.png" width={21} height={21} alt="" />
        <span style={{ fontSize: '10px', color: '#b6b3c0' }}>Ưu đãi</span>
      </Link>
      <Link href="/lich-su-dat-cho" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
        <Image src="https://img.icons8.com/ios/100/B6B3C0/calendar.png" width={21} height={21} alt="" />
        <span style={{ fontSize: '10px', color: '#b6b3c0' }}>Đặt chỗ</span>
      </Link>
      <Link href="/tai-khoan" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
        <Image src="https://img.icons8.com/ios/100/B6B3C0/user.png" width={21} height={21} alt="" />
        <span style={{ fontSize: '10px', color: '#b6b3c0' }}>Tài khoản</span>
      </Link>
    </div>
  );
};
