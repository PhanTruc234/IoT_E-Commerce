import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { csrfProtection } from './core/security/csrf.middleware';
import { clientIpMiddleware } from './core/security/client-ip';
import { PrismaExceptionFilter } from './core/filters/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  app.use(helmet());
  app.setGlobalPrefix('api');
  app.set('trust proxy', Number(config.get<string>('TRUST_PROXY') ?? 1));
  app.use(clientIpMiddleware(config.get<string>('CLIENT_IP_HEADER')));
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new PrismaExceptionFilter(app.get(HttpAdapterHost).httpAdapter));

  const origins = (config.get<string>('CORS_ORIGINS') ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: origins,
    credentials: true,
    maxAge: 600,
  });
  app.use(csrfProtection(origins));
  const swaggerEnabled =
    config.get<string>('SWAGGER_ENABLED') === 'true' || config.get<string>('NODE_ENV') !== 'production';
  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('TMDT IoT API')
      .setDescription('B2C e-commerce API cho thiết bị IoT & linh kiện điện tử')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = config.get<number>('PORT') ?? 3001;
  await app.listen(port);
  console.log(`Backend: http://localhost:${port}`);
  if (swaggerEnabled) console.log(`Swagger: http://localhost:${port}/api/docs`);
}
bootstrap();