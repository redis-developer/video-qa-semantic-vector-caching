import redis from 'redis';
import { type RedisJSON } from '@redis/json/dist/commands';
import config from './config.js';

export const client = redis
  .createClient({
    url: config.redis.REDIS_URL,
  })
  .on('error', (error) => {
    console.error(error);
  });

await client.connect();

export function cacheAside(prefix: string) {
  return {
    get: async (key: string) => {
      return await client.get(`${prefix}${key}`);
    },
    set: async (key: string, value: string) => {
      return await client.set(`${prefix}${key}`, value);
    },
  };
}

export function jsonCacheAside<T>(prefix: string) {
  return {
    get: async (key: string): Promise<T | undefined> => {
      return client.json.get(`${prefix}${key}`) as T;
    },
    set: async (key: string, value: RedisJSON) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return await client.json.set(`${prefix}${key}`, '$', value);
    },
  };
}
