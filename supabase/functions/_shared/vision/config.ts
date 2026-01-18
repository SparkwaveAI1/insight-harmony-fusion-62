/**
 * Vision Provider Configuration
 *
 * Default settings for optimal image understanding.
 * Primary: OpenAI GPT-4o with detail: "high"
 * Fallback chain: OpenAI -> Gemini -> Grok
 */

import { VisionConfig, VisionProvider, DetailPolicy } from './types.ts';

/**
 * Model Routing Table
 *
 * Central configuration for vision provider routing, limits, and per-project overrides.
 */
export interface ModelRoutingTable {
  // Primary provider settings
  vision_primary_provider: VisionProvider;
  vision_primary_model: string;

  // Fallback configuration (ordered list)
  vision_fallbacks: Array<{
    provider: VisionProvider;
    model: string;
  }>;

  // Detail policy settings
  vision_detail_default: DetailPolicy;
  vision_detail_screenshot: DetailPolicy;

  // Limits
  max_images_per_question: number;
  max_image_bytes_total: number;     // Total bytes across all images
  max_image_bytes_single: number;    // Max bytes per single image

  // Cost optimization
  prefer_cheap_provider: boolean;    // For customers who want "cheapest" vs "best"

  // Project-level overrides (keyed by project_id)
  project_overrides?: Record<string, Partial<ModelRoutingTable>>;
}

/**
 * Default model routing table optimized for quality
 */
export const DEFAULT_ROUTING_TABLE: ModelRoutingTable = {
  // Primary: OpenAI GPT-4o for best general vision understanding
  vision_primary_provider: 'openai',
  vision_primary_model: 'gpt-4o',

  // Fallback chain: try these in order if primary fails
  vision_fallbacks: [
    { provider: 'gemini', model: 'gemini-2.0-flash-exp' },
    { provider: 'grok', model: 'grok-2-vision-1212' },
  ],

  // Detail policies
  vision_detail_default: 'auto',
  vision_detail_screenshot: 'high',

  // Limits
  max_images_per_question: 10,
  max_image_bytes_total: 20 * 1024 * 1024,   // 20MB total
  max_image_bytes_single: 10 * 1024 * 1024,  // 10MB per image

  // Default to best quality, not cheapest
  prefer_cheap_provider: false,
};

/**
 * Cost-optimized routing table for budget-conscious usage
 */
export const CHEAP_ROUTING_TABLE: ModelRoutingTable = {
  vision_primary_provider: 'gemini',
  vision_primary_model: 'gemini-2.0-flash-exp',

  vision_fallbacks: [
    { provider: 'grok', model: 'grok-2-vision-1212' },
    { provider: 'openai', model: 'gpt-4o-mini' },
  ],

  vision_detail_default: 'auto',
  vision_detail_screenshot: 'auto', // Lower quality for cost savings

  max_images_per_question: 5,
  max_image_bytes_total: 10 * 1024 * 1024,
  max_image_bytes_single: 5 * 1024 * 1024,

  prefer_cheap_provider: true,
};

/**
 * Get routing table for a specific project, with overrides applied
 */
export function getRoutingTableForProject(
  projectId?: string,
  baseTable: ModelRoutingTable = DEFAULT_ROUTING_TABLE
): ModelRoutingTable {
  if (!projectId || !baseTable.project_overrides?.[projectId]) {
    return baseTable;
  }

  return {
    ...baseTable,
    ...baseTable.project_overrides[projectId],
  };
}

/**
 * Load routing table from environment, with optional project overrides
 */
export function loadRoutingTableFromEnv(projectId?: string): ModelRoutingTable {
  const preferCheap = Deno.env.get('VISION_PREFER_CHEAP') === 'true';
  const baseTable = preferCheap ? CHEAP_ROUTING_TABLE : DEFAULT_ROUTING_TABLE;

  // Apply environment overrides
  const table: ModelRoutingTable = { ...baseTable };

  const primaryProvider = Deno.env.get('VISION_PRIMARY_PROVIDER');
  if (primaryProvider && isValidProvider(primaryProvider)) {
    table.vision_primary_provider = primaryProvider as VisionProvider;
  }

  const primaryModel = Deno.env.get('VISION_PRIMARY_MODEL');
  if (primaryModel) {
    table.vision_primary_model = primaryModel;
  }

  const detailDefault = Deno.env.get('VISION_DETAIL_DEFAULT');
  if (detailDefault && isValidDetailPolicy(detailDefault)) {
    table.vision_detail_default = detailDefault as DetailPolicy;
  }

  const maxImages = Deno.env.get('VISION_MAX_IMAGES_PER_QUESTION');
  if (maxImages) {
    table.max_images_per_question = parseInt(maxImages);
  }

  return getRoutingTableForProject(projectId, table);
}

