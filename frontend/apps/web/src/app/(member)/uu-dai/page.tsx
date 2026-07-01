"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Crown,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Search,
  SlidersHorizontal,
  Store,
  Ticket,
  UserRound,
  X,
} from "lucide-react";
import { ApiError } from "@/lib/api/client";
import { couponApi, type CouponIssue, type PublicCoupon } from "@/lib/api/coupons";
import { getAuthUser, type AuthUser } from "@/lib/auth/session";

type CouponQuery = {
  couponId?: string;
  storeId?: string;
  storeSlug?: string;
};

type CouponFilter = "all" | "expiring" | "store" | "vip";

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
  LOUNGE: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=420&q=72",
  GIRLS_BAR: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=420&q=72",
  KARAOKE: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=420&q=72",
  MASSAGE_SPA: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=420&q=72",
  RESTAURANT: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=420&q=72",
};

const fallbackImages = [
  "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=420&q=72",
  "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=420&q=72",
  "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=420&q=72",
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=420&q=72",
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=420&q=72",
];

const filterLabels: Record<CouponFilter, string> = {
  all: "Tất cả",
  expiring: "Sắp hết hạn",
  store: "Theo quán",
  vip: "VIP-only",
};

const dayMs = 1000 * 60 * 60 * 24;

const formatVnd = (value?: number | null) => {
  if (!value) {
    return "0đ";
  }

  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
};

const formatDiscount = (coupon: Pick<PublicCoupon, "discountType" | "discountValue">) => {
  if (coupon.discountType === "PERCENT") {
    return `−${coupon.discountValue}%`;
  }

  return `−${formatVnd(coupon.discountValue)}`;
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

  if (diffMs < dayMs) {
    const hours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
    return `Còn ${hours} giờ`;
  }

  const days = Math.ceil(diffMs / dayMs);
  return `Còn ${days} ngày`;
};

const readableName = (name: string) => {
  const parts = name.split(/—|-/);
  return parts[parts.length - 1]?.trim() || name;
};

const readableDescription = (description?: string | null) => {
  if (!description) {
    return "Xuất trình ưu đãi khi đặt bàn hoặc thanh toán tại quán.";
  }

  const lines = description
    .split("\n")
    .map((line) => line.replace(/^🇯🇵|^🇬🇧|^🇻🇳/u, "").trim())
    .filter(Boolean);

  return lines[lines.length - 1] || description;
};

const isMemberUser = (user: AuthUser | null) => user?.role?.toUpperCase() === "USER";

const isVipCoupon = (coupon: PublicCoupon) => {
  const text = `${coupon.code} ${coupon.name} ${coupon.description ?? ""}`.toLowerCase();
  return text.includes("vip");
};

const isExpiringSoon = (coupon: PublicCoupon) => {
  if (!coupon.endsAt) {
    return false;
  }

  const diffMs = new Date(coupon.endsAt).getTime() - Date.now();
  return diffMs > 0 && diffMs <= 2 * dayMs;
};

const getCouponImage = (coupon: PublicCoupon, index: number) =>
  categoryImages[coupon.store.category] ?? fallbackImages[index % fallbackImages.length];

const getStoreLocation = (coupon: PublicCoupon) =>
  [coupon.store.district, coupon.store.city].filter(Boolean).join(", ");

const couponQrImageUrl = (issue: CouponIssue) => issue.qrImageDataUrl || "";

const isCouponIssueExpired = (issue: CouponIssue) => {
  if (!issue.expiresAt) {
    return false;
  }

  const expiresAt = new Date(issue.expiresAt).getTime();
  return Number.isFinite(expiresAt) && expiresAt <= Date.now();
};

const canShowIssueQr = (issue: CouponIssue) =>
  issue.status === "ISSUED" && !isCouponIssueExpired(issue) && Boolean(issue.qrImageDataUrl);

const couponIssueStatusText = (issue: CouponIssue) => {
  if (issue.status === "USED") {
    return "Đã sử dụng";
  }

  if (issue.status === "EXPIRED" || isCouponIssueExpired(issue)) {
    return "Hết hạn";
  }

  if (issue.status === "ISSUED") {
    return issue.statusLabel || "Đang giữ chỗ";
  }

  return issue.statusLabel || issue.status;
};

const issueDiscountText = (issue: CouponIssue) => {
  if (typeof issue.discountPercent === "number") {
    return `-${issue.discountPercent}%`;
  }

  if (issue.coupon.discountType && typeof issue.coupon.discountValue === "number") {
    return formatDiscount({
      discountType: issue.coupon.discountType,
      discountValue: issue.coupon.discountValue,
    });
  }

  return "Ưu đãi";
};

const issueStoreName = (issue: CouponIssue) =>
  issue.coupon.store?.name ? readableName(issue.coupon.store.name) : "Vietyoru partner";

