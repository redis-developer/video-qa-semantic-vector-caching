# Generative AI YouTube Video Search

The purpose of this app is to let users search an existing bank of YouTube videos and get their questions answered.

## Installation & Setup

### Prerequisits

1. Node.js
2. Docker

### Setup

Install dependencies:

```
npm install
```

Run setup script (copies the .env.example files)

```
npm run setup
```

Edit the `services/video-search/.env` file to your liking, including the relevant API keys.

### Run

Start the docker containers

```
npm run dev
```

The containers are mounted to your local project director, so changes to the project will hot-reload.

## Functionality breakdown

The process for how this app functions is as follows:

1. Videos are uploaded to the video-search service by making a `POST http://localhost:8000/api/videos` request with the following body:

```json
{
    "videos": ["youTube-video-ids-or-urls"]
}
```

1. Both `Google` and `OpenAI` will be used to generate summaries and embeddings for the videos. You can edit `services/video-search/src/router.ts` if you don't want to use one or the other. You can also edit the `USE` environment variable for searches. `GOOGLE` uses Google and `OPENAI` uses OpenAI (case-insensitive).
1. A user goes to `http://localhost` and asks a question
1. The question is simplified by asking Google/OpenAI for a semantically similar, shorter version.
1. The semantic question is then used to search for videos that answer the question
1. The list of resulting videos is passed to Google/OpenAI to retrieve an actual answer to the question.
1. A vector embedding is generated for the question and stored in Redis with the videos and answer as the metadata. For future questions, the first step is to search this semantic cache to bypass calling Google/OpenAI.
1. The answer + resulting videos are passed back to the client

### Project layout

There are two workspaces in this project: `app` and `services/video-search`. `video-search` is the API, and `app` is a thin client built on top of the API using Next.js.

#### video-search service

Within the `video-search` service you will find a typical Express.js app. The bulk of the AI logic happens in the following directories:

1. `src/api/llms` - Contains all of the LLM setup (llm and embeddings generator) for Google and OpenAI
1. `src/api/templates` - Stores the LLM prompts for getting semantic questions, video summaries, and answers
1. `src/api/prompt` - Contains the logic for using the LLM prompt templates to call the LLMs and get responses
1. `src/api/search` - Contains the logic for performing the QA video search
1. `src/api/store` - Handles storing vectors in Redis
1. `src/transcripts` - Contains the logic to retrieve YouTube video information (title, description, thmubnail, and transcript)

Almost all of the remaining important logic is found in `src/router.ts` where you will find the three API routes:

1. `POST /api/videos` - Accepts a list of `{ "videos": [] }` which can be either full YouTube URLs or the video IDs.
1. `GET /api/videos/search` - Accepts a `?question=<question>` and returns a list of videos and the answer to the question
1. `GET /api/healthcheck` - Ensures the service is up and running and connected to Redis

## About the data

The `video-service` is setup to log to the console as well as a `LOGS` stream in Redis. So if you don't want to worry about looking at the Docker console you can use [RedisInsight](https://redis.com/redis-enterprise/redis-insight/) and look at the `LOGS` stream to see what's going on in the service.

### How the data is stored

The `video-service` uses a number of different data types to store data in Redis. In general, caching is applied where applicable to avoid making unneccesary calls to get YouTube transcripts/video info as well as calls to the LLMs. Not only does this save on potentially costly API calls, but it also speeds up the application drastically.

Below you will find a description of each of the data types the `video-service` uses and what it uses it for:

1. `Strings` - strings are used to cache video transcripts as well as summaries
1. `Hashes` - hashes are used to store the vector embeddings for questions and YouTube video summaries
1. `JSON` - Extra YouTube video information (title, description, and thumbnail) are stored in JSON documents since the app uses separate APIs for getting transcripts and getting addition video info
1. `Sets` - A set is used to keep track of videos where the app has already made a call to summarize the transcript.
1. `Streams` - A `LOGS` stream keeps a record of any log statement made in the `video-service`. Very useful for debugging.
