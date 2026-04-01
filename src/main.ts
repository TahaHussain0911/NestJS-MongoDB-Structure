import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import {
  SwaggerCustomCss,
  SwaggerDescription,
  SwaggerJwtAuth,
  SwaggerLocalServer,
  SwaggerNgrokServer,
  SwaggerRefreshTokenAuth,
  SwaggerTitle,
} from './utils/swagger.constants';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });
  app.setViewEngine('ejs');
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  const config = new DocumentBuilder()
    .setTitle(SwaggerTitle)
    .setDescription(SwaggerDescription)
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        name: 'Access Token',
        description: 'User access token',
        bearerFormat: 'JWT',
        in: 'headers',
        scheme: 'bearer',
      },
      SwaggerJwtAuth,
    )
    .addBearerAuth(
      {
        type: 'http',
        name: 'Refresh Token',
        description: 'User refresh token',
        bearerFormat: 'JWT',
        in: 'headers',
        scheme: 'bearer',
      },
      SwaggerRefreshTokenAuth,
    )
    .addServer(SwaggerLocalServer, 'Local Server')
    .addServer(SwaggerNgrokServer, 'Ngrok Server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: SwaggerTitle,
    customCss: SwaggerCustomCss,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
