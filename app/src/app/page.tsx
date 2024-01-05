'use client';

import { useState } from 'react';
import QuestionForm from '@/components/QuestionForm';
import VideoList, { type VideoDocument } from '@/components/VideoList';

const SEARCH_API = `http://localhost:3001/api/videos/search`;

export default function Home() {
  const [videos, setVideos] = useState<VideoDocument[]>([]);

  const handleSearch = async (question: string) => {
    // Replace with your API call
    const response = await fetch(`${SEARCH_API}?question=${question}`);
    const data: { results: VideoDocument[] } = await response.json();
    setVideos(data.results);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="container mx-auto p-4">
        <QuestionForm onSubmit={handleSearch} />
        <VideoList videos={videos} />
      </div>
    </main>
  );
}
