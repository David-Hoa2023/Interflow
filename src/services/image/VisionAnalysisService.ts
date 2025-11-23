import { GoogleGenerativeAI } from '@google/generative-ai';

export interface VisionAnalysisRequest {
  imageUrl: string; // Base64 data URL or HTTP URL
  question: string;
  model?: 'gemini-pro-vision' | 'gemini-1.5-pro' | 'gemini-1.5-flash';
}

export interface VisionAnalysisResult {
  analysis: string;
  question: string;
  imageUrl: string;
  model: string;
  timestamp: number;
  error?: string;
}

/**
 * Service for analyzing images using Google Gemini Vision models
 * Supports visual question answering and image understanding
 */
export class VisionAnalysisService {
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
   * Analyze an image with a question or prompt
   */
  async analyzeImage(request: VisionAnalysisRequest, apiKey: string): Promise<VisionAnalysisResult> {
    // Initialize if not already done
    if (!this.genAI) {
      this.initialize(apiKey);
    }

    if (!this.genAI) {
      throw new Error('VisionAnalysisService not initialized');
    }

    const model = request.model || 'gemini-pro-vision';

    try {
      const visionModel = this.genAI.getGenerativeModel({ model });

      // Prepare the image part
      let imagePart: any;

      if (request.imageUrl.startsWith('data:')) {
        // Base64 data URL
        const base64Data = request.imageUrl.split(',')[1];
        const mimeType = request.imageUrl.split(';')[0].split(':')[1];

        imagePart = {
          inlineData: {
            data: base64Data,
            mimeType,
          },
        };
      } else {
        // HTTP URL - fetch and convert to base64
        const response = await fetch(request.imageUrl);
        const blob = await response.blob();
        const base64 = await this.blobToBase64(blob);
        const base64Data = base64.split(',')[1];

        imagePart = {
          inlineData: {
            data: base64Data,
            mimeType: blob.type,
          },
        };
      }

      // Generate analysis
      const result = await visionModel.generateContent([
        request.question,
        imagePart,
      ]);

      const response = result.response;
      const analysis = response.text();

      return {
        analysis,
        question: request.question,
        imageUrl: request.imageUrl,
        model,
        timestamp: Date.now(),
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        analysis: '',
        question: request.question,
        imageUrl: request.imageUrl,
        model,
        timestamp: Date.now(),
        error: errorMessage,
      };
    }
  }

  /**
   * Convert Blob to Base64
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Batch analyze multiple images with the same question
   */
  async batchAnalyze(
    imageUrls: string[],
    question: string,
    apiKey: string,
    model?: VisionAnalysisRequest['model']
  ): Promise<VisionAnalysisResult[]> {
    const requests: VisionAnalysisRequest[] = imageUrls.map((url) => ({
      imageUrl: url,
      question,
      model,
    }));

    // Process in parallel
    return Promise.all(
      requests.map((req) => this.analyzeImage(req, apiKey))
    );
  }

  /**
   * Get common vision analysis prompts
   */
  getCommonPrompts(): Array<{ label: string; prompt: string; category: string }> {
    return [
      {
        category: 'Description',
        label: 'Describe Image',
        prompt: 'Describe this image in detail.',
      },
      {
        category: 'Description',
        label: 'Identify Objects',
        prompt: 'What objects can you identify in this image?',
      },
      {
        category: 'Analysis',
        label: 'Analyze Composition',
        prompt: 'Analyze the composition, colors, and visual elements in this image.',
      },
      {
        category: 'Analysis',
        label: 'Extract Text',
        prompt: 'Extract and transcribe any text visible in this image.',
      },
      {
        category: 'Creative',
        label: 'Suggest Improvements',
        prompt: 'Suggest ways to improve this image from a design perspective.',
      },
      {
        category: 'Creative',
        label: 'Generate Caption',
        prompt: 'Create an engaging caption for this image suitable for social media.',
      },
      {
        category: 'Technical',
        label: 'Technical Analysis',
        prompt: 'Provide a technical analysis of this image including quality, resolution estimates, and potential issues.',
      },
      {
        category: 'Technical',
        label: 'Accessibility Description',
        prompt: 'Create a detailed accessibility description (alt text) for this image.',
      },
      {
        category: 'Educational',
        label: 'Educational Value',
        prompt: 'What educational insights or learning points can be derived from this image?',
      },
      {
        category: 'Educational',
        label: 'Historical Context',
        prompt: 'Analyze any historical or cultural context visible in this image.',
      },
    ];
  }
}

// Export a singleton instance
export const visionAnalysisService = new VisionAnalysisService();
