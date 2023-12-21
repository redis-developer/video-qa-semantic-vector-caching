import { client } from '../db.js';
import { vectorStore } from './config.js';
import { VideoDocument } from '../transcripts/load.js';
import config from '../config.js';
import log from '../log.js';

export async function store(documents: VideoDocument[]) {
  log.debug('Storing documents...', {
    location: 'hf.store.store',
  });
  const newDocuments: VideoDocument[] = [];

  await Promise.all(
    documents.map(async (doc) => {
      const exists = await client.sIsMember(
        config.hf.VECTOR_SET,
        doc.metadata.id,
      );

      if (!exists) {
        newDocuments.push(doc);
      }
    }),
  );

  log.debug(`Found ${newDocuments.length} new documents`, {
    location: 'hf.store.store',
  });

  if (newDocuments.length === 0) {
    return;
  }

  await vectorStore.addDocuments(newDocuments);

  await Promise.all(
    newDocuments.map(async (doc) => {
      await client.sAdd(config.hf.VECTOR_SET, doc.metadata.id);
    }),
  );
}
