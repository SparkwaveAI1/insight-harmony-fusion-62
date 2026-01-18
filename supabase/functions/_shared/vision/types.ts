/**
 * Vision Provider Abstraction Layer
 *
 * Unified interface for image analysis across multiple AI providers.
 * Enables A/B testing, model swapping, and clean fallbacks.
 */

// Allowed MIME types (matches Claude's accepted list for cross-provider compatibility)
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export type AllowedMimeType = typeof ALLOWED_MIME_TYPES[number];

// Input types
export interface VisionImage {
  data_base64: string;          // Base64 encoded image data (without data URL prefix)
  mime_type: AllowedMimeType;   // Must be one of the allowed types
  filename?: string;            // Optional filename for logging/debugging
  size_bytes?: number;          // Optional size for validation
  width?: number;               // Optional width in pixels (for detail policy decisions)
  height?: number;              // Optional height in pixels (for detail policy decisions)
}

export type DetailPolicy = 'low' | 'high' | 'auto';

// Keywords that trigger high detail mode
const HIGH_DETAIL_PROMPT_KEYWORDS = [
  'what does this say',
  'read the text',
  'what button',
  'terms',
  'price',
  'chart',
  'graph',
  'table',
  'screenshot',
  'ui',
  'interface',
  'form',
  'menu',
  'dialog',
  'error message',
  'code',
  'terminal',
  'console',
  'spreadsheet',
  'receipt',
  'invoice',
  'label',
  'sign',
  'caption',
  'subtitle',
];

// Filename patterns that indicate screenshots/UI
const HIGH_DETAIL_FILENAME_PATTERNS = [
  /screenshot/i,
  /screen/i,
  /\bui\b/i,
  /chart/i,
  /graph/i,
  /table/i,
  /form/i,
  /dialog/i,
  /menu/i,
  /capture/i,
  /snap/i,
];

/**
 * Decides the optimal detail policy based on image characteristics and prompt content.
 *
 * Returns 'high' when:
 * - Filename includes screenshot, screen, ui, chart
 * - MIME is PNG and dimensions are large (>1000px)
 * - User prompt includes text-reading or UI-related keywords
 *
 * Otherwise returns 'auto'
 */
export function decideVisionDetail(
  images: VisionImage[],
  questionText: string
): DetailPolicy {
  const promptLower = questionText.toLowerCase();

  // Check prompt for high-detail keywords
  for (const keyword of HIGH_DETAIL_PROMPT_KEYWORDS) {
    if (promptLower.includes(keyword)) {
      return 'high';
    }
  }

  // Check each image
  for (const image of images) {
    // Check filename patterns
    if (image.filename) {
      for (const pattern of HIGH_DETAIL_FILENAME_PATTERNS) {
        if (pattern.test(image.filename)) {
          return 'high';
        }
      }
    }

    // PNG with large dimensions likely a screenshot/UI
    if (image.mime_type === 'image/png') {
      // If dimensions available and large, use high detail
      if (image.width && image.height) {
        if (image.width > 1000 || image.height > 1000) {
          return 'high';
        }
      } else {
        // PNG without dimensions - assume it might be a screenshot
        // Check file size as proxy (>500KB likely detailed)
        if (image.size_bytes && image.size_bytes > 500 * 1024) {
          return 'high';
        }
      }
    }
  }

  return 'auto';
}

export interface VisionAnalysisRequest {
  images: VisionImage[];
  prompt: string;
  detailPolicy?: DetailPolicy;  // Defaults to 'high' for optimal understanding
  jsonSchema?: object;          // Optional JSON schema for structured output
  maxTokens?: number;           // Max response tokens (default: 4000)
  temperature?: number;         // Response temperature (default: 0.7)
}

// Output types
export interface VisionAnalysisResponse {
  image_readout_json?: object;  // Structured output if jsonSchema was provided
  raw_text: string;             // Raw text response from the model
  provider: VisionProvider;     // Which provider was used
  model: string;                // Which model was used
  processingTimeMs?: number;    // How long the analysis took
  imageCount: number;           // Number of images processed
}

export type VisionProvider = 'openai' | 'anthropic' | 'grok' | 'gemini';

// Provider adapter interface
export interface VisionProviderAdapter {
  readonly provider: VisionProvider;
  readonly supportedModels: string[];
  readonly defaultModel: string;

  analyzeImages(request: VisionAnalysisRequest): Promise<VisionAnalysisResponse>;

  // Health check for fallback logic
  isAvailable(): Promise<boolean>;
}

