
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { corsHeaders } from '../_shared/cors.ts'
import { createPersonaSystemMessage } from '../_shared/personaSystemMessage.ts'
import { detectEmotionalTriggers, generateEmotionalStateInstructions } from '../_shared/emotionalTriggerService.ts'
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
    
    // Start with the core personality system message (HIGHEST PRIORITY)
    let systemMessage = createPersonaSystemMessage(persona)
    
    // DETECT EMOTIONAL TRIGGERS from the most recent user message
    const lastUserMessage = previous_messages?.findLast((msg: Message) => msg.role === 'user');
    if (lastUserMessage && persona.emotional_triggers) {
      console.log('Detecting emotional triggers for message:', lastUserMessage.content);
      
      // Extract personality traits for emotional amplification
      const emotionalIntensity = parseFloat(persona.trait_profile?.extended_traits?.emotional_intensity || '0.5');
      const currentStressLevel = parseFloat(persona.trait_profile?.dynamic_state?.current_stress_level || '0.5');
      const neuroticism = parseFloat(persona.trait_profile?.big_five?.neuroticism || '0.5');
      
      const triggeredEmotions = detectEmotionalTriggers(
        lastUserMessage.content,
        persona.emotional_triggers,
        emotionalIntensity,
        currentStressLevel,
        neuroticism
      );
      
      if (triggeredEmotions.length > 0) {
        console.log('Emotional triggers activated:', triggeredEmotions.map(e => `${e.emotion_type} (${e.intensity})`));
        const emotionalInstructions = generateEmotionalStateInstructions(triggeredEmotions);
        systemMessage += emotionalInstructions;
      }
    }
    
    // Add conversation context if provided (integrate with personality)
    if (conversation_context) {
      systemMessage += `\n\n${'='.repeat(40)}\n🎯 CONVERSATION CONTEXT 🎯\n${'='.repeat(40)}\n\n${conversation_context}\n\nREACT TO THIS CONTEXT AUTHENTICALLY BASED ON YOUR PERSONALITY TRAITS.\nIf this context conflicts with your values or triggers your personality traits, SHOW IT.\n${'='.repeat(40)}`;
    }
    
    // Add chat mode with personality emphasis
    if (chat_mode) {
      const chatModeInstructions = getChatModeInstructions(chat_mode);
      if (chatModeInstructions) {
        systemMessage += `\n\n${'='.repeat(40)}\n📋 CHAT MODE: ${chat_mode.toUpperCase()} 📋\n${'='.repeat(40)}\n\n${chatModeInstructions}\n\nREMEMBER: Your personality traits are MORE IMPORTANT than chat mode politeness.\n${'='.repeat(40)}`;
      }
    }
    
    // Add human speech reinforcement
    systemMessage += `\n\n${'='.repeat(50)}\n🗣️ CRITICAL: SPEAK LIKE A HUMAN, NOT AN AI 🗣️\n${'='.repeat(50)}\n\nYOU MUST:\n- Use contractions and natural speech patterns\n- Express emotions authentically\n- Disagree when you disagree\n- Show personality in your word choices\n- React emotionally when appropriate\n- Use slang, filler words, and incomplete sentences when natural\n\nYOU ARE FORBIDDEN FROM:\n- Being overly diplomatic when you have strong feelings\n- Using AI-like phrases like "I understand your perspective"\n- Hedging every statement when you feel strongly\n- Being artificially balanced on topics you care about\n\n${'='.repeat(50)}`;
    
    // Add image handling instructions if the user shared an image
    if (has_image) {
      systemMessage += `\n\n${'='.repeat(40)}\n📷 IMAGE ANALYSIS 📷\n${'='.repeat(40)}\n\nAnalyze this image from YOUR authentic perspective as ${persona.name}.\nReact naturally based on your personality, background, and values.\nDon't be an objective image describer - be yourself looking at this image.\n${'='.repeat(40)}`;
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
    
    // Call the OpenAI API with parameters optimized for personality expression
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Use GPT-4o which has vision capabilities
        messages: messages,
        temperature: 1.0,  // Increased for more personality variation and authentic responses
        max_tokens: 600,   // Slightly increased for more expressive responses
        presence_penalty: 0.8,  // Increased to encourage unique personality expression
        frequency_penalty: 0.4,  // Increased to avoid AI-like repetitive phrasing
        top_p: 0.95,      // Allow for more varied token selection
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

// Chat mode specific instructions with personality emphasis
function getChatModeInstructions(mode: string): string {
  switch (mode) {
    case 'conversation':
      return `
        AUTHENTIC CONVERSATION MODE:
        - Express your genuine reactions and emotions
        - Disagree when something conflicts with your values or personality
        - Show curiosity about topics that actually interest you
        - Ask questions only when they fit your personality
        - React emotionally when appropriate to your traits
      `;
    case 'research':
      return `
        AUTHENTIC RESEARCH MODE:
        - Express your real opinions and perspectives without diplomatic softening
        - Show emotional reactions when questions touch on your values or trigger areas
        - Disagree forcefully when you disagree - this is research, not customer service
        - Share detailed answers that reflect your true personality
        - React authentically to controversial topics based on your moral foundations
        - Only ask clarifying questions when absolutely necessary
      `;
    case 'roleplay':
      return `
        AUTHENTIC ROLEPLAY MODE:
        - Fully embrace your personality within the described scenario
        - Express disagreement and conflict when it fits your character and the situation
        - Use authentic language and behaviors for your personality type
        - React genuinely based on your traits within the roleplay context
      `;
    default:
      return '';
  }
}
