import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { persona_id, user_message, conversation_history } = await req.json()

    if (!persona_id || !user_message) {
      throw new Error('Missing required parameters: persona_id and user_message')
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch the full persona profile
    const { data: persona, error } = await supabase
      .from('v4_personas')
      .select('*')
      .eq('persona_id', persona_id)
      .single()

    if (error || !persona) {
      throw new Error(`Persona not found: ${persona_id}`)
    }

    // Extract demographics for context
    const demographics = persona.conversation_summary?.demographics || {}
    const name = demographics.name || persona.name || 'Unknown'
    const age = demographics.age || 'unknown age'
    const occupation = demographics.occupation || 'unknown occupation'
    const location = demographics.location || 'unknown location'

    // Filter out metaphor domains and other noise from the profile
    const filteredProfile = { ...persona.full_profile }
    if (filteredProfile.communication_style?.style_markers?.metaphor_domains) {
      delete filteredProfile.communication_style.style_markers.metaphor_domains
    }

    // Prepare the OpenAI analysis prompt
    const analysisPrompt = `You are capturing the authentic voice of a real person. Study this individual's psychological makeup and create a system prompt that channels their unique motivations, emotional patterns, and natural way of expressing themselves.

PERSON: ${name}, ${age}, ${occupation} from ${location}

PSYCHOLOGICAL PROFILE:
${JSON.stringify(filteredProfile, null, 2)}

QUESTION: "${user_message}"
CONVERSATION CONTEXT: ${JSON.stringify(conversation_history || [], null, 2)}

Channel this person's authentic voice by focusing on:

CORE MOTIVATIONS & EMOTIONAL DRIVERS:
What deep-seated needs, fears, desires, or principles would make this person care about this topic? What emotional buttons does this question push for them specifically? How do their primary motivations (security, status, meaning, belonging, etc.) shape their gut reaction?

NATURAL VOICE & EXPRESSION PATTERNS:
Describe their authentic speaking style in rich detail:
- Regional speech patterns, colloquialisms, cultural expressions they'd naturally use
- Professional jargon or industry-specific language that flows naturally from their work
- Age-related communication habits and generational markers in their speech
- Ethnic/cultural communication patterns that are part of their identity
- How their personality traits show up in word choice, sentence structure, and rhythm
- Whether they think out loud, speak precisely, ramble, or get straight to the point
- Specific phrases, analogies, or examples they'd draw from their life experience
- How their stress level, biases, and emotional patterns affect their communication

AUTHENTIC REACTION:
Based on their motivations and personality, what would their genuine gut reaction be? Not a balanced analysis, but their real human response shaped by who they are.

CRITICAL INSTRUCTIONS:
- NEVER start by restating or paraphrasing the question
- Write 2-5 conversational sentences maximum
- Express their specific viewpoint, not diplomatic middle ground
- Channel their actual voice patterns and natural expressions
- Let their motivations and emotional drivers be visible in the response
- Avoid formulaic responses - each person should sound completely different

BANNED PHRASES: "That said," "However," "On the other hand," "Overall," "Ultimately," "At the end of the day," "Game-changer," "Double-edged sword," "Invaluable tool," "Cautiously optimistic," "Measured approach"

Create a system prompt that captures this person's authentic voice and perspective.`

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()
    const systemPrompt = data.choices[0]?.message?.content

    if (!systemPrompt) {
      throw new Error('No system prompt generated by OpenAI')
    }

    console.log(`✅ OpenAI trait analysis completed for ${name}`)

    return new Response(JSON.stringify({
      success: true,
      system_prompt: systemPrompt,
      persona_name: name,
      model_used: 'gpt-4.1-2025-04-14'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in v4-openai-trait-analyzer:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})