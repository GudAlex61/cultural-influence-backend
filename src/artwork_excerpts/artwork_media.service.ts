import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { Client } from 'minio';

type MediaKind = 'image' | 'video';

@Injectable()
export class ArtworkMediaService {
  private readonly client: Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor(config: ConfigService) {
    const endpoint = config.get<string>('MINIO_ENDPOINT', 'localhost');
    const port = Number(config.get<string>('MINIO_PORT', '9000'));
    this.bucket = config.get<string>('MINIO_BUCKET', 'artwork-excerpts');
    this.publicBaseUrl = config.get<string>(
      'MINIO_PUBLIC_URL',
      `http://${endpoint}:${port}`,
    ).replace(/\/$/, '');
    this.client = new Client({
      endPoint: endpoint,
      port,
      useSSL: config.get<string>('MINIO_USE_SSL', 'false') === 'true',
      accessKey: config.get<string>('MINIO_ACCESS_KEY', 'root'),
      secretKey: config.get<string>('MINIO_SECRET_KEY', 'rootpassword'),
    });
  }

  async upload(file: Express.Multer.File, kind: MediaKind): Promise<{ key: string; url: string }> {
    const extension = this.extension(file.mimetype, kind);
    const key = `artwork-excerpt-${kind}-${randomUUID()}.${extension}`;
    if (!(await this.client.bucketExists(this.bucket))) {
      await this.client.makeBucket(this.bucket);
      await this.client.setBucketPolicy(this.bucket, JSON.stringify({
        Version: '2012-10-17',
        Statement: [{
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${this.bucket}/*`],
        }],
      }));
    }
    await this.client.putObject(this.bucket, key, file.buffer, file.size, {
      'Content-Type': file.mimetype,
    });
    return { key, url: `${this.publicBaseUrl}/${this.bucket}/${key}` };
  }

  async remove(key: string): Promise<void> {
    await this.client.removeObject(this.bucket, key);
  }

  private extension(mime: string, kind: MediaKind): string {
    if (kind === 'image') {
      return mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
    }
    return mime === 'video/webm' ? 'webm' : 'mp4';
  }
}
