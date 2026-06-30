import dotenv from "dotenv";
import path from "path";
import {
  createClient,
  RedisClientType
} from "redis";


dotenv.config({
  path: path.join(__dirname, "../.env"),
});


const host =
  process.env.REDIS_HOST;

const port =
  Number(process.env.REDIS_PORT);


if (!host || !port || Number.isNaN(port)) {
  throw new Error(
    "Redis configuration missing. Please set REDIS_HOST and REDIS_PORT"
  );
}


// ==================== Redis Client ====================

export const redisClient: RedisClientType =
  createClient({
    socket: {
      host,
      port,

      reconnectStrategy(
        retries: number
      ) {

        const delay =
          Math.min(
            retries * 500,
            5000
          );


        console.log(
          `[Redis] reconnect attempt ${retries}, retrying in ${delay}ms`
        );


        return delay;
      },
    },
  });


// ==================== Events ====================

redisClient.on(
  "connect",
  () => {
    console.log(
      "[Redis] Connecting..."
    );
  }
);


redisClient.on(
  "ready",
  () => {
    console.log(
      "[Redis] Ready"
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
  "error",
  (error) => {

    console.error(
      "[Redis] Error:",
      error.message
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


// ==================== Startup ====================

export const redisReady =
  redisClient
    .connect()
    .then(() => {

      console.log(
        "[Redis] Connected successfully"
      );


      return redisClient;

    })
    .catch((error) => {

      console.error(
        "[Redis] Startup failed:",
        error.message
      );


      process.exit(1);

    });
