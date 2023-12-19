import { Document } from 'langchain/document';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { RedisVectorStore } from 'langchain/vectorstores/redis';
import { PromptTemplate } from 'langchain/prompts';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { StringOutputParser } from 'langchain/schema/output_parser';
import { CaptionData } from '../captions.js';
import config from '../config.js';
import { client } from '../db.js';

const llm = new ChatOpenAI({
    openAIApiKey: config.OPENAI_API_KEY,
    modelName: 'gpt-4',
});

async function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getCaptionSummary(caption: string) {
    const template = `Please provide a summary of the following caption in 3-4 sentences. Only include the semantic summary with keywords:
    ***********************************************************
    caption: {caption}
    summary:
    ***********************************************************`;
    const prompt = PromptTemplate.fromTemplate(template);

    const chain = prompt.pipe(llm).pipe(new StringOutputParser());

    const response = await chain.invoke({
        caption,
    });

    await wait(60000);

    return response;
}

async function generateTextEmbeddings(
    videos: CaptionData[]
): Promise<RedisVectorStore> {
    let documents: Document<{
        id: string;
        fileName: string;
        link: string;
    }>[] = [];
    for (let video of videos) {
        const doc = new Document({
            metadata: {
                id: video.id,
                fileName: video.fileName,
                link: video.link,
            },
            pageContent: await getCaptionSummary(video.captions),
        });

        console.log(`Summary for ${doc.metadata.link}`);
        console.log(doc.pageContent);
        documents.push(doc);
    }

    let embeddings = new OpenAIEmbeddings({
        openAIApiKey: config.OPENAI_API_KEY,
        modelName: 'gpt-4',
    });

    return RedisVectorStore.fromDocuments(documents, embeddings, {
        redisClient: client,
        indexName: config.VIDEO_INDEX_NAME,
        keyPrefix: config.VIDEO_PREFIX,
    });
}

export { generateTextEmbeddings };
