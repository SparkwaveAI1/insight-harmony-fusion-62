
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { corsHeaders } from '../_shared/cors.ts'

const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || ''

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { response, persona, conversation_context, user_message } = await req.json()
    
    console.log(`Validating response for persona: ${persona.name}`)
    
    if (!response || !persona) {
      return new Response(
        JSON.stringify({ error: 'Missing response or persona data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create validation prompt
    const validationPrompt = `You are an AI response validator. Analyze this persona response for authenticity.

PERSONA PROFILE:
Name: ${persona.name}
Age: ${persona.metadata?.age || 'Unknown'}
Occupation: ${persona.metadata?.occupation || 'Unknown'}
Region: ${persona.metadata?.region || 'Unknown'}
Education: ${persona.metadata?.education_level || 'Unknown'}

PERSONALITY TRAITS:
${JSON.stringify(persona.trait_profile, null, 2)}

CONVERSATION CONTEXT:
${conversation_context}

USER MESSAGE: "${user_message}"

PERSONA RESPONSE TO VALIDATE: "${response}"

Rate this response on a scale of 0.0 to 1.0 for each metric:

1. HUMANNESS (Does this sound like a real human, not AI?)
   - Look for: natural speech patterns, imperfect grammar, personal quirks, emotional authenticity
   - Avoid: overly polite AI language, perfect grammar, diplomatic hedging, "I understand" phrases

2. PERSONALITY_ALIGNMENT (Does this match the persona's personality traits?)
   - Check against Big Five traits, values, behavioral patterns
   - Look for trait-consistent reactions and language

3. SPEECH_PATTERN_AUTHENTICITY (Does this match how this person would actually speak?)
   - Consider education level, region, age, occupation
   - Look for appropriate vocabulary, slang, sentence structure

4. UNIQUE_PERSPECTIVE (Does this show a distinct viewpoint based on background?)
   - Should reflect their specific experiences, not generic opinions
   - Avoid template responses that could come from anyone

5. EMOTIONAL_TONE (Does the emotional response fit the personality?)
   - Check if emotional intensity matches traits like neuroticism, emotional stability
   - Look for authentic emotional reactions

6. BACKGROUND_RELEVANCE (Does this incorporate their specific background/experience?)
   - References to their job, location, life experiences
   - Shows knowledge appropriate to their education/experience level

ALSO provide:
- FEEDBACK: Specific issues found and suggestions for improvement
- IMPROVED_RESPONSE: A more authentic version if score is below 0.7
- SHOULD_REGENERATE: true if the response needs significant improvement

Return ONLY valid JSON in this exact format:
{
  "scores": {
    "humanness": 0.0,
    "personalityAlignment": 0.0,
    "speechPatternAuthenticity": 0.0,
    "uniquePerspective": 0.0,
    "emotionalTone": 0.0,
    "backgroundRelevance": 0.0,
    "overall": 0.0
  },
  "feedback": "Detailed feedback here",
  "improvedResponse": "Improved version here (if needed)",
  "shouldRegenerate": false
}`

    console.log('Calling OpenAI for validation...')

    // Call OpenAI for validation
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a persona authenticity validator. Analyze responses and return ONLY valid JSON with scores and feedback.'
          },
          {
            role: 'user',
            content: validationPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      console.error('OpenAI validation error:', errorData)
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`)
    }

    const openaiData = await openaiResponse.json()
    let validationResult

    try {
      // Parse the JSON response
      const rawResponse = openaiData.choices[0].message.content
      console.log('Raw validation response:', rawResponse)
      
      // Clean up response and parse JSON
      const cleanedResponse = rawResponse.replace(/```json\n?|\n?```/g, '').trim()
      validationResult = JSON.parse(cleanedResponse)
      
      // Calculate overall score
      validationResult.scores.overall = (
        validationResult.scores.humanness * 0.25 +
        validationResult.scores.personalityAlignment * 0.20 +
        validationResult.scores.speechPatternAuthenticity * 0.20 +
        validationResult.scores.uniquePerspective * 0.15 +
        validationResult.scores.emotionalTone * 0.10 +
        validationResult.scores.backgroundRelevance * 0.10
      )
      
    } catch (parseError) {
      console.error('Failed to parse validation JSON:', parseError)
      // Return default scores if parsing fails
      validationResult = {
        scores: {
          humanness: 0.6,
          personalityAlignment: 0.6,
          speechPatternAuthenticity: 0.6,
          uniquePerspective: 0.6,
          emotionalTone: 0.6,
          backgroundRelevance: 0.6,
          overall: 0.6
        },
        feedback: 'Validation parsing failed - manual review recommended',
        shouldRegenerate: false
      }
    }
    
    console.log(`Validation complete. Overall score: ${validationResult.scores.overall}`)
    
    return new Response(
      JSON.stringify(validationResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Validation error:', error)
    return new Response(
      JSON.stringify({ error: `Validation failed: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
