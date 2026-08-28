import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const databaseUrl = process.env.DATABASE_URL?.trim();
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is required');
    }

    super({
      adapter: new PrismaNeon({ connectionString: databaseUrl }),
      log:
        process.env.NODE_ENV === 'development'
          ? ['warn', 'error']
          : ['error'],
      transactionOptions: {
        maxWait: 5_000,
        timeout: 15_000,
      },
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Database connection established');
    } catch (error) {
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }

      const message =
        error instanceof Error ? error.message : 'Unknown Prisma connection error';
      this.logger.warn(`Database connection unavailable at startup: ${message}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
