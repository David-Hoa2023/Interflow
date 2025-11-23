import { useState, useMemo } from 'react';
import { X, Clock, ChevronDown, ChevronUp, Calendar, Sparkles, Image as ImageIcon, GitBranch } from 'lucide-react';
import { useConversationStore } from '../../store/conversationStore';
import { ConversationNode } from '../../types/conversation';

interface ImageHistoryTimelineProps {
  onClose: () => void;
  nodeId?: string; // If provided, show history for a specific node
}

interface TimelineEntry {
  id: string;
  node: ConversationNode;
  timestamp: number;
  images: string[];
  isRoot: boolean;
  depth: number;
  parentId: string | null;
}

export function ImageHistoryTimeline({ onClose, nodeId }: ImageHistoryTimelineProps) {
  const { tree } = useConversationStore();
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [selectedImage, setSelectedImage] = useState<{ url: string; entry: TimelineEntry; index: number } | null>(null);

  // Build timeline entries
  const timelineEntries = useMemo(() => {
    const entries: TimelineEntry[] = [];

    // Helper to calculate depth in tree
    const getDepth = (node: ConversationNode, depth = 0): number => {
      if (!node.parentId) return depth;
      const parent = tree.nodes.get(node.parentId);
      return parent ? getDepth(parent, depth + 1) : depth;
    };

    // If nodeId is provided, only show that node and its children
    if (nodeId) {
      const targetNode = tree.nodes.get(nodeId);
      if (targetNode && targetNode.type === 'image' && targetNode.imageData?.generatedImages) {
        const entry: TimelineEntry = {
          id: targetNode.id,
          node: targetNode,
          timestamp: targetNode.metadata?.createdAt?.getTime() || 0,
          images: targetNode.imageData.generatedImages,
          isRoot: !targetNode.parentId,
          depth: getDepth(targetNode),
          parentId: targetNode.parentId || null,
        };
        entries.push(entry);
      }

      // Add children
      const addChildren = (parentId: string) => {
        tree.nodes.forEach((node) => {
          if (node.parentId === parentId && node.type === 'image' && node.imageData?.generatedImages) {
            const entry: TimelineEntry = {
              id: node.id,
              node,
              timestamp: node.metadata?.createdAt?.getTime() || 0,
              images: node.imageData.generatedImages,
              isRoot: false,
              depth: getDepth(node),
              parentId: node.parentId || null,
            };
            entries.push(entry);
            addChildren(node.id);
          }
        });
      };

      if (targetNode) {
        addChildren(targetNode.id);
      }
    } else {
      // Show all image nodes
      tree.nodes.forEach((node) => {
        if (node.type === 'image' && node.imageData?.generatedImages) {
          const entry: TimelineEntry = {
            id: node.id,
            node,
            timestamp: node.metadata?.createdAt?.getTime() || 0,
            images: node.imageData.generatedImages,
            isRoot: !node.parentId,
            depth: getDepth(node),
            parentId: node.parentId || null,
          };
          entries.push(entry);
        }
      });
    }

    // Sort by timestamp (newest first)
    entries.sort((a, b) => b.timestamp - a.timestamp);

    return entries;
  }, [tree.nodes, nodeId]);

  // Group entries by date
  const groupedEntries = useMemo(() => {
    const groups: Map<string, TimelineEntry[]> = new Map();

    timelineEntries.forEach((entry) => {
      const date = new Date(entry.timestamp);
      const dateKey = date.toLocaleDateString();

      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(entry);
    });

    return groups;
  }, [timelineEntries]);

  const toggleExpand = (entryId: string) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Image History Timeline
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {nodeId ? 'Viewing variations and edits' : `${timelineEntries.length} generations across all sessions`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {timelineEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ImageIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">No image history found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Generate some images to see their history here
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {Array.from(groupedEntries.entries()).map(([dateKey, entries]) => (
                <div key={dateKey}>
                  {/* Date Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {dateKey}
                    </h3>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                  </div>

                  {/* Timeline Entries for this date */}
                  <div className="relative pl-8 space-y-6">
                    {/* Timeline Line */}
                    <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500" />

                    {entries.map((entry, index) => {
                      const isExpanded = expandedEntries.has(entry.id);
                      const hasChildren = Array.from(tree.nodes.values()).some(
                        (node) => node.parentId === entry.id && node.type === 'image'
                      );

                      return (
                        <div key={entry.id} className="relative">
                          {/* Timeline Dot */}
                          <div
                            className={`absolute -left-7 top-4 w-4 h-4 rounded-full border-4 border-white dark:border-gray-800 ${
                              entry.isRoot
                                ? 'bg-blue-500'
                                : 'bg-purple-500'
                            }`}
                          />

                          {/* Entry Card */}
                          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 hover:shadow-md transition-shadow">
                            {/* Entry Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {hasChildren && (
                                    <GitBranch className="w-4 h-4 text-gray-400" />
                                  )}
                                  <h4 className="font-semibold text-gray-900 dark:text-white">
                                    {entry.node.name || `Generation ${entries.length - index}`}
                                  </h4>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatRelativeTime(entry.timestamp)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                  {entry.node.question}
                                </p>
                              </div>
                              <button
                                onClick={() => toggleExpand(entry.id)}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-5 h-5 text-gray-500" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-gray-500" />
                                )}
                              </button>
                            </div>

                            {/* Entry Metadata */}
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(entry.timestamp)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                {entry.node.imageData?.generationConfig?.model || 'Unknown Model'}
                              </span>
                              {entry.node.imageData?.generationConfig?.aspectRatio && (
                                <span>{entry.node.imageData.generationConfig.aspectRatio}</span>
                              )}
                              <span>{entry.images.length} {entry.images.length === 1 ? 'image' : 'images'}</span>
                            </div>

                            {/* Images Grid (shown when expanded) */}
                            {isExpanded && (
                              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                <div className="grid grid-cols-3 gap-2">
                                  {entry.images.map((imageUrl, imgIndex) => (
                                    <div
                                      key={`${entry.id}-${imgIndex}`}
                                      className="aspect-square bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                                      onClick={() => setSelectedImage({ url: imageUrl, entry, index: imgIndex })}
                                    >
                                      <img
                                        src={imageUrl}
                                        alt={`Generated ${imgIndex + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ))}
                                </div>

                                {/* Generation Config Details */}
                                {entry.node.imageData?.generationConfig && (
                                  <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-600/50 rounded text-xs">
                                    <p className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                      Generation Settings:
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-400">
                                      <div>Model: {entry.node.imageData.generationConfig.model}</div>
                                      <div>Aspect Ratio: {entry.node.imageData.generationConfig.aspectRatio}</div>
                                      {entry.node.imageData.generationConfig.numberOfImages && (
                                        <div>Count: {entry.node.imageData.generationConfig.numberOfImages}</div>
                                      )}
                                      {entry.node.imageData.generationConfig.compositionMode && (
                                        <>
                                          <div>Mode: {entry.node.imageData.generationConfig.compositionMode}</div>
                                          <div>
                                            Sources: {entry.node.imageData.generationConfig.compositionSources?.length || 0}
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Image Preview Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <div className="max-w-5xl w-full flex flex-col items-center gap-4">
              <img
                src={selectedImage.url}
                alt="Preview"
                className="max-h-[80vh] rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />

              <div
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white max-w-2xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="font-semibold mb-2">
                  {selectedImage.entry.node.name || 'Generated Image'}
                </h3>
                <p className="text-sm opacity-90 mb-3">{selectedImage.entry.node.question}</p>
                <div className="flex items-center gap-4 text-xs opacity-80">
                  <span>{selectedImage.entry.node.imageData?.generationConfig?.model}</span>
                  <span>{selectedImage.entry.node.imageData?.generationConfig?.aspectRatio}</span>
                  <span>{formatRelativeTime(selectedImage.entry.timestamp)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
