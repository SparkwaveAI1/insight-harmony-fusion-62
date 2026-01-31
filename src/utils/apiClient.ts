/**
 * API Client Utility
 * 
 * Provides a wrapper around supabase.functions.invoke() with:
 * - Configurable request timeouts (default 30s)
 * - Automatic retry with exponential backoff for transient failures
 * - Standardized error handling
 */

import { supabase } from '@/integrations/supabase/client';

export interface ApiClientOptions {
  /** Timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Base delay for exponential backoff in ms (default: 1000) */
  baseDelay?: number;
  /** Maximum delay between retries in ms (default: 10000) */
  maxDelay?: number;
  /** Whether to retry on error (default: true for transient errors) */
  retry?: boolean;
}

export interface ApiResponse<T = unknown> {
  data: T | null;
  error: ApiError | null;
  retryCount?: number;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  retryable?: boolean;
}

const DEFAULT_OPTIONS: Required<ApiClientOptions> = {
  timeout: 30000,
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  retry: true,
};

// Error codes that should trigger retry
const RETRYABLE_ERROR_CODES = [
  'NETWORK_ERROR',
  'TIMEOUT',
  'SERVICE_UNAVAILABLE',
  'INTERNAL_ERROR',
  'RATE_LIMITED', // Will retry after backoff
];

// HTTP status codes that should trigger retry
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

/**
 * Check if an error is retryable
 */
function isRetryableError(error: ApiError): boolean {
  if (error.code && RETRYABLE_ERROR_CODES.includes(error.code)) {
    return true;
  }
  if (error.status && RETRYABLE_STATUS_CODES.includes(error.status)) {
    return true;
  }
  // Network errors are retryable
  if (error.message?.toLowerCase().includes('network') ||
      error.message?.toLowerCase().includes('timeout') ||
      error.message?.toLowerCase().includes('fetch')) {
    return true;
  }
  return false;
}

/**
 * Calculate delay for exponential backoff with jitter
 */
function calculateBackoff(attempt: number, baseDelay: number, maxDelay: number): number {
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * baseDelay;
  return Math.min(exponentialDelay + jitter, maxDelay);
}

/**
 * Create a promise that rejects after timeout
 */
function createTimeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject({ message: 'Request timeout', code: 'TIMEOUT', retryable: true });
    }, ms);
  });
}

/**
 * Invoke a Supabase edge function with timeout and retry logic
 * 
 * @param functionName - Name of the edge function to invoke
 * @param body - Request body to send
 * @param options - Configuration options
 * @returns Promise with data and error
 * 
 * @example
 * ```ts
 * const { data, error } = await invokeFunction('v4-grok-conversation', {
 *   persona_id: 'v4_123',
 *   user_message: 'Hello!'
 * });
 * ```
 */
export async function invokeFunction<T = unknown>(
  functionName: string,
  body: Record<string, unknown>,
  options?: ApiClientOptions
): Promise<ApiResponse<T>> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: ApiError | null = null;
  let retryCount = 0;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      // Race between the actual request and timeout
      const result = await Promise.race([
        supabase.functions.invoke(functionName, { body }),
        createTimeout(opts.timeout),
      ]);

      // Handle Supabase function response
      if ('data' in result && 'error' in result) {
        if (result.error) {
          const apiError: ApiError = {
            message: result.error.message || 'Unknown error',
            code: result.error.name || 'FUNCTION_ERROR',
            status: result.error.status,
            retryable: false,
          };

          // Check if error is retryable
          if (opts.retry && isRetryableError(apiError) && attempt < opts.maxRetries) {
            lastError = apiError;
            retryCount = attempt + 1;
            const delay = calculateBackoff(attempt, opts.baseDelay, opts.maxDelay);
            console.warn(`[apiClient] Retry ${retryCount}/${opts.maxRetries} for ${functionName} after ${delay}ms:`, apiError.message);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }

          return { data: null, error: apiError, retryCount };
        }

        // Check for error in response body (some functions return success: false)
        if (result.data && typeof result.data === 'object' && 'success' in result.data) {
          const responseData = result.data as { success: boolean; error?: string; [key: string]: unknown };
          if (!responseData.success && responseData.error) {
            const apiError: ApiError = {
              message: responseData.error,
              code: 'FUNCTION_RETURNED_ERROR',
              retryable: false,
            };
            return { data: null, error: apiError, retryCount };
          }
        }

        return { data: result.data as T, error: null, retryCount };
      }

      // Unexpected response shape
      return {
        data: null,
        error: { message: 'Unexpected response format', code: 'INVALID_RESPONSE' },
        retryCount,
      };

    } catch (error) {
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : String(error),
        code: (error as ApiError).code || 'UNKNOWN_ERROR',
        retryable: (error as ApiError).retryable ?? false,
      };

      // Check if error is retryable
      if (opts.retry && isRetryableError(apiError) && attempt < opts.maxRetries) {
        lastError = apiError;
        retryCount = attempt + 1;
        const delay = calculateBackoff(attempt, opts.baseDelay, opts.maxDelay);
        console.warn(`[apiClient] Retry ${retryCount}/${opts.maxRetries} for ${functionName} after ${delay}ms:`, apiError.message);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      return { data: null, error: apiError, retryCount };
    }
  }

  // All retries exhausted
  return {
    data: null,
    error: lastError || { message: 'All retry attempts failed', code: 'MAX_RETRIES_EXCEEDED' },
    retryCount,
  };
}

/**
 * Convenience wrapper for conversation API calls (longer timeout)
 */
export async function invokeConversation<T = unknown>(
  body: Record<string, unknown>
): Promise<ApiResponse<T>> {
  return invokeFunction<T>('v4-grok-conversation', body, {
    timeout: 60000, // 60s for conversations (can be slow with images)
    maxRetries: 2,
  });
}

/**
 * Convenience wrapper for persona creation calls
 */
export async function invokePersonaCreation<T = unknown>(
  stage: 1 | 2 | 3 | 'unified',
  body: Record<string, unknown>
): Promise<ApiResponse<T>> {
  const functionName = stage === 'unified' 
    ? 'v4-persona-unified' 
    : `v4-persona-call${stage}`;
  
  return invokeFunction<T>(functionName, body, {
    timeout: 120000, // 2min for persona creation (heavy LLM calls)
    maxRetries: 2,
  });
}

/**
 * Convenience wrapper for billing operations (shorter timeout, more retries)
 */
export async function invokeBilling<T = unknown>(
  functionName: 'billing-checkout-subscription' | 'billing-checkout-credit-pack',
  body: Record<string, unknown>
): Promise<ApiResponse<T>> {
  return invokeFunction<T>(functionName, body, {
    timeout: 15000, // 15s for billing (should be fast)
    maxRetries: 2,
  });
}

/**
 * Convenience wrapper for search operations
 */
export async function invokeSearch<T = unknown>(
  functionName: string,
  body: Record<string, unknown>
): Promise<ApiResponse<T>> {
  return invokeFunction<T>(functionName, body, {
    timeout: 20000, // 20s for search
    maxRetries: 1, // Light retry for search
  });
}

export default {
  invoke: invokeFunction,
  conversation: invokeConversation,
  personaCreation: invokePersonaCreation,
  billing: invokeBilling,
  search: invokeSearch,
};
