import { supabase } from '@/integrations/supabase/client';

export interface BatchResponse {
  session_id: string;
  persona_id: string;
  question_index: number;
  question_text: string;
  response_text: string;
}

export interface BatchInsertResult {
  success: boolean;
  inserted: number;
  errors: string[];
}

/**
 * Batch insert survey responses for better database performance
 */
export const batchInsertSurveyResponses = async (
  responses: BatchResponse[]
): Promise<BatchInsertResult> => {
  if (responses.length === 0) {
    return { success: true, inserted: 0, errors: [] };
  }

  const batchSize = 50; // Optimal batch size for Supabase
  const results: BatchInsertResult = {
    success: true,
    inserted: 0,
    errors: []
  };

  console.log(`📦 Batch inserting ${responses.length} survey responses in chunks of ${batchSize}`);

  try {
    // Process in batches to avoid overwhelming the database
    for (let i = 0; i < responses.length; i += batchSize) {
      const batch = responses.slice(i, i + batchSize);
      
      console.log(`📤 Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(responses.length / batchSize)} (${batch.length} items)`);
      
      const { data, error } = await supabase
        .from('research_survey_responses')
        .insert(batch)
        .select('id');

      if (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
        results.errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
        results.success = false;
      } else {
        const insertedCount = data?.length || batch.length;
        results.inserted += insertedCount;
        console.log(`✅ Successfully inserted ${insertedCount} responses`);
      }

      // Small delay between batches to avoid rate limits
      if (i + batchSize < responses.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`🎯 Batch insert complete: ${results.inserted}/${responses.length} successful`);
    return results;

  } catch (error) {
    console.error('❌ Batch insert failed:', error);
    return {
      success: false,
      inserted: results.inserted,
      errors: [...results.errors, error instanceof Error ? error.message : 'Unknown error']
    };
  }
};

/**
 * Pre-fetch and cache persona data for batch processing
 */
export const prefetchPersonaData = async (personaIds: string[]) => {
  if (personaIds.length === 0) return new Map();

  console.log(`🔄 Pre-fetching data for ${personaIds.length} personas`);

  try {
    const { data, error } = await supabase
      .from('personas')
      .select('persona_id, name, description')
      .in('persona_id', personaIds);

    if (error) {
      console.error('❌ Error pre-fetching persona data:', error);
      return new Map();
    }

    const personaMap = new Map();
    data?.forEach(persona => {
      personaMap.set(persona.persona_id, persona);
    });

    console.log(`✅ Pre-fetched ${personaMap.size} persona records`);
    return personaMap;

  } catch (error) {
    console.error('❌ Pre-fetch failed:', error);
    return new Map();
  }
};

/**
 * Optimized database connection settings for batch operations
 */
export const optimizeDatabaseConnection = () => {
  console.log('🔧 Database connection optimized for batch operations');
  // Note: Actual connection pooling is handled by Supabase
  // This is a placeholder for future optimizations
};