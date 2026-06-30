"use client";

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import React, { useMemo, useState } from 'react';

type RankingKind = 'cast' | 'quan';
type RankingArea = 'all' | 'hn' | 'hcm';
type RankingCategory = 'all' | 'bar' | 'club' | 'karaoke' | 'lounge' | 'massage';

type RankingItem = {
  rank: number;
  numColor: string;
  crown: string;
  image: string;
  name: string;
  area: string;
  href: string;
  kind: RankingKind;
  city: Exclude<RankingArea, 'all'>;
  category: Exclude<RankingCategory, 'all'>;
  sponsored?: boolean;
};

const rankStyles = [
  { numColor: '#713f12', crown: 'linear-gradient(140deg, #fef08a, #eab308)' },
  { numColor: '#1e293b', crown: 'linear-gradient(140deg, #e2e8f0, #94a3b8)' },
  { numColor: '#451a03', crown: 'linear-gradient(140deg, #fed7aa, #b45309)' },
  { numColor: '#064e3b', crown: 'linear-gradient(140deg, #a7f3d0, #22c55e)' },
  { numColor: '#1e3a8a', crown: 'linear-gradient(140deg, #bfdbfe, #3b82f6)' },
] as const;

const adminRankingItems: RankingItem[] = [
  {
    rank: 1,
    ...rankStyles[0],
    image: "url('https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=180&q=70') center/cover",
    name: 'Yuki',
    area: 'Tây Hồ - HN · Club',
    href: '/casts/yuki',
    kind: 'cast',
    city: 'hn',
    category: 'club',
    sponsored: true,
  },
  {
    rank: 2,
    ...rankStyles[1],
    image: "url('https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=180&q=70') center/cover",
    name: 'Michi',
    area: 'Hoàn Kiếm - HN · Bar',
    href: '/casts/michi',
    kind: 'cast',
    city: 'hn',
    category: 'bar',
  },
  {
    rank: 3,
    ...rankStyles[2],
    image: "url('https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=180&q=70') center/cover",
    name: 'Rina',
    area: 'Kim Mã - HN · Lounge',
    href: '/casts/rina',
    kind: 'cast',
    city: 'hn',
    category: 'lounge',
  },
  {
    rank: 4,
    ...rankStyles[3],
    image: "url('https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=180&q=70') center/cover",
    name: 'Hana',
    area: 'Quận 3 - HCM · Lounge',
    href: '/casts/hana',
    kind: 'cast',
    city: 'hcm',
    category: 'lounge',
    sponsored: true,
  },
  {
    rank: 5,
    ...rankStyles[4],
    image: "url('https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=180&q=70') center/cover",
    name: 'Aiko',
    area: 'Quận 1 - HCM · Bar',
    href: '/casts/aiko',
    kind: 'cast',
    city: 'hcm',
    category: 'bar',
  },
  {
    rank: 1,
    ...rankStyles[0],
    image: "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=180&q=70') center/cover",
    name: 'Club Lumière',
    area: 'Tây Hồ - HN · Club',
    href: '/stores/neon-club',
    kind: 'quan',
    city: 'hn',
    category: 'club',
    sponsored: true,
  },
  {
    rank: 2,
    ...rankStyles[1],
    image: "url('https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=180&q=70') center/cover",
    name: 'Sora Lounge',
    area: 'Quận 1 - HCM · Lounge',
    href: '/stores/jade-lounge',
    kind: 'quan',
    city: 'hcm',
    category: 'lounge',
  },
  {
    rank: 3,
    ...rankStyles[2],
    image: "url('https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=180&q=70') center/cover",
    name: 'KTV Hoàng Gia',
    area: 'Kim Mã - HN · Karaoke',
    href: '/stores/golden-voice-ktv',
    kind: 'quan',
    city: 'hn',
    category: 'karaoke',
    sponsored: true,
  },
  {
    rank: 4,
    ...rankStyles[3],
    image: "url('https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=180&q=70') center/cover",
    name: 'Diamond Bar',
    area: 'Quận 3 - HCM · Bar',
    href: '/stores/crimson-bar',
    kind: 'quan',
    city: 'hcm',
    category: 'bar',
  },
  {
    rank: 5,
    ...rankStyles[4],
    image: "url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=180&q=70') center/cover",
    name: 'Sakura Lounge',
    area: 'Trúc Bạch - HN · Lounge',
    href: '/stores/sakura-lounge',
    kind: 'quan',
    city: 'hn',
    category: 'lounge',
  },
];

const areaFilters: Array<{ key: RankingArea; label: string }> = [
  { key: 'all', label: 'Tất cả' },
  { key: 'hn', label: 'Hà Nội' },
  { key: 'hcm', label: 'TP.HCM' },
];

const categoryFilters: Array<{ key: RankingCategory; label: string }> = [
  { key: 'all', label: 'Tất cả danh mục' },
  { key: 'club', label: 'Club' },
  { key: 'bar', label: 'Bar' },
  { key: 'lounge', label: 'Lounge' },
  { key: 'karaoke', label: 'Karaoke / KTV' },
  { key: 'massage', label: 'Massage' },
];

