import { PromptTemplate } from "langchain/prompts";
import { StringOutputParser } from 'langchain/schema/output_parser';
import { llm, vectorStore } from './config.js';

async function getSemanticQuestionMeaning(question: string) {
    const template = `Given some conversation history (if any) and a question, provide the semantic question.
    ***********************************************************
    conversation history:
    ***********************************************************
    question: {question}
    semantic question:`;
    const prompt = PromptTemplate.fromTemplate(
        template
    );

    const chain = prompt
        .pipe(llm)
        .pipe(new StringOutputParser());

    const response = await chain.invoke({
        question: question,
    });

    console.log(response);

    return response;
}

async function getVideos(question: string) {
    console.log('Getting OpenAI Embeddings');
    const KNN = 3;
    /* Simple standalone search in the vector DB */
    return vectorStore.similaritySearch(question, KNN);
}

export async function search(question: string) {
    console.log(`Original question: ${question}`);
    const semanticQuestion = await getSemanticQuestionMeaning(question);

    console.log(`Semantic question: ${semanticQuestion}`);
    const videos = await getVideos(semanticQuestion);

    return videos;
}
