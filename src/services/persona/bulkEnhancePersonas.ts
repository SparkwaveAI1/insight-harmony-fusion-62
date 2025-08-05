import { supabase } from "@/integrations/supabase/client";

export interface BulkEnhanceOptions {
  batchSize?: number;
  targetCount?: number;
  enhanceKnowledgeDomains?: boolean;
  enhanceEducation?: boolean;
  enhanceDescriptions?: boolean;
}

export interface BulkEnhanceResult {
  success: boolean;
  processed?: number;
  errors?: string[];
  enhanced?: string[];
  message?: string;
  error?: string;
}

export const bulkEnhancePersonas = async (
  options: BulkEnhanceOptions = {}
): Promise<BulkEnhanceResult> => {
  try {
    console.log('🚀 Starting bulk persona enhancement...');
    console.log('Options:', options);

    const { data, error } = await supabase.functions.invoke('bulk-enhance-personas', {
      body: options
    });

    if (error) {
      console.error('❌ Bulk enhancement edge function error:', error);
      return {
        success: false,
        error: error.message || 'Failed to perform bulk enhancement'
      };
    }

    if (!data.success) {
      console.error('❌ Bulk enhancement failed:', data);
      return {
        success: false,
        error: data.error || 'Bulk enhancement process failed'
      };
    }

    console.log('✅ Bulk enhancement successful:', data.results);
    return {
      success: true,
      processed: data.results?.processed || 0,
      errors: data.results?.errors || [],
      enhanced: data.results?.enhanced || [],
      message: data.message
    };

  } catch (error) {
    console.error('❌ Bulk enhancement service error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};