
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
export const processPersonasInParallel = async (
  personaIds: string[],
  sendToPersona: (personaId: string) => Promise<string>,
  onProgress?: (progress: ProcessingProgress) => void,
  maxConcurrent: number = 3
): Promise<ParallelProcessingResult[]> => {
  const results: ParallelProcessingResult[] = [];
  const processing = new Set<string>();
  let completed = 0;
  let errors = 0;

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

  // Process a single persona
  const processPersona = async (personaId: string): Promise<ParallelProcessingResult> => {
    processing.add(personaId);
    updateProgress();

    try {
      console.log(`Starting parallel processing for persona: ${personaId}`);
      const response = await sendToPersona(personaId);
      
      processing.delete(personaId);
      completed++;
      updateProgress();
      
      console.log(`Successfully processed persona: ${personaId}`);
      return {
        personaId,
        success: true,
        response
      };
    } catch (error) {
      processing.delete(personaId);
      errors++;
      updateProgress();
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to process persona ${personaId}:`, errorMessage);
      
      return {
        personaId,
        success: false,
        error: errorMessage
      };
    }
  };

  // Process personas in batches with controlled concurrency
  const processBatch = async (batch: string[]) => {
    const promises = batch.map(processPersona);
    const batchResults = await Promise.all(promises);
    results.push(...batchResults);
  };

  // Split personas into batches
  for (let i = 0; i < personaIds.length; i += maxConcurrent) {
    const batch = personaIds.slice(i, i + maxConcurrent);
    await processBatch(batch);
    
    // Small delay between batches to avoid overwhelming the system
    if (i + maxConcurrent < personaIds.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return results;
};
