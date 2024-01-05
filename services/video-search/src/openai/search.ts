import * as summarize from './summarize.js';
import { VideoDocument } from '../transcripts/index.js';
import { vectorStore } from './config.js';
import log from '../log.js';

async function getVideos(question: string) {
  log.debug(
    `Performing similarity search for videos that answer: ${question}`,
    {
      question,
      location: 'openai.search.search',
    },
  );

  const KNN = 3;
  /* Simple standalone search in the vector DB */
  return vectorStore.similaritySearch(question, KNN) as Promise<
    VideoDocument[]
  >;
}

export async function search(question: string) {
  log.debug(`Original question: ${question}`, {
    location: 'openai.search.search',
  });
  const semanticQuestion = await summarize.question(question) as string;

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

  return videos;
}
