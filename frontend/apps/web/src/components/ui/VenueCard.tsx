import React from 'react';
import Link from 'next/link';
import { Venue } from '@/types';
import Image from 'next/image';

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
    <div onClick={onClick} className="card" style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 3px 12px rgba(40,20,60,.06)', cursor: 'pointer', display: variant === 'horizontal' ? 'flex' : 'block', gap: variant === 'horizontal' ? '12px' : '0' }}>
      <div style={{ height: variant === 'horizontal' ? 'auto' : '118px', width: variant === 'horizontal' ? '108px' : 'auto', position: 'relative', flex: 'none' }}>
        {/* Mocking background image from string since it contains url() and gradients, but using Next Image is better for simple urls */}
        <div style={{ width: '100%', height: '100%', background: venue.img }} />
        {venue.hasBadge && (
          <span style={{ position: 'absolute', top: '10px', left: '10px', background: '#fff', color: venue.badgeColor || '#6d28d9', fontSize: '10.5px', fontWeight: '700', borderRadius: '14px', padding: '3px 9px' }}>{venue.badgeText}</span>
        )}
        <span onClick={(e) => { e.preventDefault(); if (onFavClick) { onFavClick(e); } else if (venue.fav) { venue.fav(e); } }} style={{ position: 'absolute', top: '8px', right: '8px', width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(0,0,0,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Image src={venue.favIcon || 'https://img.icons8.com/ios/100/FFFFFF/like.png'} width={16} height={16} alt="Fav" />
        </span>
      </div>
      <div style={{ padding: '12px', flex: '1', minWidth: '0' }}>
        <div style={{ fontWeight: '600', fontSize: '14px' }}>{venue.name}</div>
        <div style={{ fontSize: '11.5px', color: '#8a879a', marginTop: '3px' }}>{venue.area} · {venue.catLabel}</div>
        <div style={{ marginTop: '8px', fontSize: '12.5px', color: '#e8923a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>★ {venue.rating} {venue.reviews ? <span style={{ color: '#a8a5b4' }}>({venue.reviews})</span> : null}</span>
          <span style={{ color: '#1f1d29', fontWeight: '600' }}>{venue.price}</span>
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
