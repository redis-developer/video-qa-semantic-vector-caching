import * as summarize from './summarize.js';
import { VideoDocument } from 'src/transcripts/load.js';
import { vectorStore } from './config.js';

async function getVideos(question: string) {
  const KNN = 3;
  /* Simple standalone search in the vector DB */
  return vectorStore.similaritySearch(question, KNN) as Promise<
    VideoDocument[]
  >;
}

export async function search(question: string) {
  console.log(`Original question: ${question}`);
  const semanticQuestion = await summarize.question(question);

  console.log(`Semantic question: ${semanticQuestion}`);
  const videos = await getVideos(semanticQuestion);

  return videos;
}
