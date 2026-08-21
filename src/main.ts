import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });
  const config = app.get(ConfigService);
  const production = config.get<string>('NODE_ENV') === 'production';

  app.useLogger(new Logger());
  app.getHttpAdapter().getInstance().disable('x-powered-by');

  const trustProxy = Number(config.get<string>('TRUST_PROXY_HOPS', '0'));
  if (Number.isSafeInteger(trustProxy) && trustProxy > 0) {
    app.getHttpAdapter().getInstance().set('trust proxy', trustProxy);
  }

  app.use(
    helmet({
      contentSecurityPolicy: production ? undefined : false,
      crossOriginResourcePolicy: { policy: 'same-site' },
      hsts: production
        ? { maxAge: 31_536_000, includeSubDomains: true, preload: true }
        : false,
    }),
  );

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      stopAtFirstError: false,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
      whitelist: true,
    }),
  );

  const origins = config
    .getOrThrow<string>('CORS_ORIGINS')
    .split(',')
    .map((origin) => origin.trim());
  app.enableCors({
    origin: origins,
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Idempotency-Key',
      'X-Request-Id',
      'Stripe-Signature',
    ],
    exposedHeaders: ['X-Request-Id'],
    maxAge: 600,
  });

  if (config.get<boolean>('ENABLE_SWAGGER')) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('NovaVolt API')
      .setDescription('Secure vehicle-rental operations API')
      .setVersion('2.0')
      .addBearerAuth()
      .build();
    SwaggerModule.setup(
      'docs',
      app,
      SwaggerModule.createDocument(app, swaggerConfig),
      {
        swaggerOptions: { persistAuthorization: false },
      },
    );
  }

  app.enableShutdownHooks();
  const port = config.getOrThrow<number>('PORT');
  await app.listen(port, '0.0.0.0');
  Logger.log(`NovaVolt API listening on port ${port}`, 'Bootstrap');
}

void bootstrap();
