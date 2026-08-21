import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { randomUUID } from 'crypto';
import { AuditService } from '../audit/audit.service';
import { AuthUser, RequestContext } from '../common/types/auth-user';
import { DocumentStorageService } from '../documents/document-storage.service';
import { PrismaService } from '../prisma.service';
import { CreateContractUploadDto } from './dto';

@Injectable()
export class ContractsService {
  constructor(
    private readonly db: PrismaService,
    private readonly storage: DocumentStorageService,
    private readonly audit: AuditService,
  ) {}

  mine(customerId: string) {
    return this.db.contract.findMany({
      where: { rental: { customerId } },
      select: {
        id: true,
        rentalId: true,
        version: true,
        originalName: true,
        uploadedAt: true,
        signedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async startUpload(
    dto: CreateContractUploadDto,
    actor: AuthUser,
    context: RequestContext,
  ) {
    this.storage.assertEnabled();
    if (!dto.originalName.toLowerCase().endsWith('.pdf')) {
      throw new BadRequestException('Contracts must be PDF files');
    }
    const storageKey = `contracts/${dto.rentalId}/${randomUUID()}.pdf`;
    const contract = await this.db.$transaction(
      async (transaction) => {
        await transaction.rental.findUniqueOrThrow({
          where: { id: dto.rentalId },
        });
        await transaction.$queryRaw(
          Prisma.sql`SELECT id FROM "Rental" WHERE id = ${dto.rentalId} FOR UPDATE`,
        );
        const latest = await transaction.contract.findFirst({
          where: { rentalId: dto.rentalId },
          orderBy: { version: 'desc' },
          select: { version: true },
        });
        const created = await transaction.contract.create({
          data: {
            rentalId: dto.rentalId,
            version: (latest?.version ?? 0) + 1,
            storageKey,
            originalName: dto.originalName,
            sizeBytes: dto.sizeBytes,
          },
        });
        await this.audit.write(
          {
            actorUserId: actor.id,
            action: 'contract.upload_started',
            entityType: 'Contract',
            entityId: created.id,
            metadata: { rentalId: dto.rentalId, version: created.version },
            context,
          },
          transaction,
        );
        return created;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
    try {
      return {
        contractId: contract.id,
        uploadUrl: await this.storage.createUploadUrl(
          contract.storageKey,
          contract.mimeType,
          contract.sizeBytes,
          contract.id,
        ),
        expiresInSeconds: 600,
        requiredHeaders: {
          'content-type': contract.mimeType,
          'content-length': contract.sizeBytes,
          'x-amz-server-side-encryption': 'AES256',
        },
      };
    } catch (error) {
      await this.db.contract.delete({ where: { id: contract.id } });
      throw error;
    }
  }

  async completeUpload(
    id: string,
    actor: AuthUser,
    context: RequestContext,
  ) {
    const contract = await this.db.contract.findUniqueOrThrow({ where: { id } });
    if (contract.uploadedAt) {
      throw new BadRequestException('Contract upload is already finalized');
    }
    const object = await this.storage.head(contract.storageKey);
    if (
      object.ContentLength !== contract.sizeBytes ||
      object.ContentType?.toLowerCase() !== 'application/pdf'
    ) {
      await this.storage.remove(contract.storageKey).catch(() => undefined);
      await this.db.contract.delete({ where: { id } });
      throw new BadRequestException('Uploaded contract metadata does not match');
    }
    return this.db.$transaction(async (transaction) => {
      const updated = await transaction.contract.update({
        where: { id },
        data: { uploadedAt: new Date(), sha256: object.ChecksumSHA256 },
      });
      await this.audit.write(
        {
          actorUserId: actor.id,
          action: 'contract.upload_completed',
          entityType: 'Contract',
          entityId: id,
          context,
        },
        transaction,
      );
      return updated;
    });
  }

  async download(id: string, user: AuthUser) {
    const contract = await this.db.contract.findUniqueOrThrow({
      where: { id },
      include: { rental: { select: { customerId: true } } },
    });
    const staff =
      user.role === Role.AGENT ||
      user.role === Role.ADMIN ||
      user.role === Role.OWNER;
    if (contract.rental.customerId !== user.id && !staff) {
      throw new ForbiddenException();
    }
    if (!contract.uploadedAt) {
      throw new BadRequestException('Contract upload is incomplete');
    }
    return {
      url: await this.storage.createDownloadUrl(contract.storageKey),
      expiresInSeconds: 300,
      fileName: contract.originalName,
    };
  }

  async markSigned(
    id: string,
    providerId: string | undefined,
    actor: AuthUser,
    context: RequestContext,
  ) {
    return this.db.$transaction(async (transaction) => {
      const current = await transaction.contract.findUniqueOrThrow({
        where: { id },
      });
      if (!current.uploadedAt) {
        throw new BadRequestException('Contract upload is incomplete');
      }
      if (current.signedAt) {
        throw new BadRequestException('Contract is already signed');
      }
      const contract = await transaction.contract.update({
        where: { id },
        data: { signedAt: new Date(), providerId },
      });
      await this.audit.write(
        {
          actorUserId: actor.id,
          action: 'contract.signed',
          entityType: 'Contract',
          entityId: id,
          context,
        },
        transaction,
      );
      return contract;
    });
  }
}
