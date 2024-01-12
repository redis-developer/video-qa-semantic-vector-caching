import * as summarize from './summarize.js';
import { type VideoDocument } from '../transcripts/index.js';
import { llm, vectorStore } from './config.js';
import log from '../log.js';
import config from '../config.js';
import { ANSWER_PROMPT } from '../templates/answers.js';
import { StringOutputParser } from 'langchain/schema/output_parser';
import { cacheAside } from '../db.js';

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
            location: 'google.search.search',
        },
    );

    const KNN = config.searches.KNN;
    /* Simple standalone search in the vector DB */
    return await (vectorStore.similaritySearch(question, KNN) as Promise<
        VideoDocument[]
    >);
}

const answerCache = cacheAside(config.google.ANSWER_PREFIX);

async function getAnswer(question: string, videos: VideoDocument[]) {
    log.debug(`Getting answer for question: ${question}`, {
        location: 'google.search.getAnswer',
    });

    const cachedAnswer = await answerCache.get(question);

    if (typeof cachedAnswer === 'string') {
        log.debug(`Found cached answer for question: ${question}`, {
            location: 'google.search.getAnswer',
        });

        return cachedAnswer;
    }

    const answer = (await questionAnswerChain.invoke({
        question,
        data: JSON.stringify(videos),
    })) as string;

    await answerCache.set(question, answer);

    return answer;
}

export async function search(question: string) {
    log.debug(`Original question: ${question}`, {
        location: 'google.search.search',
    });
    const semanticQuestion = (await summarize.question(question)) as string;

    log.debug(`Semantic question: ${semanticQuestion}`, {
        location: 'google.search.search',
    });
    let videos = await getVideos(semanticQuestion);

    if (videos.length === 0) {
        log.debug(
            'No videos found for semantic question, trying with original question',
            {
                location: 'google.search.search',
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
