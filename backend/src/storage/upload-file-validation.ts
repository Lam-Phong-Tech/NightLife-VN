import { open, readFile } from 'node:fs/promises';
import {
  getUploadPolicy,
  humanReadableUploadSize,
  type SupportedUploadMimeType,
} from './upload-policy';
import { normalizeUploadFileName } from './upload-filename';

type UploadFileMetadata = {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
};

type ValidatedUploadFile = {
  mimeType: SupportedUploadMimeType;
  originalName: string;
};

const hasBytes = (bytes: Uint8Array, expected: number[], offset = 0) =>
  expected.every((value, index) => bytes[offset + index] === value);

const detectBinaryMimeType = (
  bytes: Uint8Array,
): SupportedUploadMimeType | null => {
  if (hasBytes(bytes, [0xff, 0xd8, 0xff])) return 'image/jpeg';
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
  if (hasBytes(bytes, [0x1a, 0x45, 0xdf, 0xa3])) return 'video/webm';
  if (
    bytes.length >= 12 &&
    Buffer.from(bytes.subarray(4, 8)).toString('ascii') === 'ftyp'
  ) {
    return 'video/mp4';
  }
  if (ascii.startsWith('%PDF-')) return 'application/pdf';
  return null;
};

const looksLikeSvg = (source: string) =>
  /^(?:\uFEFF|\s)*(?:<\?xml[\s\S]*?\?>\s*)?<svg(?:\s|>)/i.test(source);

const getUnsafeSvgReason = (source: string): string | null => {
  if (!looksLikeSvg(source)) return 'Nội dung không phải file SVG.';
  if (/<!DOCTYPE|<!ENTITY/i.test(source)) {
    return 'SVG không được chứa DOCTYPE hoặc ENTITY.';
  }
  if (
    /<(?:script|foreignObject|iframe|object|embed|audio|video)\b/i.test(source)
  ) {
    return 'SVG chứa phần tử không an toàn.';
  }
  if (/\son[a-z]+\s*=/i.test(source)) {
    return 'SVG chứa event handler không an toàn.';
  }
  if (
    /(?:href|xlink:href)\s*=\s*["']\s*(?:javascript:|https?:|\/\/|data:text\/html)/i.test(
      source,
    )
  ) {
    return 'SVG chứa liên kết ngoài hoặc JavaScript không an toàn.';
  }
  if (
    /@import|expression\s*\(|url\s*\(\s*["']?\s*(?:https?:|\/\/|javascript:)/i.test(
      source,
    )
  ) {
    return 'SVG chứa CSS hoặc tài nguyên ngoài không an toàn.';
  }
  return null;
};

const readHeader = async (path: string) => {
  const header = Buffer.alloc(4096);
  const fileHandle = await open(path, 'r');
  try {
    const { bytesRead } = await fileHandle.read(header, 0, header.length, 0);
    return header.subarray(0, bytesRead);
  } finally {
    await fileHandle.close();
  }
};

export const validateUploadedFile = async (
  file: UploadFileMetadata,
  purpose?: string,
): Promise<ValidatedUploadFile> => {
  const policy = getUploadPolicy(purpose);
  if (!policy) {
    throw new Error('Mục đích tải file không hợp lệ hoặc chưa được hỗ trợ.');
  }
  if (file.size <= 0) {
    throw new Error('File tải lên không được là file rỗng.');
  }
  if (file.size > policy.maxSizeBytes) {
    throw new Error(
      `File tải lên vượt quá dung lượng ${humanReadableUploadSize(policy.maxSizeBytes)}.`,
    );
  }

  const header = await readHeader(file.path);
  let detectedMimeType = detectBinaryMimeType(header);
  const declaredMimeType = file.mimetype.trim().toLowerCase();

  if (!detectedMimeType) {
    const svgSource = await readFile(file.path, 'utf8');
    if (looksLikeSvg(svgSource)) {
      const unsafeReason = getUnsafeSvgReason(svgSource);
      if (unsafeReason) throw new Error(unsafeReason);
      detectedMimeType = 'image/svg+xml';
    }
  }

  if (!detectedMimeType) {
    throw new Error('Không nhận diện được nội dung hoặc định dạng file.');
  }
  if (!policy.allowedMimeTypes.includes(detectedMimeType)) {
    throw new Error(
      `Định dạng ${detectedMimeType} không được phép cho mục đích ${purpose}.`,
    );
  }
  const hasSpecificDeclaredMime =
    Boolean(declaredMimeType) &&
    declaredMimeType !== 'application/octet-stream';
  if (hasSpecificDeclaredMime && declaredMimeType !== detectedMimeType) {
    throw new Error(
      `MIME ${declaredMimeType || '(trống)'} không khớp với nội dung ${detectedMimeType}.`,
    );
  }

  const normalizedName = normalizeUploadFileName(
    file.originalname,
    detectedMimeType,
    file.filename,
  );
  if (normalizedName.error) throw new Error(normalizedName.error);

  return {
    mimeType: detectedMimeType,
    originalName: normalizedName.originalName,
  };
};
