import 'dotenv/config';

const {
  YOUTUBE_VIDEOS,
  REDIS_URL,
  SEARCHAPI_API_KEY,
  HF_VIDEO_INDEX_NAME,
  HF_VIDEO_PREFIX,
  HF_EMBEDDING_MODEL,
  HF_SUMMARY_MODEL,
  HF_VECTOR_SET,
  OPENAI_VIDEO_INDEX_NAME,
  OPENAI_API_KEY,
  OPENAI_ORGANIZATION,
  OPENAI_EMBEDDING_MODEL,
  OPENAI_SUMMARY_MODEL,
  OPENAI_VECTOR_SET,
  USE,
} = process.env;

export default {
  app: {
    NAME: process.env.npm_package_name ?? 'video-search',
    VERSION: process.env.npm_package_version ?? '0.0.0',
    FULL_NAME: `${process.env.npm_package_name ?? 'video-search'}@${
      process.env.npm_package_version ?? '0.0.0'
    }`,
    PORT: process.env.PORT ?? 3001,
  },
  log: {
    LEVEL: process.env.LOG_LEVEL ?? 'info',
    STREAM: process.env.LOG_STREAM ?? 'LOGS',
  },
  env: {
    DEV: process.env.NODE_ENV === 'development',
    PROD: process.env.NODE_ENV === 'production',
    STAGING: process.env.NODE_ENV === 'staging',
  },
  youtube: {
    VIDEOS: (
      YOUTUBE_VIDEOS ??
      'AJhTduDOVCs,c9Rr--1r6pk,FQzlq91g7mg,I-ohlZXXaxs,KUfufrwpBkM,LaiQFZ5bXaM,SzcpwtLRgyk,Z8qcpXyMAiA'
    ).split(','),
  },
  redis: {
    REDIS_URL: REDIS_URL ?? 'redis://localhost:6379',
  },
  search: {
    API_KEY: SEARCHAPI_API_KEY ?? '',
  },
  hf: {
    VIDEO_INDEX_NAME: HF_VIDEO_INDEX_NAME ?? 'idx-videos-hf',
    VIDEO_PREFIX: HF_VIDEO_PREFIX ?? 'video-hf:',
    EMBEDDING_MODEL: HF_EMBEDDING_MODEL ?? 'Xenova/all-MiniLM-L6-v2',
    SUMMARY_MODEL: HF_SUMMARY_MODEL ?? 'Xenova/paraphrase-albert-small-v2',
    VECTOR_SET: HF_VECTOR_SET ?? 'video-vectors-hf',
  },
  openai: {
    VIDEO_INDEX_NAME: OPENAI_VIDEO_INDEX_NAME ?? 'idx-videos',
    VIDEO_PREFIX: OPENAI_VIDEO_INDEX_NAME ?? 'video:',
    API_KEY: OPENAI_API_KEY,
    ORGANIZATION: OPENAI_ORGANIZATION,
    EMBEDDING_MODEL: OPENAI_EMBEDDING_MODEL ?? 'gpt-4',
    SUMMARY_MODEL: OPENAI_SUMMARY_MODEL ?? 'gpt-4',
    VECTOR_SET: OPENAI_VECTOR_SET ?? 'video-vectors',
  },
  use: {
    OPENAI: USE === 'OPENAI',
    HF: USE === 'HF',
  },
};
