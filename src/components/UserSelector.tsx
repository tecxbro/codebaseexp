'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

// Define the interfaces for our model configuration
interface Model {
  id: string;
  name: string;
}

interface Provider {
  id: string;
  name: string;
  models: Model[];
  supportsCustomModel?: boolean;
}

interface ModelConfig {
  providers: Provider[];
  defaultProvider: string;
}

interface ModelSelectorProps {
  provider: string;
  setProvider: (value: string) => void;
  model: string;
  setModel: (value: string) => void;
  isCustomModel: boolean;
  setIsCustomModel: (value: boolean) => void;
  customModel: string;
  setCustomModel: (value: string) => void;
  
  // File filter configuration
  showFileFilters?: boolean;
  excludedDirs?: string;
  setExcludedDirs?: (value: string) => void;
  excludedFiles?: string;
  setExcludedFiles?: (value: string) => void;
}

export default function UserSelector({
  provider,
  setProvider,
  model,
  setModel,
  isCustomModel,
  setIsCustomModel,
  customModel,
  setCustomModel,
  
  // File filter configuration
  showFileFilters = false,
  excludedDirs = '',
  setExcludedDirs,
  excludedFiles = '',
  setExcludedFiles
}: ModelSelectorProps) {
  // State to manage the visibility of the filters modal and filter section
  const [isFilterSectionOpen, setIsFilterSectionOpen] = useState(false);
  const { messages: t } = useLanguage();
  
  // State for model configurations from backend
  const [modelConfig, setModelConfig] = useState<ModelConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for viewing default values
  const [showDefaultDirs, setShowDefaultDirs] = useState(false);
  const [showDefaultFiles, setShowDefaultFiles] = useState(false);
  
  // Fetch model configurations from the backend
  useEffect(() => {
    const fetchAndInitialize = async () => {
      let currentModelConfig = modelConfig;
      if (!currentModelConfig) {
        try {
          setIsLoading(true); // Set loading true before fetch
          setError(null);
          const response = await fetch('/api/models/config');
          if (!response.ok) {
            throw new Error(`Error fetching model configurations: ${response.status}`);
          }
          const data = await response.json();
          setModelConfig(data);
          currentModelConfig = data; // Use the fetched data
        } catch (err) {
          console.error('Failed to fetch model configurations:', err);
          setError('Failed to load model configurations. Using default options.');
          // No early return, let setIsLoading(false) be called in finally block of this path
        } finally {
          // setIsLoading(false); // Let the main finally handle this if fetch fails, or after init if succeeds
        }
      }

      if (currentModelConfig) {
        // Initialize provider and model with defaults from API if provider is not already set
        if (!provider && currentModelConfig.defaultProvider) {
          setProvider(currentModelConfig.defaultProvider);
          const selectedProviderData = currentModelConfig.providers.find((p: Provider) => p.id === currentModelConfig.defaultProvider);
          if (selectedProviderData && selectedProviderData.models.length > 0) {
            setModel(selectedProviderData.models[0].id);
          }
        }
      }
      setIsLoading(false); // Set loading false after all operations (fetch or just init)
    };

    fetchAndInitialize();
  }, [provider, setProvider, setModel, modelConfig]); // Added dependencies
  
  // Handler for changing provider
  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider);
    setTimeout(() => {
      // Reset custom model state when changing providers
      setIsCustomModel(false);
      
      // Set default model for the selected provider
      if (modelConfig) {
        const selectedProvider = modelConfig.providers.find((p: Provider) => p.id === newProvider);
        if (selectedProvider && selectedProvider.models.length > 0) {
          setModel(selectedProvider.models[0].id);
        }
      }
    }, 10);
  };
  
  // Default excluded directories from config.py
  const defaultExcludedDirs = 
`./.venv/
./venv/
./env/
./virtualenv/
./node_modules/
./bower_components/
./jspm_packages/
./.git/
./.svn/
./.hg/
./.bzr/
./__pycache__/
./.pytest_cache/
./.mypy_cache/
./.ruff_cache/
./.coverage/
./dist/
./build/
./out/
./target/
./bin/
./obj/
./docs/
./_docs/
./site-docs/
./_site/
./.idea/
./.vscode/
./.vs/
./.eclipse/
./.settings/
./logs/
./log/
./tmp/
./temp/
./.eng`;

  // Default excluded files from config.py
  const defaultExcludedFiles = 
