"use client";
import React, { useState } from 'react';
import Link from 'next/link';

import { cats, areas, venues } from '@/lib/mock-data';
import { VenueCard } from '@/components/ui/VenueCard';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchBar } from '@/components/ui/SearchBar';

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeCat, setActiveCat] = useState(0);
  const [activeArea, setActiveArea] = useState(0);
  const filterStyle = (active: boolean): React.CSSProperties => ({
    background: active ? '#d4b26a' : 'rgba(255,255,255,.045)',
    color: active ? '#241a0a' : '#d8d1c1',
    border: active ? '1px solid #d4b26a' : '1px solid rgba(212,178,106,.24)',
    borderRadius: '16px',
    padding: '9px 14px',
    fontWeight: 700,
    fontSize: '12.5px',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  });
  
  
  React.useEffect(() => {
    
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);
    
  const count = 9;
  const categoryFilters = cats.map((item, index) => ({
    ...item,
    style: filterStyle(index === activeCat),
    pick: () => setActiveCat(index),
  }));
  const areaFilters = areas.map((item, index) => ({
    ...item,
    style: filterStyle(index === activeArea),
    pick: () => setActiveArea(index),
  }));

  return (
    <React.Fragment>
      {/* MOBILE */}
      <div className="block md:hidden">
        <div style={{ width: '100%', minHeight: '100vh', boxSizing: 'border-box', padding: '0px', background: '#e7e5df', fontFamily: "'Inter',sans-serif" }}>
          <div style={{ margin: '0 auto', width: '100%', background: '#f5f4f2', borderRadius: '0px', overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,.16)', color: '#1f1d29', border: '1px solid #e3e0da' }}>
            <div style={{ background: '#fff', padding: '8px 18px 12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link href="/" style={{ fontSize: '22px', color: '#5b5870', lineHeight: '1', textDecoration: 'none' }}>‹</Link>
              <span style={{ fontWeight: '800', fontSize: '16px' }}>Tìm quán · Hà Nội</span>
            </div>
            
            <div style={{ padding: '0 18px 12px', background: '#fff' }}>
              <SearchBar 
                onSearch={() => {}} 
                placeholder="Tên quán, khu vực…" 
              />
            </div>

            {/* filter chips */}
            <div className="hscroll" style={{ padding: '12px 18px 4px', display: 'flex', gap: '7px', overflowX: 'auto', background: '#fff' }}>
              {categoryFilters?.map((c, index) => (
                <div key={index} onClick={c.pick} style={c.style}>{c.label}</div>
              ))}
            </div>
            <div className="hscroll" style={{ padding: '8px 18px 12px', display: 'flex', gap: '7px', overflowX: 'auto', background: '#fff', borderBottom: '1px solid #ececec' }}>
              {areaFilters?.map((a, index) => (
                <div key={index} onClick={a.pick} style={a.style}>{a.label}</div>
              ))}
            </div>

            <div style={{ padding: '12px 18px 6px', fontSize: '12.5px', color: '#5b5870' }}>
              <b style={{ color: '#1f1d29' }}>{count} quán</b> phù hợp
            </div>
            
            <div style={{ padding: '0 18px 12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {isLoading ? (
                <LoadingSkeleton />
              ) : venues?.length > 0 ? (
                venues.map((v, index) => (
                  <VenueCard key={index} venue={v} variant="horizontal" />
                ))
              ) : (
                <EmptyState />
              )}
            </div>

            <BottomNav />
          </div>
        </div>
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block">
        <div style={{ width: '100%', minWidth: '100%', minHeight: '100vh', boxSizing: 'border-box', padding: '0px', background: '#e7e5df', fontFamily: "'Inter',sans-serif" }}>
          <div style={{ width: '100%', background: '#f5f4f2', borderRadius: '0px', overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,.10)', color: '#1f1d29' }}>
            <Header />

            {/* search bar */}
            <div style={{ padding: '20px 34px', background: '#fff', borderBottom: '1px solid #ececec', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px', height: '46px', border: '1px solid #ececec', borderRadius: '11px', color: '#6d28d9', fontSize: '14px', fontWeight: '600' }}>Hà Nội</div>
              <div style={{ flex: '1', display: 'flex', alignItems: 'center', gap: '10px', height: '46px', border: '1px solid #ececec', borderRadius: '11px', padding: '0' }}>
                <SearchBar 
                  onSearch={() => {}} 
                  placeholder="Tìm theo tên quán…" 
                  style={{ background: 'transparent', border: 'none', flex: 1, padding: '0 16px' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '46px', padding: '0 26px', background: '#6d28d9', color: '#fff', borderRadius: '11px', fontWeight: '600', fontSize: '14px' }}>Tìm</div>
            </div>

            <div style={{ display: 'flex', gap: '0' }}>
              {/* filter sidebar */}
              <div style={{ width: '262px', flex: 'none', background: '#fff', borderRight: '1px solid #ececec', padding: '24px' }}>
                <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '18px' }}>Bộ lọc</div>
                
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#8a879a', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '12px' }}>Loại hình</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                  {categoryFilters?.map((c, index) => (
                    <div key={index} onClick={c.pick} style={c.style}>{c.label}</div>
                  ))}
                </div>
                
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#8a879a', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '12px' }}>Khu vực</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                  {areaFilters?.map((a, index) => (
                    <div key={index} onClick={a.pick} style={a.style}>{a.label}</div>
                  ))}
                </div>
              </div>

              {/* results */}
              <div style={{ flex: '1', padding: '22px 28px 30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                  <div style={{ fontSize: '14px', color: '#5b5870' }}><b style={{ color: '#1f1d29' }}>{count} quán</b> phù hợp</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
                  {isLoading ? (
                    <LoadingSkeleton />
                  ) : venues?.length > 0 ? (
                    venues.map((v, index) => (
                      <VenueCard key={index} venue={v} variant="vertical" />
                    ))
                  ) : (
                    <EmptyState />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
