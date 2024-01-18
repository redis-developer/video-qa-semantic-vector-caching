import { Document } from 'langchain/document';
// import * as summarize from './summarize.js';
import { type VideoDocument } from '../transcripts/index.js';
import log from '../log.js';
import config from '../config.js';
import { ANSWER_PROMPT } from './templates/answers.js';
import { StringOutputParser } from 'langchain/schema/output_parser';
import { cacheAside } from '../db.js';
import { TokenTextSplitter } from 'langchain/text_splitter';
import { loadSummarizationChain } from 'langchain/chains';
import {
    QUESTION_PROMPT,
    SUMMARY_PROMPT,
    SUMMARY_REFINE_PROMPT,
} from './templates/index.js';
import { type ApiConfig } from './index.js';

export type AnswerDocument = Document<{
    videos: VideoDocument[];
    answer: string;
    question?: string;
    isOriginal?: boolean;
}>;

export interface Prompt {
    answerQuestion: (
        question: string,
        videos: VideoDocument[],
    ) => Promise<AnswerDocument>;
    getSemanticQuestion: (question: string) => Promise<string>;
    summarizeVideos: (videos: VideoDocument[]) => Promise<VideoDocument[]>;
}

export default function initialize({
    llm,
    prefix,
}: Pick<ApiConfig, 'llm' | 'prefix'>): Prompt {
    const videoSummarizeChain = loadSummarizationChain(llm, {
        type: 'refine',
        questionPrompt: SUMMARY_PROMPT,
        refinePrompt: SUMMARY_REFINE_PROMPT,
    });

    const semanticQuestionChain = QUESTION_PROMPT.pipe(llm).pipe(
        new StringOutputParser(),
    );

    const questionAnswerChain = ANSWER_PROMPT.pipe(llm).pipe(
        new StringOutputParser(),
    );

    async function answerQuestion(question: string, videos: VideoDocument[]) {
        log.debug(`Getting answer for question: ${question}`, {
            location: `${prefix}.search.getAnswer`,
        });

        const answer = await questionAnswerChain.invoke({
            question,
            data: JSON.stringify(videos),
        });

        const answerDocument: AnswerDocument = new Document({
            metadata: {
                videos,
                answer,
            },
            pageContent: question,
        });

        return answerDocument;
    }

    async function getSemanticQuestion(question: string) {
        const summary = await semanticQuestionChain.invoke({
            question,
        });

        return summary;
    }

    const summaryCache = cacheAside(`${prefix}-${config.redis.SUMMARY_PREFIX}`);

    async function summarizeVideos(videos: VideoDocument[]) {
        const summarizedDocs: VideoDocument[] = [];

        for (const video of videos) {
            log.debug(`Summarizing ${video.metadata.link}`, {
                ...video.metadata,
                location: `${prefix}.summarize.docs`,
            });
            const existingSummary = await summaryCache.get(video.metadata.id);

            if (typeof existingSummary === 'string') {
                summarizedDocs.push(
                    new Document({
                        metadata: video.metadata,
                        pageContent: existingSummary,
                    }),
                );

                continue;
            }

            const splitter = new TokenTextSplitter({
                chunkSize: 10000,
                chunkOverlap: 250,
            });
            const docsSummary = await splitter.splitDocuments([video]);
            const summary = await videoSummarizeChain.run(docsSummary);

            log.debug(`Summarized ${video.metadata.link}:\n ${summary}`, {
                summary,
                location: `${prefix}.summarize.docs`,
            });
            await summaryCache.set(video.metadata.id, summary);

            summarizedDocs.push(
                new Document({
                    metadata: video.metadata,
                    pageContent: summary,
                }),
            );
        }

        return summarizedDocs;
    }

    return {
        answerQuestion,
        getSemanticQuestion,
        summarizeVideos,
    };
}
