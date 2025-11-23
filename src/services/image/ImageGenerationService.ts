import { GoogleGenerativeAI } from '@google/generative-ai';
import { ImageGenerationConfig, ImageEditHistoryEntry } from '../../types/conversation';

export interface ImageGenerationResult {
  imageUrls: string[];
  prompt: string;
  config: ImageGenerationConfig;
  timestamp: number;
  error?: string;
}

export interface ImageGenerationOptions {
  apiKey: string;
  config: ImageGenerationConfig;
  onProgress?: (status: string) => void;
}

/**
 * Service for generating images using Google Gemini Imagen API
 * Supports Imagen 3.0 models with various aspect ratios and safety settings
 */
export class ImageGenerationService {
  private genAI: GoogleGenerativeAI | null = null;

  /**
   * Initialize the service with an API key
   */
  initialize(apiKey: string): void {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Check if the service is initialized
   */
  isInitialized(): boolean {
    return this.genAI !== null;
  }

  /**
   * Generate images using the Gemini Imagen API
   */
  async generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
    const { apiKey, config, onProgress } = options;

    // Initialize if not already done
    if (!this.genAI) {
      this.initialize(apiKey);
    }

    if (!this.genAI) {
      throw new Error('ImageGenerationService not initialized');
    }

    try {
      onProgress?.('Initializing image generation...');

      // Get the generative model for images
      const model = this.genAI.getGenerativeModel({
        model: config.model
      });

      onProgress?.('Sending request to Gemini Imagen API...');

      // Build the generation parameters
      const generationConfig: any = {
        // Note: The actual Gemini Imagen API parameters may differ
        // This is based on the expected API structure
        numberOfImages: config.numberOfImages || 1,
        aspectRatio: config.aspectRatio,
      };

      // Add optional parameters if provided
      if (config.negativePrompt) {
        generationConfig.negativePrompt = config.negativePrompt;
      }
      if (config.personGeneration) {
        generationConfig.personGeneration = config.personGeneration;
      }
      if (config.safetyFilterLevel) {
        generationConfig.safetyFilterLevel = config.safetyFilterLevel;
      }
      if (config.addWatermark !== undefined) {
        generationConfig.addWatermark = config.addWatermark;
      }

      // Generate the image
      // Note: The actual API call structure may need adjustment based on the SDK version
      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [{ text: config.prompt }]
        }],
        generationConfig,
      });

      onProgress?.('Processing generated images...');

      // Extract image URLs from the response
      // Note: This structure may need to be adjusted based on actual API response
      const imageUrls: string[] = [];
      const response = result.response;

      // The actual response structure for images needs to be determined
      // For now, we'll assume the response contains image data
      // In practice, Imagen API returns base64-encoded images or URLs
      if (response) {
        // Placeholder: Extract image URLs from response
        // This will need to be implemented based on actual API response structure
        const candidates = response.candidates || [];
        for (const candidate of candidates) {
          if (candidate.content?.parts) {
            for (const part of candidate.content.parts) {
              // Check if part contains image data
              if (part.inlineData?.data) {
                // Convert base64 to data URL
                const mimeType = part.inlineData.mimeType || 'image/png';
                const imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
                imageUrls.push(imageUrl);
              } else if (part.fileData?.fileUri) {
                // If the API returns file URIs
                imageUrls.push(part.fileData.fileUri);
              }
            }
          }
        }
      }

      if (imageUrls.length === 0) {
        throw new Error('No images generated in response');
      }

      onProgress?.(`Successfully generated ${imageUrls.length} image(s)`);

      return {
        imageUrls,
        prompt: config.prompt,
        config,
        timestamp: Date.now(),
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        imageUrls: [],
        prompt: config.prompt,
        config,
        timestamp: Date.now(),
        error: errorMessage,
      };
    }
  }

  /**
   * Generate a variation of an existing image
   * This uses the same generation API but with a modified prompt
   */
  async generateVariation(
    _originalImage: string,
    variationPrompt: string,
    options: ImageGenerationOptions
  ): Promise<ImageGenerationResult> {
    // Combine the original context with the variation request
    const enhancedConfig: ImageGenerationConfig = {
      ...options.config,
      prompt: `Create a variation of the previous image with these changes: ${variationPrompt}`,
    };

    return this.generateImage({
      ...options,
      config: enhancedConfig,
    });
  }

  /**
   * Create a history entry from a generation result
   */
  createHistoryEntry(
    result: ImageGenerationResult,
    imageUrl: string,
    parentImageId?: string
  ): ImageEditHistoryEntry {
    return {
      id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      timestamp: result.timestamp,
      imageUrl,
      prompt: result.prompt,
      config: result.config,
      parentImageId,
    };
  }

  /**
   * Validate image generation config
   */
  validateConfig(config: ImageGenerationConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.prompt || config.prompt.trim().length === 0) {
      errors.push('Prompt is required');
    }

    if (config.prompt && config.prompt.length > 5000) {
      errors.push('Prompt must be less than 5000 characters');
    }

    if (config.numberOfImages && (config.numberOfImages < 1 || config.numberOfImages > 4)) {
      errors.push('Number of images must be between 1 and 4');
    }

    // Validate composition sources
    if (config.compositionSources) {
      if (config.compositionSources.length === 0) {
        errors.push('At least one composition source is required when using composition mode');
      }
      if (config.compositionSources.length > 14) {
        errors.push('Maximum 14 composition sources allowed');
      }
      if (config.compositionSources.length === 1 && config.compositionMode !== 'style-transfer') {
        errors.push('Composition requires at least 2 images (except for style-transfer mode)');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get default configuration for image generation
   */
  getDefaultConfig(): ImageGenerationConfig {
    return {
      model: 'imagen-3.0-generate-001',
      aspectRatio: '1:1',
      prompt: '',
      numberOfImages: 1,
      personGeneration: 'dont_allow',
      safetyFilterLevel: 'block_medium_and_above',
      addWatermark: false,
    };
  }
}

// Export a singleton instance
export const imageGenerationService = new ImageGenerationService();
