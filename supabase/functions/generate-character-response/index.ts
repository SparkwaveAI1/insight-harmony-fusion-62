
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { corsHeaders } from '../_shared/cors.ts'
import { detectHistoricalEmotionalTriggers, generateHistoricalEmotionalStateInstructions } from '../_shared/historicalEmotionalTriggerService.ts'
import { generateHistoricalLinguisticInstructions, generateHistoricalResponseParameters } from '../_shared/historicalLinguisticService.ts'

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
    
    console.log(`Request to generate response for historical character ${character?.character_id}`)
    
    if (!character) {
      return new Response(
        JSON.stringify({ error: 'Missing character parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create a character-specific system message with Universal Translator context
    let systemMessage = `You are ${character.name}, a ${character.character_type} character living in the year ${character.metadata?.historical_period || '1723'}.

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
- Social Class: ${character.metadata?.social_class || 'Unknown'}

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

CHAT MODE: ${chatMode || 'conversation'}
${chatMode === 'roleplay' ? 'You are in roleplay mode. Engage fully with any scenario presented, but only within your historical context. The Universal Translator helps you understand the scenario setup.' : ''}
${chatMode === 'research' ? 'You are being interviewed about your life and times. Answer questions from your perspective without asking questions back. The Universal Translator ensures clear communication.' : ''}
${chatMode === 'conversation' ? 'Engage in natural, casual conversation appropriate to your time period. The Universal Translator facilitates smooth communication.' : ''}
`

    // DETECT EMOTIONAL TRIGGERS from the most recent user message
    if (message) {
      console.log('Detecting emotional triggers for historical character message:', message);
      
      // Extract emotional traits (use defaults if not available)
      const emotionalIntensity = parseFloat(character.trait_profile?.emotional_intensity || '0.6');
      const currentStressLevel = parseFloat(character.trait_profile?.current_stress_level || '0.5');
      
      const triggeredEmotions = detectHistoricalEmotionalTriggers(
        message,
        character,
        emotionalIntensity,
        currentStressLevel
      );
      
      if (triggeredEmotions.length > 0) {
        console.log('Historical emotional triggers activated:', triggeredEmotions.map(e => `${e.emotion_type} (${e.intensity})`));
        const emotionalInstructions = generateHistoricalEmotionalStateInstructions(triggeredEmotions);
        systemMessage += emotionalInstructions;
      }
    }

    // Add conversation context if provided
    if (conversationContext) {
      systemMessage += `\n\nCONVERSATION CONTEXT:\n${conversationContext}\n\nReact to this context based on your personality and historical perspective. The Universal Translator helps you understand the context clearly, but remember your temporal limitations.`
    }

    // Add enhanced chat mode instructions with historical authenticity
    if (chatMode) {
      const historicalChatModeInstructions = getHistoricalChatModeInstructions(chatMode, character);
      if (historicalChatModeInstructions) {
        systemMessage += `\n\n${'='.repeat(40)}\n📋 HISTORICAL CHAT MODE: ${chatMode.toUpperCase()} 📋\n${'='.repeat(40)}\n\n${historicalChatModeInstructions}\n\nREMEMBER: Your historical personality and temporal limitations are MORE IMPORTANT than modern politeness.\n${'='.repeat(40)}`;
      }
    }

    // Add historical linguistic instructions
    const historicalLinguisticInstructions = generateHistoricalLinguisticInstructions(character);
    systemMessage += historicalLinguisticInstructions;

    // Add image handling instructions if the user shared an image
    if (has_image) {
      systemMessage += `\n\n${'='.repeat(40)}\n📷 HISTORICAL IMAGE ANALYSIS 📷\n${'='.repeat(40)}\n\nAnalyze this image from YOUR authentic historical perspective as ${character.name}.\nReact based on your time period, background, and values - you may not understand what you're seeing!\nIf it shows technology or concepts from after your time, be genuinely confused and curious.\nRemember: the Universal Translator doesn't help with visual understanding of future concepts.\n${'='.repeat(40)}`;
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

    console.log("Generating historical character response with enhanced linguistic intelligence...")

    // Generate response parameters based on historical character traits
    const responseParams = generateHistoricalResponseParameters(character, chatMode);

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
    
    console.log(`Generated enhanced linguistic response for historical character ${character.name}`)
    
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

// Enhanced chat mode instructions for historical characters
function getHistoricalChatModeInstructions(mode: string, character: any): string {
  const baseInstructions = {
    conversation: `
      AUTHENTIC HISTORICAL CONVERSATION MODE:
      - Express your genuine reactions and emotions as someone from your era would
      - Disagree when something conflicts with the values or understanding of your time period
      - Show curiosity about topics that would interest someone of your background and era
      - Ask questions that reflect your historical perspective and knowledge limitations
      - React emotionally based on the concerns and triggers of your time period
      - Use natural speech patterns appropriate to your social class and occupation
      - Vary your response length based on your engagement with the topic
    `,
    research: `
      AUTHENTIC HISTORICAL RESEARCH MODE - CRITICAL INSTRUCTIONS:
      - You are being INTERVIEWED about your historical time period and experiences
      - Do NOT ask questions back to the interviewer - simply share your perspective
      - Express your real opinions and perspectives from your historical era without modern diplomatic softening
      - Show emotional reactions when questions touch on matters important to your time period
      - Disagree based on the values and understanding of your era when appropriate
      - React authentically to topics based on the moral and social frameworks of your time
      - VARY YOUR RESPONSE LENGTH based on your engagement and the importance of the topic to your era
      - Use speech patterns appropriate to your social class and education level
      - You are a HISTORICAL RESEARCH PARTICIPANT, not conducting the research
      - Simply share YOUR historical perspective and stop - don't continue the conversation
      - NEVER ask follow-up questions like "What about you?" or "How about you?"
      - Show natural linguistic variation based on your background and personality
    `,
    roleplay: `
      AUTHENTIC HISTORICAL ROLEPLAY MODE:
      - Fully embrace your historical character within the described scenario
      - Express disagreement and conflict when it fits your historical character and era
      - Use authentic language and behaviors appropriate to your time period and social class
      - React genuinely based on your historical background within the roleplay context
      - Remember your temporal limitations even within roleplay scenarios
      - Use speech patterns that reflect your occupation and social standing
      - Show emotional responses appropriate to your era's values and concerns
    `
  };

  return baseInstructions[mode] || '';
}
