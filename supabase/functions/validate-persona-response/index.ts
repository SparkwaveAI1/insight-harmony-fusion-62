
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

    // Extract key personality traits for validation
    const bigFive = persona.trait_profile?.big_five || {};
    const moralFoundations = persona.trait_profile?.moral_foundations || {};
    const extendedTraits = persona.trait_profile?.extended_traits || {};
    
    // Create validation prompt
    const validationPrompt = `You are an AI response validator focused on PERSONALITY AUTHENTICITY. Analyze this persona response for distinct personality expression.

PERSONA PROFILE:
Name: ${persona.name}
Age: ${persona.metadata?.age || 'Unknown'}
Occupation: ${persona.metadata?.occupation || 'Unknown'}
Region: ${persona.metadata?.region || 'Unknown'}
Education: ${persona.metadata?.education_level || 'Unknown'}

KEY PERSONALITY TRAITS (0.0-1.0 scale):
Openness: ${bigFive.openness || 'Unknown'} ${bigFive.openness > 0.7 ? '(VERY HIGH - creative, unconventional)' : bigFive.openness < 0.3 ? '(VERY LOW - traditional, practical)' : '(MODERATE)'}
Conscientiousness: ${bigFive.conscientiousness || 'Unknown'} ${bigFive.conscientiousness > 0.7 ? '(VERY HIGH - organized, detail-oriented)' : bigFive.conscientiousness < 0.3 ? '(VERY LOW - spontaneous, flexible)' : '(MODERATE)'}
Extraversion: ${bigFive.extraversion || 'Unknown'} ${bigFive.extraversion > 0.7 ? '(VERY HIGH - social, energetic)' : bigFive.extraversion < 0.3 ? '(VERY LOW - reserved, quiet)' : '(MODERATE)'}
Agreeableness: ${bigFive.agreeableness || 'Unknown'} ${bigFive.agreeableness > 0.7 ? '(VERY HIGH - cooperative, trusting)' : bigFive.agreeableness < 0.3 ? '(VERY LOW - competitive, skeptical)' : '(MODERATE)'}
Neuroticism: ${bigFive.neuroticism || 'Unknown'} ${bigFive.neuroticism > 0.7 ? '(VERY HIGH - anxious, emotionally volatile)' : bigFive.neuroticism < 0.3 ? '(VERY LOW - calm, stable)' : '(MODERATE)'}

MORAL VALUES:
Care/Harm: ${moralFoundations.care || 'Unknown'} ${moralFoundations.care > 0.7 ? '(VERY HIGH - prioritizes compassion)' : moralFoundations.care < 0.3 ? '(LOW - less concerned with harm)' : '(MODERATE)'}
Fairness: ${moralFoundations.fairness || 'Unknown'} ${moralFoundations.fairness > 0.7 ? '(VERY HIGH - justice-focused)' : moralFoundations.fairness < 0.3 ? '(LOW - accepts inequality)' : '(MODERATE)'}
Authority: ${moralFoundations.authority || 'Unknown'} ${moralFoundations.authority > 0.7 ? '(VERY HIGH - respects hierarchy)' : moralFoundations.authority < 0.3 ? '(LOW - questions authority)' : '(MODERATE)'}

CONVERSATION CONTEXT:
${conversation_context}

USER MESSAGE: "${user_message}"

PERSONA RESPONSE TO VALIDATE: "${response}"

CRITICAL VALIDATION REQUIREMENTS:

1. HUMANNESS (Does this sound like a real human, not AI?)
   - AUTOMATIC FAIL (0.2 or lower) if starts with: "Honestly," "Well," "To be honest," "Personally," "I think," "I feel like," "You know,"
   - AUTOMATIC FAIL (0.3 or lower) for diplomatic AI phrases: "I understand," "That's a great question," "I appreciate," "It's worth noting"
   - Must use natural speech patterns, contractions, personality quirks
   - Should show authentic emotional reactions based on traits

2. PERSONALITY_ALIGNMENT (Does this match THIS specific persona's traits?)
   - HIGH Openness (>0.7): Should show creative/unconventional thinking, artistic appreciation, or intellectual curiosity
   - LOW Openness (<0.3): Should be practical, traditional, focused on concrete benefits
   - HIGH Agreeableness (>0.7): Should be cooperative, considerate, avoid harsh criticism
   - LOW Agreeableness (<0.3): Should be more direct, critical, competitive, skeptical
   - HIGH Neuroticism (>0.7): Should show more emotional intensity, anxiety, or reactivity
   - LOW Neuroticism (<0.3): Should be calm, stable, measured
   - Response MUST reflect these trait levels authentically

3. UNIQUE_PERSPECTIVE (Does this show a DISTINCT viewpoint different from other personas?)
   - CRITICAL: This persona should NOT have the same opinion as others would
   - Must reflect their specific background (${persona.metadata?.occupation || 'occupation'}, ${persona.metadata?.age || 'age'}, ${persona.metadata?.region || 'region'})
   - Should show knowledge/ignorance appropriate to their education/experience
   - Must demonstrate perspective that flows from THEIR personality traits, not generic opinions
   - Different personalities should genuinely DISAGREE or have different focuses

4. BACKGROUND_RELEVANCE (Does this incorporate their specific life context?)
   - Should reference or reflect their occupation, region, age, education level
   - Knowledge should match their background
   - Speech patterns should fit their demographic

5. MORAL/VALUE EXPRESSION (Does this reflect their moral foundations?)
   - High Care: Should show concern for harm/suffering
   - Low Care: May be less empathetic to others' pain
   - High Fairness: Should focus on justice/equality issues
   - High Authority: Should respect traditional structures
   - Low Authority: Should question or challenge hierarchies

STRICT SCORING RULES:
- If response uses AI hedging language → HUMANNESS = 0.2 maximum
- If personality traits don't match response → PERSONALITY_ALIGNMENT = 0.3 maximum
- If this sounds like what ANY other persona would say → UNIQUE_PERSPECTIVE = 0.2 maximum
- Most responses should score below 0.6 overall - be VERY harsh
- Only truly authentic, personality-driven responses should score above 0.7

PROVIDE:
- FEEDBACK: Specific personality misalignments and lack of uniqueness
- IMPROVED_RESPONSE: A version that shows THIS persona's distinct personality and perspective
- SHOULD_REGENERATE: true if score below 0.7

The improved response should:
- Show strong personality trait influence on opinion
- Express a viewpoint that flows from THIS persona's specific traits
- Potentially DISAGREE with what other personalities would say
- Use authentic speech for their background
- Show genuine emotional reactions based on their trait profile

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
            content: 'You are a harsh persona authenticity validator specializing in personality psychology. Your job is to ensure each persona expresses DISTINCT opinions based on their specific personality traits. Most responses should fail validation for being too generic or not reflecting the specific personality profile. Be extremely critical.'
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
        validationResult.scores.humanness * 0.20 +
        validationResult.scores.personalityAlignment * 0.30 +
        validationResult.scores.speechPatternAuthenticity * 0.15 +
        validationResult.scores.uniquePerspective * 0.25 +
        validationResult.scores.emotionalTone * 0.05 +
        validationResult.scores.backgroundRelevance * 0.05
      )
      
    } catch (parseError) {
      console.error('Failed to parse validation JSON:', parseError)
      // Return default scores if parsing fails
      validationResult = {
        scores: {
          humanness: 0.3,
          personalityAlignment: 0.2,
          speechPatternAuthenticity: 0.3,
          uniquePerspective: 0.2,
          emotionalTone: 0.3,
          backgroundRelevance: 0.3,
          overall: 0.25
        },
        feedback: 'Validation parsing failed - likely generic response that lacks personality specificity',
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
