"use client";

import Link from 'next/link';
import React, { type CSSProperties, useEffect, useMemo, useState } from 'react';
import { Heart, Languages, Sparkles } from 'lucide-react';

import {
  discoveryApi,
  type PublicArea,
  type PublicCast,
} from '@/lib/api/discovery';
import { BottomNav } from '@/components/layout/BottomNav';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { PlaceholderMedia } from '@/components/ui/MediaPlaceholder';
import { SearchBar } from '@/components/ui/SearchBar';

const colors = {
  shell: '#0c0c0f',
  panel: '#111114',
  panelSoft: 'rgba(255,255,255,.045)',
  line: 'rgba(212,178,106,.22)',
  gold: '#d4b26a',
  goldSoft: '#f0dda8',
  text: '#f3f0ea',
  muted: '#b6b1a6',
  dim: '#8c8679',
  rose: '#e0729e',
};

const cityOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'hn', label: 'HN' },
  { value: 'hcm', label: 'HCM' },
];

const categoryOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'BAR', label: 'Bar' },
  { value: 'CLUB', label: 'Club' },
  { value: 'LOUNGE', label: 'Lounge' },
  { value: 'GIRLS_BAR', label: 'Girls Bar' },
  { value: 'KARAOKE', label: 'Karaoke / KTV' },
  { value: 'MASSAGE_SPA', label: 'Massage / Spa' },
  { value: 'RESTAURANT', label: 'Nhà hàng' },
  { value: 'CASINO', label: 'Casino' },
];

const categoryLabels: Record<string, string> = {
  BAR: 'Bar',
  CLUB: 'Club',
  LOUNGE: 'Lounge',
  GIRLS_BAR: 'Girls Bar',
  KARAOKE: 'Karaoke / KTV',
  MASSAGE_SPA: 'Massage / Spa',
  RESTAURANT: 'Nhà hàng',
  CASINO: 'Casino',
};

const cityLabels: Record<string, string> = {
  hn: 'Hà Nội',
  hcm: 'TP.HCM',
};

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  background:
    'radial-gradient(circle at 78% 6%, rgba(224,114,158,.16), transparent 28%), radial-gradient(circle at 12% 12%, rgba(212,178,106,.13), transparent 28%), linear-gradient(180deg,#0b0b0e 0%,#111114 54%,#09090b 100%)',
  color: colors.text,
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
};

const chipStyle = (active: boolean): CSSProperties => ({
  border: `1px solid ${active ? colors.gold : colors.line}`,
  background: active ? colors.gold : colors.panelSoft,
  color: active ? '#241a0a' : colors.muted,
  borderRadius: '999px',
  padding: '9px 14px',
  fontSize: '12.5px',
  fontWeight: 800,
  whiteSpace: 'nowrap',
  cursor: 'pointer',
});

const languageLabels: Record<string, string> = {
  vi: 'VI',
  ja: 'JP',
  en: 'EN',
};

export default function Page() {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [category, setCategory] = useState('');
  const [areas, setAreas] = useState<PublicArea[]>([]);
  const [casts, setCasts] = useState<PublicCast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleCityChange = (nextCity: string) => {
    setCity(nextCity);
    setArea('');
  };

  useEffect(() => {
    let cancelled = false;

    discoveryApi
      .listAreas({ city })
      .then((items) => {
        if (!cancelled) setAreas(items);
      })
      .catch(() => {
        if (!cancelled) setAreas([]);
      });

    return () => {
      cancelled = true;
    };
  }, [city]);

  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(() => {
      setIsLoading(true);
      setError(null);
      discoveryApi
        .listCasts({
          q: query,
          city,
          area,
          category,
          limit: 60,
        })
        .then((items) => {
          if (!cancelled) setCasts(items);
        })
        .catch(() => {
          if (!cancelled) {
            setCasts([]);
            setError('Chưa kết nối được dữ liệu cast.');
          }
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [area, category, city, query]);

  const visibleCasts = useMemo(() => casts, [casts]);

  return (
    <React.Fragment>
      <main style={pageStyle}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '18px' }}>
          <section
            style={{
              display: 'grid',
              gap: '18px',
              padding: '22px',
              border: `1px solid ${colors.line}`,
              borderRadius: '22px',
              background: 'rgba(255,255,255,.035)',
              boxShadow: '0 24px 70px rgba(0,0,0,.28)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div
                  style={{
                    color: colors.goldSoft,
                    fontSize: '12px',
                    fontWeight: 900,
                    letterSpacing: '.16em',
                    textTransform: 'uppercase',
                  }}
                >
                  Tìm kiếm nhanh
                </div>
                <h1 style={{ marginTop: '8px', fontSize: '32px', fontWeight: 950 }}>
                  Cast đang hoạt động
                </h1>
              </div>
            </div>

            <SearchBar
              value={query}
              onSearch={(event) => setQuery(event.target.value)}
              placeholder="Tên cast, tên quán, khu vực..."
              style={{ minHeight: '48px' }}
            />

            <div style={{ display: 'grid', gap: '12px' }}>
              <FilterRow
                label="Thành phố"
                options={cityOptions}
                value={city}
                onChange={handleCityChange}
              />
              <FilterRow
                label="Loại hình"
                options={categoryOptions}
                value={category}
                onChange={setCategory}
              />
              <FilterRow
                label="Khu vực"
                options={[
                  { value: '', label: 'Tất cả' },
                  ...areas.map((item) => ({
                    value: item.code,
                    label: item.name,
                  })),
                ]}
                value={area}
                onChange={setArea}
              />
            </div>
          </section>

          {error ? (
            <div
              style={{
                marginTop: '14px',
                border: '1px solid rgba(248,113,113,.35)',
                background: 'rgba(127,29,29,.2)',
                color: '#fecaca',
                borderRadius: '14px',
                padding: '12px 14px',
                fontSize: '13px',
                fontWeight: 700,
              }}
            >
              {error}
            </div>
          ) : null}

          <section style={{ marginTop: '20px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '14px',
                marginBottom: '14px',
              }}
            >
              <div style={{ color: colors.muted, fontSize: '13px' }}>
                <b style={{ color: colors.text }}>{visibleCasts.length} cast</b> phù hợp
              </div>
            </div>

            {isLoading ? (
              <LoadingSkeleton />
            ) : visibleCasts.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                  gap: '16px',
                }}
              >
                {visibleCasts.map((cast) => (
                  <CastDiscoveryCard key={cast.id} cast={cast} />
                ))}
              </div>
            ) : (
              <EmptyState title="Chưa có cast phù hợp" description="Đổi khu vực hoặc loại hình để xem thêm." />
            )}
          </section>
        </div>
      </main>
      <BottomNav />
    </React.Fragment>
  );
}

