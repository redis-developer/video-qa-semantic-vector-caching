import { Document } from 'langchain/document';
import { SearchApiLoader } from 'langchain/document_loaders/web/searchapi';
import config from '../config.js';
import { mapAsyncInOrder } from '../utils.js';
import { cacheAside } from '../db.js';
import log from '../log.js';

export type VideoDocument = Document<{
  id: string;
  fileName: string;
  link: string;
}>;

const cache = cacheAside('transcripts:');

async function getTranscript(video: string) {
  log.debug(`Getting transcript for https://www.youtube.com/watch?v=${video}`, {
    location: 'transcripts.load.getTranscript',
  });

  const existingTranscript = await cache.get(video);

  if (existingTranscript) {
    return [
      new Document({
        metadata: {
          id: video,
          fileName: video,
          link: `https://www.youtube.com/watch?v=${video}`,
        },
        pageContent: existingTranscript,
      }),
    ];
  }

  const loader = new SearchApiLoader({
    engine: 'youtube_transcripts',
    video_id: video,
    apiKey: config.search.API_KEY,
  });

  const docs: VideoDocument[] = (await loader.load()).map((doc) => {
    doc.metadata = {
      id: video,
      fileName: video,
      link: `https://www.youtube.com/watch?v=${video}`,
    };

    return doc as VideoDocument;
  });

  await cache.set(video, docs[0].pageContent);

  return docs;
}

export async function load() {
  return mapAsyncInOrder(config.youtube.VIDEOS, getTranscript);
}
