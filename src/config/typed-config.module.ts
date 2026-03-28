import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypedConfigService } from './typed-config.service';
import { EnvSchema } from './env.validation';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [
    {
      provide: TypedConfigService,
      useFactory: (config: ConfigService<EnvSchema, true>) =>
        new TypedConfigService(config),
      inject: [ConfigService],
    },
  ],
  exports: [TypedConfigService],
})
export class TypedConfigModule {}
