export interface AnswerSection {
  id: string;
  text: string;
  index: number;
}

export type NodeType = 'question' | 'answer' | 'decision' | 'summary' | 'reference' | 'action' | 'image';

export interface Attachment {
  id: string;
  type: 'image' | 'file' | 'link' | 'code';
  url?: string;
  content?: string;
  filename?: string;
  mimeType?: string;
  size?: number;
}

export interface ImageCompositionSource {
  id: string;
  imageUrl: string;
  weight?: number; // Influence weight (0-1)
  description?: string; // What this image contributes
}

export interface ImageGenerationConfig {
  model: 'imagen-3.0-generate-001' | 'imagen-3.0-fast-generate-001';
  aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
  prompt: string;
  negativePrompt?: string;
  numberOfImages?: number; // 1-4 for single generation
  personGeneration?: 'dont_allow' | 'allow_adult';
  safetyFilterLevel?: 'block_low_and_above' | 'block_medium_and_above' | 'block_only_high';
  addWatermark?: boolean;

  // Multi-image composition (up to 14 images)
  compositionSources?: ImageCompositionSource[];
  compositionMode?: 'blend' | 'collage' | 'style-transfer' | 'combine';
}

export interface ImageEditHistoryEntry {
  id: string;
  timestamp: number;
  imageUrl: string;
  prompt: string;
  config: ImageGenerationConfig;
  parentImageId?: string; // For tracking iterations
}

export interface ImageNodeData {
  generatedImages: string[]; // Array of image URLs
  currentImageIndex: number; // Which image is currently displayed
  generationConfig: ImageGenerationConfig;
  editHistory: ImageEditHistoryEntry[];
  isGenerating?: boolean;
  generationError?: string;
}

export interface NodeMetadata {
  temperature?: number;
  parameters?: Record<string, any>;
  processingTime?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationNode {
  id: string;
  name: string; // Human-readable name like "Question 1" or "Node 2"
  type: NodeType;
  question: string;
  answer: string;
  answerSections?: AnswerSection[]; // Parsed sections of the answer
  parentId: string | null;
  childrenIds: string[];
  context: string[]; // Full conversation chain up to parent

  // Enhanced metadata
  model?: string;
  provider?: string;
  tokens?: number;
  cost?: number;
  metadata?: NodeMetadata;
  attachments?: Attachment[];
  tags?: string[];

  // Image generation data (for type === 'image')
  imageData?: ImageNodeData;

  // Position and UI state
  timestamp: number;
  position: { x: number; y: number };
  isCollapsed: boolean;
  selectedSectionIndexFromParent?: number; // Index of section selected from parent when spawning this node
  includeInContext?: boolean; // Whether this node should be included in context (default: true)
  isBookmarked?: boolean; // Whether this node is bookmarked for quick access
}

export interface ConversationTree {
  nodes: Map<string, ConversationNode>;
  rootIds: string[]; // IDs of root nodes (no parent)
}

