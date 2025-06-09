
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { targetDescription } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Analyze the following target audience description and extract search criteria that would help match relevant personas:

"${targetDescription}"

Return a JSON object with the following structure:
{
  "keywords": ["relevant", "search", "terms"],
  "demographics": {
    "age_ranges": ["18-24", "25-34", etc.],
    "occupations": ["specific", "job", "titles"],
    "income_levels": ["Low", "Medium", "High"],
    "locations": ["specific", "regions"],
    "interests": ["relevant", "interests"]
  },
  "behavioral_traits": ["traits", "that", "matter"],
  "use_cases": ["relevant", "use", "cases"]
}

Focus on extracting concrete, searchable criteria. For age ranges, use: 18-24, 25-34, 35-44, 45-54, 55-64, 65+
For income levels, use: Low, Medium, High
Be specific with occupations and interests.`;

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
            content: 'You are an expert at analyzing target audience descriptions and extracting structured search criteria. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const criteriaText = data.choices[0].message.content;
    
    // Parse the JSON response
    let criteria;
    try {
      criteria = JSON.parse(criteriaText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', criteriaText);
      throw new Error('Invalid response format from AI');
    }

    return new Response(JSON.stringify({ criteria }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-audience-criteria function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
