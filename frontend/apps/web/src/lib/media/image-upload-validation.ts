export const MAX_STORE_IMAGE_SIZE_BYTES = 15 * 1024 * 1024;
export const MAX_TOUR_COVER_IMAGE_SIZE_BYTES = 15 * 1024 * 1024;

export const STORE_IMAGE_ACCEPT =
  'image/jpeg,image/png,image/webp,image/gif,image/svg+xml,.jpg,.jpeg,.png,.webp,.gif,.svg';
export const TOUR_COVER_IMAGE_ACCEPT =
  'image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif';

const allowedImageMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

const allowedImageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
const allowedTourCoverMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);
const allowedTourCoverExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

const hasAllowedExtension = (fileName: string, allowedExtensions: string[]) => {
  const normalizedName = fileName.trim().toLowerCase();
  return allowedExtensions.some((extension) => normalizedName.endsWith(extension));
};

export const getStoreImageValidationError = (file: File): string | null => {
  const mimeType = file.type.trim().toLowerCase();
  const hasAllowedFormat = mimeType
    ? allowedImageMimeTypes.has(mimeType)
    : hasAllowedExtension(file.name, allowedImageExtensions);

  if (!hasAllowedFormat) {
    return `Ảnh "${file.name}" không đúng định dạng. Chỉ chấp nhận JPG, JPEG, PNG, WebP, GIF hoặc SVG.`;
  }

  if (file.size > MAX_STORE_IMAGE_SIZE_BYTES) {
    return `Ảnh "${file.name}" vượt quá dung lượng 15MB.`;
  }

  return null;
};

export const getTourCoverImageValidationError = (file: File): string | null => {
  const mimeType = file.type.trim().toLowerCase();
  const hasAllowedMimeType = !mimeType || allowedTourCoverMimeTypes.has(mimeType);
  const hasAllowedFileExtension = hasAllowedExtension(
    file.name,
    allowedTourCoverExtensions,
  );

  if (!hasAllowedMimeType || !hasAllowedFileExtension) {
    return `Ảnh bìa "${file.name}" không đúng định dạng. Chỉ chấp nhận JPG, JPEG, PNG, WebP hoặc GIF; không chấp nhận video.`;
  }

  if (file.size <= 0) {
    return `Ảnh bìa "${file.name}" là file rỗng.`;
  }

  if (file.size > MAX_TOUR_COVER_IMAGE_SIZE_BYTES) {
    return `Ảnh bìa "${file.name}" vượt quá dung lượng 15MB.`;
  }

  return null;
};
