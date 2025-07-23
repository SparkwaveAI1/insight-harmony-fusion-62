import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { survey_session_id, user_id } = await req.json();

    console.log(`Compiling insights for survey session: ${survey_session_id}`);

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all survey responses for this session
    const { data: responses, error: responsesError } = await supabase
      .from('research_survey_responses')
      .select('*')
      .eq('session_id', survey_session_id)
      .order('question_index', { ascending: true });

    if (responsesError) {
      throw new Error(`Failed to fetch responses: ${responsesError.message}`);
    }

    if (!responses || responses.length === 0) {
      console.log('No responses found for session');
      return new Response(JSON.stringify({
        insights: {
          summary: 'No responses were recorded for this survey.',
          themes: [],
          contradictions: [],
          persona_highlights: [],
          methodology_notes: 'Survey completed but no responses collected.'
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch survey details
    const { data: sessionData, error: sessionError } = await supabase
      .from('research_survey_sessions')
      .select(`
        research_surveys(name, description),
        research_context
      `)
      .eq('id', survey_session_id)
      .single();

    // Group responses by persona and question
    const responsesByPersona = new Map();
    const responsesByQuestion = new Map();
    
    responses.forEach(response => {
      // Group by persona
      if (!responsesByPersona.has(response.persona_id)) {
        responsesByPersona.set(response.persona_id, []);
      }
      responsesByPersona.get(response.persona_id).push(response);
      
      // Group by question
      if (!responsesByQuestion.has(response.question_index)) {
        responsesByQuestion.set(response.question_index, []);
      }
      responsesByQuestion.get(response.question_index).push(response);
    });

    // Prepare data for AI analysis
    let analysisPrompt = `You are a research analyst tasked with analyzing survey responses from multiple personas. 

SURVEY DETAILS:
- Name: ${sessionData?.research_surveys?.name || 'Unknown Survey'}
- Description: ${sessionData?.research_surveys?.description || 'No description provided'}
- Total Personas: ${responsesByPersona.size}
- Total Questions: ${responsesByQuestion.size}
- Total Responses: ${responses.length}

`;

    if (sessionData?.research_context) {
      analysisPrompt += `RESEARCH CONTEXT:
${sessionData.research_context.summary || 'No context summary available'}

`;
    }

    analysisPrompt += `SURVEY RESPONSES:

`;

    // Add responses organized by question
    responsesByQuestion.forEach((questionResponses, questionIndex) => {
      const firstResponse = questionResponses[0];
      analysisPrompt += `Question ${questionIndex + 1}: ${firstResponse.question_text}

Responses:
`;
      questionResponses.forEach((response, index) => {
        analysisPrompt += `Persona ${index + 1} (ID: ${response.persona_id}): ${response.response_text}

`;
      });
      analysisPrompt += `---

`;
    });

    analysisPrompt += `Your task is to analyze these responses and provide a comprehensive research report. 

Please provide a JSON response with the following structure:
{
  "summary": "A 2-3 sentence executive summary of the key findings",
  "themes": [
    {
      "title": "Theme name",
      "description": "Description of the theme",
      "supporting_quotes": ["Relevant quotes from personas"],
      "prevalence": "How common this theme was across responses"
    }
  ],
  "contradictions": [
    {
      "topic": "What the contradiction is about",
      "viewpoint_a": "First perspective",
      "viewpoint_b": "Opposing perspective", 
      "examples": ["Specific quotes showing the contradiction"]
    }
  ],
  "persona_highlights": [
    {
      "persona_id": "ID of notable persona",
      "notable_for": "What made this persona's responses interesting",
      "key_quote": "Most representative quote from this persona"
    }
  ],
  "emotional_patterns": [
    {
      "emotion": "Emotion detected",
      "context": "When this emotion appeared",
      "examples": ["Quotes showing this emotion"]
    }
  ],
  "consensus_areas": [
    {
      "topic": "Area of agreement",
      "description": "What personas generally agreed on",
      "strength": "How strong the consensus was"
    }
  ],
  "methodology_notes": "Any observations about response quality, engagement, or limitations"
}

Focus on identifying genuine patterns, contradictions, and insights that would be valuable for research purposes.`;

    console.log('Sending analysis request to OpenAI...');

    // Call OpenAI API for analysis
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert research analyst who specializes in qualitative data analysis and identifying patterns in survey responses. Always respond with valid JSON and focus on actionable insights.' 
          },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.3,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const analysisResult = data.choices[0]?.message?.content || '';

    console.log('Received analysis from OpenAI, parsing JSON...');

    // Parse the analysis result
    let insights;
    try {
      insights = JSON.parse(analysisResult);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      // Fallback structure
      insights = {
        summary: `Analysis of ${responses.length} responses from ${responsesByPersona.size} personas`,
        themes: [],
        contradictions: [],
        persona_highlights: [],
        emotional_patterns: [],
        consensus_areas: [],
        methodology_notes: 'Analysis completed but response parsing failed'
      };
    }

    // Add metadata
    insights.metadata = {
      analyzed_at: new Date().toISOString(),
      total_responses: responses.length,
      unique_personas: responsesByPersona.size,
      total_questions: responsesByQuestion.size,
      model_used: 'gpt-4.1-2025-04-14'
    };

    // Store the compiled insights
    const { data: reportData, error: insertError } = await supabase
      .from('research_reports')
      .insert({
        survey_session_id,
        user_id,
        insights
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error storing research report:', insertError);
      throw new Error(`Failed to store insights: ${insertError.message}`);
    }

    console.log('Research insights compiled and stored successfully');

    return new Response(JSON.stringify({ 
      insights,
      report_id: reportData.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in compile-research-insights function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      insights: null 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});