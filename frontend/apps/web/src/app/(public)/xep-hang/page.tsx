"use client";

import Link from "next/link";
import {
  CalendarCheck,
  ChevronDown,
  ChevronLeft,
  Crown,
  MapPin,
  Phone,
  RefreshCcw,
  Store,
  UserRound,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  rankingsApi,
  type PublicRankingItem,
  type RankingCategory,
  type RankingCity,
  type RankingTargetType,
} from "@/lib/api/rankings";
import { trackRankingClick, type RankingClickContext } from "@/lib/analytics/ranking";

type RankingKind = "cast" | "quan";
type RankingPeriod = "week" | "month";
type CategoryFilter = "all" | RankingCategory;
type LoadState = "loading" | "ready" | "error";

type SelectOption<T extends string> = {
  key: T;
  label: string;
};

const rankTones = [
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
    topBorder: undefined,
  },
  {
    badge: "linear-gradient(135deg,#f0c08a,#cf8f55)",
    text: "#d8a571",
    icon: "#5a3a18",
    topBorder: undefined,
  },
  {
    badge: "linear-gradient(135deg,#86e0a8,#4cae78)",
    text: "#7fcf9e",
    icon: "#16402a",
    topBorder: undefined,
  },
  {
    badge: "linear-gradient(135deg,#9db4ff,#6b86e6)",
    text: "#9db0e8",
    icon: "#1a2350",
    topBorder: undefined,
  },
] as const;

const kindTabs: Array<SelectOption<RankingKind>> = [
  { key: "cast", label: "Cast" },
  { key: "quan", label: "Quán" },
];

const periodTabs: Array<SelectOption<RankingPeriod>> = [
  { key: "week", label: "Tuần" },
  { key: "month", label: "Tháng" },
];

const areaOptions: Array<SelectOption<RankingCity>> = [
  { key: "hn", label: "Hà Nội" },
  { key: "hcm", label: "TP.HCM" },
  { key: "all", label: "Tổng hợp" },
];

const categoryOptions: Array<SelectOption<CategoryFilter>> = [
  { key: "all", label: "Tất cả loại hình" },
  { key: "bar", label: "Bar" },
  { key: "club", label: "Club" },
  { key: "lounge", label: "Lounge" },
  { key: "girls_bar", label: "Girls bar" },
  { key: "karaoke", label: "Karaoke" },
  { key: "massage_spa", label: "Massage/Spa" },
  { key: "restaurant", label: "Restaurant" },
  { key: "casino", label: "Casino" },
];

const targetTypeByKind: Record<RankingKind, RankingTargetType> = {
  cast: "CAST",
  quan: "STORE",
};

