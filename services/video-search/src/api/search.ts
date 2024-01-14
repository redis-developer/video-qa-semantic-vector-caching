import { type VideoDocument } from '../transcripts/index.js';
import log from '../log.js';
import config from '../config.js';
import { type RedisVectorStore } from 'langchain/vectorstores/redis';
import { type ApiConfig } from './index.js';
import { type Prompt } from './prompt.js';

export interface SearchConfig extends Pick<ApiConfig, 'prefix'> {
    vectorStore: RedisVectorStore;
    answerVectorStore: RedisVectorStore;
    prompt: Prompt;
}

export interface Search {
    searchVideos: (
        question: string,
    ) => Promise<
        Record<string, any> | { videos: VideoDocument[]; answer: string }
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

    async function searchVideos(question: string) {
        log.debug(`Original question: ${question}`, {
            location: `${prefix}.search.search`,
        });
        const semanticQuestion = await prompt.getSemanticQuestion(question);

        const haveAnswers = await answerVectorStore.checkIndexExists();

        if (haveAnswers) {
            log.debug(`Searching for closest answer to question: ${question}`, {
                location: `${prefix}.search.getAnswer`,
                question,
            });

            const [result] = await answerVectorStore.similaritySearchWithScore(
                question,
                1,
            );

            log.debug(`Found closest answer with score: ${String(result[1])}`, {
                location: `${prefix}.search.getAnswer`,
                answer: result[0],
                score: result[1],
            });

            if (Array.isArray(result) && result.length > 0) {
                log.debug(`Found answer: ${result[0].metadata.answer}`, {
                    location: `${prefix}.search.getAnswer`,
                    result: result[0].metadata,
                });

                return result[0].metadata;
            }
        }

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

        const answerDocument = await prompt.answerQuestion(
            semanticQuestion,
            videos,
        );
        await answerVectorStore.addDocuments([answerDocument]);

        return answerDocument.metadata;
    }

    return {
        searchVideos,
    };
}
