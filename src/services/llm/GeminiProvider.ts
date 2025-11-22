import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMConfig, LLMResponse, Message, ModelInfo } from '../../types/llm';
import { ILLMProvider } from './LLMService';

export class GeminiProvider implements ILLMProvider {
  name = 'gemini';

  private models: ModelInfo[] = [
    {
      id: 'gemini-pro',
      name: 'Gemini Pro',
      provider: 'gemini',
      contextWindow: 32768,
      inputCostPer1kTokens: 0.00025,
      outputCostPer1kTokens: 0.0005,
      description: 'Best for text tasks',
    },
    {
      id: 'gemini-pro-vision',
      name: 'Gemini Pro Vision',
      provider: 'gemini',
      contextWindow: 16384,
      inputCostPer1kTokens: 0.00025,
      outputCostPer1kTokens: 0.0005,
      description: 'Supports both text and image inputs',
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
    if (config.provider !== 'gemini') {
      throw new Error('GeminiProvider only supports Gemini');
    }

    const genAI = new GoogleGenerativeAI(config.apiKey);
    const model = genAI.getGenerativeModel({ model: config.model });

    try {
      const generationConfig = {
        temperature: config.temperature,
        maxOutputTokens: config.maxTokens,
        topP: config.topP,
        topK: config.topK,
      };

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
      });

      const response = result.response;
      const content = response.text();

      // Gemini doesn't always provide token counts
      const usage = {
        promptTokens: this.estimateTokens(prompt),
        completionTokens: this.estimateTokens(content),
        totalTokens: this.estimateTokens(prompt) + this.estimateTokens(content),
      };

      return {
        content,
        usage,
        model: config.model,
        provider: 'gemini',
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Gemini API error: ${error.message}`);
      }
      throw error;
    }
  }

  async sendMessage(prompt: string, context: Message[], config: LLMConfig): Promise<LLMResponse> {
    if (config.provider !== 'gemini') {
      throw new Error('GeminiProvider only supports Gemini');
    }

    const genAI = new GoogleGenerativeAI(config.apiKey);
    const model = genAI.getGenerativeModel({ model: config.model });

    try {
      const generationConfig = {
        temperature: config.temperature,
        maxOutputTokens: config.maxTokens,
        topP: config.topP,
        topK: config.topK,
      };

      // Convert messages to Gemini format
      const history = context.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      const chat = model.startChat({
        history,
        generationConfig,
      });

      const result = await chat.sendMessage(prompt);
      const response = result.response;
      const content = response.text();

      // Estimate tokens
      const contextText = context.map((m) => m.content).join(' ');
      const usage = {
        promptTokens: this.estimateTokens(contextText + prompt),
        completionTokens: this.estimateTokens(content),
        totalTokens:
          this.estimateTokens(contextText + prompt) + this.estimateTokens(content),
      };

      return {
        content,
        usage,
        model: config.model,
        provider: 'gemini',
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Gemini API error: ${error.message}`);
      }
      throw error;
    }
  }
}
