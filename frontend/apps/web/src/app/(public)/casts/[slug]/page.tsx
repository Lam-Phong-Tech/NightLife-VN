"use client";

import { discoveryApi, type PublicCast } from "@/lib/api/discovery";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

type CastMedia = {
  id: string;
  type: "IMAGE" | "VIDEO";
  url: string;
  alt: string;
};

type CastProfile = {
  id: string;
  slug: string;
  stageName: string;
  name: string;
  publicHeadline: string;
  bio: string;
  tags: string[];
  languages: string[];
  hourlyRateVnd: number | null;
  thumbnailUrl: string | null;
  gallery: CastMedia[];
  age: number;
  born: number;
  rating: number;
  store: {
    id: string;
    name: string;
    slug: string;
    category?: string;
    city?: string;
    cityCode?: string;
    district?: string | null;
    area?: { name?: string | null } | null;
  };
};

const legacyCastSlugMap: Record<string, string> = {
  yuki: "yuki-sakura-lounge",
  michi: "miyuki-moonlight",
  rina: "rina-velvet",
  hana: "hana-sakura-lounge",
  aiko: "aya-velvet",
  "yuna-neon-district": "yuna-neon",
  "kotone-tokyo-kitchen": "kotone-tokyo",
  "sakura-moonlight-q1": "sakura-moonlight",
};

const cityLabels: Record<string, string> = {
  hn: "Hà Nội",
  hcm: "TP.HCM",
};

const languageLabels: Record<string, string> = {
  vi: "Tiếng Việt",
  ja: "Tiếng Nhật",
  en: "Tiếng Anh",
};

const tagLabels: Record<string, string> = {
  "20s": "Độ tuổi 20",
  "30s": "Độ tuổi 30",
  bilingual: "Song ngữ",
  calm: "Điềm tĩnh",
  cocktail: "Cocktail",
  "cocktail-expert": "Cocktail",
  dancer: "Dance",
  elegant: "Thanh lịch",
  energetic: "Năng động",
  friendly: "Thân thiện",
  japanese: "Japanese style",
  ktv: "KTV",
  lounge: "Lounge",
  party: "Party",
  refined: "Tinh tế",
  "sake-expert": "Sake",
  "vip": "VIP",
  "vip-specialist": "VIP",
};

const baseGallery: CastMedia[] = [
  {
    id: "portrait-1",
    type: "IMAGE",
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=720&q=78",
    alt: "Ảnh profile cast",
  },
  {
    id: "portrait-2",
    type: "IMAGE",
    url: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=720&q=78",
    alt: "Ảnh gallery cast",
  },
  {
    id: "portrait-3",
    type: "IMAGE",
    url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=720&q=78",
    alt: "Ảnh gallery cast",
  },
  {
    id: "portrait-4",
    type: "IMAGE",
    url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=720&q=78",
    alt: "Ảnh gallery cast",
  },
  {
    id: "portrait-5",
    type: "IMAGE",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=720&q=78",
    alt: "Ảnh gallery cast",
  },
  {
    id: "intro-video",
    type: "VIDEO",
    url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=720&q=78",
    alt: "Video giới thiệu cast",
  },
];

function galleryAt(index: number) {
  return baseGallery[index] ?? baseGallery[0]!;
}

