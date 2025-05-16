'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import Link from 'next/link'; // No longer used
// import { FaWikipediaW, FaGithub, FaCoffee, FaTwitter } from 'react-icons/fa'; // No longer used
import ThemeToggle from '@/components/theme-toggle';
// import Mermaid from '../components/Mermaid'; // No longer used if visualization section is fully removed
import ConfigurationModal from '@/components/ConfigurationModal';
import { extractUrlPath } from '@/utils/urlDecoder';

import { useLanguage } from '@/contexts/LanguageContext';

// Define the demo mermaid charts outside the component (REMOVED as per previous steps and new design)

const hardcodedRepos = [
  { id: 'add-repo', type: 'add' },
  { id: 'vscode', name: 'microsoft / vscode', description: 'Visual Studio Code', stars: '170.1k', ghPath: 'microsoft/vscode' },
  { id: 'mcp-go', name: 'mark3labs / mcp-go', description: 'A Go implementation of the Model Context Protocol (MCP), enabling seamless integration between LLM...', stars: '3.4k', ghPath: 'mark3labs/mcp-go' },
  { id: 'gumroad', name: 'antiwork / gumroad', description: 'The G चीज that makes Gumroad work.', stars: '5.2k', ghPath: 'antiwork/gumroad' },
  { id: 'local-deep-researcher', name: 'langchain-ai / local-deep-researcher', description: 'Fully local web research and report writing assistant', stars: '7.0k', ghPath: 'langchain-ai/local-deep-researcher' },
  { id: 'llama-models', name: 'meta-llama / llama-models', description: 'Utilities intended for use with Llama models.', stars: '6.8k', ghPath: 'meta-llama/llama-models' },
  { id: 'transformers', name: 'huggingface / transformers', description: '🤗 Transformers: State-of-the-art Machine Learning for PyTorch, TensorFlow, and JAX.', stars: '143.1k', ghPath: 'huggingface/transformers' },
  { id: 'langchain', name: 'langchain-ai / langchain', description: '🦜🔗 Build context-aware reasoning applications', stars: '106.8k', ghPath: 'langchain-ai/langchain' },
  { id: 'express', name: 'expressjs / express', description: 'Fast, unopinionated, minimalist web framework for node.', stars: '60.3k', ghPath: 'expressjs/express' }, // Adjusted from image
  { id: 'lodash', name: 'lodash / lodash', description: 'A modern JavaScript utility library delivering modularity, performance, & extras.', stars: '60.3k', ghPath: 'lodash/lodash' },
  { id: 'sqlite', name: 'sqlite / sqlite', description: 'Official Git mirror of the SQLite source tree', stars: '7.7k', ghPath: 'sqlite/sqlite' },
  { id: 'monaco-editor', name: 'microsoft / monaco-editor', description: 'A browser based code editor', stars: '42.1k', ghPath: 'microsoft/monaco-editor' },
  { id: 'openai-agents-python', name: 'openai / openai-agents-python', description: 'A lightweight, powerful framework for multi-agent workflows', stars: '8.8k', ghPath: 'openai/openai-agents-python' },
  { id: 'openai-python', name: 'openai / openai-python', description: 'The official Python library for the OpenAI API', stars: '26.3k', ghPath: 'openai/openai-python' },
  { id: 'anthropic-sdk-python', name: 'anthropics / anthropic-sdk-python', description: 'The official Python library for the Anthropics API', stars: '1.9k', ghPath: 'anthropics/anthropic-sdk-python' }, // Corrected typo from image
];


