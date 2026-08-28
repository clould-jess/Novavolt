import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service';

type ServiceState = 'connected' | 'disabled' | 'unavailable';

@Injectable()
export class StartupDiagnosticsService {
  private readonly logger = new Logger('Startup');

  constructor(
    private readonly config: ConfigService,
    private readonly db: PrismaService,
  ) {}

  async report(): Promise<void> {
    this.logger.log(`NovaVolt API | environment=${this.config.get<string>('NODE_ENV', 'development')}`);
    await this.reportDatabase();
    await Promise.all([this.reportImageKit(), this.reportResend()]);
    const corsOrigins = this.config.get<string>('CORS_ORIGINS', '').split(',').filter(Boolean).length;
    this.logger.log(`HTTP | CORS origins=${corsOrigins} | Swagger=${this.config.get<boolean>('ENABLE_SWAGGER') ? 'enabled' : 'disabled'}`);
  }

  private async reportDatabase(): Promise<void> {
    try {
      await this.db.$queryRaw`SELECT 1`;
      this.logStatus('Neon PostgreSQL', 'connected', this.databaseHost());
    } catch (error) {
      this.logStatus('Neon PostgreSQL', 'unavailable', this.errorMessage(error));
    }
  }

  private async reportImageKit(): Promise<void> {
    const publicKey = this.config.get<string>('IMAGEKIT_PUBLIC_KEY', '').trim();
    const privateKey = this.config.get<string>('IMAGEKIT_PRIVATE_KEY', '').trim();
    if (!publicKey || !privateKey) return this.logStatus('ImageKit', 'disabled');
    try {
      const authorization = Buffer.from(`${privateKey}:`).toString('base64');
      const response = await fetch('https://api.imagekit.io/v1/files?limit=1', {
        headers: { Accept: 'application/json', Authorization: `Basic ${authorization}` },
        signal: AbortSignal.timeout(8_000),
      });
      this.logStatus('ImageKit', response.ok ? 'connected' : 'unavailable', response.ok ? undefined : `HTTP ${response.status}`);
    } catch (error) {
      this.logStatus('ImageKit', 'unavailable', this.errorMessage(error));
    }
  }

  private async reportResend(): Promise<void> {
    const apiKey = this.config.get<string>('RESEND_API_KEY', '').trim();
    if (!apiKey) return this.logStatus('Resend', 'disabled');
    try {
      const response = await fetch('https://api.resend.com/domains', {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(8_000),
      });
      this.logStatus('Resend', response.ok ? 'connected' : 'unavailable', response.ok ? undefined : `HTTP ${response.status}`);
    } catch (error) {
      this.logStatus('Resend', 'unavailable', this.errorMessage(error));
    }
  }

  private databaseHost(): string {
    try { return new URL(this.config.getOrThrow<string>('DATABASE_URL')).host; } catch { return 'configured'; }
  }

  private logStatus(service: string, state: ServiceState, detail?: string): void {
    const message = `${service.padEnd(16)} ${state.toUpperCase()}${detail ? ` | ${detail}` : ''}`;
    if (state === 'unavailable') this.logger.warn(message); else this.logger.log(message);
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message.replace(/\s+/g, ' ').slice(0, 180) : 'unknown error';
  }
}