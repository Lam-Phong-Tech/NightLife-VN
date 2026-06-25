import React from 'react';
import { Venue, Cast } from '@/types/index';

interface RankingCardProps {
  item: Venue | Cast;
  onClick?: () => void;
  style?: React.CSSProperties;
}

type RankedCardItem = Venue & Cast & {
  crown?: string;
  metric?: string;
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
        background: 'rgba(255,255,255,.045)',
        border: '1px solid rgba(212,178,106,.22)',
        borderRadius: '12px',
        padding: '9px 11px',
        cursor: 'pointer',
        color: '#f3f0ea',
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
          color: ranked.numColor || '#241a0a',
          background: ranked.crown || '#d4b26a'
        }}
      >
        {ranked.rank}
      </span>
      <span
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          flex: 'none',
          background: ranked.img
        }}
      />
      <div style={{ flex: '1', minWidth: '0' }}>
        <div style={{ fontWeight: '700', fontSize: '13px' }}>{ranked.name}</div>
        <div style={{ fontSize: '10.5px', color: '#b6b1a6', marginTop: '1px' }}>{ranked.area}</div>
      </div>
      <span style={{ fontSize: '11px', color: '#d4b26a', fontWeight: '700' }}>{ranked.metric}</span>
    </div>
  );
};
