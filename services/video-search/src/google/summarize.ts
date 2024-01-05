import { Document } from 'langchain/document';
import { TokenTextSplitter } from 'langchain/text_splitter';
import { VideoDocument } from '../transcripts/index.js';
import {
  QUESTION_PROMPT,
  SUMMARY_PROMPT,
  SUMMARY_REFINE_PROMPT,
} from '../templates/index.js';
import { loadSummarizationChain } from 'langchain/chains';
import { llm } from './config.js';
import { StringOutputParser } from 'langchain/schema/output_parser';
import { cacheAside } from '../db.js';
import log from '../log.js';
import config from '../config.js';

const splitter = new TokenTextSplitter({
  chunkSize: 10000,
  chunkOverlap: 250,
});

const videoSummarizeChain = loadSummarizationChain(llm as any, {
  type: 'refine',
  questionPrompt: SUMMARY_PROMPT,
  refinePrompt: SUMMARY_REFINE_PROMPT,
});

const questionSummarizeChain = QUESTION_PROMPT.pipe(llm as any).pipe(
  new StringOutputParser() as any,
);

const cache = cacheAside(config.google.SUMMARY_PREFIX);

export async function docs(allDocs: VideoDocument[][]) {
  const summarizedDocs: VideoDocument[] = [];

  for (const docs of allDocs) {
    log.debug(`Summarizing ${docs[0].metadata.link}`, {
      ...docs[0].metadata,
      location: 'google.summarize.docs',
    });
    const existingSummary = await cache.get(docs[0].metadata.id);

    if (existingSummary) {
      summarizedDocs.push(
        new Document({
          metadata: docs[0].metadata,
          pageContent: existingSummary,
        }),
      );

      continue;
    }

    const docsSummary = await splitter.splitDocuments(docs);
    const summary = await videoSummarizeChain.run(docsSummary);

    log.debug(`Summarized ${docs[0].metadata.link}:\n ${summary}`, {
        summary,
        location: 'google.summarize.docs',
    });
    await cache.set(docs[0].metadata.id, summary);

    summarizedDocs.push(
      new Document({
        metadata: docs[0].metadata,
        pageContent: summary,
      }),
    );
  }

  return summarizedDocs;
}

export async function question(question: string) {
  const summary = await questionSummarizeChain.invoke({
    question,
  });

  return summary;
}
