import { Worker } from "bullmq";
import { v2 as cloudinary } from "cloudinary";
import OpenAI from "openai";
import IORedis from "ioredis";

const queueRedisUrl = process.env.QUEUE_REDIS_URL;
if (!queueRedisUrl) {
  throw new Error("QUEUE_REDIS_URL is required for the background worker");
}

const redis = new IORedis(queueRedisUrl, { maxRetriesPerRequest: null });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storeInfo = `
Store name: zengy.go
Products: Clothing, Accessories, Footwear
Location: India
Delivery time: 3-7 working days depending on location.
Cash on Delivery: Available on selected products.
Return policy: 7 days return for unused items with tags.
Support:
- Email: support@zengy.go
- WhatsApp: +91-xxxxxxxxxx
`;

const worker = new Worker(
  "zengy-background",
  async (job) => {
    if (job.name === "chatbot.reply") {
      const response = await openai.responses.create({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content: `You are a helpful AI assistant for an Indian e-commerce website.
Use the following store info when answering:

${storeInfo}

Rules:
- Answer clearly and simply.
- If user asks about something you don't know (exact stock, exact order status, payment failure logs), say you don't know and ask them to contact support.
- If user asks about products, ask their price range, color preference etc if needed.
- DO NOT invent fake discounts or policies.`,
          },
          { role: "user", content: job.data.message },
        ],
      });

      return {
        reply:
          response.output_text ||
          "Sorry, I couldn't generate a response. Please try again.",
      };
    }

    if (job.name === "product.image.cleanup") {
      return cloudinary.uploader.destroy(job.data.publicId);
    }

    throw new Error(`Unsupported background job: ${job.name}`);
  },
  { connection: redis, concurrency: 5 }
);

worker.on("failed", (job, error) => {
  console.error(`Background job ${job?.id ?? "unknown"} failed:`, error);
});

worker.on("error", (error) => {
  console.error("Background worker error:", error);
});

async function shutdown() {
  await worker.close();
  await redis.quit();
}

process.once("SIGINT", () => void shutdown());
process.once("SIGTERM", () => void shutdown());
