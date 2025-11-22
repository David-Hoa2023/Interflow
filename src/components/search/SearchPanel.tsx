import React, { useState, useMemo } from 'react';
import { X, Search, Filter, ArrowRight } from 'lucide-react';
import { useConversationStore } from '../../store/conversationStore';
import { ConversationNode, NodeType } from '../../types/conversation';

interface SearchPanelProps {
  onClose: () => void;
  onNodeSelect?: (nodeId: string) => void;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({ onClose, onNodeSelect }) => {
  const { tree } = useConversationStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<NodeType | 'all'>('all');
  const [filterModel, setFilterModel] = useState<string>('all');

  // Get all unique models
  const allModels = useMemo(() => {
    const models = new Set<string>();
    tree.nodes.forEach((node) => {
      if (node.model) models.add(node.model);
    });
    return Array.from(models).sort();
  }, [tree.nodes]);

  // Search and filter results
  const searchResults = useMemo(() => {
    const results: { node: ConversationNode; matches: string[] }[] = [];

    tree.nodes.forEach((node) => {
      // Apply type filter
      if (filterType !== 'all' && node.type !== filterType) {
        return;
      }

      // Apply model filter
      if (filterModel !== 'all' && node.model !== filterModel) {
        return;
      }

      // Apply search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matches: string[] = [];

        if (node.question.toLowerCase().includes(query)) {
          matches.push('question');
        }
        if (node.answer.toLowerCase().includes(query)) {
          matches.push('answer');
        }
        if (node.name.toLowerCase().includes(query)) {
          matches.push('name');
        }
        if (node.tags?.some((tag) => tag.toLowerCase().includes(query))) {
          matches.push('tags');
        }

        if (matches.length > 0) {
          results.push({ node, matches });
        }
      } else {
        // No search query, show all (filtered) nodes
        results.push({ node, matches: [] });
      }
    });

    return results;
  }, [tree.nodes, searchQuery, filterType, filterModel]);

  const handleNodeClick = (nodeId: string) => {
    if (onNodeSelect) {
      onNodeSelect(nodeId);
    }
    onClose();
  };

  const highlightText = (text: string, query: string, maxLength: number = 150) => {
    if (!query) return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');

    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');

    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + query.length + 100);
    const snippet = (start > 0 ? '...' : '') + text.substring(start, end) + (end < text.length ? '...' : '');

    return snippet;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Search Conversations
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions, answers, names..."
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 mt-4">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as NodeType | 'all')}
              className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="question">Question</option>
              <option value="answer">Answer</option>
              <option value="decision">Decision</option>
              <option value="summary">Summary</option>
              <option value="reference">Reference</option>
              <option value="action">Action</option>
            </select>

            <select
              value={filterModel}
              onChange={(e) => setFilterModel(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white"
            >
              <option value="all">All Models</option>
              {allModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>

            <div className="text-sm text-gray-600 dark:text-gray-400 ml-auto">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {searchResults.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery ? 'No results found' : 'Enter a search query to find nodes'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {searchResults.map(({ node, matches }) => (
                <button
                  key={node.id}
                  onClick={() => handleNodeClick(node.id)}
                  className="w-full text-left p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {node.name}
                      </span>
                      {node.type && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded">
                          {node.type}
                        </span>
                      )}
                      {matches.length > 0 && (
                        <span className="text-xs text-blue-600 dark:text-blue-400">
                          Matches in: {matches.join(', ')}
                        </span>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="text-gray-600 dark:text-gray-300">
                      <strong>Q:</strong> {highlightText(node.question, searchQuery, 100)}
                    </div>
                    <div className="text-gray-600 dark:text-gray-300">
                      <strong>A:</strong> {highlightText(node.answer, searchQuery, 100)}
                    </div>
                  </div>

                  {(node.model || node.cost !== undefined) && (
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      {node.model && <span>Model: {node.model}</span>}
                      {node.cost !== undefined && node.cost > 0 && (
                        <span>Cost: ${node.cost.toFixed(6)}</span>
                      )}
                      {node.tokens && <span>{node.tokens} tokens</span>}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
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
