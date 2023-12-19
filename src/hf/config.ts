import config from '../config.js';
import { client } from '../db.js';
import { HuggingFaceTransformersEmbeddings } from "langchain/embeddings/hf_transformers";
import { RedisVectorStore } from 'langchain/vectorstores/redis';

export function getEmbeddings(modelName?: string) {
    return new HuggingFaceTransformersEmbeddings({
        modelName: modelName ?? config.hf.MODEL,
    });
}

export const embeddings = getEmbeddings();

export const vectorStore = new RedisVectorStore(
    embeddings,
    {
        redisClient: client,
        indexName: config.redis.VIDEO_INDEX_NAME,
        keyPrefix: config.redis.VIDEO_PREFIX,
    }
);
