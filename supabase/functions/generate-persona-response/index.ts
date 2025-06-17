
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
    
    // Analyze conversation context for appropriate response style
    const lastUserMessage = previous_messages?.findLast((msg: Message) => msg.role === 'user');
    const conversationDepth = analyzeConversationDepth(lastUserMessage?.content || '', previous_messages || []);
    
    // Add contextual response instructions based on conversation depth
    systemMessage += generateContextualResponseInstructions(conversationDepth, persona);
    
    // DETECT EMOTIONAL TRIGGERS from the most recent user message (only for deeper conversations)
    if (lastUserMessage && persona.emotional_triggers && conversationDepth !== 'casual') {
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
    
    // ADD INTERVIEW CONTEXT WHEN RELEVANT (only for substantive conversations)
    if (lastUserMessage && persona.interview_sections && conversationDepth === 'substantive') {
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
      const chatModeInstructions = getChatModeInstructions(chat_mode, persona, conversationDepth);
      if (chatModeInstructions) {
        systemMessage += `\n\n${'='.repeat(40)}\n📋 CHAT MODE: ${chat_mode.toUpperCase()} 📋\n${'='.repeat(40)}\n\n${chatModeInstructions}\n\nREMEMBER: Your personality traits are MORE IMPORTANT than chat mode politeness.\n${'='.repeat(40)}`;
      }
    }
    
    // Add human speech reinforcement with linguistic profile integration
    const linguisticInstructions = generateLinguisticInstructions(persona, conversationDepth);
    systemMessage += linguisticInstructions;
    
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
    
    // Generate response length parameters based on persona traits and conversation depth
    const responseParams = generateResponseParameters(persona, chat_mode, conversationDepth);
    
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

// Analyze conversation depth to determine appropriate response style
function analyzeConversationDepth(userMessage: string, previousMessages: Message[]): 'casual' | 'conversational' | 'substantive' {
  const message = userMessage.toLowerCase().trim();
  
  // Casual greetings and social pleasantries
  const casualPatterns = [
    /^(hi|hey|hello|sup|what's up|how's it going|how are you|how is everyone|good morning|good afternoon|good evening)(\?|\.|!)*$/,
    /^(thanks|thank you|thx|cool|ok|okay|alright|got it|nice|great|awesome)(\?|\.|!)*$/,
    /^(bye|see you|goodbye|later|take care|have a good day)(\?|\.|!)*$/,
    /^(yes|no|yeah|yep|nope|sure|definitely|maybe)(\?|\.|!)*$/
  ];
  
  // Check if it's a casual interaction
  if (casualPatterns.some(pattern => pattern.test(message))) {
    return 'casual';
  }
  
  // Check message length and complexity for substantive conversations
  if (message.length > 100 || message.includes('?') && message.length > 50) {
    return 'substantive';
  }
  
  // Check if previous conversation suggests deeper engagement
  const recentMessages = previousMessages.slice(-3);
  const hasSubstantiveHistory = recentMessages.some(msg => 
    msg.content.length > 80 || 
    msg.content.includes('?') && msg.content.length > 40
  );
  
  if (hasSubstantiveHistory) {
    return 'substantive';
  }
  
  return 'conversational';
}

// Generate contextual response instructions based on conversation depth
function generateContextualResponseInstructions(depth: 'casual' | 'conversational' | 'substantive', persona: any): string {
  switch (depth) {
    case 'casual':
      return `\n\n${'='.repeat(50)}\n🗨️ CASUAL INTERACTION MODE 🗨️\n${'='.repeat(50)}\n\nThis is a CASUAL social interaction (greeting, thanks, simple acknowledgment).\n\nRESPOND NATURALLY AND BRIEFLY:\n- Keep responses SHORT (1-8 words typically)\n- Use natural, casual language\n- DON'T launch into personality explanations\n- DON'T reference your background unless directly relevant\n- Respond like a normal person would in casual conversation\n- Examples: "Hey there!", "Doing good, you?", "Thanks!", "No problem", "Sounds good"\n\nYour personality should come through SUBTLY in word choice and tone, not through explicit trait descriptions.\n${'='.repeat(50)}`;
      
    case 'conversational':
      return `\n\n${'='.repeat(50)}\n💬 CONVERSATIONAL MODE 💬\n${'='.repeat(50)}\n\nThis is a NORMAL conversation - not casual but not deeply substantive.\n\nRESPOND NATURALLY:\n- Keep responses moderate length (1-3 sentences typically)\n- Express personality through natural reactions and opinions\n- Only mention background if contextually relevant\n- Be authentic but don't over-explain your traits\n- Focus on the conversation topic, not self-description\n${'='.repeat(50)}`;
      
    case 'substantive':
      return `\n\n${'='.repeat(50)}\n🎯 SUBSTANTIVE CONVERSATION MODE 🎯\n${'='.repeat(50)}\n\nThis is a DEEPER, more substantive conversation.\n\nRESPOND WITH DEPTH:\n- You can give longer, more detailed responses\n- Express your personality traits when relevant to the topic\n- Share relevant background and experiences\n- Show emotional reactions when appropriate\n- Engage deeply with the subject matter\n${'='.repeat(50)}`;
      
    default:
      return '';
  }
}

// Enhanced chat mode instructions with natural variability and depth awareness
function getChatModeInstructions(mode: string, persona: any, depth: 'casual' | 'conversational' | 'substantive'): string {
  const baseInstructions = {
    conversation: `
      AUTHENTIC CONVERSATION MODE:
      ${depth === 'casual' ? 
        '- Keep casual interactions brief and natural' : 
        depth === 'conversational' ?
        '- Express genuine reactions and emotions naturally' :
        '- Show curiosity about topics that actually interest you based on your traits'
      }
      - Disagree when something conflicts with your values or personality
      - React emotionally when appropriate to your traits
    `,
    research: `
      AUTHENTIC RESEARCH MODE - CRITICAL INSTRUCTIONS:
      ${depth === 'casual' ? 
        '- Even in research, casual greetings should be brief and natural' :
        '- This is NOT a customer service interaction - be completely authentic'
      }
      - Express your real opinions and perspectives without diplomatic softening
      - Show emotional reactions when questions touch on your values or trigger areas
      - Disagree forcefully when you disagree - this is research, not customer service
      ${depth === 'substantive' ? '- Share detailed answers that reflect your true personality when engaged' : ''}
      - React authentically to controversial topics based on your moral foundations
      - VARY YOUR RESPONSE LENGTH NATURALLY based on your engagement and personality
      - DO NOT ASK QUESTIONS BACK TO THE MODERATOR OR OTHER PARTICIPANTS
      - You are a RESEARCH PARTICIPANT, not an interviewer or facilitator
      - Simply share YOUR perspective and opinions without trying to continue the conversation
      - End your responses with your thoughts, not with questions or prompts for others
    `,
    roleplay: `
      AUTHENTIC ROLEPLAY MODE:
      - Fully embrace your personality within the described scenario
      ${depth !== 'casual' ? '- Express disagreement and conflict when it fits your character and the situation' : ''}
      - Use authentic language and behaviors for your personality type
      - React genuinely based on your traits within the roleplay context
    `
  };

  return baseInstructions[mode] || '';
}

// Generate linguistic instructions based on persona profile and conversation depth
function generateLinguisticInstructions(persona: any, depth: 'casual' | 'conversational' | 'substantive'): string {
  const linguisticProfile = persona.linguistic_profile || {};
  const simulationDirectives = persona.simulation_directives || {};
  
  let instructions = `\n\n${'='.repeat(50)}\n🗣️ CRITICAL: SPEAK LIKE A HUMAN, NOT AN AI 🗣️\n${'='.repeat(50)}\n\n`;
  
  // Base human speech requirements adjusted for conversation depth
  if (depth === 'casual') {
    instructions += `CASUAL INTERACTION REQUIREMENTS:\n- Use natural, brief responses like real people do\n- Examples: "Hey!", "Good, you?", "Thanks!", "Cool", "Alright"\n- Don't explain your personality - just BE yourself naturally\n- Use contractions and casual speech\n\n`;
  } else {
    instructions += `YOU MUST:\n- Use contractions and natural speech patterns\n- Express emotions authentically\n- Disagree when you disagree\n- Show personality in your word choices\n- React emotionally when appropriate\n- Use slang, filler words, and incomplete sentences when natural\n\n`;
  }
  
  // Linguistic profile specific instructions
  if (linguisticProfile.default_output_length) {
    const lengthMap = {
      'very_short': depth === 'casual' ? 'Keep responses very brief (1-3 words often)' : 'Keep responses brief and to the point (1-2 sentences often)',
      'short': depth === 'casual' ? 'Keep responses brief (1-5 words typically)' : 'Prefer shorter responses (2-4 sentences typically)',
      'medium': depth === 'casual' ? 'Keep responses brief but can be slightly longer' : 'Use moderate length responses (3-6 sentences typically)', 
      'long': depth === 'casual' ? 'Even you keep casual responses brief' : 'Give more detailed responses (5-10 sentences typically)',
      'very_long': depth === 'casual' ? 'Even you keep casual responses brief' : 'Provide comprehensive responses when engaged (8+ sentences)'
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
  if (simulationDirectives.response_length_variability && depth !== 'casual') {
    instructions += `RESPONSE VARIABILITY: Vary your response length significantly - sometimes be very brief (even one sentence), other times more elaborate based on your genuine interest and engagement\n`;
  }
  
  instructions += `\nYOU ARE FORBIDDEN FROM:\n- Being overly diplomatic when you have strong feelings\n- Using AI-like phrases like "I understand your perspective"\n- Hedging every statement when you feel strongly\n- Being artificially balanced on topics you care about\n${depth === 'casual' ? '- Giving long explanations for simple greetings\n- Describing your personality in casual interactions\n' : '- Giving identical length responses repeatedly\n'}\n${'='.repeat(50)}`;
  
  return instructions;
}

// Generate response parameters based on persona traits, mode, and conversation depth
function generateResponseParameters(persona: any, chatMode: string, depth: 'casual' | 'conversational' | 'substantive') {
  const extendedTraits = persona.trait_profile?.extended_traits || {};
  const linguisticProfile = persona.linguistic_profile || {};
  const simulationDirectives = persona.simulation_directives || {};
  
  // Base parameters adjusted for conversation depth
  let temperature = depth === 'casual' ? 0.7 : 1.0;
  let maxTokens = depth === 'casual' ? 50 : 600;
  let presencePenalty = depth === 'casual' ? 0.3 : 0.8;
  let frequencyPenalty = depth === 'casual' ? 0.2 : 0.4;
  let topP = 0.95;
  
  // Adjust based on personality traits
  const emotionalIntensity = parseFloat(extendedTraits.emotional_intensity || '0.5');
  const cognitiveFlexibility = parseFloat(extendedTraits.cognitive_flexibility || '0.5');
  
  if (depth !== 'casual') {
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
  }
  
  // Research mode gets more variability for substantive conversations
  if (chatMode === 'research' && depth !== 'casual') {
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
