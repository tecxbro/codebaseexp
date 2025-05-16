'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import Markdown from './Markdown';
import { useLanguage } from '@/contexts/LanguageContext';
import RepoInfo from '@/types/repoinfo';
// import getRepoUrl from '@/utils/getRepoUrl'; // Not used directly in Ask.tsx anymore
// import ModelSelectionModal from './ModelSelectionModal'; // Keep commented

// Message interface removed, as Ask.tsx no longer manages history
// ResearchStage interface removed

interface AskProps {
  repoInfo: RepoInfo; // Kept for context, now used for placeholder
  provider?: string; // Kept for potential display or context
  model?: string;    // Kept for potential display or context
  isCustomModel?: boolean; // Kept for potential display or context
  customModel?: string;  // Kept for potential display or context
  language?: string; // Kept for i18n context
  // onRef prop is fully removed as per previous decisions

  // Props from parent (RepoWikiPage)
  onAskSubmit: (questionText: string, isDeepResearch: boolean) => void;
  onClear: () => void;
  // currentResponseStream: string; // Removed, Ask.tsx doesn't display stream
  isLoading: boolean; // Used to disable input/button
  isExpanded?: boolean; // New prop, to know if chat is expanded (was isFullScreenActive)
  // onEngage?: () => void; // REMOVED: New prop to handle engagement (e.g., input focus) for expansion
}

const Ask: React.FC<AskProps> = ({
  repoInfo, // Now used for placeholder
  language = 'en', // Retained for messages
  onAskSubmit,
  onClear,
  isLoading,
  isExpanded, // Consuming the new prop name
  // onEngage, // REMOVED
}) => {
  const [question, setQuestion] = useState('');
  const [deepResearch, setDeepResearch] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { messages } = useLanguage();

  useEffect(() => {
    if (inputRef.current && isExpanded) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleLocalClear = () => {
    setQuestion('');
    setDeepResearch(false);
    if (inputRef.current && isExpanded) {
      inputRef.current.focus();
    }
    onClear();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;
    onAskSubmit(question, deepResearch);
    setQuestion('');
  };

  // Deep Research stage management, navigation, and related useEffects are removed.
  // extractResearchStage, checkIfResearchComplete, navigateToStage, continueResearch, etc. are removed.

  // Custom switch style for Deep Research toggle
  const switchBase = "relative inline-flex items-center h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-primary)]";
  const switchChecked = "bg-[var(--accent-primary)]";
  const switchUnchecked = "bg-gray-600"; // Darker background for unchecked in dark mode
  const switchThumb = "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out";
  const switchThumbChecked = "translate-x-5";
  const switchThumbUnchecked = "translate-x-0";

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col ${isExpanded ? 'h-full p-1 md:p-2' : 'p-3'}`}>
      {/* Response display area is removed from Ask.tsx */}
      {/* Research stage navigation is removed */}

      <div className={`flex items-center gap-2 ${isExpanded ? 'mt-auto' : ''}`}>
        <input
          ref={inputRef}
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={repoInfo ? `Ask Slime about ${repoInfo.owner}/${repoInfo.repo}` : (messages.ask?.placeholder || 'Ask about this repository...')}
          className={`flex-grow text-sm p-2.5 rounded-lg transition-all duration-150 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed shadow-sm 
                      ${isExpanded 
                        ? 'bg-[var(--background)] border border-[var(--border-color)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] text-[var(--foreground)]' 
                        : 'bg-transparent border border-gray-500/70 focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-gray-200 placeholder-gray-400'}`}
          disabled={isLoading}
          // onFocus={() => { // REMOVED
          //   if (!isExpanded && onEngage) {
          //     onEngage();
          //   }
          // }} // REMOVED
        />
        <button
          type="submit"
          disabled={isLoading || !question.trim()}
          className={`p-2.5 rounded-lg shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-150 ease-in-out 
                      ${isExpanded 
                        ? 'btn-japanese-filled min-w-[80px] focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background)] focus:ring-[var(--accent-primary)]' 
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300 focus:ring-1 focus:ring-gray-500'}`}
        >
          {isLoading ? (
            <div className={`animate-spin rounded-full h-4 w-4 border-b-2 ${isExpanded ? 'border-white' : 'border-gray-300'}`}></div>
          ) : (
            isExpanded ? (messages.ask?.send || 'Send') : <FaArrowRight className="text-gray-300" />
          )}
        </button>
      </div>
      <div className={`flex items-center mt-2 ${isExpanded ? 'justify-between px-1' : 'justify-start pl-1'}`}>
        {/* Deep Research Toggle - styled as a switch */}
        <div className="flex items-center">
          <label htmlFor="deepResearchToggleAsk" className={`text-xs mr-2 cursor-pointer ${isExpanded ? 'text-[var(--muted)]' : 'text-gray-400'}`}>
            {messages.ask?.deepResearch || 'Deep Research'}
          </label>
          <button
            type="button"
            id="deepResearchToggleAsk"
            role="switch"
            aria-checked={deepResearch}
            onClick={() => setDeepResearch(!deepResearch)}
            className={`${switchBase} ${deepResearch ? switchChecked : switchUnchecked}`}
            disabled={isLoading}
          >
            <span className="sr-only">Deep Research</span>
            <span aria-hidden="true" className={`${switchThumb} ${deepResearch ? switchThumbChecked : switchThumbUnchecked}`} />
          </button>
        </div>
        {isExpanded && (
            <button
                type="button"
                onClick={handleLocalClear}
                className="text-xs text-[var(--muted)] hover:text-[var(--accent-primary)] transition-colors p-1.5 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
            >
                {messages.ask?.clear || 'Clear Chat'}
            </button>
        )}
      </div>
    </form>
  );
};

export default Ask;
