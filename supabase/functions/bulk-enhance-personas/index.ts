import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { generateKnowledgeDomains } from "../_shared/knowledgeDomains.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface BulkEnhanceRequest {
  batchSize?: number;
  targetCount?: number;
  enhanceKnowledgeDomains?: boolean;
  enhanceEducation?: boolean;
  enhanceDescriptions?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting bulk persona enhancement...');
    
    const { 
      batchSize = 10, 
      targetCount = 75,
      enhanceKnowledgeDomains = true,
      enhanceEducation = true,
      enhanceDescriptions = false
    }: BulkEnhanceRequest = await req.json();

    // Get personas missing knowledge domains
    console.log('🔍 Finding personas missing knowledge domains...');
    const { data: personas, error: fetchError } = await supabase
      .from('personas')
      .select('*')
      .is('metadata->knowledge_domains', null)
      .limit(targetCount);

    if (fetchError) {
      throw new Error(`Failed to fetch personas: ${fetchError.message}`);
    }

    if (!personas || personas.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No personas found missing knowledge domains',
        processed: 0,
        errors: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`📊 Found ${personas.length} personas missing knowledge domains`);

    const results = {
      processed: 0,
      errors: [] as string[],
      enhanced: [] as string[]
    };

    // Process in batches
    for (let i = 0; i < personas.length; i += batchSize) {
      const batch = personas.slice(i, i + batchSize);
      console.log(`🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(personas.length / batchSize)}`);

      const batchPromises = batch.map(async (persona) => {
        try {
          console.log(`✨ Enhancing ${persona.name}...`);
          
          const updates: any = {};
          let enhancementLog: string[] = [];

          // 1. Generate knowledge domains (critical fix)
          if (enhanceKnowledgeDomains) {
            try {
              const knowledgeResult = await generateKnowledgeDomains(persona);
              const existingMetadata = persona.metadata || {};
              updates.metadata = { 
                ...existingMetadata, 
                knowledge_domains: knowledgeResult.knowledge_domains 
              };
              enhancementLog.push('Added knowledge domains');
              console.log(`📚 Generated knowledge domains for ${persona.name}`);
            } catch (error) {
              console.error(`❌ Failed to generate knowledge domains for ${persona.name}:`, error);
              throw error;
            }
          }

          // 2. Add education field if missing
          if (enhanceEducation && !persona.metadata?.education && !persona.metadata?.education_level) {
            const occupation = persona.metadata?.occupation?.toLowerCase() || '';
            let education = 'High school diploma';
            
            if (occupation.includes('doctor') || occupation.includes('professor') || occupation.includes('phd')) {
              education = 'Doctorate degree';
            } else if (occupation.includes('engineer') || occupation.includes('lawyer') || occupation.includes('manager')) {
              education = 'Bachelor\'s degree';
            } else if (occupation.includes('technician') || occupation.includes('specialist')) {
              education = 'Associate degree';
            } else if (occupation.includes('warehouse') || occupation.includes('labor')) {
              education = 'High school diploma';
            }
            
            updates.metadata = {
              ...updates.metadata,
              education: education
            };
            enhancementLog.push('Added education field');
          }

          // 3. Enhance brief descriptions if requested
          if (enhanceDescriptions && (!persona.description || persona.description.length < 50)) {
            const briefDesc = `${persona.metadata?.age || 'Adult'} ${persona.metadata?.occupation || 'person'} from ${persona.metadata?.location || 'unknown location'}`;
            updates.description = briefDesc;
            enhancementLog.push('Enhanced description');
          }

          // Update the persona in database
          if (Object.keys(updates).length > 0) {
            const { error: updateError } = await supabase
              .from('personas')
              .update(updates)
              .eq('id', persona.id);

            if (updateError) {
              throw new Error(`Database update failed: ${updateError.message}`);
            }

            results.enhanced.push(`${persona.name}: ${enhancementLog.join(', ')}`);
            console.log(`✅ Enhanced ${persona.name}: ${enhancementLog.join(', ')}`);
          }

          results.processed++;

        } catch (error) {
          const errorMsg = `${persona.name}: ${error.message}`;
          results.errors.push(errorMsg);
          console.error(`❌ Failed to enhance ${persona.name}:`, error);
        }
      });

      // Wait for batch to complete
      await Promise.all(batchPromises);
      
      // Small delay between batches to avoid overwhelming the API
      if (i + batchSize < personas.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`🎉 Bulk enhancement complete! Processed: ${results.processed}, Errors: ${results.errors.length}`);

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully processed ${results.processed} personas`,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Bulk enhancement error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: 'Failed to perform bulk persona enhancement'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});