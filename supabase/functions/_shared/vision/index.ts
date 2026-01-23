/**
 * Vision Provider Module
 *
 * Unified interface for image analysis across multiple AI providers.
 *
 * Usage:
 * ```typescript
 * import { analyzeImages, getVisionFactory, normalizeImageInput } from '../_shared/vision/index.ts';
 *
 * // Quick analysis with automatic fallback
 * const result = await analyzeImages(imageDataUrl, "Describe this image in detail");
 *
 * // With options
 * const result = await analyzeImages(
 *   [image1, image2],
 *   "Compare these two images",
 *   { detailPolicy: 'high', maxTokens: 4000 }
 * );
 *
 * // Using factory directly for more control
 * const factory = getVisionFactory();
 * const result = await factory.analyzeImagesWithProvider('openai', request);
 * ```
 */

// Types
export type {
  VisionImage,
  DetailPolicy,
  VisionAnalysisRequest,
  VisionAnalysisResponse,
  VisionProvider,
  VisionProviderAdapter,
  VisionProviderConfig,
  VisionConfig,
  AllowedMimeType,
} from './types.ts';

export {
  VisionProviderError,
  ALLOWED_MIME_TYPES,
  extractBase64FromDataUrl,
  buildDataUrl,
  detectMimeType,
  decideVisionDetail,
  validateMimeType,
  isAllowedMimeType,
  validateVisionImage,
  validateVisionImages,
} from './types.ts';

// Config
export type { ModelRoutingTable } from './config.ts';

export {
  getDefaultVisionConfig,
  loadVisionConfigFromEnv,
  VISION_PRESETS,
  DEFAULT_ROUTING_TABLE,
  CHEAP_ROUTING_TABLE,
  getRoutingTableForProject,
  loadRoutingTableFromEnv,
} from './config.ts';

// Logging
export type { VisionLogEntry } from './logging.ts';

export {
  createVisionLogEntry,
  addResponseToLog,
  addTraitAnalyzerToLog,
  addErrorToLog,
  logVisionOperation,
  summarizeVisionOperation,
  VisionLogger,
} from './logging.ts';

// Factory
export {
  VisionProviderFactory,
  getVisionFactory,
  normalizeImageInput,
  analyzeImages,
} from './factory.ts';

// Individual adapters (for direct use if needed)
export { OpenAIVisionAdapter } from './adapters/openai.ts';
export { GrokVisionAdapter } from './adapters/grok.ts';
export { GeminiVisionAdapter } from './adapters/gemini.ts';
