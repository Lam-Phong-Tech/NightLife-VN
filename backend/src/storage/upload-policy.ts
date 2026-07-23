export const MAX_IMAGE_UPLOAD_SIZE_BYTES = 15 * 1024 * 1024;
export const MAX_VIDEO_UPLOAD_SIZE_BYTES = 25 * 1024 * 1024;
export const MAX_DOCUMENT_UPLOAD_SIZE_BYTES = 25 * 1024 * 1024;
export const MAX_APPEARANCE_ICON_SIZE_BYTES = 30 * 1024;
export const MAX_APPEARANCE_LOGO_SIZE_BYTES = 200 * 1024;

export const uploadMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
  'application/pdf',
] as const;

export type SupportedUploadMimeType = (typeof uploadMimeTypes)[number];

type UploadPolicy = {
  allowedMimeTypes: readonly SupportedUploadMimeType[];
  maxSizeBytes: number;
};

const rasterImageMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

const contentImageMimeTypes = ['image/jpeg', 'image/png'] as const;
const videoMimeTypes = ['video/mp4', 'video/webm'] as const;
const evidenceMimeTypes = [...rasterImageMimeTypes, 'application/pdf'] as const;

const imagePolicy: UploadPolicy = {
  allowedMimeTypes: rasterImageMimeTypes,
  maxSizeBytes: MAX_IMAGE_UPLOAD_SIZE_BYTES,
};

const videoPolicy: UploadPolicy = {
  allowedMimeTypes: videoMimeTypes,
  maxSizeBytes: MAX_VIDEO_UPLOAD_SIZE_BYTES,
};

const contentImagePolicy: UploadPolicy = {
  allowedMimeTypes: contentImageMimeTypes,
  maxSizeBytes: MAX_IMAGE_UPLOAD_SIZE_BYTES,
};

const uploadPolicies: Record<string, UploadPolicy> = {
  'store-hero': imagePolicy,
  'store-cover': imagePolicy,
  STORE_COVER: imagePolicy,
  COVER_IMAGE: imagePolicy,
  STORE_GALLERY: imagePolicy,
  STORE_MENU_ITEM: imagePolicy,
  STORE_VIDEO: videoPolicy,
  CAST_AVATAR: imagePolicy,
  CAST_PHOTO: imagePolicy,
  CAST_VIDEO: videoPolicy,
  TOUR_COVER: imagePolicy,
  BANNER_GLOBAL: contentImagePolicy,
  BLOG_COVER: contentImagePolicy,
  PARTNER_STORE_COVER: imagePolicy,
  PARTNER_STORE_GALLERY: imagePolicy,
  PARTNER_MENU_ITEM: imagePolicy,
  PARTNER_STORE_VIDEO: videoPolicy,
  PARTNER_CAST_IMAGE: imagePolicy,
  PARTNER_CAST_VIDEO: videoPolicy,
  'bill-evidence': {
    allowedMimeTypes: evidenceMimeTypes,
    maxSizeBytes: MAX_DOCUMENT_UPLOAD_SIZE_BYTES,
  },
  APPEARANCE_ICON: {
    allowedMimeTypes: ['image/png', 'image/svg+xml'],
    maxSizeBytes: MAX_APPEARANCE_ICON_SIZE_BYTES,
  },
  APPEARANCE_LOGO: {
    allowedMimeTypes: ['image/png', 'image/svg+xml'],
    maxSizeBytes: MAX_APPEARANCE_LOGO_SIZE_BYTES,
  },
};

export const supportedUploadPurposes = new Set(Object.keys(uploadPolicies));

export const getUploadPolicy = (purpose?: string): UploadPolicy | null => {
  const normalizedPurpose = purpose?.trim();
  if (!normalizedPurpose) return null;
  return uploadPolicies[normalizedPurpose] ?? null;
};

export const humanReadableUploadSize = (sizeBytes: number) => {
  if (sizeBytes < 1024 * 1024) {
    return `${Math.round(sizeBytes / 1024)}KB`;
  }
  return `${Math.round(sizeBytes / (1024 * 1024))}MB`;
};
