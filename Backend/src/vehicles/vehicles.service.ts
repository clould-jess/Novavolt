import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MalwareScanStatus, Prisma, VehicleStatus } from '@prisma/client';
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import { AuditService } from '../audit/audit.service';
import { AuthUser, RequestContext } from '../common/types/auth-user';
import { MalwareScanResult } from '../documents/dto';
import { PrismaService } from '../prisma.service';
import {
  CompleteVehiclePhotoUploadDto,
  CreateVehiclePhotoUploadDto,
  CreateVehicleDto,
  StaffVehicleQueryDto,
  UpdateVehicleDto,
  VehicleQueryDto,
} from './dto';
import { VehicleImageKitService } from './vehicle-imagekit.service';

const publicVehicleSelect = {
  id: true,
  make: true,
  model: true,
  year: true,
  color: true,
  city: true,
  seats: true,
  rangeKm: true,
  description: true,
  powertrain: true,
  weeklyRateCents: true,
  currency: true,
  status: true,
  photos: {
    where: {
      uploadedAt: { not: null },
      malwareScanStatus: MalwareScanStatus.CLEAN,
    },
    select: {
      id: true,
      altText: true,
      sortOrder: true,
      uploadedAt: true,
      malwareScanStatus: true,
      imagekitUrl: true,
      imagekitThumbnailUrl: true,
    },
    orderBy: { sortOrder: 'asc' },
  },
} satisfies Prisma.VehicleSelect;

@Injectable()
export class VehiclesService {
  constructor(
    private readonly db: PrismaService,
    private readonly audit: AuditService,
    private readonly imageKit: VehicleImageKitService,
    private readonly config: ConfigService,
  ) {}

  async publicList(query: VehicleQueryDto) {
    const where: Prisma.VehicleWhereInput = {
      status: { in: [VehicleStatus.AVAILABLE, VehicleStatus.RESERVED] },
      ...(query.powertrain ? { powertrain: query.powertrain } : {}),
      ...(query.maxWeeklyRateCents
        ? { weeklyRateCents: { lte: query.maxWeeklyRateCents } }
        : {}),
    };
    const [items, total] = await this.db.$transaction([
      this.db.vehicle.findMany({
        where,
        select: publicVehicleSelect,
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
        skip: query.skip,
        take: query.limit,
      }),
      this.db.vehicle.count({ where }),
    ]);
    return { items, total, page: query.page, limit: query.limit };
  }

  publicOne(id: string) {
    return this.db.vehicle.findFirstOrThrow({
      where: {
        id,
        status: { in: [VehicleStatus.AVAILABLE, VehicleStatus.RESERVED] },
      },
      select: publicVehicleSelect,
    });
  }

