import { NextRequest } from "next/server";
import { getRedisClient } from "@/lib/redis";

type RateLimitEntry = {
  count: number;
   
  resetAt: number;
};

type RateLimitPolicy = {
  limit: number;
  windowMs: number;
};

const policies: Array<{ path: string; policy: RateLimitPolicy }> = [
  { path: "/api/auth/signup", policy: { limit: 5, windowMs: 15 * 60 * 1000 } }, 
  { path: "/api/chatbot", policy: { limit: 20, windowMs: 60 * 1000 } },
];
const defaultPolicy: RateLimitPolicy = { limit: 120, windowMs: 60 * 1000 };
const chatbotStatusPolicy: RateLimitPolicy = { limit: 60, windowMs: 60 * 1000 };
const maxEntries = 10_000;

const globalForRateLimit = globalThis as typeof globalThis & {
  rateLimitStore?: Map<string, RateLimitEntry>;
};
const store =
  globalForRateLimit.rateLimitStore ??
  (globalForRateLimit.rateLimitStore = new Map<string, RateLimitEntry>());
const incrementRateLimitScript = `
local count = redis.call("INCR", KEYS[1])
if count == 1 then
  redis.call("PEXPIREAT", KEYS[1], ARGV[1])
end
return count
`;

function getClientKey(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip =
    request.headers.get("x-real-ip") ??
    forwardedFor?.split(",")[0]?.trim() ??
    "unknown";

  return ip;
}

function getPolicy(pathname: string, method: string): RateLimitPolicy {
  if (method === "GET" && pathname.startsWith("/api/chatbot/")) {
    return chatbotStatusPolicy;
  }

  return (
    policies.find(
      ({ path }) => pathname === path || pathname.startsWith(`${path}/`)
    )?.policy ?? defaultPolicy
  );
}

export async function checkRateLimit(request: NextRequest) {
  const policy = getPolicy(request.nextUrl.pathname, request.method);
  const now = Date.now();
  const resetAt = Math.floor(now / policy.windowMs) * policy.windowMs + policy.windowMs;
  const window = Math.floor(now / policy.windowMs);
  const key = `${getClientKey(request)}:${policy.limit}:${policy.windowMs}:${window}`;
  const redis = getRedisClient();
  let count: number | null = null;

  if (redis) {
    try {
      count = await redis.eval<[string], number>(
        incrementRateLimitScript,
        [`rate-limit:${key}`],
        [String(resetAt)]
      );
    } catch (error) {
      console.error(
        "Failed to check the shared rate limit; using the local store:",
        error
      );
    }
  }

  if (count === null) {
    const entry = store.get(key);

    if (!entry || entry.resetAt <= now) {
      store.set(key, { count: 1, resetAt });
    } else if (entry.count <= policy.limit) {
      entry.count += 1;
    }

    if (store.size > maxEntries || Math.random() < 1 / 64) {
      for (const [entryKey, value] of store) {
        if (value.resetAt <= now) {
          store.delete(entryKey);
        }
      }

      while (store.size > maxEntries) {
        const oldestKey = store.keys().next().value;
        if (oldestKey === undefined) break;
        store.delete(oldestKey);
      }
    }

    count = store.get(key)?.count ?? 1;
  }

  return {
    allowed: count <= policy.limit,
    limit: policy.limit,
    remaining: Math.max(0, policy.limit - count),
    retryAfter: Math.max(1, Math.ceil((resetAt - now) / 1000)),
  };
}
