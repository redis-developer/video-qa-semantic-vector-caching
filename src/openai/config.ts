import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import config from '../config.js';
import { client } from '../db.js';
import { RedisVectorStore } from 'langchain/vectorstores/redis';
import { ChatOpenAI } from 'langchain/chat_models/openai';

export const llm = new ChatOpenAI({
    openAIApiKey: config.openai.API_KEY,
    modelName: config.openai.MODEL,
});

export function getEmbeddings(modelName?: string) {
    return new OpenAIEmbeddings({
        openAIApiKey: config.openai.API_KEY,
        modelName: modelName ?? config.openai.MODEL,
    });
}

export const vectorStore = new RedisVectorStore(
    getEmbeddings(),
    {
        redisClient: client,
        indexName: config.redis.VIDEO_INDEX_NAME,
        keyPrefix: config.redis.VIDEO_PREFIX,
    }
);
