import 'dotenv/config';

let {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    npm_package_name,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    npm_package_version,
    PORT,
    LOG_LEVEL,
    LOG_STREAM,
    NODE_ENV,
    YOUTUBE_VIDEOS,
    YOUTUBE_TRANSCRIPT_PREFIX,
    YOUTUBE_VIDEO_INFO_PREFIX,
    REDIS_URL,
    SEARCHAPI_API_KEY,
    GOOGLE_PREFIX,
    GOOGLE_API_KEY,
    GOOGLE_EMBEDDING_MODEL,
    GOOGLE_SUMMARY_MODEL,
    OPENAI_PREFIX,
    OPENAI_API_KEY,
    OPENAI_ORGANIZATION,
    OPENAI_EMBEDDING_MODEL,
    OPENAI_SUMMARY_MODEL,
    USE,
} = process.env;

if (typeof USE === 'string') {
    USE = USE.toLowerCase();
}

const DEFAULT_GOOGLE_PREFIX = 'google';
const DEFAULT_OPENAI_PREFIX = 'openai';
const DEFAULT_VIDEO_INDEX_NAME = 'idx-videos';
const DEFAULT_VIDEO_PREFIX = 'video:';
const DEFAULT_VECTOR_SET = 'video-vectors';
const DEFAULT_SUMMARY_PREFIX = 'video-summary:';
const DEFAULT_ANSWER_PREFIX = 'video-answer:';
const DEFAULT_ANSWER_INDEX_NAME = 'idx-answers';
const DEFAULT_YOUTUBE_TRANSCRIPT_PREFIX = 'transcripts:';
const DEFAULT_YOUTUBE_VIDEO_INFO_PREFIX = 'yt-videos:';

export default {
    app: {
        NAME: npm_package_name ?? 'video-search',
        VERSION: npm_package_version ?? '0.0.0',
        FULL_NAME: `${npm_package_name ?? 'video-search'}@${
            npm_package_version ?? '0.0.0'
        }`,
        PORT: PORT ?? 8000,
    },
    searches: {
        KNN: 10,
    },
    log: {
        LEVEL: LOG_LEVEL ?? 'info',
        STREAM: LOG_STREAM ?? 'LOGS',
    },
    env: {
        DEV: typeof NODE_ENV === 'string' ? NODE_ENV === 'development' : true,
        PROD: NODE_ENV === 'production',
        STAGING: NODE_ENV === 'staging',
    },
    youtube: {
        VIDEOS: (
            YOUTUBE_VIDEOS ??
            'AJhTduDOVCs,c9Rr--1r6pk,FQzlq91g7mg,I-ohlZXXaxs,KUfufrwpBkM,LaiQFZ5bXaM,SzcpwtLRgyk,Z8qcpXyMAiA'
        ).split(','),
        TRANSCRIPT_PREFIX:
            YOUTUBE_TRANSCRIPT_PREFIX ?? DEFAULT_YOUTUBE_TRANSCRIPT_PREFIX,
        VIDEO_INFO_PREFIX:
            YOUTUBE_VIDEO_INFO_PREFIX ?? DEFAULT_YOUTUBE_VIDEO_INFO_PREFIX,
    },
    redis: {
        REDIS_URL: REDIS_URL ?? 'redis://localhost:6379',
        VIDEO_INDEX_NAME: DEFAULT_VIDEO_INDEX_NAME,
        VIDEO_PREFIX: DEFAULT_VIDEO_PREFIX,
        VECTOR_SET: DEFAULT_VECTOR_SET,
        SUMMARY_PREFIX: DEFAULT_SUMMARY_PREFIX,
        ANSWER_INDEX_NAME: DEFAULT_ANSWER_INDEX_NAME,
        ANSWER_PREFIX: DEFAULT_ANSWER_PREFIX,
    },
    search: {
        API_KEY: SEARCHAPI_API_KEY ?? '',
    },
    google: {
        PREFIX: GOOGLE_PREFIX ?? DEFAULT_GOOGLE_PREFIX,
        API_KEY: GOOGLE_API_KEY,
        EMBEDDING_MODEL: GOOGLE_EMBEDDING_MODEL ?? 'embedding-001',
        SUMMARY_MODEL: GOOGLE_SUMMARY_MODEL ?? 'gemini-pro',
    },
    openai: {
        PREFIX: OPENAI_PREFIX ?? DEFAULT_OPENAI_PREFIX,
        API_KEY: OPENAI_API_KEY,
        ORGANIZATION: OPENAI_ORGANIZATION,
        EMBEDDING_MODEL: OPENAI_EMBEDDING_MODEL ?? 'gpt-4',
        SUMMARY_MODEL: OPENAI_SUMMARY_MODEL ?? 'gpt-4',
    },
    use: {
        DEFAULT: USE ?? 'openai',
        GOOGLE: USE === 'google',
        OPENAI: USE === 'openai',
    },
};
