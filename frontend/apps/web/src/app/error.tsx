"use client";
import React, { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '16px', padding: '20px', textAlign: 'center' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f1d29' }}>Đã có lỗi xảy ra!</h2>
      <p style={{ color: '#8a879a' }}>Rất tiếc, chúng tôi không thể tải trang này vào lúc này.</p>
      <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
        <button
          onClick={() => reset()}
          style={{ padding: '12px 24px', background: '#6d28d9', color: '#fff', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Thử lại
        </button>
        <Link href="/" style={{ padding: '12px 24px', background: '#f3f2f5', color: '#1f1d29', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
