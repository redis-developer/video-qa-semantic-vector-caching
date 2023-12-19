import config from './config.js';
import { getCaptionData } from './captions.js';
import { generateTextEmbeddings } from './openai/generate.js';
import { search } from './openai/search.js';

try {
    const captions = await getCaptionData();

    await generateTextEmbeddings(captions);

    // const results = await search('I want to learn more about Redis Streams. I am new to Redis and use it mostly for caching.');

    // await createIndex();

    // await Promise.all(
    //     captions.map(async (caption) => {
    //         const embedding = {
    //             id: caption.id,
    //             fileName: caption.fileName,
    //             link: caption.link,
    //             embedding: await generateTextEmbeddings(caption.captions),
    //         };

    //         return client.json.set(`${config.VIDEO_PREFIX}${caption.id}`, '$', embedding);
    //     })
    // );

    // const searchResults = await searchEmbeddings('Redis Streams');

    // console.log(JSON.stringify(searchResults, null, 2));

    process.exit();
} catch (e) {
    console.log(e);
    process.exit(1);
}
