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

### Functionality breakdown

The process for how this app functions is as follows:

1. Videos are uploaded to the video-search service by making a `POST http://localhost:8000/api/videos` request with the following body:

```json
{
    "videos": ["youtube-video-ids-or-urls"]
}
```

1. Both `Google` and `OpenAI` will be used to generate summaries and embeddings for the videos. You can edit `services/video-search/src/router.ts` if you don't want to use one or the other. You can also edit the `USE` environment variable for searches. `GOOGLE` uses Google and `OPENAI` uses OpenAI.
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

1. `src/google` - Contains all of the LLM setup, vector store setup, searching, and embedding logic and uses Google as the LLM
1. `src/openai` - Contains all of the LLM setup, vector store setup, searching, and embedding logic and uses OpenAI as the LLM **NOTE**: **NOTE:** The above directories export the exact same interface to make it easy to swap them in and out.
1. `src/templates` - Stores the LLM prompts for getting semantic questions, video summaries, and answers
1. `src/transcripts` - Contains the logic to retrieve YouTube video information (title, description, thmubnail, and transcript)

Almost all of the remaining important logic is found in `src/router.ts` where you will find the three API routes:

1. `POST /api/videos` - Accepts a list of `{ "videos": [] }` which can be either full YouTube URLs or the video IDs.
1. `GET /api/videos/search` - Accepts a `?question=<question>` and returns a list of videos and the answer to the question
1. `GET /api/healthcheck` - Ensures the service is up and running and connected to Redis
