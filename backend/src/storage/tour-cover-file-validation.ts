export const MAX_TOUR_COVER_SIZE_BYTES = 15 * 1024 * 1024;

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

type TourCoverFileMetadata = {
  originalname: string;
  mimetype: string;
  size: number;
};

const hasBytes = (bytes: Uint8Array, expected: number[], offset = 0) =>
  expected.every((value, index) => bytes[offset + index] === value);

export const detectTourCoverImageMimeType = (
  bytes: Uint8Array,
): string | null => {
  if (hasBytes(bytes, [0xff, 0xd8, 0xff])) {
    return 'image/jpeg';
  }

  if (hasBytes(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return 'image/png';
  }

  const ascii = Buffer.from(bytes).toString('ascii');
  if (ascii.startsWith('GIF87a') || ascii.startsWith('GIF89a')) {
    return 'image/gif';
  }

  if (
    hasBytes(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    hasBytes(bytes, [0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return 'image/webp';
  }

  return null;
};

export const getTourCoverFileValidationError = (
  file: TourCoverFileMetadata,
  headerBytes: Uint8Array,
): string | null => {
  const normalizedName = file.originalname.trim().toLowerCase();
  const normalizedMimeType = file.mimetype.trim().toLowerCase();

  if (
    !allowedExtensions.some((extension) =>
      normalizedName.endsWith(extension),
    ) ||
    !allowedMimeTypes.has(normalizedMimeType)
  ) {
    return 'Ảnh bìa tour chỉ chấp nhận JPG, JPEG, PNG, WebP hoặc GIF; không chấp nhận video.';
  }

  if (file.size <= 0) {
    return 'Ảnh bìa tour không được là file rỗng.';
  }

  if (file.size > MAX_TOUR_COVER_SIZE_BYTES) {
    return 'Ảnh bìa tour không được vượt quá 15MB.';
  }

  const detectedMimeType = detectTourCoverImageMimeType(headerBytes);
  if (!detectedMimeType || detectedMimeType !== normalizedMimeType) {
    return 'Nội dung file ảnh bìa không hợp lệ hoặc không khớp với định dạng đã khai báo.';
  }

  return null;
};
