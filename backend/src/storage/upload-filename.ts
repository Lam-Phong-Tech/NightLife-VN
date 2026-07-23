import type { SupportedUploadMimeType } from './upload-policy';

const INVISIBLE_CHARACTERS = /[\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff]/g;
const WINDOWS_RESERVED_CHARACTERS = /[<>:"/\\|?*]/g;
const MAX_ORIGINAL_NAME_LENGTH = 220;

const extensionsByMimeType: Record<SupportedUploadMimeType, readonly string[]> =
  {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/webp': ['webp'],
    'image/gif': ['gif'],
    'image/svg+xml': ['svg'],
    'video/mp4': ['mp4'],
    'video/webm': ['webm'],
    'application/pdf': ['pdf'],
  };

const baseName = (value: string) => value.split(/[\\/]/).pop() ?? '';

const removeControlCharacters = (value: string) =>
  Array.from(value)
    .filter((character) => {
      const codePoint = character.codePointAt(0) ?? 0;
      return !(
        (codePoint >= 0 && codePoint <= 31) ||
        (codePoint >= 127 && codePoint <= 159)
      );
    })
    .join('');

const splitExtension = (value: string) => {
  const lastDot = value.lastIndexOf('.');
  if (lastDot <= 0 || lastDot === value.length - 1) {
    return { stem: value, extension: '' };
  }
  return {
    stem: value.slice(0, lastDot),
    extension: value.slice(lastDot + 1).toLowerCase(),
  };
};

const trimFileNameLength = (stem: string, extension: string) => {
  const extensionLength = extension ? extension.length + 1 : 0;
  const maxStemLength = Math.max(1, MAX_ORIGINAL_NAME_LENGTH - extensionLength);
  return stem.slice(0, maxStemLength);
};

export type NormalizedUploadFileName = {
  originalName: string;
  error: string | null;
};

export const normalizeUploadFileName = (
  rawName: string | undefined,
  detectedMimeType: SupportedUploadMimeType,
  storageKey: string,
): NormalizedUploadFileName => {
  const allowedExtensions = extensionsByMimeType[detectedMimeType];
  const canonicalExtension = allowedExtensions[0];
  const cleaned = removeControlCharacters(baseName(rawName ?? ''))
    .normalize('NFC')
    .replace(INVISIBLE_CHARACTERS, '')
    .replace(WINDOWS_RESERVED_CHARACTERS, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[. ]+$/g, '');

  const { stem: rawStem, extension } = splitExtension(cleaned);
  const stem = rawStem.trim().replace(/^[. ]+/g, '');
  const fallbackStem = `media-${storageKey.slice(0, 12) || 'upload'}`;

  if (extension && !allowedExtensions.includes(extension)) {
    return {
      originalName: '',
      error: `Phần mở rộng .${extension} không khớp với nội dung file ${detectedMimeType}.`,
    };
  }

  const finalStem = trimFileNameLength(
    stem || fallbackStem,
    canonicalExtension,
  );
  return {
    originalName: `${finalStem}.${extension || canonicalExtension}`,
    error: null,
  };
};
