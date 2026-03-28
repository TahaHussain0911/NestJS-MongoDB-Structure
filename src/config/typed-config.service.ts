import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvSchema } from './env.validation';

@Injectable()
export class TypedConfigService {
  constructor(private readonly config: ConfigService<EnvSchema, true>) {}

  get<K extends keyof EnvSchema>(key: K) {
    return this.config.get(key, { infer: true });
  }
}
