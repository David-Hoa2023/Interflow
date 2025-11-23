import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Image as ImageIcon, Settings, Layers, FileText } from 'lucide-react';
import { useConversationStore } from '../../store/conversationStore';
import { useConfigStore } from '../../store/configStore';
import { imageGenerationService } from '../../services/image/ImageGenerationService';
import { ImageGenerationConfig, ImageCompositionSource } from '../../types/conversation';
import { ImageCompositionBuilder, TemplateSelector } from '../image';

interface ImageGenerationWindowProps {
  parentNodeId: string | null;
  onComplete: () => void;
}

export default function ImageGenerationWindow({ parentNodeId, onComplete }: ImageGenerationWindowProps) {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { addNode, generateNodeName } = useConversationStore();
  const { llmConfig } = useConfigStore();

  // Image generation config
  const [model, setModel] = useState<ImageGenerationConfig['model']>('imagen-3.0-generate-001');
  const [aspectRatio, setAspectRatio] = useState<ImageGenerationConfig['aspectRatio']>('1:1');
  const [numberOfImages, setNumberOfImages] = useState(1);
  const [personGeneration, setPersonGeneration] = useState<ImageGenerationConfig['personGeneration']>('dont_allow');
  const [safetyFilterLevel, setSafetyFilterLevel] = useState<ImageGenerationConfig['safetyFilterLevel']>('block_medium_and_above');
  const [addWatermark, setAddWatermark] = useState(false);

  // Multi-image composition
  const [useComposition, setUseComposition] = useState(false);
  const [compositionSources, setCompositionSources] = useState<ImageCompositionSource[]>([]);
  const [compositionMode, setCompositionMode] = useState<'blend' | 'collage' | 'style-transfer' | 'combine'>('blend');

  useEffect(() => {
    textareaRef.current?.focus();
  }, [parentNodeId]);

  const handleTemplateSelect = (templatePrompt: string, templateConfig: Partial<ImageGenerationConfig>) => {
    setPrompt(templatePrompt);
    if (templateConfig.aspectRatio) setAspectRatio(templateConfig.aspectRatio);
    if (templateConfig.model) setModel(templateConfig.model);
    if (templateConfig.numberOfImages) setNumberOfImages(templateConfig.numberOfImages);
    if (templateConfig.negativePrompt) setNegativePrompt(templateConfig.negativePrompt);
    if (templateConfig.personGeneration) setPersonGeneration(templateConfig.personGeneration);
    if (templateConfig.safetyFilterLevel) setSafetyFilterLevel(templateConfig.safetyFilterLevel);
    if (templateConfig.addWatermark !== undefined) setAddWatermark(templateConfig.addWatermark);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading || !llmConfig?.apiKey) return;

    // Validate config
    const config: ImageGenerationConfig = {
      model,
      aspectRatio,
      prompt: prompt.trim(),
      negativePrompt: negativePrompt.trim() || undefined,
      numberOfImages,
      personGeneration,
      safetyFilterLevel,
      addWatermark,
      // Add composition data if enabled
      compositionSources: useComposition ? compositionSources : undefined,
      compositionMode: useComposition ? compositionMode : undefined,
    };

    const validation = imageGenerationService.validateConfig(config);
    if (!validation.valid) {
      setError(validation.errors.join(', '));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Generate image
      const result = await imageGenerationService.generateImage({
        apiKey: llmConfig.apiKey,
        config,
        onProgress: (status) => {
          console.log('Image generation progress:', status);
        },
      });

      if (result.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      // Create history entry for each generated image
      const historyEntries = result.imageUrls.map((url) =>
        imageGenerationService.createHistoryEntry(result, url)
      );

      // Create new image node
      const newNodeId = `node-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      const nodeName = generateNodeName(parentNodeId);

      const newNode = {
        id: newNodeId,
        name: nodeName,
        type: 'image' as const,
        question: `Generate image: ${prompt.trim()}`,
        answer: `Generated ${result.imageUrls.length} image(s) using ${config.model}`,
        parentId: parentNodeId,
        childrenIds: [],
        context: [],

        // Image-specific data
        imageData: {
          generatedImages: result.imageUrls,
          currentImageIndex: 0,
          generationConfig: config,
          editHistory: historyEntries,
          isGenerating: false,
        },

        // Enhanced metadata
        model: config.model,
        provider: 'gemini',
        metadata: {
          parameters: {
            aspectRatio: config.aspectRatio,
            numberOfImages: config.numberOfImages,
            personGeneration: config.personGeneration,
            safetyFilterLevel: config.safetyFilterLevel,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        tags: ['image-generation'],

        // Position and UI state
        timestamp: Date.now(),
        position: { x: 0, y: 0 }, // Will be positioned by the canvas
        isCollapsed: false,
      };

      addNode(newNode);
      setIsLoading(false);
      setPrompt('');
      setNegativePrompt('');
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
            <ImageIcon className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Generate Image
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Create images using Gemini Imagen AI
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Prompt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Image Prompt *
            </label>
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate... (e.g., 'A serene mountain landscape at sunset with a lake in the foreground')"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              rows={4}
              disabled={isLoading}
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {prompt.length} / 5000 characters
              </p>
              <button
                type="button"
                onClick={() => setShowTemplates(true)}
                className="flex items-center gap-1 text-xs text-pink-600 dark:text-pink-400 hover:underline"
              >
                <FileText className="w-3 h-3" />
                Use Template
              </button>
            </div>
          </div>

          {/* Quick Settings */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value as ImageGenerationConfig['model'])}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={isLoading}
              >
                <option value="imagen-3.0-generate-001">Imagen 3.0 (Best Quality)</option>
                <option value="imagen-3.0-fast-generate-001">Imagen 3.0 Fast</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Aspect Ratio
              </label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as ImageGenerationConfig['aspectRatio'])}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={isLoading}
              >
                <option value="1:1">Square (1:1)</option>
                <option value="3:4">Portrait (3:4)</option>
                <option value="4:3">Landscape (4:3)</option>
                <option value="9:16">Tall (9:16)</option>
                <option value="16:9">Wide (16:9)</option>
              </select>
            </div>
          </div>

          {/* Number of Images */}
          {!useComposition && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Number of Images: {numberOfImages}
              </label>
              <input
                type="range"
                min="1"
                max="4"
                value={numberOfImages}
                onChange={(e) => setNumberOfImages(parseInt(e.target.value))}
                className="w-full"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Generate 1-4 images per request
              </p>
            </div>
          )}

          {/* Multi-Image Composition Toggle */}
          <button
            type="button"
            onClick={() => setUseComposition(!useComposition)}
            className="flex items-center gap-2 text-sm text-pink-600 dark:text-pink-400 hover:underline"
          >
            <Layers className="w-4 h-4" />
            {useComposition ? 'Disable' : 'Enable'} Multi-Image Composition
          </button>

          {/* Composition Builder */}
          {useComposition && (
            <ImageCompositionBuilder
              compositionSources={compositionSources}
              compositionMode={compositionMode}
              onSourcesChange={setCompositionSources}
              onModeChange={setCompositionMode}
              maxImages={14}
            />
          )}

          {/* Advanced Settings Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-pink-600 dark:text-pink-400 hover:underline"
          >
            <Settings className="w-4 h-4" />
            {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
          </button>

          {/* Advanced Settings */}
          {showAdvanced && (
            <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              {/* Negative Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Negative Prompt (Optional)
                </label>
                <textarea
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="Describe what you don't want in the image... (e.g., 'blurry, low quality, distorted')"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  rows={2}
                  disabled={isLoading}
                />
              </div>

              {/* Person Generation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Person Generation
                </label>
                <select
                  value={personGeneration}
                  onChange={(e) => setPersonGeneration(e.target.value as ImageGenerationConfig['personGeneration'])}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={isLoading}
                >
                  <option value="dont_allow">Don't Allow</option>
                  <option value="allow_adult">Allow Adults Only</option>
                </select>
              </div>

              {/* Safety Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Safety Filter Level
                </label>
                <select
                  value={safetyFilterLevel}
                  onChange={(e) => setSafetyFilterLevel(e.target.value as ImageGenerationConfig['safetyFilterLevel'])}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={isLoading}
                >
                  <option value="block_low_and_above">Block Low and Above</option>
                  <option value="block_medium_and_above">Block Medium and Above</option>
                  <option value="block_only_high">Block Only High</option>
                </select>
              </div>

              {/* Watermark */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="watermark"
                  checked={addWatermark}
                  onChange={(e) => setAddWatermark(e.target.checked)}
                  className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                  disabled={isLoading}
                />
                <label htmlFor="watermark" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Add watermark to generated images
                </label>
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
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Generate Image
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Template Selector Modal */}
      {showTemplates && (
        <TemplateSelector
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </div>
  );
}
