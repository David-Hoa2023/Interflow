import { useState, useRef } from 'react';
import { Send, Loader2, Eye, Upload, Sparkles } from 'lucide-react';
import { useConversationStore } from '../../store/conversationStore';
import { useConfigStore } from '../../store/configStore';
import { visionAnalysisService } from '../../services/image/VisionAnalysisService';

interface VisionAnalysisWindowProps {
  parentNodeId: string | null;
  onComplete: () => void;
}

export function VisionAnalysisWindow({ parentNodeId, onComplete }: VisionAnalysisWindowProps) {
  const [question, setQuestion] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCommonPrompts, setShowCommonPrompts] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addNode, generateNodeName } = useConversationStore();
  const { llmConfig } = useConfigStore();

  const commonPrompts = visionAnalysisService.getCommonPrompts();

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !imageUrl || isLoading || !llmConfig?.apiKey) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await visionAnalysisService.analyzeImage(
        {
          imageUrl,
          question: question.trim(),
          model: 'gemini-pro-vision',
        },
        llmConfig.apiKey
      );

      if (result.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      // Create new vision analysis node
      const newNodeId = `node-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      const nodeName = generateNodeName(parentNodeId);

      const newNode = {
        id: newNodeId,
        name: nodeName,
        type: 'answer' as const,
        question: question.trim(),
        answer: result.analysis,
        parentId: parentNodeId,
        childrenIds: [],
        context: [],

        // Attach the analyzed image
        attachments: [
          {
            id: `attach-${Date.now()}`,
            type: 'image' as const,
            url: imageUrl,
            filename: 'analyzed-image',
            mimeType: imageUrl.startsWith('data:')
              ? imageUrl.split(';')[0].split(':')[1]
              : 'image/jpeg',
          },
        ],

        // Enhanced metadata
        model: result.model,
        provider: 'gemini',
        metadata: {
          analysisType: 'vision',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        tags: ['vision-analysis'],

        // Position and UI state
        timestamp: Date.now(),
        position: { x: 0, y: 0 },
        isCollapsed: false,
      };

      addNode(newNode);
      setIsLoading(false);
      setQuestion('');
      setImageUrl('');
      onComplete();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Vision Analysis
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Analyze images and ask questions using Gemini Vision
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Image to Analyze *
            </label>

            {!imageUrl ? (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-purple-500 dark:hover:border-purple-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Drag & drop an image here, or click to select
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative">
                <img
                  src={imageUrl}
                  alt="To analyze"
                  className="w-full max-h-64 object-contain rounded-lg border border-gray-300 dark:border-gray-600"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Question */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Question about the Image *
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to know about this image?"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              rows={3}
              disabled={isLoading}
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {question.length} characters
              </p>
              <button
                type="button"
                onClick={() => setShowCommonPrompts(!showCommonPrompts)}
                className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:underline"
              >
                <Sparkles className="w-3 h-3" />
                {showCommonPrompts ? 'Hide' : 'Show'} Common Prompts
              </button>
            </div>
          </div>

          {/* Common Prompts */}
          {showCommonPrompts && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                COMMON PROMPTS
              </p>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {commonPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setQuestion(prompt.prompt)}
                    className="text-left px-3 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg text-xs transition-colors border border-gray-200 dark:border-gray-600"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {prompt.label}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                      {prompt.prompt}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onComplete}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-white rounded-lg transition-colors text-sm font-medium"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !question.trim() || !imageUrl}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Analyze Image
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
