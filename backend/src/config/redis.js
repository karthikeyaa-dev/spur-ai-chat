const { createClient } = require('redis');

const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT;

const redisClient = createClient({
  socket: {
    host: redisHost,
    port: redisPort,
  },
});

redisClient.on('connect', () => {
  console.log('[Redis] connecting...');
});

redisClient.on('ready', () => {
  console.log('[Redis] connected and ready');
});

redisClient.on('error', (err) => {
  console.error('[Redis] error:', err);
});

const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

module.exports = {
  redisClient,
  connectRedis,
};
