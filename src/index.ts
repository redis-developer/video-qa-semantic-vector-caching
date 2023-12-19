import config from './config.js';
import { getCaptionData } from './captions.js';
import * as openai from './openai/index.js';
import * as hf from './hf/index.js';
import { client } from './db.js';

try {
    const captions = await getCaptionData();

    if (config.use.OPENAI) {
        await openai.generate.textEmbeddings(captions);
    } else if (config.use.HF) {
        await client.flushAll();
        const documents = hf.generate.documentEmbeddings(captions);
        await hf.store(documents);
        const results = await hf.search('Redis Streams');

        console.log(results.map((r) => r.metadata.link));
    }

    process.exit();
} catch (e) {
    console.log(e);
    process.exit(1);
}
