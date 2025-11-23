import { memo, useState, useEffect, useMemo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Plus, ChevronDown, ChevronRight, ArrowRight, Trash2, HelpCircle, MessageSquare, GitBranch, FileText, Link as LinkIcon, CheckSquare, Zap, DollarSign, Clock, Layers, Edit2, Check, Star } from 'lucide-react';
import { ConversationNode, NodeType } from '../../types/conversation';
import { useConversationStore } from '../../store/conversationStore';
import { parseAnswerIntoSections } from '../../utils/answerParser';
import { ContextPanel } from '../context/ContextPanel';
import { MarkdownRenderer } from '../common/MarkdownRenderer';

interface ChatNodeData extends ConversationNode {
  onSpawnChild: (nodeId: string, selectedSectionIndex?: number) => void;
  onFocusChild?: (nodeId: string) => void;
}

// Helper function to get node type styling
const getNodeTypeStyle = (type: NodeType) => {
  switch (type) {
    case 'question':
      return {
        icon: HelpCircle,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-300 dark:border-blue-700',
        label: 'Question',
      };
    case 'decision':
      return {
        icon: GitBranch,
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-50 dark:bg-amber-900/20',
        borderColor: 'border-amber-300 dark:border-amber-700',
        label: 'Decision',
      };
    case 'summary':
      return {
        icon: FileText,
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        borderColor: 'border-purple-300 dark:border-purple-700',
        label: 'Summary',
      };
    case 'reference':
      return {
        icon: LinkIcon,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-300 dark:border-green-700',
        label: 'Reference',
      };
    case 'action':
      return {
        icon: CheckSquare,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-300 dark:border-red-700',
        label: 'Action',
      };
    default: // 'answer'
      return {
        icon: MessageSquare,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-300 dark:border-blue-700',
        label: 'Answer',
      };
  }
};

