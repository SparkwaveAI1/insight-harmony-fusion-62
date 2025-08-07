
import { Persona } from '@/services/persona/types';

export interface ParallelProcessingResult {
  personaId: string;
  success: boolean;
  response?: string;
  error?: string;
}

export interface ProcessingProgress {
  total: number;
  completed: number;
  errors: number;
  inProgress: number;
}

/**
 * Process personas in parallel with controlled concurrency
 */
export interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  isOpen: boolean;
}

export interface AdaptiveConcurrencyConfig {
  initialConcurrency: number;
  maxConcurrency: number;
  minConcurrency: number;
  targetLatency: number;
  adjustmentRate: number;
}

export const processPersonasInParallel = async (
  personaIds: string[],
  sendToPersona: (personaId: string) => Promise<string>,
  onProgress?: (progress: ProcessingProgress) => void,
  maxConcurrent: number = 8,
  adaptiveConcurrency: boolean = true
): Promise<ParallelProcessingResult[]> => {
  const results: ParallelProcessingResult[] = [];
  const processing = new Set<string>();
  const circuitBreakers = new Map<string, CircuitBreakerState>();
  let completed = 0;
  let errors = 0;

  // Adaptive concurrency configuration
  const adaptiveConfig: AdaptiveConcurrencyConfig = {
    initialConcurrency: Math.min(maxConcurrent, 6),
    maxConcurrency: maxConcurrent,
    minConcurrency: 2,
    targetLatency: 5000, // 5 seconds target
    adjustmentRate: 0.1
  };

  let currentConcurrency = adaptiveConfig.initialConcurrency;
  const latencyHistory: number[] = [];

  // Function to update progress
  const updateProgress = () => {
    if (onProgress) {
      onProgress({
        total: personaIds.length,
        completed,
        errors,
        inProgress: processing.size
      });
    }
  };

  // Circuit breaker implementation
  const isCircuitOpen = (personaId: string): boolean => {
    const cb = circuitBreakers.get(personaId);
    if (!cb || !cb.isOpen) return false;
    
    // Auto-reset after 30 seconds
    if (Date.now() - cb.lastFailureTime > 30000) {
      circuitBreakers.set(personaId, { ...cb, isOpen: false, failures: 0 });
      return false;
    }
    
    return true;
  };

  const recordFailure = (personaId: string) => {
    const cb = circuitBreakers.get(personaId) || { failures: 0, lastFailureTime: 0, isOpen: false };
    cb.failures++;
    cb.lastFailureTime = Date.now();
    
    // Open circuit after 3 failures
    if (cb.failures >= 3) {
      cb.isOpen = true;
      console.warn(`🚨 Circuit breaker opened for persona ${personaId}`);
    }
    
    circuitBreakers.set(personaId, cb);
  };

  // Smart retry with jittered exponential backoff
  const retryWithBackoff = async (fn: () => Promise<string>, personaId: string, maxRetries: number = 3): Promise<string> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxRetries) throw error;
        
        // Jittered exponential backoff
        const baseDelay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        const jitter = Math.random() * 0.3 * baseDelay;
        const delay = baseDelay + jitter;
        
        console.log(`Retry ${attempt}/${maxRetries} for ${personaId} in ${Math.round(delay)}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('All retries exhausted');
  };

  // Process a single persona with timeout and circuit breaker
  const processPersona = async (personaId: string): Promise<ParallelProcessingResult> => {
    // Check circuit breaker
    if (isCircuitOpen(personaId)) {
      return {
        personaId,
        success: false,
        error: 'Circuit breaker open - persona temporarily disabled'
      };
    }

    processing.add(personaId);
    updateProgress();

    const startTime = Date.now();

    try {
      console.log(`🚀 Starting optimized processing for persona: ${personaId}`);
      
      // Add timeout wrapper
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000);
      });

      const response = await Promise.race([
        retryWithBackoff(() => sendToPersona(personaId), personaId),
        timeoutPromise
      ]);
      
      const latency = Date.now() - startTime;
      latencyHistory.push(latency);
      
      // Keep only last 10 latency measurements
      if (latencyHistory.length > 10) {
        latencyHistory.shift();
      }

      processing.delete(personaId);
      completed++;
      updateProgress();
      
      console.log(`✅ Successfully processed persona: ${personaId} (${latency}ms)`);
      return {
        personaId,
        success: true,
        response
      };
    } catch (error) {
      processing.delete(personaId);
      errors++;
      recordFailure(personaId);
      updateProgress();
      
      const latency = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Failed to process persona ${personaId} (${latency}ms):`, errorMessage);
      
      return {
        personaId,
        success: false,
        error: errorMessage
      };
    }
  };

  // Adaptive concurrency adjustment
  const adjustConcurrency = () => {
    if (!adaptiveConcurrency || latencyHistory.length < 3) return;
    
    const avgLatency = latencyHistory.reduce((a, b) => a + b, 0) / latencyHistory.length;
    
    if (avgLatency > adaptiveConfig.targetLatency && currentConcurrency > adaptiveConfig.minConcurrency) {
      currentConcurrency = Math.max(
        adaptiveConfig.minConcurrency,
        Math.floor(currentConcurrency * (1 - adaptiveConfig.adjustmentRate))
      );
      console.log(`📉 Reducing concurrency to ${currentConcurrency} (avg latency: ${Math.round(avgLatency)}ms)`);
    } else if (avgLatency < adaptiveConfig.targetLatency * 0.7 && currentConcurrency < adaptiveConfig.maxConcurrency) {
      currentConcurrency = Math.min(
        adaptiveConfig.maxConcurrency,
        Math.ceil(currentConcurrency * (1 + adaptiveConfig.adjustmentRate))
      );
      console.log(`📈 Increasing concurrency to ${currentConcurrency} (avg latency: ${Math.round(avgLatency)}ms)`);
    }
  };

  // Process personas with adaptive concurrency
  const concurrentProcessor = async () => {
    const remainingPersonas = [...personaIds];
    const activePromises = new Set<Promise<void>>();

    while (remainingPersonas.length > 0 || activePromises.size > 0) {
      // Adjust concurrency based on performance
      adjustConcurrency();

      // Start new tasks up to current concurrency limit
      while (remainingPersonas.length > 0 && activePromises.size < currentConcurrency) {
        const personaId = remainingPersonas.shift()!;
        
        const promise = processPersona(personaId).then(result => {
          results.push(result);
          activePromises.delete(promise);
        });
        
        activePromises.add(promise);
      }

      // Wait for at least one task to complete
      if (activePromises.size > 0) {
        await Promise.race(activePromises);
        // Small delay to prevent overwhelming
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
  };

  console.log(`🎯 Starting optimized parallel processing: ${personaIds.length} personas, max concurrency: ${maxConcurrent}`);
  await concurrentProcessor();
  
  const successRate = ((completed / personaIds.length) * 100).toFixed(1);
  console.log(`🏁 Parallel processing complete: ${completed}/${personaIds.length} successful (${successRate}%)`);

  return results;
};
