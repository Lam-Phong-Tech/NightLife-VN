import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { breadcrumbJsonLd, jsonLdGraph } from "@/lib/seo/structured-data";
import { absoluteSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tour nightlife và trải nghiệm đêm",
  description:
    "Gợi ý tour nightlife theo khu vực, itinerary mẫu và cách gửi yêu cầu tư vấn tour qua Vietyoru.",
  alternates: {
    canonical: "/tour",
  },
  robots: {
    index: false,
    follow: false,
  },
};

const tours = [
  {
    name: "Tour đêm Tây Hồ",
    area: "Hà Nội",
    duration: "4 giờ",
    price: "từ 1.500.000đ / khách",
    image:
      "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1200&q=78",
    imageAlt: "Không gian lounge ban đêm tại khu Tây Hồ",
    itinerary: ["Lounge mở đầu", "Club hoặc bar có bàn nhóm", "Điểm ăn khuya gần hồ"],
  },
  {
    name: "Phố cổ và ẩm thực đêm",
    area: "Hà Nội",
    duration: "3 giờ",
    price: "từ 800.000đ / khách",
    image:
      "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1200&q=78",
    imageAlt: "Đồ uống trong không gian nightlife",
    itinerary: ["Điểm hẹn phố cổ", "Quán đồ uống nhẹ", "Ăn khuya theo khẩu vị nhóm"],
  },
  {
    name: "Bar hopping Quận 1",
    area: "TP.HCM",
    duration: "5 giờ",
    price: "từ 2.500.000đ / khách",
    image:
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1200&q=78",
    imageAlt: "Quầy bar sáng đèn trong buổi tối",
    itinerary: ["Rooftop trung tâm", "Bar cocktail", "Club hoặc lounge cuối đêm"],
  },
];

export default function TourPage() {
  const structuredData = jsonLdGraph([
    breadcrumbJsonLd(
      [
        { name: "Trang chủ", path: "/" },
        { name: "Tour", path: "/tour" },
      ],
      "/tour",
    ),
    {
      "@type": "ItemList",
      "@id": `${absoluteSiteUrl("/tour")}#tour-list`,
      name: "Tour nightlife Vietyoru",
      itemListElement: tours.map((tour, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "TouristTrip",
          name: tour.name,
          description: `${tour.area} · ${tour.duration} · ${tour.price}`,
          image: tour.image,
        },
      })),
    },
  ]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0c0c0f",
        color: "#f3f0ea",
        padding: "clamp(22px, 5vw, 56px) clamp(16px, 5vw, 48px)",
      }}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <section style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <p style={{ margin: 0, color: "#d4b26a", fontSize: 12, fontWeight: 850, letterSpacing: "1.8px", textTransform: "uppercase" }}>
          Tour
        </p>
        <h1 style={{ margin: "8px 0 0", maxWidth: 760, fontSize: "clamp(34px, 6vw, 58px)", lineHeight: 1.04, fontWeight: 950 }}>
          Tour nightlife theo khu vực
        </h1>
        <p style={{ maxWidth: 720, margin: "16px 0 0", color: "#c5c0b6", fontSize: 16, lineHeight: 1.75 }}>
          Các lịch trình dưới đây là gói tư vấn mẫu để khách chọn hướng đi trước khi admin kiểm tra tình trạng quán, bàn, cast và ưu đãi trong ngày.
        </p>

        <section
          aria-label="Danh sách tour"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
            marginTop: 28,
          }}
        >
          {tours.map((tour) => (
            <article
              key={tour.name}
              style={{
                border: "1px solid rgba(212,178,106,.22)",
                borderRadius: 8,
                overflow: "hidden",
                background: "rgba(255,255,255,.035)",
              }}
            >
              <div style={{ position: "relative", minHeight: 190 }}>
                <Image
                  src={tour.image}
                  alt={tour.imageAlt}
                  fill
                  sizes="(max-width: 767px) 100vw, 33vw"
                  style={{ objectFit: "cover" }}
                />
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(180deg,rgba(12,12,15,.02),rgba(12,12,15,.58))",
                  }}
                />
              </div>
              <div style={{ padding: 18 }}>
                <div style={{ color: "#d4b26a", fontSize: 12, fontWeight: 900 }}>
                  {tour.area} · {tour.duration}
                </div>
                <h2 style={{ margin: "8px 0 0", fontSize: 22, lineHeight: 1.25, fontWeight: 900 }}>
                  {tour.name}
                </h2>
                <div style={{ marginTop: 8, color: "#f0dda8", fontSize: 14, fontWeight: 850 }}>
                  {tour.price}
                </div>
                <ol style={{ margin: "14px 0 0", paddingLeft: 18, color: "#d7d0c3", lineHeight: 1.7 }}>
                  {tour.itinerary.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              </div>
            </article>
          ))}
        </section>

        <section
          style={{
            marginTop: 26,
            border: "1px solid rgba(212,178,106,.26)",
            borderRadius: 8,
            padding: "clamp(18px, 4vw, 26px)",
            background: "rgba(212,178,106,.08)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div style={{ flex: "1 1 340px" }}>
            <h2 style={{ margin: 0, fontSize: 22, lineHeight: 1.25, fontWeight: 900 }}>
              Cần chốt tour theo ngày đi
            </h2>
            <p style={{ margin: "8px 0 0", color: "#efe4c9", lineHeight: 1.65 }}>
              Giá, điểm dừng và số lượng khách cần admin xác nhận lại với từng quán trước khi phát hành tour public chính thức.
            </p>
          </div>
          <Link
            href="/dang-ky-doi-tac"
            style={{
              minHeight: 42,
              borderRadius: 8,
              background: "linear-gradient(135deg,#f0dda8,#d4b26a)",
              color: "#241a0a",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 18px",
              fontWeight: 900,
              textDecoration: "none",
            }}
          >
            Gửi yêu cầu tư vấn
          </Link>
        </section>
      </section>
    </main>
  );
}
