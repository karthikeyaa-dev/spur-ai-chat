import dotenv from "dotenv";
import path from "path";
import { createClient } from "redis";


dotenv.config({
  path: path.join(__dirname, "../.env"),
});


const host = process.env.REDIS_HOST;
const port = Number(process.env.REDIS_PORT);


if (!host || !port || Number.isNaN(port)) {
  throw new Error(
    "Redis configuration missing. Please set REDIS_HOST and REDIS_PORT"
  );
}


console.log(
  `[Redis] Connecting to ${host}:${port}`
);


export const redisClient = createClient({
  socket: {
    host,
    port,

    reconnectStrategy(retries: number) {

      const delay = Math.min(
        retries * 500,
        5000
      );


      console.log(
        `[Redis] Reconnect attempt ${retries}, retrying in ${delay}ms`
      );


      return delay;
    },
  },
});


// ==================== Redis Events ====================

redisClient.on(
  "connect",
  () => {
    console.log("[Redis] Connecting...");
  }
);


redisClient.on(
  "ready",
  () => {
    console.log("[Redis] Ready");
  }
);


redisClient.on(
  "error",
  (error) => {

    console.error(
      "[Redis] Error:",
      error.message
    );

  }
);


redisClient.on(
  "reconnecting",
  () => {

    console.log(
      "[Redis] Reconnecting..."
    );

  }
);


redisClient.on(
  "end",
  () => {

    console.log(
      "[Redis] Connection closed"
    );

  }
);


// ==================== Startup Connection ====================

export const redisReady =
  redisClient
    .connect()
    .then(() => {

      console.log(
        "[Redis] Connection established successfully"
      );


      return redisClient;

    })
    .catch((error) => {

      console.error(
        "[Redis] Startup failed:",
        error.message
      );


      // stop application
      process.exit(1);

    });
