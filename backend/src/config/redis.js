const { createClient } = require('redis');

// Mock Redis client for fallback
class MockRedisClient {
  async get(key) {
    console.log(`[MockRedis] GET ${key}`);
    return null;
  }
  
  async set(key, value, options) {
    console.log(`[MockRedis] SET ${key}`);
    return 'OK';
  }
  
  async del(key) {
    console.log(`[MockRedis] DEL ${key}`);
    return 1;
  }
  
  async exists(key) {
    console.log(`[MockRedis] EXISTS ${key}`);
    return 0;
  }
  
  async expire(key, seconds) {
    console.log(`[MockRedis] EXPIRE ${key}`);
    return 1;
  }
  
  async sadd(key, member) {
    console.log(`[MockRedis] SADD ${key}`);
    return 1;
  }
  
  async smembers(key) {
    console.log(`[MockRedis] SMEMBERS ${key}`);
    return [];
  }
  
  async hset(key, field, value) {
    console.log(`[MockRedis] HSET ${key}`);
    return 1;
  }
  
  async hget(key, field) {
    console.log(`[MockRedis] HGET ${key}`);
    return null;
  }
  
  async hgetall(key) {
    console.log(`[MockRedis] HGETALL ${key}`);
    return {};
  }
  
  async keys(pattern) {
    console.log(`[MockRedis] KEYS ${pattern}`);
    return [];
  }
  
  on() {}
  
  get isOpen() {
    return false;
  }
}

// Validate Redis config
const host = process.env.REDIS_HOST;
const port = Number(process.env.REDIS_PORT);
const isValidConfig = host && port && !Number.isNaN(port);

let redisClient;
let redisReady = Promise.resolve(null);

if (isValidConfig) {
  console.log(`[Redis] Connecting to ${host}:${port}`);
  
  let retryCount = 0;
  const MAX_RETRIES = 3;
  
  redisClient = createClient({
    socket: {
      host,
      port,
      reconnectStrategy: (retries) => {
        retryCount++;
        if (retryCount > MAX_RETRIES) {
          console.log('[Redis] Max retries reached, using mock mode');
          return new Error('Redis reconnect limit reached');
        }
        const delay = Math.min(retries * 200, 2000);
        console.log(`[Redis] Retry ${retryCount}/${MAX_RETRIES} in ${delay}ms`);
        return delay;
      },
    },
  });
  
  redisClient.on('connect', () => console.log('[Redis] Connecting...'));
  redisClient.on('ready', () => console.log('[Redis] ✅ Ready'));
  redisClient.on('error', (err) => console.error('[Redis] Error:', err.message));
  
  const connectRedis = async () => {
    try {
      if (!redisClient.isOpen) {
        await redisClient.connect();
      }
      return redisClient;
    } catch (err) {
      console.error('[Redis] Connection failed:', err.message);
      console.log('[Redis] Falling back to mock client');
      return null;
    }
  };
  
  redisReady = connectRedis();
} else {
  console.warn('[Redis] ⚠️  Invalid config, using mock client');
  console.warn(`[Redis] REDIS_HOST=${host}, REDIS_PORT=${process.env.REDIS_PORT}`);
}

module.exports = {
  redisClient: redisClient || new MockRedisClient(),
  redisReady,
};
