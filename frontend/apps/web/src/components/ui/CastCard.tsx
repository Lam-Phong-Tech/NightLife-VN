import React from 'react';
import { Cast } from '@/types';

interface CastCardProps {
  cast: Cast;
  onClick?: () => void;
  onFavClick?: (e: React.MouseEvent) => void;
}

export const CastCard: React.FC<CastCardProps> = ({ cast, onClick, onFavClick }) => {
  return (
    <div onClick={onClick || cast.open} className="card" style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 3px 12px rgba(40,20,60,.06)', cursor: 'pointer' }}>
      <div style={{ height: '118px', background: cast.img, position: 'relative' }}>
        {cast.jp && (
          <span style={{ position: 'absolute', top: '10px', left: '10px', background: '#fff', color: '#c0246a', fontSize: '10.5px', fontWeight: '700', borderRadius: '14px', padding: '3px 9px' }}>Nói tiếng Nhật</span>
        )}
        <span onClick={onFavClick || cast.fav} style={{ position: 'absolute', top: '8px', right: '8px', width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(0,0,0,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <img src={cast.favIcon || 'https://img.icons8.com/ios/100/FFFFFF/like.png'} style={{ width: '16px', height: '16px', display: 'inline-block' }} alt="Fav" />
        </span>
      </div>
      <div style={{ padding: '12px' }}>
        <div style={{ fontWeight: '600', fontSize: '14px' }}>{cast.name} · {cast.age}</div>
        <div style={{ fontSize: '11.5px', color: '#8a879a', marginTop: '3px' }}>{cast.desc}</div>
        <div style={{ marginTop: '8px', fontSize: '12.5px', color: '#e8923a' }}>★ {cast.rating}</div>
      </div>
    </div>
  );
};
