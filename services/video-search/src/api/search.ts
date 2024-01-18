import { type VideoDocument } from '../transcripts/index.js';
import log from '../log.js';
import config from '../config.js';
import { type RedisVectorStore } from 'langchain/vectorstores/redis';
import { type ApiConfig } from './index.js';
import { type AnswerDocument, type Prompt } from './prompt.js';

export interface SearchConfig extends Pick<ApiConfig, 'prefix'> {
    vectorStore: RedisVectorStore;
    answerVectorStore: RedisVectorStore;
    prompt: Prompt;
}

export interface VideoSearchOptions {
    useCache?: boolean;
}

export interface Search {
    searchVideos: (
        question: string,
        options?: VideoSearchOptions,
    ) => Promise<
        Array<{
            videos: VideoDocument[];
            answer: string;
            isOriginal?: boolean | undefined;
        }>
    >;
}

export default function initialize({
    prefix,
    vectorStore,
    answerVectorStore,
    prompt,
}: SearchConfig): Search {
    async function getVideos(question: string) {
        log.debug(
            `Performing similarity search for videos that answer: ${question}`,
            {
                question,
                location: `${prefix}.search.search`,
            },
        );

        const KNN = config.searches.KNN;
        /* Simple standalone search in the vector DB */
        return await (vectorStore.similaritySearch(question, KNN) as Promise<
            VideoDocument[]
        >);
    }

    async function checkAnswerCache(question: string) {
        const haveAnswers = await answerVectorStore.checkIndexExists();

        if (!(haveAnswers && config.searches.answerCache)) {
            return;
        }

        log.debug(`Searching for closest answer to question: ${question}`, {
            location: `${prefix}.search.getAnswer`,
            question,
        });

        /**
         * Scores will be between 0 and 1, where 0 is most accurate and 1 is least accurate
         */
        let results = (await answerVectorStore.similaritySearchWithScore(
            question,
            config.searches.KNN,
        )) as Array<[AnswerDocument, number]>;

        if (Array.isArray(results) && results.length > 0) {
            // Filter out results with too high similarity score
            results = results.filter(
                (result) => result[1] <= config.searches.maxSimilarityScore,
            );

            const inaccurateResults = results.filter(
                (result) => result[1] > config.searches.maxSimilarityScore,
            );

            if (
                Array.isArray(inaccurateResults) &&
                inaccurateResults.length > 0
            ) {
                log.debug(
                    `Rejected ${inaccurateResults.length} similar answers that have a score > ${config.searches.maxSimilarityScore}`,
                    {
                        location: `${prefix}.search.getAnswer`,
                        scores: inaccurateResults.map((result) => result[1]),
                    },
                );
            }
        }

        if (Array.isArray(results) && results.length > 0) {
            log.debug(
                `Accepted ${results.length} similar answers that have a score <= ${config.searches.maxSimilarityScore}`,
                {
                    location: `${prefix}.search.getAnswer`,
                    scores: results.map((result) => result[1]),
                },
            );

            return results.map((result) => {
                return {
                    ...result[0].metadata,
                    question: result[0].pageContent,
                    isOriginal: false,
                };
            });
        }
    }

    async function searchVideos(
        question: string,
        { useCache = config.searches.answerCache }: VideoSearchOptions = {},
    ) {
        log.debug(`Original question: ${question}`, {
            location: `${prefix}.search.search`,
        });

        if (useCache) {
            const existingAnswer = await checkAnswerCache(question);

            if (typeof existingAnswer !== 'undefined') {
                return existingAnswer;
            }
        }

        const semanticQuestion = await prompt.getSemanticQuestion(question);

        log.debug(`Semantic question: ${semanticQuestion}`, {
            location: `${prefix}.search.search`,
        });
        let videos = await getVideos(semanticQuestion);

        if (videos.length === 0) {
            log.debug(
                'No videos found for semantic question, trying with original question',
                {
                    location: `${prefix}.search.search`,
                },
            );

            videos = await getVideos(question);
        }

        log.debug(`Found ${videos.length} videos`, {
            location: `${prefix}.search.search`,
        });

        const answerDocument = await prompt.answerQuestion(question, videos);

        if (config.searches.answerCache) {
            await answerVectorStore.addDocuments([answerDocument]);
        }

        return [
            {
                ...answerDocument.metadata,
                question: answerDocument.pageContent,
                isOriginal: true,
            },
        ];
    }

    return {
        searchVideos,
    };
}
