import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Layers, AlertCircle, CheckSquare, Square } from 'lucide-react';
import { useConversationStore } from '../../store/conversationStore';
import { useConfigStore } from '../../store/configStore';
import { llmService } from '../../services/llm/LLMService';
import { MarkdownRenderer } from '../common/MarkdownRenderer';

interface ContextPanelProps {
  nodeId: string;
  onClose: () => void;
}

export const ContextPanel: React.FC<ContextPanelProps> = ({ nodeId, onClose }) => {
  const { getNodeChain, getNode, updateNode } = useConversationStore();
  const { llmConfig } = useConfigStore();

  const node = getNode(nodeId);
  const chain = getNodeChain(nodeId);

  // Track local selection state
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());

  // Initialize selected nodes from node data
  useEffect(() => {
    const initialSelected = new Set<string>();
    chain.forEach((n) => {
      // By default, all nodes are included unless explicitly set to false
      if (n.includeInContext !== false) {
        initialSelected.add(n.id);
      }
    });
    setSelectedNodes(initialSelected);
  }, [chain]);

  if (!node) {
    return null;
  }

  const handleToggleNode = (nodeIdToToggle: string) => {
    const newSelected = new Set(selectedNodes);
    if (newSelected.has(nodeIdToToggle)) {
      newSelected.delete(nodeIdToToggle);
    } else {
      newSelected.add(nodeIdToToggle);
    }
    setSelectedNodes(newSelected);

    // Update the node's includeInContext property
    updateNode(nodeIdToToggle, { includeInContext: newSelected.has(nodeIdToToggle) });
  };

  const handleSelectAll = () => {
    const allSelected = new Set<string>();
    chain.forEach((n) => {
      allSelected.add(n.id);
      updateNode(n.id, { includeInContext: true });
    });
    setSelectedNodes(allSelected);
  };

  const handleDeselectAll = () => {
    chain.forEach((n) => {
      updateNode(n.id, { includeInContext: false });
    });
    setSelectedNodes(new Set());
  };

  // Calculate token counts for each node in the chain
  const nodesWithTokens = chain.map((n) => {
    const questionTokens = llmConfig
      ? llmService.estimateTokens(n.question, llmConfig.provider)
      : Math.ceil(n.question.length / 4);
    const answerTokens = llmConfig
      ? llmService.estimateTokens(n.answer, llmConfig.provider)
      : Math.ceil(n.answer.length / 4);

    return {
      node: n,
      questionTokens,
      answerTokens,
      totalTokens: questionTokens + answerTokens,
    };
  });

  // Calculate total tokens only for selected nodes
  const totalTokens = nodesWithTokens.reduce((sum, n) => {
    return sum + (selectedNodes.has(n.node.id) ? n.totalTokens : 0);
  }, 0);

  const selectedCount = selectedNodes.size;

  // Get model's context window
  const currentModel = llmConfig
    ? llmService
        .getAllModels()
        .find((m) => m.id === llmConfig.model && m.provider === llmConfig.provider)
    : null;

  const contextWindow = currentModel?.contextWindow || 8192;
  const percentageUsed = (totalTokens / contextWindow) * 100;
  const isNearLimit = percentageUsed > 80;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Context Path for "{node.name}"
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Token Summary */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Total Context Size
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {selectedCount} of {chain.length} node{chain.length !== 1 ? 's' : ''} selected
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalTokens.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">tokens</div>
            </div>
          </div>

          {/* Select All / Deselect All Buttons */}
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors"
            >
              Select All
            </button>
            <button
              onClick={handleDeselectAll}
              className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded transition-colors"
            >
              Deselect All
            </button>
            <div className="ml-auto text-xs text-gray-600 dark:text-gray-400">
              Click nodes to toggle selection
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  isNearLimit
                    ? 'bg-red-500'
                    : percentageUsed > 60
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(percentageUsed, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1 text-xs">
              <span className="text-gray-600 dark:text-gray-300">
                {percentageUsed.toFixed(1)}% of context window
              </span>
              <span className="text-gray-600 dark:text-gray-300">
                {currentModel?.name || 'Unknown Model'} ({contextWindow.toLocaleString()}{' '}
                tokens)
              </span>
            </div>
          </div>

          {isNearLimit && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800 dark:text-red-200">
                <strong>Warning:</strong> Context is approaching the model's token limit.
                Consider using a model with a larger context window or reducing the
                conversation depth.
              </div>
            </div>
          )}
        </div>

        {/* Context Chain */}
        <div className="p-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Full Conversation Path
          </h3>

          <div className="space-y-4">
            {nodesWithTokens.map(({ node: n, questionTokens, answerTokens, totalTokens }, index) => {
              const isCurrentNode = n.id === nodeId;
              const isSelected = selectedNodes.has(n.id);

              return (
                <div key={n.id}>
                  <div
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isCurrentNode
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-600'
                        : isSelected
                        ? 'bg-white dark:bg-gray-700 border-green-400 dark:border-green-600'
                        : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 opacity-60'
                    }`}
                    onClick={() => handleToggleNode(n.id)}
                  >
                    {/* Node Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleNode(n.id);
                          }}
                          className="flex-shrink-0"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        <div
                          className={`text-sm font-semibold ${
                            isCurrentNode
                              ? 'text-blue-700 dark:text-blue-300'
                              : isSelected
                              ? 'text-gray-700 dark:text-gray-300'
                              : 'text-gray-500 dark:text-gray-500'
                          }`}
                        >
                          {n.name}
                        </div>
                        {isCurrentNode && (
                          <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                            Current
                          </span>
                        )}
                        {!isSelected && (
                          <span className="text-xs bg-gray-500 text-white px-2 py-0.5 rounded">
                            Excluded
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span>Q: {questionTokens} tokens</span>
                        <span>A: {answerTokens} tokens</span>
                        <span className="font-semibold">
                          Total: {totalTokens} tokens
                        </span>
                      </div>
                    </div>

                    {/* Question */}
                    <div className="mb-3">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                        QUESTION
                      </div>
                      <MarkdownRenderer content={n.question} className="text-sm" />
                    </div>

                    {/* Answer */}
                    <div>
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                        ANSWER
                      </div>
                      <div className="line-clamp-6">
                        <MarkdownRenderer content={n.answer} className="text-sm" />
                      </div>
                    </div>

                    {/* Metadata */}
                    {(n.model || n.cost !== undefined) && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                        {n.model && <span>Model: {n.model}</span>}
                        {n.cost !== undefined && n.cost > 0 && (
                          <span>Cost: ${n.cost.toFixed(6)}</span>
                        )}
                        {n.metadata?.processingTime && (
                          <span>
                            Time: {(n.metadata.processingTime / 1000).toFixed(2)}s
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Arrow to next node */}
                  {index < nodesWithTokens.length - 1 && (
                    <div className="flex justify-center my-2">
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
