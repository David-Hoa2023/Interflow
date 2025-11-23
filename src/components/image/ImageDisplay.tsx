import { useState, useEffect } from 'react';
import { ImageNodeData } from '../../types/conversation';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  History,
  Settings,
  Loader2,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';

interface ImageDisplayProps {
  imageData: ImageNodeData;
  onRequestVariation?: (prompt: string) => void;
  onImageSelect?: (index: number) => void;
}

export function ImageDisplay({
  imageData,
  onRequestVariation,
  onImageSelect,
}: ImageDisplayProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [variationPrompt, setVariationPrompt] = useState('');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showFullscreen, setShowFullscreen] = useState(false);

  const currentImage = imageData.generatedImages[imageData.currentImageIndex];
  const hasMultipleImages = imageData.generatedImages.length > 1;

  const handlePrevious = () => {
    if (imageData.currentImageIndex > 0) {
      onImageSelect?.(imageData.currentImageIndex - 1);
    }
  };

  const handleNext = () => {
    if (imageData.currentImageIndex < imageData.generatedImages.length - 1) {
      onImageSelect?.(imageData.currentImageIndex + 1);
    }
  };

  const handleDownload = () => {
    if (!currentImage) return;

    const link = document.createElement('a');
    link.href = currentImage;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRequestVariation = () => {
    if (variationPrompt.trim() && onRequestVariation) {
      onRequestVariation(variationPrompt);
      setVariationPrompt('');
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(Math.min(zoomLevel + 25, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(Math.max(zoomLevel - 25, 50));
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') setShowFullscreen(false);
    };

    if (showFullscreen) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [showFullscreen, imageData.currentImageIndex]);

  if (imageData.isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Generating image...
        </p>
      </div>
    );
  }

  if (imageData.generationError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-2">
          Generation Failed
        </p>
        <p className="text-xs text-red-600 dark:text-red-400 text-center">
          {imageData.generationError}
        </p>
      </div>
    );
  }

  if (!currentImage) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          No image generated yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Image Container */}
      <div className="relative bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Image */}
        <div className="relative" style={{ minHeight: '200px' }}>
          <img
            src={currentImage}
            alt={imageData.generationConfig.prompt}
            className="w-full h-auto object-contain"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center' }}
          />

          {/* Fullscreen Button */}
          <button
            onClick={() => setShowFullscreen(true)}
            className="absolute top-2 right-2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
            title="View fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Navigation Arrows (if multiple images) */}
          {hasMultipleImages && (
            <>
              <button
                onClick={handlePrevious}
                disabled={imageData.currentImageIndex === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                disabled={imageData.currentImageIndex === imageData.generatedImages.length - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Image Counter */}
        {hasMultipleImages && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/70 text-white text-xs rounded-full">
            {imageData.currentImageIndex + 1} / {imageData.generatedImages.length}
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={handleZoomOut}
          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm flex items-center gap-1"
          title="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-xs text-gray-600 dark:text-gray-400">{zoomLevel}%</span>
        <button
          onClick={handleZoomIn}
          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm flex items-center gap-1"
          title="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="flex-1" />

        <button
          onClick={handleDownload}
          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm flex items-center gap-1"
          title="Download image"
        >
          <Download className="w-4 h-4" />
          Download
        </button>

        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`px-3 py-1.5 rounded-lg transition-colors text-sm flex items-center gap-1 ${
            showHistory
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
          }`}
          title="View history"
        >
          <History className="w-4 h-4" />
          History
        </button>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`px-3 py-1.5 rounded-lg transition-colors text-sm flex items-center gap-1 ${
            showSettings
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
          }`}
          title="View settings"
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>

      {/* Generation Prompt */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
          PROMPT
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {imageData.generationConfig.prompt}
        </p>
      </div>

      {/* Request Variation */}
      {onRequestVariation && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-2">
            Request Variation
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={variationPrompt}
              onChange={(e) => setVariationPrompt(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleRequestVariation()}
              placeholder="Describe changes (e.g., 'make it darker', 'add mountains')"
              className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleRequestVariation}
              disabled={!variationPrompt.trim()}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Generate
            </button>
          </div>
        </div>
      )}

      {/* History Panel */}
      {showHistory && imageData.editHistory.length > 0 && (
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
            EDIT HISTORY ({imageData.editHistory.length})
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {imageData.editHistory.map((entry, index) => (
              <div
                key={entry.id}
                className="flex gap-2 p-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
              >
                <img
                  src={entry.imageUrl}
                  alt={`Version ${index + 1}`}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                    {entry.prompt}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(entry.timestamp).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {entry.config.aspectRatio}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
            GENERATION SETTINGS
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Model:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {imageData.generationConfig.model}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Aspect Ratio:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {imageData.generationConfig.aspectRatio}
              </span>
            </div>
            {imageData.generationConfig.negativePrompt && (
              <div>
                <span className="text-gray-600 dark:text-gray-400">Negative Prompt:</span>
                <p className="font-medium text-gray-900 dark:text-white mt-1">
                  {imageData.generationConfig.negativePrompt}
                </p>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Safety Filter:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {imageData.generationConfig.safetyFilterLevel || 'Default'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Modal */}
      {showFullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <button
            onClick={() => setShowFullscreen(false)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
          >
            ✕ Close
          </button>
          <img
            src={currentImage}
            alt={imageData.generationConfig.prompt}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}
