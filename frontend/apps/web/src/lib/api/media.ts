import { apiClient } from './client';

export type UploadedMedia = {
  id: string;
  url?: string | null;
  originalName?: string | null;
  mimeType?: string | null;
};

export const deleteUploadedMedia = (mediaId: string) =>
  apiClient<{ id: string; deleted: boolean }>(
    `/storage/media/${encodeURIComponent(mediaId)}`,
    { method: 'DELETE' },
  );

export const deleteUploadedMediaBatch = async (mediaIds: Iterable<string>) => {
  const uniqueIds = Array.from(new Set(mediaIds)).filter(Boolean);
  const results = await Promise.allSettled(uniqueIds.map(deleteUploadedMedia));
  return results.filter(
    (result): result is PromiseRejectedResult => result.status === 'rejected',
  );
};
