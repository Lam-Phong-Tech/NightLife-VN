import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectsCommand,
  GetObjectCommand,
  type GetObjectCommandOutput,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { createReadStream } from 'node:fs';
import { Readable } from 'node:stream';

type UploadInput = { key: string; path: string; contentType?: string };

@Injectable()
export class R2StorageService implements OnModuleInit {
  private readonly logger = new Logger(R2StorageService.name);
  private client?: S3Client;
  private bucket?: string;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    if (!this.isEnabled()) return;
    const endpoint = this.config.get<string>('R2_ENDPOINT');
    const accessKeyId = this.config.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get<string>('R2_SECRET_ACCESS_KEY');
    this.bucket = this.config.get<string>('R2_BUCKET');
    if (!endpoint || !accessKeyId || !secretAccessKey || !this.bucket) {
      throw new Error(
        'R2 storage is enabled but its configuration is incomplete',
      );
    }
    this.client = new S3Client({
      region: this.config.get<string>('R2_REGION', 'auto'),
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  isEnabled() {
    return (
      this.config.get<string>('STORAGE_DRIVER', 'local').toLowerCase() === 'r2'
    );
  }

  async uploadFiles(files: UploadInput[]) {
    if (!this.isEnabled() || !files.length) return;
    const client = this.requireClient();
    await Promise.all(
      files.map(async (file) => {
        await client.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: file.key,
            Body: createReadStream(file.path),
            ContentType: file.contentType ?? 'application/octet-stream',
          }),
        );
      }),
    );
  }

  async getObject(key: string) {
    let result: GetObjectCommandOutput;
    try {
      result = await this.requireClient().send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch (error) {
      if ((error as { name?: string }).name === 'NoSuchKey') {
        throw new NotFoundException('Media file not found');
      }
      throw error;
    }
    const body = result.Body;
    if (!body || !(body instanceof Readable)) {
      throw new Error(`R2 object ${key} has no readable body`);
    }
    return {
      body,
      contentLength: result.ContentLength,
      contentType: result.ContentType,
    };
  }

  async deleteObjects(keys: string[]) {
    if (!this.isEnabled()) return;
    const uniqueKeys = [...new Set(keys.filter(Boolean))];
    if (!uniqueKeys.length) return;
    await this.requireClient().send(
      new DeleteObjectsCommand({
        Bucket: this.bucket,
        Delete: { Objects: uniqueKeys.map((Key) => ({ Key })), Quiet: true },
      }),
    );
  }

  private requireClient() {
    if (!this.client || !this.bucket)
      throw new Error('R2 client is not initialized');
    return this.client;
  }
}