function CastDiscoveryCard({ cast }: { cast: PublicCast }) {
  const areaLabel = [
    cast.store.area?.name ?? cast.store.district,
    cityLabels[cast.store.cityCode ?? ''],
  ]
    .filter(Boolean)
    .join(' · ');
  const langText =
    cast.languages.map((item) => languageLabels[item] ?? item.toUpperCase()).join(' · ') ||
    'VI';
  const priceText = cast.hourlyRateVnd
    ? `${Math.round(cast.hourlyRateVnd / 1000)}K/h`
    : 'Theo booking';

  return (
    <Link
      href={`/casts/${cast.slug}`}
      style={{
        display: 'block',
        color: colors.text,
        textDecoration: 'none',
        borderRadius: '18px',
        overflow: 'hidden',
        border: `1px solid ${colors.line}`,
        background: colors.panelSoft,
        boxShadow: '0 18px 40px rgba(0,0,0,.22)',
      }}
    >
      <PlaceholderMedia
        src={cast.thumbnailUrl}
        alt={cast.name}
        label="Ảnh cast"
        style={{ height: '230px', position: 'relative' }}
      >
        <span
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            borderRadius: '999px',
            background: 'rgba(12,12,15,.72)',
            border: `1px solid ${colors.line}`,
            color: colors.goldSoft,
            padding: '5px 9px',
            fontSize: '11px',
            fontWeight: 900,
          }}
        >
          <Languages size={13} />
          {langText}
        </span>
        <span
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            background: 'rgba(12,12,15,.72)',
          }}
        >
          <Heart size={15} color="#fff" />
        </span>
      </PlaceholderMedia>
      <div style={{ padding: '13px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '15px', fontWeight: 900 }}>{cast.name}</div>
            <div
              style={{
                marginTop: '4px',
                color: colors.muted,
                fontSize: '12px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {cast.store.name}
            </div>
          </div>
          <span
            style={{
              flex: 'none',
              color: colors.goldSoft,
              fontSize: '12px',
              fontWeight: 900,
            }}
          >
            {priceText}
          </span>
        </div>
        <div
          style={{
            marginTop: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            color: colors.dim,
            fontSize: '12px',
          }}
        >
          <Sparkles size={14} color={colors.rose} />
          {categoryLabels[cast.store.category] ?? cast.store.category} · {areaLabel}
        </div>
        {cast.publicHeadline ? (
          <div
            style={{
              marginTop: '10px',
              color: colors.muted,
              fontSize: '12px',
              lineHeight: 1.45,
              minHeight: '34px',
            }}
          >
            {cast.publicHeadline}
          </div>
        ) : null}
      </div>
    </Link>
  );
}

function FilterRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '86px minmax(0, 1fr)',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <div
        style={{
          color: colors.dim,
          fontSize: '11px',
          fontWeight: 900,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      <div
        className="hscroll"
        style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}
      >
        {options.map((option) => (
          <button
            key={`${label}-${option.value || 'all'}`}
            type="button"
            onClick={() => onChange(option.value)}
            style={chipStyle(value === option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
