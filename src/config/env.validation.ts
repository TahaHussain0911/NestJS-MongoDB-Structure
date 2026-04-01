import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  AWS_S3_REGION: z.string(),
  AWS_S3_BUCKET_NAME: z.string(),
  AWS_S3_ACCESS_KEY_ID: z.string(),
  AWS_S3_SECRET_KEY: z.string(),
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
  FRONTEND_SUCCESS_URL: z.string(),
  FRONTEND_CANCEL_URL: z.string(),
  SMTP_EMAIL: z.string(),
  SMTP_HOST: z.string(),
  SMTP_PASSWORD: z.string(),
  BASE_URL: z.string(),
});

export type EnvSchema = z.infer<typeof envSchema>;
