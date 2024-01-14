import express from 'express';
import getApi from './api/index.js';
import * as transcripts from './transcripts/index.js';
import log from './log.js';
import { client } from './db.js';

const router = express.Router();

router.post('/videos', async (req, res) => {
    const { videos } = req.body as { videos: string[] };

    try {
        log.debug('Loading videos...', {
            location: 'router.videos.load',
            videos,
        });

        const google = getApi('google');
        const openai = getApi('openai');
        const documents = await transcripts.load(videos);

        await google.store.storeVideoVectors(
            await google.prompt.summarizeVideos(documents),
        );

        await openai.store.storeVideoVectors(
            await openai.prompt.summarizeVideos(documents),
        );

        res.status(200).json({ message: 'Videos loaded' });
    } catch (e) {
        log.error('Unexpected error in /videos', {
            error: {
                message: (e as Error).message,
                stack: (e as Error).stack,
            },
            location: 'router.videos',
        });

        res.status(500).json({ error: (e as Error).message });
    }
});

router.get('/videos/search', async (req, res) => {
    const { question } = req.query as { question: string };
    const useApi = req.headers['x-use-api'] as 'google' | 'openai' | undefined;

    try {
        const api = getApi(useApi);
        const results = await api.search.searchVideos(question);

        log.info('Results for question', {
            question,
            results,
            location: 'router.videos.search',
        });

        res.status(200).json({ ...results });
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

router.get('/healthcheck', async (req, res) => {
    try {
        const start = Date.now();
        await client.ping();
        const ms = Date.now() - start;
        res.status(200).send({
            status: 'ok',
            redis: {
                status: 'ok',
                ms,
            },
        });
    } catch (e) {
        res.status(500).send({
            status: 'error',
            redis: {
                status: 'error',
            },
        });
    }
});

export default router;
