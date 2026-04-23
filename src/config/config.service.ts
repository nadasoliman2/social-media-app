import { resolve } from 'node:path';
import { config } from 'dotenv';

// تعريف الأنواع عشان TypeScript ميعترضش
const envPath: Record<string, string> = {
    development: '.env.development',
    production: '.env.production',
};

// تحديد البيئة الحالية
const NODE_ENV = (process.env.NODE_ENV || 'development') as string;

// استخدام علامة التعجب (!) للتأكيد أن القيمة موجودة
const currentEnvFile = envPath[NODE_ENV]!;

// تحميل الملف من المجلد الرئيسي
config({ path: resolve(process.cwd(), currentEnvFile) });


console.log({ loadedEnv: currentEnvFile });
export const CLIENT_IDS = process.env.CLIENT_IDS?.split(',') || [];
export const DB_URL = process.env.DB_URL;
export const EMAIL_USER = process.env.EMAIL_USER
export const EMAIL_PASS = process.env.EMAIL_PASS
export const  IV_LENGTH = process.env.IV_LENGTH
export const  ENCRYPTION_byte = process.env.ENCRYPTION_byte
export const user_access_token_secret = process.env.user_access_token_secret
export const refresh_user_token_secret = process.env.refresh_user_token_secret
export const system_access_token_secret = process.env.system_access_token_secret
export const refresh_system_token_secret = process.env.refresh_system_token_secret
export const access_token_expires_in =parseInt(process.env.access_token_expires_in ?? '1800') 
export const refresh_token_expires_in =parseInt(process.env.refresh_token_expires_in ?? '31536000') as number
export const REDIS_URI = process.env.REDIS_URI
export const APPLICATION_NAME = process.env.APPLICATION_NAME
  export const AWS_REGION=process.env.AWS_REGION as string
export const AWS_BUCKET_NAME=process.env.AWS_BUCKET_NAME as string
export const AWS_ACCESS_KEY_ID=process.env.AWS_ACCESS_KEY_ID as string
export const AWS_SECRET_ACCESS_KEY=process.env.AWS_SECRET_ACCESS_KEY as string
export const AWS_EXPIRE_IN = parseInt(process.env.AWS_EXPIRE_IN || "120")