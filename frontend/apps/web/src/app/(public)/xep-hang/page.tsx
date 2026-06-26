"use client";

import Link from 'next/link';
import React, { useMemo, useState } from 'react';

type RankingKind = 'quan' | 'cast';

type RankingItem = {
  rank: number;
  numColor: string;
  crown: string;
  image: string;
  name: string;
  area: string;
  metric: string;
  href: string;
};

const storeRankings: RankingItem[] = [
  {
    rank: 1,
    numColor: '#713f12',
    crown: 'linear-gradient(140deg, #fef08a, #eab308)',
    image: "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=180&q=70') center/cover",
    name: 'Club Lumière',
    area: 'Tây Hồ - HN',
    metric: '12.4k lượt',
    href: '/stores/club-lumiere',
  },
  {
    rank: 2,
    numColor: '#1e293b',
    crown: 'linear-gradient(140deg, #e2e8f0, #94a3b8)',
    image: "url('https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=180&q=70') center/cover",
    name: 'Sora Lounge',
    area: 'Quận 1 - HCM',
    metric: '11.8k lượt',
    href: '/stores/sora-lounge',
  },
  {
    rank: 3,
    numColor: '#451a03',
    crown: 'linear-gradient(140deg, #fed7aa, #b45309)',
    image: "url('https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=180&q=70') center/cover",
    name: 'KTV Hoàng Gia',
    area: 'Kim Mã - HN',
    metric: '9.7k lượt',
    href: '/stores/ktv-hoang-gia',
  },
  {
    rank: 4,
    numColor: '#064e3b',
    crown: 'linear-gradient(140deg, #a7f3d0, #22c55e)',
    image: "url('https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=180&q=70') center/cover",
    name: 'Diamond Bar',
    area: 'Quận 3 - HCM',
    metric: '8.9k lượt',
    href: '/stores/diamond-bar',
  },
  {
    rank: 5,
    numColor: '#1e3a8a',
    crown: 'linear-gradient(140deg, #bfdbfe, #3b82f6)',
    image: "url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=180&q=70') center/cover",
    name: 'Sakura Lounge',
    area: 'Trúc Bạch - HN',
    metric: '8.1k lượt',
    href: '/stores/sakura-lounge',
  },
];

const castRankings: RankingItem[] = [
  {
    rank: 1,
    numColor: '#713f12',
    crown: 'linear-gradient(140deg, #fef08a, #eab308)',
    image: "url('https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=180&q=70') center/cover",
    name: 'Michi',
    area: '23 tuổi - Nổi tiếng Nhật',
    metric: '4.9 sao',
    href: '/casts/michi',
  },
  {
    rank: 2,
    numColor: '#1e293b',
    crown: 'linear-gradient(140deg, #e2e8f0, #94a3b8)',
    image: "url('https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=180&q=70') center/cover",
    name: 'Yuki',
    area: '24 tuổi - Phong cách đẹp',
    metric: '4.8 sao',
    href: '/casts/yuki',
  },
  {
    rank: 3,
    numColor: '#451a03',
    crown: 'linear-gradient(140deg, #fed7aa, #b45309)',
    image: "url('https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=180&q=70') center/cover",
    name: 'Rina',
    area: '21 tuổi - Trong độ tuổi 20',
    metric: '4.7 sao',
    href: '/casts/rina',
  },
  {
    rank: 4,
    numColor: '#064e3b',
    crown: 'linear-gradient(140deg, #a7f3d0, #22c55e)',
    image: "url('https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=180&q=70') center/cover",
    name: 'Hana',
    area: '22 tuổi - Tiếng Anh',
    metric: '4.7 sao',
    href: '/casts/hana',
  },
  {
    rank: 5,
    numColor: '#1e3a8a',
    crown: 'linear-gradient(140deg, #bfdbfe, #3b82f6)',
    image: "url('https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=180&q=70') center/cover",
    name: 'Aiko',
    area: '25 tuổi - Hà Nội',
    metric: '4.6 sao',
    href: '/casts/aiko',
  },
];

const areas = ['Tất cả', 'Hà Nội', 'TP.HCM'];

export default function Page() {
  const [rankingType, setRankingType] = useState<RankingKind>('quan');

  const list = rankingType === 'quan' ? storeRankings : castRankings;
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
  const filterWrapStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '26px',
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
    gridTemplateColumns: '54px 70px 1fr auto 24px',
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
      { key: 'quan' as const, label: 'Quan' },
    ],
    [],
  );

  return (
    <main className="ranking-page" style={pageStyle}>
      <section className="ranking-head" style={headStyle}>
        <div>
          <h1 style={titleStyle}>Bảng xếp hạng {title}</h1>
          <p style={subTitleStyle}>Kỳ tháng 6/2026 - cập nhật 21/06 - giới hạn Top 5</p>
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

      <div className="ranking-filters" aria-label="Lọc khu vực" style={filterWrapStyle}>
        {areas.map((area, index) => (
          <button key={area} type="button" className={index === 0 ? 'active' : ''} style={index === 0 ? activeButtonStyle : inactiveButtonStyle}>
            {area}
          </button>
        ))}
      </div>

      <section className="ranking-list" aria-label={`Bảng xếp hạng ${title}`} style={listStyle}>
        {list.map((item) => (
          <Link key={`${rankingType}-${item.rank}`} href={item.href} className="ranking-row" style={rowStyle}>
            <span className="rank-badge" style={{ ...rankBadgeStyle, color: item.numColor, background: item.crown }}>
              {item.rank}
            </span>
            <span className="rank-avatar" style={{ ...rankAvatarStyle, background: item.image }} />
            <span className="rank-copy" style={rankCopyStyle}>
              <strong style={{ color: '#fff8e6', fontSize: '20px' }}>{item.name}</strong>
              <small style={{ color: '#c7bd9e', fontSize: '15px' }}>{item.area}</small>
            </span>
            <span className="rank-metric" style={{ color: '#f1ce69', fontWeight: 900, whiteSpace: 'nowrap' }}>
              {item.metric}
            </span>
            <span className="rank-arrow" aria-hidden="true" style={{ color: '#8f8877', fontSize: '36px', lineHeight: 1 }}>
              ›
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

        .ranking-filters {
          margin-bottom: 26px;
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
          grid-template-columns: 54px 70px 1fr auto 24px;
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

        .rank-copy strong {
          color: #fff8e6;
          font-size: 20px;
        }

        .rank-copy small {
          color: #c7bd9e;
          font-size: 15px;
        }

        .rank-metric {
          color: #f1ce69;
          font-weight: 900;
          white-space: nowrap;
        }

        .rank-arrow {
          color: #8f8877;
          font-size: 36px;
          line-height: 1;
        }

        @media (max-width: 767px) {
          .ranking-page {
            padding: 22px 16px 36px;
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

          .ranking-filters {
            overflow-x: auto;
            padding-bottom: 3px;
          }

          .ranking-filters button {
            flex: none;
          }

          .ranking-row {
            grid-template-columns: 42px 52px 1fr;
            gap: 12px;
            min-height: 88px;
            padding: 14px;
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
            font-size: 16px;
          }

          .rank-copy small {
            font-size: 12px;
          }

          .rank-metric {
            grid-column: 3;
            font-size: 12px;
          }

          .rank-arrow {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}
