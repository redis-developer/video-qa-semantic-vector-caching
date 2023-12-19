import { Document } from 'langchain/document';
import { CaptionData } from '../captions.js';
import * as config from './config.js';
import { VectorDocument } from './store.js';

export async function queryEmbeddings(text: string): Promise<number[]> {
    return config.embeddings.embedQuery(text);
}

export function documentEmbeddings(videos: CaptionData[]): Document<{
    id: string;
    fileName: string;
    link: string;
}>[] {
    let documents: VectorDocument[] = [];

    for (let video of videos) {
        const doc = new Document({
            metadata: {
                id: video.id,
                fileName: video.fileName,
                link: video.link,
            },
            pageContent: video.captions,
        });
        documents.push(doc);
    }

    return documents;
}
