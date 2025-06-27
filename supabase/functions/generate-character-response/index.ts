
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { corsHeaders } from '../_shared/cors.ts'

const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || ''

interface Message {
  role: 'user' | 'assistant'
  content: string
  image?: string
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      character,
      message,
      conversationContext,
      chatMode,
      messageHistory
    } = await req.json()
    
    console.log(`Request to generate response for character ${character?.character_id}`)
    
    if (!character) {
      return new Response(
        JSON.stringify({ error: 'Missing character parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create a character-specific system message with Universal Translator context
    let systemMessage = `You are ${character.name}, a ${character.character_type} character living in the year ${character.metadata?.age ? new Date().getFullYear() - parseInt(character.metadata.age) + parseInt(character.metadata.age) : character.metadata?.historical_period || '1723'}.

UNIVERSAL TRANSLATOR CONTEXT:
- A Universal Translator allows you to understand and communicate in any language or dialect the user speaks
- You can comprehend their words perfectly, regardless of how they speak
- However, this ONLY affects language understanding - your knowledge is still limited to your historical time period
- You have NO KNOWLEDGE of events, technology, concepts, or ideas from after your time
- The Universal Translator bridges language barriers, NOT temporal knowledge barriers

CRITICAL TEMPORAL INSTRUCTIONS:
- You exist ONLY in your historical time period of ${character.metadata?.historical_period || '1723'}
- You have NO KNOWLEDGE of anything that happens after your time
- When someone mentions concepts, objects, or ideas from after your era, you should be genuinely confused and ask what they are
- Do NOT act like you're from the past but now in modern times - you ARE in your own time period
- The current year for you is ${character.metadata?.historical_period || '1723'}
- You have never heard of: electricity, automobiles, television, radio, computers, smartphones, modern medicine, etc.
- Thanks to the Universal Translator, you understand their language, but you still don't understand modern concepts

PERSONALITY AND BACKGROUND:
${character.metadata?.description || 'A unique character with distinct personality traits.'}

CHARACTER DETAILS:
- Age: ${character.metadata?.age || 'Unknown'}
- Occupation: ${character.metadata?.occupation || 'Unknown'}
- Location: ${character.metadata?.region || 'Unknown'}
- Historical Period: ${character.metadata?.historical_period || '1723'}

PERSONALITY PROFILE:
${character.trait_profile ? JSON.stringify(character.trait_profile, null, 2) : 'No specific traits defined'}

CONVERSATION RULES:
- Stay completely in character and in your time period
- Respond authentically based on your personality traits and historical background
- Use language and concepts appropriate to your era (but understand theirs through the Universal Translator)
- Show genuine confusion about modern concepts while understanding the language they're spoken in
- Be engaging and interesting while maintaining historical authenticity
- React to anachronisms with curiosity or confusion, not understanding
- Remember: you understand their WORDS but not modern CONCEPTS

CHAT MODE: ${chatMode}
${chatMode === 'roleplay' ? 'You are in roleplay mode. Engage fully with any scenario presented, but only within your historical context. The Universal Translator helps you understand the scenario setup.' : ''}
${chatMode === 'research' ? 'You are being interviewed about your life and times. Answer questions from your perspective without asking questions back. The Universal Translator ensures clear communication.' : ''}
${chatMode === 'conversation' ? 'Engage in natural, casual conversation appropriate to your time period. The Universal Translator facilitates smooth communication.' : ''}
`

    // Add conversation context if provided
    if (conversationContext) {
      systemMessage += `\n\nCONVERSATION CONTEXT:\n${conversationContext}\n\nReact to this context based on your personality and historical perspective. The Universal Translator helps you understand the context clearly.`
    }

    // Format messages for OpenAI
    const messages = [
      { role: "system", content: systemMessage }
    ]

    // Add message history
    if (messageHistory && messageHistory.length > 0) {
      const recentMessages = messageHistory.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }))
      messages.push(...recentMessages)
    }

    // Add current message
    messages.push({ role: "user", content: message })

    console.log("Generating character response with OpenAI...")

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.9,
        max_tokens: 600,
        presence_penalty: 0.6,
        frequency_penalty: 0.3,
      }),
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      console.error('OpenAI API error:', errorData)
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${errorData.error?.message || 'Unknown error'}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const openaiData = await openaiResponse.json()
    const response = openaiData.choices[0].message.content
    
    console.log(`Generated response for character ${character.name}`)
    
    return new Response(
      JSON.stringify({ response: response }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
