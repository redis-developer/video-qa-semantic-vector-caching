import { Document } from 'langchain/document';
import { RedisVectorStore } from 'langchain/vectorstores/redis';
import { PromptTemplate } from 'langchain/prompts';
import { StringOutputParser } from 'langchain/schema/output_parser';
import { CaptionData } from '../captions.js';
import { llm, vectorStore } from './config.js';
import { wait } from '../utils.js';

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

async function textEmbeddings(
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

    await vectorStore.addDocuments(documents);

    return vectorStore;
}

export { textEmbeddings };
