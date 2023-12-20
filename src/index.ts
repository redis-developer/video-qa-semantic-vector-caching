import config from './config.js';
import * as openai from './openai/index.js';
import * as hf from './hf/index.js';
import * as transcripts from './transcripts/index.js';

const question =
  'I am new to Redis, I understand a little bit about using Redis for caching. However, I would like to learn more about Redis Streams. Can you help me with that?';

const summarize = config.use.OPENAI ? openai.summarize : hf.summarize;
const store = config.use.OPENAI ? openai.store : hf.store;
const search = config.use.OPENAI ? openai.search : hf.search;

try {
  const videos = await transcripts.load();
  const summaries = await summarize.docs(videos);
  await store(summaries);
  const result = await search(question);

  console.log(result.map((r) => r.metadata.link));

  process.exit();
} catch (e) {
  console.log(e);
  process.exit(1);
}
