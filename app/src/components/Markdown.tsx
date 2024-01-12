import React from 'react';
import ReactMarkdown from 'react-markdown';

export interface MarkdownProps {
  markdown: string;
}

function Markdown({ markdown }: MarkdownProps) {
  return <ReactMarkdown>{markdown}</ReactMarkdown>;
}

export default Markdown;
