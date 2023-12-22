import config from '../config.js';
import { client } from '../db.js';
import { RedisVectorStore } from 'langchain/vectorstores/redis';
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

export const llm = new ChatGoogleGenerativeAI({
  apiKey: config.google.API_KEY,
  modelName: config.google.SUMMARY_MODEL,
  maxOutputTokens: 10000,
});

export function getEmbeddings(modelName?: string) {
  return new GoogleGenerativeAIEmbeddings({
    apiKey: config.google.API_KEY,
    modelName: modelName ?? config.google.EMBEDDING_MODEL
  });
}

export const vectorStore = new RedisVectorStore(getEmbeddings(), {
  redisClient: client,
  indexName: config.google.VIDEO_INDEX_NAME,
  keyPrefix: config.google.VIDEO_PREFIX,
});
