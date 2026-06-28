"use client";

import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Heart,
  ImageIcon,
  Languages,
  MapPin,
  Phone,
  Play,
  Star,
  Tag,
  Ticket,
  Users,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import type {
  PublicStoreDetail,
  StoreActiveCoupon,
  StoreGalleryItem,
  StoreOpeningHour,
} from "@/lib/api/store-detail";
import { videoEmbedUrl } from "./store-detail.helpers";
import { personalizeRelatedStores, recommendationLabel } from "./store-detail.recommendations";
import { buildStoreStructuredData } from "./store-detail.schema";
import { trackStoreDetailClick } from "./store-detail.tracking";

type StoreDetailClientProps = {
  store: PublicStoreDetail;
};

type StoreTab = "overview" | "pricing" | "casts" | "reviews" | "map";

const tabs: Array<{ id: StoreTab; label: string }> = [
  { id: "overview", label: "Giới thiệu" },
  { id: "pricing", label: "Bảng giá" },
  { id: "casts", label: "Cast" },
  { id: "reviews", label: "Đánh giá" },
  { id: "map", label: "Bản đồ" },
];

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

const weekdayLabels: Array<[string, string]> = [
  ["monday", "Thứ 2"],
  ["tuesday", "Thứ 3"],
  ["wednesday", "Thứ 4"],
  ["thursday", "Thứ 5"],
  ["friday", "Thứ 6"],
  ["saturday", "Thứ 7"],
  ["sunday", "CN"],
];

const formatVnd = (value?: number | null) => {
  if (!value) {
    return "Liên hệ";
  }

  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
};

const readableName = (name: string) => {
  const parts = name.split(/—|â€”/);
  return parts[parts.length - 1]?.trim() || name;
};

