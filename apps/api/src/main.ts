import 'reflect-metadata';
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
config({ path: resolve(__dirname, '../../../.env'), quiet: true });
import { NestFactory } from '@nestjs/core';
import { ConsoleLogger } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { json, Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module';
import { Errors } from './common/http';
async function bootstrap() {
  for (const key of [
    'DATABASE_URL',
    'JWT_SECRET',
    'ADMIN_ORIGIN',
    'WEB_ORIGIN',
    'STORAGE_ENDPOINT',
    'STORAGE_ACCESS_KEY',
    'STORAGE_SECRET_KEY',
    'STORAGE_BUCKET',
    'STORAGE_PUBLIC_URL',
  ])
    if (!process.env[key]) throw new Error(`Missing ${key}`);
  if (process.env.JWT_SECRET!.length < 48)
    throw new Error('JWT_SECRET must have at least 48 characters');
  if (process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE !== 'true')
    throw new Error('Production requires secure cookies');
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({ json: true }),
    bodyParser: false,
  });
  if (process.env.TRUST_PROXY === '1') app.getHttpAdapter().getInstance().set('trust proxy', 1);
  app.use((req: Request, res: Response, next: NextFunction) => {
    const requestId = randomUUID(),
      start = Date.now();
    res.setHeader('X-Request-ID', requestId);
    res.setHeader('Cache-Control', 'no-store');
    res.on('finish', () =>
      console.log(
        JSON.stringify({
          event: 'http_request',
          requestId,
          method: req.method,
          path: req.path,
          status: res.statusCode,
          durationMs: Date.now() - start,
        }),
      ),
    );
    next();
  });
  app.use(helmet());
  app.use(json({ limit: '128kb' }));
  app.use(cookieParser());
  app.enableCors({
    origin: [process.env.ADMIN_ORIGIN!, process.env.WEB_ORIGIN!],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  app.useGlobalFilters(new Errors());
  app.enableShutdownHooks();
  await app.listen(Number(process.env.API_PORT || 4100), process.env.API_HOST || '127.0.0.1');
}
bootstrap().catch((error) => {
  console.error(JSON.stringify({ event: 'startup_failed', message: error.message }));
  process.exit(1);
});