const profileOverrides: Record<string, CastProfile> = {
  "yuki-sakura-lounge": {
    id: "cast-yuki-sakura-lounge",
    slug: "yuki-sakura-lounge",
    stageName: "ユキ",
    name: "Yuki",
    publicHeadline: "Lounge host nhẹ nhàng, phù hợp tiếp khách riêng tư",
    bio:
      "Yuki có phong cách tinh tế, giao tiếp nhẹ nhàng và am hiểu sake. Phù hợp các buổi tiếp khách cần không khí yên tĩnh, lịch sự và có hỗ trợ tiếng Nhật.",
    tags: ["refined", "sake-expert", "calm", "20s"],
    languages: ["ja", "vi"],
    hourlyRateVnd: 550000,
    thumbnailUrl: galleryAt(0).url,
    gallery: baseGallery,
    age: 24,
    born: 2002,
    rating: 4.8,
    store: {
      id: "store-sakura-lounge",
      name: "Sakura Lounge",
      slug: "sakura-lounge",
      category: "GIRLS_BAR",
      city: "TP.HCM",
      cityCode: "hcm",
      district: "Quận 3",
      area: { name: "Quận 3" },
    },
  },
  "miyuki-moonlight": {
    id: "cast-miyuki-moonlight",
    slug: "miyuki-moonlight",
    stageName: "ミユキ",
    name: "Miyuki",
    publicHeadline: "Host trò chuyện duyên dáng cho cocktail bar",
    bio:
      "Miyuki nổi bật ở khả năng dẫn chuyện tự nhiên, tiếng Nhật và tiếng Anh tốt. Hợp nhóm nhỏ muốn một buổi tối thoải mái, dễ nói chuyện.",
    tags: ["elegant", "conversationalist", "bilingual", "20s"],
    languages: ["ja", "en"],
    hourlyRateVnd: 450000,
    thumbnailUrl: galleryAt(1).url,
    gallery: rotateGallery(1),
    age: 23,
    born: 2003,
    rating: 4.9,
    store: {
      id: "store-moonlight-bar",
      name: "Moonlight Bar",
      slug: "moonlight-bar",
      category: "BAR",
      city: "TP.HCM",
      cityCode: "hcm",
      district: "Quận 1",
      area: { name: "Quận 1" },
    },
  },
  "rina-velvet": {
    id: "cast-rina-velvet",
    slug: "rina-velvet",
    stageName: "リナ",
    name: "Rina",
    publicHeadline: "Club host năng động, hợp nhóm thích không khí sôi động",
    bio:
      "Rina có năng lượng tốt, biết khuấy động bàn VIP và phù hợp các nhóm muốn trải nghiệm club sống động nhưng vẫn được hỗ trợ lịch sự.",
    tags: ["energetic", "dancer", "party", "20s"],
    languages: ["ja", "vi"],
    hourlyRateVnd: 600000,
    thumbnailUrl: galleryAt(2).url,
    gallery: rotateGallery(2),
    age: 21,
    born: 2005,
    rating: 4.7,
    store: {
      id: "store-velvet-club",
      name: "Velvet Club",
      slug: "velvet-club",
      category: "CLUB",
      city: "TP.HCM",
      cityCode: "hcm",
      district: "Quận 1",
      area: { name: "Quận 1" },
    },
  },
  "hana-sakura-lounge": {
    id: "cast-hana-sakura-lounge",
    slug: "hana-sakura-lounge",
    stageName: "ハナ",
    name: "Hana",
    publicHeadline: "Host chu đáo, hợp lounge và phòng riêng",
    bio:
      "Hana có phong thái ấm áp, chăm khách kỹ và nói chuyện dễ chịu. Phù hợp booking lounge, sinh nhật nhỏ hoặc tiếp khách cần sự nhẹ nhàng.",
    tags: ["sweet", "attentive", "lounge", "20s"],
    languages: ["ja", "vi"],
    hourlyRateVnd: 500000,
    thumbnailUrl: galleryAt(3).url,
    gallery: rotateGallery(3),
    age: 22,
    born: 2004,
    rating: 4.7,
    store: {
      id: "store-sakura-lounge",
      name: "Sakura Lounge",
      slug: "sakura-lounge",
      category: "GIRLS_BAR",
      city: "TP.HCM",
      cityCode: "hcm",
      district: "Quận 3",
      area: { name: "Quận 3" },
    },
  },
  "aya-velvet": {
    id: "cast-aya-velvet",
    slug: "aya-velvet",
    stageName: "アヤ",
    name: "Aya",
    publicHeadline: "VIP host thanh lịch, am hiểu rượu vang và champagne",
    bio:
      "Aya phù hợp bàn VIP, nhóm business và các buổi cần hỗ trợ chọn đồ uống. Phong cách chỉn chu, sang nhưng vẫn dễ gần.",
    tags: ["glamorous", "vip-specialist", "wine-expert", "20s"],
    languages: ["ja", "en", "vi"],
    hourlyRateVnd: 700000,
    thumbnailUrl: galleryAt(4).url,
    gallery: rotateGallery(4),
    age: 25,
    born: 2001,
    rating: 4.6,
    store: {
      id: "store-velvet-club",
      name: "Velvet Club",
      slug: "velvet-club",
      category: "CLUB",
      city: "TP.HCM",
      cityCode: "hcm",
      district: "Quận 1",
      area: { name: "Quận 1" },
    },
  },
  "yuna-neon": {
    id: "cast-yuna-neon",
    slug: "yuna-neon",
    stageName: "ユナ",
    name: "Yuna",
    publicHeadline: "Party host năng động tại khu Tây Hồ",
    bio:
      "Yuna hợp nhóm thích club, bàn VIP và không khí sôi động. Có thể hỗ trợ khách Việt, Nhật, Anh trong các buổi tiệc tối.",
    tags: ["party", "energetic", "showgirl", "vip"],
    languages: ["ja", "vi", "en"],
    hourlyRateVnd: 600000,
    thumbnailUrl: galleryAt(5).url,
    gallery: rotateGallery(5),
    age: 24,
    born: 2002,
    rating: 4.8,
    store: {
      id: "store-neon-club",
      name: "Neon Club",
      slug: "neon-club",
      category: "CLUB",
      city: "Hà Nội",
      cityCode: "hn",
      district: "Tây Hồ",
      area: { name: "Tây Hồ" },
    },
  },
};

function rotateGallery(startIndex: number) {
  return baseGallery.map((_, index) => galleryAt((index + startIndex) % baseGallery.length));
}

function normalizeSlug(value?: string) {
  return (value ?? "").trim().toLowerCase();
}

function resolveProfileSlug(slug?: string) {
  const normalized = normalizeSlug(slug);
  return legacyCastSlugMap[normalized] ?? normalized;
}

