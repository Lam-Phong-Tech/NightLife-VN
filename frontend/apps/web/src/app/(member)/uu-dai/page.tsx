"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertCircle, Search, Ticket } from "lucide-react";
import { ApiError } from "@/lib/api/client";
import { couponApi, type PublicCoupon } from "@/lib/api/coupons";

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

const categoryImages: Record<string, string> = {
  BAR: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=420&q=72",
  CLUB: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=420&q=72",
  LOUNGE:
    "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=420&q=72",
  GIRLS_BAR:
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=420&q=72",
  KARAOKE:
    "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=420&q=72",
  MASSAGE_SPA:
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=420&q=72",
  RESTAURANT:
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=420&q=72",
};

const fallbackImages = [
  "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=420&q=72",
  "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=420&q=72",
  "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=420&q=72",
  "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=420&q=72",
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=420&q=72",
];

const formatVnd = (value?: number | null) => {
  if (!value) {
    return "0đ";
  }

  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
};

const formatDiscount = (coupon: Pick<PublicCoupon, "discountType" | "discountValue">) => {
  if (coupon.discountType === "PERCENT") {
    return `-${coupon.discountValue}%`;
  }

  return `-${formatVnd(coupon.discountValue)}`;
};

const formatShortDate = (value?: string | null) => {
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
  }).format(date);
};

const readableName = (name: string) => {
  const parts = name.split(/—|-/);
  return parts[parts.length - 1]?.trim() || name;
};

const getCouponImage = (coupon: PublicCoupon, index: number) =>
  categoryImages[coupon.store.category] ?? fallbackImages[index % fallbackImages.length];

const getStoreLocation = (coupon: PublicCoupon) => {
  const area = [coupon.store.district, coupon.store.city].filter(Boolean).join(", ");

  return area || categoryLabels[coupon.store.category] || coupon.store.category;
};

function CouponDealCard({ coupon, index }: { coupon: PublicCoupon; index: number }) {
  const storeName = readableName(coupon.store.name);

  return (
    <Link
      aria-label={`Xem chi tiết quán ${storeName} cho coupon ${readableName(coupon.name)}`}
      className="coupon-card"
      href={`/stores/${coupon.store.slug}`}
    >
      <span
        aria-label="Ảnh ưu đãi"
        className="coupon-image"
        role="img"
        style={{ backgroundImage: `url(${getCouponImage(coupon, index)})` }}
      />
      <span className="coupon-copy">
        <strong>{formatDiscount(coupon)}</strong>
        <span className="coupon-title">{readableName(coupon.name)}</span>
        <span className="coupon-place">
          {storeName} · {getStoreLocation(coupon)}
        </span>
        <span className="coupon-expiry">HSD {formatShortDate(coupon.endsAt)}</span>
      </span>
      <span className="coupon-action">LẤY MÃ</span>
    </Link>
  );
}

