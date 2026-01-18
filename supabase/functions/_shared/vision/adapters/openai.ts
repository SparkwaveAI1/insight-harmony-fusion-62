/**
 * OpenAI Vision Adapter
 *
 * Primary vision provider using GPT-4o family with detail: "high" for optimal understanding.
 * Supports multi-image analysis, structured JSON output, and high-fidelity image processing.
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

// OpenAI-specific types
interface OpenAIImageContent {
  type: 'image_url';
  image_url: {
    url: string;
    detail?: 'low' | 'high' | 'auto';
  };
}

interface OpenAITextContent {
  type: 'text';
  text: string;
}

type OpenAIContent = OpenAITextContent | OpenAIImageContent;

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | OpenAIContent[];
}

interface OpenAIResponse {
  id: string;
  choices: Array<{
    message: {
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenAIVisionAdapter implements VisionProviderAdapter {
  readonly provider = 'openai' as const;
  readonly supportedModels = [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-4.1-2025-04-14',
    'o3',
    'o3-mini',
  ];
  readonly defaultModel = 'gpt-4o'; // Best balance of quality and cost for vision

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
      // Quick health check - just verify API key format
      return !!this.apiKey && this.apiKey.startsWith('sk-');
    } catch {
      return false;
    }
  }

  async analyzeImages(request: VisionAnalysisRequest): Promise<VisionAnalysisResponse> {
    const startTime = Date.now();
    const detailPolicy = request.detailPolicy || 'high'; // Default to high for optimal understanding

    // Build content array with prompt and images
    const content: OpenAIContent[] = [
      {
        type: 'text',
        text: this.buildPrompt(request),
      },
    ];

    // Add each image with the specified detail policy
    for (const image of request.images) {
      content.push(this.buildImageContent(image, detailPolicy));
    }

    const messages: OpenAIMessage[] = [
      {
        role: 'user',
        content,
      },
    ];

    // If JSON schema provided, add system message for structured output
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
            // Extract JSON from response (handles markdown code blocks)
            const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, rawText];
            imageReadoutJson = JSON.parse(jsonMatch[1]?.trim() || rawText);
          } catch {
            console.warn('Failed to parse JSON from OpenAI response, returning raw text');
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
        console.error(`OpenAI vision attempt ${attempt + 1} failed:`, lastError.message);

        // Check if error is retryable
        const isRetryable = this.isRetryableError(lastError);
        if (!isRetryable || attempt === this.maxRetries) {
          throw new VisionProviderError(
            `OpenAI vision analysis failed: ${lastError.message}`,
            this.provider,
            this.model,
            isRetryable,
            lastError
          );
        }

        // Exponential backoff with jitter
        const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 500, 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new VisionProviderError(
      `OpenAI vision analysis failed after ${this.maxRetries} retries`,
      this.provider,
      this.model,
      false,
      lastError
    );
  }

  private buildPrompt(request: VisionAnalysisRequest): string {
    let prompt = request.prompt;

    // Add multi-image context if multiple images
    if (request.images.length > 1) {
      prompt = `You are analyzing ${request.images.length} images. Please consider all images in your analysis.\n\n${prompt}`;
    }

    return prompt;
  }

  private buildImageContent(image: VisionImage, detail: 'low' | 'high' | 'auto'): OpenAIImageContent {
    const dataUrl = buildDataUrl(image.data_base64, image.mime_type);

    return {
      type: 'image_url',
      image_url: {
        url: dataUrl,
        detail, // Explicitly set detail policy - 'high' for screenshots, charts, dense text
      },
    };
  }

  private async callAPI(messages: OpenAIMessage[], request: VisionAnalysisRequest): Promise<OpenAIResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          max_tokens: request.maxTokens || 4000,
          temperature: request.temperature ?? 0.7,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `OpenAI API error ${response.status}: ${errorData.error?.message || response.statusText}`
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
      message.includes('429') ||
      message.includes('overloaded')
    );
  }
}