function ClaimedCouponModal({
  copied,
  coupon,
  issue,
  onClose,
  onCopy,
}: {
  copied: boolean;
  coupon: PublicCoupon | null;
  issue: CouponIssue;
  onClose: () => void;
  onCopy: () => void;
}) {
  const visualCoupon =
    coupon ??
    ({
      id: issue.coupon.id,
      code: issue.coupon.code,
      name: issue.coupon.name,
      description: null,
      discountType: issue.coupon.discountType ?? "PERCENT",
      discountValue: issue.coupon.discountValue ?? 0,
      maxDiscountVnd: issue.coupon.maxDiscountVnd,
      minSpendVnd: issue.coupon.minSpendVnd,
      startsAt: issue.createdAt ?? new Date().toISOString(),
      endsAt: issue.expiresAt,
      store: {
        id: issue.coupon.store?.id ?? "",
        name: issue.coupon.store?.name ?? "Vietyoru partner",
        slug: issue.coupon.store?.slug ?? "",
        category: "LOUNGE",
        city: "Hà Nội",
        district: null,
      },
    } satisfies PublicCoupon);

  const storeName = readableName(visualCoupon.store.name);
  const image = getCouponImage(visualCoupon, 0);

  return (
    <div className="coupon-modal-backdrop" role="presentation">
      <section
        aria-labelledby="claimed-coupon-title"
        aria-modal="true"
        className="coupon-modal"
        role="dialog"
      >
        <div className="coupon-modal-cover" style={{ backgroundImage: `linear-gradient(180deg,rgba(12,12,15,.1),rgba(12,12,15,.75)), url(${image})` }}>
          <button aria-label="Đóng mã ưu đãi" className="modal-close" onClick={onClose} type="button">
            <X size={14} />
          </button>
          <div>
            <strong id="claimed-coupon-title">{formatDiscount(visualCoupon)} {readableName(visualCoupon.name)}</strong>
            <span>{storeName}</span>
          </div>
        </div>

        <div className="coupon-modal-body">
          <span className="modal-eyebrow">Mã ưu đãi của bạn</span>
          {canShowIssueQr(issue) ? (
            <div className="claimed-qr" aria-label="QR coupon">
              <Image
                src={couponQrImageUrl(issue)}
                alt={`QR ${issue.code}`}
                width={148}
                height={148}
                unoptimized
              />
            </div>
          ) : null}
          <div className="claimed-code">
            <strong>{issue.code}</strong>
            <button aria-label="Sao chép mã ưu đãi" onClick={onCopy} type="button">
              <Copy size={15} />
            </button>
          </div>
          <span className="claimed-status">{couponIssueStatusText(issue)}</span>
          <button className="copy-button" onClick={onCopy} type="button">
            <Copy size={16} />
            {copied ? "Đã sao chép" : "Sao chép mã"}
          </button>
          <p>
            Áp dụng tại {storeName} đến hết <b>{formatDate(issue.expiresAt)}</b>. Xuất trình mã khi đặt bàn hoặc thanh toán.
          </p>
        </div>
      </section>
    </div>
  );
}

