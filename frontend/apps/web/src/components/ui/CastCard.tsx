import React from 'react';
import Link from 'next/link';
import { Cast } from '@/types';
import Image from 'next/image';
import { PlaceholderMedia } from './MediaPlaceholder';

interface CastCardProps {
  cast: Cast;
  onClick?: () => void;
  onFavClick?: (e: React.MouseEvent) => void;
  href?: string;
}

export const CastCard: React.FC<CastCardProps> = ({ cast, onClick, onFavClick, href }) => {
  const targetHref = href || `/casts/${cast.id || 'cast-1'}`;

  const content = (
    <div onClick={onClick} className="card" style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 3px 12px rgba(40,20,60,.06)', cursor: 'pointer' }}>
      <PlaceholderMedia src={cast.img} alt={cast.name || 'Cast'} label="Ảnh cast" style={{ height: '118px', position: 'relative' }}>
        {cast.jp && (
          <span style={{ position: 'absolute', top: '10px', left: '10px', background: '#fff', color: '#c0246a', fontSize: '10.5px', fontWeight: '700', borderRadius: '14px', padding: '3px 9px' }}>Nói tiếng Nhật</span>
        )}
        <span onClick={(e) => { e.preventDefault(); if (onFavClick) { onFavClick(e); } else if (cast.fav) { cast.fav(e); } }} style={{ position: 'absolute', top: '8px', right: '8px', width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(0,0,0,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Image src={cast.favIcon || 'https://img.icons8.com/ios/100/FFFFFF/like.png'} width={16} height={16} alt="Fav" />
        </span>
      </PlaceholderMedia>
      <div style={{ padding: '12px' }}>
        <div style={{ fontWeight: '600', fontSize: '14px' }}>{cast.name} · {cast.age}</div>
        <div style={{ fontSize: '11.5px', color: '#8a879a', marginTop: '3px' }}>{cast.desc}</div>
        <div style={{ marginTop: '8px', fontSize: '12.5px', color: '#e8923a' }}>★ {cast.rating}</div>
      </div>
    </div>
  );

  return (
    <Link href={targetHref} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
      {content}
    </Link>
  );
};
