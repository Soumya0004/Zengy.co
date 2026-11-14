import { Redis } from "@upstash/redis/cloudflare";

const globalForRedis = globalThis as typeof globalThis & {
  upstashRedis?: Redis;
};

let missingRedisConfigWarningLogged = false;

export function getRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    if (!missingRedisConfigWarningLogged) {
      console.warn(
        "Redis features are disabled: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required."
      );
      missingRedisConfigWarningLogged = true;
    }

    return null;
  }

  return (globalForRedis.upstashRedis ??= new Redis({ url, token }));
}
