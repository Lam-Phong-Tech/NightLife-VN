"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import {
  BadgePercent,
  CalendarClock,
  ChevronLeft,
  Clock3,
  Globe2,
  Heart,
  Languages,
  MapPin,
  Navigation,
  Phone,
  Play,
  Share2,
  Sparkles,
  Star,
  Ticket,
  Video,
} from "lucide-react";

import { PlaceholderMedia } from "@/components/ui/MediaPlaceholder";

const colors = {
  bg: "#0c0c0f",
  surface: "#141417",
  surfaceSoft: "rgba(255,255,255,.045)",
  surfaceStrong: "rgba(255,255,255,.07)",
  border: "rgba(212,178,106,.22)",
  borderSoft: "rgba(255,255,255,.08)",
  text: "#f3f0ea",
  text2: "#c5c0b6",
  muted: "#8c8679",
  gold: "#d4b26a",
  goldSoft: "#f0dda8",
  rose: "#e0729e",
  ink: "#241a0a",
  goldGrad: "linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)",
};

const store = {
  name: "Club Lumière",
  logo: "CL",
  category: "Bar Lounge",
  area: "Tây Hồ, Hà Nội",
  rating: 4.9,
  reviews: 312,
  status: "Đang mở",
  phone: "024 8888 6622",
  phoneHref: "tel:+842488886622",
  priceFrom: "từ 1.200.000đ",
  openNow: "18:00 - 02:00",
  distance: "2.4 km",
  address: "12 Nguyễn Đình Thi, Tây Hồ, Hà Nội",
  mapSrc: "https://www.google.com/maps?q=Club%20Lumiere%20Tay%20Ho%20Hanoi&output=embed",
  cover:
    "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1400&q=80') center/cover",
  intro:
    "Lounge bar cao cấp khu Tây Hồ với phòng VIP riêng tư, âm thanh ánh sáng ấm, đội ngũ host phù hợp tiếp khách và hỗ trợ khách nước ngoài.",
  languages: ["Tiếng Việt", "English", "Tiếng Nhật", "Korean cơ bản"],
};

const quickFacts = [
  { label: "Giờ mở cửa", value: store.openNow, icon: Clock3 },
  { label: "Giá tham khảo", value: store.priceFrom, icon: BadgePercent },
  { label: "Khoảng cách", value: store.distance, icon: Navigation },
];

const priceRows = [
  { item: "Set bàn lounge 2 giờ", price: "1.200.000đ", note: "2-4 khách" },
  { item: "Phòng VIP 2 giờ", price: "3.500.000đ", note: "tối đa 8 khách" },
  { item: "Gói sinh nhật", price: "từ 2.000.000đ", note: "trang trí cơ bản" },
  { item: "Host/Cast theo giờ", price: "từ 500.000đ", note: "xác nhận theo lịch" },
];

const campaigns = [
  {
    title: "Happy Hour cuối tuần",
    value: "-20%",
    desc: "Áp dụng cho bàn đặt trước 20:00, số lượng coupon giới hạn mỗi ngày.",
    href: "/uu-dai",
  },
  {
    title: "VIP room upgrade",
    value: "2+1",
    desc: "Thêm 1 giờ phòng VIP cho nhóm 6+ khách khi admin xác nhận lịch.",
    href: "/uu-dai",
  },
];

const casts = [
  {
    name: "Rina",
    age: 22,
    role: "Host VIP",
    rating: 4.9,
    langs: "JP / EN",
    img: "url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=480&q=70') center/cover",
  },
  {
    name: "Michi",
    age: 24,
    role: "Table service",
    rating: 4.8,
    langs: "VI / JP",
    img: "url('https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=480&q=70') center/cover",
  },
  {
    name: "Hana",
    age: 23,
    role: "Event support",
    rating: 4.7,
    langs: "EN / KR",
    img: "url('https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=480&q=70') center/cover",
  },
  {
    name: "Linh",
    age: 25,
    role: "Concierge",
    rating: 4.9,
    langs: "VI / EN",
    img: "url('https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=480&q=70') center/cover",
  },
];

const mediaItems = [
  {
    title: "Sảnh chính",
    type: "Album",
    img: "url('https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=720&q=75') center/cover",
  },
  {
    title: "Phòng VIP",
    type: "Album",
    img: "url('https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=720&q=75') center/cover",
  },
  {
    title: "Không khí cuối tuần",
    type: "Video",
    img: "url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=720&q=75') center/cover",
  },
  {
    title: "Bàn riêng",
    type: "Album",
    img: "url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=720&q=75') center/cover",
  },
];

