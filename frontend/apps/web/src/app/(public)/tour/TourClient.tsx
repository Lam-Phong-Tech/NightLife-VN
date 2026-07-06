"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronRight, MapPin, Route, Sparkles } from "lucide-react";
import { PlaceholderMedia } from "@/components/ui/MediaPlaceholder";
import { contentApi, type PublicTourItem } from "@/lib/api/content";
import { resolveClientUrl } from "@/lib/api/client";
import { getHomeBehaviorSignals, trackHomeVenueSignal } from "@/lib/analytics/home";

const cityTabs = [
  { id: "all", label: "Tất cả" },
  { id: "hn", label: "Hà Nội" },
  { id: "hcm", label: "TP.HCM" },
] as const;

type CityTab = (typeof cityTabs)[number]["id"];

const categoryLabels: Record<string, string> = {
  BAR: "Bar",
  CLUB: "Club",
  LOUNGE: "Lounge",
  GIRLS_BAR: "Girls bar",
  KARAOKE: "Karaoke",
  MASSAGE_SPA: "Spa",
  RESTAURANT: "Nhà hàng",
  CASINO: "Casino",
};

function money(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

export function TourClient() {
  const [activeCity, setActiveCity] = useState<CityTab>("all");
  const [tours, setTours] = useState<PublicTourItem[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const behavior = useMemo(() => getHomeBehaviorSignals(), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    contentApi
      .tours({
        cityCode: activeCity,
        limit: 6,
        categories: behavior.categories.join(","),
        storeSlugs: behavior.storeSlugs.join(","),
      })
      .then((items) => {
        if (!cancelled) setTours(items);
      })
      .catch(() => {
        if (!cancelled) {
          setTours([]);
          setError("Chưa tải được tour từ API. Vui lòng thử lại sau.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeCity, behavior.categories, behavior.storeSlugs]);

  return (
    <section style={{ maxWidth: 1180, margin: "0 auto" }}>
      <p style={{ margin: 0, color: "#d4b26a", fontSize: 12, fontWeight: 850, letterSpacing: "1.8px", textTransform: "uppercase" }}>
        Tour thật theo dữ liệu quán
      </p>
      <h1 style={{ margin: "8px 0 0", maxWidth: 780, fontSize: "clamp(34px, 6vw, 58px)", lineHeight: 1.04, fontWeight: 950 }}>
        Lịch trình nightlife theo khu vực
      </h1>
      <p style={{ maxWidth: 720, margin: "16px 0 0", color: "#c5c0b6", fontSize: 16, lineHeight: 1.75 }}>
        Hệ thống ghép tour từ các quán đang hoạt động, ưu đãi hiện có và tín hiệu bạn vừa xem trên Vietyoru.
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 24 }}>
        {cityTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveCity(tab.id)}
            style={{
              minHeight: 42,
              borderRadius: 8,
              border: "1px solid rgba(212,178,106,.25)",
              background: activeCity === tab.id ? "linear-gradient(135deg,#f0dda8,#d4b26a)" : "rgba(255,255,255,.045)",
              color: activeCity === tab.id ? "#241a0a" : "#f3f0ea",
              padding: "0 16px",
              fontWeight: 900,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section
        aria-label="Danh sách tour"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
          marginTop: 28,
        }}
      >
        {isLoading ? (
          <StatusCard text="Đang tải tour từ API..." />
        ) : tours.length ? (
          tours.map((tour) => <TourCard key={tour.id} tour={tour} />)
        ) : (
          <StatusCard text={error || "Chưa có tour phù hợp với khu vực này."} />
        )}
      </section>
    </section>
  );
}

function TourCard({ tour }: { tour: PublicTourItem }) {
  return (
    <article
      style={{
        border: "1px solid rgba(212,178,106,.22)",
        borderRadius: 8,
        overflow: "hidden",
        background: "rgba(255,255,255,.035)",
      }}
    >
      <PlaceholderMedia
        src={resolveClientUrl(tour.thumbnailUrl) ? `url(${JSON.stringify(resolveClientUrl(tour.thumbnailUrl))}) center/cover` : undefined}
        alt={tour.title}
        label="Tour"
        style={{ minHeight: 190, position: "relative" }}
      >
        <span aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(12,12,15,.02),rgba(12,12,15,.62))" }} />
        <span style={{ position: "absolute", left: 16, bottom: 16, display: "inline-flex", alignItems: "center", gap: 7, color: "#f0dda8", fontWeight: 900, fontSize: 12 }}>
          <Route size={16} /> {tour.stops.length} điểm dừng
        </span>
      </PlaceholderMedia>
      <div style={{ padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, color: "#d4b26a", fontSize: 12, fontWeight: 900 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <MapPin size={14} /> {tour.area}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <CalendarDays size={14} /> {tour.durationHours} giờ
          </span>
        </div>
        <h2 style={{ margin: "10px 0 0", fontSize: 22, lineHeight: 1.25, fontWeight: 950 }}>{tour.title}</h2>
        <p style={{ margin: "8px 0 0", color: "#c5c0b6", lineHeight: 1.6 }}>{tour.subtitle}</p>
        <div style={{ marginTop: 10, color: "#f0dda8", fontSize: 14, fontWeight: 900 }}>
          Từ {money(tour.priceFromVnd)}đ / nhóm
        </div>
        <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
          {tour.stops.map((stop) => (
            <Link
              key={stop.id}
              href={stop.href}
              onClick={() =>
                trackHomeVenueSignal({
                  storeId: stop.id,
                  storeSlug: stop.slug,
                  category: stop.category,
                  source: "tour_module",
                })
              }
              style={{
                display: "grid",
                gridTemplateColumns: "44px 1fr auto",
                alignItems: "center",
                gap: 11,
                border: "1px solid rgba(212,178,106,.18)",
                borderRadius: 8,
                padding: 10,
                color: "#f3f0ea",
                textDecoration: "none",
                background: "rgba(255,255,255,.035)",
              }}
            >
              <span style={{ width: 44, height: 44, borderRadius: 8, display: "grid", placeItems: "center", background: "rgba(212,178,106,.14)", color: "#f0dda8", fontWeight: 950 }}>
                {stop.order}
              </span>
              <span style={{ minWidth: 0 }}>
                <strong style={{ display: "block", fontSize: 14 }}>{stop.name}</strong>
                <span style={{ display: "block", marginTop: 3, color: "#a8a097", fontSize: 12 }}>
                  {categoryLabels[stop.category] ?? stop.category}
                  {stop.activeCouponName ? ` · ${stop.activeCouponName}` : ""}
                </span>
              </span>
              <ChevronRight size={18} color="#d4b26a" />
            </Link>
          ))}
        </div>
        <Link
          href="/danh-sach-quan"
          style={{
            minHeight: 42,
            borderRadius: 8,
            marginTop: 16,
            background: "linear-gradient(135deg,#f0dda8,#d4b26a)",
            color: "#241a0a",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "0 16px",
            fontWeight: 950,
            textDecoration: "none",
          }}
        >
          <Sparkles size={16} /> Đặt bàn theo tour
        </Link>
      </div>
    </article>
  );
}

function StatusCard({ text }: { text: string }) {
  return (
    <div
      style={{
        border: "1px dashed rgba(212,178,106,.28)",
        borderRadius: 8,
        padding: 24,
        color: "#c5c0b6",
        background: "rgba(255,255,255,.03)",
      }}
    >
      {text}
    </div>
  );
}
