import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const productionOrigins = [
    'https://demonightlight.test9.io.vn',
    'https://www.demonightlight.test9.io.vn',
    'https://demonightlight.test9io.vn',
    'https://www.demonightlight.test9io.vn',
    'https://nightlife.lptech.info.vn',
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
bootstrap();
