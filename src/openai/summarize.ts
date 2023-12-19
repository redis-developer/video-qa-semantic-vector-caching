import { Document } from 'langchain/document';
import { TokenTextSplitter } from 'langchain/text_splitter';
import { VideoDocument } from '../transcripts/index.js';
import { SUMMARY_PROMPT, SUMMARY_REFINE_PROMPT } from '../templates/index.js';
import { loadSummarizationChain } from 'langchain/chains';
import { llm } from './config.js';

const splitter = new TokenTextSplitter({
    chunkSize: 10000,
    chunkOverlap: 250,
});

const summarizeChain = loadSummarizationChain(llm, {
    type: 'refine',
    questionPrompt: SUMMARY_PROMPT,
    refinePrompt: SUMMARY_REFINE_PROMPT,
});

export async function summarize(allDocs: VideoDocument[][]) {
    const summarizedDocs: VideoDocument[] = [];

    for (const docs of allDocs) {
        const docsSummary = await splitter.splitDocuments(docs);
        const summary = await summarizeChain.run(docsSummary);

        summarizedDocs.push(
            new Document({
                metadata: docs[0].metadata,
                pageContent: summary,
            })
        );
    }

    return summarizedDocs;
}
