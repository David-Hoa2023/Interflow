export interface AnswerSection {
  id: string;
  text: string;
  index: number;
}

export type NodeType = 'question' | 'answer' | 'decision' | 'summary' | 'reference' | 'action';

export interface Attachment {
  id: string;
  type: 'image' | 'file' | 'link' | 'code';
  url?: string;
  content?: string;
  filename?: string;
  mimeType?: string;
  size?: number;
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

  // Position and UI state
  timestamp: number;
  position: { x: number; y: number };
  isCollapsed: boolean;
  selectedSectionIndexFromParent?: number; // Index of section selected from parent when spawning this node
}

export interface ConversationTree {
  nodes: Map<string, ConversationNode>;
  rootIds: string[]; // IDs of root nodes (no parent)
}

