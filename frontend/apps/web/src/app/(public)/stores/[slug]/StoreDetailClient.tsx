"use client";

import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  Languages,
  MapPin,
  Star,
  Tag,
  Ticket,
  Users,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import type {
  PublicStoreDetail,
  StoreGalleryItem,
} from "@/lib/api/store-detail";
import {
  categoryLabels,
  formatDateOption,
  formatVnd,
  mapEmbedUrl,
  openingText,
  readableName,
  storeDetailTabs as tabs,
  videoEmbedUrl,
  weekdayLabels,
} from "./store-detail.helpers";
import type { StoreTab } from "./store-detail.helpers";
import { personalizeRelatedStores, recommendationLabel } from "./store-detail.recommendations";
import { buildStoreStructuredData } from "./store-detail.schema";
import { trackStoreDetailClick } from "./store-detail.tracking";
import { StoreDetailBookingPanel, StoreDetailMobileCta } from "./StoreDetailBookingPanel";
import { StoreDetailHeader } from "./StoreDetailHeader";

type StoreDetailClientProps = {
  store: PublicStoreDetail;
};

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
  const mainGalleryMedia = heroImage ?? selectedMedia;
  const galleryTiles: StoreGalleryItem[] = gallery.length
    ? Array.from({ length: Math.max(5, gallery.length) }, (_, index) => gallery[index % gallery.length]!)
    : [];
  const firstCoupon = store.activeCoupons[0] ?? null;
  const location = [store.area?.name, store.district, store.city].filter(Boolean).join(", ");
  const embedUrl = mapEmbedUrl(store);
  const hasMap = Boolean(embedUrl);
  const structuredData = useMemo(() => buildStoreStructuredData(store), [store]);
  const languageText = Array.from(new Set(store.casts.flatMap((cast) => cast.languages))).slice(0, 2).join(" / ");
  const todayKey = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][new Date().getDay()];
  const todayOpening = todayKey ? openingText(store.openingHours?.[todayKey]) : "";

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
      <StoreDetailHeader
        store={store}
        displayName={displayName}
        gallery={gallery}
        galleryTiles={galleryTiles}
        heroImage={heroImage}
        mainGalleryMedia={mainGalleryMedia}
        location={location}
        languageText={languageText}
        todayOpening={todayOpening}
        isFavorite={isFavorite}
        onToggleFavorite={() => setIsFavorite((value) => !value)}
        onOpenGallery={(index) => {
          setSelectedGalleryIndex(index);
          setIsLightboxOpen(true);
        }}
        onTrackCall={() => trackStoreDetailClick(store, "call", { surface: "summary", phone: store.phone })}
      />
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

        <StoreDetailBookingPanel
          startingFromVnd={store.priceReference.startingFromVnd}
          dateOptions={dateOptions}
          selectedDateIndex={selectedDateIndex}
          selectedTime={selectedTime}
          guestCount={guestCount}
          bookingHref={bookingHref}
          couponHref={couponHref}
          firstCoupon={firstCoupon}
          onDateSelect={setSelectedDateIndex}
          onTimeSelect={setSelectedTime}
          onGuestCountChange={setGuestCount}
          onBookingClick={trackBookingClick}
          onCouponClick={trackCouponClick}
        />
      </section>

      <StoreDetailMobileCta
        bookingHref={bookingHref}
        couponHref={couponHref}
        onBookingClick={trackBookingClick}
        onCouponClick={trackCouponClick}
      />

      <style>{`
        .store-detail-page {
          min-height: 100vh;
          background: #0d0e11;
          color: #f7f1e7;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          padding-bottom: 72px;
        }

        .legacy-shell {
          width: 100%;
          max-width: 1468px;
          margin: 0 auto;
          padding: 16px 26px 0;
        }

        .legacy-breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #9f9788;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .legacy-breadcrumb a {
          color: #bfb5a0;
          text-decoration: none;
        }

        .legacy-breadcrumb strong {
          color: #fff7e8;
        }

        .legacy-gallery {
          display: grid;
          grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr);
          grid-template-rows: 104px 104px;
          gap: 10px;
        }

        .legacy-gallery-tile {
          position: relative;
          border: 0;
          border-radius: 8px;
          background-size: cover;
          background-position: center;
          overflow: hidden;
          cursor: pointer;
          color: #241a0a;
        }

        .legacy-gallery-tile.featured {
          grid-row: span 2;
        }

        .legacy-play-center {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 44px;
          height: 44px;
          border-radius: 999px;
          background: rgba(255, 255, 255, .9);
          color: #d4b26a;
          display: grid;
          place-items: center;
          box-shadow: 0 12px 30px rgba(0, 0, 0, .28);
        }

        .legacy-video-badge {
          position: absolute;
          left: 10px;
          bottom: 10px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border-radius: 999px;
          background: rgba(10, 10, 12, .72);
          color: #fff7e8;
          font-size: 11px;
          font-weight: 900;
          padding: 5px 8px;
        }

        .legacy-gallery-empty {
          grid-column: 1 / -1;
          min-height: 218px;
          border: 1px solid rgba(226, 184, 94, .22);
          border-radius: 8px;
          background: rgba(255, 255, 255, .035);
          color: #f4dd9b;
          display: grid;
          place-items: center;
          gap: 8px;
          text-align: center;
          padding: 24px;
        }

        .legacy-gallery-empty span {
          color: #a9a197;
          font-size: 12px;
          font-weight: 700;
        }

        .legacy-summary {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
          padding: 18px 0 0;
        }

        .legacy-summary .store-logo {
          display: flex;
          width: 54px;
          height: 54px;
          flex: none;
          margin: 0;
          border-radius: 8px;
        }

        .legacy-summary-copy {
          min-width: 0;
          flex: 1;
        }

        .legacy-summary h1 {
          margin: 0;
          color: #fff7e8;
          font-size: 24px;
          line-height: 1.1;
        }

        .legacy-summary-meta,
        .legacy-tags,
        .legacy-summary-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
        }

        .legacy-summary-meta {
          gap: 12px;
          margin-top: 8px;
          color: #a9a197;
          font-size: 12px;
        }

        .legacy-tags {
          gap: 8px;
          margin-top: 12px;
        }

        .legacy-tags span {
          border-radius: 999px;
          background: rgba(255, 255, 255, .06);
          color: #d9d1c3;
          border: 1px solid rgba(255, 255, 255, .06);
          padding: 5px 10px;
          font-size: 11px;
          font-weight: 800;
        }

        .legacy-tags span:first-child {
          background: rgba(226, 184, 94, .13);
          color: #f4dd9b;
          border-color: rgba(226, 184, 94, .2);
        }

        .legacy-tags .open-now {
          background: #e6f7ee;
          color: #1f8a52;
        }

        .legacy-summary-actions {
          gap: 10px;
        }

        .legacy-summary-actions button,
        .legacy-summary-actions a {
          width: 36px;
          height: 36px;
          border: 1px solid rgba(226, 184, 94, .26);
          border-radius: 8px;
          background: rgba(255, 255, 255, .035);
          color: #d4b26a;
          display: grid;
          place-items: center;
          cursor: pointer;
          text-decoration: none;
        }

        .store-logo {
          width: 64px;
          height: 64px;
          border-radius: 8px;
          display: none;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #ead08a, #b9913f);
          color: #1b1508;
          font-size: 20px;
          font-weight: 900;
          margin-bottom: 18px;
          border: 1px solid rgba(255, 240, 190, .6);
        }

        h1 {
          margin: 14px 0 0;
          font-size: 34px;
          line-height: 1.08;
          letter-spacing: 0;
          color: #fff7e8;
        }

        .primary-action,
        .secondary-action,
        .campaign-row,
        .holiday-note,
        .map-link {
          display: flex;
          align-items: center;
        }

        .primary-action,
        .secondary-action {
          justify-content: center;
          gap: 8px;
          min-height: 36px;
          border-radius: 8px;
          padding: 0 14px;
          text-decoration: none;
          font-size: 12px;
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
          max-width: 1468px;
          margin: 0 auto;
          padding: 16px 26px 32px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 256px;
          gap: 18px;
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
          gap: 24px;
          padding: 0;
          background: transparent;
          border: 0;
          border-bottom: 1px solid rgba(255, 255, 255, .28);
          border-radius: 0;
          overflow-x: auto;
        }

        .tab {
          flex: none;
          border: 0;
          border-bottom: 2px solid transparent;
          border-radius: 0;
          padding: 0 0 12px;
          background: transparent;
          color: #bfb7aa;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .tab.active {
          color: #e2b85e;
          background: transparent;
          border-bottom-color: #e2b85e;
        }

        .tab-section {
          margin-top: 12px;
          background: rgba(255, 255, 255, .045);
          border: 1px solid rgba(226, 184, 94, .16);
          border-radius: 8px;
          padding: 14px;
        }

        .stat-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
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
          padding: 12px;
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
          font-size: 14px;
        }

        .campaign-list {
          display: grid;
          gap: 10px;
          margin-top: 12px;
        }

        .campaign-row {
          gap: 12px;
          padding: 12px;
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
          margin-top: 16px;
        }

        .related-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
          margin-top: 10px;
        }

        .related-card {
          overflow: hidden;
          color: #f7f1e7;
          text-decoration: none;
        }

        .related-card div {
          height: 78px;
          background-size: cover;
          background-position: center;
        }

        .related-card strong,
        .related-card small,
        .related-card span {
          display: block;
          padding: 0 9px;
        }

        .related-card strong {
          padding-top: 9px;
          font-size: 13px;
        }

        .related-card span {
          padding-bottom: 10px;
          margin-top: 3px;
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
          padding: 14px;
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
          font-size: 22px;
        }

        .booking-panel label {
          display: block;
          margin: 14px 0 8px;
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
          min-height: 30px;
          padding: 0 9px;
          font-weight: 800;
          font-size: 12px;
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
          .store-content,
          .map-grid {
            grid-template-columns: 1fr;
          }

          .store-content {
            max-width: 100%;
            padding-left: 22px;
            padding-right: 22px;
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
          h1 {
            font-size: 28px;
          }

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