export default function Page() {
  const [rankingType, setRankingType] = useState<RankingKind>('cast');
  const [selectedArea, setSelectedArea] = useState<RankingArea>('all');
  const [selectedCategory, setSelectedCategory] = useState<RankingCategory>('all');

  const list = useMemo(
    () =>
      adminRankingItems
        .filter((item) => item.kind === rankingType)
        .filter((item) => selectedArea === 'all' || item.city === selectedArea)
        .filter((item) => selectedCategory === 'all' || item.category === selectedCategory)
        .slice(0, 5)
        .map((item, index) => ({
          ...item,
          rank: index + 1,
          numColor: rankStyles[index]?.numColor ?? item.numColor,
          crown: rankStyles[index]?.crown ?? item.crown,
        })),
    [rankingType, selectedArea, selectedCategory],
  );

  const title = rankingType === 'quan' ? 'Quán' : 'Cast';
  const pageStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '100vh',
    padding: '40px 42px 56px',
    background: '#101014',
    color: '#f8f3e7',
    fontFamily: 'var(--nl-font-sans)',
  };
  const headStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'end',
    justifyContent: 'space-between',
    gap: '24px',
    marginBottom: '30px',
  };
  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: '32px',
    lineHeight: 1.15,
    fontWeight: 900,
    color: '#fff8e6',
  };
  const subTitleStyle: React.CSSProperties = {
    margin: '10px 0 0',
    color: '#c7bd9e',
    fontSize: '15px',
  };
  const tabWrapStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px',
    border: '1px solid rgba(222, 181, 92, 0.28)',
    borderRadius: '20px',
    background: '#141418',
  };
  const filterStackStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '26px',
  };
  const filterWrapStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };
  const inactiveButtonStyle: React.CSSProperties = {
    border: '1px solid rgba(222, 181, 92, 0.25)',
    borderRadius: '18px',
    padding: '10px 20px',
    color: '#ddd0af',
    background: 'transparent',
    fontWeight: 800,
    cursor: 'pointer',
    font: 'inherit',
  };
  const activeButtonStyle: React.CSSProperties = {
    ...inactiveButtonStyle,
    color: '#17130b',
    background: 'linear-gradient(135deg, #f4d989, #d1a944)',
  };
  const listStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  };
  const rowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '54px 70px 1fr 24px',
    alignItems: 'center',
    gap: '18px',
    width: '100%',
    minHeight: '108px',
    padding: '18px 22px',
    border: '1px solid rgba(222, 181, 92, 0.22)',
    borderRadius: '16px',
    background: '#141418',
    color: '#f8f3e7',
    textDecoration: 'none',
    boxShadow: '0 14px 34px rgba(0, 0, 0, 0.18)',
  };
  const rankBadgeStyle: React.CSSProperties = {
    width: '54px',
    height: '54px',
    borderRadius: '14px',
    display: 'grid',
    placeItems: 'center',
    fontSize: '22px',
    fontWeight: 900,
  };
  const rankAvatarStyle: React.CSSProperties = {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    border: '1px solid rgba(244, 217, 137, 0.25)',
  };
  const rankCopyStyle: React.CSSProperties = {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  };

  const tabs = useMemo(
    () => [
      { key: 'cast' as const, label: 'Cast' },
      { key: 'quan' as const, label: 'Quán' },
    ],
    [],
  );

  return (
    <main className="ranking-page" style={pageStyle}>
      <section className="ranking-head" style={headStyle}>
        <div>
          <h1 style={titleStyle}>Bảng xếp hạng {title}</h1>
          <p style={subTitleStyle}>Top 1-5 theo khu vực/danh mục</p>
        </div>

        <div className="ranking-tabs" aria-label="Chuyển bảng xếp hạng" style={tabWrapStyle}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={rankingType === tab.key ? 'active' : ''}
              style={rankingType === tab.key ? activeButtonStyle : inactiveButtonStyle}
              onClick={() => setRankingType(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      <div className="ranking-filter-stack" style={filterStackStyle}>
        <div className="ranking-filters" aria-label="Lọc khu vực" style={filterWrapStyle}>
          {areaFilters.map((area) => (
            <button
              key={area.key}
              type="button"
              className={selectedArea === area.key ? 'active' : ''}
              style={selectedArea === area.key ? activeButtonStyle : inactiveButtonStyle}
              onClick={() => setSelectedArea(area.key)}
            >
              {area.label}
            </button>
          ))}
        </div>

        <div className="ranking-filters" aria-label="Lọc danh mục" style={filterWrapStyle}>
          {categoryFilters.map((category) => (
            <button
              key={category.key}
              type="button"
              className={selectedCategory === category.key ? 'active' : ''}
              style={selectedCategory === category.key ? activeButtonStyle : inactiveButtonStyle}
              onClick={() => setSelectedCategory(category.key)}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <section className="ranking-list" aria-label={`Bảng xếp hạng ${title}`} style={listStyle}>
        {list.map((item) => (
          <Link key={`${rankingType}-${item.city}-${item.category}-${item.rank}`} href={item.href} className="ranking-row" style={rowStyle}>
            <span className="rank-badge" style={{ ...rankBadgeStyle, color: item.numColor, background: item.crown }}>
              {item.rank}
            </span>
            <span className="rank-avatar" style={{ ...rankAvatarStyle, background: item.image }} />
            <span className="rank-copy" style={rankCopyStyle}>
              <span className="rank-title-line">
                <strong>{item.name}</strong>
                {item.sponsored ? <span className="sponsored-badge">Tài trợ</span> : null}
              </span>
              <small>{item.area}</small>
            </span>
            <span className="rank-arrow" aria-hidden="true">
              <ChevronRight size={24} strokeWidth={2.35} />
            </span>
          </Link>
        ))}
      </section>

      <style jsx global>{`
        .ranking-page {
          width: 100%;
          min-height: 100vh;
          padding: 40px 42px 56px;
          background: #101014;
          color: #f8f3e7;
          font-family: var(--nl-font-sans);
        }

        .ranking-head {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 30px;
        }

        h1 {
          margin: 0;
          font-size: 32px;
          line-height: 1.15;
          font-weight: 900;
          color: #fff8e6;
        }

        p {
          margin: 10px 0 0;
          color: #c7bd9e;
          font-size: 15px;
        }

        .ranking-tabs,
        .ranking-filters {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ranking-filter-stack {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 26px;
        }

        .ranking-filters {
          flex-wrap: wrap;
        }

        .ranking-tabs {
          padding: 4px;
          border: 1px solid rgba(222, 181, 92, 0.28);
          border-radius: 20px;
          background: #141418;
        }

        button {
          border: 0;
          cursor: pointer;
          font: inherit;
        }

        .ranking-tabs button,
        .ranking-filters button {
          border-radius: 18px;
          padding: 10px 20px;
          color: #ddd0af;
          background: transparent;
          font-weight: 800;
        }

        .ranking-tabs button.active,
        .ranking-filters button.active {
          color: #17130b;
          background: linear-gradient(135deg, #f4d989, #d1a944);
        }

        .ranking-filters button {
          border: 1px solid rgba(222, 181, 92, 0.25);
        }

        .ranking-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .ranking-row {
          display: grid;
          grid-template-columns: 54px 70px 1fr 24px;
          align-items: center;
          gap: 18px;
          min-height: 108px;
          padding: 18px 22px;
          border: 1px solid rgba(222, 181, 92, 0.22);
          border-radius: 16px;
          background: #141418;
          color: inherit;
          text-decoration: none;
          box-shadow: 0 14px 34px rgba(0, 0, 0, 0.18);
          transition: border-color 160ms ease, transform 160ms ease, background 160ms ease;
        }

        .ranking-row:hover {
          transform: translateY(-2px);
          border-color: rgba(244, 217, 137, 0.55);
          background: #17171c;
        }

        .rank-badge {
          width: 54px;
          height: 54px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          font-size: 22px;
          font-weight: 900;
        }

        .rank-avatar {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          border: 1px solid rgba(244, 217, 137, 0.25);
        }

        .rank-copy {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .rank-title-line {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
          flex-wrap: wrap;
        }

        .rank-copy strong {
          color: #fff8e6;
          font-size: 20px;
        }

        .rank-copy small {
          color: #c7bd9e;
          font-size: 15px;
        }

        .sponsored-badge {
          border: 1px solid rgba(244, 217, 137, 0.5);
          border-radius: 999px;
          padding: 3px 9px;
          color: #17130b;
          background: linear-gradient(135deg, #f4d989, #d1a944);
          font-size: 11px;
          font-weight: 900;
          white-space: nowrap;
        }

        .rank-arrow {
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          color: rgba(240, 221, 168, 0.58);
          line-height: 1;
        }

        .ranking-row:hover .rank-arrow {
          color: #f0dda8;
        }

        @media (max-width: 767px) {
          .ranking-page {
            padding: 22px 16px 112px;
          }

          .ranking-head {
            align-items: stretch;
            flex-direction: column;
            margin-bottom: 18px;
          }

          h1 {
            font-size: 25px;
          }

          p {
            font-size: 13px;
          }

          .ranking-tabs {
            align-self: stretch;
          }

          .ranking-tabs button {
            flex: 1;
          }

          .ranking-filter-stack {
            margin-bottom: 18px;
          }

          .ranking-filters {
            flex-wrap: nowrap;
            overflow-x: auto;
            padding-bottom: 3px;
          }

          .ranking-filters button {
            flex: none;
          }

          .ranking-row {
            grid-template-columns: 42px 52px minmax(0, 1fr) 24px;
            gap: 10px;
            min-height: 76px;
            padding: 12px;
          }

          .ranking-list {
            gap: 10px;
          }

          .rank-badge {
            width: 42px;
            height: 42px;
            border-radius: 12px;
            font-size: 18px;
          }

          .rank-avatar {
            width: 52px;
            height: 52px;
          }

          .rank-copy strong {
            font-size: 15px;
          }

          .rank-copy small {
            font-size: 11.5px;
          }

          .rank-copy {
            gap: 3px;
          }

          .rank-arrow {
            width: 24px;
            height: 24px;
          }
        }
      `}</style>
    </main>
  );
}
