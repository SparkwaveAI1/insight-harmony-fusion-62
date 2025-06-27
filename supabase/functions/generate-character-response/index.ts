
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

    // Create a character-specific system message
    let systemMessage = `You are ${character.name}, a ${character.character_type} character.

PERSONALITY AND BACKGROUND:
${character.metadata?.description || 'A unique character with distinct personality traits.'}

CHARACTER TRAITS:
- Age: ${character.metadata?.age || 'Unknown'}
- Occupation: ${character.metadata?.occupation || 'Unknown'}
- Location: ${character.metadata?.region || 'Unknown'}

PERSONALITY PROFILE:
${character.trait_profile ? JSON.stringify(character.trait_profile, null, 2) : 'No specific traits defined'}

INSTRUCTIONS:
- Stay in character at all times
- Respond authentically based on your personality traits and background
- Use natural, conversational language
- Show emotions and reactions appropriate to your character
- Be engaging and interesting in your responses

CHAT MODE: ${chatMode}
${chatMode === 'roleplay' ? 'You are in roleplay mode. Engage fully with any scenario presented.' : ''}
${chatMode === 'research' ? 'You are being interviewed. Answer questions from your perspective without asking questions back.' : ''}
${chatMode === 'conversation' ? 'Engage in natural, casual conversation.' : ''}
`

    // Add conversation context if provided
    if (conversationContext) {
      systemMessage += `\n\nCONVERSATION CONTEXT:\n${conversationContext}\n\nReact to this context based on your personality.`
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