const openingHours = [
  ["Thứ 2 - Thứ 5", "18:00 - 01:00"],
  ["Thứ 6 - Thứ 7", "18:00 - 02:00"],
  ["Chủ nhật", "18:00 - 00:30"],
];

const bookingHref = "/dat-cho?store=club-lumiere";
const couponHref = "/uu-dai?store=club-lumiere";

function SectionHeading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="store-section-heading">
      <div>
        <h2>{title}</h2>
        {sub ? <p>{sub}</p> : null}
      </div>
      <span aria-hidden="true" />
    </div>
  );
}

function GoldButton({
  href,
  children,
  icon,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: "primary" | "outline";
}) {
  return (
    <Link
      href={href}
      className={variant === "primary" ? "store-btn-primary" : "store-btn-outline"}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}

function InfoTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Clock3;
}) {
  return (
    <div className="store-info-tile">
      <Icon size={18} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function PriceTable() {
  return (
    <section className="store-section">
      <SectionHeading title="Bảng giá tham khảo" sub="PRICE REFERENCE ONLY" />
      <div className="store-price-table" aria-label="Bảng giá chỉ hiển thị">
        {priceRows.map((row) => (
          <div key={row.item} className="store-price-row">
            <div>
              <strong>{row.item}</strong>
              <span>{row.note}</span>
            </div>
            <b>{row.price}</b>
          </div>
        ))}
      </div>
      <p className="store-note">
        Bảng giá chỉ để tham khảo. Admin sẽ xác nhận lại theo ngày, khung giờ và số khách. Không đặt món online, không thanh toán trước trên trang này.
      </p>
    </section>
  );
}

function Campaigns() {
  return (
    <section className="store-section">
      <SectionHeading title="Campaign đang chạy" sub="AVAILABLE DEALS" />
      <div className="store-campaign-grid">
        {campaigns.map((campaign) => (
          <Link href={campaign.href} key={campaign.title} className="store-campaign-card">
            <span>
              <Sparkles size={16} />
              Coupon
            </span>
            <strong>{campaign.value}</strong>
            <h3>{campaign.title}</h3>
            <p>{campaign.desc}</p>
            <b>Lấy coupon</b>
          </Link>
        ))}
      </div>
    </section>
  );
}

function CastGrid() {
  return (
    <section className="store-section">
      <SectionHeading title="Cast đang làm" sub="TODAY ROSTER" />
      <div className="store-cast-grid">
        {casts.map((cast) => (
          <Link href={`/casts/${cast.name.toLowerCase()}`} key={cast.name} className="store-cast-card">
            <PlaceholderMedia
              src={cast.img}
              alt={`${cast.name} profile`}
              label="Ảnh cast"
              style={{ height: "164px", borderRadius: "14px 14px 0 0" }}
            >
              <span className="store-rating-pill">
                <Star size={12} fill={colors.goldSoft} />
                {cast.rating}
              </span>
            </PlaceholderMedia>
            <div>
              <strong>
                {cast.name} · {cast.age}
              </strong>
              <span>{cast.role}</span>
              <small>
                <Languages size={13} />
                {cast.langs}
              </small>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function MediaGallery() {
  return (
    <section className="store-section">
      <SectionHeading title="Album và video" sub="PHOTOS AND CLIPS" />
      <div className="store-media-grid">
        {mediaItems.map((item, index) => (
          <Link
            href="#media"
            key={item.title}
            className={index === 0 ? "store-media-card store-media-card-large" : "store-media-card"}
          >
            <PlaceholderMedia
              src={item.img}
              alt={item.title}
              label={item.type === "Video" ? "Ảnh video" : "Ảnh album"}
              style={{ position: "absolute", inset: 0 }}
            />
            <span className="store-media-overlay" />
            {item.type === "Video" ? (
              <span className="store-play">
                <Play size={22} fill={colors.ink} />
              </span>
            ) : null}
            <div>
              <small>
                {item.type === "Video" ? <Video size={14} /> : <Globe2 size={14} />}
                {item.type}
              </small>
              <strong>{item.title}</strong>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function LocationHours() {
  return (
    <section className="store-section">
      <SectionHeading title="Vị trí và giờ mở cửa" sub="LOCATION AND HOURS" />
      <div className="store-location-grid">
        <div className="store-map">
          <iframe
            title={`${store.name} Google Map`}
            src={store.mapSrc}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div className="store-hours">
          <div className="store-address">
            <MapPin size={18} />
            <div>
              <strong>{store.address}</strong>
              <span>Vị trí chi tiết sẽ được admin gửi sau khi xác nhận booking.</span>
            </div>
          </div>
          {openingHours.map(([day, hour]) => (
            <div key={day} className="store-hour-row">
              <span>{day}</span>
              <strong>{hour}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StickyMobileCta() {
  return (
    <div className="store-mobile-cta">
      <div>
        <span>Đặt chỗ từ</span>
        <strong>{store.priceFrom}</strong>
      </div>
      <GoldButton href={bookingHref} icon={<CalendarClock size={17} />}>
        Đặt chỗ
      </GoldButton>
      <GoldButton href={couponHref} icon={<Ticket size={17} />} variant="outline">
        Coupon
      </GoldButton>
    </div>
  );
}

export default function Page() {
  const params = useParams<{ slug?: string }>();
  const [isFavorite, setIsFavorite] = useState(false);
  const storeSlug = params?.slug || "club-lumiere";

  const handleShare = () => {
    if (typeof window === "undefined") return;
    if (navigator.share) {
      void navigator.share({
        title: store.name,
        text: store.intro,
        url: window.location.href,
      });
      return;
    }
    void navigator.clipboard?.writeText(window.location.href);
  };

  return (
    <>
      <main className="store-detail-page" data-store={storeSlug}>
        <section className="store-hero">
          <PlaceholderMedia
            src={store.cover}
            alt={`${store.name} cover`}
            label="Ảnh quán"
            style={{ position: "absolute", inset: 0 }}
          />
          <div className="store-hero-gradient" />

          <div className="store-hero-actions">
            <Link href="/danh-sach-quan" aria-label="Quay lại danh sách quán" className="store-round-btn">
              <ChevronLeft size={22} />
            </Link>
            <div>
              <button
                type="button"
                aria-label={isFavorite ? "Bỏ lưu quán" : "Lưu quán"}
                onClick={() => setIsFavorite((value) => !value)}
                className="store-round-btn"
              >
                <Heart size={20} fill={isFavorite ? colors.rose : "none"} />
              </button>
              <button type="button" aria-label="Chia sẻ quán" onClick={handleShare} className="store-round-btn">
                <Share2 size={19} />
              </button>
            </div>
          </div>

          <div className="store-hero-copy">
            <div className="store-logo" aria-label={`${store.name} logo`}>
              {store.logo}
            </div>
            <div>
              <div className="store-status-row">
                <span className="store-open-dot" />
                {store.status} · {store.category}
              </div>
              <h1>{store.name}</h1>
              <p>
                {store.area} · <Star size={15} fill={colors.goldSoft} /> {store.rating} ({store.reviews})
              </p>
            </div>
          </div>
        </section>

        <div className="store-content">
          <div className="store-main">
            <section className="store-section store-overview">
              <div className="store-actions-row">
                <GoldButton href={bookingHref} icon={<CalendarClock size={18} />}>
                  Đặt chỗ
                </GoldButton>
                <GoldButton href={couponHref} icon={<Ticket size={18} />} variant="outline">
                  Lấy coupon
                </GoldButton>
                <a href={store.phoneHref} className="store-call-btn">
                  <Phone size={18} />
                  Gọi quán
                </a>
              </div>

              <p className="store-intro">{store.intro}</p>

              <div className="store-fact-grid">
                {quickFacts.map((fact) => (
                  <InfoTile key={fact.label} {...fact} />
                ))}
              </div>

              <div className="store-language-panel">
                <div>
                  <Languages size={20} />
                  <strong>Ngôn ngữ nhân sự</strong>
                </div>
                <div>
                  {store.languages.map((language) => (
                    <span key={language}>{language}</span>
                  ))}
                </div>
              </div>
            </section>

            <PriceTable />
            <Campaigns />
            <CastGrid />
            <MediaGallery />
            <LocationHours />
          </div>

          <aside className="store-sidebar" aria-label="Đặt chỗ và coupon">
            <div className="store-booking-card">
              <span>Thông tin đặt chỗ</span>
              <h2>{store.priceFrom}</h2>
              <p>Giá hiển thị để tham khảo. Yêu cầu đặt chỗ sẽ được admin xác nhận qua điện thoại hoặc tin nhắn.</p>
              <GoldButton href={bookingHref} icon={<CalendarClock size={18} />}>
                Đặt chỗ ngay
              </GoldButton>
              <GoldButton href={couponHref} icon={<Ticket size={18} />} variant="outline">
                Lấy coupon
              </GoldButton>
              <a href={store.phoneHref} className="store-sidebar-call">
                <Phone size={17} />
                {store.phone}
              </a>
              <small>Không đặt món online trên trang chi tiết quán.</small>
            </div>
          </aside>
        </div>
      </main>

      <StickyMobileCta />
    </>
  );
}
