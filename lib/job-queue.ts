import { Queue } from "bullmq";
import IORedis from "ioredis";
import { randomUUID } from "node:crypto";

export const backgroundQueueName = "zengy-background";

const globalForQueue = globalThis as typeof globalThis & {
  backgroundQueue?: Queue;
  backgroundQueueRedis?: IORedis;
};

function getQueueRedis(): IORedis {
  const url = process.env.QUEUE_REDIS_URL;
  if (!url) {
    throw new Error("QUEUE_REDIS_URL is required for background jobs");
  }

  return (globalForQueue.backgroundQueueRedis ??= new IORedis(url, {
    maxRetriesPerRequest: null,
  }));
}

export function getBackgroundQueue(): Queue {
  return (globalForQueue.backgroundQueue ??= new Queue(backgroundQueueName, {
    connection: getQueueRedis(),
  }));
}

const defaultJobOptions = {
  attempts: 3,
  backoff: { type: "exponential" as const, delay: 1_000 },
  removeOnComplete: { age: 60 * 60, count: 1_000 },
  removeOnFail: { age: 24 * 60 * 60, count: 1_000 },
};

export function enqueueChatbotReply(message: string) {
  return getBackgroundQueue().add(
    "chatbot.reply",
    { message },
    { ...defaultJobOptions, jobId: randomUUID() }
  );
}

export function enqueueProductImageCleanup(publicId: string) {
  return getBackgroundQueue().add(
    "product.image.cleanup",
    { publicId },
    { ...defaultJobOptions, jobId: randomUUID() }
  );
}
