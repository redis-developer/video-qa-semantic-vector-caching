import { type BaseLanguageModelInterface } from 'langchain/base_language';
import { type EmbeddingsInterface } from 'langchain/embeddings/base';
import initializePrompt from './prompt.js';
import initializeSearch from './search.js';
import initializeStore from './store.js';
import { openai, google } from './llms/index.js';
import config from '../config.js';

export interface ApiConfig {
    prefix: string;
    llm: BaseLanguageModelInterface;
    embeddings: EmbeddingsInterface;
}

export type Apis = 'google' | 'openai';

export function initializeApi({ llm, prefix, embeddings }: ApiConfig) {
    const prompt = initializePrompt({ llm, prefix });
    const store = initializeStore({ prefix, embeddings });
    const search = initializeSearch({
        prefix,
        vectorStore: store.vectorStore,
        answerVectorStore: store.answerVectorStore,
        prompt,
    });

    return { prompt, search, store };
}

const apis = {
    google: initializeApi({
        prefix: config.google.PREFIX,
        embeddings: google.getEmbeddings(),
        llm: google.llm,
    }),
    openai: initializeApi({
        prefix: config.openai.PREFIX,
        embeddings: openai.getEmbeddings(),
        llm: openai.llm,
    }),
};

export default function getApi(api?: Apis) {
    if (typeof api === 'string') {
        api = api.toLowerCase() as Apis;
    }
    const defaultAPI = config.use.DEFAULT;

    return apis[api ?? defaultAPI] as ReturnType<typeof initializeApi>;
}
