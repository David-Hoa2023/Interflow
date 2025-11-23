import { ImageGenerationConfig } from '../types/conversation';

export interface ConversationStep {
  id: string;
  type: 'text' | 'image' | 'both';
  prompt: string;
  imagePrompt?: string;
  imageConfig?: Partial<ImageGenerationConfig>;
  description?: string;
}

export interface ConversationTemplate {
  id: string;
  name: string;
  category: 'education' | 'creative' | 'technical' | 'marketing' | 'analysis';
  description: string;
  icon: string;
  estimatedSteps: number;
  steps: ConversationStep[];
  variables?: string[]; // Replaceable variables like {topic}, {subject}
}

export const conversationTemplates: ConversationTemplate[] = [
  // Educational Templates
  {
    id: 'educational-lesson',
    name: 'Educational Lesson Plan',
    category: 'education',
    description: 'Create a complete lesson with explanations and visual aids',
    icon: '📚',
    estimatedSteps: 4,
    variables: ['topic', 'gradeLevel'],
    steps: [
      {
        id: 'intro',
        type: 'text',
        prompt: 'Create an engaging introduction to {topic} for {gradeLevel} students. Include learning objectives and key concepts.',
        description: 'Introduction and objectives',
      },
      {
        id: 'diagram',
        type: 'image',
        prompt: 'Generate diagram',
        imagePrompt: 'Educational diagram illustrating {topic}, clear labels, colorful, suitable for {gradeLevel} students, informative layout',
        imageConfig: {
          aspectRatio: '16:9',
          model: 'imagen-3.0-generate-001',
        },
        description: 'Visual diagram',
      },
      {
        id: 'explanation',
        type: 'text',
        prompt: 'Provide detailed explanation of {topic}, breaking down complex concepts into simple terms. Include examples and real-world applications.',
        description: 'Detailed explanation',
      },
      {
        id: 'infographic',
        type: 'image',
        prompt: 'Generate infographic',
        imagePrompt: 'Educational infographic summarizing key points about {topic}, colorful sections, icons, easy to understand for {gradeLevel}',
        imageConfig: {
          aspectRatio: '3:4',
          model: 'imagen-3.0-generate-001',
        },
        description: 'Summary infographic',
      },
    ],
  },

  {
    id: 'concept-explanation',
    name: 'Visual Concept Explainer',
    category: 'education',
    description: 'Explain complex concepts with visual aids',
    icon: '💡',
    estimatedSteps: 3,
    variables: ['concept'],
    steps: [
      {
        id: 'overview',
        type: 'text',
        prompt: 'Explain the concept of {concept} in simple terms. What is it and why is it important?',
        description: 'Concept overview',
      },
      {
        id: 'visualization',
        type: 'image',
        prompt: 'Generate visualization',
        imagePrompt: 'Visual representation of {concept}, clear illustration, educational style, helpful for understanding',
        imageConfig: {
          aspectRatio: '16:9',
        },
        description: 'Concept visualization',
      },
      {
        id: 'examples',
        type: 'text',
        prompt: 'Provide practical examples of {concept} with step-by-step breakdown.',
        description: 'Practical examples',
      },
    ],
  },

  // Creative Writing Templates
  {
    id: 'illustrated-story',
    name: 'Illustrated Story Creator',
    category: 'creative',
    description: 'Create a story with AI-generated illustrations',
    icon: '📖',
    estimatedSteps: 5,
    variables: ['genre', 'theme'],
    steps: [
      {
        id: 'story-setup',
        type: 'text',
        prompt: 'Create the opening scene of a {genre} story with the theme of {theme}. Include setting, main character introduction, and initial conflict.',
        description: 'Story opening',
      },
      {
        id: 'scene1-art',
        type: 'image',
        prompt: 'Generate scene illustration',
        imagePrompt: 'Illustration for the opening scene of a {genre} story, {theme} theme, artistic style, engaging composition',
        imageConfig: {
          aspectRatio: '16:9',
          model: 'imagen-3.0-generate-001',
        },
        description: 'Opening scene illustration',
      },
      {
        id: 'story-development',
        type: 'text',
        prompt: 'Continue the story, developing the plot with rising action and character development.',
        description: 'Story development',
      },
      {
        id: 'scene2-art',
        type: 'image',
        prompt: 'Generate climax illustration',
        imagePrompt: 'Dramatic illustration for story climax, {genre} style, {theme} theme, intense moment, artistic rendering',
        imageConfig: {
          aspectRatio: '16:9',
          model: 'imagen-3.0-generate-001',
        },
        description: 'Climax illustration',
      },
      {
        id: 'story-conclusion',
        type: 'text',
        prompt: 'Write the resolution and conclusion of the story, tying together all plot threads.',
        description: 'Story conclusion',
      },
    ],
  },

  // Technical Documentation
  {
    id: 'technical-guide',
    name: 'Technical Documentation',
    category: 'technical',
    description: 'Create technical guides with diagrams and flowcharts',
    icon: '📐',
    estimatedSteps: 4,
    variables: ['system', 'audience'],
    steps: [
      {
        id: 'overview',
        type: 'text',
        prompt: 'Write a technical overview of {system} for {audience}. Include purpose, key components, and benefits.',
        description: 'System overview',
      },
      {
        id: 'architecture',
        type: 'image',
        prompt: 'Generate architecture diagram',
        imagePrompt: 'Technical architecture diagram of {system}, clear component labels, professional style, system connections shown',
        imageConfig: {
          aspectRatio: '16:9',
          model: 'imagen-3.0-generate-001',
        },
        description: 'Architecture diagram',
      },
      {
        id: 'implementation',
        type: 'text',
        prompt: 'Provide detailed implementation guide for {system}, including step-by-step instructions and best practices.',
        description: 'Implementation guide',
      },
      {
        id: 'flowchart',
        type: 'image',
        prompt: 'Generate process flowchart',
        imagePrompt: 'Flowchart showing the workflow of {system}, clear process steps, decision points, professional diagram style',
        imageConfig: {
          aspectRatio: '16:9',
          model: 'imagen-3.0-fast-generate-001',
        },
        description: 'Process flowchart',
      },
    ],
  },

  // Marketing Templates
  {
    id: 'product-launch',
    name: 'Product Launch Campaign',
    category: 'marketing',
    description: 'Complete product launch with visuals and copy',
    icon: '🚀',
    estimatedSteps: 4,
    variables: ['product', 'targetAudience'],
    steps: [
      {
        id: 'announcement',
        type: 'text',
        prompt: 'Write a compelling product announcement for {product} targeting {targetAudience}. Include key features and benefits.',
        description: 'Product announcement',
      },
      {
        id: 'hero-image',
        type: 'image',
        prompt: 'Generate hero image',
        imagePrompt: 'Professional product marketing hero image for {product}, modern design, eye-catching, suitable for {targetAudience}',
        imageConfig: {
          aspectRatio: '16:9',
          model: 'imagen-3.0-generate-001',
        },
        description: 'Hero marketing image',
      },
      {
        id: 'feature-breakdown',
        type: 'text',
        prompt: 'Create detailed feature breakdown for {product}, explaining each feature and its value proposition for {targetAudience}.',
        description: 'Feature details',
      },
      {
        id: 'social-graphics',
        type: 'image',
        prompt: 'Generate social media graphics',
        imagePrompt: 'Social media post design for {product} launch, modern aesthetic, brand-focused, engaging for {targetAudience}',
        imageConfig: {
          aspectRatio: '1:1',
          model: 'imagen-3.0-fast-generate-001',
          numberOfImages: 3,
        },
        description: 'Social media graphics',
      },
    ],
  },

  // Analysis Templates
  {
    id: 'visual-analysis',
    name: 'Visual Data Analysis',
    category: 'analysis',
    description: 'Analyze data and create visual representations',
    icon: '📊',
    estimatedSteps: 3,
    variables: ['dataset', 'question'],
    steps: [
      {
        id: 'data-summary',
        type: 'text',
        prompt: 'Analyze {dataset} to answer: {question}. Provide statistical summary and key insights.',
        description: 'Data analysis',
      },
      {
        id: 'visualization',
        type: 'image',
        prompt: 'Generate data visualization',
        imagePrompt: 'Data visualization chart for {dataset}, addressing {question}, clear labels, professional style, informative',
        imageConfig: {
          aspectRatio: '16:9',
          model: 'imagen-3.0-generate-001',
        },
        description: 'Data visualization',
      },
      {
        id: 'insights',
        type: 'text',
        prompt: 'Provide detailed insights and recommendations based on the analysis of {dataset} regarding {question}.',
        description: 'Insights and recommendations',
      },
    ],
  },

  {
    id: 'comparative-analysis',
    name: 'Visual Comparison',
    category: 'analysis',
    description: 'Compare concepts with side-by-side visuals',
    icon: '⚖️',
    estimatedSteps: 4,
    variables: ['option1', 'option2'],
    steps: [
      {
        id: 'intro',
        type: 'text',
        prompt: 'Introduce the comparison between {option1} and {option2}. What aspects will be compared?',
        description: 'Comparison introduction',
      },
      {
        id: 'visual-comparison',
        type: 'image',
        prompt: 'Generate comparison diagram',
        imagePrompt: 'Side-by-side comparison diagram of {option1} vs {option2}, clear labels, professional infographic style, easy to understand',
        imageConfig: {
          aspectRatio: '16:9',
          model: 'imagen-3.0-generate-001',
        },
        description: 'Visual comparison',
      },
      {
        id: 'analysis',
        type: 'text',
        prompt: 'Provide detailed comparison analysis of {option1} vs {option2}, covering pros, cons, and use cases.',
        description: 'Detailed analysis',
      },
      {
        id: 'conclusion',
        type: 'text',
        prompt: 'Conclude with recommendations on when to choose {option1} vs {option2}.',
        description: 'Recommendations',
      },
    ],
  },
];

// Helper function to fill template variables
export function fillTemplateVariables(template: ConversationTemplate, values: Record<string, string>): ConversationTemplate {
  const filledSteps = template.steps.map((step) => ({
    ...step,
    prompt: replaceVariables(step.prompt, values),
    imagePrompt: step.imagePrompt ? replaceVariables(step.imagePrompt, values) : undefined,
  }));

  return {
    ...template,
    steps: filledSteps,
  };
}

function replaceVariables(text: string, values: Record<string, string>): string {
  let result = text;
  Object.entries(values).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  });
  return result;
}

// Get templates by category
export function getTemplatesByCategory(category: ConversationTemplate['category']): ConversationTemplate[] {
  return conversationTemplates.filter((t) => t.category === category);
}

// Get template by ID
export function getConversationTemplateById(id: string): ConversationTemplate | undefined {
  return conversationTemplates.find((t) => t.id === id);
}
