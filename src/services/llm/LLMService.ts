import { LLMConfig, LLMResponse, Message, ModelInfo } from '../../types/llm';
import { OpenAIProvider } from './OpenAIProvider';
import { AnthropicProvider } from './AnthropicProvider';
import { GeminiProvider } from './GeminiProvider';

export interface ILLMProvider {
  name: string;
  generate(prompt: string, config: LLMConfig): Promise<LLMResponse>;
  sendMessage(prompt: string, context: Message[], config: LLMConfig): Promise<LLMResponse>;
  getModels(): ModelInfo[];
  estimateTokens(text: string): number;
  calculateCost(promptTokens: number, completionTokens: number, model: string): number;
}

export class LLMService {
  private providers: Map<string, ILLMProvider> = new Map();

  constructor() {
    // Register all providers
    this.providers.set('openai', new OpenAIProvider());
    this.providers.set('anthropic', new AnthropicProvider());
    this.providers.set('gemini', new GeminiProvider());
  }

  registerProvider(name: string, provider: ILLMProvider): void {
    this.providers.set(name, provider);
  }

  async generate(prompt: string, config: LLMConfig): Promise<LLMResponse> {
    const provider = this.providers.get(config.provider);
    if (!provider) {
      throw new Error(`Unsupported LLM provider: ${config.provider}`);
    }

    return provider.generate(prompt, config);
  }

  async sendMessage(prompt: string, context: Message[], config: LLMConfig): Promise<LLMResponse> {
    const provider = this.providers.get(config.provider);
    if (!provider) {
      throw new Error(`Unsupported LLM provider: ${config.provider}`);
    }

    return provider.sendMessage(prompt, context, config);
  }

  getModels(providerName: string): ModelInfo[] {
    const provider = this.providers.get(providerName);
    if (!provider) {
      return [];
    }
    return provider.getModels();
  }

  getAllModels(): ModelInfo[] {
    const allModels: ModelInfo[] = [];
    this.providers.forEach((provider) => {
      allModels.push(...provider.getModels());
    });
    return allModels;
  }

  estimateTokens(text: string, providerName: string): number {
    const provider = this.providers.get(providerName);
    if (!provider) {
      // Fallback: rough estimation (1 token ≈ 4 characters)
      return Math.ceil(text.length / 4);
    }
    return provider.estimateTokens(text);
  }

  calculateCost(promptTokens: number, completionTokens: number, model: string, providerName: string): number {
    const provider = this.providers.get(providerName);
    if (!provider) {
      return 0;
    }
    return provider.calculateCost(promptTokens, completionTokens, model);
  }

  getProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}

export const llmService = new LLMService();

