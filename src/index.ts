import config from './config.js';
import { getCaptionData } from './captions.js';
import * as openai from './openai/index.js';
import * as hf from './hf/index.js';
import { client } from './db.js';
import * as transcripts from './transcripts/index.js';

try {
    if (config.use.OPENAI) {
        const videos = await transcripts.load();
        const summaries = await openai.summarize(videos);
        await openai.store(summaries);
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
