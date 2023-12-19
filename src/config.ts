import 'dotenv/config';

export default {
    youtube: {
        VIDEOS: (
            process.env.YOUTUBE_VIDEOS ??
            'AJhTduDOVCs,c9Rr--1r6pk,FQzlq91g7mg,I-ohlZXXaxs,KUfufrwpBkM,LaiQFZ5bXaM,SzcpwtLRgyk,Z8qcpXyMAiA'
        ).split(','),
    },
    redis: {
        VIDEO_INDEX_NAME: 'idx-videos',
        VIDEO_PREFIX: 'video:',
        REDIS_URL: process.env.REDIS_URL ?? 'redis://localhost:6379',
    },
    search: {
        API_KEY: process.env.SEARCHAPI_API_KEY ?? '',
    },
    hf: {
        EMBEDDING_MODEL:
            process.env.HF_EMBEDDING_MODEL ?? 'Xenova/all-MiniLM-L6-v2',
        SUMMARY_MODEL:
            process.env.HF_SUMMARY_MODEL ?? 'Xenova/paraphrase-albert-small-v2',
    },
    openai: {
        API_KEY: process.env.OPENAI_API_KEY,
        ORGANIZATION: process.env.OPENAI_ORGANIZATION,
        MODEL: process.env.OPENAI_MODEL ?? 'gpt-4',
    },
    use: {
        OPENAI: process.env.USE === 'OPENAI',
        HF: process.env.USE === 'HF',
    },
};
