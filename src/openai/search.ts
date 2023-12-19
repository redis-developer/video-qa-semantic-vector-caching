import config from '../config.js';
import { PromptTemplate } from "langchain/prompts";
import { client } from '../db.js';
import {
    ChatOpenAI,
} from 'langchain/chat_models/openai';
import { StringOutputParser } from 'langchain/schema/output_parser';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { RedisVectorStore } from 'langchain/vectorstores/redis';

const llm = new ChatOpenAI({
    openAIApiKey: config.OPENAI_API_KEY,
});

async function getSemanticQuestionMeaning(question: string) {
    const template = `Given some conversation history (if any) and a question, provide the semantic question.
    ***********************************************************
    conversation history:
    ***********************************************************
    question: {question}
    semantic question:`;
    const prompt = PromptTemplate.fromTemplate(
        template
    );

    const chain = prompt
        .pipe(llm)
        .pipe(new StringOutputParser());

    const response = await chain.invoke({
        question: question,
    });

    console.log(response);

    return response;
}

async function getVideos(question: string) {
    console.log('Getting OpenAI Embeddings');
    const embeddings = new OpenAIEmbeddings({
        openAIApiKey: config.OPENAI_API_KEY,
        modelName: 'gpt-4',
    });

    const vectorStore = new RedisVectorStore(
        embeddings,
        {
            redisClient: client,
            indexName: config.VIDEO_INDEX_NAME,
            keyPrefix: config.VIDEO_PREFIX,
        }
    );

    const KNN = 3;
    /* Simple standalone search in the vector DB */
    const vectorDocs = await vectorStore.similaritySearch(question, KNN);

    return vectorDocs;
}

export async function search(question: string) {
    console.log(`Original question: ${question}`);
    const semanticQuestion = await getSemanticQuestionMeaning(question);

    console.log(`Semantic question: ${semanticQuestion}`);
    const videos = await getVideos(semanticQuestion);

    return videos;
}
