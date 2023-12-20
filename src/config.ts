import 'dotenv/config';

export default {
  youtube: {
    VIDEOS: (
      process.env.YOUTUBE_VIDEOS ??
      'AJhTduDOVCs,c9Rr--1r6pk,FQzlq91g7mg,I-ohlZXXaxs,KUfufrwpBkM,LaiQFZ5bXaM,SzcpwtLRgyk,Z8qcpXyMAiA'
    ).split(','),
  },
  redis: {
    REDIS_URL: process.env.REDIS_URL ?? 'redis://localhost:6379',
  },
  search: {
    API_KEY: process.env.SEARCHAPI_API_KEY ?? '',
  },
  hf: {
    VIDEO_INDEX_NAME: 'idx-videos-hf',
    VIDEO_PREFIX: 'video-hf:',
    EMBEDDING_MODEL:
      process.env.HF_EMBEDDING_MODEL ?? 'Xenova/all-MiniLM-L6-v2',
    SUMMARY_MODEL:
      process.env.HF_SUMMARY_MODEL ?? 'Xenova/paraphrase-albert-small-v2',
    VECTOR_SET: 'video-vectors-hf',
  },
  openai: {
    VIDEO_INDEX_NAME: 'idx-videos',
    VIDEO_PREFIX: 'video:',
    API_KEY: process.env.OPENAI_API_KEY,
    ORGANIZATION: process.env.OPENAI_ORGANIZATION,
    EMBEDDING_MODEL: process.env.OPENAI_EMBEDDING_MODEL ?? 'gpt-4',
    SUMMARY_MODEL: process.env.OPENAI_SUMMARY_MODEL ?? 'gpt-4',
    VECTOR_SET: 'video-vectors',
  },
  use: {
    OPENAI: process.env.USE === 'OPENAI',
    HF: process.env.USE === 'HF',
  },
};
