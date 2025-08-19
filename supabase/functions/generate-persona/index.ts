import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { corsHeaders } from "../_shared/cors.ts";
import { generatePersonaV2 } from "./personaV2Generator.ts";

// Initialize Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authentication required');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication token');
    }

    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 10) {
      throw new Error('Valid prompt required (minimum 10 characters)');
    }

    console.log('Generating PersonaV2 with full AI generator for user:', user.id);

    // Generate PersonaV2 using full AI-powered generator (includes description)
    const persona = await generatePersonaV2(prompt.trim(), user.id, supabase);

    // Check if persona name already exists and make unique if needed
    const existingPersona = await supabase
      .from('personas_v2')
      .select('name')
      .eq('name', persona.identity.name)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingPersona) {
      // Add suffix to make unique
      persona.identity.name += ` ${Date.now().toString().slice(-4)}`;
    }

    // Use AI-generated description from PersonaV2Generator, with fallback
    let description = persona.description || `${persona.identity.name} is a ${persona.identity.age}-year-old ${persona.identity.occupation} from ${persona.identity.location.city}, ${persona.identity.location.region}. ${persona.life_context.current_situation}.`;
    console.log('Using AI-generated description:', description.slice(0, 100) + '...');

    // Save to database
    const { data: savedPersona, error: saveError } = await supabase
      .from('personas_v2')
      .insert({
        persona_id: persona.id,
        user_id: user.id,
        name: persona.identity.name,
        description: description,
        persona_data: persona,
        persona_type: 'simulated',
        is_public: false
      })
      .select()
      .single();

    if (saveError) {
      console.error('Database save error:', saveError);
      throw new Error(`Failed to save persona: ${saveError.message}`);
    }

    return new Response(JSON.stringify({
      success: true,
      persona: savedPersona,
      metadata: {
        generationStages: 8,
        format: "PersonaV2",
        ai_generated: true,
        description_generated: true
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Persona generation error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      step: 'generation'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});