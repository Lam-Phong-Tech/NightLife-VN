"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Gift,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Store,
  Ticket,
  UserRound,
} from "lucide-react";
import { ApiError } from "@/lib/api/client";
import { couponApi, type CouponIssue, type PublicCoupon } from "@/lib/api/coupons";
import { getAuthUser, type AuthUser } from "@/lib/auth/session";

type CouponQuery = {
  couponId?: string;
  storeId?: string;
  storeSlug?: string;
};

const categoryLabels: Record<string, string> = {
  BAR: "Bar",
  CLUB: "Club",
  LOUNGE: "Lounge",
  GIRLS_BAR: "Girls bar",
  KARAOKE: "Karaoke/KTV",
  MASSAGE_SPA: "Massage spa",
  RESTAURANT: "Nhà hàng",
  CASINO: "Casino lounge",
};

const formatVnd = (value?: number | null) => {
  if (!value) {
    return "0đ";
  }

  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
};

const formatDiscount = (coupon: PublicCoupon) => {
  if (coupon.discountType === "PERCENT") {
    return `-${coupon.discountValue}%`;
  }

  return `-${formatVnd(coupon.discountValue)}`;
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return "Không giới hạn";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Đang cập nhật";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const expiryText = (value?: string | null) => {
  if (!value) {
    return "Không giới hạn";
  }

  const expiresAt = new Date(value).getTime();
  if (Number.isNaN(expiresAt)) {
    return "Đang cập nhật";
  }

  const diffMs = expiresAt - Date.now();
  if (diffMs <= 0) {
    return "Đã hết hạn";
  }

  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 1) {
    return "Còn dưới 24 giờ";
  }

  return `Còn ${days} ngày`;
};

const readableName = (name: string) => {
  const parts = name.split(/—|-/);
  return parts[parts.length - 1]?.trim() || name;
};

const isMemberUser = (user: AuthUser | null) => user?.role?.toUpperCase() === "USER";

const readCouponQuery = (): CouponQuery => {
  if (typeof window === "undefined") {
    return {};
  }

  const params = new URLSearchParams(window.location.search);
  return {
    couponId: params.get("couponId") || undefined,
    storeId: params.get("storeId") || undefined,
    storeSlug: params.get("storeSlug") || undefined,
  };
};