function labelTag(tag: string) {
  return tagLabels[tag] ?? tag.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function labelLanguage(language: string) {
  return languageLabels[language] ?? language.toUpperCase();
}

function formatVnd(value: number | null) {
  if (!value) {
    return "Liên hệ";
  }

  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
}

function formatShortVnd(value: number | null) {
  if (!value) {
    return "Liên hệ";
  }

  if (value >= 1_000_000) {
    return `${Number(value / 1_000_000).toLocaleString("vi-VN", {
      maximumFractionDigits: 1,
    })}tr`;
  }

  return `${Math.round(value / 1000)}K`;
}

function mediaBg(url: string) {
  return `url('${url}') center/cover`;
}

function buildGallery(cast: PublicCast, override?: CastProfile) {
  const items = [
    ...(cast.thumbnailUrl
      ? [
          {
            id: `${cast.id}-avatar`,
            type: "IMAGE" as const,
            url: cast.thumbnailUrl,
            alt: cast.publicAlias ?? cast.stageName,
          },
        ]
      : []),
    ...(override?.gallery ?? baseGallery),
  ];
  const seen = new Set<string>();

  return items.filter((item) => {
    if (seen.has(item.url)) {
      return false;
    }

    seen.add(item.url);
    return true;
  });
}

function buildGenericBio(cast: PublicCast) {
  const name = cast.publicAlias ?? cast.stageName;
  const tags = cast.tags.slice(0, 3).map(labelTag).join(", ").toLowerCase();
  const languages = cast.languages.map(labelLanguage).join(", ");

  return `${name} đang hoạt động tại ${cast.store.name}. Phù hợp booking theo cast${
    tags ? ` với phong cách ${tags}` : ""
  }. Ngôn ngữ hỗ trợ: ${languages || "Tiếng Việt"}.`;
}

function profileFromPublicCast(cast: PublicCast, routeSlug: string): CastProfile {
  const resolvedRouteSlug = resolveProfileSlug(routeSlug);
  const override = profileOverrides[cast.slug] ?? profileOverrides[resolveProfileSlug(cast.slug)] ?? profileOverrides[resolvedRouteSlug];
  const name = cast.publicAlias ?? cast.name ?? cast.stageName;
  const age = override?.age ?? (cast.tags.includes("30s") ? 31 : 24);

  return {
    id: cast.id,
    slug: cast.slug,
    stageName: cast.stageName,
    name,
    publicHeadline: cast.publicHeadline ?? override?.publicHeadline ?? "Cast đã được duyệt public",
    bio: override?.bio ?? buildGenericBio(cast),
    tags: cast.tags.length ? cast.tags : (override?.tags ?? []),
    languages: cast.languages.length ? cast.languages : (override?.languages ?? ["vi"]),
    hourlyRateVnd: cast.hourlyRateVnd ?? override?.hourlyRateVnd ?? null,
    thumbnailUrl: cast.thumbnailUrl ?? override?.thumbnailUrl ?? null,
    gallery: buildGallery(cast, override),
    age,
    born: override?.born ?? 2026 - age,
    rating: override?.rating ?? 4.8,
    store: {
      id: cast.store.id,
      name: cast.store.name,
      slug: cast.store.slug,
      category: cast.store.category,
      city: cast.store.city,
      cityCode: cast.store.cityCode,
      district: cast.store.district,
      area: cast.store.area ? { name: cast.store.area.name } : null,
    },
  };
}

function fallbackProfile(routeSlug: string) {
  const resolvedSlug = resolveProfileSlug(routeSlug);
  return profileOverrides[resolvedSlug] ?? profileOverrides["yuki-sakura-lounge"]!;
}

function findCastBySlug(casts: PublicCast[], routeSlug: string) {
  const candidates = new Set([normalizeSlug(routeSlug), resolveProfileSlug(routeSlug)]);

  return casts.find((cast) => candidates.has(normalizeSlug(cast.slug)) || candidates.has(resolveProfileSlug(cast.slug)));
}

export default function Page({ params }: { params: Promise<{ slug?: string }> }) {
  void params;
  const routeParams = useParams<{ slug?: string }>();
  const routeSlug = typeof routeParams.slug === "string" ? routeParams.slug : "yuki";
  const [profile, setProfile] = useState<CastProfile>(() => fallbackProfile(routeSlug));
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fallback = fallbackProfile(routeSlug);

    queueMicrotask(() => {
      if (!cancelled) {
        setProfile(fallback);
        setActiveMediaIndex(0);
      }
    });

    discoveryApi
      .listCasts({ limit: 100 })
      .then((casts) => {
        if (cancelled) {
          return;
        }

        const matchedCast = findCastBySlug(casts, routeSlug);
        if (matchedCast) {
          setProfile(profileFromPublicCast(matchedCast, routeSlug));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProfile(fallback);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [routeSlug]);

  const tabStyle = (active: boolean): React.CSSProperties => ({
    color: active ? "#d4b26a" : "#8a879a",
    fontWeight: active ? 800 : 600,
    borderBottom: active ? "2px solid #d4b26a" : "2px solid transparent",
    paddingBottom: "12px",
    cursor: "pointer",
  });

  const gallery = profile.gallery.length ? profile.gallery : baseGallery;
  const activeMedia = gallery[Math.min(activeMediaIndex, gallery.length - 1)] ?? galleryAt(0);
  const mainBg = mediaBg(activeMedia.url);
  const cName = profile.name;
  const cAge = profile.age;
  const cRating = profile.rating;
  const cArea = [profile.store.area?.name ?? profile.store.district, cityLabels[profile.store.cityCode ?? ""] ?? profile.store.city]
    .filter(Boolean)
    .join(", ");
  const cLang = profile.languages.map(labelLanguage).join(" · ");
  const cBorn = profile.born;
  const storeHref = `/stores/${profile.store.slug}`;
  const bookingHref = `/dat-cho?${new URLSearchParams({
    castSlug: profile.slug,
    castName: cName,
    storeSlug: profile.store.slug,
    storeName: profile.store.name,
    area: cArea,
  }).toString()}`;
  const favIcon = isFavorite
    ? "https://img.icons8.com/ios-filled/100/FF3D71/like.png"
    : "https://img.icons8.com/ios/100/D4B26A/like.png";
  const favIconDark = isFavorite
    ? "https://img.icons8.com/ios-filled/100/FF3D71/like.png"
    : "https://img.icons8.com/ios/100/1f1d29/like.png";
  const toggleFav = () => setIsFavorite((value) => !value);
  const tabs = [
    { label: "Giới thiệu", style: tabStyle(activeTab === 0), pick: () => setActiveTab(0) },
    { label: "Đánh giá", style: tabStyle(activeTab === 1), pick: () => setActiveTab(1) },
  ];
  const priceLabel = formatVnd(profile.hourlyRateVnd);
  const priceShort = formatShortVnd(profile.hourlyRateVnd);

  const desktopIntro = useMemo(
    () =>
      activeTab === 0 ? (
        <p style={{ fontSize: "13.5px", lineHeight: "1.7", color: "#3a384a", marginTop: "16px" }}>
          {profile.bio}
        </p>
      ) : (
        <div
          style={{
            marginTop: "16px",
            background: "#fff",
            border: "1px solid #ececec",
            borderRadius: "12px",
            padding: "14px",
            fontSize: "13px",
            lineHeight: 1.6,
            color: "#5b5870",
          }}
        >
          Điểm đánh giá hiện tại là <b style={{ color: "#1f1d29" }}>{cRating}/5</b>. Review chi tiết sẽ chỉ hiển thị sau khi được CMS duyệt.
        </div>
      ),
    [activeTab, cRating, profile.bio],
  );

  return (
    <React.Fragment>
      <div className="block md:hidden cast-profile-mobile-shell">
        <main className="cast-profile-mobile-v2">
          <section className="cast-mobile-hero" style={{ background: `linear-gradient(180deg, rgba(12,12,15,.08), rgba(12,12,15,.82)), ${mainBg}` }}>
            <div className="cast-mobile-topbar">
              <Link href="/danh-sach-cast" className="cast-mobile-icon-link" aria-label="Quay lại danh sách cast">
                ‹
              </Link>
              <button type="button" className="cast-mobile-icon-button" onClick={toggleFav} aria-label="Lưu cast">
                <Image width={100} height={100} src={favIconDark} alt="" />
              </button>
            </div>
            <div className="cast-mobile-hero-copy">
              <div className="cast-mobile-kicker">Cast profile</div>
              <div className="cast-mobile-title-row">
                <h1>
                  {cName} <span>· {cAge} tuổi</span>
                </h1>
                <span className="cast-mobile-approved">Đã duyệt public</span>
              </div>
              <div className="cast-mobile-meta">
                <b>★ {cRating}</b>
                <span>{cArea}</span>
              </div>
              <p>{profile.publicHeadline}</p>
            </div>
            {activeMedia.type === "VIDEO" ? (
              <span className="cast-mobile-play">
                <Image width={100} height={100} src="https://img.icons8.com/ios-filled/100/241a0a/play.png" alt="" />
              </span>
            ) : null}
          </section>

          <section className="cast-mobile-thumb-panel">
            <div className="cast-mobile-thumbs hscroll">
              {gallery.map((media, index) => (
                <button
                  type="button"
                  key={media.id}
                  onClick={() => setActiveMediaIndex(index)}
                  aria-label={media.alt}
                  className={activeMediaIndex === index ? "is-active" : ""}
                  style={{ background: mediaBg(media.url) }}
                >
                  {media.type === "VIDEO" ? (
                    <span>
                      <Image width={100} height={100} src="https://img.icons8.com/ios-filled/100/FFFFFF/play.png" alt="" />
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </section>

          <section className="cast-mobile-panel">
            <div className="cast-mobile-chip-row">
              {profile.languages.map((language) => (
                <span className="cast-mobile-language-chip" key={language}>
                  {labelLanguage(language)}
                </span>
              ))}
              {profile.tags.slice(0, 4).map((tag) => (
                <span className="cast-mobile-tag-chip" key={tag}>
                  {labelTag(tag)}
                </span>
              ))}
            </div>

            <div className="cast-mobile-stats">
              <div className="cast-mobile-stat-card">
                <span>Năm sinh · tuổi tự tính</span>
                <strong>
                  {cBorn} · {cAge}t
                </strong>
              </div>
              <Link href={storeHref} className="cast-mobile-stat-card cast-mobile-store-card">
                <span>Đang làm tại</span>
                <strong>{profile.store.name}</strong>
              </Link>
            </div>

            <p className="cast-mobile-bio">{profile.bio}</p>
          </section>

          <section className="cast-mobile-booking">
            <div>
              <span>Phí cast từ</span>
              <strong>
                {priceShort}
                {profile.hourlyRateVnd ? <small>/giờ</small> : null}
              </strong>
            </div>
            <Link href={bookingHref}>Đặt theo cast</Link>
          </section>
        </main>
      </div>
      <style>{`
        .cast-profile-mobile-v2 {
          min-height: 100vh;
          padding-bottom: calc(154px + env(safe-area-inset-bottom));
          background: #0c0c0f;
          color: #f3f0ea;
          font-family: "Inter", var(--nl-font-sans);
        }

        .cast-mobile-hero {
          position: relative;
          min-height: 430px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 14px 16px 24px;
          background-size: cover !important;
          background-position: center !important;
          overflow: hidden;
          border-bottom: 1px solid rgba(212,178,106,.18) !important;
        }

        .cast-mobile-topbar,
        .cast-mobile-title-row,
        .cast-mobile-meta,
        .cast-mobile-booking,
        .cast-mobile-chip-row {
          display: flex;
          align-items: center;
        }

        .cast-mobile-topbar {
          justify-content: space-between;
          position: relative;
          z-index: 2;
        }

        .cast-mobile-icon-link,
        .cast-mobile-icon-button {
          width: 40px !important;
          height: 40px !important;
          min-height: 40px !important;
          border: 1px solid rgba(244,227,180,.48) !important;
          border-radius: 14px !important;
          background: rgba(12,12,15,.62) !important;
          color: #f8e8b8 !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          backdrop-filter: blur(14px);
          text-decoration: none !important;
          font-size: 28px !important;
          font-weight: 700 !important;
          line-height: 1 !important;
          padding: 0 !important;
        }

        .cast-mobile-icon-button img {
          width: 18px !important;
          height: 18px !important;
          display: block !important;
        }

        .cast-mobile-hero-copy {
          position: relative;
          z-index: 2;
          display: grid;
          gap: 8px;
          max-width: 100%;
        }

        .cast-mobile-kicker {
          color: #f4dfab !important;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .16em;
          text-transform: uppercase;
        }

        .cast-mobile-title-row {
          justify-content: space-between;
          gap: 10px;
        }

        .cast-mobile-title-row h1 {
          min-width: 0;
          color: #fff8ea !important;
          font-size: 28px;
          line-height: 1.08;
          font-weight: 950;
          margin: 0;
        }

        .cast-mobile-title-row h1 span {
          color: #d9cfb6 !important;
          font-size: 15px;
          font-weight: 800;
          white-space: nowrap;
        }

        .cast-mobile-approved {
          flex: none;
          border: 1px solid rgba(89,197,132,.34) !important;
          border-radius: 999px;
          background: rgba(236,253,243,.95) !important;
          color: #157347 !important;
          padding: 6px 10px;
          font-size: 11px;
          font-weight: 950;
          white-space: nowrap;
        }

        .cast-mobile-meta {
          gap: 9px;
          color: #d5cbb2 !important;
          font-size: 13px;
          font-weight: 750;
        }

        .cast-mobile-meta b {
          color: #f1c86b !important;
        }

        .cast-mobile-hero-copy p,
        .cast-mobile-bio {
          margin: 0;
          color: #f2eadb !important;
          font-size: 13.5px;
          line-height: 1.62;
        }

        .cast-mobile-play {
          position: absolute;
          left: 50%;
          top: 46%;
          transform: translate(-50%, -50%);
          z-index: 2;
          width: 58px;
          height: 58px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a) !important;
          box-shadow: 0 16px 36px rgba(0,0,0,.34) !important;
        }

        .cast-mobile-play img {
          width: 24px !important;
          height: 24px !important;
          margin-left: 2px;
        }

        .cast-mobile-thumb-panel {
          margin-top: -22px;
          position: relative;
          z-index: 3;
          padding: 0 16px;
        }

        .cast-mobile-thumbs {
          display: flex;
          gap: 9px;
          overflow-x: auto;
          padding: 0 0 4px;
        }

        .cast-mobile-thumbs button {
          position: relative;
          flex: 0 0 62px;
          width: 62px;
          height: 62px;
          min-height: 62px;
          border: 1px solid rgba(244,227,180,.18) !important;
          border-radius: 14px;
          padding: 0;
          background-size: cover !important;
          background-position: center !important;
          overflow: hidden;
          cursor: pointer;
        }

        .cast-mobile-thumbs button.is-active {
          border-color: #d4b26a !important;
          box-shadow: 0 0 0 2px rgba(212,178,106,.18) !important;
        }

        .cast-mobile-thumbs button span {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          background: rgba(0,0,0,.22);
        }

        .cast-mobile-thumbs img {
          width: 15px !important;
          height: 15px !important;
        }

        .cast-mobile-panel {
          margin: 14px 16px 0;
          padding: 16px;
          border: 1px solid rgba(212,178,106,.2) !important;
          border-radius: 18px;
          background: #141417 !important;
          box-shadow: 0 18px 44px rgba(0,0,0,.22) !important;
        }

        .cast-mobile-chip-row {
          flex-wrap: wrap;
          gap: 8px;
        }

        .cast-mobile-language-chip,
        .cast-mobile-tag-chip {
          border-radius: 999px;
          padding: 7px 10px;
          font-size: 11.5px;
          font-weight: 900;
          line-height: 1;
        }

        .cast-mobile-language-chip {
          background: rgba(212,178,106,.14) !important;
          color: #f4d989 !important;
          border: 1px solid rgba(212,178,106,.2) !important;
        }

        .cast-mobile-tag-chip {
          background: rgba(255,255,255,.075) !important;
          color: #f3e9d1 !important;
          border: 1px solid rgba(255,255,255,.08) !important;
        }

        .cast-mobile-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 15px;
        }

        .cast-mobile-stat-card {
          min-height: 86px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 10px;
          border: 1px solid rgba(212,178,106,.16) !important;
          border-radius: 14px;
          background: rgba(255,255,255,.055) !important;
          color: #f8f3e7 !important;
          padding: 12px;
          text-decoration: none !important;
        }

        .cast-mobile-stat-card span {
          color: #bdb39e !important;
          font-size: 11px;
          line-height: 1.35;
          font-weight: 750;
        }

        .cast-mobile-stat-card strong {
          color: #fff8ea !important;
          font-size: 15px;
          line-height: 1.25;
          font-weight: 950;
        }

        .cast-mobile-store-card strong {
          color: #f4d989 !important;
        }

        .cast-mobile-bio {
          margin-top: 15px;
        }

        .cast-mobile-booking {
          position: sticky;
          z-index: 20;
          bottom: calc(74px + env(safe-area-inset-bottom));
          gap: 14px;
          margin: 14px 16px 0;
          padding: 12px;
          border: 1px solid rgba(212,178,106,.2) !important;
          border-radius: 18px;
          background: rgba(17,17,20,.94) !important;
          backdrop-filter: blur(16px);
          box-shadow: 0 -16px 40px rgba(0,0,0,.28) !important;
        }

        .cast-mobile-booking div {
          flex: none;
          min-width: 62px;
        }

        .cast-mobile-booking span {
          display: block;
          color: #bdb39e !important;
          font-size: 11px;
          font-weight: 800;
        }

        .cast-mobile-booking strong {
          display: block;
          color: #fff8ea !important;
          font-size: 19px;
          line-height: 1.1;
          font-weight: 950;
        }

        .cast-mobile-booking small {
          color: #d8cdb3 !important;
          font-size: 11px;
          margin-left: 2px;
        }

        .cast-mobile-booking a {
          flex: 1;
          min-height: 50px;
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a) !important;
          color: #241a0a !important;
          font-size: 14px;
          font-weight: 950;
          text-decoration: none !important;
        }

        @media (max-width: 370px) {
          .cast-mobile-title-row {
            align-items: flex-start;
            flex-direction: column;
          }

          .cast-mobile-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <div className="hidden md:block">
        <div
          style={{
            width: "100%",
            minWidth: "100%",
            minHeight: "100vh",
            boxSizing: "border-box",
            padding: "0px",
            background: "#e7e5df",
            fontFamily: "'Inter',sans-serif",
          }}
        >
          <div style={{ width: "100%", background: "#f5f4f2", borderRadius: "0px", overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,.10)", color: "#1f1d29" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 34px", background: "#fff", borderBottom: "1px solid #ececec" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "34px" }}>
                <Link href="/" style={{ fontWeight: "800", fontSize: "20px", color: "#6d28d9", textDecoration: "none" }}>
                  nightlife<span style={{ color: "#1f1d29" }}>.hn</span>
                </Link>
                <div style={{ display: "flex", gap: "22px", fontSize: "14px", color: "#5b5870", fontWeight: "500" }}>
                  <Link href="/" className="lk">
                    Trang chủ
                  </Link>
                  <Link href="/danh-sach-quan" className="lk">
                    Tìm quán
                  </Link>
                  <Link href="/danh-sach-cast" className="lk">
                    Cast
                  </Link>
                  <Link href="/xep-hang" className="lk">
                    Bảng xếp hạng
                  </Link>
                  <Link href="/tour" className="lk">
                    Tour
                  </Link>
                  <Link href="/blog" className="lk">
                    Blog
                  </Link>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ fontSize: "13px", color: "#6d28d9", background: "#f1ebff", borderRadius: "20px", padding: "6px 12px", fontWeight: "600" }}>VI · 日本語</div>
                <Link href="/dang-nhap" className="lk" style={{ fontSize: "13px", color: "#5b5870" }}>
                  Đăng nhập
                </Link>
                <Link href="/dang-ky-doi-tac" style={{ fontSize: "13px", fontWeight: "600", color: "#fff", background: "#6d28d9", borderRadius: "22px", padding: "9px 18px", textDecoration: "none" }}>
                  Đăng ký đối tác
                </Link>
              </div>
            </div>
            <div style={{ padding: "18px 34px 0", fontSize: "12.5px", color: "#8a879a" }}>
              <Link href="/" className="lk">
                Trang chủ
              </Link>{" "}
              ›{" "}
              <Link href="/danh-sach-cast" className="lk">
                Cast
              </Link>{" "}
              ›{" "}
              <Link href={storeHref} className="lk">
                {profile.store.name}
              </Link>{" "}
              › <span style={{ color: "#1f1d29" }}>{cName}</span>
            </div>

            <div style={{ display: "flex", gap: "24px", padding: "18px 34px 30px" }}>
              <div style={{ width: "440px", flex: "none" }}>
                <div style={{ height: "440px", borderRadius: "16px", background: mainBg, position: "relative", overflow: "hidden" }}>
                  <span style={{ position: "absolute", left: "14px", top: "14px", borderRadius: "999px", background: "rgba(17,17,20,.78)", color: "#f4e3b4", padding: "7px 12px", fontSize: "12px", fontWeight: 900 }}>
                    {activeMedia.type === "VIDEO" ? "Video" : "Gallery"}
                  </span>
                  {activeMedia.type === "VIDEO" ? (
                    <span
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%,-50%)",
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        background: "rgba(255,255,255,.92)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Image width={100} height={100} src="https://img.icons8.com/ios-filled/100/6D28D9/play.png" style={{ width: "24px", height: "24px", marginLeft: "3px", display: "inline-block" }} alt="" />
                    </span>
                  ) : null}
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                  {gallery.map((media, index) => (
                    <button
                      type="button"
                      className="thumb"
                      key={media.id}
                      onClick={() => setActiveMediaIndex(index)}
                      aria-label={media.alt}
                      style={{
                        flex: "1",
                        height: "74px",
                        borderRadius: "10px",
                        background: mediaBg(media.url),
                        position: "relative",
                        border: activeMediaIndex === index ? "2px solid #d4b26a" : "0",
                        padding: 0,
                        cursor: "pointer",
                      }}
                    >
                      {media.type === "VIDEO" ? (
                        <span style={{ position: "absolute", inset: "0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Image width={100} height={100} src="https://img.icons8.com/ios-filled/100/FFFFFF/play.png" style={{ width: "16px", height: "16px", display: "inline-block" }} alt="" />
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ flex: "1" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <h2 style={{ fontSize: "28px", fontWeight: "800" }}>
                        {cName} <span style={{ fontSize: "18px", color: "#8a879a", fontWeight: "600" }}>· {cAge} tuổi</span>
                      </h2>
                      <span style={{ fontSize: "11px", background: "#ecfdf3", color: "#157347", borderRadius: "14px", padding: "5px 10px", fontWeight: 900 }}>
                        CMS duyệt public
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "8px", fontSize: "13px", color: "#5b5870" }}>
                      <span style={{ color: "#e8923a", fontWeight: "600" }}>★ {cRating}</span> · <span>{cArea}</span>
                    </div>
                    <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                      {profile.languages.map((language) => (
                        <span key={language} style={{ fontSize: "12px", background: "#f1ebff", color: "#6d28d9", borderRadius: "14px", padding: "5px 11px", fontWeight: "600" }}>
                          {labelLanguage(language)}
                        </span>
                      ))}
                      {profile.tags.slice(0, 5).map((tag) => (
                        <span key={tag} style={{ fontSize: "12px", background: "#f3f2f5", color: "#5b5870", borderRadius: "14px", padding: "5px 11px" }}>
                          {labelTag(tag)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span
                    className="btn"
                    onClick={toggleFav}
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      border: "1px solid #ececec",
                      background: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Image width={100} height={100} src={favIcon} style={{ width: "20px", height: "20px", display: "inline-block" }} alt="" />
                  </span>
                </div>

                <div style={{ display: "flex", gap: "26px", borderBottom: "1px solid #ececec", marginTop: "22px", fontSize: "14px" }}>
                  {tabs.map((tab) => (
                    <span key={tab.label} onClick={tab.pick} style={tab.style}>
                      {tab.label}
                    </span>
                  ))}
                </div>

                {desktopIntro}

                <div style={{ marginTop: "16px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px" }}>
                  <div style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", padding: "14px" }}>
                    <div style={{ fontSize: "12px", color: "#8a879a" }}>Năm sinh (tuổi tự tính)</div>
                    <div style={{ fontSize: "16px", fontWeight: "800", marginTop: "3px" }}>
                      {cBorn} <span style={{ fontSize: "12px", color: "#6d28d9" }}>· {cAge} tuổi</span>
                    </div>
                  </div>
                  <div style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", padding: "14px" }}>
                    <div style={{ fontSize: "12px", color: "#8a879a" }}>Ngôn ngữ</div>
                    <div style={{ fontSize: "14px", fontWeight: "600", marginTop: "5px" }}>{cLang}</div>
                  </div>
                  <Link href={storeHref} style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", padding: "14px", color: "#1f1d29", textDecoration: "none" }}>
                    <div style={{ fontSize: "12px", color: "#8a879a" }}>Đang làm tại</div>
                    <div style={{ fontSize: "14px", fontWeight: "700", marginTop: "5px" }}>{profile.store.name}</div>
                  </Link>
                </div>

                <div
                  style={{
                    marginTop: "20px",
                    background: "#fff",
                    border: "1px solid #ececec",
                    borderRadius: "16px",
                    padding: "18px",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    boxShadow: "0 6px 20px rgba(40,20,60,.06)",
                  }}
                >
                  <div style={{ flex: "1" }}>
                    <div style={{ fontSize: "13px", color: "#8a879a" }}>Đặt theo cast tại</div>
                    <div style={{ fontSize: "16px", fontWeight: "700" }}>
                      <Link href={storeHref} style={{ color: "#1f1d29", textDecoration: "none" }}>
                        {profile.store.name}
                      </Link>{" "}
                      · {cArea}
                    </div>
                    <div style={{ fontSize: "12px", color: "#8a879a", marginTop: "3px" }}>
                      Phí cast từ {priceLabel} / giờ · Admin xác nhận lịch
                    </div>
                  </div>
                  <Link
                    href={bookingHref}
                    className="btn"
                    style={{
                      background: "#6d28d9",
                      color: "#fff",
                      borderRadius: "11px",
                      padding: "14px 26px",
                      fontWeight: "700",
                      fontSize: "14px",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    Đặt theo cast
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: "#fff", borderTop: "1px solid #ececec", padding: "60px 0 20px", fontFamily: "'Inter',sans-serif", color: "#5b5870" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 34px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "40px", marginBottom: "60px" }}>
              <div style={{ maxWidth: "300px" }}>
                <Link href="/" style={{ fontWeight: "800", fontSize: "28px", color: "#6d28d9", textDecoration: "none" }}>
                  nightlife<span style={{ color: "#1f1d29" }}>.hn</span>
                </Link>
                <div style={{ fontSize: "14px", color: "#5b5870", marginTop: "16px", lineHeight: "1.6" }}>Khám phá cuộc sống về đêm tại Việt Nam</div>
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <a href="#" style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#f5f4f2", display: "flex", alignItems: "center", justifyContent: "center", color: "#5b5870" }}>
                    <Image width={100} height={100} src="https://img.icons8.com/ios-filled/100/5b5870/facebook-new.png" style={{ width: "18px", height: "18px" }} alt="FB" />
                  </a>
                  <a href="#" style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#f5f4f2", display: "flex", alignItems: "center", justifyContent: "center", color: "#5b5870" }}>
                    <Image width={100} height={100} src="https://img.icons8.com/ios-filled/100/5b5870/tiktok.png" style={{ width: "18px", height: "18px" }} alt="TikTok" />
                  </a>
                  <a href="#" style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#f5f4f2", display: "flex", alignItems: "center", justifyContent: "center", color: "#5b5870" }}>
                    <Image width={100} height={100} src="https://img.icons8.com/ios-filled/100/5b5870/instagram-new.png" style={{ width: "18px", height: "18px" }} alt="IG" />
                  </a>
                  <a href="#" style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#f5f4f2", display: "flex", alignItems: "center", justifyContent: "center", color: "#5b5870" }}>
                    <Image width={100} height={100} src="https://img.icons8.com/ios-filled/100/5b5870/youtube-play.png" style={{ width: "18px", height: "18px" }} alt="YT" />
                  </a>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", flex: "1", maxWidth: "600px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", fontSize: "14px", fontWeight: "500" }}>
                  <Link href="/danh-sach-quan" className="lk" style={{ color: "#1f1d29" }}>
                    Tìm quán
                  </Link>
                  <Link href="/uu-dai" className="lk" style={{ color: "#1f1d29" }}>
                    Ưu đãi
                  </Link>
                  <Link href="/blog" className="lk" style={{ color: "#1f1d29" }}>
                    Blog
                  </Link>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", fontSize: "14px", fontWeight: "500" }}>
                  <Link href="/danh-sach-cast" className="lk" style={{ color: "#1f1d29" }}>
                    Cast
                  </Link>
                  <Link href="/tour" className="lk" style={{ color: "#1f1d29" }}>
                    Tour
                  </Link>
                  <Link href="/dang-ky-doi-tac" className="lk" style={{ color: "#1f1d29" }}>
                    Đăng ký đối tác
                  </Link>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", fontSize: "14px", fontWeight: "500" }}>
                  <Link href="/xep-hang" className="lk" style={{ color: "#1f1d29" }}>
                    Bảng xếp hạng
                  </Link>
                  <Link href="/legal" className="lk" style={{ color: "#1f1d29" }}>
                    Chính sách BM
                  </Link>
                  <Link href="/legal" className="lk" style={{ color: "#1f1d29" }}>
                    Điều khoản DV
                  </Link>
                </div>
              </div>
            </div>
            <div style={{ background: "#fef1f2", border: "1px solid #fecdd3", borderRadius: "12px", padding: "16px 20px", color: "#be123c", fontSize: "13.5px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "40px", textAlign: "center" }}>
              <Image width={100} height={100} src="https://img.icons8.com/color/96/high-importance--v1.png" style={{ width: "20px", height: "20px" }} alt="!" />
              <span>
                <b style={{ fontWeight: "700" }}>Cảnh báo:</b> Website này chỉ dành cho người <b style={{ fontWeight: "700" }}>từ 18 tuổi trở lên</b>. Bằng cách tiếp tục sử dụng, bạn xác nhận đã đủ điều kiện độ tuổi theo quy định pháp luật Việt Nam.
              </span>
            </div>
            <div style={{ borderTop: "1px solid #ececec", paddingTop: "24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "12px", color: "#9a98a6", position: "relative" }}>
              <div>© 2026 Nightlife Hà Nội. Bảo lưu mọi quyền.</div>
              <div>v2.0.0 • Nightlife Platform</div>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                style={{
                  position: "absolute",
                  right: "0",
                  top: "24px",
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "#fb4b81",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(251,75,129,.3)",
                  border: 0,
                }}
              >
                <Image width={100} height={100} src="https://img.icons8.com/ios-filled/100/ffffff/up.png" style={{ width: "24px", height: "24px" }} alt="Top" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
