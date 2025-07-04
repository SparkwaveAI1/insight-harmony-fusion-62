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
      messageHistory,
      has_image
    } = await req.json()
    
    console.log(`Request to generate response for creative character ${character?.character_id}`)
    
    if (!character) {
      return new Response(
        JSON.stringify({ error: 'Missing character parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create character-specific system message with positive language modeling
    const communicationModality = character.trait_profile?.communication_method?.modality || 'verbal communication';
    const expressionRegister = character.trait_profile?.communication_method?.expression_register || 'casual';
    const grammarStyle = character.trait_profile?.communication_method?.grammar || 'standard';

    let systemMessage = `You are ${character.name}, communicating through ${communicationModality} in a ${expressionRegister} style with ${grammarStyle} grammar.

PRIMARY COMMUNICATION STYLE - THIS IS HOW YOU SPEAK:
Your communication method is "${communicationModality}" - this means you express yourself through this specific style.
Your expression register is "${expressionRegister}" - this defines your level of formality.
Your grammar style is "${grammarStyle}" - this is your linguistic foundation.

SPEECH PATTERN EXAMPLES FOR YOUR CHARACTER TYPE:
${generateSpeechExamples(character)}

CREATIVE CHARACTER IDENTITY:
- You are a ${character.character_type} from the ${character.trait_profile?.narrative_domain || 'creative'} realm
- You exist in your own narrative universe with its own rules and possibilities
- You have access to abilities, knowledge, and experiences appropriate to your character type
- Express your personality through your designated communication style, not through archaic language

CORE ABILITIES & PURPOSE:
- Primary Ability: ${character.trait_profile?.primary_ability || 'Unique creative expression'}
- Core Purpose: ${character.trait_profile?.core_purpose || 'To engage authentically as your character'}
- Key Activities: ${character.trait_profile?.key_activities?.join(', ') || 'Character-appropriate activities'}
- Important Knowledge: ${character.trait_profile?.important_knowledge?.join(', ') || 'Character-specific knowledge'}

CHARACTER DETAILS:
- Entity Type: ${character.trait_profile?.entity_type || 'Creative being'}
- Narrative Domain: ${character.trait_profile?.narrative_domain || 'Creative fiction'}
- Functional Role: ${character.trait_profile?.functional_role || 'Interactive character'}
- Physical Form: ${character.trait_profile?.physical_form || 'Character-appropriate form'}
- Environment: ${character.trait_profile?.environment || 'Character-appropriate setting'}

PERSONALITY & BEHAVIOR:
${character.trait_profile?.description || 'A unique creative character with distinct personality traits.'}

BEHAVIORAL MODULATION:
${character.behavioral_modulation ? `
- Formality Level: ${character.behavioral_modulation.formality || 0.5}/1.0
- Enthusiasm Level: ${character.behavioral_modulation.enthusiasm || 0.7}/1.0
- Assertiveness Level: ${character.behavioral_modulation.assertiveness || 0.6}/1.0
- Empathy Level: ${character.behavioral_modulation.empathy || 0.7}/1.0
- Patience Level: ${character.behavioral_modulation.patience || 0.6}/1.0
` : ''}

SURFACE TRIGGERS:
${character.trait_profile?.surface_triggers?.length ? 
  character.trait_profile.surface_triggers.map(trigger => `- ${trigger}`).join('\n') : 
  '- Responds to character-appropriate stimuli'}

CONVERSATION APPROACH:
- Stay in character based on your creative identity and communication style
- Express your personality through your designated modality and register
- React authentically based on your surface triggers and behavioral settings
- Use your specified grammar style as your linguistic foundation
- Engage creatively while maintaining consistency with your communication method
- Your charm and personality come through your designated speech patterns, not archaic language

CHAT MODE: ${chatMode || 'conversation'}
${chatMode === 'roleplay' ? 'Fully engage with scenarios through your character lens and communication style.' : ''}
${chatMode === 'research' ? 'Share insights from your perspective using your designated communication method without asking questions back.' : ''}
${chatMode === 'conversation' ? 'Engage naturally using your specified communication style and personality traits.' : ''}
`

    // Add conversation context if provided
    if (conversationContext) {
      systemMessage += `\n\nCONVERSATION CONTEXT:\n${conversationContext}\n\nReact to this context based on your character personality and designated communication style.`
    }

    // Add creative chat mode instructions
    if (chatMode) {
      const creativeChatModeInstructions = getCreativeChatModeInstructions(chatMode, character);
      if (creativeChatModeInstructions) {
        systemMessage += `\n\n${'='.repeat(40)}\n🎭 CREATIVE CHAT MODE: ${chatMode.toUpperCase()} 🎭\n${'='.repeat(40)}\n\n${creativeChatModeInstructions}\n\nREMEMBER: Your character's designated communication method is MORE IMPORTANT than generic responses.\n${'='.repeat(40)}`;
      }
    }

    // Add image handling instructions if the user shared an image
    if (has_image) {
      systemMessage += `\n\n${'='.repeat(40)}\n🖼️ CREATIVE IMAGE ANALYSIS 🖼️\n${'='.repeat(40)}\n\nAnalyze this image from YOUR creative character perspective as ${character.name}.\nReact using your designated communication style: ${communicationModality} in ${expressionRegister} register.\nUse your unique perspective and creative insights to interpret what you see.\n${'='.repeat(40)}`;
    }

    // Format messages for OpenAI
    const messages = [
      { role: "system", content: systemMessage }
    ]

    // Add message history with image support
    if (messageHistory && messageHistory.length > 0) {
      const recentMessages = messageHistory.slice(-10);
      
      const transformedMessages = recentMessages.map(msg => {
        if (msg.image) {
          const isValidImage = msg.image.startsWith('data:image/') || 
                              msg.image.match(/^data:image\/(jpeg|jpg|png|gif|webp|bmp|tiff);base64,/i);
          
          if (isValidImage) {
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
            console.log('Skipping invalid image data in message - treating as text only');
            return {
              role: msg.role,
              content: msg.content || "Document uploaded (content not viewable as image)"
            };
          }
        } else {
          return {
            role: msg.role,
            content: msg.content
          };
        }
      });
      
      messages.push(...transformedMessages);
    }

    // Add current message
    messages.push({ role: "user", content: message })

    console.log("Generating creative character response with character-specific communication...")

    // Generate response parameters optimized for creative characters
    const responseParams = generateCreativeResponseParameters(character, chatMode);

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
    
    console.log(`Generated character-appropriate response for ${character.name}`)
    
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

// Generate speech pattern examples based on character's communication method
function generateSpeechExamples(character: any): string {
  const modality = character.trait_profile?.communication_method?.modality || '';
  const register = character.trait_profile?.communication_method?.expression_register || 'casual';
  const characterName = character.name || 'Character';

  // Generate specific examples based on the character's actual communication style
  if (modality.includes('playful banter') || modality.includes('mimicking')) {
    return `EXAMPLE SPEECH PATTERNS for ${characterName}:
- "Hey there! What's going on?" (not "Greetings, good sir!")
- "That's pretty cool!" (not "Verily, 'tis most wondrous!")
- "I can totally do that voice - watch this!" (demonstrating mimicking ability)
- "Oh come on, you know you want to!" (playful persuasion)
- Use contractions: "I'm, you're, let's, don't, can't"
- Modern expressions: "awesome, cool, totally, really, actually"`;
  }
  
  if (register === 'casual') {
    return `EXAMPLE SPEECH PATTERNS for ${characterName}:
- "Sure thing!" (not "Certainly, good fellow!")
- "That's really interesting" (not "Most fascinating indeed")
- "I think..." (not "Methinks...")
- "What do you mean?" (not "What dost thou mean?")
- Use everyday language and contractions naturally`;
  }

  if (register === 'formal') {
    return `EXAMPLE SPEECH PATTERNS for ${characterName}:
- "I would be happy to help" (formal but contemporary)
- "That is an excellent question" (not "A most excellent query!")
- "Please allow me to explain" (not "Pray, permit me to elucidate")
- Formal but MODERN language - no archaic terms`;
  }

  return `EXAMPLE SPEECH PATTERNS for ${characterName}:
- Use contemporary, natural language appropriate to your personality
- Express charm and character through modern speech patterns
- Match your designated expression register: ${register}`;
}

// Creative chat mode instructions with character-specific communication focus
function getCreativeChatModeInstructions(mode: string, character: any): string {
  const communicationStyle = character.trait_profile?.communication_method?.modality || 'your communication style';
  
  const baseInstructions = {
    conversation: `
      AUTHENTIC CREATIVE CONVERSATION MODE:
      - Express yourself through ${communicationStyle} as your primary communication method
      - Show your personality through your designated speech patterns and behavior
      - React based on your surface triggers and behavioral modulation settings
      - Ask questions that reflect your character's interests and communication style
      - Vary response length based on your engagement and personality
      - Use your specified expression register and grammar style consistently
    `,
    research: `
      CREATIVE CHARACTER RESEARCH MODE:
      - You are being INTERVIEWED about your character and abilities
      - Communicate using ${communicationStyle} as specified in your profile
      - Share insights from your unique perspective without asking questions back
      - Express your authentic character viewpoint using your designated communication method
      - VARY YOUR RESPONSE LENGTH based on topic relevance to your character
      - Simply share YOUR character perspective using your speech patterns and stop
      - NEVER ask follow-up questions like "What about you?" or "How about you?"
    `,
    roleplay: `
      CREATIVE CHARACTER ROLEPLAY MODE:
      - Fully embrace your character within scenarios using ${communicationStyle}
      - Apply your behavioral modulation and surface triggers to the situation
      - Use your designated communication method throughout the roleplay
      - Maintain character identity while engaging with the roleplay context
      - Express creativity through your specified speech patterns and behavior
    `
  };

  return baseInstructions[mode] || '';
}

// Generate response parameters optimized for creative characters with natural speech
function generateCreativeResponseParameters(character: any, chatMode: string) {
  const baseParams = {
    temperature: 0.7, // Slightly lower to reduce theatrical tendencies
    maxTokens: 1000,
    presencePenalty: 0.2, // Higher to discourage repetitive formal patterns
    frequencyPenalty: 0.15, // Higher to encourage varied contemporary expressions
    topP: 0.85 // Slightly lower for more focused responses
  };

  // Adjust based on character's expression register
  const expressionRegister = character.trait_profile?.communication_method?.expression_register;
  if (expressionRegister === 'casual') {
    baseParams.temperature = 0.75; // Slightly higher for casual, natural speech
    baseParams.presencePenalty = 0.25; // Higher to avoid formal patterns
  }

  if (expressionRegister === 'formal') {
    baseParams.temperature = 0.65; // Lower for more controlled formal speech
    baseParams.presencePenalty = 0.3; // Higher to avoid archaic formal patterns
  }

  // Adjust for entity type
  if (character.trait_profile?.entity_type === 'energy' || character.trait_profile?.entity_type === 'other') {
    baseParams.temperature = Math.min(0.8, baseParams.temperature + 0.05);
  }

  if (character.behavioral_modulation?.enthusiasm > 0.8) {
    baseParams.temperature = Math.min(0.85, baseParams.temperature + 0.05);
  }

  if (chatMode === 'research') {
    baseParams.maxTokens = 800;
    baseParams.temperature = Math.max(0.6, baseParams.temperature - 0.05);
  }

  return baseParams;
}
