
export interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 4, // Increased from 3 to 4
  baseDelay: 1500, // Increased from 1000ms to 1500ms
  maxDelay: 15000, // Increased from 10000ms to 15000ms
  backoffFactor: 2
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {},
  stepName: string
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error;
  
  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`${stepName}: Retry attempt ${attempt}/${opts.maxRetries}`);
      }
      
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === opts.maxRetries) {
        console.error(`${stepName}: All retry attempts failed`);
        throw lastError;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.baseDelay * Math.pow(opts.backoffFactor, attempt),
        opts.maxDelay
      );
      
      console.warn(`${stepName}: Attempt ${attempt + 1} failed, retrying in ${delay}ms`);
      console.warn(`Error: ${lastError.message}`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}
