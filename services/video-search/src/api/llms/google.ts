import config from '../../config.js';
import {
    ChatGoogleGenerativeAI,
    GoogleGenerativeAIEmbeddings,
} from '@langchain/google-genai';
import { TaskType } from '@google/generative-ai';

export const llm = new ChatGoogleGenerativeAI({
    apiKey: config.google.API_KEY,
    modelName: config.google.SUMMARY_MODEL,
    maxOutputTokens: 2048,
});

export function getEmbeddings(modelName?: string) {
    return new GoogleGenerativeAIEmbeddings({
        apiKey: config.google.API_KEY,
        modelName: modelName ?? config.google.EMBEDDING_MODEL,
        taskType: TaskType.SEMANTIC_SIMILARITY,
    });
}