`package-lock.json
yarn.lock
pnpm-lock.yaml
npm-shrinkwrap.json
poetry.lock
Pipfile.lock
requirements.txt.lock
Cargo.lock
composer.lock
.lock
.DS_Store
Thumbs.db
desktop.ini
*.lnk
.env
.env.*
*.env
*.cfg
*.ini
.flaskenv
.gitignore
.gitattributes
.gitmodules
.github
.gitlab-ci.yml
.prettierrc
.eslintrc
.eslintignore
.stylelintrc
.editorconfig
.jshintrc
.pylintrc
.flake8
mypy.ini
pyproject.toml
tsconfig.json
webpack.config.js
babel.config.js
rollup.config.js
jest.config.js
karma.conf.js
vite.config.js
next.config.js
*.min.js
*.min.css
*.bundle.js
*.bundle.css
*.map
*.gz
*.zip
*.tar
*.tgz
*.rar
*.pyc
*.pyo
*.pyd
*.so
*.dll
*.class
*.exe
*.o
*.a
*.jpg
*.jpeg
*.png
*.gif
*.ico
*.svg
*.webp
*.mp3
*.mp4
*.wav
*.avi
*.mov
*.webm
*.csv
*.tsv
*.xls
*.xlsx
*.db
*.sqlite
*.sqlite3
*.pdf
*.docx
*.pptx`;

  // Display loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <div className="text-sm text-[var(--muted)]">Loading model configurations...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="space-y-4">
        {error && (
          <div className="text-sm text-red-500 mb-2">{error}</div>
        )}
        
        {/* Provider Selection */}
        <div>
          <label htmlFor="provider-dropdown" className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
            {t.form?.modelProvider || 'Model Provider'}
          </label>
          <select
            id="provider-dropdown"
            value={provider}
            onChange={(e) => handleProviderChange(e.target.value)}
            className="input-japanese block w-full px-2.5 py-1.5 text-sm rounded-md bg-transparent text-[var(--foreground)] focus:outline-none focus:border-[var(--accent-primary)]"
          >
            <option value="" disabled>{t.form?.selectProvider || 'Select Provider'}</option>
            {modelConfig?.providers.map((providerOption) => (
              <option key={providerOption.id} value={providerOption.id}>
                {t.form?.[`provider${providerOption.id.charAt(0).toUpperCase() + providerOption.id.slice(1)}`] || providerOption.name}
              </option>
            ))}
          </select>
        </div>

        {/* Model Selection - consistent height regardless of type */}
        <div>
          <label htmlFor={isCustomModel ? "custom-model-input" : "model-dropdown"} className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
            {t.form?.modelSelection || 'Model Selection'}
          </label>
          
          {isCustomModel ? (
            <input
              id="custom-model-input"
              type="text"
              value={customModel}
              onChange={(e) => {
                setCustomModel(e.target.value);
                setModel(e.target.value);
              }}
              placeholder={t.form?.customModelPlaceholder || 'Enter custom model name'}
              className="input-japanese block w-full px-2.5 py-1.5 text-sm rounded-md bg-transparent text-[var(--foreground)] focus:outline-none focus:border-[var(--accent-primary)]"
            />
          ) : (
            <select
              id="model-dropdown"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="input-japanese block w-full px-2.5 py-1.5 text-sm rounded-md bg-transparent text-[var(--foreground)] focus:outline-none focus:border-[var(--accent-primary)]"
              disabled={!provider || isLoading || !modelConfig?.providers.find(p => p.id === provider)?.models?.length}
            >
              {modelConfig?.providers.find((p: Provider) => p.id === provider)?.models.map((modelOption) => (
                <option key={modelOption.id} value={modelOption.id}>
                  {modelOption.name}
                </option>
              )) || <option value="">{t.form?.selectModel || 'Select Model'}</option>}
            </select>
          )}
        </div>

        {/* Custom model toggle - only when provider supports it */}
        {modelConfig?.providers.find((p: Provider) => p.id === provider)?.supportsCustomModel && (
          <div className="mb-2">
            <div className="flex items-center pb-1">
              <div 
                className="relative flex items-center cursor-pointer"
                onClick={() => {
                  const newValue = !isCustomModel;
                  setIsCustomModel(newValue);
                  if (newValue) {
                    setCustomModel(model);
                  }
                }}
              >
                <input
                  id="use-custom-model"
                  type="checkbox"
                  checked={isCustomModel}
                  onChange={() => {}}
                  className="sr-only"
                />
                <div className={`w-10 h-5 rounded-full transition-colors ${isCustomModel ? 'bg-[var(--accent-primary)]' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                <div className={`absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white transition-transform transform ${isCustomModel ? 'translate-x-5' : ''}`}></div>
              </div>
              <label 
                htmlFor="use-custom-model" 
                className="ml-2 text-sm font-medium text-[var(--muted)] cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  const newValue = !isCustomModel;
                  setIsCustomModel(newValue);
                  if (newValue) {
                    setCustomModel(model);
                  }
                }}
              >
                {t.form?.useCustomModel || 'Use custom model'}
              </label>
            </div>
          </div>
        )}

        {showFileFilters && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setIsFilterSectionOpen(!isFilterSectionOpen)}
              className="flex items-center text-sm text-[var(--accent-primary)] hover:text-[var(--accent-primary)]/80 transition-colors"
            >
              <span className="mr-1.5 text-xs">{isFilterSectionOpen ? '▼' : '►'}</span>
              {t.form?.advancedOptions || 'Advanced Options'}
            </button>
            
            {isFilterSectionOpen && (
              <div className="mt-3 p-3 border border-[var(--border-color)]/70 rounded-md bg-[var(--background)]/30">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[var(--muted)] mb-1.5">
                    {t.form?.excludedDirs || 'Excluded Directories'}
                  </label>
                  <textarea
                    value={excludedDirs}
                    onChange={(e) => setExcludedDirs?.(e.target.value)}
                    rows={4}
                    className="block w-full rounded-md border border-[var(--border-color)]/50 bg-[var(--input-bg)] text-[var(--foreground)] px-3 py-2 text-sm focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-opacity-50 shadow-sm"
                    placeholder={t.form?.enterExcludedDirs || 'Enter excluded directories, one per line...'}
                  />
                  <div className="flex mt-1.5">
                    <button
                      type="button"
                      onClick={() => setShowDefaultDirs(!showDefaultDirs)}
                      className="text-xs text-[var(--accent-primary)] hover:text-[var(--accent-primary)]/80 transition-colors"
                    >
                      {showDefaultDirs ? (t.form?.hideDefault || 'Hide Default') : (t.form?.viewDefault || 'View Default')}
                    </button>
                  </div>
                  {showDefaultDirs && (
                    <div className="mt-2 p-2 rounded bg-[var(--background)]/50 text-xs">
                      <p className="mb-1 text-[var(--muted)]">{t.form?.defaultNote || 'These defaults are already applied. Add your custom exclusions above.'}</p>
                      <pre className="whitespace-pre-wrap font-mono text-[var(--muted)] overflow-y-auto max-h-32">{defaultExcludedDirs}</pre>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--muted)] mb-1.5">
                    {t.form?.excludedFiles || 'Excluded Files'}
                  </label>
                  <textarea
                    value={excludedFiles}
                    onChange={(e) => setExcludedFiles?.(e.target.value)}
                    rows={4}
                    className="block w-full rounded-md border border-[var(--border-color)]/50 bg-[var(--input-bg)] text-[var(--foreground)] px-3 py-2 text-sm focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-opacity-50 shadow-sm"
                    placeholder={t.form?.enterExcludedFiles || 'Enter excluded files, one per line...'}
                  />
                  <div className="flex mt-1.5">
                    <button
                      type="button"
                      onClick={() => setShowDefaultFiles(!showDefaultFiles)}
                      className="text-xs text-[var(--accent-primary)] hover:text-[var(--accent-primary)]/80 transition-colors"
                    >
                      {showDefaultFiles ? (t.form?.hideDefault || 'Hide Default') : (t.form?.viewDefault || 'View Default')}
                    </button>
                  </div>
                  {showDefaultFiles && (
                    <div className="mt-2 p-2 rounded bg-[var(--background)]/50 text-xs">
                      <p className="mb-1 text-[var(--muted)]">{t.form?.defaultNote || 'These defaults are already applied. Add your custom exclusions above.'}</p>
                      <pre className="whitespace-pre-wrap font-mono text-[var(--muted)] overflow-y-auto max-h-32">{defaultExcludedFiles}</pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
