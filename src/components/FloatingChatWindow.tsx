'use client';

import React, { useEffect, useRef } from 'react';
import Ask from './Ask'; // Assuming Ask.tsx is in the same directory
import Markdown from './Markdown';
import { FaTimes, FaExpandArrowsAlt, FaCompressArrowsAlt } from 'react-icons/fa';

// Ensure Message type is defined or imported if not globally available
interface Message {
  id: string; // Or some unique key for React list
  role: 'user' | 'assistant';
  content: string;
}

interface FloatingChatWindowProps {
  repoInfo: any; // Pass repoInfo for Ask component
  provider?: string;
  model?: string;
  isCustomModel?: boolean;
  customModel?: string;
  language?: string;

  conversationHistory: Message[];
  currentResponseStream: string;
  isChatLoading: boolean;
  isChatExpanded: boolean;
  onAskSubmit: (questionText: string, isDeepResearch: boolean) => void;
  onClearChat: () => void; // Renamed from onClearAskInput for clarity, will call Ask's onClear
  onToggleExpansion: () => void;
  // onClose: () => void; // If a close button for the entire chat is needed
}

const FloatingChatWindow: React.FC<FloatingChatWindowProps> = ({
  repoInfo,
  provider,
  model,
  isCustomModel,
  customModel,
  language,
  conversationHistory,
  currentResponseStream,
  isChatLoading,
  isChatExpanded,
  onAskSubmit,
  onClearChat,
  onToggleExpansion,
  // onClose,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [conversationHistory, currentResponseStream]);

  // Compact state is now centered and translucent
  const compactStyles = `
    w-[90vw] max-w-[550px] md:max-w-[600px] h-auto
    bottom-8 left-1/2 -translate-x-1/2 top-auto /* Changed from full center to bottom-center */
    rounded-xl bg-[var(--card-bg)]/80 backdrop-blur-md shadow-2xl
  `;
  const expandedStyles = `
    w-[calc(100%-32px)] h-[calc(100%-32px)] 
    top-4 bottom-4 left-4 right-4 
    rounded-2xl bg-[var(--card-bg)]/80 backdrop-blur-md shadow-2xl
  `; // Adjusted expanded to use fixed margins for consistency

  return (
    <div
      className={`fixed 
                  flex flex-col transition-all duration-300 ease-in-out z-50
                  ${isChatExpanded ? expandedStyles : compactStyles}
                  border border-[var(--border-color)]/30`} // Common border style
    >
      {/* Header with Toggle Expansion/Close Button */}
      {/* Show header always if we want the title & collapse button visible in compact too, or conditionally */}
      {/* For now, let's keep it conditional on expansion, but the button's role changes. */}
      {isChatExpanded && ( // Or simply remove this condition if header desired in compact state too
        <div className="flex items-center justify-between p-3 border-b border-[var(--border-color)]/30 flex-shrink-0">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">SLIME Chat</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleExpansion} // This button now primarily serves to collapse
              className="p-1.5 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
              aria-label={isChatExpanded ? 'Collapse chat' : 'Expand chat'}
            >
              {isChatExpanded ? <FaCompressArrowsAlt size={14} /> : <FaExpandArrowsAlt size={14} />}
            </button>
            {/* Optional: Close button for the entire chat window */}
          </div>
        </div>
      )}

      {/* Conversation Area - Only show when expanded */}
      {isChatExpanded && (
        <div className="flex-grow overflow-y-auto p-3 space-y-3">
          {conversationHistory.map((msg, index) => (
            <div
              key={msg.id || index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] p-2.5 rounded-xl shadow-sm text-sm
                            ${msg.role === 'user'
                              ? 'bg-[var(--accent-primary)]/80 text-white rounded-br-none'
                              : 'bg-[var(--background)]/70 text-[var(--foreground)] rounded-bl-none border border-[var(--border-color)]/50'
                            }`}
              >
                <Markdown content={msg.content} />
              </div>
            </div>
          ))}
          {currentResponseStream && (
            <div className="flex justify-start">
              <div className="max-w-[75%] p-2.5 rounded-xl shadow-sm text-sm bg-[var(--background)]/70 text-[var(--foreground)] rounded-bl-none border border-[var(--border-color)]/50">
                <Markdown content={currentResponseStream + '...' } />
              </div>
            </div>
          )}
          {isChatLoading && !currentResponseStream && (
            <div className="flex justify-start">
              <div className="max-w-[75%] p-2.5 rounded-xl text-sm text-[var(--muted)]">
                <div className="animate-pulse flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-[var(--accent-primary)] rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-[var(--accent-primary)] rounded-full animation-delay-200"></div>
                  <div className="w-1.5 h-1.5 bg-[var(--accent-primary)] rounded-full animation-delay-400"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Area using Ask.tsx - Always shown, styling might adapt based on isChatExpanded via Ask.tsx's own prop */}
      <div className={`p-2 ${isChatExpanded ? 'border-t border-[var(--border-color)]/30' : ''}`}>
        <Ask
          repoInfo={repoInfo}
          provider={provider}
          model={model}
          isCustomModel={isCustomModel}
          customModel={customModel}
          language={language}
          onAskSubmit={onAskSubmit}
          onClear={onClearChat} // This should trigger onClearChat in parent, which then clears Ask's input via its own onClear
          isLoading={isChatLoading}
          isExpanded={isChatExpanded}
        />
      </div>
    </div>
  );
};

export default FloatingChatWindow; 