import * as summarize from './summarize.js';
import { type VideoDocument } from '../transcripts/index.js';
import { vectorStore } from './config.js';
import log from '../log.js';
import config from '../config.js';

async function getVideos(question: string) {
  log.debug(
    `Performing similarity search for videos that answer: ${question}`,
    {
      question,
      location: 'hf.search.search',
    },
  );

  const KNN = config.searches.KNN;
  /* Simple standalone search in the vector DB */
  return await (vectorStore.similaritySearch(question, KNN) as Promise<
    VideoDocument[]
  >);
}

export async function search(question: string) {
  log.debug(`Original question: ${question}`, {
    location: 'hf.search.search',
  });
  const semanticQuestion = await summarize.question(question);

  log.debug(`Semantic question: ${semanticQuestion}`, {
    location: 'hf.search.search',
  });
  let videos = await getVideos(semanticQuestion);

  if (videos.length === 0) {
    log.debug(
      'No videos found for semantic question, trying with original question',
      {
        location: 'hf.search.search',
      },
    );

    videos = await getVideos(question);
  }

  return videos;
}
