import Link from "next/link";
import type { RelatedCast } from "@/lib/api/cast-detail";
import { labelLanguage, mediaBg } from "./cast-profile.helpers";
import { recommendationLabel } from "./cast-profile.recommendations";
import type { CastProfile, CastProfileTrack } from "./cast-profile.types";

type CastStoreSidebarProps = {
  profile: CastProfile;
  area: string;
  storeHref: string;
  relatedCasts: RelatedCast[];
  personalizationBadges: string[];
  onTrack?: CastProfileTrack;
};

export function CastStoreSidebar({
  profile,
  area,
  storeHref,
  relatedCasts,
  personalizationBadges,
  onTrack,
}: CastStoreSidebarProps) {
  return (
    <aside className="cast-store-sidebar" data-testid="cast-store-sidebar">
      <h2>Quán đang làm</h2>
      <p>
        <strong style={{ color: "#1f1d29" }}>{profile.store.name}</strong>
        <br />
        {area || "Chưa cập nhật khu vực"}
      </p>
      <Link href={storeHref} className="cast-store-action" onClick={() => onTrack?.("store", { surface: "sidebar" })}>
        Xem quán
      </Link>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
        {personalizationBadges.map((badge) => (
          <span className="cast-chip tag" key={badge} style={{ background: "#f3f2f5", color: "#5b5870", border: 0 }}>
            {badge}
          </span>
        ))}
      </div>

      <section className="cast-related-section" style={{ marginTop: 22 }}>
        <h2>Gợi ý phù hợp</h2>
        <div className="cast-related-list">
          {relatedCasts.length ? (
            relatedCasts.map((cast) => (
              <Link
                key={cast.id}
                className="cast-related-card"
                href={`/casts/${cast.slug}`}
                onClick={() => onTrack?.("related", { surface: "sidebar", relatedCastSlug: cast.slug })}
              >
                <span
                  className="cast-related-media"
                  style={{
                    background: mediaBg(
                      cast.thumbnailUrl || "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=240&q=70",
                    ),
                  }}
                />
                <span>
                  <strong>{cast.publicAlias ?? cast.name ?? cast.stageName}</strong>
                  <small>{recommendationLabel(cast)}</small>
                  <span>{cast.languages.slice(0, 2).map(labelLanguage).join(" - ")}</span>
                </span>
              </Link>
            ))
          ) : (
            <p style={{ marginBottom: 0 }}>Chưa có cast gợi ý cùng quán/khu vực.</p>
          )}
        </div>
      </section>
    </aside>
  );
}
