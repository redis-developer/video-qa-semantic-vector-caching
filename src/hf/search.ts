import { vectorStore } from './config.js';
import { VectorDocument } from './store.js';

export async function search(search: string): Promise<VectorDocument[]> {
    const KNN = 3;
    return vectorStore.similaritySearch(search, KNN) as Promise<VectorDocument[]>;
}
