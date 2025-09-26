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
  enhanceDemographics?: boolean;
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
      enhanceDescriptions = false,
      enhanceDemographics = true
    }: BulkEnhanceRequest = await req.json();

    // Get personas missing required demographic metadata or knowledge domains
    console.log('🔍 Finding personas missing knowledge domains or demographic metadata...');
    
    let query = supabase.from('v4_personas').select('*');
    
    if (enhanceDemographics) {
      // Find personas missing required demographic fields
      query = query.or('metadata->race_ethnicity.is.null,metadata->employment_type.is.null,metadata->income_level.is.null,metadata->social_class_identity.is.null,metadata->marital_status.is.null');
    } else if (enhanceKnowledgeDomains) {
      // Find personas missing knowledge domains
      query = query.is('metadata->knowledge_domains', null);
    }
    
    const { data: personas, error: fetchError } = await query.limit(targetCount);

    if (fetchError) {
      throw new Error(`Failed to fetch personas: ${fetchError.message}`);
    }

    if (!personas || personas.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No personas found missing required metadata',
        processed: 0,
        errors: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`📊 Found ${personas.length} personas missing required metadata`);

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

          // 2. Add missing demographic metadata (critical fix)
          if (enhanceDemographics) {
            try {
              const existingMetadata = persona.metadata || {};
              const demographicUpdates: any = {};
              
              // Add missing required demographic fields with defaults based on existing data
              if (!existingMetadata.race_ethnicity) {
                demographicUpdates.race_ethnicity = 'Prefer not to say';
              }
              if (!existingMetadata.employment_type) {
                demographicUpdates.employment_type = existingMetadata.occupation ? 'Full-time' : 'Unemployed';
              }
              if (!existingMetadata.income_level) {
                demographicUpdates.income_level = '$40,000-$60,000';
              }
              if (!existingMetadata.social_class_identity) {
                demographicUpdates.social_class_identity = 'Middle class';
              }
              if (!existingMetadata.marital_status) {
                demographicUpdates.marital_status = 'Single';
              }
              if (!existingMetadata.parenting_role) {
                demographicUpdates.parenting_role = 'No children';
              }
              if (!existingMetadata.relationship_history) {
                demographicUpdates.relationship_history = 'Previous relationships';
              }
              if (!existingMetadata.sexual_orientation) {
                demographicUpdates.sexual_orientation = 'Heterosexual';
              }
              if (!existingMetadata.military_service) {
                demographicUpdates.military_service = 'None';
              }
              
              if (Object.keys(demographicUpdates).length > 0) {
                updates.metadata = { 
                  ...updates.metadata,
                  ...demographicUpdates
                };
                enhancementLog.push(`Added ${Object.keys(demographicUpdates).length} demographic fields`);
                console.log(`👥 Added demographic fields for ${persona.name}: ${Object.keys(demographicUpdates).join(', ')}`);
              }
            } catch (error) {
              console.error(`❌ Failed to enhance demographics for ${persona.name}:`, error);
              throw error;
            }
          }

          // 3. Add education field if missing
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

          // 4. Enhance brief descriptions if requested
          if (enhanceDescriptions && (!persona.description || persona.description.length < 50)) {
            const briefDesc = `${persona.metadata?.age || 'Adult'} ${persona.metadata?.occupation || 'person'} from ${persona.metadata?.location || 'unknown location'}`;
            updates.description = briefDesc;
            enhancementLog.push('Enhanced description');
          }

          // Update the persona in database
          if (Object.keys(updates).length > 0) {
            const { error: updateError } = await supabase
              .from('v4_personas')
              .update({ 
                full_profile: {
                  ...persona.full_profile,
                  ...updates
                }
              })
              .eq('id', persona.id);

            if (updateError) {
              throw new Error(`Database update failed: ${updateError.message}`);
            }

            results.enhanced.push(`${persona.name}: ${enhancementLog.join(', ')}`);
            console.log(`✅ Enhanced ${persona.name}: ${enhancementLog.join(', ')}`);
          }

          results.processed++;

        } catch (error) {
          const errorMsg = `${persona.name}: ${error instanceof Error ? error.message : String(error)}`;
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
      error: error instanceof Error ? error.message : String(error),
      details: 'Failed to perform bulk persona enhancement'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});