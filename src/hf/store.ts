import { Document } from 'langchain/document';
import { vectorStore } from './config.js';

export type VectorDocument = Document<{
    id: string;
    fileName: string;
    link: string;
}>;

export async function store(
    documents: VectorDocument[]
) {
    await vectorStore.addDocuments(documents);
}
