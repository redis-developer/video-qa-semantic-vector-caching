// components/Accordion.jsx

import React, { useState } from 'react';
import VideoList, { type VideoDocument } from './VideoList';
import Markdown from './Markdown';

interface AccordionItemProps {
  question: string;
  children: React.ReactNode;
}

function AccordionItem({ question, children }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <button
        className="py-2 px-4 w-full text-left text-black font-semibold text-lg shadow-md"
        onClick={() => {
          setIsOpen(!isOpen);
        }}>
        {question}
      </button>
      {isOpen && <div className="p-4 bg-white">{children}</div>}
    </div>
  );
}

export interface AccordionProps {
  items: Array<{
    question: string;
    answer: string;
    videos: VideoDocument[];
  }>;
}

function Accordion({ items }: AccordionProps) {
  return (
    <div className="bg-blue-100 rounded-md shadow-lg">
      {items.map((item, index) => (
        <AccordionItem key={index} question={item.question}>
          <Markdown markdown={item.answer} />
          <h2 className="text-xl font-bold my-4">
            To learn more, check out these videos:
          </h2>
          <VideoList videos={item.videos} />
        </AccordionItem>
      ))}
    </div>
  );
}

export default Accordion;
