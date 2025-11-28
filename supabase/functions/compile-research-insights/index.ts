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

// Shared type for responses (works for both DB-fetched and direct-passed)
interface ResponseData {
  persona_id: string;
  question_index: number;
  question_text: string;
  response_text: string;
}

interface PersonaData {
  persona_id: string;
  name: string;
  full_profile?: any;
  summary?: string;
}

interface DirectInputData {
  responses: ResponseData[];
  personas: PersonaData[];
  questions: string[];
  study_name?: string;
  study_description?: string;
  research_context?: any;
}

// Core analysis function that can be called with either DB data or direct data
export async function generateQualitativeInsights(
  responses: ResponseData[],
  personas: PersonaData[],
  studyName: string,
  studyDescription: string,
  questions: string[],
  researchContext?: any
): Promise<any> {
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not found');
  }

  if (!responses || responses.length === 0) {
    console.log('No responses provided for analysis');
    return {
      executive_summary: {
        key_findings: 'No responses were recorded for this study.',
        research_objective_fulfillment: 'Unable to assess - no data collected',
        actionable_insights: 'Collect responses before generating insights'
      },
      thematic_analysis: { primary_themes: [], emergent_themes: [] },
      behavioral_insights: { personality_driven_patterns: [], demographic_influences: [] },
      consensus_and_divergence: { strong_consensus: [], polarizing_topics: [] },
      emotional_landscape: { dominant_emotions: [], emotional_journey: 'No data to analyze' },
      research_quality_assessment: {
        response_authenticity: 'N/A',
        engagement_levels: 'N/A',
        data_saturation: 'N/A',
        limitations: 'No responses collected',
        recommendations: 'Ensure survey completion before generating insights'
      },
      actionable_recommendations: []
    };
  }

  // Group responses by persona and question
  const responsesByPersona = new Map<string, ResponseData[]>();
  const responsesByQuestion = new Map<number, ResponseData[]>();
  
  responses.forEach(response => {
    // Group by persona
    if (!responsesByPersona.has(response.persona_id)) {
      responsesByPersona.set(response.persona_id, []);
    }
    responsesByPersona.get(response.persona_id)!.push(response);
    
    // Group by question
    if (!responsesByQuestion.has(response.question_index)) {
      responsesByQuestion.set(response.question_index, []);
    }
    responsesByQuestion.get(response.question_index)!.push(response);
  });

  // Build the analysis prompt
  let analysisPrompt = `You are an expert qualitative research analyst conducting a comprehensive analysis of survey responses from multiple research personas. Your task is to provide deep insights that connect responses back to the original research objectives and context.

## SURVEY OVERVIEW
**Study Name:** ${studyName}
**Study Description:** ${studyDescription || 'No description provided'}
**Research Scope:** ${responsesByPersona.size} unique personas, ${responsesByQuestion.size} questions, ${responses.length} total responses

## RESEARCH OBJECTIVES & CONTEXT`;

  if (researchContext) {
    analysisPrompt += `
**Research Summary:** ${researchContext.summary || 'No summary available'}

**Key Research Guidelines:**
${researchContext.guidelines ? researchContext.guidelines.map((g: string) => `- ${g}`).join('\n') : '- No specific guidelines provided'}

**Key Insights from Source Documents:**
${researchContext.key_insights ? researchContext.key_insights.map((insight: string) => `- ${insight}`).join('\n') : '- No document insights available'}
`;
  } else {
    analysisPrompt += `
**No research context provided - conducting analysis based solely on survey responses**
`;
  }

  // Add persona context
  if (personas && personas.length > 0) {
    analysisPrompt += `

## PERSONA PROFILES
`;
    personas.forEach((persona) => {
      const basicInfo = persona.full_profile?.identity || persona.full_profile?.metadata || {};
      const traits = persona.full_profile?.trait_profile || {};
      analysisPrompt += `**${persona.name}** (ID: ${persona.persona_id})
- Demographics: Age ${basicInfo.age || 'Unknown'}, ${basicInfo.location?.city || basicInfo.location?.region || basicInfo.location || 'Unknown location'}
- Background: ${basicInfo.occupation || 'Unknown occupation'}
- Summary: ${persona.summary || 'No summary available'}

`;
    });
  }

  analysisPrompt += `

## SURVEY QUESTIONS & RESPONSES
`;

  // Add responses organized by question
  responsesByQuestion.forEach((questionResponses, questionIndex) => {
    const firstResponse = questionResponses[0];
    const questionText = questions[questionIndex] || firstResponse.question_text;
    
    analysisPrompt += `
**Question ${questionIndex + 1}:** ${questionText}

**Responses:**
`;
    questionResponses.forEach((response) => {
      const persona = personas?.find((p) => p.persona_id === response.persona_id);
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

  // Extract JSON from markdown code blocks if present
  function extractJSONFromMarkdown(text: string): string {
    const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
    const match = text.match(codeBlockRegex);
    
    if (match) {
      console.log('Found JSON in markdown code blocks');
      return match[1].trim();
    }
    
    const jsonRegex = /(\{[\s\S]*\})/;
    const jsonMatch = text.match(jsonRegex);
    
    if (jsonMatch) {
      console.log('Found JSON-like content without code blocks');
      return jsonMatch[1].trim();
    }
    
    return text.trim();
  }

  // Parse the analysis result
  let insights;
  try {
    const cleanedResult = extractJSONFromMarkdown(analysisResult);
    insights = JSON.parse(cleanedResult);
    console.log('Successfully parsed OpenAI response');
  } catch (parseError) {
    console.error('Failed to parse OpenAI response as JSON:', parseError);
    // Fallback structure
    insights = {
      executive_summary: {
        key_findings: `Analysis of ${responses.length} responses from ${responsesByPersona.size} personas`,
        research_objective_fulfillment: 'Unable to assess due to analysis parsing error',
        actionable_insights: 'Analysis completed but response parsing failed'
      },
      thematic_analysis: { primary_themes: [], emergent_themes: [] },
      behavioral_insights: { personality_driven_patterns: [], demographic_influences: [] },
      consensus_and_divergence: { strong_consensus: [], polarizing_topics: [] },
      emotional_landscape: { dominant_emotions: [], emotional_journey: 'Unable to analyze due to parsing error' },
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

  return insights;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    
    // Support two modes:
    // 1. DB mode: { survey_session_id, user_id } - fetches from DB
    // 2. Direct mode: { direct_data: { responses, personas, questions, ... } } - uses passed data
    
    const { survey_session_id, user_id, direct_data } = requestBody;

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    let insights;
    let responses: ResponseData[];
    let personas: PersonaData[];
    let studyName: string;
    let studyDescription: string;
    let questions: string[];
    let researchContext: any;

    if (direct_data) {
      // DIRECT MODE: Use passed data (for ACP)
      console.log('Compiling insights from direct data (ACP mode)');
      
      responses = direct_data.responses || [];
      personas = direct_data.personas || [];
      questions = direct_data.questions || [];
      studyName = direct_data.study_name || 'ACP Research Study';
      studyDescription = direct_data.study_description || '';
      researchContext = direct_data.research_context;

      insights = await generateQualitativeInsights(
        responses,
        personas,
        studyName,
        studyDescription,
        questions,
        researchContext
      );

      // Don't store in DB for direct mode - just return insights
      return new Response(JSON.stringify({ 
        insights,
        report_id: null // No DB storage for ACP mode
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      // DB MODE: Fetch from database (existing behavior)
      console.log(`Compiling insights for survey session: ${survey_session_id}`);

      // Fetch all survey responses for this session
      const { data: dbResponses, error: responsesError } = await supabase
        .from('research_survey_responses')
        .select('*')
        .eq('session_id', survey_session_id)
        .order('question_index', { ascending: true });

      if (responsesError) {
        throw new Error(`Failed to fetch responses: ${responsesError.message}`);
      }

      responses = (dbResponses || []).map(r => ({
        persona_id: r.persona_id,
        question_index: r.question_index,
        question_text: r.question_text,
        response_text: r.response_text
      }));

      if (responses.length === 0) {
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

      // Fetch persona details
      const { data: personaData, error: personaError } = await supabase
        .from('v4_personas')
        .select('persona_id, name, full_profile')
        .in('persona_id', sessionData?.selected_personas || []);

      if (personaError) {
        console.warn('Could not fetch persona details:', personaError.message);
      }

      personas = (personaData || []).map(p => ({
        persona_id: p.persona_id,
        name: p.name,
        full_profile: p.full_profile
      }));

      studyName = sessionData?.research_surveys?.[0]?.name || 'Research Study';
      studyDescription = sessionData?.research_surveys?.[0]?.description || '';
      questions = (sessionData?.research_surveys?.[0]?.questions || []).map((q: any) => 
        typeof q === 'string' ? q : q.text || q.question || ''
      );
      researchContext = sessionData?.research_context;

      insights = await generateQualitativeInsights(
        responses,
        personas,
        studyName,
        studyDescription,
        questions,
        researchContext
      );

      // Store the compiled insights in DB
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
    }

  } catch (error) {
    console.error('Error in compile-research-insights function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : String(error),
      insights: null 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