export default function Page() {
  const [coupons, setCoupons] = useState<PublicCoupon[]>([]);
  const [query] = useState<CouponQuery>(() => readCouponQuery());
  const [authUser] = useState<AuthUser | null>(() => getAuthUser());
  const [guestName, setGuestName] = useState(() => {
    const user = getAuthUser();
    return user?.displayName || user?.email || "";
  });
  const [guestPhone, setGuestPhone] = useState(() => {
    const user = getAuthUser();
    return user?.phone || "";
  });
  const [guestEmail, setGuestEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [claimingCouponId, setClaimingCouponId] = useState<string | null>(null);
  const [claimError, setClaimError] = useState("");
  const [claimedIssue, setClaimedIssue] = useState<CouponIssue | null>(null);

  useEffect(() => {
    let isMounted = true;


    couponApi
      .listPublicCoupons()
      .then((data) => {
        if (isMounted) {
          setCoupons(data);
          setLoadError("");
        }
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        const message =
          error instanceof ApiError
            ? error.message
            : "Không tải được danh sách ưu đãi từ backend.";
        setLoadError(message);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleCoupons = useMemo(() => {
    return coupons.filter((coupon) => {
      const matchesCoupon = !query.couponId || coupon.id === query.couponId;
      const matchesStoreId = !query.storeId || coupon.store.id === query.storeId;
      const matchesStoreSlug = !query.storeSlug || coupon.store.slug === query.storeSlug;

      return matchesCoupon && matchesStoreId && matchesStoreSlug;
    });
  }, [coupons, query]);

  const scopedStore = useMemo(() => {
    const byVisibleCoupon = visibleCoupons[0]?.store;
    if (byVisibleCoupon) {
      return byVisibleCoupon;
    }

    return coupons.find((coupon) => {
      if (query.storeId && coupon.store.id === query.storeId) {
        return true;
      }

      return Boolean(query.storeSlug && coupon.store.slug === query.storeSlug);
    })?.store;
  }, [coupons, query.storeId, query.storeSlug, visibleCoupons]);

  const isScopedFromStore = Boolean(query.couponId || query.storeId || query.storeSlug);
  const isMember = isMemberUser(authUser);
  const pageTitle = scopedStore
    ? `Ưu đãi của ${readableName(scopedStore.name)}`
    : "Ưu đãi đang mở";
  const backHref = query.storeSlug ? `/stores/${query.storeSlug}` : "/danh-sach-quan";

  const claimCoupon = async (coupon: PublicCoupon) => {
    setClaimError("");
    setClaimedIssue(null);

    const phone = guestPhone.trim();
    if (!isMember && !phone) {
      setClaimError("Nhập số điện thoại để tạo mã coupon khách.");
      return;
    }

    try {
      setClaimingCouponId(coupon.id);
      const issue = isMember
        ? await couponApi.claimMemberCoupon(coupon.id)
        : (
            await couponApi.claimGuestCoupon(coupon.id, {
              ...(guestName.trim() ? { displayName: guestName.trim() } : {}),
              phone,
              ...(guestEmail.trim() ? { email: guestEmail.trim() } : {}),
            })
          ).issue;

      setClaimedIssue(issue);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Không tạo được mã coupon. Vui lòng thử lại.";
      setClaimError(message);
    } finally {
      setClaimingCouponId(null);
    }
  };

  return (
    <main className="coupon-page">
      <section className="coupon-shell">
        <header className="coupon-header">
          <Link className="back-link" href={backHref}>
            {query.storeSlug ? "Về chi tiết quán" : "Xem danh sách quán"}
          </Link>
          <div className="header-grid">
            <div>
              <span className="eyebrow">
                <Gift size={16} />
                Coupon thật từ backend
              </span>
              <h1>{pageTitle}</h1>
              <p>
                Chọn ưu đãi, tạo coupon issue thật và đưa mã cho nhân viên quán
                quét khi đến nơi.
              </p>
            </div>
            <div className="summary-panel">
              <div>
                <span>Phạm vi</span>
                <strong>{isScopedFromStore ? "Theo CTA của quán" : "Tất cả coupon"}</strong>
              </div>
              <div>
                <span>Đang hiển thị</span>
                <strong>{visibleCoupons.length} mã</strong>
              </div>
              {scopedStore ? (
                <Link href={`/stores/${scopedStore.slug}`}>Mở trang quán</Link>
              ) : null}
            </div>
          </div>
        </header>

        <section className="claim-panel">
          <div>
            <span className="eyebrow muted">
              <Ticket size={16} />
              Cách nhận mã
            </span>
            <h2>{isMember ? "Nhận vào ví hội viên" : "Nhận mã khách"}</h2>
            <p>
              {isMember
                ? "Bạn đang đăng nhập hội viên, nút lấy mã sẽ gọi member claim."
                : "Khách chưa đăng nhập cần để lại số điện thoại để hệ thống tạo mã guest coupon."}
            </p>
          </div>
          {!isMember ? (
            <div className="guest-form" aria-label="Thông tin nhận coupon">
              <label>
                <UserRound size={15} />
                <input
                  value={guestName}
                  onChange={(event) => setGuestName(event.target.value)}
                  placeholder="Tên người nhận"
                />
              </label>
              <label>
                <Phone size={15} />
                <input
                  value={guestPhone}
                  onChange={(event) => setGuestPhone(event.target.value)}
                  placeholder="Số điện thoại"
                />
              </label>
              <label>
                <Mail size={15} />
                <input
                  value={guestEmail}
                  onChange={(event) => setGuestEmail(event.target.value)}
                  placeholder="Email nếu có"
                  type="email"
                />
              </label>
            </div>
          ) : null}
        </section>

        {claimedIssue ? (
          <section className="result success" role="status">
            <CheckCircle2 size={20} />
            <div>
              <strong>Đã tạo mã {claimedIssue.code}</strong>
              <span>
                Hiệu lực đến {formatDate(claimedIssue.expiresAt)} cho coupon{" "}
                {claimedIssue.coupon.name}.
              </span>
            </div>
          </section>
        ) : null}

        {claimError ? (
          <section className="result error" role="alert">
            <AlertCircle size={20} />
            <span>{claimError}</span>
          </section>
        ) : null}

        {loadError ? (
          <section className="result error" role="alert">
            <AlertCircle size={20} />
            <span>{loadError}</span>
          </section>
        ) : null}

        {isLoading ? (
          <section className="coupon-grid" aria-label="Đang tải ưu đãi">
            {[0, 1, 2].map((item) => (
              <div className="coupon-skeleton" key={item} />
            ))}
          </section>
        ) : null}

        {!isLoading && !loadError && visibleCoupons.length === 0 ? (
          <section className="empty-state">
            <Ticket size={32} />
            <h2>Chưa có coupon đang mở</h2>
            <p>
              {isScopedFromStore
                ? "Quán hoặc coupon từ CTA hiện không có ưu đãi active."
                : "Backend hiện chưa trả về coupon active nào."}
            </p>
            <Link href="/danh-sach-quan">Tìm quán khác</Link>
          </section>
        ) : null}

        {!isLoading && !loadError && visibleCoupons.length ? (
          <section className="coupon-grid" aria-label="Danh sách coupon">
            {visibleCoupons.map((coupon) => {
              const isClaiming = claimingCouponId === coupon.id;
              const storeLabel = readableName(coupon.store.name);

              return (
                <article
                  className={query.couponId === coupon.id ? "coupon-card selected" : "coupon-card"}
                  key={coupon.id}
                >
                  <div className="coupon-value">{formatDiscount(coupon)}</div>
                  <div className="coupon-body">
                    <div className="coupon-meta">
                      <span>
                        <Store size={14} />
                        {categoryLabels[coupon.store.category] ?? coupon.store.category}
                      </span>
                      <span>
                        <MapPin size={14} />
                        {[coupon.store.district, coupon.store.city].filter(Boolean).join(", ")}
                      </span>
                    </div>
                    <h2>{coupon.name}</h2>
                    <p>{coupon.description || "Coupon đang áp dụng tại quán này."}</p>
                    <div className="store-line">
                      <strong>{storeLabel}</strong>
                      <Link href={`/stores/${coupon.store.slug}`}>Chi tiết quán</Link>
                    </div>
                    <dl>
                      <div>
                        <dt>Mã gốc</dt>
                        <dd>{coupon.code}</dd>
                      </div>
                      <div>
                        <dt>Hạn</dt>
                        <dd>{expiryText(coupon.endsAt)}</dd>
                      </div>
                      <div>
                        <dt>Đơn tối thiểu</dt>
                        <dd>{coupon.minSpendVnd ? formatVnd(coupon.minSpendVnd) : "Không yêu cầu"}</dd>
                      </div>
                      <div>
                        <dt>Giảm tối đa</dt>
                        <dd>{coupon.maxDiscountVnd ? formatVnd(coupon.maxDiscountVnd) : "Theo quy định"}</dd>
                      </div>
                    </dl>
                  </div>
                  <button
                    className="claim-button"
                    disabled={Boolean(claimingCouponId)}
                    onClick={() => claimCoupon(coupon)}
                    type="button"
                  >
                    {isClaiming ? <Loader2 size={18} className="spin" /> : <Ticket size={18} />}
                    {isMember ? "Lưu vào ví" : "Lấy mã guest"}
                  </button>
                </article>
              );
            })}
          </section>
        ) : null}
      </section>

      <style>{`
        .coupon-page {
          min-height: 100vh;
          background: #101114;
          color: #f7f1e7;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          padding: 24px;
        }

        .coupon-shell {
          max-width: 1180px;
          margin: 0 auto;
          display: grid;
          gap: 18px;
        }

        .back-link,
        .store-line a,
        .summary-panel a,
        .empty-state a {
          color: #f4d98d;
          font-weight: 900;
          text-decoration: none;
        }

        .coupon-header {
          padding: 30px 0 8px;
        }

        .header-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 320px;
          gap: 18px;
          align-items: end;
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #7ddbd2;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .eyebrow.muted {
          color: #f0c96f;
        }

        h1,
        h2,
        p {
          margin: 0;
        }

        h1 {
          margin-top: 10px;
          font-size: clamp(32px, 5vw, 58px);
          line-height: 1;
          letter-spacing: 0;
        }

        .coupon-header p,
        .claim-panel p,
        .empty-state p,
        .coupon-card p {
          color: #c8c0b1;
          line-height: 1.6;
        }

        .coupon-header p {
          max-width: 680px;
          margin-top: 12px;
        }

        .summary-panel,
        .claim-panel,
        .result,
        .empty-state,
        .coupon-card {
          border: 1px solid rgba(240, 201, 111, .2);
          background: rgba(255, 255, 255, .055);
          border-radius: 8px;
        }

        .summary-panel {
          display: grid;
          gap: 12px;
          padding: 16px;
        }

        .summary-panel span,
        dt {
          display: block;
          color: #a9a194;
          font-size: 12px;
          font-weight: 800;
        }

        .summary-panel strong,
        dd {
          margin: 0;
          font-weight: 950;
        }

        .claim-panel {
          display: grid;
          grid-template-columns: minmax(0, .85fr) minmax(320px, 1.15fr);
          gap: 18px;
          padding: 18px;
          align-items: center;
        }

        .claim-panel h2 {
          margin-top: 8px;
          font-size: 22px;
        }

        .guest-form {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .guest-form label {
          min-height: 46px;
          border: 1px solid rgba(255, 255, 255, .12);
          border-radius: 8px;
          background: rgba(0, 0, 0, .18);
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 12px;
          color: #f0c96f;
        }

        .guest-form input {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #f7f1e7;
          font: inherit;
          min-width: 0;
        }

        .guest-form input::placeholder {
          color: #8d8579;
        }

        .result {
          min-height: 56px;
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 14px 16px;
        }

        .result.success {
          border-color: rgba(125, 219, 210, .42);
          background: rgba(48, 150, 140, .12);
        }

        .result.error {
          border-color: rgba(255, 128, 150, .42);
          background: rgba(255, 128, 150, .12);
          color: #ffd1d9;
        }

        .result div {
          display: grid;
          gap: 2px;
        }

        .result span {
          color: inherit;
        }

        .coupon-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .coupon-card {
          min-height: 430px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .coupon-card.selected {
          border-color: rgba(125, 219, 210, .72);
          box-shadow: 0 0 0 1px rgba(125, 219, 210, .22);
        }

        .coupon-value {
          min-height: 118px;
          display: flex;
          align-items: end;
          padding: 18px;
          font-size: 42px;
          line-height: .9;
          font-weight: 950;
          color: #14100a;
          background:
            linear-gradient(135deg, rgba(255,255,255,.85), rgba(240,201,111,.95)),
            radial-gradient(circle at 80% 20%, #7ddbd2, transparent 30%);
        }

        .coupon-body {
          padding: 16px;
          display: grid;
          gap: 12px;
          flex: 1;
        }

        .coupon-meta,
        .store-line {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .coupon-meta {
          flex-wrap: wrap;
        }

        .coupon-meta span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #bcb3a6;
          font-size: 12px;
          font-weight: 800;
        }

        .coupon-card h2 {
          font-size: 21px;
          letter-spacing: 0;
        }

        .store-line {
          padding-top: 4px;
        }

        .store-line strong {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        dl {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin: 0;
        }

        dl div {
          min-height: 58px;
          border: 1px solid rgba(255, 255, 255, .1);
          border-radius: 8px;
          padding: 10px;
          background: rgba(0, 0, 0, .14);
        }

        .claim-button {
          min-height: 52px;
          border: 0;
          border-top: 1px solid rgba(240, 201, 111, .2);
          background: #f0c96f;
          color: #171109;
          font: inherit;
          font-weight: 950;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .claim-button:disabled {
          cursor: wait;
          opacity: .72;
        }

        .spin {
          animation: spin .8s linear infinite;
        }

        .coupon-skeleton {
          min-height: 420px;
          border-radius: 8px;
          background: linear-gradient(90deg, rgba(255,255,255,.055), rgba(240,201,111,.13), rgba(255,255,255,.055));
          background-size: 220% 100%;
          animation: shimmer 1.4s ease-in-out infinite;
        }

        .empty-state {
          min-height: 280px;
          display: grid;
          place-items: center;
          text-align: center;
          padding: 34px;
          gap: 10px;
        }

        .empty-state h2 {
          font-size: 26px;
        }

        @keyframes shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 980px) {
          .header-grid,
          .claim-panel,
          .coupon-grid {
            grid-template-columns: 1fr;
          }

          .guest-form {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 620px) {
          .coupon-page {
            padding: 16px;
          }

          .coupon-header {
            padding-top: 20px;
          }

          .coupon-value {
            min-height: 98px;
            font-size: 36px;
          }

          dl {
            grid-template-columns: 1fr;
          }

          .coupon-meta,
          .store-line {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
}