export default function Page() {
  const [coupons, setCoupons] = useState<PublicCoupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

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
          error instanceof ApiError ? error.message : "Không tải được danh sách ưu đãi từ backend.";
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

  return (
    <main className="coupon-page">
      <section className="coupon-shell">
        <header className="coupon-hero">
          <Link className="back-link" href="/danh-sach-quan">
            Xem danh sách quán
          </Link>
          <div className="title-row">
            <div>
              <span className="eyebrow">HOT DEALS</span>
              <h1>Ưu đãi đêm nay</h1>
              <p>Coupon & khuyến mãi từ các quán đối tác · Hà Nội</p>
            </div>
            <button aria-label="Tìm ưu đãi" className="search-button" type="button">
              <Search size={17} />
            </button>
          </div>
        </header>

        {loadError ? (
          <section className="result error" role="alert">
            <AlertCircle size={20} />
            <span>{loadError}</span>
          </section>
        ) : null}

        {isLoading ? (
          <section className="coupon-list" aria-label="Đang tải ưu đãi">
            {[0, 1, 2, 3, 4].map((item) => (
              <div className="coupon-skeleton" key={item} />
            ))}
          </section>
        ) : null}

        {!isLoading && !loadError && coupons.length === 0 ? (
          <section className="empty-state">
            <Ticket size={32} />
            <h2>Chưa có coupon đang mở</h2>
            <p>Hiện chưa có ưu đãi phù hợp. Bạn quay lại sau một chút nhé.</p>
            <Link href="/danh-sach-quan">Tìm quán khác</Link>
          </section>
        ) : null}

        {!isLoading && !loadError && coupons.length ? (
          <section className="coupon-list" aria-label="Danh sách coupon đang có">
            {coupons.map((coupon, index) => (
              <CouponDealCard coupon={coupon} index={index} key={coupon.id} />
            ))}
          </section>
        ) : null}
      </section>

      <style>{`
        .coupon-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at 50% -18%, rgba(212, 178, 106, .12), transparent 34%),
            #0c0c0f;
          color: #f3f0ea;
          font-family: var(--nl-font-sans);
          overflow-x: hidden;
          padding: 28px 28px 58px;
        }

        .coupon-shell {
          width: min(100%, 720px);
          margin: 0 auto;
          display: grid;
          gap: 14px;
        }

        .coupon-hero {
          padding: 10px 0 2px;
        }

        .back-link,
        .empty-state a {
          color: #e3c27e;
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
        }

        .title-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          margin-top: 14px;
        }

        .eyebrow {
          color: #8c8679;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.6px;
          text-transform: uppercase;
        }

        h1,
        h2,
        p {
          margin: 0;
        }

        h1 {
          margin-top: 8px;
          color: #f3f0ea;
          font-size: 30px;
          line-height: 1.12;
          font-weight: 900;
        }

        .coupon-hero p {
          margin-top: 7px;
          color: #8c8679;
          font-size: 12.5px;
          line-height: 1.55;
        }

        .search-button {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid rgba(212, 178, 106, .32);
          background: rgba(255, 255, 255, .04);
          color: #d4b26a;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex: none;
        }

        .coupon-list {
          display: grid;
          gap: 11px;
        }

        .coupon-card {
          min-height: 98px;
          border: 1px solid rgba(212, 178, 106, .22);
          border-radius: 14px;
          background: rgba(255, 255, 255, .045);
          color: #f3f0ea;
          display: grid;
          grid-template-columns: 92px minmax(0, 1fr) auto;
          align-items: center;
          gap: 14px;
          padding: 10px;
          text-decoration: none;
          box-shadow: 0 14px 28px -22px rgba(0, 0, 0, .8);
        }

        .coupon-image {
          width: 92px;
          height: 74px;
          border-radius: 12px;
          background-position: center;
          background-size: cover;
          border: 1px solid rgba(212, 178, 106, .18);
        }

        .coupon-copy {
          min-width: 0;
          display: grid;
          gap: 3px;
        }

        .coupon-copy strong {
          color: #f0dda8;
          font-size: 21px;
          font-weight: 900;
          line-height: 1;
          white-space: nowrap;
        }

        .coupon-title {
          color: #f3f0ea;
          font-size: 14px;
          font-weight: 850;
          line-height: 1.25;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .coupon-place,
        .coupon-expiry {
          color: #8c8679;
          font-size: 12px;
          line-height: 1.35;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .coupon-expiry {
          display: none;
        }

        .coupon-action {
          min-height: 34px;
          border: 1px solid rgba(240, 221, 168, .38);
          border-radius: 999px;
          background: linear-gradient(135deg, #f4e3b4, #d4b26a 55%, #b6924a);
          color: #241a0a;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 12px;
          box-shadow: 0 10px 22px -16px rgba(244, 227, 180, .9);
          font-size: 11.5px;
          font-weight: 900;
          letter-spacing: .08em;
          white-space: nowrap;
        }

        .result {
          min-height: 54px;
          border: 1px solid rgba(255, 128, 150, .42);
          border-radius: 14px;
          background: rgba(255, 128, 150, .12);
          color: #ffd1d9;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 15px;
          font-size: 13px;
        }

        .coupon-skeleton {
          min-height: 98px;
          border-radius: 14px;
          background: linear-gradient(90deg, rgba(255, 255, 255, .035), rgba(212, 178, 106, .14), rgba(255, 255, 255, .035));
          background-size: 220% 100%;
          animation: shimmer 1.4s ease-in-out infinite;
        }

        .empty-state {
          min-height: 260px;
          border: 1px solid rgba(212, 178, 106, .18);
          border-radius: 16px;
          background: rgba(255, 255, 255, .03);
          display: grid;
          place-items: center;
          gap: 10px;
          padding: 34px;
          text-align: center;
        }

        .empty-state h2 {
          color: #f3f0ea;
          font-size: 22px;
        }

        .empty-state p {
          color: #8c8679;
          font-size: 13px;
          line-height: 1.6;
        }

        @keyframes shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }

        @media (min-width: 720px) {
          .coupon-card {
            min-height: 116px;
            grid-template-columns: 120px minmax(0, 1fr) auto;
            padding: 12px;
          }

          .coupon-image {
            width: 120px;
            height: 86px;
            border-radius: 13px;
          }

          .coupon-copy strong {
            font-size: 24px;
          }

          .coupon-title {
            font-size: 15px;
          }

          .coupon-expiry {
            display: block;
          }
        }

        @media (max-width: 640px) {
          .coupon-page {
            padding: 18px 16px calc(78px + env(safe-area-inset-bottom));
          }

          .coupon-shell {
            gap: 12px;
          }

          .title-row {
            align-items: center;
            margin-top: 8px;
          }

          h1 {
            font-size: 27px;
          }

          .coupon-hero p {
            font-size: 11.5px;
          }

          .coupon-card {
            grid-template-columns: 90px minmax(0, 1fr) auto;
            gap: 12px;
          }

          .coupon-image {
            width: 90px;
            height: 74px;
          }

          .coupon-action {
            min-height: 32px;
            padding: 0 10px;
            font-size: 10.5px;
          }
        }

        @media (max-width: 374px) {
          .coupon-card {
            grid-template-columns: 78px minmax(0, 1fr) auto;
            gap: 10px;
          }

          .coupon-image {
            width: 78px;
            height: 66px;
          }

          .coupon-copy strong {
            font-size: 18px;
          }

          .coupon-title {
            font-size: 12.5px;
          }

          .coupon-place {
            font-size: 11px;
          }

          .coupon-action {
            padding: 0 8px;
            font-size: 10px;
          }
        }
      `}</style>
    </main>
  );
}
