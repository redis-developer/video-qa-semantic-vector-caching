import { Document } from 'langchain/document';
import * as summarize from './summarize.js';
import { type VideoDocument } from '../transcripts/index.js';
import { llm, vectorStore, answerVectorStore } from './config.js';
import log from '../log.js';
import config from '../config.js';
import { ANSWER_PROMPT } from '../templates/answers.js';
import { StringOutputParser } from 'langchain/schema/output_parser';

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
const questionAnswerChain = ANSWER_PROMPT.pipe(llm as any).pipe(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    new StringOutputParser() as any,
);

async function getVideos(question: string) {
    log.debug(
        `Performing similarity search for videos that answer: ${question}`,
        {
            question,
            location: 'openai.search.search',
        },
    );

    const KNN = config.searches.KNN;
    /* Simple standalone search in the vector DB */
    return await (vectorStore.similaritySearch(question, KNN) as Promise<
        VideoDocument[]
    >);
}

async function getAnswer(question: string, videos: VideoDocument[]) {
    log.debug(`Getting answer for question: ${question}`, {
        location: 'openai.search.getAnswer',
    });

    const haveAnswers = await answerVectorStore.checkIndexExists();

    if (haveAnswers) {
        log.debug(`Searching for closest answer to question: ${question}`, {
            location: 'google.search.getAnswer',
            question,
        });

        const [result] = await answerVectorStore.similaritySearchWithScore(
            question,
            1,
        );

        log.debug(`Found closest answer with score: ${String(result[1])}`, {
            location: 'google.search.getAnswer',
            answer: result[0],
            score: result[1],
        });
        
        if (Array.isArray(result) && result.length > 0) {
            return result[0];
        }
    }

    const answer = (await questionAnswerChain.invoke({
        question,
        data: JSON.stringify(videos),
    })) as string;

    await answerVectorStore.addDocuments([
        new Document({
            metadata: {
                videos,
                answer,
            },
            pageContent: question,
        }),
    ]);

    return answer;
}

export async function search(question: string) {
    log.debug(`Original question: ${question}`, {
        location: 'openai.search.search',
    });
    const semanticQuestion = (await summarize.question(question)) as string;

    log.debug(`Semantic question: ${semanticQuestion}`, {
        location: 'openai.search.search',
    });
    let videos = await getVideos(semanticQuestion);

    if (videos.length === 0) {
        log.debug(
            'No videos found for semantic question, trying with original question',
            {
                location: 'openai.search.search',
            },
        );

        videos = await getVideos(question);
    }

    log.debug(`Found ${videos.length} videos`, {
        location: 'openai.search.search',
    });

    return {
        videos,
        answer: await getAnswer(semanticQuestion, videos),
    };
}
