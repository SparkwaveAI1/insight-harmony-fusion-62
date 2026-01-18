/**
 * Grok Vision Adapter (xAI)
 *
 * Grok-2-Vision adapter following OpenAI-compatible API format.
 * Note: Grok vision API follows OpenAI format but may not support all detail policies.
 */

import {
  VisionProviderAdapter,
  VisionAnalysisRequest,
  VisionAnalysisResponse,
  VisionProviderConfig,
  VisionProviderError,
  VisionImage,
  buildDataUrl,
} from '../types.ts';

interface GrokImageContent {
  type: 'image_url';
  image_url: {
    url: string;
  };
}

interface GrokTextContent {
  type: 'text';
  text: string;
}

type GrokContent = GrokTextContent | GrokImageContent;

interface GrokMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | GrokContent[];
}

interface GrokResponse {
  id: string;
  choices: Array<{
    message: {
      content: string;
    };
    finish_reason: string;
  }>;
}

export class GrokVisionAdapter implements VisionProviderAdapter {
  readonly provider = 'grok' as const;
  readonly supportedModels = [
    'grok-2-vision-1212',
    'grok-2-vision',
  ];
  readonly defaultModel = 'grok-2-vision-1212';

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

    // Build content array with prompt and images
    const content: GrokContent[] = [
      {
        type: 'text',
        text: this.buildPrompt(request),
      },
    ];

    // Add each image (Grok doesn't support detail parameter)
    for (const image of request.images) {
      content.push(this.buildImageContent(image));
    }

    const messages: GrokMessage[] = [
      {
        role: 'user',
        content,
      },
    ];

    // Add system message for JSON if needed
    if (request.jsonSchema) {
      messages.unshift({
        role: 'system',
        content: `You must respond with valid JSON matching this schema: ${JSON.stringify(request.jsonSchema)}`,
      });
    }

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.callAPI(messages, request);
        const rawText = response.choices[0]?.message?.content || '';

        // Parse JSON if schema was provided
        let imageReadoutJson: object | undefined;
        if (request.jsonSchema) {
          try {
            const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, rawText];
            imageReadoutJson = JSON.parse(jsonMatch[1]?.trim() || rawText);
          } catch {
            console.warn('Failed to parse JSON from Grok response');
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
        console.error(`Grok vision attempt ${attempt + 1} failed:`, lastError.message);

        const isRetryable = this.isRetryableError(lastError);
        if (!isRetryable || attempt === this.maxRetries) {
          throw new VisionProviderError(
            `Grok vision analysis failed: ${lastError.message}`,
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
      `Grok vision analysis failed after ${this.maxRetries} retries`,
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

  private buildImageContent(image: VisionImage): GrokImageContent {
    const dataUrl = buildDataUrl(image.data_base64, image.mime_type);

    return {
      type: 'image_url',
      image_url: {
        url: dataUrl,
        // Note: Grok API doesn't support detail parameter
      },
    };
  }

  private async callAPI(messages: GrokMessage[], request: VisionAnalysisRequest): Promise<GrokResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          max_tokens: request.maxTokens || 2000,
          temperature: request.temperature ?? 0.8,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Grok API error ${response.status}: ${errorData.error?.message || response.statusText}`
        );
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
      message.includes('429')
    );
  }
}
