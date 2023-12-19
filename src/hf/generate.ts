import * as transformers from '@xenova/transformers';

async function generateTextEmbeddings(text: string): Promise<number[]> {
    let modelName = 'Xenova/all-distilroberta-v1';
    let pipe = await transformers.pipeline('feature-extraction', modelName);

    let vectorOutput = await pipe(text, {
        pooling: 'mean',
        normalize: true,
    });

    const embeddings: number[] = Object.values(vectorOutput?.data);
    return embeddings;
}

export { generateTextEmbeddings };
