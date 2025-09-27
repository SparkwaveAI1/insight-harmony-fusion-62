import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Question context analysis to determine relevant trait categories
function analyzeQuestionContext(userMessage: string) {
  const message = userMessage.toLowerCase()
  const categories = []
  let summary = ''

  // Financial/Money topics
  if (message.match(/\b(money|financial|cost|price|budget|invest|save|spend|income|salary|pay|debt|loan|credit|afford|expensive|cheap|economic|wealth|rich|poor|poverty|financial|bank|insurance|retirement|portfolio|stock|bond|fund|401k|ira|tax|taxes)\b/)) {
    categories.push('money_profile', 'financial_stressors', 'income_bracket', 'attitude_toward_money', 'spending_style')
    summary += 'Financial/economic concerns. '
  }

  // Technology/Innovation topics
  if (message.match(/\b(technology|tech|AI|artificial intelligence|robot|automation|digital|online|internet|app|software|computer|phone|mobile|platform|tool|innovation|future|algorithm|data|privacy|security|cyber|virtual|augmented|blockchain|crypto|programming|coding|development)\b/)) {
    categories.push('adoption_profile', 'risk_tolerance', 'change_friction', 'cognitive_profile', 'education_level')
    summary += 'Technology/innovation adoption. '
  }

  // Work/Career topics
  if (message.match(/\b(work|job|career|professional|office|workplace|colleague|boss|employee|manager|business|company|corporation|industry|salary|promotion|retirement|unemployment|hire|fire|quit|resign|meeting|project|deadline|performance|productivity|skill|training|education|leadership|team|department)\b/)) {
    categories.push('occupation', 'daily_life', 'primary_activities', 'attitude_narrative', 'motivation_profile', 'stress_responses')
    summary += 'Work/professional context. '
  }

  // Family/Relationships topics
  if (message.match(/\b(family|spouse|husband|wife|partner|children|kids|child|parent|mother|father|mom|dad|sister|brother|sibling|grandparent|relative|relationship|marriage|divorce|dating|love|baby|pregnancy|parenting|household|home|domestic)\b/)) {
    categories.push('relationships', 'household', 'dependents', 'family_time', 'caregiving_roles', 'emotional_profile')
    summary += 'Family/relationship dynamics. '
  }

  // Health/Medical topics
  if (message.match(/\b(health|medical|doctor|hospital|medicine|illness|disease|sick|healthy|diet|exercise|fitness|mental health|therapy|counseling|medication|treatment|surgery|pain|stress|anxiety|depression|wellness|nutrition|weight|sleep)\b/)) {
    categories.push('health_profile', 'chronic_conditions', 'mental_health_flags', 'medications', 'fitness_level', 'diet_pattern', 'sleep_hours')
    summary += 'Health/medical considerations. '
  }

  // Political/Social topics
  if (message.match(/\b(politics|political|government|policy|vote|election|democrat|republican|liberal|conservative|progressive|candidate|president|congress|senate|law|legislation|regulation|social|society|justice|equality|rights|freedom|protest|activism|immigration|climate|environment)\b/)) {
    categories.push('political_narrative', 'attitude_narrative', 'bias_profile', 'truth_honesty_profile', 'emotional_profile')
    summary += 'Political/social issues. '
  }

  // Personal Growth/Psychology topics
  if (message.match(/\b(personality|psychology|behavior|motivation|goal|dream|ambition|value|belief|principle|meaning|purpose|growth|development|self|identity|confidence|self-esteem|mindset|attitude|habit|routine|lifestyle|spirituality|religion|philosophy)\b/)) {
    categories.push('motivation_profile', 'primary_drivers', 'goal_orientation', 'emotional_profile', 'cognitive_profile', 'truth_honesty_profile')
    summary += 'Personal growth/psychological topics. '
  }

  // Default categories if no specific match
  if (categories.length === 0) {
    categories.push('communication_style', 'emotional_profile', 'motivation_profile', 'cognitive_profile', 'bias_profile')
    summary = 'General conversation requiring personality and communication analysis. '
  }

  return {
    categories: [...new Set(categories)], // Remove duplicates
    summary: summary.trim()
  }
}

