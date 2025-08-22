import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to analyze which traits are relevant to user input
function analyzeTraitRelevance(userInput: string, conversationSummary: any): string[] {
  const input = userInput.toLowerCase();
  const relevantTraits: string[] = [];
  
  // Always include demographics and voice
  relevantTraits.push('demographics', 'voice_summary', 'communication_style');
  
  // Scan for motivation-related topics
  if (input.includes('goal') || input.includes('want') || input.includes('priority')) {
    relevantTraits.push('motivation_summary', 'goal_priorities', 'want_vs_should_pattern');
  }
  
  // Scan for emotional topics
  if (input.includes('feel') || input.includes('emotion') || input.includes('upset') || input.includes('happy')) {
    relevantTraits.push('emotional_triggers_summary');
  }
  
  // Scan for work/professional topics
  if (input.includes('work') || input.includes('job') || input.includes('career') || input.includes('professional')) {
    relevantTraits.push('knowledge_profile');
  }
  
  // Scan for personal/values topics
  if (input.includes('believe') || input.includes('value') || input.includes('opinion') || input.includes('think')) {
    relevantTraits.push('truth_flexibility_summary', 'contradictions_summary');
  }
  
  // Scan for relationship/personal topics
  if (input.includes('family') || input.includes('relationship') || input.includes('personal')) {
    relevantTraits.push('sexuality_summary');
  }
  
  // Scan for psychological barriers
  if (input.includes('difficult') || input.includes('hard') || input.includes('challenge') || input.includes('problem')) {
    relevantTraits.push('inhibitor_summary');
  }
  
  return [...new Set(relevantTraits)]; // Remove duplicates
}

// Build focused LLM instructions using only relevant traits
function buildV4Instructions(conversationSummary: any, relevantTraits: string[], userInput: string): string {
  let instructions = `You are ${conversationSummary.demographics.name}, ${conversationSummary.demographics.occupation} from ${conversationSummary.demographics.location}.

BACKGROUND: ${conversationSummary.demographics.background_description}

COMMUNICATION STYLE: ${conversationSummary.voice_summary}
- Directness: ${conversationSummary.communication_style.directness}
- Formality: ${conversationSummary.communication_style.formality}
- Use these signature phrases naturally: ${conversationSummary.communication_style.signature_phrases.join(', ')}
- NEVER use these expressions: ${conversationSummary.communication_style.forbidden_expressions.join(', ')}

`;

  // Add relevant trait context based on what was detected
  if (relevantTraits.includes('motivation_summary')) {
    instructions += `MOTIVATION: ${conversationSummary.motivation_summary}\n`;
    instructions += `GOALS: ${conversationSummary.goal_priorities}\n`;
  }
  
  if (relevantTraits.includes('want_vs_should_pattern')) {
    instructions += `DECISION PATTERN: ${conversationSummary.want_vs_should_pattern}\n`;
  }
  
  if (relevantTraits.includes('emotional_triggers_summary')) {
    instructions += `EMOTIONAL TRIGGERS: ${conversationSummary.emotional_triggers_summary}\n`;
  }
  
  if (relevantTraits.includes('knowledge_profile')) {
    instructions += `EXPERTISE: ${conversationSummary.knowledge_profile.expertise_domains.join(', ')}\n`;
    instructions += `KNOWLEDGE GAPS: Avoid detailed discussion of ${conversationSummary.knowledge_profile.knowledge_gaps.join(', ')}\n`;
  }
  
  if (relevantTraits.includes('truth_flexibility_summary')) {
    instructions += `HONESTY APPROACH: ${conversationSummary.truth_flexibility_summary}\n`;
  }
  
  if (relevantTraits.includes('contradictions_summary')) {
    instructions += `INTERNAL TENSIONS: ${conversationSummary.contradictions_summary}\n`;
  }
  
  if (relevantTraits.includes('inhibitor_summary')) {
    instructions += `PSYCHOLOGICAL BARRIERS: ${conversationSummary.inhibitor_summary}\n`;
  }
  
  if (relevantTraits.includes('sexuality_summary')) {
    instructions += `PERSONAL BOUNDARIES: ${conversationSummary.sexuality_summary}\n`;
  }

  instructions += `
RESPONSE REQUIREMENTS:
- Respond authentically as this specific person
- Use their natural communication patterns from ${conversationSummary.communication_style.response_patterns.opinion} structure for opinions
- Include at least one specific personal detail or example
- Keep response length appropriate for the topic (50-200 words typically)
- Stay true to their personality and constraints

USER INPUT: "${userInput}"

Respond as ${conversationSummary.demographics.name}:`;

  return instructions;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { persona_id, user_message, conversation_history } = await req.json()
    
    console.log('V4 Conversation Engine - Processing:', persona_id)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch V4 persona conversation summary
    const { data: persona, error: fetchError } = await supabase
      .from('v4_personas')
      .select('conversation_summary')
      .eq('persona_id', persona_id)
      .single()

    if (fetchError) {
      console.error('Error fetching V4 persona:', fetchError)
      throw fetchError
    }

    console.log('V4 persona loaded:', persona.conversation_summary.demographics.name)

    // Analyze which traits are relevant to this user input
    const relevantTraits = analyzeTraitRelevance(user_message, persona.conversation_summary)
    console.log('Relevant traits detected:', relevantTraits)

    // Build focused instructions using only relevant traits
    const instructions = buildV4Instructions(persona.conversation_summary, relevantTraits, user_message)
    console.log('Instructions built, length:', instructions.length)

    // Call OpenAI with trait-specific instructions
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: instructions
          },
          // Add conversation history if provided
          ...(conversation_history || []),
          {
            role: 'user',
            content: user_message
          }
        ],
        temperature: 0.8,
        max_tokens: 300
      })
    })

    const openaiData = await openaiResponse.json()
    console.log('OpenAI response received')

    const personaResponse = openaiData.choices[0].message.content

    return new Response(
      JSON.stringify({ 
        success: true,
        response: personaResponse,
        traits_used: relevantTraits,
        persona_name: persona.conversation_summary.demographics.name
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in v4-conversation-engine:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})