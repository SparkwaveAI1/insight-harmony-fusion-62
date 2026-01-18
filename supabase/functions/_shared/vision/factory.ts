/**
 * Vision Provider Factory
 *
 * Creates and manages vision provider instances with automatic fallback chain.
 * Enables A/B testing, clean provider swapping, and resilient image analysis.
 */

import {
  VisionProviderAdapter,
  VisionAnalysisRequest,
  VisionAnalysisResponse,
  VisionConfig,
  VisionProvider,
  VisionProviderError,
  VisionImage,
  extractBase64FromDataUrl,
  detectMimeType,
} from './types.ts';

import { OpenAIVisionAdapter } from './adapters/openai.ts';
import { GrokVisionAdapter } from './adapters/grok.ts';
import { GeminiVisionAdapter } from './adapters/gemini.ts';
import { loadVisionConfigFromEnv } from './config.ts';

export class VisionProviderFactory {
  private adapters: Map<VisionProvider, VisionProviderAdapter> = new Map();
  private config: VisionConfig;

  constructor(config?: VisionConfig) {
    this.config = config || loadVisionConfigFromEnv();
    this.initializeAdapters();
  }

  private initializeAdapters(): void {
    // Initialize OpenAI adapter if configured
    if (this.config.providers.openai) {
      this.adapters.set('openai', new OpenAIVisionAdapter(this.config.providers.openai));
    }

    // Initialize Grok adapter if configured
    if (this.config.providers.grok) {
      this.adapters.set('grok', new GrokVisionAdapter(this.config.providers.grok));
    }

    // Initialize Gemini adapter if configured
    if (this.config.providers.gemini) {
      this.adapters.set('gemini', new GeminiVisionAdapter(this.config.providers.gemini));
    }

    // Log available adapters
    console.log(`Vision providers initialized: ${Array.from(this.adapters.keys()).join(', ')}`);
  }

  /**
   * Get a specific provider adapter
   */
  getAdapter(provider: VisionProvider): VisionProviderAdapter | undefined {
    return this.adapters.get(provider);
  }

  /**
   * Get the primary provider adapter
   */
  getPrimaryAdapter(): VisionProviderAdapter | undefined {
    return this.adapters.get(this.config.primaryProvider);
  }

  /**
   * Get list of available providers
   */
  getAvailableProviders(): VisionProvider[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * Analyze images using the primary provider with automatic fallback
   */
  async analyzeImages(request: VisionAnalysisRequest): Promise<VisionAnalysisResponse> {
    // Apply default detail policy if not specified
    const fullRequest: VisionAnalysisRequest = {
      ...request,
      detailPolicy: request.detailPolicy || this.config.defaultDetailPolicy,
      maxTokens: request.maxTokens || this.config.defaultMaxTokens,
    };

    // Build ordered list of providers to try
    const providersToTry: VisionProvider[] = [
      this.config.primaryProvider,
      ...this.config.fallbackChain.filter(p => p !== this.config.primaryProvider),
    ];

    const errors: Array<{ provider: VisionProvider; error: Error }> = [];

    for (const provider of providersToTry) {
      const adapter = this.adapters.get(provider);

      if (!adapter) {
        console.log(`Provider ${provider} not configured, skipping`);
        continue;
      }

      // Check if provider is available
      const isAvailable = await adapter.isAvailable();
      if (!isAvailable) {
        console.log(`Provider ${provider} not available, skipping`);
        continue;
      }

      try {
        console.log(`Attempting vision analysis with ${provider}`);
        const result = await adapter.analyzeImages(fullRequest);
        console.log(`Vision analysis successful with ${provider} (${result.processingTimeMs}ms)`);
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        errors.push({ provider, error: err });
        console.error(`Provider ${provider} failed:`, err.message);

        // If error is not retryable and not a provider-specific error, don't try fallbacks
        if (error instanceof VisionProviderError && !error.isRetryable) {
          console.log(`Error is not retryable, but trying next provider in fallback chain`);
        }
      }
    }

    // All providers failed
    const errorSummary = errors.map(e => `${e.provider}: ${e.error.message}`).join('; ');
    throw new VisionProviderError(
      `All vision providers failed. Errors: ${errorSummary}`,
      this.config.primaryProvider,
      'unknown',
      false
    );
  }

  /**
   * Analyze images using a specific provider (no fallback)
   */
  async analyzeImagesWithProvider(
    provider: VisionProvider,
    request: VisionAnalysisRequest
  ): Promise<VisionAnalysisResponse> {
    const adapter = this.adapters.get(provider);

    if (!adapter) {
      throw new VisionProviderError(
        `Provider ${provider} is not configured`,
        provider,
        'unknown',
        false
      );
    }

    const fullRequest: VisionAnalysisRequest = {
      ...request,
      detailPolicy: request.detailPolicy || this.config.defaultDetailPolicy,
      maxTokens: request.maxTokens || this.config.defaultMaxTokens,
    };

    return adapter.analyzeImages(fullRequest);
  }
}

// Singleton instance for shared use
let defaultFactory: VisionProviderFactory | null = null;

export function getVisionFactory(): VisionProviderFactory {
  if (!defaultFactory) {
    defaultFactory = new VisionProviderFactory();
  }
  return defaultFactory;
}

/**
 * Helper function to normalize image data from various input formats
 * Accepts: data URLs, raw base64, or VisionImage objects
 */
export function normalizeImageInput(
  input: string | VisionImage | Array<string | VisionImage>
): VisionImage[] {
  const inputs = Array.isArray(input) ? input : [input];

  return inputs.map((item, index) => {
    if (typeof item === 'string') {
      // String input - could be data URL or raw base64
      const { data, mimeType } = extractBase64FromDataUrl(item);
      return {
        data_base64: data,
        mime_type: mimeType,
        filename: `image_${index + 1}`,
      };
    } else {
      // Already a VisionImage object
      return item;
    }
  });
}

/**
 * Convenience function for quick image analysis
 */
export async function analyzeImages(
  images: string | VisionImage | Array<string | VisionImage>,
  prompt: string,
  options?: Partial<VisionAnalysisRequest>
): Promise<VisionAnalysisResponse> {
  const factory = getVisionFactory();
  const normalizedImages = normalizeImageInput(images);

  return factory.analyzeImages({
    images: normalizedImages,
    prompt,
    ...options,
  });
}
