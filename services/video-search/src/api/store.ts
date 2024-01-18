import { type VideoDocument } from '../transcripts/index.js';
import log from '../log.js';
import config from '../config.js';
import { VectorAlgorithms } from 'redis';
import { client } from '../db.js';
import { RedisVectorStore } from 'langchain/vectorstores/redis';
import { type AnswerDocument } from './prompt.js';
import { type ApiConfig } from './index.js';

export interface Store {
    vectorStore: RedisVectorStore;
    answerVectorStore: RedisVectorStore;
    storeAnswers: (documents: AnswerDocument[]) => Promise<void>;
    storeVideoVectors: (documents: VideoDocument[]) => Promise<void>;
}

export default function initialize({
    prefix,
    embeddings,
}: Pick<ApiConfig, 'prefix' | 'embeddings'>): Store {
    const vectorStore = new RedisVectorStore(embeddings, {
        redisClient: client,
        indexName: `${prefix}-${config.redis.VIDEO_INDEX_NAME}`,
        keyPrefix: `${prefix}-${config.redis.VIDEO_PREFIX}`,
        indexOptions: {
            ALGORITHM: VectorAlgorithms.HNSW,
            DISTANCE_METRIC: 'COSINE',
        },
    });

    const answerVectorStore = new RedisVectorStore(embeddings, {
        redisClient: client,
        indexName: `${prefix}-${config.redis.ANSWER_INDEX_NAME}`,
        keyPrefix: `${prefix}-${config.redis.ANSWER_PREFIX}`,
        indexOptions: {
            ALGORITHM: VectorAlgorithms.FLAT,
            DISTANCE_METRIC: 'L2',
        },
    });

    async function storeAnswers(documents: AnswerDocument[]) {
        await answerVectorStore.addDocuments(documents);
    }

    async function storeVideoVectors(documents: VideoDocument[]) {
        log.debug('Storing documents...', {
            location: `${prefix}.store.store`,
        });
        const newDocuments: VideoDocument[] = [];

        await Promise.all(
            documents.map(async (doc) => {
                const exists = await client.sIsMember(
                    `${prefix}-${config.redis.VECTOR_SET}`,
                    doc.metadata.id,
                );

                if (!exists) {
                    newDocuments.push(doc);
                }
            }),
        );

        log.debug(`Found ${newDocuments.length} new documents`, {
            location: `${prefix}.store.store`,
        });

        if (newDocuments.length === 0) {
            return;
        }

        await vectorStore.addDocuments(newDocuments);

        await Promise.all(
            newDocuments.map(async (doc) => {
                await client.sAdd(
                    `${prefix}-${config.redis.VECTOR_SET}`,
                    doc.metadata.id,
                );
            }),
        );
    }

    return {
        vectorStore,
        answerVectorStore,
        storeAnswers,
        storeVideoVectors,
    };
}
