import { redisClient } from "./redis.js";

export class RedisCacheService {
  async get<T>(key: string): Promise<T | null> {
    const value = await redisClient.get(key);

    if (!value) {
      return null;
    }

    return JSON.parse(value) as T;
  }

  async set<T>(key: string, value: T, ttlInSeconds: number): Promise<void> {
    await redisClient.set(key, JSON.stringify(value), {
      EX: ttlInSeconds,
    });
  }

  async delete(key: string): Promise<void> {
    await redisClient.del(key);
  }
}
