import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MigrationResult {
  persona_id: string;
  name: string;
  status: 'success' | 'error';
  message: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { personaId, mode = 'single' } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication token');
    }

    if (mode === 'single' && !personaId) {
      throw new Error('personaId required for single migration');
    }

    // Get personas to migrate
    let query = supabase.from('personas').select('*');
    
    if (mode === 'single') {
      query = query.eq('persona_id', personaId);
    } else {
      query = query.eq('user_id', user.id);
    }

    const { data: v1Personas, error: fetchError } = await query;
    
    if (fetchError) {
      throw new Error(`Failed to fetch personas: ${fetchError.message}`);
    }

    if (!v1Personas || v1Personas.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No personas found to migrate' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    for (const v1Persona of v1Personas) {
      try {
        console.log(`Migrating persona: ${v1Persona.name} (${v1Persona.persona_id})`);
        
        // Direct conversion prompt - simple and straightforward
        const conversionPrompt = `Convert this V1 persona JSON to V2 format. Just do a reasonably good job converting from one format to another.

Here's the V1 JSON:
${JSON.stringify(v1Persona, null, 2)}

Please return the V2 JSON format. Focus on preserving the core personality, traits, and characteristics while adapting to the new structure.`;

        console.log(`Converting persona: ${v1Persona.name}`);

        // Call OpenAI directly for conversion
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are a helpful assistant that converts persona data formats. Return only valid JSON without any additional text.'
              },
              {
                role: 'user',
                content: conversionPrompt
              }
            ],
            temperature: 0.3,
            max_tokens: 4000
          }),
        });

        if (!openaiResponse.ok) {
          const errorData = await openaiResponse.json();
          throw new Error(`OpenAI API error: ${errorData.error?.message || openaiResponse.statusText}`);
        }

        const openaiData = await openaiResponse.json();
        const convertedContent = openaiData.choices[0].message.content;

        // Parse the JSON response
        let v2PersonaData;
        try {
          v2PersonaData = JSON.parse(convertedContent);
        } catch (parseError) {
          console.error('Failed to parse OpenAI response:', convertedContent);
          throw new Error('Invalid JSON returned from OpenAI');
        }

        // Save to personas_v2 table, preserving key attributes
        const v2PersonaRecord = {
          persona_id: v1Persona.persona_id, // Keep same ID
          user_id: v1Persona.user_id,
          name: v1Persona.name,
          description: v1Persona.description,
          persona_data: v2PersonaData,
          persona_type: 'humanoid',
          is_public: v1Persona.is_public || false,
          profile_image_url: v1Persona.profile_image_url
        };

        const { data: savedPersona, error: saveError } = await supabase
          .from('personas_v2')
          .upsert(v2PersonaRecord)
          .select()
          .single();

        if (saveError) {
          throw new Error(`Failed to save PersonaV2: ${saveError.message}`);
        }

        results.push({
          persona_id: v1Persona.persona_id,
          name: v1Persona.name,
          status: 'success',
          message: 'Successfully converted and migrated to PersonaV2'
        });

        console.log(`Successfully migrated: ${v1Persona.name}`);

      } catch (error) {
        console.error(`Failed to migrate persona ${v1Persona.name}:`, error);
        results.push({
          persona_id: v1Persona.persona_id,
          name: v1Persona.name,
          status: 'error',
          message: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: `Migration completed`,
        results,
        total: v1Personas.length,
        successful: results.filter(r => r.status === 'success').length,
        failed: results.filter(r => r.status === 'error').length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Migration error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});