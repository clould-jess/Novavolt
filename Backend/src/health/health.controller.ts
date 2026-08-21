import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../prisma.service';

@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(private readonly db: PrismaService) {}

  @Get('live')
  live() {
    return {
      status: 'ok',
      service: 'novavolt-api',
      version: '2.0.0',
      time: new Date().toISOString(),
    };
  }

  @Get('ready')
  async ready() {
    await this.db.$queryRaw`SELECT 1`;
    return {
      status: 'ok',
      database: 'reachable',
      time: new Date().toISOString(),
    };
  }

  @Get()
  health() {
    return this.live();
  }
}
