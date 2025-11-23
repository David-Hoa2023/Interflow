import React, { useMemo } from 'react';
import { X, Bookmark, Star, Trash2, ExternalLink } from 'lucide-react';
import { useConversationStore } from '../../store/conversationStore';
import { ConversationNode } from '../../types/conversation';

interface BookmarkPanelProps {
  onClose: () => void;
  onNavigateToNode: (nodeId: string) => void;
}

export const BookmarkPanel: React.FC<BookmarkPanelProps> = ({ onClose, onNavigateToNode }) => {
  const { tree, updateNode } = useConversationStore();

  // Get all bookmarked nodes
  const bookmarkedNodes = useMemo(() => {
    const nodes: ConversationNode[] = [];
    tree.nodes.forEach((node) => {
      if (node.isBookmarked) {
        nodes.push(node);
      }
    });
    // Sort by timestamp (most recent first)
    return nodes.sort((a, b) => b.timestamp - a.timestamp);
  }, [tree.nodes]);

  const handleRemoveBookmark = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateNode(nodeId, { isBookmarked: false });
  };

  const handleNavigate = (nodeId: string) => {
    onNavigateToNode(nodeId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Bookmarked Nodes
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bookmarks List */}
        <div className="flex-1 overflow-y-auto p-6">
          {bookmarkedNodes.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                No bookmarks yet
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Click the star icon on any node to bookmark it for quick access
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarkedNodes.map((node) => (
                <div
                  key={node.id}
                  className="group p-4 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 hover:border-yellow-400 dark:hover:border-yellow-600 transition-colors cursor-pointer"
                  onClick={() => handleNavigate(node.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Node name and type */}
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {node.name}
                        </h3>
                        <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">
                          {node.type}
                        </span>
                      </div>

                      {/* Question */}
                      <div className="mb-2">
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                          <span className="font-semibold">Q:</span> {node.question}
                        </p>
                      </div>

                      {/* Answer preview */}
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          <span className="font-semibold">A:</span> {node.answer}
                        </p>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        {node.model && (
                          <span className="flex items-center gap-1">
                            <span className="font-semibold">Model:</span> {node.model}
                          </span>
                        )}
                        {node.tokens && (
                          <span className="flex items-center gap-1">
                            <span className="font-semibold">Tokens:</span> {node.tokens}
                          </span>
                        )}
                        {node.cost !== undefined && (
                          <span className="flex items-center gap-1">
                            <span className="font-semibold">Cost:</span> ${node.cost.toFixed(4)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <span className="font-semibold">Created:</span>{' '}
                          {new Date(node.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => handleRemoveBookmark(node.id, e)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Remove bookmark"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 opacity-0 group-hover:opacity-100"
                        title="Navigate to node"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with stats */}
        {bookmarkedNodes.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{bookmarkedNodes.length} bookmark{bookmarkedNodes.length !== 1 ? 's' : ''}</span>
              <span className="text-xs">Click any bookmark to navigate to that node</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
