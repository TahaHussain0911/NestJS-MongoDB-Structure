import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypedConfigModule } from './config/typed-config.module';
import { TypedConfigService } from './config/typed-config.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { UploadModule } from './modules/upload/upload.module';
import { CategoryModule } from './modules/category/category.module';

@Module({
  imports: [
    TypedConfigModule,
    MongooseModule.forRootAsync({
      imports: [TypedConfigModule],
      inject: [TypedConfigService],
      useFactory: (config: TypedConfigService) => {
        return {
          uri: config.get('DATABASE_URL'),
        };
      },
    }),
    AuthModule,
    UserModule,
    UploadModule,
    CategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService, TypedConfigService],
  exports: [TypedConfigService],
})
export class AppModule {}
