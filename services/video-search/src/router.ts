import express from 'express';
import config from './config.js';
import * as openai from './openai/index.js';
import * as hf from './hf/index.js';
import * as transcripts from './transcripts/index.js';
import log from './log.js';

const summarize = config.use.OPENAI ? openai.summarize : hf.summarize;
const store = config.use.OPENAI ? openai.store : hf.store;
const search = config.use.OPENAI ? openai.search : hf.search;

const router = express.Router();

router.post('/videos', async (req, res) => {
  const { videos } = req.body as { videos: string[] };

  try {
    log.debug('Loading videos...', {
        location: 'router.videos.load',
        videos
    });

    const documents = await transcripts.load(videos);
    const summaries = await summarize.docs(documents);
    await store(summaries);
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
