import React from 'react';
import { Venue } from '@/types';

interface VenueCardProps {
  venue: Venue;
  onClick?: () => void;
  onFavClick?: (e: React.MouseEvent) => void;
  variant?: 'vertical' | 'horizontal';
}

export const VenueCard: React.FC<VenueCardProps> = ({ venue, onClick, onFavClick, variant = 'vertical' }) => {
  if (variant === 'horizontal') {
    return (
      <div onClick={onClick || venue.open} className="card" style={{ display: 'flex', gap: '12px', background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 3px 12px rgba(40,20,60,.06)', cursor: 'pointer' }}>
        <div style={{ width: '108px', flex: 'none', background: venue.img, position: 'relative' }}>
          <span onClick={onFavClick || venue.fav} style={{ position: 'absolute', top: '7px', left: '7px', width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(0,0,0,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={venue.favIcon || 'https://img.icons8.com/ios/100/FFFFFF/like.png'} style={{ width: '14px', height: '14px', display: 'inline-block' }} alt="Fav" />
          </span>
        </div>
        <div style={{ padding: '11px 12px 11px 0', flex: '1', minWidth: '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: '600', fontSize: '14px' }}>{venue.name}</span>
            {venue.hasBadge && (
              <span style={{ fontSize: '9px', fontWeight: '700', color: venue.badgeColor || '#6d28d9', background: '#f3f2f5', borderRadius: '8px', padding: '2px 6px' }}>{venue.badgeText}</span>
            )}
          </div>
          <div style={{ fontSize: '11.5px', color: '#8a879a', marginTop: '2px' }}>{venue.area} · {venue.catLabel}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
            <span style={{ fontSize: '12px', color: '#e8923a' }}>★ {venue.rating} <span style={{ color: '#a8a5b4' }}>({venue.reviews || 0})</span></span>
            <span style={{ fontSize: '12px', fontWeight: '600' }}>{venue.price}</span>
          </div>
        </div>
      </div>
    );
  }

  // Vertical variant
  return (
    <div onClick={onClick || venue.open} className="card" style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 3px 12px rgba(40,20,60,.06)', cursor: 'pointer' }}>
      <div style={{ height: '118px', background: venue.img, position: 'relative' }}>
        {venue.hasBadge && (
          <span style={{ position: 'absolute', top: '10px', left: '10px', background: '#fff', color: venue.badgeColor || '#6d28d9', fontSize: '10.5px', fontWeight: '700', borderRadius: '14px', padding: '3px 9px' }}>{venue.badgeText}</span>
        )}
        <span onClick={onFavClick || venue.fav} style={{ position: 'absolute', top: '8px', right: '8px', width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(0,0,0,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <img src={venue.favIcon || 'https://img.icons8.com/ios/100/FFFFFF/like.png'} style={{ width: '16px', height: '16px', display: 'inline-block' }} alt="Fav" />
        </span>
      </div>
      <div style={{ padding: '12px' }}>
        <div style={{ fontWeight: '600', fontSize: '14px' }}>{venue.name}</div>
        <div style={{ fontSize: '11.5px', color: '#8a879a', marginTop: '3px' }}>{venue.area} · {venue.catLabel}</div>
        <div style={{ marginTop: '8px', fontSize: '12.5px', color: '#e8923a' }}>
          ★ {venue.rating} {venue.reviews ? <span style={{ color: '#a8a5b4' }}>({venue.reviews})</span> : null}
          <span style={{ color: '#1f1d29', fontWeight: '600', marginLeft: '6px' }}>{venue.price}</span>
        </div>
      </div>
    </div>
  );
};
