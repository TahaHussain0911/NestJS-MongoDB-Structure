import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  SwaggerCustomCss,
  SwaggerDescription,
  SwaggerDevelopmentServer,
  SwaggerJwtAuth,
  SwaggerRefreshTokenAuth,
  SwaggerTitle,
} from './utils/swagger.constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
    .addServer(SwaggerDevelopmentServer, 'Development Server')
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
