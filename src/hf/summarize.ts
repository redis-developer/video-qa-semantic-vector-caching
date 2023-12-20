import { Document } from 'langchain/document';
import { embeddings } from './config.js';
import { VideoDocument } from '../transcripts/load.js';
import { cacheAside } from '../db.js';
import { pipeline } from '@xenova/transformers';
import config from '../config.js';

export async function queryEmbeddings(text: string): Promise<number[]> {
    return embeddings.embedQuery(text);
}

const cache = cacheAside('summaries-hf:');

async function summarizeText(text: string) {
    const generator = await pipeline('summarization', config.hf.SUMMARY_MODEL);

    const response =  await generator(text);

    return response?.[0]?.summary_text;
}

export async function docs(allDocs: VideoDocument[][]) {
    const summarizedDocs: VideoDocument[] = [];

    for (const docs of allDocs) {
        console.log(`Summarizing ${docs[0].metadata.link}`);
        const existingSummary = await cache.get(docs[0].metadata.id);

        if (existingSummary) {
            summarizedDocs.push(
                new Document({
                    metadata: docs[0].metadata,
                    pageContent: existingSummary,
                })
            );

            continue;
        }

        const summary = await summarizeText(docs[0].pageContent);

        await cache.set(docs[0].metadata.id, summary);

        summarizedDocs.push(
            new Document({
                metadata: docs[0].metadata,
                pageContent: summary,
            })
        );
    }

    return summarizedDocs;
}

export async function question(question: string) {
    return summarizeText(question);
}
