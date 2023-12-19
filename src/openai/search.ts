import * as summarize from './summarize.js';
import { llm, vectorStore } from './config.js';

async function getVideos(question: string) {
    console.log('Getting OpenAI Embeddings');
    const KNN = 3;
    /* Simple standalone search in the vector DB */
    return vectorStore.similaritySearch(question, KNN);
}

export async function search(question: string) {
    console.log(`Original question: ${question}`);
    const semanticQuestion = await summarize.question(question);

    console.log(`Semantic question: ${semanticQuestion}`);
    const videos = await getVideos(semanticQuestion);

    return videos;
}
