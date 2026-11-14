import { getRedisClient } from "@/lib/redis";

const productListCacheKey = "products:list";
const productListCacheTtlSeconds = 60;

export async function getProductListCache<T>(): Promise<T | null> {
  const redis = getRedisClient();
  if (!redis) return null;

  try {
    return await redis.get<T>(productListCacheKey);
  } catch (error) {
    console.error("Failed to read product-list cache:", error);
    return null;
  }
}

export async function setProductListCache(products: unknown): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    await redis.set(productListCacheKey, products, {
      ex: productListCacheTtlSeconds,
    });
  } catch (error) {
    console.error("Failed to write product-list cache:", error);
  }
}

export async function invalidateProductListCache(): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    await redis.del(productListCacheKey);
  } catch (error) {
    console.error("Failed to invalidate product-list cache:", error);
  }
}
