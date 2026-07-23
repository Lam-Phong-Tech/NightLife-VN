import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { Express } from 'express';
import { AppModule } from './app.module';
import { createSecurityHeadersMiddleware } from './security/security-headers.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const expressApp = app.getHttpAdapter().getInstance() as Express;
  expressApp.disable('x-powered-by');
  expressApp.set('trust proxy', trustProxySetting());
  app.use(
    createSecurityHeadersMiddleware(process.env.NODE_ENV === 'production'),
  );
  const productionOrigins = [
    'https://demonightlight.test9.io.vn',
    'https://www.demonightlight.test9.io.vn',
    'https://partner.demonightlight.test9.io.vn',
    'https://admin.demonightlight.test9.io.vn',
    'https://auth.demonightlight.test9.io.vn',
    'https://demonightlight.test9io.vn',
    'https://www.demonightlight.test9io.vn',
    'https://nightlife.lptech.info.vn',
    'https://vietoru.com',
    'https://www.vietoru.com',
  ];
  const configuredOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      ...productionOrigins,
      ...configuredOrigins,
    ],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('NightLife-VN API Documentation')
    .setDescription(
      'Tài liệu đặc tả và kiểm thử RESTful API - Hệ thống NightLife-VN',
    )
    .setVersion('1.0.0')
    .addServer('http://localhost:3001', 'Local Development Server')
    .addServer(
      'https://demonightlight.test9.io.vn/api/backend',
      'Staging Server',
    )
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/documentation', app, documentFactory, {
    swaggerOptions: {
      filter: true,
      displayRequestDuration: true,
    },
  });

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();

function trustProxySetting(): boolean | number | string {
  const configuredValue = process.env.TRUST_PROXY?.trim();

  if (!configuredValue) {
    return process.env.NODE_ENV === 'production' ? 1 : false;
  }

  if (configuredValue === 'true' || configuredValue === 'false') {
    return configuredValue === 'true';
  }

  if (/^\d+$/.test(configuredValue)) {
    return Number(configuredValue);
  }

  return configuredValue;
}
