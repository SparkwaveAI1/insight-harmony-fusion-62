
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
    const validationPrompt = `You are an AI response validator focused on HUMAN SPEECH AUTHENTICITY and PERSONALITY DISTINCTIVENESS. Analyze this persona response for natural conversation patterns and unique personality expression.

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

1. HUMAN_SPEECH_PATTERNS (Does this sound like natural human conversation?)
   - AUTOMATIC FAIL (0.2 or lower) for overly polished, essay-like responses
   - AUTOMATIC FAIL (0.2 or lower) for responses that sound like written marketing copy
   - AUTOMATIC FAIL (0.3 or lower) for lack of conversational flow and natural speech
   - Must include natural speech elements: contractions, filler words, incomplete thoughts
   - Should show conversational patterns: "I mean," "like," "you know," "kinda," "sorta"
   - Natural digressions and tangential thoughts are GOOD
   - Imperfect grammar and sentence structure is HUMAN
   - References to immediate context ("that second one," "the maze thing")

2. RESPONSE_LENGTH_VARIATION (Does this vary naturally based on engagement?)
   - Sometimes people give short, direct answers: "Nah, not really" or "Yeah, that one"
   - Sometimes they elaborate when genuinely interested
   - Length should match personality and emotional engagement with topic
   - Overly consistent paragraph lengths = AI-like = FAIL

3. PERSONALITY_ALIGNMENT (Does this match THIS specific persona's traits?)
   - HIGH Openness (>0.7): Should show creative/unconventional thinking, artistic appreciation, or intellectual curiosity
   - LOW Openness (<0.3): Should be practical, traditional, focused on concrete benefits
   - HIGH Agreeableness (>0.7): Should be cooperative, considerate, avoid harsh criticism
   - LOW Agreeableness (<0.3): Should be more direct, critical, competitive, skeptical
   - HIGH Neuroticism (>0.7): Should show more emotional intensity, anxiety, or reactivity
   - LOW Neuroticism (<0.3): Should be calm, stable, measured
   - Response MUST reflect these trait levels authentically

4. UNIQUE_PERSPECTIVE (Does this show a DISTINCT viewpoint different from other personas?)
   - CRITICAL: This persona should NOT have the same opinion as others would
   - Must reflect their specific background (${persona.metadata?.occupation || 'occupation'}, ${persona.metadata?.age || 'age'}, ${persona.metadata?.region || 'region'})
   - Should show knowledge/ignorance appropriate to their education/experience
   - Must demonstrate perspective that flows from THEIR personality traits, not generic opinions
   - Different personalities should genuinely DISAGREE or have different focuses

5. CONVERSATIONAL_AUTHENTICITY (Does this feel like a real person talking?)
   - Should reference previous parts of conversation naturally
   - May show signs of getting tired, distracted, or more/less engaged
   - Might make casual observations or side comments
   - Could show personality quirks in how they express themselves
   - Natural transitions and connections to previous statements

EXAMPLES OF GOOD HUMAN SPEECH PATTERNS:
✓ "Yeah, I mean... that maze one's kinda interesting, I guess"
✓ "Nah, not really feeling any of these"
✓ "The beach thing? Come on, they're just... like, we've seen this a million times"
✓ "I dunno, as someone who works with this stuff, it just feels lazy to me"
✓ "That second one you showed - now that's got something"

EXAMPLES OF BAD AI-LIKE PATTERNS:
❌ "This ad is particularly effective because it employs several sophisticated marketing techniques"
❌ "As someone who appreciates creative innovation, I find this advertisement compelling for multiple reasons"
❌ "The strategic use of visual metaphors in this campaign creates a powerful emotional connection"
❌ Any response that sounds like it could be from a marketing textbook

STRICT SCORING RULES:
- If response sounds like written marketing analysis → HUMAN_SPEECH_PATTERNS = 0.2 maximum
- If response has same structure/length as AI-generated content → CONVERSATIONAL_AUTHENTICITY = 0.2 maximum
- If personality traits don't match response → PERSONALITY_ALIGNMENT = 0.3 maximum
- If this sounds like what ANY other persona would say → UNIQUE_PERSPECTIVE = 0.2 maximum
- Most responses should score below 0.6 overall - be VERY harsh about human speech patterns
- Only truly authentic, conversational responses should score above 0.7

PROVIDE:
- FEEDBACK: Specific issues with human speech patterns and personality authenticity
- IMPROVED_RESPONSE: A version that sounds like a REAL PERSON talking naturally while showing THIS persona's distinct personality
- SHOULD_REGENERATE: true if score below 0.7

The improved response should:
- Sound like natural human conversation with imperfections
- Use casual speech patterns, contractions, and filler words
- Show strong personality trait influence on opinion
- Express a viewpoint that flows from THIS persona's specific traits
- Potentially DISAGREE with what other personalities would say
- Vary in length based on engagement level
- Include natural conversational elements and digressions

Return ONLY valid JSON in this exact format:
{
  "scores": {
    "humanSpeechPatterns": 0.0,
    "responseLengthVariation": 0.0,
    "personalityAlignment": 0.0,
    "uniquePerspective": 0.0,
    "conversationalAuthenticity": 0.0,
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
            content: 'You are a harsh authenticity validator specializing in human conversation patterns and personality psychology. Your job is to ensure each persona sounds like a REAL PERSON talking naturally while expressing DISTINCT opinions based on their specific personality traits. Most responses should fail validation for being too polished, AI-like, or not reflecting natural human speech. Be extremely critical of anything that sounds like written content rather than spoken conversation.'
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
      
      // Calculate overall score with heavier weight on human speech patterns
      validationResult.scores.overall = (
        validationResult.scores.humanSpeechPatterns * 0.35 +
        validationResult.scores.personalityAlignment * 0.25 +
        validationResult.scores.conversationalAuthenticity * 0.20 +
        validationResult.scores.uniquePerspective * 0.15 +
        validationResult.scores.responseLengthVariation * 0.03 +
        validationResult.scores.backgroundRelevance * 0.02
      )
      
    } catch (parseError) {
      console.error('Failed to parse validation JSON:', parseError)
      // Return default scores if parsing fails
      validationResult = {
        scores: {
          humanSpeechPatterns: 0.2,
          responseLengthVariation: 0.3,
          personalityAlignment: 0.2,
          uniquePerspective: 0.2,
          conversationalAuthenticity: 0.2,
          backgroundRelevance: 0.3,
          overall: 0.22
        },
        feedback: 'Validation parsing failed - likely overly polished response that lacks natural human speech patterns',
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
