import { PromptTemplate } from 'langchain/prompts';

const summaryTemplate = `
You are an expert in summarizing YouTube videos.
Your goal is to create a summary of a video.
Below you find the transcript of a video:
--------
{text}
--------

The transcript of the video will also be used as the basis for a question and answer bot.
Provide some examples questions and answers that could be asked about the video. Make these questions very specific.

Total output will be a summary of the video and a list of example questions the user could ask of the video.

SUMMARY AND QUESTIONS:
`;

export const SUMMARY_PROMPT = PromptTemplate.fromTemplate(summaryTemplate);

const summaryRefineTemplate = `
You are an expert in summarizing YouTube videos.
Your goal is to create a summary of a video.
We have provided an existing summary up to a certain point: {existing_answer}

Below you find the transcript of a video:
--------
{text}
--------

Given the new context, refine the summary and example questions.
The transcript of the video will also be used as the basis for a question and answer bot.
Provide some examples questions and answers that could be asked about the video. Make
these questions very specific.
If the context isn't useful, return the original summary and questions.
Total output will be a summary of the video and a list of example questions the user could ask of the video.

SUMMARY AND QUESTIONS:
`;

export const SUMMARY_REFINE_PROMPT = PromptTemplate.fromTemplate(
  summaryRefineTemplate,
);
