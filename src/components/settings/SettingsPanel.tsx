import React, { useState } from 'react';
import { Settings, X, Eye, EyeOff, Save } from 'lucide-react';
import { useConfigStore } from '../../store/configStore';
import { LLMProvider } from '../../types/llm';
import { ModelSelector } from './ModelSelector';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { llmConfig, setLLMConfig, theme, setTheme } = useConfigStore();
  const [apiKeys, setApiKeys] = useState({
    openai: llmConfig?.provider === 'openai' ? llmConfig.apiKey : '',
    anthropic: llmConfig?.provider === 'anthropic' ? llmConfig.apiKey : '',
    gemini: llmConfig?.provider === 'gemini' ? llmConfig.apiKey : '',
  });
  const [showKeys, setShowKeys] = useState({
    openai: false,
    anthropic: false,
    gemini: false,
  });
  const [temperature, setTemperature] = useState(llmConfig?.temperature || 0.7);
  const [maxTokens, setMaxTokens] = useState(llmConfig?.maxTokens || 2000);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!llmConfig) return;

    const currentProvider = llmConfig.provider;
    if (currentProvider === 'custom') {
      alert('Custom provider configuration is not yet supported');
      return;
    }
    const apiKey = apiKeys[currentProvider];

    if (!apiKey) {
      alert(`Please enter an API key for ${currentProvider}`);
      return;
    }

    setLLMConfig({
      ...llmConfig,
      apiKey,
      temperature,
      maxTokens,
    });

    onClose();
  };

  const handleApiKeyChange = (provider: LLMProvider, value: string) => {
    setApiKeys({ ...apiKeys, [provider]: value });
  };

  const toggleShowKey = (provider: LLMProvider) => {
    if (provider === 'custom') return;
    setShowKeys({ ...showKeys, [provider]: !showKeys[provider] });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Theme Selection */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Theme
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setTheme('light')}
                className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                  theme === 'light'
                    ? 'bg-purple-50 border-purple-300 text-purple-700 dark:bg-purple-900/20 dark:border-purple-600 dark:text-purple-400'
                    : 'bg-white border-gray-300 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                  theme === 'dark'
                    ? 'bg-purple-50 border-purple-300 text-purple-700 dark:bg-purple-900/20 dark:border-purple-600 dark:text-purple-400'
                    : 'bg-white border-gray-300 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                Dark
              </button>
            </div>
          </div>

          {/* Model Selection */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Model
            </h3>
            <ModelSelector />
          </div>

          {/* API Keys */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              API Keys
            </h3>
            <div className="space-y-3">
              {/* OpenAI */}
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  OpenAI API Key
                </label>
                <div className="relative">
                  <input
                    type={showKeys.openai ? 'text' : 'password'}
                    value={apiKeys.openai}
                    onChange={(e) => handleApiKeyChange('openai', e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 pr-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={() => toggleShowKey('openai')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                  >
                    {showKeys.openai ? (
                      <EyeOff className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Anthropic */}
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Anthropic API Key
                </label>
                <div className="relative">
                  <input
                    type={showKeys.anthropic ? 'text' : 'password'}
                    value={apiKeys.anthropic}
                    onChange={(e) => handleApiKeyChange('anthropic', e.target.value)}
                    placeholder="sk-ant-..."
                    className="w-full px-3 py-2 pr-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={() => toggleShowKey('anthropic')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                  >
                    {showKeys.anthropic ? (
                      <EyeOff className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Gemini */}
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Google Gemini API Key
                </label>
                <div className="relative">
                  <input
                    type={showKeys.gemini ? 'text' : 'password'}
                    value={apiKeys.gemini}
                    onChange={(e) => handleApiKeyChange('gemini', e.target.value)}
                    placeholder="AI..."
                    className="w-full px-3 py-2 pr-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={() => toggleShowKey('gemini')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                  >
                    {showKeys.gemini ? (
                      <EyeOff className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Model Parameters */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Model Parameters
            </h3>
            <div className="space-y-4">
              {/* Temperature */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Temperature
                  </label>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {temperature.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-purple-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Precise</span>
                  <span>Creative</span>
                </div>
              </div>

              {/* Max Tokens */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Max Tokens
                  </label>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {maxTokens}
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="4000"
                  step="100"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  className="w-full accent-purple-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>100</span>
                  <span>4000</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