// Default configuration optimized for "see like a person" on screenshots, dense text, charts
export function getDefaultVisionConfig(): VisionConfig {
  return {
    // Primary provider: OpenAI for best general vision understanding
    primaryProvider: 'openai',

    // Fallback chain: try these in order if primary fails
    fallbackChain: ['gemini', 'grok'],

    // Default to high detail for UI screenshots, charts, dense text
    // OpenAI docs explicitly support detail: low|high|auto
    defaultDetailPolicy: 'high',

    // Default max tokens for vision responses
    defaultMaxTokens: 4000,

    // Provider-specific configurations loaded from environment
    providers: {},
  };
}

// Load configuration from environment variables
export function loadVisionConfigFromEnv(): VisionConfig {
  const config = getDefaultVisionConfig();

  // Load API keys and models from environment
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  const grokKey = Deno.env.get('GROK_API_KEY');
  const geminiKey = Deno.env.get('GEMINI_API_KEY');
  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');

  // OpenAI configuration
  if (openaiKey) {
    config.providers.openai = {
      apiKey: openaiKey,
      model: Deno.env.get('OPENAI_VISION_MODEL') || 'gpt-4o',
      timeout: parseInt(Deno.env.get('OPENAI_TIMEOUT') || '60000'),
      maxRetries: parseInt(Deno.env.get('OPENAI_MAX_RETRIES') || '2'),
    };
  }

  // Grok configuration
  if (grokKey) {
    config.providers.grok = {
      apiKey: grokKey,
      model: Deno.env.get('GROK_VISION_MODEL') || 'grok-2-vision-1212',
      timeout: parseInt(Deno.env.get('GROK_TIMEOUT') || '60000'),
      maxRetries: parseInt(Deno.env.get('GROK_MAX_RETRIES') || '2'),
    };
  }

  // Gemini configuration
  if (geminiKey) {
    config.providers.gemini = {
      apiKey: geminiKey,
      model: Deno.env.get('GEMINI_VISION_MODEL') || 'gemini-2.0-flash-exp',
      timeout: parseInt(Deno.env.get('GEMINI_TIMEOUT') || '60000'),
      maxRetries: parseInt(Deno.env.get('GEMINI_MAX_RETRIES') || '2'),
    };
  }

  // Anthropic/Claude configuration (for future use)
  if (anthropicKey) {
    config.providers.anthropic = {
      apiKey: anthropicKey,
      model: Deno.env.get('ANTHROPIC_VISION_MODEL') || 'claude-sonnet-4-20250514',
      timeout: parseInt(Deno.env.get('ANTHROPIC_TIMEOUT') || '60000'),
      maxRetries: parseInt(Deno.env.get('ANTHROPIC_MAX_RETRIES') || '2'),
    };
  }

  // Override primary provider if specified
  const primaryOverride = Deno.env.get('VISION_PRIMARY_PROVIDER') as VisionProvider | undefined;
  if (primaryOverride && isValidProvider(primaryOverride)) {
    config.primaryProvider = primaryOverride;
  }

  // Override detail policy if specified
  const detailOverride = Deno.env.get('VISION_DETAIL_POLICY') as DetailPolicy | undefined;
  if (detailOverride && isValidDetailPolicy(detailOverride)) {
    config.defaultDetailPolicy = detailOverride;
  }

  return config;
}

function isValidProvider(provider: string): provider is VisionProvider {
  return ['openai', 'anthropic', 'grok', 'gemini'].includes(provider);
}

function isValidDetailPolicy(policy: string): policy is DetailPolicy {
  return ['low', 'high', 'auto'].includes(policy);
}

// Recommended configurations for different use cases
export const VISION_PRESETS = {
  // Best for UI screenshots, forms, dense text - highest fidelity
  screenshot: {
    detailPolicy: 'high' as DetailPolicy,
    maxTokens: 4000,
  },

  // Best for charts, graphs, diagrams
  chart: {
    detailPolicy: 'high' as DetailPolicy,
    maxTokens: 4000,
  },

  // Best for photos, general images - balanced
  photo: {
    detailPolicy: 'auto' as DetailPolicy,
    maxTokens: 2000,
  },

  // Cost-optimized for quick checks
  quick: {
    detailPolicy: 'low' as DetailPolicy,
    maxTokens: 1000,
  },
} as const;