export default function Home() {
  const router = useRouter();
  const { language, setLanguage, messages } = useLanguage();

  const t = (key: string, params: Record<string, string | number> = {}): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        const defaultText = params?.default as string || key;
        return defaultText;
      }
    }
    if (typeof value === 'string') {
      return Object.entries(params).reduce((acc: string, [paramKey, paramValue]) => {
        return acc.replace(`{${paramKey}}`, String(paramValue));
      }, value);
    }
    return key;
  };

  const [repositoryInput, setRepositoryInput] = useState(''); // Default to empty for new design
  const [provider, setProvider] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [isCustomModel, setIsCustomModel] = useState<boolean>(false);
  const [customModel, setCustomModel] = useState<string>('');
  const [isComprehensiveView, setIsComprehensiveView] = useState<boolean>(true);
  const [excludedDirs, setExcludedDirs] = useState('');
  const [excludedFiles, setExcludedFiles] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<'github' | 'gitlab' | 'bitbucket'>('github');
  const [accessToken, setAccessToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(language);

  useEffect(() => {
    setLanguage(selectedLanguage);
  }, [selectedLanguage, setLanguage]);

  const parseRepositoryInput = (input: string): {
    owner: string,
    repo: string,
    type: string,
    fullPath?: string,
    localPath?: string
  } | null => {
    input = input.trim();
    let owner = '', repo = '', type = 'github', fullPath;
    let localPath: string | undefined;
    const windowsPathRegex = /^[a-zA-Z]:\\(?:[^\\/:*?"<>|\r\n]+\\)*[^\\/:*?"<>|\r\n]*$/;
    const customGitRegex = /^(?:https?:\/\/)?([^\/]+)\/([^\/]+)\/([^\/]+)(?:\.git)?\/?$/;

    if (windowsPathRegex.test(input)) {
      type = 'local';
      localPath = input;
      repo = input.split('\\\\').pop() || 'local-repo';
      owner = 'local';
    }
    else if (input.startsWith('/')) {
      type = 'local';
      localPath = input;
      repo = input.split('/').filter(Boolean).pop() || 'local-repo';
      owner = 'local';
    }
    else if (customGitRegex.test(input)) {
      type = 'web';
      fullPath = extractUrlPath(input)?.replace(/\\.git$/, '');
      const parts = fullPath?.split('/') ?? [];
      if (parts.length >= 2) {
        repo = parts[parts.length - 1] || '';
        owner = parts[parts.length - 2] || '';
      }
    }
    else { // Try owner/repo format directly
      const slashCount = (input.match(/\//g) || []).length;
      if (slashCount === 1 && !input.startsWith('http') && !input.includes('git@')) {
        const parts = input.split('/');
        owner = parts[0];
        repo = parts[1];
        type = 'web'; // Assume web for owner/repo shorthand
         // Construct a pseudo fullPath for consistency if needed, though not strictly required if type handles it
        fullPath = `${selectedPlatform}.com/${owner}/${repo}`;
      } else {
        console.error('Unsupported URL or format:', input);
        return null;
      }
    }

    if (!owner || !repo) {
      return null;
    }
    owner = owner.trim();
    repo = repo.trim();
    if (repo.endsWith('.git')) {
      repo = repo.slice(0, -4);
    }
    return { owner, repo, type, fullPath, localPath };
  };

  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsedRepo = parseRepositoryInput(repositoryInput);
    if (!parsedRepo) {
      setError(t('form.error.invalidRepo', { default: 'Invalid repository format. Use "owner/repo", a full Git URL, or local path.'}));
      return;
    }
    setError(null);
    setIsConfigModalOpen(true);
  };
  
  const handleGenerateWiki = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const parsedRepo = parseRepositoryInput(repositoryInput);
    if (!parsedRepo) {
      setError(t('form.error.invalidRepo', { default: 'Invalid repository format.'}));
      setIsSubmitting(false);
      return;
    }
    const { owner, repo, type, localPath } = parsedRepo;
    const params = new URLSearchParams();
    if (accessToken) params.append('token', accessToken);
    
    // Determine the actual platform for web type
    let platformToUse = selectedPlatform;
    if (type === 'web' && parsedRepo.fullPath) {
        if (parsedRepo.fullPath.includes('gitlab.com')) platformToUse = 'gitlab';
        else if (parsedRepo.fullPath.includes('bitbucket.org')) platformToUse = 'bitbucket';
        else platformToUse = 'github'; // Default to github
    }
    params.append('type', (type === 'local' ? type : platformToUse));

    if (localPath) {
      params.append('local_path', encodeURIComponent(localPath));
    } else {
      // For web types, ensure we use a fully qualified URL if repositoryInput was shorthand
      let repoUrlToEncode = repositoryInput;
      if (type === 'web' && !repositoryInput.startsWith('http') && parsedRepo.fullPath) {
        repoUrlToEncode = `https://${parsedRepo.fullPath}`;
      }
      params.append('repo_url', encodeURIComponent(repoUrlToEncode));
    }
    params.append('provider', provider);
    params.append('model', model);
    if (isCustomModel && customModel) params.append('custom_model', customModel);
    if (excludedDirs) params.append('excluded_dirs', excludedDirs);
    if (excludedFiles) params.append('excluded_files', excludedFiles);
    params.append('language', selectedLanguage);
    params.append('comprehensive', isComprehensiveView.toString());
    const queryString = params.toString() ? `?${params.toString()}` : '';
    router.push(`/${owner}/${repo}${queryString}`);
  };

  const AddRepoCard = ({ onClick }: { onClick: () => void }) => (
    <div
      onClick={onClick}
      className="cursor-pointer p-5 rounded-lg flex flex-col items-start justify-center h-40 text-left text-white relative transition-all hover:scale-105 shadow-lg bg-gradient-to-br from-purple-600 to-purple-800 hover:shadow-xl hover:shadow-purple-500/30 border border-purple-500/50"
    >
      <div className="flex flex-col items-center justify-center w-full h-full">
        <svg className="h-10 w-10 text-purple-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        <h3 className="text-xl font-semibold">{t('home.addRepo', { default: "Add repo" })}</h3>
      </div>
      <svg className="h-6 w-6 text-purple-300 absolute bottom-4 right-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    </div>
  );

  interface RepoCardProps {
    id: string;
    name: string;
    description: string;
    stars: string;
    ghPath: string; // Used to prefill input
  }

  const RepoCard = ({ repo, onClick }: { repo: RepoCardProps, onClick: () => void }) => (
    <div
      onClick={onClick}
      className="bg-gray-800 p-5 rounded-lg h-40 flex flex-col justify-between cursor-pointer relative transition-all hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-black/50 border border-gray-700/50"
    >
      <div className="flex-grow overflow-hidden">
        <h3 className="text-md font-semibold text-gray-200 mb-1 truncate" title={repo.name}>{repo.name}</h3>
        <p className="text-xs text-gray-400 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', height: '2.5em' }}>
          {repo.description || <span className="italic">No description available.</span>}
        </p>
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center text-xs text-gray-500">
          <svg className="h-3.5 w-3.5 mr-1 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          {repo.stars}
        </div>
        <svg className="h-5 w-5 text-gray-500 group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
           <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
    </div>
  );

  const handleAddRepoClick = () => {
    const searchInput = document.getElementById('repoSearchInput');
    if (searchInput) {
      searchInput.focus();
    }
  };

  const handleRepoCardClick = (repo: RepoCardProps) => {
    setRepositoryInput(repo.ghPath); // Use ghPath for input
    // Trigger submit implicitly or explicitly
    // Forcing a slight delay to ensure state update before modal logic
    setTimeout(() => {
        handleSearchSubmit(); // This will parse and open modal
    }, 0);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 p-4 pt-16 md:p-8 md:pt-24 text-white">
      {/* Removed old header */}
      
      <h1 className="text-3xl md:text-4xl font-bold text-gray-100 mb-10 text-center">
        {t('home.whichRepoQuestion', { default: "Which repo would you like to understand?"})}
      </h1>

      <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xl mb-12">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </span>
        <input
          id="repoSearchInput"
          type="text"
          value={repositoryInput}
          onChange={(e) => {
            setRepositoryInput(e.target.value);
            if (error) setError(null); // Clear error on input change
          }}
          placeholder={t('home.searchPlaceholder', { default: "Search for repositories (or paste a link)" })}
          className="block w-full pl-10 pr-3 py-3 bg-gray-800 border border-gray-700 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 shadow-inner shadow-gray-900/50"
        />
         {error && (
            <p className="text-red-400 text-xs mt-2 text-center">{error}</p>
          )}
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-7xl">
        {hardcodedRepos.map(repo =>
          repo.type === 'add' ? (
            <AddRepoCard key={repo.id} onClick={handleAddRepoClick} />
          ) : (
            <RepoCard key={repo.id} repo={repo as RepoCardProps} onClick={() => handleRepoCardClick(repo as RepoCardProps)} />
          )
        )}
      </div>
      
      {/* Configuration Modal remains the same */}
      <ConfigurationModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        repositoryInput={repositoryInput}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        isComprehensiveView={isComprehensiveView}
        setIsComprehensiveView={setIsComprehensiveView}
        provider={provider}
        setProvider={setProvider}
        model={model}
        setModel={setModel}
        isCustomModel={isCustomModel}
        setIsCustomModel={setIsCustomModel}
        customModel={customModel}
        setCustomModel={setCustomModel}
        selectedPlatform={selectedPlatform}
        setSelectedPlatform={setSelectedPlatform}
        accessToken={accessToken}
        setAccessToken={setAccessToken}
        excludedDirs={excludedDirs}
        setExcludedDirs={setExcludedDirs}
        excludedFiles={excludedFiles}
        setExcludedFiles={setExcludedFiles}
        onSubmit={handleGenerateWiki}
        isSubmitting={isSubmitting}
      />

      {/* Existing Footer - Assuming it's styled globally or separately */}
      <footer className="w-full max-w-6xl mx-auto mt-12 py-8 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-700">
          <p className="text-gray-500 text-sm font-serif">{t('footer.copyright')}</p>
          <div className="flex items-center gap-6">
            <ThemeToggle />
          </div>
      </footer>
    </div>
  );
}