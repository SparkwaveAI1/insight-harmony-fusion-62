
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
   - CRITICAL VIOLATIONS (automatic 0.2 or lower):
     * Starting with "Honestly," "Well," "To be honest," "Personally," "I think," "I feel like," "You know,"
     * Using diplomatic AI phrases like "I understand," "That's a great question," "I appreciate," "It's worth noting"
     * Overly balanced/diplomatic responses that hedge everything
     * Perfect grammar and sentence structure (humans make mistakes)
     * Responses that sound like customer service scripts
   - Look for: natural speech patterns, authentic reactions, imperfect language, personality quirks
   - Reward: contractions, slang, regional speech, emotional authenticity, direct opinions

2. PERSONALITY_ALIGNMENT (Does this match the persona's personality traits?)
   - Check against Big Five traits, values, behavioral patterns
   - Look for trait-consistent reactions and language
   - Should show strong opinions when traits dictate them

3. SPEECH_PATTERN_AUTHENTICITY (Does this match how this person would actually speak?)
   - Consider education level, region, age, occupation
   - Look for appropriate vocabulary, slang, sentence structure
   - Regional and demographic speech patterns

4. UNIQUE_PERSPECTIVE (Does this show a distinct viewpoint based on background?)
   - Should reflect their specific experiences, not generic opinions
   - Avoid template responses that could come from anyone
   - Show knowledge/ignorance appropriate to their background

5. EMOTIONAL_TONE (Does the emotional response fit the personality?)
   - Check if emotional intensity matches traits like neuroticism, emotional stability
   - Look for authentic emotional reactions, not muted diplomatic responses

6. BACKGROUND_RELEVANCE (Does this incorporate their specific background/experience?)
   - References to their job, location, life experiences
   - Shows knowledge appropriate to their education/experience level

STRICT SCORING RULES:
- If response starts with "Honestly," "Well," "To be honest," "Personally," "I think," or "I feel like" → HUMANNESS = 0.2 maximum
- If response uses diplomatic AI language → HUMANNESS = 0.3 maximum  
- If response sounds like customer service → HUMANNESS = 0.2 maximum
- Overall score should be HARSH - most AI responses should score below 0.6

ALSO provide:
- FEEDBACK: Specific issues found and suggestions for improvement
- IMPROVED_RESPONSE: A more authentic version that avoids AI patterns and shows real personality
- SHOULD_REGENERATE: true if the response needs significant improvement (score below 0.7)

The improved response should:
- Start differently (no "Honestly" or hedging words)
- Show strong personality-driven reactions
- Use authentic speech patterns for this person
- Be more emotionally genuine
- Show their specific perspective and background

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
  "improvedResponse": "Improved version here",
  "shouldRegenerate": true
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
            content: 'You are a harsh persona authenticity validator. Your job is to catch AI-like responses and score them very strictly. Most responses should fail validation. Be extremely critical of any AI speech patterns.'
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
          humanness: 0.3,
          personalityAlignment: 0.3,
          speechPatternAuthenticity: 0.3,
          uniquePerspective: 0.3,
          emotionalTone: 0.3,
          backgroundRelevance: 0.3,
          overall: 0.3
        },
        feedback: 'Validation parsing failed - response likely contains AI patterns',
        shouldRegenerate: true
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
