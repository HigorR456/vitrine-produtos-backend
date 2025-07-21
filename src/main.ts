import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './shared/errors/global-exception.filter';
import * as cookieParser from 'cookie-parser';
import * as csurf from 'csurf';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const isProduction = process.env.NODE_ENV === 'production';

  app.enableCors({
    origin: [process.env.FRONTEND_DOMAIN],
    credentials: true,
  });

  app.use(cookieParser());

  app.use(
    csurf({
      cookie: {
        httpOnly: false,
        sameSite: isProduction ? 'none' : 'lax',
        secure: isProduction,
      },
    }),
  );

  app.enableShutdownHooks();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Product Showcase API')
    .setDescription('API RESTful.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.API_PORT ?? 4000).then(() => {
    console.table({
      url: `http://localhost:${process.env.API_PORT ?? 4000}`,
      swagger: `http://localhost:${process.env.API_PORT ?? 4000}/api`,
    });
  });
}
void bootstrap();
