import { useState } from 'react';
import { Play, CheckCircle, Circle, Image as ImageIcon, MessageSquare, Sparkles } from 'lucide-react';
import { ConversationTemplate, conversationTemplates, fillTemplateVariables } from '../../data/conversationTemplates';

interface ConversationTemplateExecutorProps {
  onClose: () => void;
  onExecuteStep: (step: {
    type: 'text' | 'image';
    prompt: string;
    imageConfig?: any;
  }) => void;
}

export function ConversationTemplateExecutor({ onClose, onExecuteStep }: ConversationTemplateExecutorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ConversationTemplate | null>(null);
  const [templateValues, setTemplateValues] = useState<Record<string, string>>({});
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isExecuting, setIsExecuting] = useState(false);

  const categories: Array<{ id: ConversationTemplate['category']; label: string; icon: string }> = [
    { id: 'education', label: 'Education', icon: '📚' },
    { id: 'creative', label: 'Creative', icon: '🎨' },
    { id: 'technical', label: 'Technical', icon: '⚙️' },
    { id: 'marketing', label: 'Marketing', icon: '📢' },
    { id: 'analysis', label: 'Analysis', icon: '📊' },
  ];

  const handleTemplateSelect = (template: ConversationTemplate) => {
    setSelectedTemplate(template);
    setCurrentStepIndex(0);
    setCompletedSteps(new Set());

    // Initialize template values
    const initialValues: Record<string, string> = {};
    template.variables?.forEach((variable) => {
      initialValues[variable] = '';
    });
    setTemplateValues(initialValues);
  };

  const handleStartTemplate = () => {
    if (!selectedTemplate) return;

    // Fill template with values
    const filledTemplate = fillTemplateVariables(selectedTemplate, templateValues);
    setSelectedTemplate(filledTemplate);
    setIsExecuting(true);
  };

  const handleExecuteStep = (stepIndex: number) => {
    if (!selectedTemplate) return;

    const step = selectedTemplate.steps[stepIndex];

    if (step.type === 'text') {
      onExecuteStep({
        type: 'text',
        prompt: step.prompt,
      });
    } else if (step.type === 'image' && step.imagePrompt) {
      onExecuteStep({
        type: 'image',
        prompt: step.imagePrompt,
        imageConfig: step.imageConfig,
      });
    } else if (step.type === 'both') {
      // Execute text first, then image
      onExecuteStep({
        type: 'text',
        prompt: step.prompt,
      });
      if (step.imagePrompt) {
        setTimeout(() => {
          onExecuteStep({
            type: 'image',
            prompt: step.imagePrompt!,
            imageConfig: step.imageConfig,
          });
        }, 500);
      }
    }

    // Mark step as completed
    const newCompleted = new Set(completedSteps);
    newCompleted.add(stepIndex);
    setCompletedSteps(newCompleted);

    // Move to next step
    if (stepIndex < selectedTemplate.steps.length - 1) {
      setCurrentStepIndex(stepIndex + 1);
    }
  };

  const handleReset = () => {
    setSelectedTemplate(null);
    setCurrentStepIndex(0);
    setCompletedSteps(new Set());
    setIsExecuting(false);
    setTemplateValues({});
  };

  if (!selectedTemplate) {
    // Template Selection View
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Conversation Templates
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Multi-step workflows combining text and images
            </p>
          </div>

          {/* Templates Grid */}
          <div className="p-4 overflow-y-auto max-h-[calc(90vh-180px)]">
            {categories.map((category) => {
              const categoryTemplates = conversationTemplates.filter(
                (t) => t.category === category.id
              );

              if (categoryTemplates.length === 0) return null;

              return (
                <div key={category.id} className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <span className="text-xl">{category.icon}</span>
                    {category.label}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {categoryTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className="text-left p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all bg-white dark:bg-gray-700"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-3xl">{template.icon}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                              {template.name}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {template.description}
                            </p>
                            <div className="mt-2 text-xs text-indigo-600 dark:text-indigo-400">
                              {template.estimatedSteps} steps
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-white rounded-lg transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isExecuting) {
    // Variable Input View
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedTemplate.icon}</span>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedTemplate.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedTemplate.description}
                </p>
              </div>
            </div>
          </div>

          {/* Variable Inputs */}
          <div className="p-4 space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Fill in the details to customize this template:
            </p>

            {selectedTemplate.variables && selectedTemplate.variables.length > 0 ? (
              selectedTemplate.variables.map((variable) => (
                <div key={variable}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {variable.charAt(0).toUpperCase() + variable.slice(1).replace(/([A-Z])/g, ' $1')}
                  </label>
                  <input
                    type="text"
                    value={templateValues[variable] || ''}
                    onChange={(e) =>
                      setTemplateValues({ ...templateValues, [variable]: e.target.value })
                    }
                    placeholder={`Enter ${variable}...`}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No customization needed for this template.
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-white rounded-lg transition-colors text-sm font-medium"
            >
              Back
            </button>
            <button
              onClick={handleStartTemplate}
              disabled={
                selectedTemplate.variables &&
                selectedTemplate.variables.some((v) => !templateValues[v]?.trim())
              }
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4" />
              Start Template
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Execution View
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{selectedTemplate.icon}</span>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedTemplate.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Step {currentStepIndex + 1} of {selectedTemplate.steps.length}
              </p>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {selectedTemplate.steps.map((step, index) => {
            const isCompleted = completedSteps.has(index);
            const isCurrent = index === currentStepIndex;

            return (
              <div
                key={step.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isCurrent
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : isCompleted
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Status Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <Circle className={`w-5 h-5 ${isCurrent ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`} />
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {step.type === 'text' && <MessageSquare className="w-4 h-4" />}
                      {step.type === 'image' && <ImageIcon className="w-4 h-4" />}
                      {step.type === 'both' && (
                        <>
                          <MessageSquare className="w-4 h-4" />
                          <ImageIcon className="w-4 h-4" />
                        </>
                      )}
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                        {step.description || `Step ${index + 1}`}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {step.type === 'text' && step.prompt}
                      {step.type === 'image' && step.imagePrompt}
                      {step.type === 'both' && step.prompt}
                    </p>

                    {isCurrent && (
                      <button
                        onClick={() => handleExecuteStep(index)}
                        className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium transition-colors"
                      >
                        <Play className="w-3 h-3" />
                        Execute This Step
                      </button>
                    )}
                  </div>

                  {/* Step Number */}
                  <div className="flex-shrink-0 text-xs font-semibold text-gray-400">
                    {index + 1}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-white rounded-lg transition-colors text-sm font-medium"
          >
            Reset Template
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
