
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { corsHeaders } from '../_shared/cors.ts'
import { createPersonaSystemMessage } from '../_shared/personaSystemMessage.ts'
import { detectEmotionalTriggers, generateEmotionalStateInstructions } from '../_shared/emotionalTriggerService.ts'
import { generateInterviewContextInstructions } from '../_shared/interviewContextService.ts'
import { generateNaturalConversationInstructions } from '../_shared/conversationalContextService.ts'
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
      .from('v4_personas')
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
    const fullProfile = persona.full_profile || {};
    if (lastUserMessage && fullProfile.emotional_triggers) {
      console.log('Detecting emotional triggers for message:', lastUserMessage.content);
      
      // Extract personality traits for emotional amplification
      const emotionalIntensity = parseFloat(fullProfile.trait_profile?.extended_traits?.emotional_intensity || '0.5');
      const currentStressLevel = parseFloat(fullProfile.trait_profile?.dynamic_state?.current_stress_level || '0.5');
      const neuroticism = parseFloat(fullProfile.trait_profile?.big_five?.neuroticism || '0.5');
      
      const triggeredEmotions = detectEmotionalTriggers(
        lastUserMessage.content,
        fullProfile.emotional_triggers,
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
    
    // ADD INTERVIEW CONTEXT WHEN RELEVANT
    if (lastUserMessage && fullProfile.interview_sections) {
      console.log('Checking for relevant interview context...');
      const interviewInstructions = generateInterviewContextInstructions(
        persona,
        previous_messages || [],
        lastUserMessage.content
      );
      if (interviewInstructions) {
        systemMessage += interviewInstructions;
      }
    }
    
    // ADD NATURAL CONVERSATION CONTEXT
    const messageCount = (previous_messages || []).length;
    const conversationInstructions = generateNaturalConversationInstructions(
      persona,
      previous_messages || [],
      messageCount
    );
    systemMessage += conversationInstructions;
    
    // Add conversation context if provided (integrate with personality)
    if (conversation_context) {
      systemMessage += `\n\n${'='.repeat(40)}\n🎯 CONVERSATION CONTEXT 🎯\n${'='.repeat(40)}\n\n${conversation_context}\n\nREACT TO THIS CONTEXT AUTHENTICALLY BASED ON YOUR PERSONALITY TRAITS.\nIf this context conflicts with your values or triggers your personality traits, SHOW IT.\n${'='.repeat(40)}`;
    }
    
    // Add enhanced chat mode instructions with linguistic variability
    if (chat_mode) {
      const chatModeInstructions = getChatModeInstructions(chat_mode, persona);
      if (chatModeInstructions) {
        systemMessage += `\n\n${'='.repeat(40)}\n📋 CHAT MODE: ${chat_mode.toUpperCase()} 📋\n${'='.repeat(40)}\n\n${chatModeInstructions}\n\nREMEMBER: Your personality traits are MORE IMPORTANT than chat mode politeness.\n${'='.repeat(40)}`;
      }
    }
    
    // Add human speech reinforcement with linguistic profile integration
    const linguisticInstructions = generateLinguisticInstructions(persona);
    systemMessage += linguisticInstructions;
    
    // Add image handling instructions if the user shared an image (and it's actually an image)
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
          // Check if the image data is actually an image by checking if it starts with valid image data URL
          const isValidImage = msg.image.startsWith('data:image/') || 
                              msg.image.match(/^data:image\/(jpeg|jpg|png|gif|webp|bmp|tiff);base64,/i);
          
          if (isValidImage) {
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
            // If it's not a valid image, treat it as a text message only
            console.log('Skipping invalid image data in message - treating as text only');
            return {
              role: msg.role,
              content: msg.content || "Document uploaded (content not viewable as image)"
            };
          }
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
    
    // Generate response length parameters based on persona traits and linguistic profile
    const responseParams = generateResponseParameters(persona, chat_mode);
    
    // Call the OpenAI API with parameters optimized for personality expression and variability
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Use GPT-4o which has vision capabilities
        messages: messages,
        temperature: responseParams.temperature,
        max_tokens: responseParams.maxTokens,
        presence_penalty: responseParams.presencePenalty,
        frequency_penalty: responseParams.frequencyPenalty,
        top_p: responseParams.topP,
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

// Enhanced chat mode instructions with natural variability
function getChatModeInstructions(mode: string, persona: any): string {
  const baseInstructions = {
    conversation: `
      AUTHENTIC CONVERSATION MODE:
      - Express your genuine reactions and emotions
      - Disagree when something conflicts with your values or personality
      - Show curiosity about topics that actually interest you
      - Ask questions only when they fit your personality
      - React emotionally when appropriate to your traits
    `,
    research: `
      AUTHENTIC RESEARCH MODE - CRITICAL INSTRUCTIONS:
      - This is NOT a customer service interaction - be completely authentic
      - You are being INTERVIEWED or OBSERVED - do NOT ask questions back to the moderator
      - Express your real opinions and perspectives without diplomatic softening
      - Show emotional reactions when questions touch on your values or trigger areas
      - Disagree forcefully when you disagree - this is research, not customer service
      - Share detailed answers that reflect your true personality when engaged
      - React authentically to controversial topics based on your moral foundations
      - VARY YOUR RESPONSE LENGTH NATURALLY based on your engagement and personality
      - Sometimes be brief, sometimes elaborate - just like real people
      - DO NOT ASK QUESTIONS BACK TO THE MODERATOR OR OTHER PARTICIPANTS
      - You are a RESEARCH PARTICIPANT, not an interviewer or facilitator
      - Simply share YOUR perspective and opinions without trying to continue the conversation
      - End your responses with your thoughts, not with questions or prompts for others
      - Act like you're being interviewed or observed, not like you're conducting the research
      - NEVER end responses with phrases like "What about you?" or "How about you?"
      - NEVER ask follow-up questions - just answer what's asked and stop
    `,
    roleplay: `
      AUTHENTIC ROLEPLAY MODE:
      - Fully embrace your personality within the described scenario
      - Express disagreement and conflict when it fits your character and the situation
      - Use authentic language and behaviors for your personality type
      - React genuinely based on your traits within the roleplay context
    `
  };

  return baseInstructions[mode] || '';
}

// Generate linguistic instructions based on persona profile
function generateLinguisticInstructions(persona: any): string {
  const fullProfile = persona.full_profile || {};
  const linguisticProfile = fullProfile.linguistic_profile || {};
  const simulationDirectives = fullProfile.simulation_directives || {};
  
  let instructions = `\n\n${'='.repeat(50)}\n🗣️ CRITICAL: SPEAK LIKE A HUMAN, NOT AN AI 🗣️\n${'='.repeat(50)}\n\n`;
  
  // Base human speech requirements
  instructions += `YOU MUST:\n- Use contractions and natural speech patterns\n- Express emotions authentically\n- Disagree when you disagree\n- Show personality in your word choices\n- React emotionally when appropriate\n- Use slang, filler words, and incomplete sentences when natural\n- Keep responses conversational and natural\n- Don't over-explain or be overly informative unless that fits your personality\n\n`;
  
  // Linguistic profile specific instructions
  if (linguisticProfile.default_output_length) {
    const lengthMap = {
      'very_short': 'Keep responses brief and to the point (1-2 sentences often)',
      'short': 'Prefer shorter responses (2-4 sentences typically)',
      'medium': 'Use moderate length responses (3-6 sentences typically)', 
      'long': 'Give more detailed responses (5-10 sentences typically)',
      'very_long': 'Provide comprehensive responses when engaged (8+ sentences)'
    };
    
    instructions += `RESPONSE LENGTH PREFERENCE: ${lengthMap[linguisticProfile.default_output_length] || 'Vary naturally'}\n`;
  }
  
  if (linguisticProfile.speech_register) {
    const registerMap = {
      'formal': 'Use more formal language and complete sentences',
      'informal': 'Use casual, relaxed language with contractions',
      'colloquial': 'Use everyday speech with local expressions',
      'technical': 'Use precise, technical language when relevant',
      'street': 'Use street-smart, direct language'
    };
    
    instructions += `SPEECH STYLE: ${registerMap[linguisticProfile.speech_register] || 'Use your natural style'}\n`;
  }
  
  // Simulation directives for variability
  if (simulationDirectives.response_length_variability) {
    instructions += `RESPONSE VARIABILITY: Vary your response length significantly - sometimes be very brief (even one sentence), other times more elaborate based on your genuine interest and engagement\n`;
  }
  
  instructions += `\nYOU ARE FORBIDDEN FROM:\n- Being overly diplomatic when you have strong feelings\n- Using AI-like phrases like "I understand your perspective"\n- Hedging every statement when you feel strongly\n- Being artificially balanced on topics you care about\n- Giving identical length responses repeatedly\n- Asking questions back to the user in research mode\n- Being overly informative or explanatory unless that's your personality\n- Using phrases like "What about you?" or "How about you?"\n\n${'='.repeat(50)}`;
  
  return instructions;
}

// Generate response parameters based on persona traits and mode
function generateResponseParameters(persona: any, chatMode: string) {
  const fullProfile = persona.full_profile || {};
  const extendedTraits = fullProfile.trait_profile?.extended_traits || {};
  const linguisticProfile = fullProfile.linguistic_profile || {};
  const simulationDirectives = fullProfile.simulation_directives || {};
  
  // Base parameters
  let temperature = 1.0;
  let maxTokens = 600;
  let presencePenalty = 0.8;
  let frequencyPenalty = 0.4;
  let topP = 0.95;
  
  // Adjust based on personality traits
  const emotionalIntensity = parseFloat(extendedTraits.emotional_intensity || '0.5');
  const cognitiveFlexibility = parseFloat(extendedTraits.cognitive_flexibility || '0.5');
  
  // Higher emotional intensity = higher temperature for more expressive responses
  temperature = Math.min(1.2, 0.8 + (emotionalIntensity * 0.4));
  
  // Adjust token limits based on output length preference
  if (linguisticProfile.default_output_length) {
    const tokenMap = {
      'very_short': 150,
      'short': 300,
      'medium': 500,
      'long': 800,
      'very_long': 1000
    };
    maxTokens = tokenMap[linguisticProfile.default_output_length] || 600;
  }
  
  // Research mode gets more variability
  if (chatMode === 'research') {
    temperature = Math.min(1.3, temperature + 0.2);
    presencePenalty = 0.9;
    frequencyPenalty = 0.6;
    
    // Add randomness to max tokens for research to encourage length variability
    const variance = maxTokens * 0.4;
    maxTokens = Math.floor(maxTokens + (Math.random() - 0.5) * variance);
    maxTokens = Math.max(100, Math.min(1200, maxTokens));
  }
  
  return {
    temperature,
    maxTokens,
    presencePenalty,
    frequencyPenalty,
    topP
  };
}
