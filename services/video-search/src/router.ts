import express from 'express';
import config from './config.js';
import * as google from './google/index.js';
import * as hf from './hf/index.js';
import * as openai from './openai/index.js';
import * as transcripts from './transcripts/index.js';
import log from './log.js';

function getApi() {
  if (config.use.GOOGLE) {
    return {
      summarize: google.summarize,
      store: google.store,
      search: google.search,
    };
  } else if (config.use.HF) {
    return {
      summarize: hf.summarize,
      store: hf.store,
      search: hf.search,
    };
  } else {
    return {
      summarize: openai.summarize,
      store: openai.store,
      search: openai.search,
    };
  }
}

const { summarize, store, search } = getApi();

const router = express.Router();

router.post('/videos', async (req, res) => {
  const { videos } = req.body as { videos: string[] };

  try {
    log.debug('Loading videos...', {
      location: 'router.videos.load',
      videos,
    });

    const documents = await transcripts.load(videos);
    const summaries = await summarize.docs(documents);
    await store(summaries);

    res.status(200).json({ message: 'Videos loaded' });
  } catch (e) {
    log.error('Unexpected error in /videos/load', {
      error: {
        message: (e as Error).message,
        stack: (e as Error).stack,
      },
      location: 'router.videos.load',
    });

    res.status(500).json({ error: (e as Error).message });
  }
});

router.get('/videos/search', async (req, res) => {
  const { question } = req.query as { question: string };

  try {
    const results = await search(question);

    log.info('Results for question', {
      question,
      results,
      location: 'router.videos.search',
    });

    res.status(200).json({ results });
  } catch (e) {
    log.error('Unexpected error in /videos/search', {
      error: {
        message: (e as Error).message,
        stack: (e as Error).stack,
      },
      location: 'router.videos.search',
    });

    res.status(500).json({ error: (e as Error).message });
  }
});

export default router;
