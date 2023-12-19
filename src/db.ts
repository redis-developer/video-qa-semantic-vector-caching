import redis, {
    RediSearchSchema,
    SchemaFieldTypes,
    VectorAlgorithms,
} from 'redis';
import config from './config.js';

export const client = redis.createClient();

client.on('error', (error) => {
    console.error(error);
});

export async function createIndex() {
    const schema: RediSearchSchema = {
        '$.id': {
            type: SchemaFieldTypes.TEXT,
            NOSTEM: true,
            AS: 'id',
        },
        '$.fileName': {
            type: SchemaFieldTypes.TEXT,
            NOSTEM: true,
            AS: 'fileName',
        },
        '$.link': {
            type: SchemaFieldTypes.TEXT,
            NOSTEM: true,
            AS: 'link',
        },
        '$.embedding': {
            type: SchemaFieldTypes.VECTOR,
            TYPE: 'FLOAT32',
            ALGORITHM: VectorAlgorithms.FLAT,
            DIM: 768,
            DISTANCE_METRIC: 'L2',
            INITIAL_CAP: 111,
            BLOCK_SIZE: 111,
            AS: 'embedding',
        },
    };

    try {
        await client.ft.dropIndex(config.VIDEO_INDEX_NAME);
    } catch (e) {}

    await client.ft.create(config.VIDEO_INDEX_NAME, schema, {
        ON: 'JSON',
        PREFIX: 'video:',
    });
}

await client.connect();
