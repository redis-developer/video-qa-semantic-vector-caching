import * as summarize from './summarize.js';
import { VideoDocument } from '../transcripts/index.js';
import { vectorStore } from './config.js';
import log from '../log.js';

async function getVideos(question: string) {
  const KNN = 3;
  /* Simple standalone search in the vector DB */
  return vectorStore.similaritySearch(question, KNN) as Promise<
    VideoDocument[]
  >;
}

export async function search(question: string) {
  log.debug(`Original question: ${question}`, {
    location: 'openai.search.search'
  });
  const semanticQuestion = await summarize.question(question);

  log.debug(`Semantic question: ${semanticQuestion}`, {
    location: 'openai.search.search'
  });
  const videos = await getVideos(semanticQuestion);

  return videos;
}