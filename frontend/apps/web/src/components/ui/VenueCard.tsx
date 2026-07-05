import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Venue } from '@/types';
import { PlaceholderMedia } from './MediaPlaceholder';
import { formatPriceTier } from '@/lib/price-tier';

interface VenueCardProps {
  venue: Venue;
  onClick?: () => void;
  onFavClick?: (e: React.MouseEvent) => void;
  variant?: 'vertical' | 'horizontal';
  href?: string;
}

export const VenueCard: React.FC<VenueCardProps> = ({ venue, onClick, onFavClick, variant = 'vertical', href }) => {
  const defaultHref = `/stores/${venue.id || 'store-1'}`;
  const targetHref = href || defaultHref;

  const content = (
    <div onClick={onClick} className="card" style={{ background: 'var(--vy-surface-2)', border: '1px solid var(--vy-border-gold-22)', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--vy-shadow-card)', cursor: 'pointer', display: variant === 'horizontal' ? 'flex' : 'block', gap: variant === 'horizontal' ? '12px' : '0', color: 'var(--vy-text)' }}>
      <div style={{ height: variant === 'horizontal' ? 'auto' : '118px', width: variant === 'horizontal' ? '108px' : 'auto', position: 'relative', flex: 'none' }}>
        <PlaceholderMedia src={venue.img} alt={venue.name || 'Địa điểm'} label="Ảnh quán" style={{ width: '100%', height: '100%' }} />
        {venue.hasBadge && (
          <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(12,12,15,.72)', color: 'var(--vy-gold-pale)', border: '1px solid var(--vy-border-gold-22)', fontSize: '10.5px', fontWeight: '700', borderRadius: '14px', padding: '3px 9px' }}>{venue.badgeText}</span>
        )}
        <span onClick={(e) => { e.preventDefault(); if (onFavClick) { onFavClick(e); } else if (venue.fav) { venue.fav(e); } }} style={{ position: 'absolute', top: '8px', right: '8px', width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Image src={venue.favIcon || 'https://img.icons8.com/ios/100/FFFFFF/like.png'} width={16} height={16} alt="Fav" />
        </span>
      </div>
      <div style={{ padding: '12px', flex: '1', minWidth: '0' }}>
        <div style={{ fontWeight: '700', fontSize: '14px' }}>{venue.name}</div>
        <div style={{ fontSize: '11.5px', color: 'var(--vy-muted)', marginTop: '3px' }}>{venue.area} - {venue.catLabel}</div>
        <div style={{ marginTop: '8px', fontSize: '12.5px', color: 'var(--vy-gold)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>* {venue.rating} {venue.reviews ? <span style={{ color: 'var(--vy-faint)' }}>({venue.reviews})</span> : null}</span>
          <span style={{ color: 'var(--vy-text)', fontWeight: '700' }}>{formatPriceTier(venue.price)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <Link href={targetHref} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
      {content}
    </Link>
  );
};
