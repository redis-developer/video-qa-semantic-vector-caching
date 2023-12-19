import { vectorStore } from './config.js';
import { VideoDocument } from 'src/transcripts/load.js';

export async function store(
    documents: VideoDocument[]
) {
    await vectorStore.addDocuments(documents);
}