function MemberCouponWallet({
  copiedIssueId,
  error,
  isLoading,
  issues,
  onCopy,
}: {
  copiedIssueId: string | null;
  error: string;
  isLoading: boolean;
  issues: CouponIssue[];
  onCopy: (issue: CouponIssue) => void;
}) {
  return (
    <section className="coupon-wallet" aria-label="Ví coupon đã claim">
      <div className="wallet-heading">
        <div>
          <span className="claim-eyebrow">
            <Ticket size={15} />
            Ví coupon
          </span>
          <h2>Mã đã lưu</h2>
        </div>
        <span>{issues.length} mã</span>
      </div>

      {isLoading ? (
        <div className="wallet-state">
          <Loader2 className="spin" size={16} />
          Đang tải ví coupon
        </div>
      ) : null}

      {error ? (
        <div className="wallet-state error">
          <AlertCircle size={16} />
          {error}
        </div>
      ) : null}

      {!isLoading && !error && issues.length === 0 ? (
        <div className="wallet-state">Chưa có mã nào trong ví.</div>
      ) : null}

      {issues.length ? (
        <div className="wallet-list">
          {issues.map((issue) => {
            const showQr = canShowIssueQr(issue);
            const statusText = couponIssueStatusText(issue);
            const statusDetail =
              issue.status === "USED"
                ? `Dùng lúc ${formatDate(issue.usedAt)}`
                : issue.status === "EXPIRED" || isCouponIssueExpired(issue)
                  ? `HSD ${formatDate(issue.expiresAt)}`
                  : `HSD ${formatDate(issue.expiresAt)}`;

            return (
              <article className={`wallet-item ${showQr ? "active" : "inactive"}`} key={issue.id}>
                <div className="wallet-copy">
                  <div className="wallet-value-row">
                    <strong>{issueDiscountText(issue)}</strong>
                    <span className={showQr ? "claimed-status" : "claimed-status inactive"}>{statusText}</span>
                  </div>
                  <h3>{readableName(issue.coupon.name)}</h3>
                  <p>{issueStoreName(issue)}</p>
                  <div className="wallet-meta">
                    <span>{statusDetail}</span>
                    <span>{issue.userType || "MEMBER"}</span>
                  </div>
                  <div className="wallet-code-row">
                    <code>{issue.code}</code>
                    {showQr ? (
                      <button aria-label="Sao chép mã trong ví" onClick={() => onCopy(issue)} type="button">
                        <Copy size={14} />
                        {copiedIssueId === issue.id ? "Đã sao chép" : "Sao chép"}
                      </button>
                    ) : null}
                  </div>
                </div>

                {showQr ? (
                  <div className="wallet-qr" aria-label="QR coupon đang giữ chỗ">
                    <Image
                      src={couponQrImageUrl(issue)}
                      alt={`QR ${issue.code}`}
                      width={176}
                      height={176}
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="wallet-status-card">
                    <strong>{statusText}</strong>
                    <span>{issue.status === "USED" ? "Không cho dùng lại" : "QR đã ẩn"}</span>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

export default function Page() {
  const searchParams = useSearchParams();
  const [coupons, setCoupons] = useState<PublicCoupon[]>([]);
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
  const [activeFilter, setActiveFilter] = useState<CouponFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [claimingCouponId, setClaimingCouponId] = useState<string | null>(null);
  const [claimError, setClaimError] = useState("");
  const [claimedIssue, setClaimedIssue] = useState<CouponIssue | null>(null);
  const [claimedCoupon, setClaimedCoupon] = useState<PublicCoupon | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedIssueId, setCopiedIssueId] = useState<string | null>(null);
  const [memberIssues, setMemberIssues] = useState<CouponIssue[]>([]);
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState("");
  const isMember = isMemberUser(authUser);
  const query = useMemo<CouponQuery>(
    () => ({
      couponId: searchParams.get("couponId") || undefined,
      storeId: searchParams.get("storeId") || undefined,
      storeSlug: searchParams.get("storeSlug") || undefined,
    }),
    [searchParams],
  );
  const hasStoreScope = Boolean(query.storeId || query.storeSlug);
  const hasCouponScope = Boolean(query.couponId);

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

  useEffect(() => {
    if (!isMember) {
      return;
    }

    let isMounted = true;
    void Promise.resolve().then(async () => {
      if (!isMounted) {
        return;
      }

      setIsWalletLoading(true);

      try {
        const issues = await couponApi.listMemberCouponIssues();
        if (isMounted) {
          setMemberIssues(issues);
          setWalletError("");
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message =
          error instanceof ApiError
            ? error.message
            : "Không tải được ví coupon đã lưu.";
        setWalletError(message);
      } finally {
        if (isMounted) {
          setIsWalletLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isMember]);

  const visibleMemberIssues = isMember ? memberIssues : [];
  const visibleWalletError = isMember ? walletError : "";
  const visibleIsWalletLoading = isMember ? isWalletLoading : false;

  const effectiveActiveFilter = hasStoreScope ? "store" : activeFilter;

  const scopedCoupons = useMemo(() => {
    return coupons.filter((coupon) => {
      const matchesStoreId = !query.storeId || coupon.store.id === query.storeId;
      const matchesStoreSlug = !query.storeSlug || coupon.store.slug === query.storeSlug;

      if (hasStoreScope) {
        return matchesStoreId && matchesStoreSlug;
      }

      return !query.couponId || coupon.id === query.couponId;
    });
  }, [coupons, hasStoreScope, query.couponId, query.storeId, query.storeSlug]);

  const selectedCoupon = useMemo(
    () => (query.couponId ? coupons.find((coupon) => coupon.id === query.couponId) ?? null : null),
    [coupons, query.couponId],
  );

  const scopedStore = useMemo(() => {
    if (!hasStoreScope) {
      return selectedCoupon?.store ?? null;
    }

    return coupons.find((coupon) => {
      if (query.storeId && coupon.store.id === query.storeId) {
        return true;
      }

      return Boolean(query.storeSlug && coupon.store.slug === query.storeSlug);
    })?.store;
  }, [coupons, hasStoreScope, query.storeId, query.storeSlug, selectedCoupon]);

  const visibleCoupons = useMemo(() => {
    const filtered = scopedCoupons.filter((coupon) => {
      if (effectiveActiveFilter === "expiring") {
        return isExpiringSoon(coupon);
      }

      if (effectiveActiveFilter === "vip") {
        return isVipCoupon(coupon);
      }

      return true;
    });

    if (effectiveActiveFilter === "store") {
      return [...filtered].sort((first, second) => first.store.name.localeCompare(second.store.name, "vi"));
    }

    return filtered;
  }, [effectiveActiveFilter, scopedCoupons]);

  const filterCounts = useMemo(
    () => ({
      all: scopedCoupons.length,
      expiring: scopedCoupons.filter(isExpiringSoon).length,
      store: scopedCoupons.length,
      vip: scopedCoupons.filter(isVipCoupon).length,
    }),
    [scopedCoupons],
  );

  const isSelectedCouponOnly = hasCouponScope && !hasStoreScope;
  const pageTitle =
    hasStoreScope && scopedStore
      ? `Ưu đãi của ${readableName(scopedStore.name)}`
      : isSelectedCouponOnly && selectedCoupon
        ? readableName(selectedCoupon.name)
        : "Ưu đãi đêm nay";
  const backHref = hasStoreScope && scopedStore ? `/stores/${scopedStore.slug}` : "/danh-sach-quan";
  const scopeLabel = hasStoreScope ? "Ưu đãi của quán" : isSelectedCouponOnly ? "Ưu đãi được chọn" : "Tất cả coupon";

  const claimCoupon = async (coupon: PublicCoupon) => {
    setClaimError("");
    setClaimedIssue(null);
    setCopied(false);

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

      setClaimedCoupon(coupon);
      setClaimedIssue(issue);
      if (isMember) {
        setMemberIssues((current) => [
          issue,
          ...current.filter((item) => item.id !== issue.id),
        ]);
        setWalletError("");
      }
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

  const copyClaimedCode = async () => {
    if (!claimedIssue) {
      return;
    }

    try {
      await navigator.clipboard.writeText(claimedIssue.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setClaimError("Không sao chép được mã. Bạn có thể chọn và sao chép thủ công.");
    }
  };

  const copyWalletIssueCode = async (issue: CouponIssue) => {
    try {
      await navigator.clipboard.writeText(issue.code);
      setCopiedIssueId(issue.id);
      window.setTimeout(() => setCopiedIssueId(null), 1800);
    } catch {
      setWalletError("Không sao chép được mã. Bạn có thể chọn và sao chép thủ công.");
    }
  };

  return (
    <main className="coupon-page">
      <section className="coupon-shell">
        <header className="coupon-hero">
          <div className="hero-copy">
            <Link className="back-link" href={backHref}>
              {hasStoreScope ? "Về chi tiết quán" : "Xem danh sách quán"}
            </Link>
            <div className="title-row">
              <div>
                <span className="eyebrow">HOT DEALS</span>
                <h1>{pageTitle}</h1>
                <p>Coupon & khuyến mãi từ các quán đối tác · Hà Nội</p>
              </div>
              <button aria-label="Tìm ưu đãi" className="search-button" type="button">
                <Search size={17} />
              </button>
            </div>
          </div>

          <div className="hero-stats" aria-label="Tóm tắt ưu đãi">
            <div>
              <span>Phạm vi</span>
              <strong>{scopeLabel}</strong>
            </div>
            <div>
              <span>Đang có</span>
              <strong>{scopedCoupons.length} coupon</strong>
            </div>
            {scopedStore ? (
              <Link href={`/stores/${scopedStore.slug}`}>Mở trang quán</Link>
            ) : null}
          </div>
        </header>

        <section className="coupon-controls" aria-label="Bộ lọc ưu đãi">
          <nav className="filter-chips hscroll">
            {(Object.keys(filterLabels) as CouponFilter[]).map((filter) => {
              const active = effectiveActiveFilter === filter;
              return (
                <button
                  aria-pressed={active}
                  className={active ? "filter-chip active" : filter === "vip" ? "filter-chip vip-chip" : "filter-chip"}
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  type="button"
                >
                  {filter === "vip" ? <Crown size={13} /> : null}
                  {filterLabels[filter]}
                  <span>{filterCounts[filter]}</span>
                </button>
              );
            })}
          </nav>

          <div className="sort-pill">
            <SlidersHorizontal size={14} />
            Mới nhất
          </div>
        </section>

        <section className="claim-panel">
          <div>
            <span className="claim-eyebrow">
              <Ticket size={15} />
              {isMember ? "Ví hội viên" : "Nhận mã khách"}
            </span>
            <p>
              {isMember
                ? "Mã sẽ được lưu vào ví ưu đãi của hội viên sau khi lấy."
                : "Khách vãng lai chỉ cần số điện thoại để nhận mã dùng một lần."}
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
          ) : (
            <div className="member-note">
              <CheckCircle2 size={18} />
              Đang đăng nhập hội viên
            </div>
          )}
        </section>

        {isMember ? (
          <MemberCouponWallet
            copiedIssueId={copiedIssueId}
            error={visibleWalletError}
            isLoading={visibleIsWalletLoading}
            issues={visibleMemberIssues}
            onCopy={copyWalletIssueCode}
          />
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
            {[0, 1, 2, 3].map((item) => (
              <div className="coupon-skeleton" key={item} />
            ))}
          </section>
        ) : null}

        {!isLoading && !loadError && visibleCoupons.length === 0 ? (
          <section className="empty-state">
            <Ticket size={32} />
            <h2>Chưa có coupon đang mở</h2>
            <p>
              {hasStoreScope
                ? "Quán này hiện không có ưu đãi active."
                : isSelectedCouponOnly
                  ? "Ưu đãi từ CTA hiện không còn hoạt động."
                  : "Hiện chưa có ưu đãi phù hợp bộ lọc."}
            </p>
            <Link href="/danh-sach-quan">Tìm quán khác</Link>
          </section>
        ) : null}

        {!isLoading && !loadError && visibleCoupons.length ? (
          <section className="coupon-grid" aria-label="Danh sách coupon">
            {visibleCoupons.map((coupon, index) => {
              const isClaiming = claimingCouponId === coupon.id;
              const isVip = isVipCoupon(coupon);
              const isExpiring = isExpiringSoon(coupon);
              const storeLabel = readableName(coupon.store.name);
              const image = getCouponImage(coupon, index);
              const selected = query.couponId === coupon.id;

              return (
                <article
                  className={[
                    "coupon-ticket",
                    isVip ? "vip" : "",
                    isExpiring ? "expiring" : "",
                    selected ? "selected" : "",
                  ].filter(Boolean).join(" ")}
                  key={coupon.id}
                >
                  {isVip ? <span className="vip-bar" aria-hidden="true" /> : null}
                  <span
                    aria-label="Ảnh ưu đãi"
                    className="coupon-photo"
                    role="img"
                    style={{ backgroundImage: `linear-gradient(180deg,rgba(0,0,0,.06),rgba(0,0,0,.46)), url(${image})` }}
                  />
                  <div className="ticket-copy">
                    <div className="ticket-value-row">
                      <strong>{formatDiscount(coupon)}</strong>
                      {isVip ? (
                        <span className="vip-badge">
                          <Crown size={11} />
                          VIP
                        </span>
                      ) : null}
                    </div>
                    <h2>{readableName(coupon.name)}</h2>
                    <p>{readableDescription(coupon.description)}</p>
                    <div className="ticket-meta">
                      <span>
                        <Store size={13} />
                        {storeLabel}
                      </span>
                      <span>
                        <MapPin size={13} />
                        {getStoreLocation(coupon) || categoryLabels[coupon.store.category] || coupon.store.category}
                      </span>
                      <span>HSD {formatShortDate(coupon.endsAt)}</span>
                    </div>
                    {isExpiring ? (
                      <div className="countdown">
                        <i aria-hidden="true" />
                        <span>Sắp hết hạn · {expiryText(coupon.endsAt)}</span>
                      </div>
                    ) : null}
                    <dl className="ticket-rules">
                      <div>
                        <dt>Mã gốc</dt>
                        <dd>{coupon.code}</dd>
                      </div>
                      <div>
                        <dt>Tối thiểu</dt>
                        <dd>{coupon.minSpendVnd ? formatVnd(coupon.minSpendVnd) : "Không yêu cầu"}</dd>
                      </div>
                      <div>
                        <dt>Giảm tối đa</dt>
                        <dd>{coupon.maxDiscountVnd ? formatVnd(coupon.maxDiscountVnd) : "Theo quy định"}</dd>
                      </div>
                    </dl>
                    <Link className="store-link" href={`/stores/${coupon.store.slug}`}>
                      Chi tiết quán
                    </Link>
                  </div>
                  <button
                    className="ticket-action"
                    disabled={Boolean(claimingCouponId)}
                    onClick={() => claimCoupon(coupon)}
                    type="button"
                  >
                    {isClaiming ? <Loader2 size={16} className="spin" /> : null}
                    <span>{isMember ? "Lưu ví" : "Lấy mã"}</span>
                  </button>
                </article>
              );
            })}
          </section>
        ) : null}
      </section>

      {claimedIssue ? (
        <ClaimedCouponModal
          copied={copied}
          coupon={claimedCoupon}
          issue={claimedIssue}
          onClose={() => {
            setClaimedIssue(null);
            setCopied(false);
          }}
          onCopy={copyClaimedCode}
        />
      ) : null}

      <style>{`
        .coupon-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at 50% -18%, rgba(212,178,106,.12), transparent 34%),
            #0c0c0f;
          color: #f3f0ea;
          font-family: var(--nl-font-sans);
          overflow-x: hidden;
          padding: 28px 28px 58px;
        }

        .coupon-shell {
          max-width: 1120px;
          margin: 0 auto;
          display: grid;
          gap: 18px;
        }

        .coupon-hero {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 318px;
          gap: 22px;
          align-items: end;
          padding: 10px 0 2px;
        }

        .hero-copy {
          min-width: 0;
        }

        .back-link,
        .store-link,
        .hero-stats a,
        .empty-state a {
          color: #e3c27e;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
        }

        .title-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          margin-top: 12px;
        }

        .eyebrow,
        .modal-eyebrow,
        .claim-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #8c8679;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.6px;
          text-transform: uppercase;
        }

        h1,
        h2,
        p,
        dl {
          margin: 0;
        }

        h1 {
          margin-top: 8px;
          font-size: 30px;
          line-height: 1.12;
          font-weight: 700;
          letter-spacing: 0;
          color: #f3f0ea;
        }

        .coupon-hero p {
          color: #8c8679;
          font-size: 12.5px;
          line-height: 1.55;
          margin-top: 7px;
        }

        .search-button {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid rgba(212,178,106,.32);
          background: rgba(255,255,255,.04);
          color: #d4b26a;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex: none;
        }

        .hero-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          border: 1px solid rgba(212,178,106,.22);
          background: rgba(255,255,255,.035);
          border-radius: 16px;
          padding: 14px;
        }

        .hero-stats div {
          display: grid;
          gap: 4px;
          min-width: 0;
        }

        .hero-stats span,
        .ticket-rules dt {
          color: #8c8679;
          font-size: 10.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .hero-stats strong,
        .ticket-rules dd {
          color: #f3f0ea;
          font-size: 13px;
          font-weight: 700;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .hero-stats a {
          grid-column: 1 / -1;
          border-top: 1px solid rgba(255,255,255,.07);
          padding-top: 10px;
        }

        .coupon-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          min-width: 0;
        }

        .filter-chips {
          display: flex;
          gap: 9px;
          min-width: 0;
          max-width: 100%;
          overflow-x: auto;
          padding: 1px 0 4px;
        }

        .filter-chip,
        .sort-pill {
          min-height: 36px;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,.1);
          background: rgba(255,255,255,.05);
          color: #c5c0b6;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font: inherit;
          font-size: 12.5px;
          font-weight: 600;
          padding: 0 15px;
          white-space: nowrap;
          cursor: pointer;
          flex: none;
        }

        .filter-chip span {
          min-width: 18px;
          height: 18px;
          border-radius: 9px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,.08);
          color: #9b958a;
          font-size: 10.5px;
          padding: 0 5px;
        }

        .filter-chip.active {
          border-color: transparent;
          background: linear-gradient(135deg,#f0dda8,#d4b26a);
          color: #241a0a;
        }

        .filter-chip.active span {
          background: #241a0a;
          color: #f0dda8;
        }

        .vip-chip {
          border-color: rgba(212,178,106,.4);
          background: rgba(212,178,106,.1);
          color: #e3c27e;
        }

        .sort-pill {
          cursor: default;
          color: #e3c27e;
          border-color: rgba(212,178,106,.22);
        }

        .claim-panel {
          display: grid;
          grid-template-columns: minmax(0, .72fr) minmax(420px, 1fr);
          gap: 16px;
          align-items: center;
          border: 1px solid rgba(212,178,106,.18);
          background: rgba(255,255,255,.03);
          border-radius: 16px;
          padding: 14px;
        }

        .claim-panel p {
          color: #8c8679;
          font-size: 12.5px;
          line-height: 1.55;
          margin-top: 6px;
        }

        .claim-eyebrow {
          color: #e3c27e;
          letter-spacing: 1.2px;
        }

        .guest-form {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .guest-form label {
          min-height: 44px;
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 11px;
          background: rgba(0,0,0,.18);
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 12px;
          color: #d4b26a;
          min-width: 0;
        }

        .guest-form input {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #f3f0ea;
          font: inherit;
          font-size: 12.5px;
          min-width: 0;
        }

        .guest-form input::placeholder {
          color: #8c8679;
        }

        .member-note {
          min-height: 44px;
          border-radius: 11px;
          border: 1px solid rgba(212,178,106,.22);
          background: rgba(212,178,106,.08);
          color: #f0dda8;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 700;
        }

        .coupon-wallet {
          border: 1px solid rgba(212,178,106,.18);
          background: rgba(255,255,255,.03);
          border-radius: 16px;
          padding: 14px;
          display: grid;
          gap: 13px;
        }

        .wallet-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .wallet-heading h2 {
          margin-top: 5px;
          color: #f3f0ea;
          font-size: 18px;
          line-height: 1.2;
        }

        .wallet-heading > span {
          border: 1px solid rgba(212,178,106,.25);
          border-radius: 999px;
          color: #e3c27e;
          font-size: 11px;
          font-weight: 700;
          padding: 5px 9px;
          white-space: nowrap;
        }

        .wallet-state {
          min-height: 42px;
          border: 1px dashed rgba(212,178,106,.2);
          border-radius: 12px;
          color: #c5c0b6;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 12.5px;
          text-align: center;
        }

        .wallet-state.error {
          border-color: rgba(255,128,150,.38);
          background: rgba(255,128,150,.1);
          color: #ffd1d9;
        }

        .wallet-list {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .wallet-item {
          min-width: 0;
          border: 1px solid rgba(212,178,106,.18);
          border-radius: 14px;
          background: rgba(0,0,0,.15);
          display: grid;
          grid-template-columns: minmax(0, 1fr) 132px;
          gap: 12px;
          padding: 12px;
        }

        .wallet-item.inactive {
          border-color: rgba(255,255,255,.1);
          background: rgba(255,255,255,.025);
        }

        .wallet-copy {
          min-width: 0;
          display: grid;
          gap: 7px;
        }

        .wallet-value-row {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .wallet-value-row strong {
          color: #e3c27e;
          font-size: 20px;
          line-height: 1;
        }

        .wallet-value-row .claimed-status {
          margin: 0;
        }

        .claimed-status.inactive {
          border-color: rgba(255,255,255,.14);
          background: rgba(255,255,255,.06);
          color: #c5c0b6;
        }

        .wallet-item h3 {
          color: #f3f0ea;
          font-size: 13.5px;
          line-height: 1.28;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .wallet-item p {
          color: #8c8679;
          font-size: 11.5px;
          line-height: 1.45;
        }

        .wallet-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          color: #9b958a;
          font-size: 11px;
        }

        .wallet-meta span {
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 999px;
          padding: 3px 7px;
        }

        .wallet-code-row {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .wallet-code-row code {
          min-width: 0;
          color: #f0dda8;
          font-family: inherit;
          font-size: 11.5px;
          font-weight: 800;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .wallet-code-row button {
          min-height: 30px;
          border: 1px solid rgba(212,178,106,.28);
          border-radius: 8px;
          background: rgba(212,178,106,.1);
          color: #e3c27e;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font: inherit;
          font-size: 11px;
          font-weight: 700;
          padding: 0 9px;
          cursor: pointer;
          flex: none;
        }

        .wallet-qr,
        .wallet-status-card {
          min-height: 194px;
          border-radius: 13px;
          display: grid;
          place-items: center;
        }

        .wallet-qr {
          border: 1px solid rgba(212,178,106,.24);
          background: #f8f5ee;
        }

        .wallet-qr img {
          width: 176px;
          height: 176px;
          display: block;
        }

        .wallet-status-card {
          border: 1px solid rgba(255,255,255,.1);
          background: rgba(255,255,255,.05);
          color: #c5c0b6;
          align-content: center;
          gap: 5px;
          text-align: center;
          padding: 12px;
        }

        .wallet-status-card strong {
          color: #f3f0ea;
          font-size: 13px;
        }

        .wallet-status-card span {
          color: #8c8679;
          font-size: 11px;
        }

        .result {
          min-height: 54px;
          display: flex;
          gap: 12px;
          align-items: center;
          border: 1px solid rgba(255,128,150,.42);
          background: rgba(255,128,150,.12);
          color: #ffd1d9;
          border-radius: 14px;
          padding: 13px 15px;
          font-size: 13px;
        }

        .coupon-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .coupon-ticket {
          min-height: 136px;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(212,178,106,.22);
          background: rgba(255,255,255,.035);
          border-radius: 16px;
          display: grid;
          grid-template-columns: 104px minmax(0, 1fr) 58px;
          box-shadow: 0 16px 34px -18px rgba(0,0,0,.7);
          min-width: 0;
        }

        .coupon-ticket.vip {
          border-color: rgba(212,178,106,.4);
          background: rgba(255,255,255,.04);
        }

        .coupon-ticket.selected {
          border-color: rgba(227,194,126,.72);
          box-shadow: 0 0 0 1px rgba(227,194,126,.18), 0 16px 34px -18px rgba(0,0,0,.7);
        }

        .vip-bar {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          height: 3px;
          background: linear-gradient(90deg,#f4e3b4,#d4b26a,#b6924a);
          z-index: 2;
        }

        .coupon-photo {
          min-height: 100%;
          background-size: cover;
          background-position: center;
        }

        .ticket-copy {
          min-width: 0;
          padding: 15px 8px 15px 17px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 6px;
        }

        .ticket-value-row {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 0;
        }

        .ticket-value-row strong {
          color: #e3c27e;
          font-size: 22px;
          line-height: 1;
          font-weight: 700;
          white-space: nowrap;
        }

        .vip-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          border-radius: 6px;
          background: linear-gradient(135deg,#f0dda8,#d4b26a);
          color: #241a0a;
          font-size: 9.5px;
          font-weight: 800;
          letter-spacing: .5px;
          padding: 3px 8px;
          text-transform: uppercase;
        }

        .coupon-ticket h2 {
          color: #f3f0ea;
          font-size: 14px;
          font-weight: 600;
          line-height: 1.28;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .coupon-ticket p {
          color: #8c8679;
          display: none;
          font-size: 11.5px;
          line-height: 1.45;
          overflow: hidden;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .ticket-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 7px 10px;
          color: #8c8679;
          font-size: 11.5px;
        }

        .ticket-meta span {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          min-width: 0;
        }

        .countdown {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #e89bb6;
          font-size: 11px;
          font-weight: 700;
        }

        .countdown i {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #e0729e;
          box-shadow: 0 0 7px #e0729e;
          flex: none;
        }

        .ticket-rules {
          display: none;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          padding-top: 4px;
        }

        .ticket-rules div {
          min-width: 0;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 10px;
          background: rgba(0,0,0,.12);
          padding: 8px;
        }

        .ticket-rules dt {
          font-size: 9px;
          letter-spacing: .8px;
        }

        .ticket-rules dd {
          margin: 3px 0 0;
          font-size: 11px;
        }

        .store-link {
          display: none;
        }

        .ticket-action {
          border: 0;
          border-left: 1px dashed rgba(212,178,106,.42);
          background: rgba(212,178,106,.04);
          color: #d4b26a;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          font: inherit;
          font-size: 11.5px;
          font-weight: 800;
          letter-spacing: 1px;
          padding: 0;
          text-transform: uppercase;
        }

        .ticket-action span {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
        }

        .ticket-action:disabled {
          cursor: wait;
          opacity: .72;
        }

        .spin {
          animation: spin .8s linear infinite;
        }

        .coupon-skeleton {
          min-height: 136px;
          border-radius: 16px;
          background: linear-gradient(90deg, rgba(255,255,255,.035), rgba(212,178,106,.14), rgba(255,255,255,.035));
          background-size: 220% 100%;
          animation: shimmer 1.4s ease-in-out infinite;
        }

        .empty-state {
          min-height: 280px;
          display: grid;
          place-items: center;
          text-align: center;
          border: 1px solid rgba(212,178,106,.18);
          background: rgba(255,255,255,.03);
          border-radius: 16px;
          padding: 34px;
          gap: 10px;
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

        .coupon-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(6,6,8,.76);
          backdrop-filter: blur(10px);
          display: grid;
          place-items: center;
          padding: 18px;
        }

        .coupon-modal {
          width: min(340px, 100%);
          overflow: hidden;
          border: 1px solid rgba(212,178,106,.25);
          border-radius: 20px;
          background: #121116;
          color: #f3f0ea;
          box-shadow: 0 30px 60px -20px rgba(0,0,0,.8);
        }

        .coupon-modal-cover {
          height: 108px;
          background-position: center;
          background-size: cover;
          position: relative;
        }

        .coupon-modal-cover div {
          position: absolute;
          left: 16px;
          right: 52px;
          bottom: 12px;
          display: grid;
          gap: 5px;
        }

        .coupon-modal-cover strong {
          color: #e3c27e;
          font-size: 21px;
          font-weight: 700;
          line-height: 1.08;
        }

        .coupon-modal-cover span {
          color: #d8d3c7;
          font-size: 11.5px;
        }

        .modal-close {
          position: absolute;
          top: 11px;
          right: 11px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,.2);
          background: rgba(12,12,15,.5);
          color: #f3f0ea;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .coupon-modal-body {
          padding: 18px;
          display: grid;
          gap: 13px;
          text-align: center;
        }

        .modal-eyebrow {
          justify-content: center;
        }

        .claimed-qr {
          width: 208px;
          height: 208px;
          margin: 0 auto;
          border-radius: 16px;
          border: 1px solid rgba(212,178,106,.24);
          background: #f8f5ee;
          display: grid;
          place-items: center;
          box-shadow: 0 18px 32px -24px rgba(0,0,0,.8);
        }

        .claimed-qr img {
          width: 188px;
          height: 188px;
          display: block;
        }

        .claimed-code {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: 1.5px dashed rgba(212,178,106,.55);
          border-radius: 12px;
          background: rgba(212,178,106,.05);
          padding: 14px 12px;
          min-width: 0;
        }

        .claimed-code strong {
          color: #f0dda8;
          font-size: 20px;
          font-weight: 800;
          letter-spacing: 2px;
          min-width: 0;
          overflow-wrap: anywhere;
        }

        .claimed-code button {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          border: 1px solid rgba(212,178,106,.3);
          background: rgba(212,178,106,.14);
          color: #e3c27e;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex: none;
        }

        .claimed-status {
          width: fit-content;
          margin: -4px auto 0;
          border: 1px solid rgba(212,178,106,.25);
          border-radius: 999px;
          background: rgba(212,178,106,.1);
          color: #e3c27e;
          font-size: 11.5px;
          font-weight: 700;
          padding: 5px 10px;
        }

        .copy-button {
          min-height: 44px;
          border: 0;
          border-radius: 12px;
          background: linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a);
          color: #241a0a;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font: inherit;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
        }

        .coupon-modal-body p {
          color: #8c8679;
          font-size: 11.5px;
          line-height: 1.6;
        }

        .coupon-modal-body b {
          color: #c5c0b6;
        }

        @keyframes shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 980px) {
          .coupon-hero,
          .claim-panel,
          .coupon-grid,
          .wallet-list {
            grid-template-columns: 1fr;
          }

          .claim-panel {
            gap: 12px;
          }

          .guest-form {
            grid-template-columns: 1fr;
          }

          .hero-stats {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 640px) {
          .coupon-page {
            padding: 18px 16px calc(96px + env(safe-area-inset-bottom));
          }

          .coupon-shell {
            gap: 13px;
          }

          .coupon-hero {
            gap: 12px;
            padding-top: 4px;
          }

          .title-row {
            align-items: center;
            margin-top: 8px;
          }

          h1 {
            font-size: 23px;
          }

          .coupon-hero p {
            font-size: 11.5px;
          }

          .hero-stats {
            display: none;
          }

          .coupon-controls {
            align-items: stretch;
          }

          .sort-pill {
            display: none;
          }

          .filter-chips {
            margin: 0;
            padding: 0 0 4px;
            width: 100%;
          }

          .filter-chip {
            min-height: 34px;
            font-size: 12px;
            padding: 0 14px;
          }

          .claim-panel {
            border-radius: 14px;
            padding: 12px;
          }

          .coupon-wallet {
            border-radius: 14px;
            padding: 12px;
          }

          .wallet-item {
            grid-template-columns: 1fr;
          }

          .wallet-qr,
          .wallet-status-card {
            min-height: 184px;
          }

          .claim-panel p {
            font-size: 11.5px;
          }

          .coupon-grid {
            gap: 11px;
          }

          .coupon-ticket {
            min-height: 98px;
            border-radius: 14px;
            grid-template-columns: 78px minmax(0, 1fr) 46px;
          }

          .ticket-copy {
            padding: 11px 6px 11px 13px;
            gap: 4px;
          }

          .ticket-value-row strong {
            font-size: 18px;
          }

          .vip-badge {
            font-size: 9px;
            padding: 2px 7px;
          }

          .coupon-ticket h2 {
            font-size: 12.5px;
          }

          .coupon-ticket p,
          .ticket-rules,
          .store-link {
            display: none;
          }

          .ticket-meta {
            display: block;
            color: #8c8679;
            font-size: 11px;
            line-height: 1.4;
          }

          .ticket-meta span {
            display: inline;
          }

          .ticket-meta svg {
            display: none;
          }

          .ticket-meta span + span::before {
            content: " · ";
          }

          .countdown {
            font-size: 10.5px;
            margin-top: 1px;
          }

          .ticket-action {
            font-size: 11px;
          }

          .coupon-skeleton {
            min-height: 98px;
            border-radius: 14px;
          }

          .empty-state {
            min-height: 230px;
            padding: 28px 18px;
          }

          .coupon-modal-backdrop {
            align-items: center;
          }
        }
      `}</style>
    </main>
  );
}
