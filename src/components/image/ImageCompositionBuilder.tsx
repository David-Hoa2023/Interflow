import { useState, useRef } from 'react';
import { Plus, X, Upload, Image as ImageIcon, Sliders } from 'lucide-react';
import { ImageCompositionSource } from '../../types/conversation';

interface ImageCompositionBuilderProps {
  compositionSources: ImageCompositionSource[];
  compositionMode: 'blend' | 'collage' | 'style-transfer' | 'combine';
  onSourcesChange: (sources: ImageCompositionSource[]) => void;
  onModeChange: (mode: 'blend' | 'collage' | 'style-transfer' | 'combine') => void;
  maxImages?: number;
}

export function ImageCompositionBuilder({
  compositionSources,
  compositionMode,
  onSourcesChange,
  onModeChange,
  maxImages = 14,
}: ImageCompositionBuilderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const remainingSlots = maxImages - compositionSources.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          const newSource: ImageCompositionSource = {
            id: `comp-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
            imageUrl,
            weight: 1.0,
            description: file.name,
          };
          onSourcesChange([...compositionSources, newSource]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveSource = (id: string) => {
    onSourcesChange(compositionSources.filter((s) => s.id !== id));
  };

  const handleWeightChange = (id: string, weight: number) => {
    onSourcesChange(
      compositionSources.map((s) => (s.id === id ? { ...s, weight } : s))
    );
  };

  const handleDescriptionChange = (id: string, description: string) => {
    onSourcesChange(
      compositionSources.map((s) => (s.id === id ? { ...s, description } : s))
    );
  };

  const handleAddFromUrl = () => {
    const url = prompt('Enter image URL:');
    if (url && compositionSources.length < maxImages) {
      const newSource: ImageCompositionSource = {
        id: `comp-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        imageUrl: url,
        weight: 1.0,
        description: 'Image from URL',
      };
      onSourcesChange([...compositionSources, newSource]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Composition Mode Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Composition Mode
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['blend', 'collage', 'style-transfer', 'combine'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onModeChange(mode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                compositionMode === mode
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {mode === 'style-transfer' ? 'Style Transfer' : mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {compositionMode === 'blend' && 'Smoothly blend multiple images together'}
          {compositionMode === 'collage' && 'Arrange images in a collage layout'}
          {compositionMode === 'style-transfer' && 'Apply style from one image to another'}
          {compositionMode === 'combine' && 'Intelligently combine elements from multiple images'}
        </p>
      </div>

      {/* Image Upload Area */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Source Images ({compositionSources.length}/{maxImages})
        </label>

        {compositionSources.length < maxImages && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragging
                ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
            }`}
          >
            <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Drag & drop images here, or click to select
            </p>
            <div className="flex gap-2 justify-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload Images
              </button>
              <button
                type="button"
                onClick={handleAddFromUrl}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add from URL
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* Source Images List */}
      {compositionSources.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Sliders className="w-4 h-4" />
            Composition Sources
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {compositionSources.map((source, index) => (
              <div
                key={source.id}
                className="flex gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                {/* Thumbnail */}
                <img
                  src={source.imageUrl}
                  alt={`Source ${index + 1}`}
                  className="w-20 h-20 object-cover rounded"
                />

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-2">
                  <input
                    type="text"
                    value={source.description || ''}
                    onChange={(e) => handleDescriptionChange(source.id, e.target.value)}
                    placeholder="Description (optional)"
                    className="w-full px-2 py-1 text-sm bg-gray-50 dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />

                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600 dark:text-gray-400 min-w-[60px]">
                      Weight: {source.weight?.toFixed(1) || '1.0'}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={source.weight || 1.0}
                      onChange={(e) => handleWeightChange(source.id, parseFloat(e.target.value))}
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => handleRemoveSource(source.id)}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors text-red-600 dark:text-red-400"
                  title="Remove image"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Composition Tips */}
      {compositionSources.length > 0 && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-800 dark:text-blue-200 font-semibold mb-1">
            💡 Composition Tips:
          </p>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Higher weight = more influence on final image</li>
            <li>• Descriptions help guide the composition</li>
            <li>• Try different modes for varied results</li>
            {compositionMode === 'style-transfer' && (
              <li>• First image = content, others = style sources</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
