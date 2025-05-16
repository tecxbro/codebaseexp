'use client';

import React, { useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import Markdown from './Markdown';
// import AskInput from './AskInput'; // We'll create/refactor this from Ask.tsx later
import Ask from './Ask'; // TEMPORARY: Use Ask for now
import { RepoInfo } from '@/types/repoinfo'; // Assuming this type exists

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface FullScreenChatProps {
  history: Message[];
  currentStream: string;
  isLoading: boolean;
  onClose: () => void;
  onAskSubmit: (questionText: string, isDeepResearch: boolean) => void;
  onClear: () => void;
  repoInfo: RepoInfo;
  provider?: string;
  model?: string;
  isCustomModel?: boolean;
  customModel?: string;
  language?: string;
}

const FullScreenChat: React.FC<FullScreenChatProps> = ({
  history,
  currentStream,
  isLoading,
  onClose,
  onAskSubmit,
  onClear,
  repoInfo,
  provider,
  model,
  isCustomModel,
  customModel,
  language,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, currentStream]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/30 backdrop-blur-md p-4 md:p-8 rounded-lg shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-[var(--card-bg)]/80 rounded-t-lg shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Slime Chat</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-md hover:bg-[var(--hover-bg)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          aria-label="Close chat"
        >
          <FaTimes size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 my-2 scrollbar-thin scrollbar-thumb-[var(--accent-primary)] scrollbar-track-[var(--background)]">
        {history.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg shadow-md ${msg.role === 'user' 
                ? 'bg-[var(--accent-primary)] text-white rounded-br-none' 
                : 'bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--border-color)] rounded-bl-none'}`}
            >
              <Markdown content={msg.content} />
            </div>
          </div>
        ))}
        {currentStream && (
          <div className="flex justify-start">
            <div className="max-w-[70%] p-3 rounded-lg shadow-md bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--border-color)] rounded-bl-none">
              <Markdown content={currentStream + (isLoading ? '▋' : '')} />
            </div>
          </div>
        )}
        {isLoading && !currentStream && (
            <div className="flex justify-start">
                <div className="max-w-[70%] p-3 rounded-lg shadow-md bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--border-color)] rounded-bl-none">
                    <div className="animate-pulse flex space-x-1">
                        <div className="w-2 h-2 bg-[var(--muted-foreground)] rounded-full"></div>
                        <div className="w-2 h-2 bg-[var(--muted-foreground)] rounded-full animation-delay-200"></div>
                        <div className="w-2 h-2 bg-[var(--muted-foreground)] rounded-full animation-delay-400"></div>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-0 border-t border-[var(--border-color)] bg-[var(--card-bg)]/80 rounded-b-lg">
         <Ask 
            repoInfo={repoInfo}
            provider={provider}
            model={model}
            isCustomModel={isCustomModel}
            customModel={customModel}
            language={language}
            onAskSubmit={onAskSubmit}
            onClear={onClear} // This clear would be for the whole conversation
            isLoading={isLoading} 
            currentResponseStream="" // FullScreenChat handles its own stream display
            isFullScreenActive={true} // Tell Ask it's in full-screen mode
         />
      </div>
    </div>
  );
};

export default FullScreenChat; 