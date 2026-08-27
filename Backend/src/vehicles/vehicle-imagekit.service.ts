import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomUUID } from 'crypto';

type VehicleImageKitSettings = {
  publicKey: string;
  privateKey: string;
  urlEndpoint: string;
  folder: string;
};

@Injectable()
export class VehicleImageKitService {
  constructor(private readonly config: ConfigService) {}

  assertEnabled(): VehicleImageKitSettings {
    const publicKey = this.config.get<string>('IMAGEKIT_PUBLIC_KEY', '').trim();
    const privateKey = this.config.get<string>('IMAGEKIT_PRIVATE_KEY', '').trim();
    const urlEndpoint = this.config.get<string>('IMAGEKIT_URL_ENDPOINT', '').trim().replace(/\/$/, '');
    const folder = this.config.get<string>('IMAGEKIT_VEHICLES_FOLDER', '').trim().replace(/^\/+|\/+$/g, '');

    if (!publicKey || !privateKey || !urlEndpoint || !folder) {
      throw new ServiceUnavailableException('Vehicle image storage is not configured');
    }

    return {
      publicKey,
      privateKey,
      urlEndpoint,
      folder,
    };
  }

  getUploadAuth() {
    const { publicKey, privateKey, urlEndpoint, folder } = this.assertEnabled();
    const expire = Math.floor(Date.now() / 1000) + 3540;
    const token = randomUUID();
    const signature = createHmac('sha1', privateKey)
      .update(`${token}${expire}`)
      .digest('hex');

    return {
      uploadUrl: 'https://upload.imagekit.io/api/v1/files/upload',
      publicKey,
      token,
      expire,
      signature,
      folder,
      urlEndpoint,
      expiresInSeconds: 3540,
    };
  }

  buildDeliveryUrl(filePath: string): string {
    const { urlEndpoint } = this.assertEnabled();
    return `${urlEndpoint}${filePath.startsWith('/') ? filePath : `/${filePath}`}`;
  }

  async deleteFile(fileId: string): Promise<void> {
    if (!fileId) {
      return;
    }

    const { privateKey } = this.assertEnabled();
    const authorization = Buffer.from(`${privateKey}:`).toString('base64');
    const response = await fetch(`https://api.imagekit.io/v1/files/${encodeURIComponent(fileId)}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${authorization}`,
      },
    });

    if (response.status === 204 || response.status === 404) {
      return;
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new ServiceUnavailableException(
        body ? `ImageKit delete failed: ${body}` : `ImageKit delete failed with status ${response.status}`,
      );
    }
  }

  buildFileName(vehicleId: string, photoId: string, mimeType: string): string {
    const extension =
      mimeType === 'image/jpeg'
        ? 'jpg'
        : mimeType === 'image/png'
          ? 'png'
          : 'webp';
    return `${vehicleId}-${photoId}.${extension}`;
  }
}
