import dotenv from "dotenv";
import path from "path";
import { createClient, RedisClientType } from "redis";

dotenv.config({ path: path.join(__dirname, "../.env") });

const host = process.env.REDIS_HOST;
const port = Number(process.env.REDIS_PORT);

if (!host || !port) {
  throw new Error(
    "Redis configuration missing. REDIS_HOST and REDIS_PORT are required."
  );
}

export const redisClient: RedisClientType = createClient({
  socket: {
    host,
    port,
    reconnectStrategy(retries) {
      if (retries > 5) {
        return new Error("Redis retry limit reached");
      }

      return Math.min(retries * 500, 3000);
    },
  },
});

redisClient.on("connect", () => {
  console.log("[Redis] Connecting...");
});

redisClient.on("ready", () => {
  console.log("[Redis] Ready");
});

redisClient.on("error", (err) => {
  console.error("[Redis] Error:", err.message);
});

export async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

connectRedis()
  .catch((err) => {
    console.error("[Redis] Startup failed:", err.message);
    process.exit(1);
  });
