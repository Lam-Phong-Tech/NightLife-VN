export const MAX_STORE_IMAGE_SIZE_BYTES = 15 * 1024 * 1024;

export const STORE_IMAGE_ACCEPT =
  'image/jpeg,image/png,image/webp,image/gif,image/svg+xml,.jpg,.jpeg,.png,.webp,.gif,.svg';

const allowedImageMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

const allowedImageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];

const hasAllowedImageExtension = (fileName: string) => {
  const normalizedName = fileName.trim().toLowerCase();
  return allowedImageExtensions.some((extension) => normalizedName.endsWith(extension));
};

export const getStoreImageValidationError = (file: File): string | null => {
  const mimeType = file.type.trim().toLowerCase();
  const hasAllowedFormat = mimeType
    ? allowedImageMimeTypes.has(mimeType)
    : hasAllowedImageExtension(file.name);

  if (!hasAllowedFormat) {
    return `Ảnh "${file.name}" không đúng định dạng. Chỉ chấp nhận JPG, JPEG, PNG, WebP, GIF hoặc SVG.`;
  }

  if (file.size > MAX_STORE_IMAGE_SIZE_BYTES) {
    return `Ảnh "${file.name}" vượt quá dung lượng 15MB.`;
  }

  return null;
};
