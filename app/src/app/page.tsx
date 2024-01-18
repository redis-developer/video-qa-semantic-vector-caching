'use client';

import { useState } from 'react';
import QuestionForm from '@/components/QuestionForm';
import VideoList, { type VideoDocument } from '@/components/VideoList';
import Modal from '@/components/Modal';
import UploadButton from '@/components/UploadButton';
import VideoForm from '@/components/VideoForm';
import SettingsIcon from '@/components/SettingsIcon';
import SettingsMenu from '@/components/SettingsMenu';
import Accordion from '@/components/Accordion';
import CircularProgress from '@/components/CircularProgress';
import Markdown from '@/components/Markdown';

interface VideoSearchResult {
  videos: VideoDocument[];
  answer: string;
  question: string;
  isOriginal?: boolean;
}

export default function Home() {
  const [results, setResults] = useState<VideoSearchResult[]>();
  const [isSearching, setIsSearching] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
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

  const handleSearch = async (question: string, useCache?: boolean) => {
    // Replace with your API call
    setCurrentQuestion(question);
    let url = `/api/search?api=${selectedOption.toLowerCase()}&question=${question}`;

    if (useCache === false) {
      url = `${url}&useCache=false`;
    } else {
      setResults(undefined);
    }

    setIsSearching(true);
    const response = await fetch(url);
    const data: VideoSearchResult[] = await response.json();
    setResults(data);
    setIsSearching(false);
  };

  const handleToggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const handleSelectionChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSelectedOption(event.target.value);
  };

  const haveResults = Array.isArray(results) && results.length > 0;
  const haveOriginal =
    haveResults &&
    typeof results[0].isOriginal !== 'undefined' &&
    results[0].isOriginal;

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="container mx-auto p-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-indigo-600 my-8">
            Ask me about Redis
          </h1>
          <QuestionForm onSubmit={handleSearch} />
          {Array.isArray(results) && !haveResults && !isSearching && (
            <p className="mt-4">No results found. Try another question.</p>
          )}
          {!haveOriginal && (
            <>
              <h2 className="text-xl font-bold mb-2 mt-4">
                Your question has already been asked in a different way, here
                are some possible answers:
              </h2>
              <p>
                If none of the answers below are useful, we can always generate
                a unique response for you.
              </p>
              <button
                className="mt-2 bg-blue-500 text-white p-2 rounded"
                onClick={() => {
                  if (isSearching) {
                    return;
                  }

                  void handleSearch(currentQuestion, false);
                }}>
                {isSearching
? (
                  <CircularProgress />
                )
: (
                  <span>Generate unique response</span>
                )}
              </button>
              <div className="mt-4">
                <Accordion items={results ?? []} />
              </div>
            </>
          )}
          {haveOriginal && (
            <div className="mt-4 rounded-md shadow-lg bg-white">
              <div className="p-4">
                <Markdown markdown={results[0].answer} />
                <h2 className="text-xl font-bold my-4">
                  To learn more, check out these videos:
                </h2>
                <VideoList videos={results[0].videos} />
              </div>
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
