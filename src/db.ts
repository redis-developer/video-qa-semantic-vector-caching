import redis from 'redis';

export const client = redis.createClient();

client.on('error', (error) => {
    console.error(error);
});

await client.connect();
