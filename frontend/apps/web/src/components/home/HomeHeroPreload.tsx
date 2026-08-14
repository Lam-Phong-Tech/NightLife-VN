import type { CmsContentItem } from "@/lib/api/content";
import { buildHomeHeroPreload } from "@/lib/home-hero";

export function HomeHeroPreload({ banner }: { banner: CmsContentItem | null }) {
  const preload = buildHomeHeroPreload(banner);
  if (!preload) return null;

  return (
    <link
      rel="preload"
      as="image"
      href={preload.href}
      type={"type" in preload ? preload.type : undefined}
      imageSrcSet={"imageSrcSet" in preload ? preload.imageSrcSet : undefined}
      imageSizes={"imageSizes" in preload ? preload.imageSizes : undefined}
      fetchPriority="high"
    />
  );
}
