import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL is not defined");
}

export const redisClient = createClient({
  url: redisUrl,
});

redisClient.on("error", (error) => {
  console.error("Redis Client Error:", error);
});

export async function connectRedis(): Promise<void> {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }

  console.log("Redis connected successfully");
}