const getInitials = (name: string) =>
  readableName(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const formatDiscount = (coupon: StoreActiveCoupon) => {
  if (coupon.discountType === "PERCENT") {
    return `-${coupon.discountValue}%`;
  }

  return `-${formatVnd(coupon.discountValue)}`;
};

const formatDateOption = (date: Date) =>
  new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(date);

const openingText = (slot?: StoreOpeningHour | null) => {
  if (!slot) {
    return "Chưa cập nhật";
  }

  if (slot.closed) {
    return "Nghỉ";
  }

  if (slot.open && slot.close) {
    return `${slot.open} - ${slot.close}`;
  }

  return slot.note || "Chưa cập nhật";
};

const mapEmbedUrl = (store: PublicStoreDetail) => {
  if (store.mapUrl) {
    return store.mapUrl.includes("output=embed")
      ? store.mapUrl
      : `${store.mapUrl}${store.mapUrl.includes("?") ? "&" : "?"}output=embed`;
  }

  if (typeof store.latitude === "number" && typeof store.longitude === "number") {
    return `https://www.google.com/maps?q=${store.latitude},${store.longitude}&output=embed`;
  }

  return "";
};

const mediaBackground = (media?: StoreGalleryItem | null) =>
  media?.type === "IMAGE" && media.url
    ? `linear-gradient(180deg, rgba(10,10,12,.18), rgba(10,10,12,.66)), url("${media.url}")`
    : "linear-gradient(135deg, #18181c 0%, #2f2a22 48%, #111114 100%)";

function EmptyState({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <div>
        <div className="empty-title">{title}</div>
        <p>{body}</p>
      </div>
    </div>
  );
}

export default function StoreDetailClient({ store }: StoreDetailClientProps) {
  const [activeTab, setActiveTab] = useState<StoreTab>("overview");
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState(0);
  const [guestCount, setGuestCount] = useState(4);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState("21:00");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const recommendedStores = useMemo(() => personalizeRelatedStores(store.relatedStores), [store.relatedStores]);

  const displayName = readableName(store.name);
  const gallery = store.gallery ?? [];
  const selectedMedia = gallery[selectedGalleryIndex] ?? gallery[0] ?? null;
  const heroImage = gallery.find((item) => item.type === "IMAGE") ?? null;
  const firstCoupon = store.activeCoupons[0] ?? null;
  const location = [store.area?.name, store.district, store.city].filter(Boolean).join(", ");
  const embedUrl = mapEmbedUrl(store);
  const hasMap = Boolean(embedUrl);
  const structuredData = useMemo(() => buildStoreStructuredData(store), [store]);

  const dateOptions = useMemo(
    () =>
      Array.from({ length: 4 }, (_, index) => {
        const date = new Date();
        date.setDate(date.getDate() + index);

        return {
          label: formatDateOption(date),
          iso: date.toISOString().slice(0, 10),
        };
      }),
    [],
  );
  const selectedDate = dateOptions[selectedDateIndex] ?? {
    label: "",
    iso: new Date().toISOString().slice(0, 10),
  };
  const bookingQuery = new URLSearchParams({
    storeId: store.id,
    storeSlug: store.slug,
    storeName: displayName,
    guests: String(guestCount),
    date: selectedDate.iso,
    time: selectedTime,
  });

  if (firstCoupon) {
    bookingQuery.set("couponId", firstCoupon.id);
  }

  const couponQuery = new URLSearchParams({
    storeId: store.id,
    storeSlug: store.slug,
  });

  if (firstCoupon) {
    couponQuery.set("couponId", firstCoupon.id);
  }

  const bookingHref = `/dat-cho?${bookingQuery.toString()}`;
  const couponHref = `/uu-dai?${couponQuery.toString()}`;
  const lightboxMedia = gallery[selectedGalleryIndex] ?? selectedMedia;
  const heroVideoUrl = selectedMedia?.type === "VIDEO" ? videoEmbedUrl(selectedMedia.url) : "";
  const lightboxVideoUrl = lightboxMedia?.type === "VIDEO" ? videoEmbedUrl(lightboxMedia.url) : "";
  const showPreviousMedia = () => {
    setSelectedGalleryIndex((index) => (index <= 0 ? gallery.length - 1 : index - 1));
  };
  const showNextMedia = () => {
    setSelectedGalleryIndex((index) => (index >= gallery.length - 1 ? 0 : index + 1));
  };
  const trackBookingClick = (surface: string) =>
    trackStoreDetailClick(store, "booking", {
      surface,
      guests: guestCount,
      date: selectedDate.iso,
      time: selectedTime,
      couponId: firstCoupon?.id ?? null,
    });
  const trackCouponClick = (surface: string, couponId = firstCoupon?.id ?? null) =>
    trackStoreDetailClick(store, "coupon", { surface, couponId });

  return (
    <main className="store-detail-page" data-testid="store-detail-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section className="store-hero">
        <div
          className="hero-visual"
          style={{
            backgroundImage: mediaBackground(selectedMedia ?? heroImage),
          }}
        >
          <Link className="hero-icon-button" href="/danh-sach-quan" aria-label="Quay lại danh sách quán">
            <ChevronLeft size={22} />
          </Link>
          <button
            className="hero-icon-button favorite"
            type="button"
            aria-label={isFavorite ? "Bỏ lưu quán" : "Lưu quán"}
            onClick={() => setIsFavorite((value) => !value)}
          >
            <Heart size={20} fill={isFavorite ? "#e85d75" : "none"} />
          </button>

          {selectedMedia?.type === "VIDEO" ? (
            heroVideoUrl.includes("youtube.com/embed") || heroVideoUrl.includes("player.vimeo.com") ? (
              <iframe
                className="hero-video"
                title={`${displayName} video`}
                src={heroVideoUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video className="hero-video" src={heroVideoUrl || selectedMedia.url} controls />
            )
          ) : null}

          {!selectedMedia ? (
            <div className="hero-empty">
              <ImageIcon size={28} />
              <span>Gallery đang được quán cập nhật.</span>
            </div>
          ) : null}
        </div>

        <div className="hero-copy">
          <div className="store-logo">{getInitials(store.name) || "NL"}</div>
          <div className="eyebrow">{categoryLabels[store.category] ?? store.category}</div>
          <h1>{displayName}</h1>
          <p className="hero-description">
            {store.description || "Thông tin mô tả sẽ được quán cập nhật trước khi nhận đặt chỗ."}
          </p>
          <div className="hero-meta">
            <span>
              <MapPin size={16} />
              {location || "Chưa cập nhật khu vực"}
            </span>
            {store.phone ? (
              <a
                className="phone-link"
                href={`tel:${store.phone}`}
                onClick={() => trackStoreDetailClick(store, "call", { surface: "hero", phone: store.phone })}
              >
                <Phone size={16} />
                {store.phone}
              </a>
            ) : null}
          </div>
          <div className="hero-actions">
            <Link
              data-testid="store-booking-cta"
              className="primary-action"
              href={bookingHref}
              onClick={() => trackBookingClick("hero")}
            >
              <CalendarDays size={18} />
              Đặt chỗ
            </Link>
            <Link
              data-testid="store-coupon-cta"
              className="secondary-action"
              href={couponHref}
              onClick={() => trackCouponClick("hero")}
            >
              <Ticket size={18} />
              {firstCoupon ? `Lấy coupon ${formatDiscount(firstCoupon)}` : "Xem ưu đãi"}
            </Link>
          </div>
        </div>
      </section>

      <section className="gallery-strip" aria-label="Gallery của quán">
        {gallery.length ? (
          gallery.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={index === selectedGalleryIndex ? "gallery-thumb active" : "gallery-thumb"}
              onClick={() => {
                setSelectedGalleryIndex(index);
                setIsLightboxOpen(true);
              }}
              style={{ backgroundImage: mediaBackground(item) }}
              aria-label={`Xem media ${index + 1}`}
            >
              {item.type === "VIDEO" ? <Play size={18} fill="currentColor" /> : null}
            </button>
          ))
        ) : (
          <EmptyState
            icon={<ImageIcon size={20} />}
            title="Chưa có gallery"
            body="Quán chưa đăng ảnh hoặc video công khai."
          />
        )}
      </section>

      {isLightboxOpen && lightboxMedia ? (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Store gallery lightbox">
          <button
            className="lightbox-close"
            type="button"
            aria-label="Close gallery"
            onClick={() => setIsLightboxOpen(false)}
          >
            <X size={22} />
          </button>
          {gallery.length > 1 ? (
            <button className="lightbox-nav previous" type="button" aria-label="Previous media" onClick={showPreviousMedia}>
              <ChevronLeft size={28} />
            </button>
          ) : null}
          <div className="lightbox-media">
            {lightboxMedia.type === "VIDEO" ? (
              lightboxVideoUrl.includes("youtube.com/embed") || lightboxVideoUrl.includes("player.vimeo.com") ? (
                <iframe
                  title={`${displayName} gallery video`}
                  src={lightboxVideoUrl}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={lightboxVideoUrl || lightboxMedia.url} controls autoPlay />
              )
            ) : (
              <img src={lightboxMedia.url} alt={lightboxMedia.alt || displayName} />
            )}
          </div>
          {gallery.length > 1 ? (
            <button className="lightbox-nav next" type="button" aria-label="Next media" onClick={showNextMedia}>
              <ChevronRight size={28} />
            </button>
          ) : null}
          <div className="lightbox-caption">
            {selectedGalleryIndex + 1}/{gallery.length}
            {lightboxMedia.purpose ? ` · ${lightboxMedia.purpose}` : ""}
          </div>
        </div>
      ) : null}

      <section className="store-content">
        <div className="main-column">
          <nav className="tab-bar" aria-label="Nội dung quán">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                data-testid={`store-tab-${tab.id}`}
                className={activeTab === tab.id ? "tab active" : "tab"}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {activeTab === "overview" ? (
            <section className="tab-section">
              <div className="stat-grid">
                <div>
                  <span>Giá từ</span>
                  <strong>{formatVnd(store.priceReference.startingFromVnd)}</strong>
                </div>
                <div>
                  <span>Cast hiển thị</span>
                  <strong>{store.casts.length} hồ sơ</strong>
                </div>
                <div>
                  <span>Ưu đãi đang mở</span>
                  <strong>{store.activeCoupons.length} mã</strong>
                </div>
                <div>
                  <span>Khu vực</span>
                  <strong>{store.area?.name ?? store.district ?? store.city}</strong>
                </div>
              </div>

              {store.campaigns.length ? (
                <div className="campaign-list">
                  {store.campaigns.map((campaign) => (
                    <Link
                      key={campaign.id}
                      className="campaign-row"
                      onClick={() => trackCouponClick("campaign", campaign.couponId)}
                      href={`/uu-dai?${new URLSearchParams({
                        storeId: store.id,
                        storeSlug: store.slug,
                        couponId: campaign.couponId,
                      }).toString()}`}
                    >
                      <Tag size={18} />
                      <span>
                        <strong>{campaign.title}</strong>
                        <small>{campaign.description || "Coupon đang áp dụng tại quán này."}</small>
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Ticket size={20} />}
                  title="Chưa có ưu đãi"
                  body="Quán hiện chưa có ưu đãi đang mở."
                />
              )}
            </section>
          ) : null}

          {activeTab === "pricing" ? (
            <section className="tab-section" data-testid="store-pricing-panel">
              <div className="section-heading">
                <h2>Bảng giá tham khảo</h2>
                <p>{store.priceReference.note}</p>
              </div>
              <div className="price-table">
                {store.priceReference.items.length ? (
                  store.priceReference.items.map((item) => (
                    <div className="price-row" key={`${item.label}-${item.amountVnd ?? "custom"}`}>
                      <span>
                        <strong>{item.label}</strong>
                        {item.note ? <small>{item.note}</small> : null}
                      </span>
                      <b>
                        {formatVnd(item.amountVnd)}
                        {item.unit === "hour" ? "/giờ" : ""}
                      </b>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    icon={<Tag size={20} />}
                    title="Chưa có bảng giá"
                    body="Quán chưa công khai bảng giá tham khảo."
                  />
                )}
              </div>
            </section>
          ) : null}

          {activeTab === "casts" ? (
            <section className="tab-section" data-testid="store-casts-panel">
              <div className="section-heading">
                <h2>Cast của quán</h2>
                <p>{store.casts.length ? `${store.casts.length} hồ sơ đang mở hiển thị.` : "Chưa có hồ sơ hiển thị."}</p>
              </div>
              {store.casts.length ? (
                <div className="cast-grid">
                  {store.casts.map((cast) => (
                    <Link className="cast-card" key={cast.id} href={`/casts/${cast.slug}`}>
                      <div
                        className="cast-photo"
                        style={{
                          backgroundImage: cast.thumbnailUrl
                            ? `url("${cast.thumbnailUrl}")`
                            : "linear-gradient(135deg,#2a2c35,#705d2d)",
                        }}
                      />
                      <div>
                        <strong>{cast.publicAlias || cast.stageName}</strong>
                        <span>{cast.publicHeadline || "Hồ sơ cast"}</span>
                        <small>
                          <Languages size={13} />
                          {cast.languages.length ? cast.languages.join(", ") : "Chưa cập nhật"}
                        </small>
                        <small>
                          <Tag size={13} />
                          {cast.tags.length ? cast.tags.join(", ") : "Chưa cập nhật"}
                        </small>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Users size={20} />}
                  title="Chưa có cast"
                  body="Quán chưa công khai hồ sơ cast."
                />
              )}
            </section>
          ) : null}

          {activeTab === "reviews" ? (
            <section className="tab-section" data-testid="store-reviews-panel">
              <div className="review-empty">
                <Star size={28} />
                <h2>Chưa có đánh giá công khai</h2>
                <p>Đánh giá sẽ xuất hiện khi có phản hồi đã xác thực.</p>
              </div>
            </section>
          ) : null}

          {activeTab === "map" ? (
            <section className="tab-section" data-testid="store-map-panel">
              <div className="map-grid">
                <div className="map-frame">
                  {hasMap ? (
                    <iframe
                      title={`${displayName} Google Map`}
                      src={embedUrl}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  ) : (
                    <EmptyState
                      icon={<MapPin size={20} />}
                      title="Chưa có bản đồ"
                      body="Quán chưa cập nhật vị trí bản đồ."
                    />
                  )}
                </div>
                <div className="hours-panel">
                  <h2>Giờ mở cửa</h2>
                  <div className="hours-list">
                    {weekdayLabels.map(([key, label]) => (
                      <div key={key}>
                        <span>{label}</span>
                        <strong>{openingText(store.openingHours?.[key])}</strong>
                      </div>
                    ))}
                  </div>
                  <div className="holiday-note">
                    <Clock3 size={16} />
                    <span>
                      {typeof store.holidaySchedule?.note === "string"
                        ? store.holidaySchedule.note
                        : "Chưa có lịch nghỉ đặc biệt."}
                    </span>
                  </div>
                  {store.mapUrl ? (
                    <a
                      className="map-link"
                      href={store.mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => trackStoreDetailClick(store, "map", { surface: "map-panel" })}
                    >
                      Mở Google Maps
                    </a>
                  ) : null}
                </div>
              </div>
            </section>
          ) : null}

          {recommendedStores.length ? (
            <section className="related-section">
              <h2>Quán liên quan</h2>
              <div className="related-grid">
                {recommendedStores.map((related) => (
                  <Link className="related-card" key={related.id} href={`/stores/${related.slug}`}>
                    <div
                      style={{
                        backgroundImage: related.thumbnailUrl
                          ? `url("${related.thumbnailUrl}")`
                          : "linear-gradient(135deg,#202229,#6f6234)",
                      }}
                    />
                    <strong>{readableName(related.name)}</strong>
                    <small>{recommendationLabel(related)}</small>
                    <span>{[categoryLabels[related.category] ?? related.category, related.area?.name ?? related.district].filter(Boolean).join(" · ")}</span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="booking-panel">
          <div className="booking-title">
            <span>Đặt chỗ từ</span>
            <strong>{formatVnd(store.priceReference.startingFromVnd)}</strong>
          </div>
          <label>Chọn ngày</label>
          <div className="slot-row">
            {dateOptions.map((date, index) => (
              <button
                key={date.iso}
                type="button"
                className={index === selectedDateIndex ? "slot active" : "slot"}
                onClick={() => setSelectedDateIndex(index)}
              >
                {date.label}
              </button>
            ))}
          </div>
          <label>Khung giờ</label>
          <div className="slot-row">
            {["20:00", "21:00", "22:00", "23:00"].map((time) => (
              <button
                key={time}
                type="button"
                className={time === selectedTime ? "slot active" : "slot"}
                onClick={() => setSelectedTime(time)}
              >
                {time}
              </button>
            ))}
          </div>
          <label>Số khách</label>
          <div className="guest-stepper">
            <button type="button" onClick={() => setGuestCount((value) => Math.max(1, value - 1))}>
              -
            </button>
            <strong>{guestCount} người</strong>
            <button type="button" onClick={() => setGuestCount((value) => Math.min(20, value + 1))}>
              +
            </button>
          </div>
          <Link
            data-testid="store-booking-cta-sidebar"
            className="primary-action full"
            href={bookingHref}
            onClick={() => trackBookingClick("sidebar")}
          >
            <CalendarDays size={18} />
            Đặt chỗ ngay
          </Link>
          <Link
            data-testid="store-coupon-cta-sidebar"
            className="secondary-action full"
            href={couponHref}
            onClick={() => trackCouponClick("sidebar")}
          >
            <Ticket size={18} />
            {firstCoupon ? `Coupon ${formatDiscount(firstCoupon)}` : "Ưu đãi của quán"}
          </Link>
        </aside>
      </section>

      <div className="mobile-cta">
        <Link className="primary-action full" href={bookingHref} onClick={() => trackBookingClick("mobile")}>
          Đặt chỗ
        </Link>
        <Link className="secondary-action full" href={couponHref} onClick={() => trackCouponClick("mobile")}>
          Coupon
        </Link>
      </div>

      <style>{`
        .store-detail-page {
          min-height: 100vh;
          background: #0d0e11;
          color: #f7f1e7;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          padding-bottom: 72px;
        }

        .store-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.12fr) minmax(320px, .88fr);
          min-height: 560px;
          border-bottom: 1px solid rgba(233, 202, 128, .18);
        }

        .hero-visual {
          position: relative;
          min-height: 560px;
          background-size: cover;
          background-position: center;
          overflow: hidden;
        }

        .hero-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: 0;
          object-fit: cover;
          background: #050507;
        }

        .hero-icon-button {
          position: absolute;
          top: 22px;
          left: 22px;
          z-index: 2;
          width: 42px;
          height: 42px;
          border: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, .92);
          color: #141417;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          box-shadow: 0 14px 34px rgba(0, 0, 0, .26);
          cursor: pointer;
        }

        .hero-icon-button.favorite {
          left: auto;
          right: 22px;
          color: ${isFavorite ? "#e85d75" : "#141417"};
        }

        .hero-empty {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #e8d39b;
          background: linear-gradient(135deg, rgba(22,22,26,.92), rgba(52,45,31,.82));
          font-size: 14px;
          font-weight: 700;
        }

        .hero-copy {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 58px 54px;
          background: radial-gradient(circle at 15% 0%, rgba(15, 145, 132, .18), transparent 28%), #111217;
        }

        .store-logo {
          width: 64px;
          height: 64px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #ead08a, #b9913f);
          color: #1b1508;
          font-size: 20px;
          font-weight: 900;
          margin-bottom: 18px;
          border: 1px solid rgba(255, 240, 190, .6);
        }

        .eyebrow {
          width: fit-content;
          color: #8ddbd4;
          background: rgba(20, 170, 156, .12);
          border: 1px solid rgba(141, 219, 212, .22);
          border-radius: 999px;
          padding: 6px 10px;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0;
        }

        h1 {
          margin: 18px 0 0;
          font-size: 48px;
          line-height: 1.06;
          letter-spacing: 0;
          color: #fff7e8;
        }

        .hero-description {
          margin: 18px 0 0;
          color: #cbc4b8;
          line-height: 1.65;
          font-size: 15px;
          max-width: 720px;
          display: -webkit-box;
          -webkit-line-clamp: 7;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .hero-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 22px;
          color: #e8d39b;
          font-size: 13px;
          font-weight: 700;
        }

        .hero-meta span,
        .hero-meta a,
        .hero-actions,
        .primary-action,
        .secondary-action,
        .campaign-row,
        .holiday-note,
        .map-link {
          display: flex;
          align-items: center;
        }

        .hero-meta span,
        .hero-meta a {
          gap: 8px;
          min-width: 0;
          color: inherit;
          text-decoration: none;
        }

        .hero-actions {
          gap: 12px;
          margin-top: 28px;
          flex-wrap: wrap;
        }

        .primary-action,
        .secondary-action {
          justify-content: center;
          gap: 8px;
          min-height: 46px;
          border-radius: 8px;
          padding: 0 18px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 900;
        }

        .primary-action {
          background: #e2b85e;
          color: #1b1508;
        }

        .secondary-action {
          background: rgba(255, 255, 255, .06);
          color: #f4dd9b;
          border: 1px solid rgba(226, 184, 94, .32);
        }

        .full {
          width: 100%;
        }

        .gallery-strip {
          display: flex;
          gap: 10px;
          max-width: 1180px;
          margin: 0 auto;
          padding: 18px 24px 0;
          overflow-x: auto;
        }

        .gallery-thumb {
          width: 128px;
          height: 82px;
          flex: none;
          border-radius: 8px;
          border: 1px solid rgba(226, 184, 94, .22);
          background-size: cover;
          background-position: center;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .gallery-thumb.active {
          border-color: #e2b85e;
          box-shadow: 0 0 0 2px rgba(226, 184, 94, .22);
        }

        .lightbox {
          position: fixed;
          inset: 0;
          z-index: 80;
          background: rgba(5, 6, 8, .92);
          display: grid;
          place-items: center;
          padding: 28px;
        }

        .lightbox-media {
          width: min(100%, 980px);
          aspect-ratio: 16 / 9;
          display: grid;
          place-items: center;
        }

        .lightbox-media img,
        .lightbox-media video,
        .lightbox-media iframe {
          width: 100%;
          height: 100%;
          border: 0;
          object-fit: contain;
          border-radius: 8px;
          background: #050608;
        }

        .lightbox-close,
        .lightbox-nav {
          position: absolute;
          border: 1px solid rgba(244, 221, 155, .28);
          border-radius: 999px;
          background: rgba(255, 255, 255, .08);
          color: #f7f1e7;
          cursor: pointer;
          display: grid;
          place-items: center;
        }

        .lightbox-close {
          top: 22px;
          right: 22px;
          width: 44px;
          height: 44px;
        }

        .lightbox-nav {
          width: 52px;
          height: 52px;
          top: 50%;
          transform: translateY(-50%);
        }

        .lightbox-nav.previous {
          left: 22px;
        }

        .lightbox-nav.next {
          right: 22px;
        }

        .lightbox-caption {
          position: absolute;
          left: 50%;
          bottom: 22px;
          transform: translateX(-50%);
          color: #f4dd9b;
          font-size: 13px;
          font-weight: 800;
        }

        .store-content {
          max-width: 1180px;
          margin: 0 auto;
          padding: 24px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 340px;
          gap: 24px;
          align-items: start;
        }

        .main-column,
        .booking-panel,
        .tab-section,
        .related-section {
          min-width: 0;
        }

        .tab-bar {
          display: flex;
          gap: 8px;
          padding: 6px;
          background: rgba(255, 255, 255, .045);
          border: 1px solid rgba(226, 184, 94, .16);
          border-radius: 8px;
          overflow-x: auto;
        }

        .tab {
          flex: none;
          border: 0;
          border-radius: 6px;
          padding: 10px 14px;
          background: transparent;
          color: #bfb7aa;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
        }

        .tab.active {
          color: #1b1508;
          background: #e2b85e;
        }

        .tab-section {
          margin-top: 16px;
          background: rgba(255, 255, 255, .045);
          border: 1px solid rgba(226, 184, 94, .16);
          border-radius: 8px;
          padding: 18px;
        }

        .stat-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .stat-grid div,
        .price-row,
        .campaign-row,
        .cast-card,
        .related-card,
        .empty-state,
        .review-empty,
        .hours-panel,
        .booking-panel {
          border: 1px solid rgba(226, 184, 94, .16);
          border-radius: 8px;
          background: rgba(13, 14, 17, .58);
        }

        .stat-grid div {
          padding: 14px;
        }

        .stat-grid span,
        .booking-panel label,
        .price-row small,
        .cast-card span,
        .related-card span,
        .empty-state p,
        .review-empty p,
        .section-heading p {
          color: #a9a197;
          font-size: 12px;
          line-height: 1.5;
        }

        .stat-grid strong {
          display: block;
          margin-top: 6px;
          color: #f4dd9b;
          font-size: 16px;
        }

        .campaign-list {
          display: grid;
          gap: 10px;
          margin-top: 14px;
        }

        .campaign-row {
          gap: 12px;
          padding: 14px;
          color: #f7f1e7;
          text-decoration: none;
        }

        .campaign-row strong,
        .campaign-row small {
          display: block;
        }

        .campaign-row small {
          margin-top: 3px;
        }

        .section-heading h2,
        .related-section h2,
        .review-empty h2,
        .hours-panel h2 {
          margin: 0;
          color: #fff7e8;
          font-size: 20px;
          letter-spacing: 0;
        }

        .section-heading p {
          margin: 6px 0 0;
        }

        .price-table {
          display: grid;
          gap: 10px;
          margin-top: 14px;
        }

        .price-row {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          padding: 14px;
        }

        .price-row strong,
        .price-row small {
          display: block;
        }

        .price-row b {
          color: #f4dd9b;
          white-space: nowrap;
        }

        .cast-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-top: 14px;
        }

        .cast-card {
          overflow: hidden;
          color: #f7f1e7;
          text-decoration: none;
        }

        .cast-photo {
          height: 176px;
          background-size: cover;
          background-position: center;
        }

        .cast-card div:last-child {
          padding: 12px;
          display: grid;
          gap: 6px;
        }

        .cast-card strong,
        .related-card strong {
          color: #fff7e8;
          font-size: 14px;
        }

        .cast-card small {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #bfb7aa;
          font-size: 11px;
        }

        .review-empty {
          padding: 34px 18px;
          text-align: center;
          color: #f4dd9b;
        }

        .review-empty p {
          margin: 8px auto 0;
          max-width: 520px;
        }

        .map-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(260px, .8fr);
          gap: 14px;
        }

        .map-frame {
          min-height: 340px;
          border-radius: 8px;
          overflow: hidden;
          background: #15161a;
          border: 1px solid rgba(226, 184, 94, .16);
        }

        .map-frame iframe {
          width: 100%;
          height: 100%;
          min-height: 340px;
          border: 0;
          display: block;
        }

        .hours-panel {
          padding: 16px;
        }

        .hours-list {
          display: grid;
          gap: 7px;
          margin-top: 14px;
        }

        .hours-list div {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          color: #bfb7aa;
          font-size: 13px;
        }

        .hours-list strong {
          color: #f4dd9b;
          text-align: right;
        }

        .holiday-note {
          gap: 8px;
          margin-top: 14px;
          padding: 12px;
          color: #d6eee9;
          background: rgba(20, 170, 156, .12);
          border: 1px solid rgba(141, 219, 212, .2);
          border-radius: 8px;
          font-size: 12px;
          line-height: 1.5;
        }

        .map-link {
          justify-content: center;
          margin-top: 12px;
          min-height: 40px;
          color: #1b1508;
          background: #8ddbd4;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 900;
          font-size: 13px;
        }

        .empty-state {
          padding: 14px;
          display: flex;
          gap: 12px;
          align-items: center;
          min-width: 280px;
        }

        .empty-icon {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f4dd9b;
          background: rgba(226, 184, 94, .13);
          flex: none;
        }

        .empty-title {
          color: #fff7e8;
          font-weight: 900;
          margin-bottom: 2px;
        }

        .related-section {
          margin-top: 18px;
        }

        .related-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-top: 12px;
        }

        .related-card {
          overflow: hidden;
          color: #f7f1e7;
          text-decoration: none;
        }

        .related-card div {
          height: 102px;
          background-size: cover;
          background-position: center;
        }

        .related-card strong,
        .related-card small,
        .related-card span {
          display: block;
          padding: 0 10px;
        }

        .related-card strong {
          padding-top: 10px;
        }

        .related-card span {
          padding-bottom: 12px;
          margin-top: 4px;
        }

        .related-card small {
          color: #7ddbd2;
          font-size: 11px;
          font-weight: 900;
          margin-top: 4px;
        }

        .booking-panel {
          position: sticky;
          top: 18px;
          padding: 18px;
        }

        .booking-title span,
        .booking-title strong {
          display: block;
        }

        .booking-title span {
          color: #a9a197;
          font-size: 13px;
        }

        .booking-title strong {
          margin-top: 4px;
          color: #fff7e8;
          font-size: 28px;
        }

        .booking-panel label {
          display: block;
          margin: 16px 0 8px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .slot-row {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .slot,
        .guest-stepper button {
          border: 1px solid rgba(226, 184, 94, .2);
          border-radius: 8px;
          background: rgba(255, 255, 255, .05);
          color: #f7f1e7;
          min-height: 38px;
          padding: 0 11px;
          font-weight: 800;
          cursor: pointer;
        }

        .slot.active,
        .guest-stepper button {
          background: #e2b85e;
          color: #1b1508;
        }

        .guest-stepper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1px solid rgba(226, 184, 94, .2);
          border-radius: 8px;
          padding: 7px;
          margin-bottom: 14px;
        }

        .guest-stepper button {
          width: 36px;
          padding: 0;
          font-size: 18px;
        }

        .mobile-cta {
          display: none;
        }

        @media (max-width: 980px) {
          .store-hero,
          .store-content,
          .map-grid {
            grid-template-columns: 1fr;
          }

          .store-hero {
            min-height: auto;
          }

          .hero-visual {
            min-height: 360px;
          }

          .hero-copy {
            padding: 28px 22px;
          }

          h1 {
            font-size: 34px;
          }

          .booking-panel {
            display: none;
          }

          .stat-grid,
          .cast-grid,
          .related-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .mobile-cta {
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 20;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            padding: 10px 14px;
            background: rgba(13, 14, 17, .94);
            border-top: 1px solid rgba(226, 184, 94, .22);
            backdrop-filter: blur(12px);
          }
        }

        @media (max-width: 620px) {
          .hero-visual {
            min-height: 260px;
          }

          .hero-copy {
            padding: 22px 18px;
          }

          h1 {
            font-size: 28px;
          }

          .hero-description {
            -webkit-line-clamp: 5;
          }

          .gallery-strip,
          .store-content {
            padding-left: 16px;
            padding-right: 16px;
          }

          .stat-grid,
          .cast-grid,
          .related-grid {
            grid-template-columns: 1fr;
          }

          .price-row {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>
    </main>
  );
}
