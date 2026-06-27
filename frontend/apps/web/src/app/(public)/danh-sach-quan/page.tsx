"use client";

import React, { type CSSProperties, useEffect, useMemo, useState } from 'react';
import { LocateFixed, MapPin, SlidersHorizontal } from 'lucide-react';

import {
  discoveryApi,
  type PublicArea,
  type PublicStore,
} from '@/lib/api/discovery';
import { BottomNav } from '@/components/layout/BottomNav';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { SearchBar } from '@/components/ui/SearchBar';
import { VenueCard } from '@/components/ui/VenueCard';
import type { Venue } from '@/types';

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
};

const cityOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'hn', label: 'HN' },
  { value: 'hcm', label: 'HCM' },
  { value: 'dn', label: 'ĐN' },
  { value: 'hp', label: 'HP' },
];

const categoryOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'BAR', label: 'Bar' },
  { value: 'CLUB', label: 'Club' },
  { value: 'LOUNGE', label: 'Lounge' },
  { value: 'KARAOKE', label: 'Karaoke / KTV' },
  { value: 'RESTAURANT', label: 'Nhà hàng' },
  { value: 'SPA', label: 'Spa' },
];

const categoryLabels: Record<string, string> = {
  BAR: 'Bar',
  CLUB: 'Club',
  LOUNGE: 'Lounge',
  KARAOKE: 'Karaoke / KTV',
  RESTAURANT: 'Nhà hàng',
  SPA: 'Spa',
  EVENT: 'Sự kiện',
  OTHER: 'Khác',
};

const cityLabels: Record<string, string> = {
  hn: 'Hà Nội',
  hcm: 'TP.HCM',
  dn: 'Đà Nẵng',
  hp: 'Hải Phòng',
};

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  background:
    'radial-gradient(circle at 82% 8%, rgba(212,178,106,.15), transparent 30%), linear-gradient(180deg,#0b0b0e 0%,#111114 52%,#09090b 100%)',
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

const actionButtonStyle: CSSProperties = {
  border: `1px solid ${colors.line}`,
  borderRadius: '14px',
  background: colors.panelSoft,
  color: colors.goldSoft,
  height: '44px',
  padding: '0 14px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '13px',
  fontWeight: 800,
  cursor: 'pointer',
};

const gradientByCategory: Record<string, string> = {
  BAR: 'linear-gradient(140deg,#35151d,#8d2d42)',
  CLUB: 'linear-gradient(140deg,#14142b,#6d28d9)',
  LOUNGE: 'linear-gradient(140deg,#19191d,#6d5a28)',
  KARAOKE: 'linear-gradient(140deg,#172331,#2d6fae)',
  RESTAURANT: 'linear-gradient(140deg,#16261f,#0f766e)',
  SPA: 'linear-gradient(140deg,#1d2330,#b07b3c)',
};

type Coordinates = {
  lat: number;
  lng: number;
};

const toVenue = (store: PublicStore): Venue => ({
  id: store.slug,
  name: store.name,
  area: [store.area?.name ?? store.district, cityLabels[store.cityCode ?? '']]
    .filter(Boolean)
    .join(' · '),
  catLabel: categoryLabels[store.category] ?? store.category,
  rating: 4.8,
  price:
    typeof store.distanceKm === 'number'
      ? `${store.distanceKm.toFixed(1)} km`
      : 'Đang mở',
  hasBadge: typeof store.distanceKm === 'number',
  badgeText: typeof store.distanceKm === 'number' ? 'Gần bạn' : undefined,
  badgeColor: '#d4b26a',
  img:
    store.thumbnailUrl ??
    `${gradientByCategory[store.category] ?? 'linear-gradient(140deg,#19191d,#2a2418)'}`,
});

export default function Page() {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [category, setCategory] = useState('');
  const [areas, setAreas] = useState<PublicArea[]>([]);
  const [stores, setStores] = useState<PublicStore[]>([]);
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setArea('');

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
    setIsLoading(true);
    setError(null);

    const timer = window.setTimeout(() => {
      discoveryApi
        .listStores({
          q: query,
          city,
          area,
          category,
          lat: coords?.lat,
          lng: coords?.lng,
          limit: 48,
        })
        .then((items) => {
          if (!cancelled) setStores(items);
        })
        .catch(() => {
          if (!cancelled) {
            setStores([]);
            setError('Chưa kết nối được dữ liệu quán.');
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
  }, [area, category, city, coords, query]);

  const venueCards = useMemo(() => stores.map(toVenue), [stores]);

  const requestNearby = () => {
    if (!navigator.geolocation) {
      setError('Thiết bị chưa hỗ trợ lấy vị trí.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLocating(false);
      },
      () => {
        setError('Chưa lấy được vị trí hiện tại.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

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
                  Danh sách quán
                </h1>
              </div>
              <button
                type="button"
                onClick={requestNearby}
                disabled={isLocating}
                style={{ ...actionButtonStyle, opacity: isLocating ? 0.65 : 1 }}
              >
                <LocateFixed size={17} />
                {coords ? 'Đang ưu tiên gần tôi' : isLocating ? 'Đang lấy vị trí' : 'Gần tôi'}
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) auto',
                gap: '12px',
                alignItems: 'center',
              }}
            >
              <SearchBar
                value={query}
                onSearch={(event) => setQuery(event.target.value)}
                placeholder="Tên quán, cast, khu vực..."
                style={{ minHeight: '48px' }}
              />
              <span
                style={{
                  ...actionButtonStyle,
                  cursor: 'default',
                  color: colors.muted,
                  whiteSpace: 'nowrap',
                }}
              >
                <SlidersHorizontal size={16} />
                {venueCards.length} kết quả
              </span>
            </div>

            <div style={{ display: 'grid', gap: '12px' }}>
              <FilterRow
                label="Thành phố"
                options={cityOptions}
                value={city}
                onChange={setCity}
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
                <b style={{ color: colors.text }}>{venueCards.length} quán</b> phù hợp
              </div>
              {coords ? (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    color: colors.goldSoft,
                    fontSize: '12px',
                    fontWeight: 800,
                  }}
                >
                  <MapPin size={15} />
                  Sắp xếp theo khoảng cách
                </div>
              ) : null}
            </div>

            {isLoading ? (
              <LoadingSkeleton />
            ) : venueCards.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '16px',
                }}
              >
                {venueCards.map((venue) => (
                  <VenueCard
                    key={venue.id}
                    venue={venue}
                    href={`/stores/${venue.id}`}
                    variant="vertical"
                  />
                ))}
              </div>
            ) : (
              <EmptyState title="Chưa có quán phù hợp" description="Đổi khu vực hoặc loại hình để xem thêm." />
            )}
          </section>
        </div>
      </main>
      <BottomNav />
    </React.Fragment>
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
