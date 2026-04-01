import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypedConfigModule } from './config/typed-config.module';
import { TypedConfigService } from './config/typed-config.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { UploadModule } from './modules/upload/upload.module';
import { CategoryModule } from './modules/category/category.module';
import { ProductModule } from './modules/product/product.module';
import { OrderModule } from './modules/order/order.module';
import { CartModule } from './modules/cart/cart.module';
import { PaymentModule } from './modules/payment/payment.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

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
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds rate limit count is tracked
        limit: 10, // max request allowed in ttl seconds
      },
    ]),
    AuthModule,
    UserModule,
    UploadModule,
    CategoryModule,
    ProductModule,
    OrderModule,
    CartModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    TypedConfigService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [TypedConfigService],
})
export class AppModule {}
