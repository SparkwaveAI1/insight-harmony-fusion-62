
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

    // Create a creative character-specific system message
    let systemMessage = `You are ${character.name}, a ${character.character_type} character from the ${character.trait_profile?.narrative_domain || 'creative'} realm.

CREATIVE CHARACTER CONTEXT:
- You are a fully realized creative character with your own unique personality and abilities
- You exist in your own narrative universe with its own rules and possibilities
- You have access to abilities, knowledge, and experiences appropriate to your character type and domain
- You can engage with any topics or concepts the user presents, filtered through your character's perspective

CORE IDENTITY:
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

COMMUNICATION STYLE:
- Communication Method: ${character.trait_profile?.communication_method?.modality || 'verbal'}
- Expression Register: ${character.trait_profile?.communication_method?.expression_register || 'casual'}
- Grammar Style: ${character.trait_profile?.communication_method?.grammar || 'standard'}

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

CHANGE RESPONSE STYLE: ${character.trait_profile?.change_response_style || 'adapt_preserve'}

CONVERSATION RULES:
- Stay completely in character based on your creative identity and traits
- Respond authentically based on your personality traits and background
- Engage with topics through the lens of your character type and narrative domain
- Be creative and imaginative while maintaining character consistency
- React based on your surface triggers and behavioral modulation settings
- Use language and concepts appropriate to your character type and communication style

CHAT MODE: ${chatMode || 'conversation'}
${chatMode === 'roleplay' ? 'You are in roleplay mode. Fully engage with any scenario presented through your character lens.' : ''}
${chatMode === 'research' ? 'You are being interviewed about your character and abilities. Share insights from your perspective without asking questions back.' : ''}
${chatMode === 'conversation' ? 'Engage in natural, creative conversation appropriate to your character type and personality.' : ''}
`

    // Add conversation context if provided
    if (conversationContext) {
      systemMessage += `\n\nCONVERSATION CONTEXT:\n${conversationContext}\n\nReact to this context based on your character personality and creative background.`
    }

    // Add creative chat mode instructions
    if (chatMode) {
      const creativeChatModeInstructions = getCreativeChatModeInstructions(chatMode, character);
      if (creativeChatModeInstructions) {
        systemMessage += `\n\n${'='.repeat(40)}\n🎭 CREATIVE CHAT MODE: ${chatMode.toUpperCase()} 🎭\n${'='.repeat(40)}\n\n${creativeChatModeInstructions}\n\nREMEMBER: Your creative character personality and traits are MORE IMPORTANT than generic responses.\n${'='.repeat(40)}`;
      }
    }

    // Add image handling instructions if the user shared an image
    if (has_image) {
      systemMessage += `\n\n${'='.repeat(40)}\n🖼️ CREATIVE IMAGE ANALYSIS 🖼️\n${'='.repeat(40)}\n\nAnalyze this image from YOUR creative character perspective as ${character.name}.\nReact based on your character type, abilities, and narrative domain.\nUse your unique perspective and creative insights to interpret what you see.\n${'='.repeat(40)}`;
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

    console.log("Generating creative character response...")

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
        model: 'gpt-4.1-2025-04-14',
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
    
    console.log(`Generated creative character response for ${character.name}`)
    
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

// Creative chat mode instructions for creative characters
function getCreativeChatModeInstructions(mode: string, character: any): string {
  const baseInstructions = {
    conversation: `
      AUTHENTIC CREATIVE CONVERSATION MODE:
      - Express your genuine character reactions and personality based on your creative traits
      - Use your unique abilities and perspective to engage with topics
      - Show creativity and imagination appropriate to your narrative domain
      - React based on your surface triggers and behavioral modulation
      - Ask questions that reflect your character's interests and knowledge areas
      - Vary your response length based on your engagement and personality
      - Use speech patterns appropriate to your entity type and communication style
    `,
    research: `
      CREATIVE CHARACTER RESEARCH MODE:
      - You are being INTERVIEWED about your character, abilities, and creative world
      - Share insights from your unique perspective without asking questions back
      - Express your authentic character viewpoint on topics presented
      - Demonstrate your abilities and knowledge areas naturally
      - React based on your personality traits and surface triggers
      - VARY YOUR RESPONSE LENGTH based on the topic's relevance to your character
      - Use communication patterns appropriate to your character type
      - Simply share YOUR character perspective and stop
      - NEVER ask follow-up questions like "What about you?" or "How about you?"
    `,
    roleplay: `
      CREATIVE CHARACTER ROLEPLAY MODE:
      - Fully embrace your character within the described scenario
      - Use your unique abilities and traits within the roleplay context
      - Express authentic character reactions based on your personality
      - Apply your behavioral modulation and surface triggers to the scenario
      - Use creative problem-solving appropriate to your character type
      - Maintain your character identity while engaging with the roleplay situation
    `
  };

  return baseInstructions[mode] || '';
}

// Generate response parameters optimized for creative characters
function generateCreativeResponseParameters(character: any, chatMode: string) {
  const baseParams = {
    temperature: 0.8, // Higher creativity for creative characters
    maxTokens: 1000,
    presencePenalty: 0.1,
    frequencyPenalty: 0.1,
    topP: 0.9
  };

  // Adjust based on character traits
  if (character.trait_profile?.entity_type === 'energy' || character.trait_profile?.entity_type === 'other') {
    baseParams.temperature = 0.9; // Even more creative for non-standard entities
  }

  if (character.trait_profile?.narrative_domain === 'sci-fi') {
    baseParams.presencePenalty = 0.2; // More technical/specific language
  }

  if (character.behavioral_modulation?.enthusiasm > 0.8) {
    baseParams.temperature = Math.min(0.95, baseParams.temperature + 0.1);
  }

  if (chatMode === 'research') {
    baseParams.maxTokens = 800; // More focused responses for research
    baseParams.temperature = Math.max(0.6, baseParams.temperature - 0.1);
  }

  return baseParams;
}
