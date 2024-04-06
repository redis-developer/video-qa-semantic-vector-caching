import express from 'express';
import getApi from './api/index.js';
import * as transcripts from './transcripts/index.js';
import log from './log.js';
import { client } from './db.js';
import { type VideoSearchOptions } from './api/search.js';

const router = express.Router();

router.post('/videos', async (req, res) => {
    const { videos } = req.body as { videos: string[] };

    try {
        log.debug('Loading videos...', {
            location: 'router.videos.load',
            videos,
        });

        const google = getApi('google');
        const documents = await transcripts.load(videos);

        await google.store.storeVideoVectors(
            await google.prompt.summarizeVideos(documents),
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
    const { question, useCache } = req.query as {
        question: string;
        api: 'google' | 'openai';
        useCache?: 'true' | 'false';
    };

    try {
        const useApi = 'google';
        log.debug(`Searching videos using ${useApi}`, {
            question,
            location: 'router.videos.search',
        });
        const api = getApi(useApi);
        const searchOptions: VideoSearchOptions = {};

        if (typeof useCache === 'string') {
            if (useCache.toLowerCase() === 'true') {
                searchOptions.useCache = true;
            } else if (useCache.toLowerCase() === 'false') {
                searchOptions.useCache = false;
            }
        }

        const results = await api.search.searchVideos(question, searchOptions);

        log.info('Results found for question', {
            question,
            location: 'router.videos.search',
        });

        res.status(200).json(results);
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
