import { ImageGenerationConfig } from '../types/conversation';

export interface ImageTemplate {
  id: string;
  name: string;
  category: 'logo' | 'mockup' | 'diagram' | 'education' | 'marketing' | 'art' | 'technical';
  description: string;
  icon: string;
  promptTemplate: string;
  config: Partial<ImageGenerationConfig>;
  placeholders?: string[]; // Variables like {companyName}, {topic}, etc.
  examplePrompt?: string;
}

export const imageTemplates: ImageTemplate[] = [
  // Logo Templates
  {
    id: 'modern-tech-logo',
    name: 'Modern Tech Logo',
    category: 'logo',
    description: 'Clean, modern logo design for technology companies',
    icon: '🏢',
    promptTemplate: 'Professional modern logo design for {companyName}, minimalist style, tech-focused, clean lines, vector style, {colorScheme} color scheme, white background',
    config: {
      aspectRatio: '1:1',
      model: 'imagen-3.0-generate-001',
      numberOfImages: 4,
      negativePrompt: 'realistic, photographic, cluttered, busy, amateur',
    },
    placeholders: ['companyName', 'colorScheme'],
    examplePrompt: 'Professional modern logo design for TechFlow, minimalist style, tech-focused, clean lines, vector style, blue and white color scheme, white background',
  },
  {
    id: 'minimalist-brand-logo',
    name: 'Minimalist Brand Logo',
    category: 'logo',
    description: 'Simple, elegant logo with strong brand identity',
    icon: '✨',
    promptTemplate: 'Minimalist logo design for {brandName}, {concept} theme, elegant, simple shapes, memorable, {colorPalette}, scalable design',
    config: {
      aspectRatio: '1:1',
      model: 'imagen-3.0-generate-001',
      numberOfImages: 4,
      negativePrompt: 'complex, detailed, ornate, cluttered',
    },
    placeholders: ['brandName', 'concept', 'colorPalette'],
  },

  // Product Mockup Templates
  {
    id: 'mobile-app-mockup',
    name: 'Mobile App Mockup',
    category: 'mockup',
    description: 'Professional mobile app interface mockup',
    icon: '📱',
    promptTemplate: 'Modern mobile app interface mockup for {appName}, {appPurpose}, clean UI design, professional layout, {style} style, realistic phone frame',
    config: {
      aspectRatio: '9:16',
      model: 'imagen-3.0-generate-001',
      numberOfImages: 2,
    },
    placeholders: ['appName', 'appPurpose', 'style'],
    examplePrompt: 'Modern mobile app interface mockup for FitTrack, fitness tracking application, clean UI design, professional layout, minimalist style, realistic phone frame',
  },
  {
    id: 'product-packaging',
    name: 'Product Packaging',
    category: 'mockup',
    description: 'Product packaging design visualization',
    icon: '📦',
    promptTemplate: '{productType} packaging design, {brandStyle} aesthetic, {colors} colors, professional product photography, clean background',
    config: {
      aspectRatio: '4:3',
      model: 'imagen-3.0-generate-001',
      numberOfImages: 3,
    },
    placeholders: ['productType', 'brandStyle', 'colors'],
  },

  // Diagram Templates
  {
    id: 'flowchart-diagram',
    name: 'Flowchart Diagram',
    category: 'diagram',
    description: 'Clear flowchart for process visualization',
    icon: '📊',
    promptTemplate: 'Professional flowchart diagram showing {process}, clear boxes and arrows, {colorScheme} color coding, labeled steps, clean layout, white background',
    config: {
      aspectRatio: '16:9',
      model: 'imagen-3.0-fast-generate-001',
      numberOfImages: 2,
      negativePrompt: 'cluttered, handdrawn, messy, unclear',
    },
    placeholders: ['process', 'colorScheme'],
    examplePrompt: 'Professional flowchart diagram showing user authentication process, clear boxes and arrows, blue and green color coding, labeled steps, clean layout, white background',
  },
  {
    id: 'system-architecture',
    name: 'System Architecture',
    category: 'diagram',
    description: 'Technical system architecture diagram',
    icon: '🏗️',
    promptTemplate: 'Technical architecture diagram for {system}, showing {components}, modern diagram style, clear connections, professional layout',
    config: {
      aspectRatio: '16:9',
      model: 'imagen-3.0-generate-001',
      numberOfImages: 2,
    },
    placeholders: ['system', 'components'],
  },

  // Educational Templates
  {
    id: 'infographic-educational',
    name: 'Educational Infographic',
    category: 'education',
    description: 'Visual learning aid with diagrams and text',
    icon: '📚',
    promptTemplate: 'Educational infographic about {topic}, colorful, engaging visuals, {targetAudience} audience, clear sections, icons and illustrations',
    config: {
      aspectRatio: '3:4',
      model: 'imagen-3.0-generate-001',
      numberOfImages: 2,
    },
    placeholders: ['topic', 'targetAudience'],
    examplePrompt: 'Educational infographic about photosynthesis, colorful, engaging visuals, middle school audience, clear sections, icons and illustrations',
  },
  {
    id: 'concept-visualization',
    name: 'Concept Visualization',
    category: 'education',
    description: 'Visual representation of abstract concepts',
    icon: '💡',
    promptTemplate: 'Visual representation of {concept}, educational illustration, clear and simple, {visualStyle} style, helpful for learning',
    config: {
      aspectRatio: '4:3',
      model: 'imagen-3.0-generate-001',
      numberOfImages: 3,
    },
    placeholders: ['concept', 'visualStyle'],
  },

  // Marketing Templates
  {
    id: 'social-media-post',
    name: 'Social Media Post',
    category: 'marketing',
    description: 'Eye-catching social media graphic',
    icon: '📱',
    promptTemplate: '{platform} post design for {campaign}, eye-catching, {brandColors} colors, modern aesthetic, {mood} mood, professional marketing design',
    config: {
      aspectRatio: '1:1',
      model: 'imagen-3.0-fast-generate-001',
      numberOfImages: 4,
    },
    placeholders: ['platform', 'campaign', 'brandColors', 'mood'],
  },
  {
    id: 'hero-banner',
    name: 'Website Hero Banner',
    category: 'marketing',
    description: 'Wide banner for website hero sections',
    icon: '🎨',
    promptTemplate: 'Website hero banner for {product}, {theme} theme, professional, modern design, {colorPalette}, impactful visual',
    config: {
      aspectRatio: '16:9',
      model: 'imagen-3.0-generate-001',
      numberOfImages: 3,
    },
    placeholders: ['product', 'theme', 'colorPalette'],
  },

  // Art Templates
  {
    id: 'digital-artwork',
    name: 'Digital Artwork',
    category: 'art',
    description: 'Creative digital art piece',
    icon: '🎨',
    promptTemplate: '{subject} in {artStyle} style, {mood} atmosphere, vibrant colors, artistic composition, high quality digital art',
    config: {
      aspectRatio: '4:3',
      model: 'imagen-3.0-generate-001',
      numberOfImages: 4,
    },
    placeholders: ['subject', 'artStyle', 'mood'],
  },
  {
    id: 'landscape-illustration',
    name: 'Landscape Illustration',
    category: 'art',
    description: 'Beautiful landscape or scenery',
    icon: '🏔️',
    promptTemplate: '{landscape} landscape, {timeOfDay}, {weather} weather, {artStyle} illustration style, beautiful colors, atmospheric',
    config: {
      aspectRatio: '16:9',
      model: 'imagen-3.0-generate-001',
      numberOfImages: 3,
    },
    placeholders: ['landscape', 'timeOfDay', 'weather', 'artStyle'],
  },

  // Technical Templates
  {
    id: 'technical-blueprint',
    name: 'Technical Blueprint',
    category: 'technical',
    description: 'Engineering-style technical drawing',
    icon: '📐',
    promptTemplate: 'Technical blueprint drawing of {object}, engineering style, labeled dimensions, {view} view, professional technical drawing, grid background',
    config: {
      aspectRatio: '16:9',
      model: 'imagen-3.0-generate-001',
      numberOfImages: 2,
      negativePrompt: 'artistic, colorful, decorative',
    },
    placeholders: ['object', 'view'],
  },
  {
    id: 'data-visualization',
    name: 'Data Visualization',
    category: 'technical',
    description: 'Charts and graphs for data presentation',
    icon: '📈',
    promptTemplate: '{chartType} chart showing {dataDescription}, professional data visualization, clear labels, {colorScheme} colors, clean design',
    config: {
      aspectRatio: '16:9',
      model: 'imagen-3.0-fast-generate-001',
      numberOfImages: 2,
    },
    placeholders: ['chartType', 'dataDescription', 'colorScheme'],
  },
];

// Helper function to fill template with values
export function fillTemplate(template: ImageTemplate, values: Record<string, string>): string {
  let filledPrompt = template.promptTemplate;

  if (template.placeholders) {
    template.placeholders.forEach((placeholder) => {
      const value = values[placeholder] || `[${placeholder}]`;
      filledPrompt = filledPrompt.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), value);
    });
  }

  return filledPrompt;
}

// Get templates by category
export function getTemplatesByCategory(category: ImageTemplate['category']): ImageTemplate[] {
  return imageTemplates.filter((t) => t.category === category);
}

// Get template by ID
export function getTemplateById(id: string): ImageTemplate | undefined {
  return imageTemplates.find((t) => t.id === id);
}
