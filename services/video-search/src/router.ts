import express from 'express';
import config from './config.js';
import * as google from './google/index.js';
import * as openai from './openai/index.js';
import * as transcripts from './transcripts/index.js';
import log from './log.js';
import { client } from './db.js';

function getApi(api?: 'google' | 'openai') {
    if (typeof api === 'string') {
        api = api.toLowerCase() as 'google' | 'openai';
    }
    const defaultAPI = config.use.DEFAULT;

    return {
        google,
        openai,
    }[api ?? defaultAPI] as typeof openai;
}

const defaultApi = getApi();

const router = express.Router();

async function loadVideos({
    api,
    videos,
}: {
    api: typeof defaultApi;
    videos: string[];
}) {
    log.debug('Loading videos...', {
        location: 'router.videos.load',
        videos,
    });

    const documents = await transcripts.load(videos);
    const summaries = await api.summarize.docs(documents);
    await api.store(summaries);
}

async function search({
    api,
    question,
}: {
    api: typeof defaultApi;
    question: string;
}) {
    const results = await api.search(question);

    log.info('Results for question', {
        question,
        results,
        location: 'router.videos.search',
    });

    return results;
}

router.post('/videos', async (req, res) => {
    const { videos } = req.body as { videos: string[] };
    const apis: ['google', 'openai'] = ['google', 'openai'];

    try {
        await Promise.all(
            apis.map(async (api) => {
                await loadVideos({ api: getApi(api), videos });
            }),
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
    const api = getApi(useApi);

    try {
        const results = await search({ api, question });

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
