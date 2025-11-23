import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useConversationStore } from '../../store/conversationStore';

interface BreadcrumbNavProps {
  currentNodeId: string | null;
  onNavigate: (nodeId: string | null) => void;
}

export const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({ currentNodeId, onNavigate }) => {
  const { getNodeChain } = useConversationStore();

  if (!currentNodeId) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => onNavigate(null)}
          className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>All Nodes</span>
        </button>
      </div>
    );
  }

  const chain = getNodeChain(currentNodeId);

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
      {/* Home/Root button */}
      <button
        onClick={() => onNavigate(null)}
        className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex-shrink-0"
        title="Return to canvas view"
      >
        <Home className="w-4 h-4" />
      </button>

      {/* Breadcrumb trail */}
      {chain.map((node, index) => {
        const isLast = index === chain.length - 1;
        const isBookmarked = node.isBookmarked;

        return (
          <React.Fragment key={node.id}>
            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-600 flex-shrink-0" />
            <button
              onClick={() => !isLast && onNavigate(node.id)}
              className={`flex items-center gap-1 text-sm transition-colors flex-shrink-0 ${
                isLast
                  ? 'text-blue-600 dark:text-blue-400 font-semibold cursor-default'
                  : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
              disabled={isLast}
              title={`${node.name}\n${node.question.slice(0, 100)}...`}
            >
              {isBookmarked && (
                <span className="text-yellow-500" title="Bookmarked">
                  ★
                </span>
              )}
              <span className="max-w-[200px] truncate">{node.name}</span>
            </button>
          </React.Fragment>
        );
      })}

      {/* Node metadata */}
      {chain.length > 0 && (
        <div className="ml-auto flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
          <span>Depth: {chain.length}</span>
          {chain[chain.length - 1].model && (
            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
              {chain[chain.length - 1].model}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
