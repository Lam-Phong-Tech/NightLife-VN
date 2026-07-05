import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Venue, Cast } from '@/types/index';
import { PlaceholderMedia } from './MediaPlaceholder';

interface RankingCardProps {
  item: Venue | Cast;
  onClick?: () => void;
  style?: React.CSSProperties;
}

type RankedCardItem = Venue & Cast & {
  crown?: string;
  numColor?: string;
};

export const RankingCard: React.FC<RankingCardProps> = ({ item, onClick, style }) => {
  const ranked = item as RankedCardItem;

  return (
    <div
      onClick={onClick || ranked.open}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '11px',
        background: 'var(--vy-surface-2)',
        border: '1px solid var(--vy-border-gold-22)',
        borderRadius: '12px',
        padding: '9px 11px',
        cursor: 'pointer',
        color: 'var(--vy-text)',
        ...style
      }}
    >
      <span
        style={{
          width: '26px',
          height: '26px',
          borderRadius: '8px',
          flex: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '800',
          fontSize: '12.5px',
          color: ranked.numColor || 'var(--vy-on-gold)',
          background: ranked.crown || 'var(--vy-gold)'
        }}
      >
        {ranked.rank}
      </span>
      <PlaceholderMedia
        src={ranked.img}
        alt={ranked.name || 'Xếp hạng'}
        label=""
        style={{ width: '38px', height: '38px', borderRadius: '50%', flex: 'none' }}
      />
      <div style={{ flex: '1', minWidth: '0' }}>
        <div style={{ fontWeight: '700', fontSize: '13px' }}>{ranked.name}</div>
        <div style={{ fontSize: '10.5px', color: 'var(--vy-muted)', marginTop: '1px' }}>{ranked.area}</div>
      </div>
      <span
        aria-hidden="true"
        style={{
          width: '24px',
          height: '24px',
          flex: 'none',
          display: 'grid',
          placeItems: 'center',
          color: 'var(--vy-gold)'
        }}
      >
        <ChevronRight size={20} strokeWidth={2.35} />
      </span>
    </div>
  );
};
