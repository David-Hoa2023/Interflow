import React, { useState } from 'react';
import { X, Download, FileText, FileJson, FileCode, CheckCircle } from 'lucide-react';
import { useConversationStore } from '../../store/conversationStore';
import { exportToMarkdown, exportToJSON, exportToHTML, downloadFile, generateFilename } from '../../utils/exportUtils';

interface ExportPanelProps {
  onClose: () => void;
}

type ExportFormat = 'markdown' | 'json' | 'html';

export const ExportPanel: React.FC<ExportPanelProps> = ({ onClose }) => {
  const { tree, currentSessionId, sessions } = useConversationStore();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('markdown');
  const [exported, setExported] = useState(false);

  const currentSession = currentSessionId ? sessions.get(currentSessionId) : null;
  const sessionName = currentSession?.name || 'Unnamed Session';

  const handleExport = () => {
    let content: string;
    let filename: string;
    let mimeType: string;

    if (selectedFormat === 'markdown') {
      content = exportToMarkdown(tree, sessionName);
      filename = generateFilename(sessionName, 'md');
      mimeType = 'text/markdown';
    } else if (selectedFormat === 'json') {
      content = exportToJSON(tree, sessionName, currentSessionId || undefined);
      filename = generateFilename(sessionName, 'json');
      mimeType = 'application/json';
    } else {
      content = exportToHTML(tree, sessionName);
      filename = generateFilename(sessionName, 'html');
      mimeType = 'text/html';
    }

    downloadFile(content, filename, mimeType);
    setExported(true);

    // Reset exported state after 2 seconds
    setTimeout(() => {
      setExported(false);
    }, 2000);
  };

  const formatOptions = [
    {
      id: 'markdown' as const,
      name: 'Markdown',
      icon: FileText,
      description: 'Human-readable format with headings, metadata, and formatting',
      extension: '.md',
    },
    {
      id: 'json' as const,
      name: 'JSON',
      icon: FileJson,
      description: 'Machine-readable format with full data structure',
      extension: '.json',
    },
    {
      id: 'html' as const,
      name: 'HTML',
      icon: FileCode,
      description: 'Styled webpage with embedded images and responsive design',
      extension: '.html',
    },
  ];

  // Calculate stats
  const totalNodes = tree.nodes.size;
  const totalCost = Array.from(tree.nodes.values()).reduce(
    (sum, node) => sum + (node.cost || 0),
    0
  );
  const totalTokens = Array.from(tree.nodes.values()).reduce(
    (sum, node) => sum + (node.tokens || 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Download className="w-6 h-6 text-green-600 dark:text-green-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Export Conversation
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
          {/* Session Info */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Current Session
            </h3>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <div>
                <strong>Name:</strong> {sessionName}
              </div>
              <div>
                <strong>Nodes:</strong> {totalNodes}
              </div>
              {totalTokens > 0 && (
                <div>
                  <strong>Total Tokens:</strong> {totalTokens.toLocaleString()}
                </div>
              )}
              {totalCost > 0 && (
                <div>
                  <strong>Total Cost:</strong> ${totalCost.toFixed(6)}
                </div>
              )}
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Select Export Format
            </h3>
            <div className="space-y-3">
              {formatOptions.map((format) => {
                const Icon = format.icon;
                const isSelected = selectedFormat === format.id;

                return (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-600'
                        : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon
                        className={`w-6 h-6 flex-shrink-0 ${
                          isSelected
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-400'
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {format.name}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {format.extension}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {format.description}
                        </p>
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview Info */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-2">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                {selectedFormat === 'markdown' ? (
                  <>
                    The Markdown export will include all nodes in a tree structure with
                    headers, metadata, questions, answers, and embedded images formatted for readability.
                  </>
                ) : selectedFormat === 'json' ? (
                  <>
                    The JSON export will include the complete data structure with all
                    metadata, making it easy to re-import or process programmatically.
                  </>
                ) : (
                  <>
                    The HTML export will create a styled webpage with embedded images, responsive design,
                    and color-coded sections. Perfect for sharing or archiving conversations.
                  </>
                )}
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
            onClick={handleExport}
            disabled={exported}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              exported
                ? 'bg-green-600 text-white cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {exported ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Downloaded!
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export {selectedFormat === 'markdown' ? 'Markdown' : selectedFormat === 'json' ? 'JSON' : 'HTML'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
