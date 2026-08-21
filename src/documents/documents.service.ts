import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  DocumentStatus,
  MalwareScanStatus,
  Prisma,
  Role,
} from '@prisma/client';
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { AuditService } from '../audit/audit.service';
import { AuthUser, RequestContext } from '../common/types/auth-user';
import { PrismaService } from '../prisma.service';
import { DocumentStorageService } from './document-storage.service';
import {
  CreateDocumentUploadDto,
  DocumentQueryDto,
  MalwareScanResult,
  ReviewDocumentDto,
} from './dto';

const allowedMimeTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
]);

@Injectable()
export class DocumentsService {
  constructor(
    private readonly db: PrismaService,
    private readonly storage: DocumentStorageService,
    private readonly audit: AuditService,
    private readonly config: ConfigService,
  ) {}

  mine(customerId: string) {
    return this.db.document.findMany({
      where: { customerId },
      select: {
        id: true,
        type: true,
        originalName: true,
        mimeType: true,
        sizeBytes: true,
        status: true,
        malwareScanStatus: true,
        expiresAt: true,
        rejectionReason: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async list(query: DocumentQueryDto) {
    const where: Prisma.DocumentWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.type ? { type: query.type } : {}),
    };
    const [items, total] = await this.db.$transaction([
      this.db.document.findMany({
        where,
        include: {
          customer: { select: { id: true, email: true, profile: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.db.document.count({ where }),
    ]);
    return { items, total, page: query.page, limit: query.limit };
  }

  async startUpload(
    customer: AuthUser,
    dto: CreateDocumentUploadDto,
    context: RequestContext,
  ) {
    this.storage.assertEnabled();
    if (!allowedMimeTypes.has(dto.mimeType.toLowerCase())) {
      throw new BadRequestException('Unsupported document MIME type');
    }
    const extension = this.safeExtension(dto.originalName);
    const storageKey = `documents/${customer.id}/${randomUUID()}${extension}`;
    const document = await this.db.$transaction(async (transaction) => {
      const created = await transaction.document.create({
        data: {
          customerId: customer.id,
          type: dto.type,
          storageKey,
          originalName: dto.originalName,
          mimeType: dto.mimeType.toLowerCase(),
          sizeBytes: dto.sizeBytes,
          expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        },
      });
      await this.audit.write(
        {
          actorUserId: customer.id,
          action: 'document.upload_started',
          entityType: 'Document',
          entityId: created.id,
          metadata: { type: created.type, sizeBytes: created.sizeBytes },
          context,
        },
        transaction,
      );
      return created;
    });

    try {
      const uploadUrl = await this.storage.createUploadUrl(
        storageKey,
        document.mimeType,
        document.sizeBytes,
        document.id,
      );
      return {
        documentId: document.id,
        uploadUrl,
        expiresInSeconds: 600,
        requiredHeaders: {
          'content-type': document.mimeType,
          'content-length': document.sizeBytes,
          'x-amz-server-side-encryption': 'AES256',
        },
      };
    } catch (error) {
      await this.db.document.delete({ where: { id: document.id } });
      throw error;
    }
  }

  async completeUpload(
    id: string,
    customer: AuthUser,
    context: RequestContext,
  ) {
    const document = await this.db.document.findFirstOrThrow({
      where: { id, customerId: customer.id },
    });
    if (document.status !== DocumentStatus.UPLOADING) {
      throw new BadRequestException('Document upload is already finalized');
    }

    const object = await this.storage.head(document.storageKey);
    const actualType = object.ContentType?.toLowerCase();
    if (
      object.ContentLength !== document.sizeBytes ||
      actualType !== document.mimeType
    ) {
      await this.storage.remove(document.storageKey).catch(() => undefined);
      await this.db.document.update({
        where: { id },
        data: {
          status: DocumentStatus.REJECTED,
          rejectionReason: 'Uploaded object metadata did not match the request',
        },
      });
      throw new BadRequestException('Uploaded object metadata does not match');
    }

    return this.db.$transaction(async (transaction) => {
      const updated = await transaction.document.update({
        where: { id },
        data: {
          status: DocumentStatus.PENDING,
          checksum: object.ChecksumSHA256,
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
          actorUserId: customer.id,
          action: 'document.upload_completed',
          entityType: 'Document',
          entityId: id,
          context,
        },
        transaction,
      );
      return updated;
    });
  }

  async download(id: string, user: AuthUser) {
    const document = await this.db.document.findUniqueOrThrow({ where: { id } });
    const staff =
      user.role === Role.AGENT ||
      user.role === Role.ADMIN ||
      user.role === Role.OWNER;
    if (document.customerId !== user.id && !staff) {
      throw new ForbiddenException();
    }
    if (document.status === DocumentStatus.UPLOADING) {
      throw new BadRequestException('Document upload is incomplete');
    }
    return {
      url: await this.storage.createDownloadUrl(document.storageKey),
      expiresInSeconds: 300,
      fileName: document.originalName,
    };
  }

  async review(
    id: string,
    dto: ReviewDocumentDto,
    actor: AuthUser,
    context: RequestContext,
  ) {
    if (dto.status === 'REJECTED' && !dto.rejectionReason) {
      throw new BadRequestException('A rejection reason is required');
    }
    return this.db.$transaction(async (transaction) => {
      const current = await transaction.document.findUniqueOrThrow({
        where: { id },
      });
      if (current.status !== DocumentStatus.PENDING) {
        throw new BadRequestException('Only a pending document can be reviewed');
      }
      if (
        this.config.get<boolean>('MALWARE_SCAN_REQUIRED', false) &&
        current.malwareScanStatus !== MalwareScanStatus.CLEAN
      ) {
        throw new BadRequestException('Document malware scan is not clean');
      }
      const document = await transaction.document.update({
        where: { id },
        data: {
          status: dto.status,
          rejectionReason:
            dto.status === 'REJECTED' ? dto.rejectionReason : null,
          reviewedById: actor.id,
          reviewedAt: new Date(),
        },
      });
      await this.audit.write(
        {
          actorUserId: actor.id,
          action: 'document.reviewed',
          entityType: 'Document',
          entityId: id,
          metadata: { decision: dto.status },
          context,
        },
        transaction,
      );
      return document;
    });
  }

  @Cron(CronExpression.EVERY_HOUR)
  async expireDocuments(): Promise<void> {
    await this.db.document.updateMany({
      where: {
        expiresAt: { lte: new Date() },
        status: DocumentStatus.APPROVED,
      },
      data: { status: DocumentStatus.EXPIRED },
    });
  }

  async recordMalwareScan(
    id: string,
    status: MalwareScanResult,
    timestamp: string | undefined,
    signature: string | undefined,
  ) {
    if (!this.config.get<boolean>('MALWARE_SCAN_REQUIRED', false)) {
      throw new ServiceUnavailableException('Malware scanning is not configured');
    }
    this.verifyScannerSignature(id, status, timestamp, signature);
    const scanStatus = MalwareScanStatus[status];
    const document = await this.db.$transaction(async (transaction) => {
      const current = await transaction.document.findUniqueOrThrow({
        where: { id },
      });
      if (current.status === DocumentStatus.UPLOADING) {
        throw new BadRequestException('Document upload is incomplete');
      }
      const updated = await transaction.document.update({
        where: { id },
        data: {
          malwareScanStatus: scanStatus,
          ...(status === MalwareScanResult.INFECTED
            ? {
                status: DocumentStatus.REJECTED,
                rejectionReason: 'Malware scan rejected this object',
              }
            : {}),
        },
      });
      await this.audit.write(
        {
          action: 'document.malware_scan_completed',
          entityType: 'Document',
          entityId: id,
          metadata: { result: status },
        },
        transaction,
      );
      return updated;
    });
    if (status === MalwareScanResult.INFECTED) {
      await this.storage.remove(document.storageKey).catch(() => undefined);
    }
    return { accepted: true };
  }

  private safeExtension(originalName: string): string {
    const match = originalName.toLowerCase().match(/\.(pdf|jpe?g|png)$/);
    return match ? `.${match[1] === 'jpeg' ? 'jpg' : match[1]}` : '';
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
    let supplied: Buffer;
    try {
      supplied = Buffer.from(signature, 'hex');
    } catch {
      throw new UnauthorizedException('Invalid scanner signature');
    }
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
      throw new UnauthorizedException('Invalid scanner signature');
    }
  }
}