// Extract relevant traits based on question analysis and psychological patterns
function extractRelevantTraits(fullProfile: any, questionAnalysis: any, userMessage: string) {
  const selectedTraits: any = {}

  // Always include core identity and communication patterns
  if (fullProfile.identity) selectedTraits.identity = fullProfile.identity
  if (fullProfile.communication_style) {
    selectedTraits.communication_style = { ...fullProfile.communication_style }
    // Remove metaphor domains as they create noise
    if (selectedTraits.communication_style.style_markers?.metaphor_domains) {
      delete selectedTraits.communication_style.style_markers.metaphor_domains
    }
  }

  // Always include core psychological drivers
  if (fullProfile.motivation_profile) selectedTraits.motivation_profile = fullProfile.motivation_profile
  if (fullProfile.emotional_profile) selectedTraits.emotional_profile = fullProfile.emotional_profile
  if (fullProfile.bias_profile) selectedTraits.bias_profile = fullProfile.bias_profile

  // Include category-specific traits based on question analysis
  questionAnalysis.categories.forEach((category: string) => {
    if (fullProfile[category]) {
      selectedTraits[category] = fullProfile[category]
    }
  })

  // Context-specific additions based on question content
  const message = userMessage.toLowerCase()

  // Add humor profile if question seems light or social
  if (message.match(/\b(fun|funny|joke|humor|laugh|amusing|entertaining|social|party|friend|casual)\b/) && fullProfile.humor_profile) {
    selectedTraits.humor_profile = fullProfile.humor_profile
  }

  // Add cognitive profile for complex decision-making questions
  if (message.match(/\b(decide|choice|option|think|consider|analyze|evaluate|compare|pros|cons|strategy|plan|solution|problem)\b/) && fullProfile.cognitive_profile) {
    selectedTraits.cognitive_profile = fullProfile.cognitive_profile
  }

  // Add daily life context for practical questions
  if (message.match(/\b(daily|routine|schedule|time|busy|stress|pressure|balance|lifestyle)\b/) && fullProfile.daily_life) {
    selectedTraits.daily_life = fullProfile.daily_life
  }

  // Add honesty/truth profile for controversial or personal topics
  if (message.match(/\b(honest|truth|lie|authentic|real|genuine|admit|confess|secret|private|personal|controversial|sensitive)\b/) && fullProfile.truth_honesty_profile) {
    selectedTraits.truth_honesty_profile = fullProfile.truth_honesty_profile
  }

  return selectedTraits
}

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

    // Enhanced trait selection based on question context and psychological drivers
    const fullProfile = persona.full_profile
    
    // Analyze question context to determine relevant trait categories
    const questionAnalysis = analyzeQuestionContext(user_message)
    
    // Extract relevant traits based on question context and psychological drivers
    const selectedTraits = extractRelevantTraits(fullProfile, questionAnalysis, user_message)
    
    // Prepare the comprehensive OpenAI analysis prompt
    const analysisPrompt = `You are a psychological analyst creating an authentic conversational persona. Your job is to identify the unique psychological drivers and communication patterns that would make this person's response distinctly different from others.

PERSON: ${name}, ${age}, ${occupation} from ${location}

QUESTION ANALYSIS: ${questionAnalysis.summary}
RELEVANT TRAIT CATEGORIES: ${questionAnalysis.categories.join(', ')}

SELECTED PSYCHOLOGICAL PROFILE:
${JSON.stringify(selectedTraits, null, 2)}

USER QUESTION: "${user_message}"
CONVERSATION CONTEXT: ${JSON.stringify(conversation_history || [], null, 2)}

ANALYSIS FRAMEWORK:

1. PSYCHOLOGICAL ACTIVATION ANALYSIS:
Based on their specific traits, what deep psychological drivers would this question activate?
- What fears, desires, or core values would be triggered?
- How do their cognitive biases (confirmation, anchoring, loss aversion, etc.) shape their initial reaction?
- What emotional patterns from their profile would influence their response?

2. UNIQUE VOICE MARKERS:
Identify the specific communication patterns that make THIS person distinctive:
- Regional/cultural speech patterns from their background
- Professional terminology they'd naturally use
- Generational communication habits
- Stress responses and emotional regulation patterns
- How their personality traits manifest in sentence structure and word choice

3. MOTIVATIONAL DRIVERS:
What would make this person CARE about this topic based on their specific profile?
- Which of their core motivations (security, status, autonomy, meaning, etc.) are at stake?
- What personal experiences or circumstances would shape their perspective?
- How do their current life pressures and preoccupations influence their response?

4. ANTI-PATTERN IDENTIFICATION:
Based on their traits, what would this person NEVER say or do?
- Communication styles that contradict their personality
- Response patterns that don't match their cognitive profile
- Topics they'd avoid or approach differently due to their background

5. DIFFERENTIATION FACTORS:
What makes this person's response uniquely different from others?
- Unusual trait combinations that create distinctive perspectives
- Strong cultural/regional markers that influence expression
- Specific life circumstances that shape their worldview

RESPONSE CREATION INSTRUCTIONS:
Create a system prompt that generates 2-4 sentences expressing their authentic reaction. The response should:
- Sound like a real person, not a diplomatic AI
- Reflect their specific psychological drivers and communication style
- Avoid formulaic structures - each persona should have completely different response patterns
- Express their genuine viewpoint based on their unique trait combination
- Use natural speech patterns from their background and personality

ABSOLUTELY FORBIDDEN PATTERNS:
- Starting with question restatement ("Integrating X would...")
- Diplomatic hedging ("On one hand... on the other hand...")
- Generic corporate speak ("game-changer," "double-edged sword")
- Formulaic structures that sound the same across personas
- Metaphors and analogies unless they're natural to this specific person
- Academic or overly analytical language unless it matches their profile

Create a focused system prompt that captures this person's authentic voice and unique psychological perspective.`

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