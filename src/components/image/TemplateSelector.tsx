import { useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { ImageTemplate, imageTemplates, fillTemplate } from '../../data/imageTemplates';

interface TemplateSelectorProps {
  onSelectTemplate: (prompt: string, config: Partial<import('../../types/conversation').ImageGenerationConfig>) => void;
  onClose: () => void;
}

export function TemplateSelector({ onSelectTemplate, onClose }: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<ImageTemplate['category'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ImageTemplate | null>(null);
  const [templateValues, setTemplateValues] = useState<Record<string, string>>({});

  const categories: Array<{ id: ImageTemplate['category'] | 'all'; label: string; icon: string }> = [
    { id: 'all', label: 'All Templates', icon: '📋' },
    { id: 'logo', label: 'Logos', icon: '🏢' },
    { id: 'mockup', label: 'Mockups', icon: '📱' },
    { id: 'diagram', label: 'Diagrams', icon: '📊' },
    { id: 'education', label: 'Educational', icon: '📚' },
    { id: 'marketing', label: 'Marketing', icon: '🎯' },
    { id: 'art', label: 'Art', icon: '🎨' },
    { id: 'technical', label: 'Technical', icon: '📐' },
  ];

  const filteredTemplates = imageTemplates.filter((template) => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleTemplateSelect = (template: ImageTemplate) => {
    setSelectedTemplate(template);
    // Initialize template values with empty strings
    const initialValues: Record<string, string> = {};
    template.placeholders?.forEach((placeholder) => {
      initialValues[placeholder] = '';
    });
    setTemplateValues(initialValues);
  };

  const handleApplyTemplate = () => {
    if (!selectedTemplate) return;

    const filledPrompt = fillTemplate(selectedTemplate, templateValues);
    onSelectTemplate(filledPrompt, selectedTemplate.config);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex">
        {/* Template Selection Panel */}
        <div className="w-2/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Image Generation Templates
            </h2>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Template Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-3">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`text-left p-3 rounded-lg border-2 transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-pink-300 dark:hover:border-pink-700'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-2xl">{template.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {template.name}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                    {selectedTemplate?.id === template.id && (
                      <ChevronRight className="w-4 h-4 text-pink-600 dark:text-pink-400 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No templates found matching "{searchQuery}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Template Customization Panel */}
        <div className="w-1/3 flex flex-col">
          {selectedTemplate ? (
            <>
              {/* Template Details */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-2 mb-3">
                  <span className="text-3xl">{selectedTemplate.icon}</span>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      {selectedTemplate.name}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {selectedTemplate.description}
                    </p>
                  </div>
                </div>

                {/* Example */}
                {selectedTemplate.examplePrompt && (
                  <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">Example: </span>
                    {selectedTemplate.examplePrompt}
                  </div>
                )}
              </div>

              {/* Customization Form */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  CUSTOMIZE TEMPLATE
                </p>

                {selectedTemplate.placeholders && selectedTemplate.placeholders.length > 0 ? (
                  selectedTemplate.placeholders.map((placeholder) => (
                    <div key={placeholder}>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {placeholder.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                      </label>
                      <input
                        type="text"
                        value={templateValues[placeholder] || ''}
                        onChange={(e) =>
                          setTemplateValues({ ...templateValues, [placeholder]: e.target.value })
                        }
                        placeholder={`Enter ${placeholder}...`}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    No customization needed for this template
                  </p>
                )}

                {/* Preview */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    PROMPT PREVIEW
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs text-gray-700 dark:text-gray-300 min-h-[60px]">
                    {fillTemplate(selectedTemplate, templateValues)}
                  </div>
                </div>

                {/* Config Preview */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    SETTINGS
                  </label>
                  <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    {selectedTemplate.config.aspectRatio && (
                      <div>Aspect Ratio: {selectedTemplate.config.aspectRatio}</div>
                    )}
                    {selectedTemplate.config.numberOfImages && (
                      <div>Images: {selectedTemplate.config.numberOfImages}</div>
                    )}
                    {selectedTemplate.config.model && (
                      <div>Model: {selectedTemplate.config.model.includes('fast') ? 'Fast' : 'Best Quality'}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <button
                  onClick={handleApplyTemplate}
                  className="w-full px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Apply Template
                </button>
                <button
                  onClick={onClose}
                  className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Select a template from the left to customize it
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
