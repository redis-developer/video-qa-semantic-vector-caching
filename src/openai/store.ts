import { client } from '../db.js';
import { vectorStore } from './config.js';
import { VideoDocument } from 'src/transcripts/load.js';
import config from '../config.js';

export async function store(
    documents: VideoDocument[]
) {
    console.log('Storing documents...');
    const newDocuments: VideoDocument[] = [];

    await Promise.all(documents.map(async (doc) => {
        const exists = await client.sIsMember(config.redis.VECTOR_SET, doc.metadata.id);

        if (!exists) {
            newDocuments.push(doc);
        }
    }));

    console.log(`Found ${newDocuments.length} new documents`);

    if (newDocuments.length === 0) {
        return;
    }

    await vectorStore.addDocuments(newDocuments);

    await Promise.all(newDocuments.map(async (doc) => {
        await client.sAdd(config.redis.VECTOR_SET, doc.metadata.id);
    }));
}
