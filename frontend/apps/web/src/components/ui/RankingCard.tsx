import React from 'react';
import { Venue, Cast } from '@/types/index';

interface RankingCardProps {
  item: Venue | Cast;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const RankingCard: React.FC<RankingCardProps> = ({ item, onClick, style }) => {
  return (
    <div 
      onClick={onClick || item.open} 
      style={{
        display: 'flex', 
        alignItems: 'center', 
        gap: '11px', 
        background: '#fff', 
        border: '1px solid #ececec', 
        borderRadius: '12px', 
        padding: '9px 11px', 
        cursor: 'pointer',
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
          color: item.numColor, 
          background: item.crown
        }}
      >
        {item.rank}
      </span>
      <span 
        style={{
          width: '38px', 
          height: '38px', 
          borderRadius: '50%', 
          flex: 'none', 
          background: item.img
        }}
      />
      <div style={{ flex: '1', minWidth: '0' }}>
        <div style={{ fontWeight: '600', fontSize: '13px' }}>{item.name}</div>
        <div style={{ fontSize: '10.5px', color: '#8a879a', marginTop: '1px' }}>{item.area}</div>
      </div>
      <span style={{ fontSize: '11px', color: '#6d28d9', fontWeight: '600' }}>{item.metric}</span>
    </div>
  );
};
