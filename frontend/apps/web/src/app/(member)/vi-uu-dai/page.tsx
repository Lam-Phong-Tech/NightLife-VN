"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Copy,
  Loader2,
  QrCode,
  Store,
  Ticket,
  WalletCards,
} from "lucide-react";
import { ApiError } from "@/lib/api/client";
import { couponApi, type CouponIssue } from "@/lib/api/coupons";
import { getAuthUser, type AuthUser } from "@/lib/auth/session";

type WalletFilter = "all" | "active" | "used" | "expired";
type IssueKind = "active" | "used" | "expired" | "inactive";

const filterLabels: Record<WalletFilter, string> = {
  all: "Tất cả",
  active: "Còn dùng",
  used: "Đã dùng",
  expired: "Hết hạn",
};

const isMemberUser = (user: AuthUser | null) => user?.role?.toUpperCase() === "USER";

const readableName = (value?: string | null) =>
  (value || "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim() || "Vietyoru partner";

const formatDate = (value?: string | null) => {
  if (!value) {
    return "Không giới hạn";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Không giới hạn";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

const isIssueExpired = (issue: CouponIssue) => {
  if (issue.status === "EXPIRED") {
    return true;
  }

  if (!issue.expiresAt) {
    return false;
  }

  const expiresAt = new Date(issue.expiresAt).getTime();
  return Number.isFinite(expiresAt) && expiresAt <= Date.now();
};

const issueKind = (issue: CouponIssue): IssueKind => {
  if (issue.status === "USED") {
    return "used";
  }

  if (isIssueExpired(issue)) {
    return "expired";
  }

  if (issue.status === "ISSUED") {
    return "active";
  }

  return "inactive";
};

const issueStatusText = (issue: CouponIssue) => {
  const kind = issueKind(issue);

  if (kind === "active") {
    return issue.statusLabel || "Còn dùng";
  }

  if (kind === "used") {
    return "Đã sử dụng";
  }

  if (kind === "expired") {
    return "Hết hạn";
  }

  return issue.statusLabel || issue.status;
};

const canShowIssueQr = (issue: CouponIssue) =>
  issueKind(issue) === "active" && Boolean(issue.qrImageDataUrl);

const issueDiscountText = (issue: CouponIssue) => {
  if (typeof issue.discountPercent === "number") {
    return `-${issue.discountPercent}%`;
  }

  if (issue.coupon.discountType === "PERCENT" && typeof issue.coupon.discountValue === "number") {
    return `-${issue.coupon.discountValue}%`;
  }

  if (
    issue.coupon.discountType === "FIXED_AMOUNT" &&
    typeof issue.coupon.discountValue === "number"
  ) {
    return `${Math.round(issue.coupon.discountValue / 1000)}K`;
  }

  return "Ưu đãi";
};

const issueStoreName = (issue: CouponIssue) => readableName(issue.coupon.store?.name);

const issueTimestamp = (issue: CouponIssue) => {
  const value = issue.usedAt || issue.expiresAt || issue.createdAt;
  const time = value ? new Date(value).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
};

export default function Page() {
  const [authUser] = useState<AuthUser | null>(() => getAuthUser());
  const isMember = isMemberUser(authUser);
  const [issues, setIssues] = useState<CouponIssue[]>([]);
  const [isLoading, setIsLoading] = useState(isMember);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<WalletFilter>("all");
  const [copiedIssueId, setCopiedIssueId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!isMember) {
      return;
    }

    let isMounted = true;

    void Promise.resolve().then(async () => {
      try {
        const data = await couponApi.listMemberCouponIssues();
        if (isMounted) {
          setIssues(data);
          setError("");
        }
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        const message =
          loadError instanceof ApiError
            ? loadError.message
            : "Không tải được ví ưu đãi đã lưu.";
        setError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isMember, refreshKey]);

  const sortedIssues = useMemo(
    () =>
      [...issues].sort((left, right) => {
        const priority: Record<IssueKind, number> = {
          active: 0,
          inactive: 1,
          used: 2,
          expired: 3,
        };

        const priorityDiff = priority[issueKind(left)] - priority[issueKind(right)];
        if (priorityDiff !== 0) {
          return priorityDiff;
        }

        return issueTimestamp(right) - issueTimestamp(left);
      }),
    [issues],
  );

  const filterCounts = useMemo(() => {
    const counts: Record<WalletFilter, number> = {
      all: sortedIssues.length,
      active: 0,
      used: 0,
      expired: 0,
    };

    sortedIssues.forEach((issue) => {
      const kind = issueKind(issue);
      if (kind === "active" || kind === "used" || kind === "expired") {
        counts[kind] += 1;
      }
    });

    return counts;
  }, [sortedIssues]);

  const visibleIssues = useMemo(
    () =>
      sortedIssues.filter((issue) => {
        if (activeFilter === "all") {
          return true;
        }

        return issueKind(issue) === activeFilter;
      }),
    [activeFilter, sortedIssues],
  );

  const memberName = readableName(authUser?.displayName || authUser?.email || "Hội viên");

  const reloadWallet = () => {
    setError("");
    setIsLoading(true);
    setRefreshKey((current) => current + 1);
  };

  const copyIssueCode = async (issue: CouponIssue) => {
    try {
      await navigator.clipboard.writeText(issue.code);
      setCopiedIssueId(issue.id);
      window.setTimeout(() => setCopiedIssueId(null), 1800);
    } catch {
      setError("Không sao chép được mã. Bạn có thể chọn và sao chép thủ công.");
    }
  };

  return (
    <main className="wallet-page">
      <section className="wallet-shell">
        <header className="wallet-header">
          <div>
            <Link className="back-link" href="/uu-dai">
              Xem thêm ưu đãi
            </Link>
            <span className="eyebrow">
              <WalletCards size={15} />
              Ví ưu đãi
            </span>
            <h1>Mã đã lưu</h1>
            <p>Chỉ hiển thị coupon bạn đã lấy hoặc đã lưu vào ví. QR còn hiệu lực dùng để Partner quét tại đúng quán.</p>
          </div>
          <div className="wallet-summary" aria-label="Tóm tắt ví ưu đãi">
            <strong>{filterCounts.active}</strong>
            <span>mã còn dùng</span>
            <small>{memberName}</small>
          </div>
        </header>

        {!isMember ? (
          <section className="empty-state">
            <AlertCircle size={24} />
            <h2>Cần đăng nhập hội viên</h2>
            <p>Đăng nhập để xem các coupon đã lưu trong ví của bạn.</p>
            <Link href="/dang-nhap?redirect=/vi-uu-dai">Đăng nhập</Link>
          </section>
        ) : (
          <>
            <nav className="wallet-tabs" aria-label="Lọc mã đã lưu">
              {(Object.keys(filterLabels) as WalletFilter[]).map((filter) => {
                const active = activeFilter === filter;
                return (
                  <button
                    aria-pressed={active}
                    className={active ? "active" : ""}
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    type="button"
                  >
                    {filterLabels[filter]}
                    <span>{filterCounts[filter]}</span>
                  </button>
                );
              })}
            </nav>

            {isLoading ? (
              <section className="wallet-message">
                <Loader2 className="spin" size={18} />
                Đang tải ví ưu đãi
              </section>
            ) : null}

            {error ? (
              <section className="wallet-message error">
                <AlertCircle size={18} />
                <span>{error}</span>
                <button onClick={reloadWallet} type="button">Tải lại</button>
              </section>
            ) : null}

            {!isLoading && !error && sortedIssues.length === 0 ? (
              <section className="empty-state">
                <Ticket size={24} />
                <h2>Chưa có coupon đã lưu</h2>
                <p>Vào trang ưu đãi để lấy mã, sau đó mã sẽ xuất hiện tại ví này.</p>
                <Link href="/uu-dai">Lấy ưu đãi</Link>
              </section>
            ) : null}

            {!isLoading && !error && sortedIssues.length > 0 && visibleIssues.length === 0 ? (
              <section className="wallet-message">Không có mã ở bộ lọc này.</section>
            ) : null}

            {visibleIssues.length > 0 ? (
              <section className="wallet-list" aria-label="Coupon đã lưu">
                {visibleIssues.map((issue) => {
                  const kind = issueKind(issue);
                  const showQr = canShowIssueQr(issue);
                  const storeSlug = issue.coupon.store?.slug;
                  const statusDetail =
                    kind === "used"
                      ? `Dùng lúc ${formatDate(issue.usedAt)}`
                      : kind === "expired"
                        ? `Hết hạn ${formatDate(issue.expiresAt)}`
                        : `HSD ${formatDate(issue.expiresAt)}`;

                  return (
                    <article className={`wallet-card ${kind}`} key={issue.id}>
                      <div className="wallet-card-copy">
                        <div className="value-row">
                          <strong>{issueDiscountText(issue)}</strong>
                          <span>{issueStatusText(issue)}</span>
                        </div>
                        <h2>{readableName(issue.coupon.name)}</h2>
                        <p>
                          <Store size={15} />
                          {issueStoreName(issue)}
                        </p>
                        <div className="meta-row">
                          <span>
                            <Clock3 size={14} />
                            {statusDetail}
                          </span>
                          <span>
                            <CheckCircle2 size={14} />
                            {issue.userType || "MEMBER"}
                          </span>
                        </div>
                        <div className="code-row">
                          <code>{issue.code}</code>
                          <button onClick={() => copyIssueCode(issue)} type="button">
                            <Copy size={14} />
                            {copiedIssueId === issue.id ? "Đã sao chép" : "Sao chép"}
                          </button>
                        </div>
                        {storeSlug ? (
                          <Link className="store-link" href={`/stores/${storeSlug}`}>
                            Xem quán áp dụng
                          </Link>
                        ) : null}
                      </div>

                      {showQr ? (
                        <div className="qr-panel" aria-label="QR coupon còn hiệu lực">
                          <Image
                            alt={`QR ${issue.code}`}
                            height={188}
                            src={issue.qrImageDataUrl || ""}
                            unoptimized
                            width={188}
                          />
                          <span>
                            <QrCode size={14} />
                            Đưa Partner quét tại quán
                          </span>
                        </div>
                      ) : (
                        <div className="status-panel">
                          <strong>{issueStatusText(issue)}</strong>
                          <span>{kind === "used" ? "Không thể dùng lại" : "QR không còn hiệu lực"}</span>
                        </div>
                      )}
                    </article>
                  );
                })}
              </section>
            ) : null}
          </>
        )}
      </section>

      <style jsx>{`
        .wallet-page {
          min-height: calc(100vh - 82px);
          background:
            radial-gradient(circle at 12% 0%, rgba(212, 178, 106, .13), transparent 28%),
            linear-gradient(180deg, #111114 0%, #08080a 100%);
          color: #f7f2e8;
          font-family: var(--nl-font-sans);
          padding: 34px clamp(16px, 4vw, 48px) 58px;
        }

        .wallet-shell {
          width: min(1120px, 100%);
          margin: 0 auto;
        }

        .wallet-header {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(180px, 240px);
          gap: 22px;
          align-items: end;
        }

        .back-link,
        .store-link {
          color: #d4b26a;
          text-decoration: none;
          font-size: 13px;
          font-weight: 800;
        }

        .eyebrow {
          margin-top: 18px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 32px;
          border-radius: 16px;
          border: 1px solid rgba(212, 178, 106, .3);
          padding: 0 12px;
          color: #f2dfaa;
          background: rgba(212, 178, 106, .09);
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
        }

        h1 {
          margin: 18px 0 0;
          font-size: 36px;
          line-height: 1.1;
          font-weight: 950;
        }

        .wallet-header p {
          max-width: 680px;
          margin: 12px 0 0;
          color: #d8d1c1;
          font-size: 15px;
          line-height: 1.65;
        }

        .wallet-summary {
          min-height: 132px;
          border-radius: 8px;
          border: 1px solid rgba(212, 178, 106, .24);
          background: rgba(255, 255, 255, .035);
          padding: 18px;
          display: grid;
          align-content: center;
          gap: 4px;
        }

        .wallet-summary strong {
          color: #f2dfaa;
          font-size: 40px;
          line-height: 1;
        }

        .wallet-summary span {
          color: #f7f2e8;
          font-size: 14px;
          font-weight: 800;
        }

        .wallet-summary small {
          color: #9b9488;
          font-size: 12px;
        }

        .wallet-tabs {
          margin-top: 26px;
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .wallet-tabs button,
        .code-row button,
        .wallet-message button {
          border: 1px solid rgba(212, 178, 106, .24);
          background: rgba(255, 255, 255, .04);
          color: #d8d1c1;
          cursor: pointer;
          font-family: inherit;
          font-weight: 850;
        }

        .wallet-tabs button {
          min-height: 42px;
          border-radius: 21px;
          padding: 0 14px;
          display: inline-flex;
          align-items: center;
          gap: 9px;
          white-space: nowrap;
        }

        .wallet-tabs button.active {
          color: #241a0a;
          border-color: rgba(244, 223, 168, .72);
          background: linear-gradient(135deg, #fff1bf 0%, #e4bf63 52%, #c09035 100%);
        }

        .wallet-tabs span {
          min-width: 24px;
          height: 24px;
          border-radius: 12px;
          background: rgba(0, 0, 0, .18);
          display: inline-grid;
          place-items: center;
          padding: 0 7px;
        }

        .wallet-list {
          margin-top: 22px;
          display: grid;
          gap: 16px;
        }

        .wallet-card {
          min-height: 236px;
          border-radius: 8px;
          border: 1px solid rgba(212, 178, 106, .22);
          background: linear-gradient(180deg, rgba(255, 255, 255, .04), rgba(255, 255, 255, .018)), #141416;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 246px;
          gap: 18px;
          padding: 20px;
          box-shadow: 0 18px 46px rgba(0, 0, 0, .22);
        }

        .wallet-card.used,
        .wallet-card.expired,
        .wallet-card.inactive {
          opacity: .74;
        }

        .wallet-card-copy {
          min-width: 0;
          display: grid;
          align-content: start;
          gap: 12px;
        }

        .value-row,
        .meta-row,
        .code-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .value-row {
          justify-content: space-between;
        }

        .value-row strong {
          color: #f2dfaa;
          font-size: 28px;
          line-height: 1;
        }

        .value-row span {
          min-height: 28px;
          border-radius: 14px;
          padding: 0 11px;
          display: inline-flex;
          align-items: center;
          color: #c8f7dc;
          background: rgba(16, 185, 129, .13);
          font-size: 12px;
          font-weight: 900;
        }

        .wallet-card.used .value-row span,
        .wallet-card.expired .value-row span,
        .wallet-card.inactive .value-row span {
          color: #cfc7b8;
          background: rgba(255, 255, 255, .08);
        }

        .wallet-card h2 {
          margin: 0;
          color: #fffaf0;
          font-size: 22px;
          line-height: 1.25;
        }

        .wallet-card p,
        .meta-row span {
          color: #d8d1c1;
          font-size: 13px;
          line-height: 1.5;
        }

        .wallet-card p,
        .meta-row span {
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }

        .code-row {
          align-items: stretch;
        }

        .code-row code {
          min-height: 38px;
          border-radius: 8px;
          border: 1px solid rgba(212, 178, 106, .24);
          background: rgba(0, 0, 0, .18);
          color: #f7f2e8;
          display: inline-flex;
          align-items: center;
          padding: 0 12px;
          font-size: 13px;
          overflow-wrap: anywhere;
        }

        .code-row button,
        .wallet-message button {
          min-height: 38px;
          border-radius: 8px;
          padding: 0 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
        }

        .qr-panel,
        .status-panel,
        .wallet-message,
        .empty-state {
          border-radius: 8px;
          border: 1px solid rgba(212, 178, 106, .24);
          background: rgba(255, 255, 255, .035);
        }

        .qr-panel,
        .status-panel {
          min-height: 196px;
          display: grid;
          place-items: center;
          align-content: center;
          gap: 12px;
          padding: 16px;
        }

        .qr-panel {
          background: #f8f5ee;
          color: #241a0a;
        }

        .qr-panel img {
          width: 188px;
          height: 188px;
          display: block;
        }

        .qr-panel span,
        .status-panel span {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          font-weight: 850;
          text-align: center;
        }

        .status-panel strong {
          color: #f2dfaa;
          font-size: 20px;
        }

        .status-panel span {
          color: #9b9488;
        }

        .wallet-message,
        .empty-state {
          margin-top: 22px;
          min-height: 112px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #d8d1c1;
          text-align: center;
          padding: 18px;
        }

        .wallet-message.error {
          color: #fecaca;
          border-color: rgba(248, 113, 113, .38);
          background: rgba(127, 29, 29, .18);
          flex-wrap: wrap;
        }

        .empty-state {
          min-height: 240px;
          flex-direction: column;
        }

        .empty-state h2 {
          margin: 0;
          color: #fffaf0;
          font-size: 22px;
        }

        .empty-state p {
          margin: 0;
          max-width: 440px;
          color: #d8d1c1;
          line-height: 1.6;
        }

        .empty-state a {
          min-height: 42px;
          border-radius: 21px;
          padding: 0 18px;
          display: inline-flex;
          align-items: center;
          color: #241a0a;
          background: linear-gradient(135deg, #fff1bf 0%, #e4bf63 52%, #c09035 100%);
          font-weight: 900;
          text-decoration: none;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 760px) {
          .wallet-page {
            padding: 22px 14px calc(96px + env(safe-area-inset-bottom));
          }

          .wallet-header,
          .wallet-card {
            grid-template-columns: 1fr;
          }

          .wallet-summary {
            min-height: 104px;
          }

          h1 {
            font-size: 30px;
          }

          .wallet-card {
            padding: 16px;
          }

          .qr-panel img {
            width: 176px;
            height: 176px;
          }
        }
      `}</style>
    </main>
  );
}