  async staffList(query: StaffVehicleQueryDto) {
    const where: Prisma.VehicleWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.powertrain ? { powertrain: query.powertrain } : {}),
      ...(query.maxWeeklyRateCents
        ? { weeklyRateCents: { lte: query.maxWeeklyRateCents } }
        : {}),
    };
    const [items, total] = await this.db.$transaction([
      this.db.vehicle.findMany({
        where,
        include: { photos: { orderBy: { sortOrder: 'asc' } } },
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.db.vehicle.count({ where }),
    ]);
    return { items, total, page: query.page, limit: query.limit };
  }

  async create(
    dto: CreateVehicleDto,
    actor: AuthUser,
    context: RequestContext,
  ) {
    return this.db.$transaction(async (transaction) => {
      const vehicle = await transaction.vehicle.create({ data: dto });
      await this.audit.write(
        {
          actorUserId: actor.id,
          action: 'vehicle.created',
          entityType: 'Vehicle',
          entityId: vehicle.id,
          metadata: { status: vehicle.status },
          context,
        },
        transaction,
      );
      return vehicle;
    });
  }

  async update(
    id: string,
    dto: UpdateVehicleDto,
    actor: AuthUser,
    context: RequestContext,
  ) {
    return this.db.$transaction(async (transaction) => {
      const current = await transaction.vehicle.findUniqueOrThrow({ where: { id } });
      if (dto.odometer !== undefined && dto.odometer < current.odometer) {
        throw new BadRequestException('Odometer cannot decrease');
      }
      const vehicle = await transaction.vehicle.update({
        where: { id },
        data: dto,
      });
      await this.audit.write(
        {
          actorUserId: actor.id,
          action: 'vehicle.updated',
          entityType: 'Vehicle',
          entityId: id,
          metadata: { fields: Object.keys(dto) },
          context,
        },
        transaction,
      );
      return vehicle;
    });
  }

  async setStatus(
    id: string,
    status: VehicleStatus,
    actor: AuthUser,
    context: RequestContext,
  ) {
    if (status === VehicleStatus.RENTED || status === VehicleStatus.RESERVED) {
      throw new BadRequestException(
        'RENTED and RESERVED statuses are controlled by booking and rental workflows',
      );
    }
    return this.db.$transaction(async (transaction) => {
      const current = await transaction.vehicle.findUniqueOrThrow({ where: { id } });
      if (current.status === VehicleStatus.RENTED && status !== VehicleStatus.MAINTENANCE) {
        throw new BadRequestException('Complete the active rental first');
      }
      const vehicle = await transaction.vehicle.update({
        where: { id },
        data: { status },
      });
      await this.audit.write(
        {
          actorUserId: actor.id,
          action: 'vehicle.status_changed',
          entityType: 'Vehicle',
          entityId: id,
          metadata: { from: current.status, to: status },
          context,
        },
        transaction,
      );
      return vehicle;
    });
  }

  async startPhotoUpload(
    vehicleId: string,
    dto: CreateVehiclePhotoUploadDto,
    actor: AuthUser,
    context: RequestContext,
  ) {
    await this.db.vehicle.findUniqueOrThrow({ where: { id: vehicleId } });
    const existingPhotos = await this.db.vehiclePhoto.count({ where: { vehicleId } });
    if (existingPhotos >= 5) {
      throw new BadRequestException('A vehicle can have at most 5 photos');
    }
    const photoId = randomUUID();
    const mimeType = dto.mimeType.toLowerCase();
    const fileName = this.imageKit.buildFileName(vehicleId, photoId, mimeType);
    const photo = await this.db.$transaction(async (transaction) => {
      const created = await transaction.vehiclePhoto.create({
        data: {
          id: photoId,
          vehicleId,
          storageKey: `${vehicleId}/${photoId}`,
          mimeType,
          sizeBytes: dto.sizeBytes,
          altText: dto.altText,
          sortOrder: dto.sortOrder,
        },
      });
      await this.audit.write(
        {
          actorUserId: actor.id,
          action: 'vehicle_photo.upload_started',
          entityType: 'VehiclePhoto',
          entityId: created.id,
          metadata: { vehicleId, sizeBytes: created.sizeBytes },
          context,
        },
        transaction,
      );
      return created;
    });

    const upload = this.imageKit.getUploadAuth();
    return {
      photoId: photo.id,
      uploadUrl: upload.uploadUrl,
      publicKey: upload.publicKey,
      token: upload.token,
      expire: upload.expire,
      signature: upload.signature,
      folder: upload.folder,
      fileName,
      urlEndpoint: upload.urlEndpoint,
      expiresInSeconds: upload.expiresInSeconds,
    };
  }

  async completePhotoUpload(
    vehicleId: string,
    photoId: string,
    dto: CompleteVehiclePhotoUploadDto,
    actor: AuthUser,
    context: RequestContext,
  ) {
    const photo = await this.db.vehiclePhoto.findFirstOrThrow({
      where: { id: photoId, vehicleId },
    });
    if (photo.uploadedAt) {
      throw new BadRequestException('Vehicle photo upload is already finalized');
    }
    const expectedFileName = this.imageKit.buildFileName(
      vehicleId,
      photo.id,
      photo.mimeType,
    );
    if (!dto.imagekitFilePath.endsWith(`/${expectedFileName}`)) {
      await this.imageKit.deleteFile(dto.imagekitFileId).catch(() => undefined);
      throw new BadRequestException('Uploaded vehicle photo does not match the expected ImageKit file name');
    }
    const updated = await this.db.$transaction(async (transaction) => {
      const result = await transaction.vehiclePhoto.update({
        where: { id: photo.id },
        data: {
          imagekitFileId: dto.imagekitFileId,
          imagekitFilePath: dto.imagekitFilePath,
          imagekitUrl: dto.imagekitUrl,
          imagekitThumbnailUrl: dto.imagekitThumbnailUrl ?? dto.imagekitUrl,
          uploadedAt: new Date(),
          malwareScanStatus: this.config.get<boolean>(
            'MALWARE_SCAN_REQUIRED',
            false,
          )
            ? MalwareScanStatus.PENDING
            : MalwareScanStatus.CLEAN,
        },
      });
      await this.audit.write(
        {
          actorUserId: actor.id,
          action: 'vehicle_photo.upload_completed',
          entityType: 'VehiclePhoto',
          entityId: photo.id,
          metadata: {
            vehicleId,
            fileId: dto.imagekitFileId,
            filePath: dto.imagekitFilePath,
          },
          context,
        },
        transaction,
      );
      return result;
    });
    return updated;
  }

  async photoDownload(vehicleId: string, photoId: string) {
    const photo = await this.db.vehiclePhoto.findFirstOrThrow({
      where: {
        id: photoId,
        vehicleId,
        uploadedAt: { not: null },
        malwareScanStatus: MalwareScanStatus.CLEAN,
      },
      select: {
        imagekitUrl: true,
        imagekitThumbnailUrl: true,
        imagekitFilePath: true,
      },
    });
    if (!photo.imagekitUrl && !photo.imagekitFilePath) {
      throw new BadRequestException('Vehicle photo is missing delivery metadata');
    }
    const url =
      photo.imagekitUrl ??
      this.imageKit.buildDeliveryUrl(photo.imagekitFilePath ?? '');
    return {
      url,
      thumbnailUrl: photo.imagekitThumbnailUrl ?? url,
      expiresInSeconds: 0,
    };
  }

  async deletePhoto(
    vehicleId: string,
    photoId: string,
    actor: AuthUser,
    context: RequestContext,
  ) {
    const photo = await this.db.vehiclePhoto.findFirstOrThrow({
      where: { id: photoId, vehicleId },
    });
    if (photo.imagekitFileId) {
      await this.imageKit.deleteFile(photo.imagekitFileId).catch(() => undefined);
    }
    await this.db.$transaction(async (transaction) => {
      await transaction.vehiclePhoto.delete({ where: { id: photo.id } });
      await this.audit.write(
        {
          actorUserId: actor.id,
          action: 'vehicle_photo.deleted',
          entityType: 'VehiclePhoto',
          entityId: photo.id,
          metadata: { vehicleId, fileId: photo.imagekitFileId },
          context,
        },
        transaction,
      );
    });
    return { ok: true };
  }

  async recordPhotoScan(
    photoId: string,
    status: MalwareScanResult,
    timestamp: string | undefined,
    signature: string | undefined,
  ) {
    if (!this.config.get<boolean>('MALWARE_SCAN_REQUIRED', false)) {
      throw new ServiceUnavailableException('Malware scanning is not configured');
    }
    this.verifyScannerSignature(photoId, status, timestamp, signature);
    const photo = await this.db.$transaction(async (transaction) => {
      const current = await transaction.vehiclePhoto.findUniqueOrThrow({
        where: { id: photoId },
      });
      if (!current.uploadedAt) {
        throw new BadRequestException('Vehicle photo upload is incomplete');
      }
      const updated = await transaction.vehiclePhoto.update({
        where: { id: photoId },
        data: { malwareScanStatus: MalwareScanStatus[status] },
      });
      await this.audit.write(
        {
          action: 'vehicle_photo.malware_scan_completed',
          entityType: 'VehiclePhoto',
          entityId: photoId,
          metadata: { result: status },
        },
        transaction,
      );
      return updated;
    });
    if (status === MalwareScanResult.INFECTED && photo.imagekitFileId) {
      await this.imageKit.deleteFile(photo.imagekitFileId).catch(() => undefined);
    }
    return { accepted: true };
  }

  private verifyScannerSignature(
    id: string,
    status: MalwareScanResult,
    timestamp: string | undefined,
    signature: string | undefined,
  ): void {
    const timestampNumber = Number(timestamp);
    if (
      !timestamp ||
      !signature ||
      !Number.isSafeInteger(timestampNumber) ||
      Math.abs(Date.now() - timestampNumber * 1000) > 5 * 60_000
    ) {
      throw new UnauthorizedException('Invalid scanner signature');
    }
    const expected = createHmac(
      'sha256',
      this.config.getOrThrow<string>('MALWARE_SCANNER_WEBHOOK_SECRET'),
    )
      .update(`${timestamp}.${id}.${status}`)
      .digest();
    const supplied = Buffer.from(signature, 'hex');
    if (
      supplied.length !== expected.length ||
      !timingSafeEqual(supplied, expected)
    ) {
      throw new UnauthorizedException('Invalid scanner signature');
    }
  }
}
