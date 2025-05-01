
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { corsHeaders } from '../_shared/cors.ts'
import { createPersonaSystemMessage } from '../_shared/personaSystemMessage.ts'

const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || ''

interface Message {
  role: 'user' | 'assistant'
  content: string
  name?: string
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { persona_id, previous_messages } = await req.json()
    
    // Log request info
    console.log(`Request to generate response for persona ${persona_id}`)
    
    if (!persona_id) {
      return new Response(
        JSON.stringify({ error: 'Missing persona_id parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Fetch the persona from the database
    console.log(`Fetching persona with ID: ${persona_id}`)
    const { data: persona, error: personaError } = await supabase
      .from('personas')
      .select('*')
      .eq('persona_id', persona_id)
      .single()

    if (personaError || !persona) {
      console.error('Error fetching persona:', personaError)
      return new Response(
        JSON.stringify({ error: `Failed to fetch persona: ${personaError?.message || 'Not found'}` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log(`Successfully fetched persona: ${persona.name}`)
    
    // Format previous messages for the OpenAI API
    const messages = []
    
    // Add the system message
    const systemMessage = createPersonaSystemMessage(persona)
    messages.push({ role: "system", content: systemMessage })
    
    // Add the previous messages
    if (previous_messages && previous_messages.length > 0) {
      // Only add the most recent 10 messages to avoid hitting token limits
      const recentMessages = previous_messages.slice(-10)
      messages.push(...recentMessages)
    }
    
    console.log("Generating response with OpenAI API...")
    
    // Call the OpenAI API to generate a response
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
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
    
    console.log(`Generated response for ${persona.name}: ${response.substring(0, 20)}...`)
    
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
