import { Global, Injectable, Logger, Module } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
export abstract class StorageService {
  abstract put(key: string, data: Buffer, mime: string): Promise<string>;
  abstract remove(key: string): Promise<void>;
}
@Injectable()
export class S3StorageService extends StorageService {
  private logger = new Logger('Storage');
  private client = new S3Client({
    endpoint: process.env.STORAGE_ENDPOINT,
    region: process.env.STORAGE_REGION || 'auto',
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.STORAGE_ACCESS_KEY!,
      secretAccessKey: process.env.STORAGE_SECRET_KEY!,
    },
  });
  async put(key: string, data: Buffer, mime: string) {
    await this.client.send(
      new PutObjectCommand({
        Bucket: process.env.STORAGE_BUCKET,
        Key: key,
        Body: data,
        ContentType: mime,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );
    return `${process.env.STORAGE_PUBLIC_URL}/${key}`;
  }
  async remove(key: string) {
    try {
      await this.client.send(
        new DeleteObjectCommand({ Bucket: process.env.STORAGE_BUCKET, Key: key }),
      );
    } catch {
      this.logger.error({ event: 'object_cleanup_failed', key });
    }
  }
}
@Global()
@Module({
  providers: [{ provide: StorageService, useClass: S3StorageService }],
  exports: [StorageService],
})
export class StorageModule {}
