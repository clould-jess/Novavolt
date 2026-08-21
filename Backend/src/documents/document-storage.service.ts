import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ClientConfig,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DocumentStorageService {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    const options: S3ClientConfig = {
      region: config.get<string>('OBJECT_STORAGE_REGION', 'ca-central-1'),
      forcePathStyle: config.get<string>('OBJECT_STORAGE_FORCE_PATH_STYLE') === 'true',
    };
    const endpoint = config.get<string>('OBJECT_STORAGE_ENDPOINT');
    if (endpoint) {
      options.endpoint = endpoint;
    }
    const accessKeyId = config.get<string>('OBJECT_STORAGE_ACCESS_KEY_ID');
    const secretAccessKey = config.get<string>('OBJECT_STORAGE_SECRET_ACCESS_KEY');
    if (accessKeyId && secretAccessKey) {
      options.credentials = { accessKeyId, secretAccessKey };
    }
    this.client = new S3Client(options);
    this.bucket = config.get<string>('OBJECT_STORAGE_BUCKET', 'novavolt-private');
  }

  assertEnabled(): void {
    if (!this.config.get<boolean>('DOCUMENT_UPLOADS_ENABLED', false)) {
      throw new ServiceUnavailableException('Secure document storage is not configured');
    }
  }

  createUploadUrl(
    storageKey: string,
    mimeType: string,
    sizeBytes: number,
    resourceId: string,
  ) {
    this.assertEnabled();
    return getSignedUrl(
      this.client,
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: storageKey,
        ContentType: mimeType,
        ContentLength: sizeBytes,
        ServerSideEncryption: 'AES256',
        Metadata: { resourceId },
      }),
      { expiresIn: 600 },
    );
  }

  async head(storageKey: string) {
    this.assertEnabled();
    return this.client.send(
      new HeadObjectCommand({ Bucket: this.bucket, Key: storageKey }),
    );
  }

  createDownloadUrl(storageKey: string) {
    this.assertEnabled();
    return getSignedUrl(
      this.client,
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: storageKey,
        ResponseContentDisposition: 'attachment',
      }),
      { expiresIn: 300 },
    );
  }

  async remove(storageKey: string): Promise<void> {
    this.assertEnabled();
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: storageKey }),
    );
  }
}
