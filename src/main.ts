import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EmptyHttpExceptionFilter } from './shared/empty-http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new EmptyHttpExceptionFilter());
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Культурный след — API')
    .setDescription('ЛР-4: отрывки произведений искусства, пользователи и сессии')
    .setVersion('4.0')
    .addCookieAuth('sessionId', undefined, 'sessionId')
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swaggerConfig));
  await app.listen(Number(process.env.PORT ?? 3000));
}

void bootstrap();
