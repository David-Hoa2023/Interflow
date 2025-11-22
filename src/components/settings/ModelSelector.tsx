import React, { useState } from 'react';
import { ChevronDown, Zap, DollarSign, Info } from 'lucide-react';
import { useConfigStore } from '../../store/configStore';
import { llmService } from '../../services/llm/LLMService';
import { LLMProvider, ModelInfo } from '../../types/llm';

export const ModelSelector: React.FC = () => {
  const { llmConfig, setLLMConfig } = useConfigStore();
  const [isOpen, setIsOpen] = useState(false);

  if (!llmConfig) {
    return null;
  }

  const allModels = llmService.getAllModels();
  const providers: LLMProvider[] = ['openai', 'anthropic', 'gemini'];

  const currentModel = allModels.find(
    (m) => m.id === llmConfig.model && m.provider === llmConfig.provider
  );

  const handleProviderChange = (provider: LLMProvider) => {
    const providerModels = allModels.filter((m) => m.provider === provider);
    if (providerModels.length > 0) {
      setLLMConfig({
        ...llmConfig,
        provider,
        model: providerModels[0].id,
      });
    }
  };

  const handleModelChange = (model: ModelInfo) => {
    setLLMConfig({
      ...llmConfig,
      provider: model.provider,
      model: model.id,
    });
    setIsOpen(false);
  };

  const formatCost = (cost: number) => {
    return cost < 0.001 ? `$${(cost * 1000).toFixed(4)}/1M` : `$${cost.toFixed(3)}/1K`;
  };

  const formatContextWindow = (tokens: number) => {
    return tokens >= 1000 ? `${(tokens / 1000).toFixed(0)}K` : tokens.toString();
  };

  return (
    <div className="relative">
      {/* Current Model Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-purple-500" />
            <span className="font-medium text-sm text-gray-900 dark:text-white">
              {currentModel?.name || llmConfig.model}
            </span>
          </div>
          {currentModel && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <span>{formatContextWindow(currentModel.contextWindow)} ctx</span>
              <span>•</span>
              <span>{formatCost(currentModel.inputCostPer1kTokens)}</span>
            </div>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 left-0 z-20 w-96 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-96 overflow-y-auto">
            {/* Provider Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {providers.map((provider) => {
                const providerModels = allModels.filter((m) => m.provider === provider);
                const isActive = llmConfig.provider === provider;

                return (
                  <button
                    key={provider}
                    onClick={() => handleProviderChange(provider)}
                    className={`flex-1 px-4 py-2 text-sm font-medium capitalize transition-colors ${
                      isActive
                        ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {provider}
                    <span className="ml-1 text-xs text-gray-500">
                      ({providerModels.length})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Model List */}
            <div className="p-2">
              {allModels
                .filter((m) => m.provider === llmConfig.provider)
                .map((model) => {
                  const isSelected = model.id === llmConfig.model;

                  return (
                    <button
                      key={model.id}
                      onClick={() => handleModelChange(model)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-gray-900 dark:text-white">
                              {model.name}
                            </span>
                            {isSelected && (
                              <span className="text-xs bg-purple-600 text-white px-1.5 py-0.5 rounded">
                                Active
                              </span>
                            )}
                          </div>
                          {model.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {model.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs">
                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                              <Info className="w-3 h-3" />
                              <span>{formatContextWindow(model.contextWindow)} tokens</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                              <DollarSign className="w-3 h-3" />
                              <span>
                                In: {formatCost(model.inputCostPer1kTokens)}
                                {' / '}
                                Out: {formatCost(model.outputCostPer1kTokens)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
