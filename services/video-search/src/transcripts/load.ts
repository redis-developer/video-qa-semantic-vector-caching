import { Document } from 'langchain/document';
import { SearchApiLoader } from 'langchain/document_loaders/web/searchapi';
import config from '../config.js';
import { mapAsyncInOrder } from '../utils.js';
import { cacheAside, jsonCacheAside } from '../db.js';
import log from '../log.js';
import { youtube } from '@googleapis/youtube';

export type VideoDocument = Document<{
    id: string;
    link: string;
    title: string;
    description: string;
    thumbnail: string;
}>;

const youtubeApi = youtube({
    auth: config.google.API_KEY,
    version: 'v3',
});

export interface VideoInfo {
    title: string;
    description: string;
    thumbnail: string;
}

const cache = cacheAside(config.youtube.TRANSCRIPT_PREFIX);
const videoCache = jsonCacheAside<VideoInfo>(config.youtube.VIDEO_INFO_PREFIX);

async function getTranscript(
    video: string,
    info: VideoInfo,
): Promise<VideoDocument | undefined> {
    log.debug(
        `Getting transcript for https://www.youtube.com/watch?v=${video}`,
        {
            location: 'transcripts.load.getTranscript',
        },
    );

    const existingTranscript = await cache.get(video);

    if (typeof existingTranscript === 'string') {
        return new Document({
            metadata: {
                id: video,
                link: `https://www.youtube.com/watch?v=${video}`,
                ...info,
            },
            pageContent: existingTranscript,
        });
    }

    const loader = new SearchApiLoader({
        engine: 'youtube_transcripts',
        video_id: video,
        apiKey: config.search.API_KEY,
    });

    try {
        const [doc] = await loader.load();

        doc.metadata = {
            id: video,
            link: `https://www.youtube.com/watch?v=${video}`,
            ...info,
        };

        await cache.set(video, doc.pageContent);

        return doc as VideoDocument;
    } catch (e) {
        log.error(`Error loading transcript for ${video}`, {
            location: 'transcripts.load.getTranscript',
            error: e,
        });
    }
}

async function getVideoInfo(videos: string[]) {
    log.debug(`Getting info about videos: ${JSON.stringify(videos)}`, {
        location: 'transcripts.load.getVideoInfo',
    });

    const results: Record<string, VideoInfo> = {};
    const videosToLoad: string[] = [];

    await Promise.all(
        videos.map(async (video) => {
            const cachedVideo = await videoCache.get(video);

            if (typeof cachedVideo === 'undefined' || cachedVideo === null) {
                videosToLoad.push(video);

                return;
            }

            results[video] = cachedVideo;
        }),
    );

    if (videosToLoad.length === 0) {
        return results;
    }

    const response = await youtubeApi.videos.list({
        id: videosToLoad,
        part: ['snippet', 'contentDetails'],
    });

    const { items } = response.data;

    if (!Array.isArray(items) || items.length === 0) {
        return results;
    }

    await Promise.all(
        items.map(async (item) => {
            const { id, snippet } = item;

            if (typeof id !== 'string' || typeof snippet === 'undefined') {
                return;
            }

            const videoInfo = {
                title: snippet.title ?? '',
                description: snippet.description ?? '',
                thumbnail: snippet.thumbnails?.maxres?.url ?? '',
            };

            results[id] = videoInfo;
            await videoCache.set(id, videoInfo);
        }),
    );

    return results;
}

function parseVideoUrl(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (typeof match !== 'undefined' && match !== null && match[2].length > 0) {
        return match[2];
    } else if (url.length === 11) {
        // assume the url was an ID
        return url;
    }
}

export async function load(videos: string[] = config.youtube.VIDEOS) {
    const videosToLoad: string[] = videos.map(parseVideoUrl).filter((video) => {
        return typeof video === 'string';
    }) as string[];
    const videoInfo = await getVideoInfo(videosToLoad);

    const transcripts = await mapAsyncInOrder(videosToLoad, async (video) => {
        return await getTranscript(video, videoInfo[video]);
    });

    return transcripts.filter(
        (transcript) => typeof transcript !== 'undefined',
    ) as VideoDocument[];
}
