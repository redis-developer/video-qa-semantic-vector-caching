import config from './config.js';
import * as openai from './openai/index.js';
import * as hf from './hf/index.js';
import * as transcripts from './transcripts/index.js';

try {
    const videos = await transcripts.load();

    if (config.use.OPENAI) {
        const summaries = await openai.summarize.docs(videos);
        await openai.store(summaries);
        const result = await openai.search('I am new to Redis, I understand a little bit about using Redis for caching. However, I would like to learn more about Redis Streams. Can you help me with that?');

        console.log(result.map((r) => r.metadata.link));
    } else if (config.use.HF) {
        const summaries = await hf.summarize.docs(videos);
        await hf.store(summaries);
        const result = await hf.search('I am new to Redis, I understand a little bit about using Redis for caching. However, I would like to learn more about Redis Streams. Can you help me with that?');

        console.log(result.map((r) => r.metadata.link));
    }

    process.exit();
} catch (e) {
    console.log(e);
    process.exit(1);
}
