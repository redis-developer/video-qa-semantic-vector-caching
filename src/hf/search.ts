import config from '../config.js';
import { client } from '../db.js';
import { generateTextEmbeddings } from './generate.js';

const float32Buffer = (arr: number[]) => {
    const floatArray = new Float32Array(arr);
    const float32Buffer = Buffer.from(floatArray.buffer);
    return float32Buffer;
};

export async function searchEmbeddings(search: string) {
    const embeddings = await generateTextEmbeddings(search.replace(/redis/gi, ''));
    const searchQuery = `*=>[KNN 3 @embedding $searchBlob AS score]`;

    return await client.ft.search(config.VIDEO_INDEX_NAME, searchQuery, {
        PARAMS: {
            searchBlob: float32Buffer(embeddings),
        },
        RETURN: ['score', 'id', 'fileName', 'link'],
        SORTBY: {
            BY: 'score',
            // DIRECTION: "DESC"
        },
        DIALECT: 2,
    });
}
