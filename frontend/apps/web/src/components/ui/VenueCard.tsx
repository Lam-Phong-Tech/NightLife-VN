import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Venue } from '@/types';

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
    <div onClick={onClick} className="card" style={{ background: 'rgba(255,255,255,.045)', border: '1px solid rgba(212,178,106,.22)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 18px 40px rgba(0,0,0,.22)', cursor: 'pointer', display: variant === 'horizontal' ? 'flex' : 'block', gap: variant === 'horizontal' ? '12px' : '0', color: '#f3f0ea' }}>
      <div style={{ height: variant === 'horizontal' ? 'auto' : '118px', width: variant === 'horizontal' ? '108px' : 'auto', position: 'relative', flex: 'none' }}>
        <div style={{ width: '100%', height: '100%', background: venue.img }} />
        {venue.hasBadge && (
          <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(12,12,15,.72)', color: '#f0dda8', border: '1px solid rgba(212,178,106,.22)', fontSize: '10.5px', fontWeight: '700', borderRadius: '14px', padding: '3px 9px' }}>{venue.badgeText}</span>
        )}
        <span onClick={(e) => { e.preventDefault(); if (onFavClick) { onFavClick(e); } else if (venue.fav) { venue.fav(e); } }} style={{ position: 'absolute', top: '8px', right: '8px', width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Image src={venue.favIcon || 'https://img.icons8.com/ios/100/FFFFFF/like.png'} width={16} height={16} alt="Fav" />
        </span>
      </div>
      <div style={{ padding: '12px', flex: '1', minWidth: '0' }}>
        <div style={{ fontWeight: '700', fontSize: '14px' }}>{venue.name}</div>
        <div style={{ fontSize: '11.5px', color: '#b6b1a6', marginTop: '3px' }}>{venue.area} - {venue.catLabel}</div>
        <div style={{ marginTop: '8px', fontSize: '12.5px', color: '#d4b26a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>* {venue.rating} {venue.reviews ? <span style={{ color: '#8c8679' }}>({venue.reviews})</span> : null}</span>
          <span style={{ color: '#f3f0ea', fontWeight: '700' }}>{venue.price}</span>
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
