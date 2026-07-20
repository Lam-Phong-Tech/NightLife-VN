import { resolveClientUrl } from "@/lib/api/client";

type VideoPreviewQuality = "default" | "mqdefault" | "hqdefault" | "sddefault" | "maxresdefault";

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const cleanString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : null;

const resolveImageUrl = (value: unknown) => {
  const url = cleanString(value);
  return url ? (resolveClientUrl(url) ?? url) : null;
};

export function getYoutubeVideoId(value?: string | null) {
  if (!value) return "";

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") return url.pathname.split("/").filter(Boolean)[0] ?? "";

    if (host.includes("youtube.com")) {
      const watchId = url.searchParams.get("v");
      if (watchId) return watchId;

      const parts = url.pathname.split("/").filter(Boolean);
      const idIndex = parts.findIndex((part) => ["embed", "shorts", "live", "v"].includes(part));
      if (idIndex >= 0) return parts[idIndex + 1] ?? "";
    }
  } catch {
    const match = value.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/|\/v\/)([A-Za-z0-9_-]{6,})/);
    return match?.[1] ?? "";
  }

  return "";
}

export function getYoutubeThumbnailUrl(value?: string | null, quality: VideoPreviewQuality = "hqdefault") {
  const id = getYoutubeVideoId(value);
  return id ? `https://img.youtube.com/vi/${id}/${quality}.jpg` : null;
}

export function getVideoPreviewUrl(video: unknown, quality: VideoPreviewQuality = "hqdefault") {
  const record = asRecord(video);
  if (!record) return null;

  const metadata = asRecord(record.metadata) ?? {};
  const store = asRecord(record.store) ?? {};

  const directPreview =
    resolveImageUrl(record.thumbnailUrl) ??
    resolveImageUrl(record.previewUrl) ??
    resolveImageUrl(record.previewImageUrl) ??
    resolveImageUrl(record.posterUrl) ??
    resolveImageUrl(record.poster) ??
    resolveImageUrl(record.imageUrl) ??
    resolveImageUrl(metadata.thumbnailUrl) ??
    resolveImageUrl(metadata.previewUrl) ??
    resolveImageUrl(metadata.posterUrl);

  if (directPreview) return directPreview;

  const videoUrl =
    cleanString(record.url) ??
    cleanString(record.videoUrl) ??
    cleanString(record.sourceUrl) ??
    cleanString(record.mediaUrl) ??
    cleanString(record.youtubeUrl) ??
    cleanString(metadata.url) ??
    cleanString(metadata.videoUrl) ??
    cleanString(metadata.youtubeUrl);

  const youtubePreview = getYoutubeThumbnailUrl(videoUrl, quality);
  if (youtubePreview) return youtubePreview;

  return (
    resolveImageUrl(record.storeThumbnailUrl) ??
    resolveImageUrl(store.thumbnailUrl) ??
    resolveImageUrl(metadata.storeThumbnailUrl)
  );
}