// Configuration types
export interface VisionProviderConfig {
  apiKey: string;
  model?: string;               // Override default model
  timeout?: number;             // Request timeout in ms
  maxRetries?: number;          // Number of retries on failure
}

export interface VisionConfig {
  primaryProvider: VisionProvider;
  fallbackChain: VisionProvider[];
  defaultDetailPolicy: DetailPolicy;
  defaultMaxTokens: number;
  providers: Partial<Record<VisionProvider, VisionProviderConfig>>;
}

// Error types
export class VisionProviderError extends Error {
  constructor(
    message: string,
    public readonly provider: VisionProvider,
    public readonly model: string,
    public readonly isRetryable: boolean = false,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'VisionProviderError';
  }
}

// Utility functions

/**
 * Validates that a MIME type is in the allowed list.
 * Returns the validated type or throws an error.
 */
export function validateMimeType(mimeType: string): AllowedMimeType {
  const normalized = mimeType.toLowerCase().trim();

  if (ALLOWED_MIME_TYPES.includes(normalized as AllowedMimeType)) {
    return normalized as AllowedMimeType;
  }

  throw new VisionProviderError(
    `Invalid MIME type: ${mimeType}. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
    'openai', // Default provider for validation errors
    'unknown',
    false
  );
}

/**
 * Checks if a MIME type is allowed without throwing.
 */
export function isAllowedMimeType(mimeType: string): mimeType is AllowedMimeType {
  return ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase().trim() as AllowedMimeType);
}

export function extractBase64FromDataUrl(dataUrl: string): { data: string; mimeType: AllowedMimeType } {
  if (!dataUrl.startsWith('data:')) {
    // Already raw base64, detect the actual type
    const detectedType = detectMimeType(dataUrl);
    return { data: dataUrl, mimeType: validateMimeType(detectedType) };
  }

  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid data URL format');
  }

  return {
    mimeType: validateMimeType(match[1]),
    data: match[2]
  };
}

export function buildDataUrl(base64: string, mimeType: AllowedMimeType): string {
  if (base64.startsWith('data:')) {
    return base64; // Already a data URL
  }
  return `data:${mimeType};base64,${base64}`;
}

export function detectMimeType(base64OrDataUrl: string): AllowedMimeType {
  // Check if it's a data URL
  if (base64OrDataUrl.startsWith('data:')) {
    const match = base64OrDataUrl.match(/^data:([^;]+);/);
    const detected = match?.[1] || 'image/jpeg';
    return isAllowedMimeType(detected) ? detected : 'image/jpeg';
  }

  // Try to detect from base64 magic bytes
  try {
    const decoded = atob(base64OrDataUrl.slice(0, 16));
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i);
    }

    // JPEG: starts with FF D8 FF
    if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
      return 'image/jpeg';
    }

    // PNG: starts with 89 50 4E 47
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
      return 'image/png';
    }

    // WebP: starts with RIFF....WEBP
    if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
      return 'image/webp';
    }

    // GIF: starts with GIF87a or GIF89a
    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
      return 'image/gif';
    }
  } catch {
    // If base64 decoding fails, default to JPEG
  }

  // Default to JPEG if unknown
  return 'image/jpeg';
}

/**
 * Validates a VisionImage, ensuring MIME type is correct and detecting if needed.
 */
export function validateVisionImage(image: Partial<VisionImage> & { data_base64: string }): VisionImage {
  // Detect MIME type if not provided or validate if provided
  const detectedMime = detectMimeType(image.data_base64);
  const mimeType = image.mime_type
    ? validateMimeType(image.mime_type)
    : detectedMime;

  // Calculate size if not provided
  const sizeBytes = image.size_bytes ?? Math.ceil(image.data_base64.length * 0.75);

  return {
    data_base64: image.data_base64,
    mime_type: mimeType,
    filename: image.filename,
    size_bytes: sizeBytes,
    width: image.width,
    height: image.height,
  };
}

/**
 * Validates an array of images, filtering out invalid ones and logging warnings.
 */
export function validateVisionImages(
  images: Array<Partial<VisionImage> & { data_base64: string }>
): VisionImage[] {
  const validImages: VisionImage[] = [];

  for (let i = 0; i < images.length; i++) {
    try {
      validImages.push(validateVisionImage(images[i]));
    } catch (error) {
      console.warn(`Image ${i + 1} validation failed:`, error instanceof Error ? error.message : error);
    }
  }

  return validImages;
}
