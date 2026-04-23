import { resolve } from 'node:path';
import { config } from 'dotenv';

// تحميل dotenv أول حاجة
const NODE_ENV = process.env.NODE_ENV || 'development'; // لو مش محدد، افتراضي development

const envPath = {
    development: `.env.development`,
    production: `.env.production`,
};

// Load env file
config({ path: resolve(`./config/${envPath[NODE_ENV]}`) });

console.log({ loadedEnv: envPath[NODE_ENV] });

// دلوقتي process.env موجودة

export const DB_URL = process.env.DB_URL;

console.log('DB_URL:', DB_URL);