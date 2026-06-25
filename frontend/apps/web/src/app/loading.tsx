"use client";
import React from 'react';

export default function Loading() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
      <div className="spinner" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #6d28d9', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }} />
      <div style={{ color: '#6d28d9', fontWeight: 'bold' }}>Đang tải dữ liệu...</div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
