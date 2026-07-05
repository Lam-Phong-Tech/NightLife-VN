import React from 'react';
import Link from 'next/link';
import { Coupon } from '@/types';
import { PlaceholderMedia } from './MediaPlaceholder';

interface CouponCardProps {
  coupon: Coupon;
  onClick?: () => void;
  onTakeClick?: (e: React.MouseEvent) => void;
  variant?: 'hot' | 'list';
}

export const CouponCard: React.FC<CouponCardProps> = ({ coupon, onClick, onTakeClick, variant = 'hot' }) => {
  if (variant === 'list') {
    return (
      <Link href="/stores/neon-club" onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--vy-surface)', borderRadius: '13px', padding: '11px', boxShadow: 'var(--vy-shadow-card)', textDecoration: 'none', color: 'inherit', border: '1px solid var(--vy-border)' }}>
        <PlaceholderMedia src={coupon.img} alt={coupon.title || 'Coupon'} label="" style={{ width: '48px', height: '48px', borderRadius: '11px', flex: 'none' }} />
        <div style={{ flex: '1' }}>
          <div style={{ fontWeight: '700', fontSize: '13.5px' }}>{coupon.title}</div>
          <div style={{ fontSize: '11px', color: 'var(--vy-muted)', marginTop: '2px' }}>{coupon.place}</div>
        </div>
        <span onClick={(e) => { e.preventDefault(); if (onTakeClick) { onTakeClick(e); } else if (coupon.take) { coupon.take(); } }} style={{ fontSize: '12px', color: 'var(--vy-gold)', fontWeight: '600' }}>{coupon.btnLabel} ›</span>
      </Link>
    );
  }

  // Hot variant
  return (
    <div onClick={onClick} className="card" style={{ background: 'var(--vy-surface)', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--vy-shadow-card)', cursor: 'pointer', border: '1px solid var(--vy-border)' }}>
      <PlaceholderMedia src={coupon.img} alt={coupon.title || 'Coupon'} label="Ảnh ưu đãi" style={{ height: '118px', position: 'relative' }}>
        <span style={{ position: 'absolute', top: '12px', left: '12px', background: 'var(--vy-gold)', color: 'var(--vy-on-gold)', fontSize: '18px', fontWeight: '800', borderRadius: '12px', padding: '6px 12px' }}>
          {coupon.value}
        </span>
      </PlaceholderMedia>
      <div style={{ padding: '14px' }}>
        <div style={{ fontWeight: '700', fontSize: '15px' }}>{coupon.title}</div>
        <div style={{ fontSize: '12.5px', color: 'var(--vy-muted)', marginTop: '4px' }}>{coupon.place}</div>
        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11.5px', color: 'var(--vy-pink)', background: 'var(--vy-surface-2)', borderRadius: '10px', padding: '4px 9px', fontWeight: '600' }}>
            {coupon.expiry}
          </span>
          <span onClick={(e) => { e.preventDefault(); if (onTakeClick) { onTakeClick(e); } else if (coupon.take) { coupon.take(); } }} style={{ fontSize: '13px', color: 'var(--vy-gold)', fontWeight: '600' }}>
            {coupon.btnLabel} ›
          </span>
        </div>
      </div>
    </div>
  );
};
