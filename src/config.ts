import 'dotenv/config';

export default {
    redis: {
        VIDEO_INDEX_NAME: 'idx-videos',
        VIDEO_PREFIX: 'video:',
    },
    hf: {
        MODEL: process.env.HF_MODEL ?? 'Xenova/all-MiniLM-L6-v2',
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
