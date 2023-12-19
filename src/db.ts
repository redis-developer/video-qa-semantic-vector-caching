import redis from 'redis';
import config from './config.js';

export const client = redis.createClient({
    url: config.redis.REDIS_URL,
}).on('error', (error) => {
    console.error(error);
});

await client.connect();
