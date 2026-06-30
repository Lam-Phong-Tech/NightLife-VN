"use client";

import Link from "next/link";
import { ChevronDown, ChevronLeft, Crown, MapPin } from "lucide-react";
import React, { useMemo, useState } from "react";

type RankingKind = "cast" | "quan";
type RankingPeriod = "week" | "month";
type RankingArea = "hn" | "hcm" | "all";

type RankingItem = {
  name: string;
  area: string;
  href: string;
  image: string;
  kind: RankingKind;
  city: RankingArea;
};

type RankTone = {
  badge: string;
  text: string;
  icon: string;
  topBorder?: string;
};

const rankTones: RankTone[] = [
  {
    badge: "linear-gradient(135deg,#f4e3b4,#d4b26a)",
    text: "#e3c27e",
    icon: "#5a4413",
    topBorder: "rgba(212,178,106,.34)",
  },
  {
    badge: "linear-gradient(135deg,#e8e8ee,#b8b8c4)",
    text: "#b9b4ab",
    icon: "#4a4a52",
  },
  {
    badge: "linear-gradient(135deg,#f0c08a,#cf8f55)",
    text: "#d8a571",
    icon: "#5a3a18",
  },
  {
    badge: "linear-gradient(135deg,#86e0a8,#4cae78)",
    text: "#7fcf9e",
    icon: "#16402a",
  },
  {
    badge: "linear-gradient(135deg,#9db4ff,#6b86e6)",
    text: "#9db0e8",
    icon: "#1a2350",
  },
];

const rankingItems: RankingItem[] = [
  {
    name: "Yuki",
    area: "Tây Hồ · HN",
    href: "/casts/yuki",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=220&q=75",
    kind: "cast",
    city: "hn",
  },
  {
    name: "Hana",
    area: "Quận 1 · HCM",
    href: "/casts/hana",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=220&q=75",
    kind: "cast",
    city: "hcm",
  },
  {
    name: "Rina",
    area: "Kim Mã · HN",
    href: "/casts/rina",
    image: "https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=220&q=75",
    kind: "cast",
    city: "hn",
  },
  {
    name: "Michi",
    area: "Club Lumière · HN",
    href: "/casts/michi",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=220&q=75",
    kind: "cast",
    city: "hn",
  },
  {
    name: "Aiko",
    area: "Sora Lounge · HCM",
    href: "/casts/aiko",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=220&q=75",
    kind: "cast",
    city: "hcm",
  },
  {
    name: "Mei",
    area: "Hoàn Kiếm · HN",
    href: "/casts/mei",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=220&q=75",
    kind: "cast",
    city: "hn",
  },
  {
    name: "Saki",
    area: "Tây Hồ · HN",
    href: "/casts/saki",
    image: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=220&q=75",
    kind: "cast",
    city: "hn",
  },
  {
    name: "Rin",
    area: "Hoàn Kiếm · HN",
    href: "/casts/rin",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=220&q=75",
    kind: "cast",
    city: "hn",
  },
  {
    name: "Club Lumière",
    area: "Tây Hồ · HN",
    href: "/stores/neon-club",
    image: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=220&q=75",
    kind: "quan",
    city: "hn",
  },
  {
    name: "Sora Lounge",
    area: "Quận 1 · HCM",
    href: "/stores/jade-lounge",
    image: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=220&q=75",
    kind: "quan",
    city: "hcm",
  },
  {
    name: "KTV Hoàng Gia",
    area: "Kim Mã · HN",
    href: "/stores/golden-voice-ktv",
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=220&q=75",
    kind: "quan",
    city: "hn",
  },
  {
    name: "Diamond Bar",
    area: "Quận 3 · HCM",
    href: "/stores/crimson-bar",
    image: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=220&q=75",
    kind: "quan",
    city: "hcm",
  },
  {
    name: "Sakura Lounge",
    area: "Trúc Bạch · HN",
    href: "/stores/sakura-lounge",
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=220&q=75",
    kind: "quan",
    city: "hn",
  },
  {
    name: "Moonlight Bar",
    area: "Hoàn Kiếm · HN",
    href: "/stores/moonlight-bar",
    image: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=220&q=75",
    kind: "quan",
    city: "hn",
  },
  {
    name: "Velvet KTV",
    area: "Quận 1 · HCM",
    href: "/stores/velvet-ktv",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=220&q=75",
    kind: "quan",
    city: "hcm",
  },
  {
    name: "Aurora Club",
    area: "Tây Hồ · HN",
    href: "/stores/aurora-club",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=220&q=75",
    kind: "quan",
    city: "hn",
  },
];