function getRankTone(rank: number) {
  return rankTones[rank - 1];
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatCategory(value?: string | null) {
  if (!value) return "Chưa phân loại";
  const token = value.toLowerCase() as CategoryFilter;
  return (
    categoryOptions.find((option) => option.key === token)?.label ??
    value
      .toLowerCase()
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

function KindTabs({
  rankingType,
  onChange,
  testIdPrefix,
}: {
  rankingType: RankingKind;
  onChange: (value: RankingKind) => void;
  testIdPrefix: string;
}) {
  return (
    <div className="vyr-ranking-segment vyr-kind-tabs" aria-label="Chuyển bảng xếp hạng">
      {kindTabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={rankingType === tab.key ? "is-active" : ""}
          data-testid={`${testIdPrefix}-${tab.key}`}
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

function RankingSelect<T extends string>({
  value,
  options,
  onChange,
  label,
  icon,
  testId,
  className = "",
}: {
  value: T;
  options: Array<SelectOption<T>>;
  onChange: (value: T) => void;
  label: string;
  icon?: React.ReactNode;
  testId?: string;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.key === value) ?? {
    key: value,
    label: value,
  };

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && rootRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("pointerdown", closeOnOutsideClick);
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("pointerdown", closeOnOutsideClick);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  return (
    <div
      ref={rootRef}
      className={`vyr-ranking-select ${isOpen ? "is-open" : ""} ${className}`}
      data-testid={testId}
    >
      {icon}
      <button
        type="button"
        className="vyr-ranking-select-trigger"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span>{selectedOption.label}</span>
        <ChevronDown size={13} strokeWidth={2} aria-hidden="true" />
      </button>

      {isOpen ? (
        <div className="vyr-ranking-select-menu" role="listbox" aria-label={label}>
          {options.map((option) => (
            <button
              key={option.key}
              type="button"
              role="option"
              aria-selected={value === option.key}
              className={value === option.key ? "is-selected" : ""}
              onClick={() => {
                onChange(option.key);
                setIsOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="vyr-rank-row vyr-rank-skeleton"
          data-testid="ranking-loading-row"
        >
          <span className="vyr-rank-avatar" />
          <span className="vyr-rank-copy">
            <span className="vyr-rank-badge-line" />
            <strong />
            <small />
          </span>
        </div>
      ))}
    </>
  );
}

function RankingRow({
  item,
  trackingContext,
}: {
  item: PublicRankingItem;
  trackingContext: RankingClickContext;
}) {
  const tone = getRankTone(item.rank);
  const topRank = item.rank === 1;
  const podiumRank = item.rank <= 3;
  const isStore = item.targetType === "STORE";
  const primaryHref = item.href || (isStore ? `/stores/${item.slug}` : `/casts/${item.slug}`);
  const bookingHref = `/dat-cho?${new URLSearchParams({
    castSlug: item.slug,
    castName: item.name,
  }).toString()}`;
  const areaLine = [item.area, item.cityCode?.toUpperCase() || item.city]
    .filter(Boolean)
    .join(" · ");
  const primaryAction = isStore ? "store" : "profile";

  return (
    <article
      className={[
        "vyr-rank-row",
        topRank ? "is-top-rank" : "",
        podiumRank ? "is-podium-rank" : "",
        `is-rank-${item.rank}`,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ borderColor: tone?.topBorder }}
      data-testid={`ranking-card-${item.rank}`}
    >
      <span
        className={item.image ? "vyr-rank-avatar" : "vyr-rank-avatar vyr-rank-avatar-fallback"}
        style={
          item.image
            ? {
                backgroundImage: `url(${item.image})`,
                borderColor: topRank ? "#d4b26a" : undefined,
              }
            : undefined
        }
        aria-hidden="true"
      >
        {!item.image ? getInitials(item.name) : null}
      </span>

      <span className="vyr-rank-copy">
        <span className="vyr-rank-badge-line">
          {tone ? (
            <>
              <span className="vyr-rank-crown" style={{ background: tone.badge, color: tone.icon }}>
                <Crown size={16} fill="currentColor" strokeWidth={0} aria-hidden="true" />
              </span>
              <span className="vyr-rank-label" style={{ color: tone.text }}>
                TOP {item.rank}
              </span>
            </>
          ) : (
            <span className="vyr-rank-number">{item.rank}</span>
          )}
          {item.sponsored ? (
            <span className="vyr-sponsored" data-testid="ranking-sponsored-badge">
              Tài trợ
            </span>
          ) : null}
        </span>
        <strong>{item.name}</strong>
        <small>
          {areaLine}
          <span aria-hidden="true"> · </span>
          {formatCategory(item.category)}
          {item.pinRank ? (
            <>
              <span aria-hidden="true"> · </span>
              Pin #{item.pinRank}
            </>
          ) : null}
        </small>
      </span>

      <span className="vyr-rank-actions">
        <Link
          className="vyr-rank-action is-primary"
          href={primaryHref}
          onClick={() => trackRankingClick(item, primaryAction, trackingContext)}
        >
          {isStore ? <Store size={15} /> : <UserRound size={15} />}
          {isStore ? "Xem chi tiết" : "Xem profile"}
        </Link>
        {isStore ? (
          item.phone ? (
            <a
              className="vyr-rank-action"
              href={`tel:${item.phone}`}
              onClick={() => trackRankingClick(item, "call", trackingContext)}
            >
              <Phone size={15} />
              Gọi ngay
            </a>
          ) : (
            <span className="vyr-rank-action is-disabled">
              <Phone size={15} />
              Gọi ngay
            </span>
          )
        ) : (
          <Link
            className="vyr-rank-action"
            href={bookingHref}
            onClick={() => trackRankingClick(item, "booking", trackingContext)}
          >
            <CalendarCheck size={15} />
            Đặt theo cast
          </Link>
        )}
      </span>
    </article>
  );
}

export default function Page() {
  const [rankingType, setRankingType] = useState<RankingKind>("cast");
  const [period, setPeriod] = useState<RankingPeriod>("month");
  const [selectedArea, setSelectedArea] = useState<RankingCity>("hn");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [list, setList] = useState<PublicRankingItem[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const query = useMemo(
    () => ({
      targetType: targetTypeByKind[rankingType],
      city: selectedArea,
      category: selectedCategory === "all" ? undefined : selectedCategory,
      limit: 5,
    }),
    [rankingType, selectedArea, selectedCategory],
  );

  const markRankingLoading = () => {
    setLoadState("loading");
    setErrorMessage("");
  };

  const changeRankingType = (value: RankingKind) => {
    markRankingLoading();
    setRankingType(value);
  };

  const changeSelectedArea = (value: RankingCity) => {
    markRankingLoading();
    setSelectedArea(value);
  };

  const changeSelectedCategory = (value: CategoryFilter) => {
    markRankingLoading();
    setSelectedCategory(value);
  };

  const retryRanking = () => {
    markRankingLoading();
    setReloadKey((key) => key + 1);
  };

  useEffect(() => {
    const controller = new AbortController();

    rankingsApi
      .list(query, { signal: controller.signal })
      .then((response) => {
        setList(response.data);
        setLoadState("ready");
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setList([]);
        setErrorMessage(error instanceof Error ? error.message : "Không tải được bảng xếp hạng.");
        setLoadState("error");
      });

    return () => controller.abort();
  }, [query, reloadKey]);

  const dateLabel = period === "month" ? "Tháng 6 năm 2026" : "Tuần này";
  const hasItems = list.length > 0;
  const trackingContext: RankingClickContext = {
    city: selectedArea,
    category: selectedCategory,
    targetType: query.targetType,
    surface: "ranking-card",
  };

  return (
    <main className="vyr-ranking-page" data-testid="ranking-page">
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
            <RankingSelect
              value={selectedArea}
              options={areaOptions}
              onChange={changeSelectedArea}
              label="Chọn khu vực"
              icon={<MapPin size={15} strokeWidth={1.8} aria-hidden="true" />}
              testId="ranking-city-select"
            />
            <RankingSelect
              value={selectedCategory}
              options={categoryOptions}
              onChange={changeSelectedCategory}
              label="Chọn loại hình"
              testId="ranking-category-select"
              className="vyr-category-select"
            />
            <KindTabs
              rankingType={rankingType}
              onChange={changeRankingType}
              testIdPrefix="ranking-kind"
            />
          </div>
        </div>

        <div className="vyr-ranking-mobile-controls">
          <KindTabs
            rankingType={rankingType}
            onChange={changeRankingType}
            testIdPrefix="ranking-kind-mobile"
          />
          <div className="vyr-ranking-mobile-filter-row">
            <PeriodTabs period={period} onChange={setPeriod} />
            <RankingSelect
              value={selectedArea}
              options={areaOptions}
              onChange={changeSelectedArea}
              label="Chọn khu vực"
              icon={<MapPin size={13} strokeWidth={1.8} aria-hidden="true" />}
              testId="ranking-city-select-mobile"
            />
          </div>
          <RankingSelect
            value={selectedCategory}
            options={categoryOptions}
            onChange={changeSelectedCategory}
            label="Chọn loại hình"
            testId="ranking-category-select-mobile"
            className="vyr-category-select"
          />
        </div>

        <div className="vyr-ranking-list" aria-live="polite">
          {loadState === "loading" ? <LoadingRows /> : null}

          {loadState === "error" ? (
            <div className="vyr-ranking-state is-error">
              <strong>API ranking đang lỗi</strong>
              <span>{errorMessage}</span>
              <button type="button" onClick={retryRanking}>
                <RefreshCcw size={15} />
                Tải lại
              </button>
            </div>
          ) : null}

          {loadState === "ready" && !hasItems ? (
            <div className="vyr-ranking-state" data-testid="ranking-empty-state">
              <strong>Chưa có ranking phù hợp</strong>
              <span>Thử đổi khu vực hoặc loại hình để xem bảng khác.</span>
              <button
                type="button"
                onClick={() => {
                  markRankingLoading();
                  setSelectedArea("all");
                  setSelectedCategory("all");
                }}
              >
                <RefreshCcw size={15} />
                Xem tổng hợp
              </button>
            </div>
          ) : null}

          {loadState === "ready" && hasItems
            ? list.map((item) => (
                <RankingRow key={item.targetId} item={item} trackingContext={trackingContext} />
              ))
            : null}
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
          gap: 12px;
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

        .vyr-ranking-select {
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
          z-index: 30;
        }

        .vyr-ranking-select > svg {
          color: #c9a86a;
          flex: none;
        }

        .vyr-ranking-select-trigger {
          min-height: 34px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 0;
          background: transparent;
          color: #c5c0b6;
          cursor: pointer;
          font: inherit;
          font-size: 13px;
          font-weight: 600;
          line-height: 1;
          padding: 0;
          white-space: nowrap;
        }

        .vyr-category-select .vyr-ranking-select-trigger {
          max-width: 156px;
        }

        .vyr-category-select .vyr-ranking-select-trigger span {
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .vyr-ranking-select.is-open {
          border-color: rgba(212, 178, 106, 0.34);
          background: rgba(212, 178, 106, 0.07);
        }

        .vyr-ranking-select.is-open .vyr-ranking-select-trigger {
          color: #f0dda8;
        }

        .vyr-ranking-select.is-open .vyr-ranking-select-trigger svg {
          transform: rotate(180deg);
        }

        .vyr-ranking-select-menu {
          position: absolute;
          top: calc(100% + 7px);
          right: 0;
          min-width: 132px;
          padding: 5px;
          border: 1px solid rgba(212, 178, 106, 0.26);
          border-radius: 12px;
          background: #15131a;
          box-shadow: 0 18px 44px rgba(0, 0, 0, 0.52);
          z-index: 90;
        }

        .vyr-category-select .vyr-ranking-select-menu {
          min-width: 178px;
        }

        .vyr-ranking-select-menu button {
          width: 100%;
          min-height: 34px;
          display: flex;
          align-items: center;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: #c5c0b6;
          cursor: pointer;
          font: inherit;
          font-size: 13px;
          font-weight: 600;
          line-height: 1;
          padding: 0 10px;
          text-align: left;
          white-space: nowrap;
        }

        .vyr-ranking-select-menu button:hover,
        .vyr-ranking-select-menu button:focus-visible {
          background: rgba(255, 255, 255, 0.06);
          color: #f3f0ea;
          outline: 0;
        }

        .vyr-ranking-select-menu button.is-selected {
          background: linear-gradient(135deg, #f0dda8, #d4b26a);
          color: #241a0a;
        }

        .vyr-ranking-list {
          display: flex;
          flex-direction: column;
          gap: 11px;
          margin-top: 22px;
        }

        .vyr-rank-row {
          width: 100%;
          min-height: 92px;
          display: flex;
          align-items: center;
          gap: 18px;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.03);
          color: #f3f0ea;
          padding: 15px 20px 15px 24px;
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
          background: linear-gradient(
            135deg,
            rgba(212, 178, 106, 0.13),
            rgba(255, 255, 255, 0.025)
          );
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

        .vyr-rank-avatar-fallback {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #26222d, #181319);
          color: #d4b26a;
          font-size: 15px;
          font-weight: 900;
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
          flex-wrap: wrap;
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

        .vyr-sponsored {
          border: 1px solid rgba(212, 178, 106, 0.32);
          border-radius: 999px;
          background: rgba(212, 178, 106, 0.12);
          color: #f0dda8;
          font-size: 10.5px;
          font-weight: 800;
          line-height: 1;
          padding: 5px 8px;
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

        .vyr-rank-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          flex: none;
        }

        .vyr-rank-action {
          min-height: 36px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border: 1px solid rgba(212, 178, 106, 0.25);
          border-radius: 10px;
          background: rgba(212, 178, 106, 0.08);
          color: #efd491;
          font-size: 12.5px;
          font-weight: 800;
          line-height: 1;
          text-decoration: none;
          white-space: nowrap;
          padding: 0 12px;
        }

        .vyr-rank-action.is-primary {
          border-color: rgba(212, 178, 106, 0.55);
          background: linear-gradient(135deg, #f0dda8, #d4b26a);
          color: #241a0a;
        }

        .vyr-rank-action.is-disabled {
          opacity: 0.45;
        }

        .vyr-ranking-state {
          min-height: 178px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: 1px dashed rgba(212, 178, 106, 0.26);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.025);
          color: #9c9488;
          text-align: center;
          padding: 26px;
        }

        .vyr-ranking-state strong {
          color: #f3f0ea;
          font-size: 18px;
          line-height: 1.2;
        }

        .vyr-ranking-state span {
          max-width: 360px;
          font-size: 13px;
          line-height: 1.45;
        }

        .vyr-ranking-state button {
          min-height: 36px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border: 0;
          border-radius: 10px;
          background: linear-gradient(135deg, #f0dda8, #d4b26a);
          color: #241a0a;
          cursor: pointer;
          font: inherit;
          font-size: 12.5px;
          font-weight: 800;
          padding: 0 13px;
        }

        .vyr-ranking-state.is-error {
          border-color: rgba(248, 113, 113, 0.32);
        }

        .vyr-rank-skeleton {
          pointer-events: none;
        }

        .vyr-rank-skeleton .vyr-rank-avatar,
        .vyr-rank-skeleton .vyr-rank-badge-line,
        .vyr-rank-skeleton strong,
        .vyr-rank-skeleton small {
          border: 0;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.05),
            rgba(255, 255, 255, 0.11),
            rgba(255, 255, 255, 0.05)
          );
          background-size: 220% 100%;
          animation: vyrSkeleton 1.2s ease-in-out infinite;
        }

        .vyr-rank-skeleton .vyr-rank-badge-line {
          width: 92px;
          border-radius: 9px;
        }

        .vyr-rank-skeleton strong {
          width: 180px;
          height: 22px;
          border-radius: 8px;
        }

        .vyr-rank-skeleton small {
          width: 240px;
          height: 14px;
          border-radius: 7px;
        }

        @keyframes vyrSkeleton {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 220% 50%;
          }
        }

        @media (max-width: 980px) {
          .vyr-rank-row {
            align-items: flex-start;
          }

          .vyr-rank-actions {
            flex-direction: column;
            align-items: stretch;
          }
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

          .vyr-ranking-select {
            min-width: 112px;
            min-height: 29px;
            border: 0;
            padding: 0;
            justify-content: flex-end;
            background: transparent;
            font-size: 11.5px;
          }

          .vyr-ranking-select-trigger {
            min-height: 29px;
            color: #c5c0b6;
            font-size: 11.5px;
          }

          .vyr-ranking-select-menu {
            top: calc(100% + 6px);
            min-width: 112px;
          }

          .vyr-category-select {
            width: 100%;
            min-height: 36px;
            justify-content: space-between;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 13px;
            padding: 0 12px;
            background: rgba(255, 255, 255, 0.05);
          }

          .vyr-category-select .vyr-ranking-select-trigger {
            width: 100%;
            max-width: none;
            justify-content: space-between;
          }

          .vyr-category-select .vyr-ranking-select-menu {
            left: 0;
            right: auto;
            width: 100%;
          }

          .vyr-ranking-select-menu button {
            min-height: 32px;
            font-size: 12px;
          }

          .vyr-ranking-list {
            gap: 9px;
            margin-top: 10px;
            padding-bottom: 16px;
          }

          .vyr-rank-row {
            min-height: 70px;
            display: grid;
            grid-template-columns: 48px minmax(0, 1fr);
            gap: 13px;
            border-radius: 15px;
            padding: 11px 13px;
          }

          .vyr-rank-row.is-podium-rank {
            grid-template-columns: 54px minmax(0, 1fr);
            border-width: 1.5px;
            background: linear-gradient(
              135deg,
              rgba(212, 178, 106, 0.1),
              rgba(255, 255, 255, 0.025)
            );
          }

          .vyr-rank-row.is-rank-2 {
            background: linear-gradient(
              135deg,
              rgba(232, 232, 238, 0.085),
              rgba(255, 255, 255, 0.025)
            );
          }

          .vyr-rank-row.is-rank-3 {
            background: linear-gradient(
              135deg,
              rgba(240, 192, 138, 0.085),
              rgba(255, 255, 255, 0.025)
            );
          }

          .vyr-rank-row.is-podium-rank .vyr-rank-avatar {
            width: 54px;
            height: 54px;
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

          .vyr-rank-actions {
            grid-column: 1 / -1;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            width: 100%;
          }

          .vyr-rank-action {
            min-height: 34px;
            width: 100%;
            font-size: 12px;
            padding: 0 8px;
          }

          .vyr-ranking-state {
            min-height: 154px;
            padding: 22px 16px;
          }

          .vyr-rank-skeleton small {
            width: min(190px, 100%);
          }
        }
      `}</style>
    </main>
  );
}
