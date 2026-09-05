import { Redis } from "ioredis";

const redisUrl = process.env.REDIS_URL;

export let pubClient: Redis | null = null;
export let subClient: Redis | null = null;
export let isRedisConnected = false;

if (redisUrl) {
  try {
    console.log("[Redis] Initializing Redis connection from REDIS_URL...");
    pubClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 5) {
          console.warn("[Redis] Connection retries exceeded. Falling back to Memory Store.");
          return null;
        }
        return Math.min(times * 500, 2000);
      },
    });

    subClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 5) return null;
        return Math.min(times * 500, 2000);
      },
    });

    pubClient.on("connect", () => {
      isRedisConnected = true;
      console.log("[Redis] Successfully connected to Redis Cloud!");
    });

    pubClient.on("error", (err) => {
      console.error("[Redis Error]:", err.message);
    });

    subClient.on("error", (err) => {
      console.error("[Redis Sub Error]:", err.message);
    });
  } catch (err) {
    console.error("[Redis Initialization Failed]:", err);
  }
} else {
  console.log("[Redis] REDIS_URL not configured. Running in Memory Store mode.");
}
