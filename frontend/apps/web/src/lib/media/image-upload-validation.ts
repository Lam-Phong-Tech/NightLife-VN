export const MAX_STORE_IMAGE_SIZE_BYTES = 15 * 1024 * 1024;
export const MAX_TOUR_COVER_IMAGE_SIZE_BYTES = 15 * 1024 * 1024;
export const MAX_ADMIN_VIDEO_SIZE_BYTES = 25 * 1024 * 1024;
export const MAX_APPEARANCE_ICON_SIZE_BYTES = 30 * 1024;
export const MAX_APPEARANCE_LOGO_SIZE_BYTES = 200 * 1024;

export const STORE_IMAGE_ACCEPT =
  'image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif';
export const TOUR_COVER_IMAGE_ACCEPT = STORE_IMAGE_ACCEPT;
export const ADMIN_VIDEO_ACCEPT = 'video/mp4,video/webm,.mp4,.webm';
export const CONTENT_IMAGE_ACCEPT =
  'image/jpeg,image/png,.jpg,.jpeg,.png';
export const APPEARANCE_IMAGE_ACCEPT =
  'image/png,image/svg+xml,.png,.svg';

type FileFormatPolicy = {
  mimeTypes: ReadonlySet<string>;
  extensionsByMimeType: Readonly<Record<string, readonly string[]>>;
};

const rasterImagePolicy: FileFormatPolicy = {
  mimeTypes: new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ]),
  extensionsByMimeType: {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/webp': ['webp'],
    'image/gif': ['gif'],
  },
};

const contentImagePolicy: FileFormatPolicy = {
  mimeTypes: new Set(['image/jpeg', 'image/png']),
  extensionsByMimeType: {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
  },
};

const videoPolicy: FileFormatPolicy = {
  mimeTypes: new Set(['video/mp4', 'video/webm']),
  extensionsByMimeType: {
    'video/mp4': ['mp4'],
    'video/webm': ['webm'],
  },
};

const appearancePolicy: FileFormatPolicy = {
  mimeTypes: new Set(['image/png', 'image/svg+xml']),
  extensionsByMimeType: {
    'image/png': ['png'],
    'image/svg+xml': ['svg'],
  },
};

const fileLabel = (file: File) => file.name.trim() || 'file chưa có tên';

const fileExtension = (fileName: string) => {
  const normalizedName = fileName.trim().toLowerCase();
  const lastDot = normalizedName.lastIndexOf('.');
  if (lastDot <= 0 || lastDot === normalizedName.length - 1) return '';
  return normalizedName.slice(lastDot + 1);
};

const acceptedExtensions = (policy: FileFormatPolicy) =>
  Array.from(
    new Set(Object.values(policy.extensionsByMimeType).flat()),
  );

const getFormatValidationError = (
  file: File,
  policy: FileFormatPolicy,
  acceptedLabel: string,
) => {
  const declaredMimeType = file.type.trim().toLowerCase();
  const mimeType =
    declaredMimeType === 'application/octet-stream' ? '' : declaredMimeType;
  const extension = fileExtension(file.name);
  const allowedExtensions = acceptedExtensions(policy);

  if (mimeType && !policy.mimeTypes.has(mimeType)) {
    return `File "${fileLabel(file)}" không đúng định dạng. Chỉ chấp nhận ${acceptedLabel}.`;
  }
  if (extension && !allowedExtensions.includes(extension)) {
    return `File "${fileLabel(file)}" không đúng định dạng. Chỉ chấp nhận ${acceptedLabel}.`;
  }
  if (!mimeType && !extension) {
    return `Không xác định được định dạng của "${fileLabel(file)}".`;
  }
  if (
    mimeType &&
    extension &&
    !policy.extensionsByMimeType[mimeType]?.includes(extension)
  ) {
    return `Tên file "${fileLabel(file)}" không khớp với định dạng ${mimeType}.`;
  }
  return null;
};

const getSizeValidationError = (
  file: File,
  maxSizeBytes: number,
  maxSizeLabel: string,
) => {
  if (file.size <= 0) {
    return `File "${fileLabel(file)}" là file rỗng.`;
  }
  if (file.size > maxSizeBytes) {
    return `File "${fileLabel(file)}" vượt quá dung lượng ${maxSizeLabel}.`;
  }
  return null;
};

export const getStoreImageValidationError = (file: File): string | null =>
  getFormatValidationError(
    file,
    rasterImagePolicy,
    'JPG, JPEG, PNG, WebP hoặc GIF',
  ) ??
  getSizeValidationError(file, MAX_STORE_IMAGE_SIZE_BYTES, '15MB');

export const getTourCoverImageValidationError = (
  file: File,
): string | null =>
  getFormatValidationError(
    file,
    rasterImagePolicy,
    'JPG, JPEG, PNG, WebP hoặc GIF; không chấp nhận video',
  ) ??
  getSizeValidationError(file, MAX_TOUR_COVER_IMAGE_SIZE_BYTES, '15MB');

export const getContentImageValidationError = (file: File): string | null =>
  getFormatValidationError(file, contentImagePolicy, 'JPG, JPEG hoặc PNG') ??
  getSizeValidationError(file, MAX_STORE_IMAGE_SIZE_BYTES, '15MB');

export const getAdminVideoValidationError = (file: File): string | null =>
  getFormatValidationError(file, videoPolicy, 'MP4 hoặc WebM') ??
  getSizeValidationError(file, MAX_ADMIN_VIDEO_SIZE_BYTES, '25MB');

export const getAppearanceImageValidationError = (
  file: File,
  kind: 'icon' | 'logo',
): string | null => {
  const formatError = getFormatValidationError(
    file,
    appearancePolicy,
    'PNG hoặc SVG',
  );
  if (formatError) return formatError;
  return kind === 'icon'
    ? getSizeValidationError(
        file,
        MAX_APPEARANCE_ICON_SIZE_BYTES,
        '30KB',
      )
    : getSizeValidationError(
        file,
        MAX_APPEARANCE_LOGO_SIZE_BYTES,
        '200KB',
      );
};
