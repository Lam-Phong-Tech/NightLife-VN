import Link from "next/link";
import { Clock3, Heart, ImageIcon, MapPin, Phone, Play, Tag, Users, WalletCards } from "lucide-react";
import type { PublicStoreDetail, StoreGalleryItem } from "@/lib/api/store-detail";
import { formatPriceTier } from "@/lib/price-tier";
import { categoryLabels } from "./store-detail.helpers";

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

const mediaBackground = (media?: StoreGalleryItem | null) =>
  media?.type === "IMAGE" && media.url
    ? `linear-gradient(180deg, rgba(10,10,12,.18), rgba(10,10,12,.66)), url("${media.url}")`
    : "linear-gradient(135deg, #18181c 0%, #2f2a22 48%, #111114 100%)";

type StoreDetailHeaderProps = {
  store: PublicStoreDetail;
  displayName: string;
  gallery: StoreGalleryItem[];
  galleryTiles: StoreGalleryItem[];
  heroImage?: StoreGalleryItem | null;
  mainGalleryMedia?: StoreGalleryItem | null;
  location: string;
  nationalityText: string;
  todayOpening: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpenGallery: (index: number) => void;
  onTrackCall: () => void;
};

export function StoreDetailHeader({
  store,
  displayName,
  gallery,
  galleryTiles,
  heroImage,
  mainGalleryMedia,
  location,
  nationalityText,
  todayOpening,
  isFavorite,
  onToggleFavorite,
  onOpenGallery,
  onTrackCall,
}: StoreDetailHeaderProps) {
  const categoryLabel = categoryLabels[store.category] ?? store.category;
  const startingPrice = formatPriceTier(store.priceReference.startingFromVnd);
  const closingTime = todayOpening.includes(" - ") ? todayOpening.split(" - ")[1] : "";
  const rawSummaryTags = [
    { key: "category", label: categoryLabel, icon: Tag, tone: "featured" },
    store.priceReference.items.length ? { key: "pricing", label: "Bảng giá tham khảo", icon: WalletCards } : null,
    nationalityText ? { key: "nationality", label: `Quốc tịch ${nationalityText}`, icon: Users } : null,
    closingTime ? { key: "opening", label: `Đang mở đến ${closingTime}`, icon: Clock3, tone: "open" } : null,
  ];
  const summaryTags = rawSummaryTags.filter((tag): tag is Exclude<(typeof rawSummaryTags)[number], null> =>
    Boolean(tag),
  );

  const galleryTileBackground = (item?: StoreGalleryItem | null) =>
    mediaBackground(item?.type === "VIDEO" ? heroImage ?? item : item);

  return (
    <section className="legacy-shell">
      <nav className="legacy-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Trang chủ</Link>
        <span>/</span>
        <Link href="/danh-sach-quan">Tìm quán</Link>
        <span>/</span>
        <span>{store.area?.name ?? store.district ?? store.city}</span>
        <span>/</span>
        <strong>{displayName}</strong>
      </nav>

      <div className="legacy-gallery" aria-label="Gallery của quán">
        {galleryTiles.length ? (
          galleryTiles.slice(0, 5).map((item, index) => (
            <button
              key={`${item.id}-${index}`}
              type="button"
              className={index === 0 ? "legacy-gallery-tile featured" : "legacy-gallery-tile"}
              style={{ backgroundImage: galleryTileBackground(index === 0 ? mainGalleryMedia : item) }}
              onClick={() => onOpenGallery(index % gallery.length)}
              aria-label={`Xem media ${index + 1}`}
            >
              {index === 0 ? (
                <>
                  <span className="legacy-play-center">
                    <Play size={20} fill="currentColor" />
                  </span>
                  <span className="legacy-video-badge">
                    <Play size={12} fill="currentColor" />
                    Video
                  </span>
                </>
              ) : item.type === "VIDEO" ? (
                <span className="legacy-video-badge">
                  <Play size={12} fill="currentColor" />
                  Video
                </span>
              ) : null}
            </button>
          ))
        ) : (
          <div className="legacy-gallery-empty">
            <ImageIcon size={22} />
            <strong>Chưa có gallery</strong>
            <span>Quán chưa đăng ảnh hoặc video công khai.</span>
          </div>
        )}
      </div>

      <div className="legacy-summary">
        <div className="legacy-summary-main">
          <div className="store-logo">{getInitials(store.name) || "NL"}</div>
          <div className="legacy-summary-copy">
            <h1>{displayName}</h1>
            <div className="legacy-summary-meta">
              <span className="summary-price">{startingPrice}</span>
              <span>
                <Users size={13} />
                {store.casts.length} hồ sơ cast
              </span>
              <span className="summary-location">
                <MapPin size={13} />
                {location || "Chưa cập nhật khu vực"}
              </span>
            </div>
          </div>
          <div className="legacy-summary-actions">
            <button
              type="button"
              aria-label={isFavorite ? "Bỏ lưu quán" : "Lưu quán"}
              onClick={onToggleFavorite}
            >
              <Heart size={18} fill={isFavorite ? "#d4b26a" : "none"} />
            </button>
            {store.phone ? (
              <a href={`tel:${store.phone}`} aria-label="Gọi quán" onClick={onTrackCall}>
                <Phone size={18} />
              </a>
            ) : null}
          </div>
        </div>

        <div className="legacy-tags">
          {summaryTags.map((tag) => {
            const Icon = tag.icon;

            return (
              <span
                key={tag.key}
                className={tag.tone === "open" ? "open-now" : tag.tone === "featured" ? "featured" : undefined}
              >
                <Icon size={13} />
                {tag.label}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
