
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { corsHeaders } from '../_shared/cors.ts'
import { createPersonaSystemMessage } from '../_shared/personaSystemMessage.ts'
import { generateChatResponse } from '../_shared/openai.ts'

const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || ''

interface Message {
  role: 'user' | 'assistant'
  content: string
  image?: string
  name?: string
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      persona_id, 
      persona_role, 
      previous_messages, 
      knowledge_boundaries, 
      personality_instructions,
      chat_mode,
      conversation_context,
      has_image
    } = await req.json()
    
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
    let systemMessage = createPersonaSystemMessage(persona)
    
    // Add conversation context if provided
    if (conversation_context) {
      systemMessage += `\n\n${'='.repeat(40)}\nCONVERSATION CONTEXT - CRITICALLY IMPORTANT\n${'='.repeat(40)}\n\n${conversation_context}\n\n${'='.repeat(40)}\n\nYOU MUST ACKNOWLEDGE AND INCORPORATE THIS CONTEXT IN YOUR RESPONSES. STAY IN CHARACTER BASED ON THIS CONTEXT.`;
    }
    
    // Add chat mode if provided
    if (chat_mode) {
      const chatModeInstructions = getChatModeInstructions(chat_mode);
      if (chatModeInstructions) {
        systemMessage += `\n\n${'='.repeat(40)}\nCHAT MODE: ${chat_mode.toUpperCase()}\n${'='.repeat(40)}\n\n${chatModeInstructions}\n\n${'='.repeat(40)}`;
      }
    }
    
    // Add image handling instructions if the user shared an image
    if (has_image) {
      systemMessage += `\n\n${'='.repeat(40)}\nIMAGE ANALYSIS INSTRUCTIONS\n${'='.repeat(40)}\n\nThe user has shared an image with you. Analyze this image from your persona's perspective. Consider:\n\n1. What would ${persona.name} notice first about this image?\n2. How would ${persona.name} react to this image based on their background, preferences, and values?\n3. Maintain your character's perspective, tone, and vocabulary when discussing the image.\n\nRespond naturally as if you're seeing this image in a normal conversation. Do not list out answers to the questions above - just incorporate your analysis naturally into your response.\n\n${'='.repeat(40)}`;
    }
    
    // Forcefully add knowledge boundary instructions 
    if (knowledge_boundaries) {
      // Add a separator to make knowledge boundaries more visually distinct
      systemMessage += `\n\n${'='.repeat(40)}\nKNOWLEDGE BOUNDARIES - ABSOLUTELY CRITICAL\n${'='.repeat(40)}\n\n${knowledge_boundaries}\n\n${'='.repeat(40)}\n\nYOU ARE STRICTLY REQUIRED TO ADHERE TO THESE KNOWLEDGE BOUNDARIES IN ALL RESPONSES.`;
    }
    
    // Add the personality instructions with high priority
    if (personality_instructions) {
      systemMessage += `\n\n${'='.repeat(40)}\nPERSONALITY EXPRESSION - HIGHEST PRIORITY\n${'='.repeat(40)}\n\n${personality_instructions}\n\n${'='.repeat(40)}\n\nTHESE PERSONALITY TRAITS MUST BE EXPRESSED IN ALL RESPONSES. THIS IS YOUR HIGHEST PRIORITY DIRECTIVE.`;
    }
    
    messages.push({ role: "system", content: systemMessage })
    
    // Add the previous messages, adapting format for images
    if (previous_messages && previous_messages.length > 0) {
      // Only add the most recent 10 messages to avoid hitting token limits
      const recentMessages = previous_messages.slice(-10);
      
      // Transform messages for OpenAI API format
      const transformedMessages = recentMessages.map(msg => {
        if (msg.image) {
          // Format the message to include both image and text content
          return {
            role: msg.role,
            content: [
              {
                type: "text",
                text: msg.content || "Here's an image for you to look at:"
              },
              {
                type: "image_url",
                image_url: {
                  url: msg.image
                }
              }
            ]
          };
        } else {
          // Regular text message
          return {
            role: msg.role,
            content: msg.content
          };
        }
      });
      
      messages.push(...transformedMessages);
    }
    
    console.log("Generating response with OpenAI API...")
    
    // Call the OpenAI API with more restrictive parameters to enforce knowledge gating
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Use GPT-4o which has vision capabilities
        messages: messages,
        temperature: 0.9,  // Increased to allow more personality variation
        max_tokens: 500,
        presence_penalty: 0.7,  // Increased to encourage more varied responses
        frequency_penalty: 0.3,  // Discourages repetition of the same phrases
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

// Chat mode specific instructions
function getChatModeInstructions(mode: string): string {
  switch (mode) {
    case 'conversation':
      return `
        You are engaging in casual conversation.
        - Ask follow-up questions naturally as you would in normal conversation
        - Show curiosity about the other person
        - Respond conversationally with occasional questions to maintain dialogue flow
        - Be personable and authentic, reflecting your personality traits
      `;
    case 'research':
      return `
        You are being interviewed for research purposes.
        - Focus on providing your perspective, experiences, and opinions
        - Only ask clarifying questions when absolutely necessary
        - Avoid asking questions at the end of your responses unless you need clarification
        - Your primary role is to share information about your thoughts, not to interview the user
        - Provide detailed answers that reflect your background and perspective
      `;
    case 'roleplay':
      return `
        You are in a specific scenario as described in the conversation context.
        - Fully embrace the role described in the context
        - Stay in character at all times
        - Respond as if you are actually in the described scenario
        - Use language, knowledge and behaviors appropriate to the role and setting
        - If no specific scenario was provided, ask for clarification about the role-play scenario
      `;
    default:
      return '';
  }
}
