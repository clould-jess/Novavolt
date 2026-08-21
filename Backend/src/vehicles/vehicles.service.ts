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
import { DocumentStorageService } from '../documents/document-storage.service';
import { MalwareScanResult } from '../documents/dto';
import { PrismaService } from '../prisma.service';
import {
  CreateVehiclePhotoUploadDto,
  CreateVehicleDto,
  StaffVehicleQueryDto,
  UpdateVehicleDto,
  VehicleQueryDto,
} from './dto';

const publicVehicleSelect = {
  id: true,
  make: true,
  model: true,
  year: true,
  color: true,
  powertrain: true,
  weeklyRateCents: true,
  currency: true,
  status: true,
  photos: {
    where: {
      uploadedAt: { not: null },
      malwareScanStatus: MalwareScanStatus.CLEAN,
    },
    select: { id: true, altText: true, sortOrder: true },
    orderBy: { sortOrder: 'asc' },
  },
} satisfies Prisma.VehicleSelect;

@Injectable()
export class VehiclesService {
  constructor(
    private readonly db: PrismaService,
    private readonly audit: AuditService,
    private readonly storage: DocumentStorageService,
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
      if (
        dto.odometer !== undefined &&
        dto.odometer < current.odometer
      ) {
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
    if (
      status === VehicleStatus.RENTED ||
      status === VehicleStatus.RESERVED
    ) {
      throw new BadRequestException(
        'RENTED and RESERVED statuses are controlled by booking and rental workflows',
      );
    }
    return this.db.$transaction(async (transaction) => {
      const current = await transaction.vehicle.findUniqueOrThrow({ where: { id } });
      if (
        current.status === VehicleStatus.RENTED &&
        status !== VehicleStatus.MAINTENANCE
      ) {
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
    this.storage.assertEnabled();
    await this.db.vehicle.findUniqueOrThrow({ where: { id: vehicleId } });
    const mimeType = dto.mimeType.toLowerCase();
    const extension =
      mimeType === 'image/jpeg'
        ? 'jpg'
        : mimeType === 'image/png'
          ? 'png'
          : 'webp';
    const storageKey = `vehicle-photos/${vehicleId}/${randomUUID()}.${extension}`;
    const photo = await this.db.$transaction(async (transaction) => {
      const created = await transaction.vehiclePhoto.create({
        data: {
          vehicleId,
          storageKey,
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
    try {
      return {
        photoId: photo.id,
        uploadUrl: await this.storage.createUploadUrl(
          photo.storageKey,
          photo.mimeType,
          photo.sizeBytes,
          photo.id,
        ),
        expiresInSeconds: 600,
        requiredHeaders: {
          'content-type': photo.mimeType,
          'content-length': photo.sizeBytes,
          'x-amz-server-side-encryption': 'AES256',
        },
      };
    } catch (error) {
      await this.db.vehiclePhoto.delete({ where: { id: photo.id } });
      throw error;
    }
  }

  async completePhotoUpload(
    vehicleId: string,
    photoId: string,
    actor: AuthUser,
    context: RequestContext,
  ) {
    const photo = await this.db.vehiclePhoto.findFirstOrThrow({
      where: { id: photoId, vehicleId },
    });
    if (photo.uploadedAt) {
      throw new BadRequestException('Vehicle photo upload is already finalized');
    }
    const object = await this.storage.head(photo.storageKey);
    if (
      object.ContentLength !== photo.sizeBytes ||
      object.ContentType?.toLowerCase() !== photo.mimeType
    ) {
      await this.storage.remove(photo.storageKey).catch(() => undefined);
      await this.db.vehiclePhoto.delete({ where: { id: photo.id } });
      throw new BadRequestException('Uploaded vehicle photo metadata does not match');
    }
    return this.db.$transaction(async (transaction) => {
      const updated = await transaction.vehiclePhoto.update({
        where: { id: photo.id },
        data: {
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
          metadata: { vehicleId },
          context,
        },
        transaction,
      );
      return updated;
    });
  }

  async photoDownload(vehicleId: string, photoId: string) {
    const photo = await this.db.vehiclePhoto.findFirstOrThrow({
      where: {
        id: photoId,
        vehicleId,
        uploadedAt: { not: null },
        malwareScanStatus: MalwareScanStatus.CLEAN,
      },
      select: { storageKey: true },
    });
    return {
      url: await this.storage.createDownloadUrl(photo.storageKey),
      expiresInSeconds: 300,
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
    await this.storage.remove(photo.storageKey).catch(() => undefined);
    await this.db.$transaction(async (transaction) => {
      await transaction.vehiclePhoto.delete({ where: { id: photo.id } });
      await this.audit.write(
        {
          actorUserId: actor.id,
          action: 'vehicle_photo.deleted',
          entityType: 'VehiclePhoto',
          entityId: photo.id,
          metadata: { vehicleId },
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
    if (status === MalwareScanResult.INFECTED) {
      await this.storage.remove(photo.storageKey).catch(() => undefined);
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