const kindTabs: Array<{ key: RankingKind; label: string }> = [
  { key: "cast", label: "Cast" },
  { key: "quan", label: "Quán" },
];

const periodTabs: Array<{ key: RankingPeriod; label: string }> = [
  { key: "week", label: "Tuần" },
  { key: "month", label: "Tháng" },
];

const areaOptions: Array<{ key: RankingArea; label: string }> = [
  { key: "hn", label: "Hà Nội" },
  { key: "hcm", label: "TP.HCM" },
  { key: "all", label: "Tất cả" },
];

function getRankTone(rank: number) {
  return rankTones[rank - 1];
}

function KindTabs({
  rankingType,
  onChange,
}: {
  rankingType: RankingKind;
  onChange: (value: RankingKind) => void;
}) {
  return (
    <div className="vyr-ranking-segment vyr-kind-tabs" aria-label="Chuyển bảng xếp hạng">
      {kindTabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={rankingType === tab.key ? "is-active" : ""}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function PeriodTabs({
  period,
  onChange,
}: {
  period: RankingPeriod;
  onChange: (value: RankingPeriod) => void;
}) {
  return (
    <div className="vyr-ranking-period" aria-label="Chọn thời gian xếp hạng">
      {periodTabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={period === tab.key ? "is-active" : ""}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function AreaSelect({
  area,
  onChange,
}: {
  area: RankingArea;
  onChange: (value: RankingArea) => void;
}) {
  return (
    <label className="vyr-ranking-area">
      <MapPin size={15} strokeWidth={1.8} aria-hidden="true" />
      <select
        aria-label="Chọn khu vực"
        value={area}
        onChange={(event) => onChange(event.target.value as RankingArea)}
      >
        {areaOptions.map((option) => (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown size={13} strokeWidth={2} aria-hidden="true" />
    </label>
  );
}

export default function Page() {
  const [rankingType, setRankingType] = useState<RankingKind>("cast");
  const [period, setPeriod] = useState<RankingPeriod>("month");
  const [selectedArea, setSelectedArea] = useState<RankingArea>("hn");

  const list = useMemo(() => {
    const filtered = rankingItems.filter((item) => {
      const byKind = item.kind === rankingType;
      const byArea = selectedArea === "all" || selectedArea === "hn" || item.city === selectedArea;
      return byKind && byArea;
    });

    return filtered.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  }, [rankingType, selectedArea]);

  const dateLabel = period === "month" ? "Tháng 6 năm 2026" : "Tuần này";

  return (
    <main className="vyr-ranking-page">
      <section className="vyr-ranking-shell" aria-labelledby="vyr-ranking-title">
        <div className="vyr-ranking-heading">
          <div className="vyr-ranking-title-row">
            <button
              type="button"
              className="vyr-ranking-back"
              aria-label="Quay lại"
              onClick={() => window.history.back()}
            >
              <ChevronLeft size={18} strokeWidth={2} aria-hidden="true" />
            </button>
            <div>
              <h1 id="vyr-ranking-title">Bảng xếp hạng</h1>
              <p>{dateLabel}</p>
            </div>
          </div>

          <div className="vyr-ranking-desktop-controls">
            <PeriodTabs period={period} onChange={setPeriod} />
            <AreaSelect area={selectedArea} onChange={setSelectedArea} />
            <KindTabs rankingType={rankingType} onChange={setRankingType} />
          </div>
        </div>

        <div className="vyr-ranking-mobile-controls">
          <KindTabs rankingType={rankingType} onChange={setRankingType} />
          <div className="vyr-ranking-mobile-filter-row">
            <PeriodTabs period={period} onChange={setPeriod} />
            <AreaSelect area={selectedArea} onChange={setSelectedArea} />
          </div>
        </div>

        <div className="vyr-ranking-list" aria-label="Danh sách xếp hạng">
          {list.map((item) => {
            const tone = getRankTone(item.rank);
            const topRank = item.rank === 1;

            return (
              <Link
                key={`${rankingType}-${selectedArea}-${item.name}`}
                href={item.href}
                className={topRank ? "vyr-rank-row is-top-rank" : "vyr-rank-row"}
                style={{
                  borderColor: tone?.topBorder,
                }}
              >
                <span
                  className="vyr-rank-avatar"
                  style={{
                    backgroundImage: `url(${item.image})`,
                    borderColor: topRank ? "#d4b26a" : undefined,
                  }}
                />
                <span className="vyr-rank-copy">
                  <span className="vyr-rank-badge-line">
                    {tone ? (
                      <>
                        <span
                          className="vyr-rank-crown"
                          style={{
                            background: tone.badge,
                            color: tone.icon,
                          }}
                        >
                          <Crown size={16} fill="currentColor" strokeWidth={0} aria-hidden="true" />
                        </span>
                        <span className="vyr-rank-label" style={{ color: tone.text }}>
                          TOP {item.rank}
                        </span>
                      </>
                    ) : (
                      <span className="vyr-rank-number">{item.rank}</span>
                    )}
                  </span>
                  <strong>{item.name}</strong>
                  <small>{item.area}</small>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <style jsx global>{`
        .vyr-ranking-page {
          width: 100%;
          min-height: calc(100vh - 82px);
          background: #0c0c0f;
          color: #f3f0ea;
          font-family: var(--nl-font-sans);
          padding: 26px 30px 48px;
        }

        .vyr-ranking-shell {
          width: min(100%, 1180px);
          margin: 0 auto;
          background: #0e0d12;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 18px;
          box-shadow: 0 30px 70px -34px rgba(0, 0, 0, 0.7);
          padding: 26px 30px 32px;
        }

        .vyr-ranking-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
        }

        .vyr-ranking-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .vyr-ranking-back {
          display: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: transparent;
          color: #f3f0ea;
          align-items: center;
          justify-content: center;
          padding: 0;
          cursor: pointer;
        }

        .vyr-ranking-page h1 {
          margin: 0;
          color: #f3f0ea;
          font-size: 27px;
          line-height: 1.15;
          font-weight: 700;
          letter-spacing: 0;
        }

        .vyr-ranking-page p {
          margin: 4px 0 0;
          color: #d4b26a;
          font-size: 13px;
          line-height: 1.3;
          font-weight: 600;
        }

        .vyr-ranking-desktop-controls {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .vyr-ranking-mobile-controls {
          display: none;
        }

        .vyr-ranking-segment,
        .vyr-ranking-period {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 13px;
          padding: 4px;
        }

        .vyr-ranking-segment button,
        .vyr-ranking-period button {
          min-height: 0;
          border: 0;
          border-radius: 9px;
          background: transparent;
          color: #b6b1a6;
          cursor: pointer;
          font: inherit;
          font-size: 12.5px;
          font-weight: 600;
          line-height: 1;
          padding: 8px 18px;
          white-space: nowrap;
        }

        .vyr-ranking-period button {
          padding-inline: 14px;
        }

        .vyr-ranking-segment button.is-active,
        .vyr-ranking-period button.is-active {
          color: #241a0a;
          background: linear-gradient(135deg, #f0dda8, #d4b26a);
        }

        .vyr-ranking-area {
          min-height: 36px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 13px;
          padding: 0 12px 0 14px;
          color: #c5c0b6;
          background: transparent;
          position: relative;
        }

        .vyr-ranking-area svg:first-child {
          color: #c9a86a;
          flex: none;
        }

        .vyr-ranking-area svg:last-child {
          color: currentColor;
          flex: none;
          pointer-events: none;
        }

        .vyr-ranking-area select {
          min-height: 34px;
          appearance: none;
          border: 0;
          outline: 0;
          background: transparent;
          color: #c5c0b6;
          cursor: pointer;
          font: inherit;
          font-size: 13px;
          line-height: 1;
          padding: 0;
        }

        .vyr-ranking-area option {
          background: #15131a;
          color: #f3f0ea;
        }

        .vyr-ranking-list {
          display: flex;
          flex-direction: column;
          gap: 11px;
          margin-top: 22px;
        }

        .vyr-rank-row {
          width: 100%;
          min-height: 90px;
          display: flex;
          align-items: center;
          gap: 18px;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.03);
          color: #f3f0ea;
          text-decoration: none;
          padding: 15px 24px;
          transition:
            background 160ms ease,
            border-color 160ms ease,
            transform 160ms ease;
        }

        .vyr-rank-row:hover {
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 0.045);
          border-color: rgba(212, 178, 106, 0.28);
        }

        .vyr-rank-row.is-top-rank {
          background: linear-gradient(135deg, rgba(212, 178, 106, 0.13), rgba(255, 255, 255, 0.025));
        }

        .vyr-rank-avatar {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          flex: none;
          background-position: center;
          background-size: cover;
          border: 2px solid transparent;
        }

        .vyr-rank-copy {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .vyr-rank-badge-line {
          min-height: 30px;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .vyr-rank-crown {
          width: 30px;
          height: 30px;
          border-radius: 9px;
          flex: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vyr-rank-label {
          font-size: 11px;
          line-height: 1;
          font-weight: 700;
        }

        .vyr-rank-number {
          width: 30px;
          height: 30px;
          border-radius: 9px;
          flex: none;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(212, 178, 106, 0.3);
          background: rgba(212, 178, 106, 0.1);
          color: #d4b26a;
          font-size: 14px;
          font-weight: 800;
          line-height: 1;
        }

        .vyr-rank-copy strong {
          margin-top: 6px;
          color: #f3f0ea;
          font-size: 20px;
          line-height: 1.15;
          font-weight: 700;
          overflow-wrap: anywhere;
        }

        .vyr-rank-copy small {
          margin-top: 3px;
          color: #8c8679;
          font-size: 13px;
          line-height: 1.3;
        }

        @media (max-width: 767px) {
          .vyr-ranking-page {
            min-height: calc(100vh - 56px);
            padding: 6px 16px calc(100px + env(safe-area-inset-bottom));
          }

          .vyr-ranking-shell {
            width: 100%;
            margin: 0;
            padding: 0;
            border: 0;
            border-radius: 0;
            box-shadow: none;
            background: #0c0c0f;
          }

          .vyr-ranking-heading {
            display: block;
          }

          .vyr-ranking-title-row {
            padding: 6px 0 8px;
          }

          .vyr-ranking-back {
            display: inline-flex;
            flex: none;
          }

          .vyr-ranking-page h1 {
            font-size: 18px;
            font-weight: 700;
          }

          .vyr-ranking-page p {
            font-size: 11px;
            margin-top: 1px;
          }

          .vyr-ranking-desktop-controls {
            display: none;
          }

          .vyr-ranking-mobile-controls {
            display: flex;
            flex-direction: column;
            gap: 11px;
          }

          .vyr-kind-tabs {
            width: 100%;
          }

          .vyr-kind-tabs button {
            flex: 1;
            padding: 9px 0;
            font-size: 13px;
          }

          .vyr-ranking-mobile-filter-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
          }

          .vyr-ranking-period {
            gap: 6px;
            flex: none;
            background: transparent;
            border: 0;
            border-radius: 0;
            padding: 0;
          }

          .vyr-ranking-period button {
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 13px;
            background: rgba(255, 255, 255, 0.05);
            color: #c5c0b6;
            font-size: 11.5px;
            padding: 7px 13px;
          }

          .vyr-ranking-period button.is-active {
            color: #e3c27e;
            border-color: rgba(212, 178, 106, 0.3);
            background: rgba(212, 178, 106, 0.1);
          }

          .vyr-ranking-area {
            min-width: 112px;
            min-height: 29px;
            border: 0;
            padding: 0;
            justify-content: flex-end;
            background: transparent;
            font-size: 11.5px;
          }

          .vyr-ranking-area select {
            min-height: 29px;
            max-width: 80px;
            color: #c5c0b6;
            font-size: 11.5px;
          }

          .vyr-ranking-list {
            gap: 9px;
            margin-top: 10px;
            padding-bottom: 16px;
          }

          .vyr-rank-row {
            min-height: 70px;
            gap: 13px;
            border-radius: 15px;
            padding: 11px 13px;
          }

          .vyr-rank-avatar {
            width: 48px;
            height: 48px;
          }

          .vyr-rank-badge-line {
            min-height: 24px;
            gap: 7px;
          }

          .vyr-rank-crown,
          .vyr-rank-number {
            width: 24px;
            height: 24px;
            border-radius: 7px;
          }

          .vyr-rank-crown svg {
            width: 13px;
            height: 13px;
          }

          .vyr-rank-label {
            font-size: 9.5px;
          }

          .vyr-rank-number {
            font-size: 12px;
          }

          .vyr-rank-copy strong {
            margin-top: 5px;
            font-size: 16px;
          }

          .vyr-rank-copy small {
            margin-top: 1px;
            font-size: 11.5px;
          }
        }
      `}</style>
    </main>
  );
}
