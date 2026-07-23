import { detectTourCoverImageMimeType } from '../storage/tour-cover-file-validation';

const videoExtensions = /\.(?:mp4|webm|mov|avi|mkv|m4v|ogv)$/i;
const supportedStoredImageMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

type StoredTourCoverMedia = {
  type: string;
  mimeType: string;
};

export const isSupportedStoredTourCover = (
  media: StoredTourCoverMedia | null,
) =>
  media?.type === 'IMAGE' &&
  supportedStoredImageMimeTypes.has(media.mimeType.toLowerCase());

export const getTourCoverStorageKey = (value: string): string | null => {
  try {
    const parsed = new URL(value, 'https://nightlife.local');
    const match = parsed.pathname.match(
      /\/storage\/(?:public|files)\/([^/]+)$/i,
    );
    return match?.[1] ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
};

export const getTourCoverUrlValidationError = (
  value: string | undefined,
): string | null => {
  if (!value?.trim()) {
    return null;
  }

  const trimmed = value.trim();
  if (/^data:/i.test(trimmed)) {
    const match = trimmed.match(
      /^data:(image\/(?:jpeg|png|webp|gif));base64,([a-z0-9+/=\s]+)$/i,
    );
    if (!match?.[1] || !match[2]) {
      return 'Ảnh bìa tour phải là dữ liệu ảnh JPG, PNG, WebP hoặc GIF; không chấp nhận video.';
    }

    const declaredMimeType = match[1].toLowerCase();
    const bytes = Buffer.from(match[2].replace(/\s/g, ''), 'base64');
    return detectTourCoverImageMimeType(bytes.subarray(0, 12)) ===
      declaredMimeType
      ? null
      : 'Nội dung dữ liệu ảnh bìa tour không hợp lệ hoặc không khớp định dạng.';
  }

  try {
    const isRelativeUrl = trimmed.startsWith('/');
    const parsed = new URL(trimmed, 'https://nightlife.local');
    if (!isRelativeUrl && !['http:', 'https:'].includes(parsed.protocol)) {
      return 'Đường dẫn ảnh bìa tour phải dùng http://, https:// hoặc đường dẫn nội bộ /.';
    }

    const hostname = parsed.hostname.toLowerCase();
    const isVideoProvider =
      hostname === 'youtu.be' ||
      hostname === 'youtube.com' ||
      hostname.endsWith('.youtube.com') ||
      hostname === 'vimeo.com' ||
      hostname.endsWith('.vimeo.com');

    if (isVideoProvider || videoExtensions.test(parsed.pathname)) {
      return 'Ảnh bìa tour không chấp nhận đường dẫn video, YouTube hoặc Vimeo.';
    }

    return null;
  } catch {
    return 'Đường dẫn ảnh bìa tour không hợp lệ.';
  }
};
