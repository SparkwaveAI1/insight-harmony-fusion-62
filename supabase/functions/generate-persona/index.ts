import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  console.log("🚀 Generate-persona function called");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    console.log("📝 User prompt received:", prompt);

    if (!openAIApiKey) {
      console.error("❌ OpenAI API key not found");
      return new Response(JSON.stringify({ 
        success: false, 
        error: "OpenAI API key not configured" 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Basic persona generation using OpenAI
    console.log("🤖 Calling OpenAI API...");
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a persona generation AI. Create a detailed, realistic persona based on the user's prompt. 

Return a JSON object with this structure:
{
  "persona_id": "persona-[random-6-chars]",
  "name": "Full Name",
  "metadata": {
    "age": number,
    "location": "City, State/Country",
    "occupation": "Job Title",
    "education": "Education Level",
    "income": "Income Range"
  },
  "persona_data": {
    "identity": {
      "name": "Full Name",
      "age": number,
      "location": {
        "city": "City",
        "region": "State/Province", 
        "country": "Country"
      },
      "occupation": "Job Title",
      "education": "Education Level",
      "background": "Brief background paragraph"
    },
    "trait_profile": {
      "big_five": {
        "openness": number_0_to_1,
        "conscientiousness": number_0_to_1,
        "extraversion": number_0_to_1,
        "agreeableness": number_0_to_1,
        "neuroticism": number_0_to_1
      }
    }
  },
  "description": "A brief summary paragraph of this persona"
}

Make the persona realistic and detailed. Use the exact structure above.`
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      console.error("❌ OpenAI API error:", response.status, response.statusText);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `OpenAI API error: ${response.statusText}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log("✅ OpenAI response received");
    
    let personaData;
    try {
      personaData = JSON.parse(data.choices[0].message.content);
      console.log("✅ Persona data parsed:", personaData.name);
    } catch (parseError) {
      console.error("❌ Error parsing persona JSON:", parseError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Failed to parse generated persona data" 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log("✅ Persona generation completed successfully");
    return new Response(JSON.stringify({ 
      success: true, 
      persona: personaData 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in generate-persona function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});