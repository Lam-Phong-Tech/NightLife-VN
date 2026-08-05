'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const PartnerScanClient = dynamic(() => import('./PartnerScanClient'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: '300px',
        borderRadius: '16px',
        border: '1px solid var(--partner-border-hair, rgba(255,255,255,.08))',
        background: 'var(--partner-surface-2, rgba(255,255,255,.04))',
        color: 'var(--partner-muted, #8c8679)',
        display: 'grid',
        placeItems: 'center',
        fontSize: '14px',
        fontWeight: 700,
      }}
    >
      Đang tải trình quét QR...
    </div>
  ),
});

export default function PartnerScanPage() {
  return <PartnerScanClient />;
}
