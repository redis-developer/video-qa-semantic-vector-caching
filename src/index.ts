import config from './config.js';
import * as openai from './openai/index.js';
import * as hf from './hf/index.js';
import { client } from './db.js';
import * as transcripts from './transcripts/index.js';

try {
    // const videos = await transcripts.load();

    if (config.use.OPENAI) {
        // const summaries = await openai.summarize(videos);
        // await openai.store(summaries);
        const result = await openai.summarize.question('I am new to Redis, I understand a little bit about using Redis for caching. However, I would like to learn more about Redis Streams. Can you help me with that?');

        console.log(result);
    } else if (config.use.HF) {
        //console.log(await getTranscripts());
        // await client.flushAll();
        // const documents = hf.generate.documentEmbeddings(captions);
        // await hf.store(documents);
        // const results = await hf.search('Redis Streams');

        // console.log(results.map((r) => r.metadata.link));
    }

    process.exit();
} catch (e) {
    console.log(e);
    process.exit(1);
}
