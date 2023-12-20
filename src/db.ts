import redis from 'redis';
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
      return client.get(`${prefix}${key}`);
    },
    set: async (key: string, value: string) => {
      return client.set(`${prefix}${key}`, value);
    },
  };
}
