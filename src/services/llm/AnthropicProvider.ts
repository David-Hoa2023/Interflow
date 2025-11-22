import Anthropic from '@anthropic-ai/sdk';
import { LLMConfig, LLMResponse, Message, ModelInfo } from '../../types/llm';
import { ILLMProvider } from './LLMService';

export class AnthropicProvider implements ILLMProvider {
  name = 'anthropic';

  private models: ModelInfo[] = [
    {
      id: 'claude-3-opus-20240229',
      name: 'Claude 3 Opus',
      provider: 'anthropic',
      contextWindow: 200000,
      inputCostPer1kTokens: 0.015,
      outputCostPer1kTokens: 0.075,
      description: 'Most capable Claude model, best for complex tasks',
    },
    {
      id: 'claude-3-sonnet-20240229',
      name: 'Claude 3 Sonnet',
      provider: 'anthropic',
      contextWindow: 200000,
      inputCostPer1kTokens: 0.003,
      outputCostPer1kTokens: 0.015,
      description: 'Balanced performance and speed',
    },
    {
      id: 'claude-3-haiku-20240307',
      name: 'Claude 3 Haiku',
      provider: 'anthropic',
      contextWindow: 200000,
      inputCostPer1kTokens: 0.00025,
      outputCostPer1kTokens: 0.00125,
      description: 'Fastest and most cost-effective',
    },
  ];

  getModels(): ModelInfo[] {
    return this.models;
  }

  estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
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
    if (config.provider !== 'anthropic') {
      throw new Error('AnthropicProvider only supports Anthropic');
    }

    const anthropic = new Anthropic({
      apiKey: config.apiKey,
      dangerouslyAllowBrowser: true, // For client-side usage
    });

    try {
      const response = await anthropic.messages.create({
        model: config.model,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        top_p: config.topP,
        top_k: config.topK,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0]?.type === 'text' ? response.content[0].text : '';
      const usage = {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      };

      return {
        content,
        usage,
        model: config.model,
        provider: 'anthropic',
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Anthropic API error: ${error.message}`);
      }
      throw error;
    }
  }

  async sendMessage(prompt: string, context: Message[], config: LLMConfig): Promise<LLMResponse> {
    if (config.provider !== 'anthropic') {
      throw new Error('AnthropicProvider only supports Anthropic');
    }

    const anthropic = new Anthropic({
      apiKey: config.apiKey,
      dangerouslyAllowBrowser: true,
    });

    try {
      // Convert messages to Anthropic format
      const messages = [
        ...context
          .filter((msg) => msg.role !== 'system') // Anthropic handles system messages separately
          .map((msg) => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          })),
        { role: 'user' as const, content: prompt },
      ];

      // Extract system message if present
      const systemMessage = context.find((msg) => msg.role === 'system');

      const response = await anthropic.messages.create({
        model: config.model,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        top_p: config.topP,
        top_k: config.topK,
        system: systemMessage?.content,
        messages,
      });

      const content = response.content[0]?.type === 'text' ? response.content[0].text : '';
      const usage = {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      };

      return {
        content,
        usage,
        model: config.model,
        provider: 'anthropic',
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Anthropic API error: ${error.message}`);
      }
      throw error;
    }
  }
}
