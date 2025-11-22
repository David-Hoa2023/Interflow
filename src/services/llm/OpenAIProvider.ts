import OpenAI from 'openai';
import { LLMConfig, LLMResponse, Message, ModelInfo } from '../../types/llm';
import { ILLMProvider } from './LLMService';

export class OpenAIProvider implements ILLMProvider {
  name = 'openai';

  private models: ModelInfo[] = [
    {
      id: 'gpt-4-turbo-preview',
      name: 'GPT-4 Turbo',
      provider: 'openai',
      contextWindow: 128000,
      inputCostPer1kTokens: 0.01,
      outputCostPer1kTokens: 0.03,
      description: 'Most capable model, best for complex tasks',
    },
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'openai',
      contextWindow: 8192,
      inputCostPer1kTokens: 0.03,
      outputCostPer1kTokens: 0.06,
      description: 'Previous generation flagship model',
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'openai',
      contextWindow: 16385,
      inputCostPer1kTokens: 0.0005,
      outputCostPer1kTokens: 0.0015,
      description: 'Fast and cost-effective for most tasks',
    },
  ];

  getModels(): ModelInfo[] {
    return this.models;
  }

  estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    // More accurate would be to use tiktoken library, but this is a good approximation
    return Math.ceil(text.length / 4);
  }

  calculateCost(promptTokens: number, completionTokens: number, model: string): number {
    const modelInfo = this.models.find((m) => m.id === model);
    if (!modelInfo) {
      return 0;
    }

    const promptCost = (promptTokens / 1000) * modelInfo.inputCostPer1kTokens;
    const completionCost = (completionTokens / 1000) * modelInfo.outputCostPer1kTokens;
    return promptCost + completionCost;
  }

  async generate(prompt: string, config: LLMConfig): Promise<LLMResponse> {
    if (config.provider !== 'openai') {
      throw new Error('OpenAIProvider only supports OpenAI');
    }

    const openai = new OpenAI({
      apiKey: config.apiKey,
      dangerouslyAllowBrowser: true, // For client-side usage
    });

    try {
      const response = await openai.chat.completions.create({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        top_p: config.topP,
      });

      const content = response.choices[0]?.message?.content || '';
      const usage = response.usage
        ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          }
        : undefined;

      return {
        content,
        usage,
        model: config.model,
        provider: 'openai',
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`OpenAI API error: ${error.message}`);
      }
      throw error;
    }
  }

  async sendMessage(prompt: string, context: Message[], config: LLMConfig): Promise<LLMResponse> {
    if (config.provider !== 'openai') {
      throw new Error('OpenAIProvider only supports OpenAI');
    }

    const openai = new OpenAI({
      apiKey: config.apiKey,
      dangerouslyAllowBrowser: true,
    });

    try {
      const messages = [
        ...context.map((msg) => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        })),
        { role: 'user' as const, content: prompt },
      ];

      const response = await openai.chat.completions.create({
        model: config.model,
        messages,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        top_p: config.topP,
      });

      const content = response.choices[0]?.message?.content || '';
      const usage = response.usage
        ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          }
        : undefined;

      return {
        content,
        usage,
        model: config.model,
        provider: 'openai',
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`OpenAI API error: ${error.message}`);
      }
      throw error;
    }
  }
}

