'use client';

import { useState } from 'react';
import QuestionForm from '@/components/QuestionForm';
import VideoList, { type VideoDocument } from '@/components/VideoList';
import Modal from '@/components/Modal';
import UploadButton from '@/components/UploadButton';
import VideoForm from '@/components/VideoForm';
import Markdown from '@/components/Markdown';
import SettingsIcon from '@/components/SettingsIcon';
import SettingsMenu from '@/components/SettingsMenu';

interface VideoSearchResult {
  videos: VideoDocument[];
  answer: string;
}

export default function Home() {
  const [results, setResults] = useState<VideoSearchResult>();
  const [showModal, setShowModal] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('OpenAI');

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
    setResults(undefined);
    const response = await fetch(
      `/api/search?api=${selectedOption.toLowerCase()}&question=${question}`,
    );
    const data: VideoSearchResult = await response.json();
    setResults(data);
  };

  const handleToggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const handleSelectionChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSelectedOption(event.target.value);
  };

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="container mx-auto p-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-indigo-600 my-8">
            Ask me about Redis
          </h1>
          <QuestionForm onSubmit={handleSearch} />
          {typeof results !== 'undefined' && (
            <div className="py-4">
              <Markdown markdown={results?.answer ?? ''} />
              <h2>To learn more, check out these videos:</h2>
              <VideoList videos={results?.videos ?? []} />
            </div>
          )}
        </div>
      </main>
      <SettingsMenu
        isOpen={isSettingsOpen}
        onSelectionChange={handleSelectionChange}
        selectedOption={selectedOption}
      />
      <Modal
        show={showModal}
        onClose={() => {
          setShowModal(false);
        }}>
        <VideoForm onSubmit={handleSubmit} />
      </Modal>

      <SettingsIcon onToggle={handleToggleSettings} />
      <UploadButton
        onClick={() => {
          setShowModal(true);
        }}
      />
    </>
  );
}
