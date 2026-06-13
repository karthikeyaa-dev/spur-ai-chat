import dotenv from 'dotenv';
import path from 'path';
import { createClient } from 'redis';


dotenv.config({ path: path.join(__dirname, '../.env') });


class MockRedisClient {
  async get(key: string): Promise<string | null> {
    console.log(`[MockRedis] GET ${key}`);
    return null;
  }
  
  async set(key: string, value: string, options?: any): Promise<string | null> {
    console.log(`[MockRedis] SET ${key}`);
    return 'OK';
  }
  
  async del(key: string): Promise<number> {
    console.log(`[MockRedis] DEL ${key}`);
    return 1;
  }
  
  async exists(key: string): Promise<number> {
    console.log(`[MockRedis] EXISTS ${key}`);
    return 0;
  }
  
  async expire(key: string, seconds: number): Promise<boolean> {
    console.log(`[MockRedis] EXPIRE ${key}`);
    return true;
  }
  
  async sadd(key: string, member: string): Promise<number> {
    console.log(`[MockRedis] SADD ${key}`);
    return 1;
  }
  
  async smembers(key: string): Promise<string[]> {
    console.log(`[MockRedis] SMEMBERS ${key}`);
    return [];
  }
  
  async hset(key: string, field: string, value: string): Promise<number> {
    console.log(`[MockRedis] HSET ${key}`);
    return 1;
  }
  
  async hget(key: string, field: string): Promise<string | null> {
    console.log(`[MockRedis] HGET ${key}`);
    return null;
  }
  
  async hgetall(key: string): Promise<Record<string, string>> {
    console.log(`[MockRedis] HGETALL ${key}`);
    return {};
  }
  
  async keys(pattern: string): Promise<string[]> {
    console.log(`[MockRedis] KEYS ${pattern}`);
    return [];
  }
  
  async quit(): Promise<void> {
    console.log(`[MockRedis] QUIT`);
  }
  
  on(event: string, callback: (...args: any[]) => void): void {
  }
  
  get isOpen(): boolean {
    return false;
  }
}

const host: string | undefined = process.env.REDIS_HOST;
const port: number = Number(process.env.REDIS_PORT);
const isValidConfig: boolean = !!(host && port && !Number.isNaN(port));

let redisClient: any;
let redisReady: Promise<any> = Promise.resolve(null);

if (isValidConfig) {
  console.log(`[Redis] Connecting to ${host}:${port}`);
  
  let retryCount: number = 0;
  const MAX_RETRIES: number = 3;
  
  const realClient = createClient({
    socket: {
      host,
      port,
      reconnectStrategy: (retries: number): number | Error => {
        retryCount++;
        if (retryCount > MAX_RETRIES) {
          console.log('[Redis] Max retries reached, using mock mode');
          return new Error('Redis reconnect limit reached');
        }
        const delay: number = Math.min(retries * 200, 2000);
        console.log(`[Redis] Retry ${retryCount}/${MAX_RETRIES} in ${delay}ms`);
        return delay;
      },
    },
  });
  
  realClient.on('connect', () => console.log('[Redis] Connecting...'));
  realClient.on('ready', () => console.log('[Redis] Ready'));
  realClient.on('error', (err: Error) => console.error('[Redis] Error:', err.message));
  
  redisClient = realClient;
  
  const connectRedis = async (): Promise<any> => {
    try {
      if (!realClient.isOpen) {
        await realClient.connect();
      }
      return realClient;
    } catch (err) {
      console.error('[Redis] Connection failed:', err instanceof Error ? err.message : String(err));
      console.log('[Redis] Falling back to mock client');
      redisClient = new MockRedisClient();
      return redisClient;
    }
  };
  
  redisReady = connectRedis();
} else {
  console.warn('[Redis] Invalid config, using mock client');
  console.warn(`[Redis] REDIS_HOST=${host}, REDIS_PORT=${process.env.REDIS_PORT}`);
  redisClient = new MockRedisClient();
}

export { redisClient, redisReady };
