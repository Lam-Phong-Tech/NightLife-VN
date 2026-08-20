import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'node:child_process';
import { stat } from 'node:fs/promises';
import { join } from 'node:path';

export type VideoThumbnail = {
  storageKey: string;
  path: string;
  mimeType: 'image/webp';
  sizeBytes: number;
};

@Injectable()
export class VideoThumbnailService {
  private readonly logger = new Logger(VideoThumbnailService.name);

  async create(inputPath: string, videoStorageKey: string, uploadDir: string) {
    const storageKey = `${videoStorageKey}-thumbnail.webp`;
    const path = join(uploadDir, storageKey);

    await new Promise<void>((resolve, reject) => {
      const child = spawn(
        process.env.FFMPEG_PATH?.trim() || 'ffmpeg',
        [
          '-hide_banner',
          '-loglevel',
          'error',
          '-ss',
          '0.5',
          '-i',
          inputPath,
          '-frames:v',
          '1',
          '-vf',
          'scale=640:-2',
          '-c:v',
          'libwebp',
          '-quality',
          '78',
          '-y',
          path,
        ],
        { stdio: ['ignore', 'ignore', 'pipe'] },
      );
      let errorOutput = '';

      child.stderr.on('data', (chunk: Buffer) => {
        errorOutput += chunk.toString();
      });
      child.once('error', reject);
      child.once('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(errorOutput.trim() || `FFmpeg exited with code ${code}`));
      });
    });

    const file = await stat(path);
    if (!file.size) throw new Error('FFmpeg generated an empty thumbnail');

    this.logger.debug(`Created video thumbnail ${storageKey}`);
    return { storageKey, path, mimeType: 'image/webp', sizeBytes: file.size } satisfies VideoThumbnail;
  }
}
