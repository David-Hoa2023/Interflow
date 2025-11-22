export type LLMProvider = 'openai' | 'anthropic' | 'gemini' | 'custom';

export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  topP?: number;
  topK?: number;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
  provider?: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: LLMProvider;
  contextWindow: number;
  inputCostPer1kTokens: number;
  outputCostPer1kTokens: number;
  description?: string;
}

export interface ModelConfig {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

