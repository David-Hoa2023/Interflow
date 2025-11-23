import { useState, useMemo } from 'react';
import { X, Download, Grid3x3, List, Calendar, Sparkles, Search, Image as ImageIcon } from 'lucide-react';
import { useConversationStore } from '../../store/conversationStore';
import { ConversationNode } from '../../types/conversation';

interface ImageGalleryProps {
  onClose: () => void;
  onSelectImage?: (imageUrl: string, node: ConversationNode) => void;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'newest' | 'oldest' | 'model';

export function ImageGallery({ onClose, onSelectImage }: ImageGalleryProps) {
  const { tree } = useConversationStore();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    node: ConversationNode;
    index: number;
    timestamp: number;
  } | null>(null);

  // Extract all image nodes from the tree
  const imageNodes = useMemo(() => {
    const nodes: Array<{ node: ConversationNode; images: string[] }> = [];

    tree.nodes.forEach((node) => {
      if (node.type === 'image' && node.imageData?.generatedImages) {
        nodes.push({
          node,
          images: node.imageData.generatedImages,
        });
      }
    });

    return nodes;
  }, [tree.nodes]);

  // Flatten all images with their metadata
  const allImages = useMemo(() => {
    const images: Array<{
      url: string;
      node: ConversationNode;
      imageIndex: number;
      timestamp: number;
    }> = [];

    imageNodes.forEach(({ node, images: imageUrls }) => {
      imageUrls.forEach((url, index) => {
        images.push({
          url,
          node,
          imageIndex: index,
          timestamp: node.metadata?.createdAt?.getTime() || 0,
        });
      });
    });

    return images;
  }, [imageNodes]);

  // Filter and sort images
  const filteredImages = useMemo(() => {
    let filtered = allImages;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((img) => {
        const query = searchQuery.toLowerCase();
        return (
          img.node.question.toLowerCase().includes(query) ||
          img.node.answer.toLowerCase().includes(query) ||
          img.node.model?.toLowerCase().includes(query) ||
          img.node.imageData?.generationConfig?.model?.toLowerCase().includes(query)
        );
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return b.timestamp - a.timestamp;
      } else if (sortBy === 'oldest') {
        return a.timestamp - b.timestamp;
      } else {
        // Sort by model
        const modelA = a.node.imageData?.generationConfig?.model || '';
        const modelB = b.node.imageData?.generationConfig?.model || '';
        return modelA.localeCompare(modelB);
      }
    });

    return filtered;
  }, [allImages, searchQuery, sortBy]);

  const handleDownloadImage = async (imageUrl: string, nodeName?: string, index?: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${nodeName || 'image'}-${index !== undefined ? index + 1 : 'download'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  const handleImageClick = (url: string, node: ConversationNode, index: number) => {
    const timestamp = node.metadata?.createdAt?.getTime() || Date.now();
    setSelectedImage({ url, node, index, timestamp });
    if (onSelectImage) {
      onSelectImage(url, node);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Image Gallery
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({filteredImages.length} {filteredImages.length === 1 ? 'image' : 'images'})
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search images by prompt or model..."
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="model">By Model</option>
            </select>

            {/* View Mode */}
            <div className="flex gap-1 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-pink-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-pink-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Gallery Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ImageIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                {searchQuery ? 'No images found matching your search' : 'No images generated yet'}
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {searchQuery ? 'Try a different search term' : 'Start generating images to see them here'}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            // Grid View
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredImages.map((img, idx) => (
                <div
                  key={`${img.node.id}-${img.imageIndex}-${idx}`}
                  className="group relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105"
                  onClick={() => handleImageClick(img.url, img.node, img.imageIndex)}
                >
                  <div className="aspect-square">
                    <img
                      src={img.url}
                      alt={`Generated ${img.imageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                      <p className="text-xs font-medium truncate mb-1">
                        {img.node.name || `Generated ${new Date(img.timestamp).toLocaleDateString()}`}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 opacity-90">
                          <Sparkles className="w-3 h-3" />
                          {img.node.imageData?.generationConfig?.model?.includes('fast') ? 'Fast' : 'Best Quality'}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadImage(img.url, img.node.name, img.imageIndex);
                          }}
                          className="p-1 bg-white/20 hover:bg-white/30 rounded transition-colors"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // List View
            <div className="space-y-3">
              {filteredImages.map((img, idx) => (
                <div
                  key={`${img.node.id}-${img.imageIndex}-${idx}`}
                  className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => handleImageClick(img.url, img.node, img.imageIndex)}
                >
                  {/* Thumbnail */}
                  <div className="w-24 h-24 flex-shrink-0 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden">
                    <img
                      src={img.url}
                      alt={`Generated ${img.imageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1 truncate">
                      {img.node.name || `Generated Image ${img.imageIndex + 1}`}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                      {img.node.question}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(img.timestamp).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {img.node.imageData?.generationConfig?.model || 'Unknown Model'}
                      </span>
                      {img.node.imageData?.generationConfig?.aspectRatio && (
                        <span>{img.node.imageData.generationConfig.aspectRatio}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadImage(img.url, img.node.name, img.imageIndex);
                      }}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
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

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
                <h3 className="font-semibold mb-2">
                  {selectedImage.node.name || 'Generated Image'}
                </h3>
                <p className="text-sm opacity-90 mb-3">{selectedImage.node.question}</p>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4 opacity-80">
                    <span>{selectedImage.node.imageData?.generationConfig?.model}</span>
                    <span>{selectedImage.node.imageData?.generationConfig?.aspectRatio}</span>
                    <span>{new Date(selectedImage.timestamp).toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => handleDownloadImage(selectedImage.url, selectedImage.node.name, selectedImage.index)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
