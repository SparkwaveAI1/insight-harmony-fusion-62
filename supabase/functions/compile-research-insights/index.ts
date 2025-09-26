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

    // Fetch survey details and research context
    const { data: sessionData, error: sessionError } = await supabase
      .from('research_survey_sessions')
      .select(`
        research_surveys(name, description, questions, project_id),
        research_context,
        selected_personas
      `)
      .eq('id', survey_session_id)
      .single();

    if (sessionError) {
      throw new Error(`Failed to fetch session data: ${sessionError.message}`);
    }

    // Fetch persona details for context
    const { data: personaData, error: personaError } = await supabase
      .from('v4_personas')
      .select('persona_id, name, full_profile')
      .in('persona_id', sessionData?.selected_personas || []);

    if (personaError) {
      console.warn('Could not fetch persona details:', personaError.message);
    }

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

    // Prepare enhanced qualitative analysis prompt
    let analysisPrompt = `You are an expert qualitative research analyst conducting a comprehensive analysis of survey responses from multiple research personas. Your task is to provide deep insights that connect responses back to the original research objectives and context.

## SURVEY OVERVIEW
**Study Name:** ${sessionData?.research_surveys?.name || 'Research Study'}
**Study Description:** ${sessionData?.research_surveys?.description || 'No description provided'}
**Research Scope:** ${responsesByPersona.size} unique personas, ${responsesByQuestion.size} questions, ${responses.length} total responses

## RESEARCH OBJECTIVES & CONTEXT`;

    if (sessionData?.research_context) {
      const context = sessionData.research_context;
      analysisPrompt += `
**Research Summary:** ${context.summary || 'No summary available'}

**Key Research Guidelines:**
${context.guidelines ? context.guidelines.map((g: string) => `- ${g}`).join('\n') : '- No specific guidelines provided'}

**Key Insights from Source Documents:**
${context.key_insights ? context.key_insights.map((insight: string) => `- ${insight}`).join('\n') : '- No document insights available'}

**Document Summaries:**
${context.document_summaries ? context.document_summaries.map((doc: any) => `- ${doc.title}: ${doc.summary}`).join('\n') : '- No document summaries available'}
`;
    } else {
      analysisPrompt += `
**No research context provided - conducting analysis based solely on survey responses**
`;
    }

    // Add persona context if available
    if (personaData && personaData.length > 0) {
      analysisPrompt += `

## PERSONA PROFILES
`;
      personaData.forEach((persona: any) => {
        const basicInfo = persona.full_profile?.metadata || {};
        const traits = persona.full_profile?.trait_profile || {};
        analysisPrompt += `**${persona.name}** (ID: ${persona.persona_id})
- Demographics: Age ${basicInfo.age || 'Unknown'}, ${basicInfo.location || 'Unknown location'}
- Background: ${basicInfo.occupation || 'Unknown occupation'}
- Key Traits: ${traits.big_five ? Object.entries(traits.big_five).map(([trait, score]: [string, any]) => `${trait}=${score}`).join(', ') : 'No trait data'}

`;
      });
    }

    analysisPrompt += `

## SURVEY QUESTIONS & RESPONSES
`;

    // Add responses organized by question with enhanced context
    responsesByQuestion.forEach((questionResponses, questionIndex) => {
      const firstResponse = questionResponses[0];
      const question = sessionData?.research_surveys?.questions?.[questionIndex] || {};
      
      analysisPrompt += `
**Question ${questionIndex + 1}:** ${firstResponse.question_text}
${question.context ? `*Question Context:* ${question.context}` : ''}

**Responses:**
`;
      questionResponses.forEach((response) => {
        const persona = personaData?.find((p: any) => p.persona_id === response.persona_id);
        const personaName = persona?.name || `Persona-${response.persona_id.slice(-4)}`;
        analysisPrompt += `
• **${personaName}:** "${response.response_text}"
`;
      });
      analysisPrompt += `
---
`;
    });

    analysisPrompt += `

## ANALYSIS INSTRUCTIONS

As a qualitative research analyst, conduct a comprehensive thematic analysis following established qualitative research methodologies:

### 1. RESEARCH OBJECTIVE ALIGNMENT
Connect findings directly to the stated research objectives and document insights. Evaluate how well the responses address the core research questions.

### 2. THEMATIC ANALYSIS
Apply systematic coding to identify patterns, themes, and sub-themes across responses. Look for:
- Recurring concepts and meanings
- Relationships between themes
- Contextual factors influencing responses
- Cultural, social, or psychological patterns

### 3. COMPARATIVE ANALYSIS
Examine differences and similarities across persona types, considering their demographic and psychological profiles.

### 4. BEHAVIORAL INSIGHTS
Leverage persona trait data to explain response patterns and predict potential real-world behaviors.

### 5. DOCUMENT CORRELATION
When research context is available, explicitly connect findings back to source documents and original research materials.

Please provide a comprehensive qualitative research report in JSON format:

{
  "executive_summary": {
    "key_findings": "2-3 sentence overview of most significant discoveries",
    "research_objective_fulfillment": "How well the study addressed its stated objectives",
    "actionable_insights": "Primary recommendations for decision-makers"
  },
  "thematic_analysis": {
    "primary_themes": [
      {
        "theme_name": "Main theme title",
        "description": "Detailed explanation of the theme",
        "prevalence": "Frequency across responses (e.g., '75% of personas')",
        "supporting_evidence": ["Direct quotes supporting this theme"],
        "sub_themes": ["Related sub-patterns within this theme"],
        "implications": "What this means for the research objectives",
        "document_connection": "How this relates to source materials (if applicable)"
      }
    ],
    "emergent_themes": [
      {
        "theme_name": "Unexpected theme that emerged",
        "description": "Why this was surprising or significant",
        "supporting_evidence": ["Key quotes"],
        "research_value": "Why this matters for the study"
      }
    ]
  },
  "behavioral_insights": {
    "personality_driven_patterns": [
      {
        "trait_correlation": "Which personality traits influenced responses",
        "behavioral_prediction": "Predicted real-world behaviors",
        "examples": ["Specific instances showing trait influence"]
      }
    ],
    "demographic_influences": [
      {
        "demographic_factor": "Age, location, occupation, etc.",
        "response_pattern": "How this factor shaped responses",
        "implications": "What this suggests about target audiences"
      }
    ]
  },
  "consensus_and_divergence": {
    "strong_consensus": [
      {
        "topic": "Area of unanimous or near-unanimous agreement",
        "description": "What personas agreed on",
        "consensus_strength": "Percentage/level of agreement",
        "quotes": ["Representative quotes showing consensus"]
      }
    ],
    "polarizing_topics": [
      {
        "topic": "Issue that divided responses",
        "viewpoint_a": {
          "position": "First perspective",
          "supporting_personas": "Which types of personas held this view",
          "quotes": ["Quotes supporting this position"]
        },
        "viewpoint_b": {
          "position": "Opposing perspective", 
          "supporting_personas": "Which types of personas held this view",
          "quotes": ["Quotes supporting this position"]
        },
        "underlying_factors": "Why personas differed (traits, demographics, etc.)"
      }
    ]
  },
  "emotional_landscape": {
    "dominant_emotions": [
      "Primary emotion detected in responses with brief explanation"
    ],
    "emotional_journey": "How emotions evolved across questions or topics"
  },
  "research_quality_assessment": {
    "response_authenticity": "Assessment of how realistic/genuine responses seemed",
    "engagement_levels": "How invested personas appeared in the topic",
    "data_saturation": "Whether enough diverse perspectives were captured",
    "limitations": "Any constraints or biases identified",
    "recommendations": "Suggestions for future research improvements"
  },
  "actionable_recommendations": [
    "Specific actionable recommendation based on findings"
  ]
}

Focus on providing deep, contextual insights that would be valuable for research, product development, policy making, or strategic decision-making. Ensure all findings are grounded in the actual response data while connecting to broader research objectives.`;

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
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const analysisResult = data.choices[0]?.message?.content || '';

    console.log('Received analysis from OpenAI, parsing JSON...');
    console.log('Raw OpenAI response length:', analysisResult.length);
    console.log('First 200 chars:', analysisResult.substring(0, 200));

    // Extract JSON from markdown code blocks if present
    function extractJSONFromMarkdown(text: string): string {
      // Remove markdown code blocks if present
      const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
      const match = text.match(codeBlockRegex);
      
      if (match) {
        console.log('Found JSON in markdown code blocks');
        return match[1].trim();
      }
      
      // Try to find JSON-like content between { and }
      const jsonRegex = /(\{[\s\S]*\})/;
      const jsonMatch = text.match(jsonRegex);
      
      if (jsonMatch) {
        console.log('Found JSON-like content without code blocks');
        return jsonMatch[1].trim();
      }
      
      console.log('No JSON structure found, returning original text');
      return text.trim();
    }

    // Parse the analysis result
    let insights;
    try {
      const cleanedResult = extractJSONFromMarkdown(analysisResult);
      console.log('Attempting to parse cleaned JSON, length:', cleanedResult.length);
      insights = JSON.parse(cleanedResult);
      console.log('Successfully parsed OpenAI response');
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      console.error('Failed content preview:', analysisResult.substring(0, 500));
      // Fallback structure matching new format
      insights = {
        executive_summary: {
          key_findings: `Analysis of ${responses.length} responses from ${responsesByPersona.size} personas`,
          research_objective_fulfillment: 'Unable to assess due to analysis parsing error',
          actionable_insights: 'Analysis completed but response parsing failed'
        },
        thematic_analysis: {
          primary_themes: [],
          emergent_themes: []
        },
        behavioral_insights: {
          personality_driven_patterns: [],
          demographic_influences: []
        },
        consensus_and_divergence: {
          strong_consensus: [],
          polarizing_topics: []
        },
        emotional_landscape: {
          dominant_emotions: [],
          emotional_journey: 'Unable to analyze due to parsing error'
        },
        research_quality_assessment: {
          response_authenticity: 'Unable to assess',
          engagement_levels: 'Unable to assess',
          data_saturation: 'Unable to assess',
          limitations: 'Analysis parsing failed',
          recommendations: 'Retry analysis with adjusted parameters'
        },
        actionable_recommendations: []
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