import { redisclient } from "../../DB/db.redis.js";
import { EmailEnum } from "../enums/email.enum.js";
import { Types } from "mongoose";

/* =========================
   🔐 Keys Builders
========================= */

interface SetOptions {
  key: string;
  value: unknown;
  ttl?: number;
}
type RedisKeyType ={email:string,subject?:EmailEnum}
export class RedisService {
  constructor(){

  }
  revokeTokenKey = ({
  userId,
  jti,
}: {
  userId: Types.ObjectId | string,
  jti: string
}): string => {
  return `RevokeToken::${userId}::${jti}`;
};

  otpKey = ({
  email,
  subject = EmailEnum.ConfirmEmail,
}: RedisKeyType):string => {
  return `OTP::User::${email}::${subject}`;
};

  blockOtpKey = ({
  email,
  subject = EmailEnum.ConfirmEmail,
}: RedisKeyType):string=> {
  return `OTP::User::${email}::${subject}::Block`;
};

  maxAttemptOtpKey = ({
  email,
  subject = EmailEnum.ConfirmEmail,
}: RedisKeyType) :string=> {
  return `OTP::User::${email}::${subject}::MaxTrial`;
};

  baseRevokeTokenKey = (userId: Types.ObjectId | string): string => {
  return `RevokeToken::${userId}`;
};

/* =========================
   🔧 Redis Operations
========================= */

  set = async ({
  key,
  value,
  ttl,
}: SetOptions): Promise<string | null> => {
  try {
    const data =
      typeof value === "string" ? value : JSON.stringify(value);

    return ttl
      ? await redisclient.set(key, data, { EX: ttl })
      : await redisclient.set(key, data);
  } catch (error) {
    console.log(`fail in redis set operation ${error}`);
    return null;
  }
};

 update = async ({
  key,
  value,
  ttl,
}: SetOptions): Promise<string | number | null> => {
  try {
    const exists = await redisclient.exists(key);
    if (!exists) return 0;

    return await this.set({ key, value, ...(ttl !== undefined && { ttl })})
  } catch (error) {
    console.log(`fail in redis update operation ${error}`);
    return null;
  }
};


  get = async <T = unknown>(
  key: string
): Promise<T | string | null> => {
  try {
    const data = await redisclient.get(key);
    if (!data) return null;

    try {
      return JSON.parse(data) as T;
    } catch {
      return data;
    }
  } catch (error) {
    console.log(`fail in redis get operation ${error}`);
    return null;
  }
};

  ttl = async (key: string): Promise<number | null> => {
  try {
    return await redisclient.ttl(key);
  } catch (error) {
    console.log(`fail in redis ttl operation ${error}`);
    return null;
  }
};

  exist = async (key: string): Promise<number | null> => {
  try {
    return await redisclient.exists(key);
  } catch (error) {
    console.log(`fail in redis exist operation ${error}`);
    return null;
  }
};

  expire = async ({
  key,
  ttl,
}: {
  key: string;
  ttl: number;
}): Promise<number | null> => {
  try {
    return await redisclient.expire(key, ttl);
  } catch (error) {
    console.log(`fail in redis expire operation ${error}`);
    return null;
  }
};

  mGet = async (
  keys: string[]
): Promise<(string | null)[] | null> => {
  try {
    if (!keys.length) return [];
    return await redisclient.mGet(keys);
  } catch (error) {
    console.log(`fail in redis mGet operation ${error}`);
    return null;
  }
};

  keys = async (
  prefix: string
): Promise<string[] | null> => {
  try {
    return await redisclient.keys(`${prefix}*`);
  } catch (error) {
    console.log(`fail in redis keys operation ${error}`);
    return null;
  }
};

  deleteKey = async (
  keys: string[]
): Promise<number | null> => {
  try {
    if (!keys?.length) return 0;
    return await redisclient.del(...keys);
  } catch (error) {
    console.log(`fail in redis del operation ${error}`);
    return null;
  }
};

 incr = async (key: string): Promise<number | null> => {
  try {
    return await redisclient.incr(key);
  } catch (error) {
    console.log(`fail in redis incr operation ${error}`);
    return null;
  }
}
} 
export default new RedisService()