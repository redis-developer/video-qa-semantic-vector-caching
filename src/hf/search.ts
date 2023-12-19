import { VideoDocument } from 'src/transcripts/load.js';
import { vectorStore } from './config.js';

export async function search(search: string): Promise<VideoDocument[]> {
    const KNN = 3;
    return vectorStore.similaritySearch(search, KNN) as Promise<VideoDocument[]>;
}
