import { NestFactory } from '@nestjs/core';
import {
  BadRequestException,
  type ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { Express } from 'express';
import { AppModule } from './app.module';
import { createSecurityHeadersMiddleware } from './security/security-headers.middleware';
import { getAllowedOrigins } from './security/cors-origins';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const expressApp = app.getHttpAdapter().getInstance() as Express;
  expressApp.disable('x-powered-by');
  expressApp.set('trust proxy', trustProxySetting());
  app.use(
    createSecurityHeadersMiddleware(process.env.NODE_ENV === 'production'),
  );
  app.enableCors({
    origin: getAllowedOrigins(),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
      exceptionFactory: (errors: ValidationError[] = []) => {
        const fieldErrors = collectValidationFieldErrors(errors);
        return new BadRequestException({
          message: 'Thông tin nhập vào chưa hợp lệ. Vui lòng kiểm tra các trường được đánh dấu.',
          fieldErrors,
        });
      },
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

function collectValidationFieldErrors(
  errors: ValidationError[],
  parentPath = '',
): Record<string, string> {
  return errors.reduce<Record<string, string>>((result, error) => {
    const path = parentPath ? `${parentPath}.${error.property}` : error.property;
    const message = error.constraints ? Object.values(error.constraints)[0] : undefined;

    if (message) {
      result[path] = message;
    }

    Object.assign(result, collectValidationFieldErrors(error.children ?? [], path));
    return result;
  }, {});
}

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
