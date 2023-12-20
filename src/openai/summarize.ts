import { Document } from 'langchain/document';
import { TokenTextSplitter } from 'langchain/text_splitter';
import { VideoDocument } from '../transcripts/index.js';
import {
    QUESTION_PROMPT,
    SUMMARY_PROMPT,
    SUMMARY_REFINE_PROMPT,
} from '../templates/index.js';
import { loadSummarizationChain } from 'langchain/chains';
import { llm } from './config.js';
import { StringOutputParser } from 'langchain/schema/output_parser';
import { cacheAside } from '../db.js';

const splitter = new TokenTextSplitter({
    chunkSize: 10000,
    chunkOverlap: 250,
});

const videoSummarizeChain = loadSummarizationChain(llm, {
    type: 'refine',
    questionPrompt: SUMMARY_PROMPT,
    refinePrompt: SUMMARY_REFINE_PROMPT,
});

const questionSummarizeChain = QUESTION_PROMPT.pipe(llm).pipe(
    new StringOutputParser()
);

const cache = cacheAside('summaries:');

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

        const docsSummary = await splitter.splitDocuments(docs);
        const summary = await videoSummarizeChain.run(docsSummary);

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
    const summary = questionSummarizeChain.invoke({
        question,
    });

    return summary;
}