function ChatNodeComponent({ data, selected }: NodeProps<ChatNodeData>) {
  const { toggleCollapse, tree, deleteNode, updateNode } = useConversationStore();
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | null>(null);
  const [sections, setSections] = useState(parseAnswerIntoSections(data.answer));
  const [showContextPanel, setShowContextPanel] = useState(false);
  const [isEditingType, setIsEditingType] = useState(false);

  // Update sections if answer changes
  useEffect(() => {
    if (data.answerSections) {
      setSections(data.answerSections);
    } else {
      setSections(parseAnswerIntoSections(data.answer));
    }
  }, [data.answer, data.answerSections]);

  // Find which sections have been used to spawn children and map to child IDs
  const sectionsWithChildren = useMemo(() => {
    const usedSections = new Set<number>();
    const sectionToChildMap = new Map<number, string[]>();
    
    data.childrenIds.forEach((childId) => {
      const childNode = tree.nodes.get(childId);
      if (childNode && childNode.selectedSectionIndexFromParent !== undefined) {
        const sectionIndex = childNode.selectedSectionIndexFromParent;
        usedSections.add(sectionIndex);
        
        // Map section index to child IDs
        if (!sectionToChildMap.has(sectionIndex)) {
          sectionToChildMap.set(sectionIndex, []);
        }
        sectionToChildMap.get(sectionIndex)!.push(childId);
      }
    });
    
    return { usedSections, sectionToChildMap };
  }, [data.childrenIds, tree]);

  const handleSpawn = () => {
    data.onSpawnChild(data.id, selectedSectionIndex !== null ? selectedSectionIndex : undefined);
    // Clear selection after spawning
    setSelectedSectionIndex(null);
  };

  const handleToggleCollapse = () => {
    toggleCollapse(data.id);
  };

  const handleSectionSelect = (index: number) => {
    setSelectedSectionIndex(index === selectedSectionIndex ? null : index);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${data.name}"? This will also delete all child conversations.`)) {
      deleteNode(data.id);
    }
  };

  const handleToggleBookmark = () => {
    updateNode(data.id, { isBookmarked: !data.isBookmarked });
  };

  const handleTypeChange = (newType: NodeType) => {
    updateNode(data.id, { type: newType });
    setIsEditingType(false);
  };

  const nodeStyle = getNodeTypeStyle(data.type || 'answer');
  const NodeIcon = nodeStyle.icon;

  const allNodeTypes: NodeType[] = ['question', 'answer', 'decision', 'summary', 'reference', 'action'];

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 ${
        selected ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'
      } min-w-[300px] max-w-[400px] transition-all`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleCollapse}
            className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title={data.isCollapsed ? 'Expand node' : 'Collapse node'}
          >
            {data.isCollapsed ? (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Expand</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Collapse</span>
              </>
            )}
          </button>
          <div className="flex items-center gap-1.5">
            <NodeIcon className={`w-3.5 h-3.5 ${nodeStyle.color}`} />
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              {data.name || `Node ${data.id.slice(0, 8)}`}
            </div>
            <div className="relative">
              <button
                onClick={() => setIsEditingType(!isEditingType)}
                className={`text-xs px-1.5 py-0.5 rounded ${nodeStyle.bgColor} ${nodeStyle.color} font-medium hover:opacity-80 transition-opacity flex items-center gap-1`}
                title="Change node type"
              >
                {nodeStyle.label}
                <Edit2 className="w-2.5 h-2.5" />
              </button>
              {isEditingType && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsEditingType(false)}
                  />
                  <div className="absolute top-full mt-1 left-0 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg min-w-[120px]">
                    {allNodeTypes.map((type) => {
                      const typeStyle = getNodeTypeStyle(type);
                      const TypeIcon = typeStyle.icon;
                      const isCurrentType = type === (data.type || 'answer');

                      return (
                        <button
                          key={type}
                          onClick={() => handleTypeChange(type)}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                            isCurrentType ? 'bg-gray-50 dark:bg-gray-700' : ''
                          }`}
                        >
                          <TypeIcon className={`w-3.5 h-3.5 ${typeStyle.color}`} />
                          <span className="flex-1 text-left text-gray-900 dark:text-white">
                            {typeStyle.label}
                          </span>
                          {isCurrentType && <Check className="w-3 h-3 text-green-600" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(data.timestamp).toLocaleTimeString()}
          </div>
          <button
            onClick={handleToggleBookmark}
            className={`p-1 rounded transition-colors ${
              data.isBookmarked
                ? 'text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                : 'text-gray-400 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title={data.isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            <Star className={`w-4 h-4 ${data.isBookmarked ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors text-red-600 dark:text-red-400"
            title="Delete node"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metadata Bar */}
      {!data.isCollapsed && (data.model || data.tokens || data.cost !== undefined) && (
        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 text-xs">
          {data.model && (
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
              <Zap className="w-3 h-3" />
              <span className="font-medium">{data.model}</span>
            </div>
          )}
          {data.tokens && (
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
              <span className="font-medium">{data.tokens.toLocaleString()} tokens</span>
            </div>
          )}
          {data.cost !== undefined && data.cost > 0 && (
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
              <DollarSign className="w-3 h-3" />
              <span className="font-medium">${data.cost.toFixed(6)}</span>
            </div>
          )}
          {data.metadata?.processingTime && (
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
              <Clock className="w-3 h-3" />
              <span className="font-medium">{(data.metadata.processingTime / 1000).toFixed(2)}s</span>
            </div>
          )}
        </div>
      )}

      {!data.isCollapsed && (
        <>
          {/* Question */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
              QUESTION
            </div>
            <MarkdownRenderer content={data.question} className="text-sm" />
          </div>

          {/* Answer with Sections */}
          <div className="p-4">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 flex items-center justify-between">
              <span>ANSWER</span>
              {selectedSectionIndex !== null && (
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  Section {selectedSectionIndex + 1} selected
                </span>
              )}
            </div>
            
            <div className="space-y-3">
              {sections.map((section, index) => {
                const isSelected = selectedSectionIndex === index;
                const hasChildren = sectionsWithChildren.usedSections.has(index);
                const isHighlighted = isSelected || hasChildren;
                const childIds = sectionsWithChildren.sectionToChildMap.get(index) || [];
                const firstChildId = childIds[0]; // Focus on first child if multiple
                
                const handleArrowClick = (e: React.MouseEvent) => {
                  e.stopPropagation();
                  if (firstChildId && data.onFocusChild) {
                    data.onFocusChild(firstChildId);
                  }
                };
                
                return (
                  <div
                    key={section.id}
                    className={`flex gap-2 p-2 rounded border transition-colors relative ${
                      isHighlighted
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                        : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                    } ${hasChildren ? 'ring-2 ring-blue-400 dark:ring-blue-600' : ''}`}
                  >
                    <div className="flex items-start pt-0.5">
                      <input
                        type="radio"
                        name={`section-${data.id}`}
                        checked={isSelected}
                        onChange={() => handleSectionSelect(index)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => handleSectionSelect(index)}
                    >
                      <MarkdownRenderer
                        content={section.text}
                        className="text-sm"
                      />
                    </div>
                    {hasChildren && (
                      <button
                        onClick={handleArrowClick}
                        className="absolute -right-2 -top-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white dark:border-gray-800 transition-colors cursor-pointer z-10"
                        title={`Focus on child node (${childIds.length} child${childIds.length > 1 ? 'ren' : ''})`}
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {selectedSectionIndex !== null && (
              <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs">
                <div className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                  Selected for context:
                </div>
                <div className="text-blue-700 dark:text-blue-300 italic">
                  "{sections[selectedSectionIndex]?.text.substring(0, 100)}
                  {sections[selectedSectionIndex]?.text.length && sections[selectedSectionIndex].text.length > 100 ? '...' : ''}"
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
            <button
              onClick={() => setShowContextPanel(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm font-medium"
              title="View full context path"
            >
              <Layers className="w-4 h-4" />
              View Context
            </button>
            <button
              onClick={handleSpawn}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              {selectedSectionIndex !== null
                ? 'Continue with Selected Section'
                : 'Continue Conversation'}
            </button>
          </div>
        </>
      )}

      {/* Context Panel Modal */}
      {showContextPanel && (
        <ContextPanel nodeId={data.id} onClose={() => setShowContextPanel(false)} />
      )}

      {/* Handles for connections */}
      {data.parentId && (
        <Handle type="target" position={Position.Top} className="w-3 h-3" />
      )}
      {data.childrenIds.length > 0 && (
        <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
      )}
    </div>
  );
}

export default memo(ChatNodeComponent);
