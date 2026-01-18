/**
 * Gemini Vision Adapter
 *
 * Google Gemini 2.0 Flash adapter for vision analysis.
 * Uses inlineData format for images.
 */

import {
  VisionProviderAdapter,
  VisionAnalysisRequest,
  VisionAnalysisResponse,
  VisionProviderConfig,
  VisionProviderError,
  VisionImage,
} from '../types.ts';

interface GeminiInlineData {
  inlineData: {
    mimeType: string;
    data: string;
  };
}

interface GeminiTextPart {
  text: string;
}

type GeminiPart = GeminiTextPart | GeminiInlineData;

interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text?: string;
      }>;
    };
    finishReason: string;
  }>;
}

export class GeminiVisionAdapter implements VisionProviderAdapter {
  readonly provider = 'gemini' as const;
  readonly supportedModels = [
    'gemini-2.0-flash-exp',
    'gemini-2.0-flash',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
  ];
  readonly defaultModel = 'gemini-2.0-flash-exp';

  private apiKey: string;
  private model: string;
  private timeout: number;
  private maxRetries: number;

  constructor(config: VisionProviderConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || this.defaultModel;
    this.timeout = config.timeout || 60000;
    this.maxRetries = config.maxRetries || 2;
  }

  async isAvailable(): Promise<boolean> {
    try {
      return !!this.apiKey && this.apiKey.length > 10;
    } catch {
      return false;
    }
  }

  async analyzeImages(request: VisionAnalysisRequest): Promise<VisionAnalysisResponse> {
    const startTime = Date.now();

    // Build parts array with prompt and images
    const parts: GeminiPart[] = [];

    // Add prompt first
    parts.push({
      text: this.buildPrompt(request),
    });

    // Add each image as inlineData
    for (const image of request.images) {
      parts.push(this.buildImagePart(image));
    }

    const contents: GeminiContent[] = [
      {
        role: 'user',
        parts,
      },
    ];

    // Add JSON schema instruction if provided
    if (request.jsonSchema) {
      const schemaPart: GeminiPart = {
        text: `\n\nYou must respond with valid JSON matching this schema: ${JSON.stringify(request.jsonSchema)}`,
      };
      contents[0].parts.push(schemaPart);
    }

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.callAPI(contents, request);
        const rawText = response.candidates[0]?.content?.parts
          ?.map(p => p.text)
          .filter(Boolean)
          .join('') || '';

        // Parse JSON if schema was provided
        let imageReadoutJson: object | undefined;
        if (request.jsonSchema) {
          try {
            const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, rawText];
            imageReadoutJson = JSON.parse(jsonMatch[1]?.trim() || rawText);
          } catch {
            console.warn('Failed to parse JSON from Gemini response');
          }
        }

        return {
          image_readout_json: imageReadoutJson,
          raw_text: rawText,
          provider: this.provider,
          model: this.model,
          processingTimeMs: Date.now() - startTime,
          imageCount: request.images.length,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`Gemini vision attempt ${attempt + 1} failed:`, lastError.message);

        const isRetryable = this.isRetryableError(lastError);
        if (!isRetryable || attempt === this.maxRetries) {
          throw new VisionProviderError(
            `Gemini vision analysis failed: ${lastError.message}`,
            this.provider,
            this.model,
            isRetryable,
            lastError
          );
        }

        const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 500, 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new VisionProviderError(
      `Gemini vision analysis failed after ${this.maxRetries} retries`,
      this.provider,
      this.model,
      false,
      lastError
    );
  }

  private buildPrompt(request: VisionAnalysisRequest): string {
    let prompt = request.prompt;

    if (request.images.length > 1) {
      prompt = `You are analyzing ${request.images.length} images. Please consider all images in your analysis.\n\n${prompt}`;
    }

    return prompt;
  }

  private buildImagePart(image: VisionImage): GeminiInlineData {
    return {
      inlineData: {
        mimeType: image.mime_type,
        data: image.data_base64,
      },
    };
  }

  private async callAPI(contents: GeminiContent[], request: VisionAnalysisRequest): Promise<GeminiResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            maxOutputTokens: request.maxTokens || 4000,
            temperature: request.temperature ?? 0.7,
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Gemini API error ${response.status}: ${errorText}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private isRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase();
    return (
      message.includes('rate limit') ||
      message.includes('timeout') ||
      message.includes('503') ||
      message.includes('502') ||
      message.includes('429') ||
      message.includes('resource exhausted')
    );
  }
}
