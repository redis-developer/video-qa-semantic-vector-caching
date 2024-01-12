'use client';

import { useState } from 'react';
import QuestionForm from '@/components/QuestionForm';
import VideoList, { type VideoDocument } from '@/components/VideoList';
import Modal from '@/components/Modal';
import UploadButton from '@/components/UploadButton';
import VideoForm from '@/components/VideoForm';

export default function Home() {
  const [videos, setVideos] = useState<VideoDocument[]>([]);
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (videos: string[]) => {
    // API call with the videos URLs

    await fetch(`/api/upload`, {
      method: 'POST',
      body: JSON.stringify({ videos }),
    });

    setShowModal(false);
  };

  const handleSearch = async (question: string) => {
    // Replace with your API call
    const response = await fetch(`/api/search?question=${question}`);
    const data: { results: VideoDocument[] } = await response.json();
    setVideos(data.results ?? []);
  };

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="container mx-auto p-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-indigo-600 my-8">
            Search for videos... semantically!
          </h1>
          <QuestionForm onSubmit={handleSearch} />
          <VideoList videos={videos} />
        </div>
      </main>

      <Modal
        show={showModal}
        onClose={() => {
          setShowModal(false);
        }}>
        <VideoForm onSubmit={handleSubmit} />
      </Modal>
      <UploadButton
        onClick={() => {
          setShowModal(true);
        }}
      />
    </>
  );
}
