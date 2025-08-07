import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PersonaEnhancedChatRequest {
  personaId: string;
  message: string;
  previousMessages?: Array<{
    role: 'user' | 'assistant';
    content: string;
    image?: string;
  }>;
  mode?: string;
  conversationContext?: string;
  imageData?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      personaId, 
      message, 
      previousMessages = [], 
      mode = 'conversation',
      conversationContext = '',
      imageData 
    }: PersonaEnhancedChatRequest = await req.json();

    console.log(`🚀 Enhanced chat request for persona: ${personaId}`);
    console.log(`Message length: ${message.length}, Mode: ${mode}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch persona data with caching consideration
    const cacheKey = `persona_${personaId}`;
    let personaData: any;
    
    try {
      const { data, error } = await supabase
        .from('personas')
        .select('*')
        .eq('persona_id', personaId)
        .single();

      if (error || !data) {
        throw new Error(`Persona ${personaId} not found`);
      }
      
      personaData = data;
      console.log(`📋 Loaded persona: ${personaData.name}`);
    } catch (error) {
      console.error('❌ Error fetching persona:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to load persona data' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build comprehensive system prompt
    const systemPrompt = buildSystemPrompt(personaData, conversationContext);
    console.log(`📝 System prompt built: ${systemPrompt.length} characters`);

    // Build message history for OpenAI
    const messages = buildMessageHistory(systemPrompt, previousMessages, message, imageData);
    console.log(`💬 Message history: ${messages.length} messages`);

    // Generate response using OpenAI
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('🤖 Generating enhanced response with OpenAI...');
    const response = await generateOpenAIResponse(openAIApiKey, messages, personaData);
    
    console.log(`✨ Enhanced response generated: ${response.length} characters`);
    
    return new Response(
      JSON.stringify({ 
        response,
        model: 'gpt-4.1-2025-04-14',
        enhanced: true,
        cached: false 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Enhanced chat error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildSystemPrompt(persona: any, conversationContext: string): string {
  let prompt = `You are ${persona.name}, embodying this persona completely and authentically.\n\n`;
  
  // Add demographic information
  if (persona.age || persona.gender || persona.location) {
    prompt += `DEMOGRAPHICS:\n`;
    if (persona.age) prompt += `Age: ${persona.age}\n`;
    if (persona.gender) prompt += `Gender: ${persona.gender}\n`;
    if (persona.location) prompt += `Location: ${persona.location}\n`;
    prompt += `\n`;
  }

  // Add personality traits (Big Five)
  if (persona.openness !== undefined || persona.conscientiousness !== undefined || 
      persona.extraversion !== undefined || persona.agreeableness !== undefined || 
      persona.neuroticism !== undefined) {
    prompt += `PERSONALITY TRAITS (Big Five):\n`;
    if (persona.openness !== undefined) prompt += `Openness: ${persona.openness}/100 - ${getTraitDescription('openness', persona.openness)}\n`;
    if (persona.conscientiousness !== undefined) prompt += `Conscientiousness: ${persona.conscientiousness}/100 - ${getTraitDescription('conscientiousness', persona.conscientiousness)}\n`;
    if (persona.extraversion !== undefined) prompt += `Extraversion: ${persona.extraversion}/100 - ${getTraitDescription('extraversion', persona.extraversion)}\n`;
    if (persona.agreeableness !== undefined) prompt += `Agreeableness: ${persona.agreeableness}/100 - ${getTraitDescription('agreeableness', persona.agreeableness)}\n`;
    if (persona.neuroticism !== undefined) prompt += `Neuroticism: ${persona.neuroticism}/100 - ${getTraitDescription('neuroticism', persona.neuroticism)}\n`;
    prompt += `\n`;
  }

  // Add values and beliefs
  if (persona.moral_foundations || persona.political_compass) {
    prompt += `VALUES & BELIEFS:\n`;
    if (persona.moral_foundations) {
      try {
        const morals = typeof persona.moral_foundations === 'string' 
          ? JSON.parse(persona.moral_foundations) 
          : persona.moral_foundations;
        Object.entries(morals).forEach(([foundation, value]) => {
          prompt += `${foundation}: ${value}/10\n`;
        });
      } catch (e) {
        console.warn('Could not parse moral foundations');
      }
    }
    prompt += `\n`;
  }

  // Add background and context
  if (persona.description) {
    prompt += `BACKGROUND:\n${persona.description}\n\n`;
  }

  // Add conversation context if provided
  if (conversationContext.trim()) {
    prompt += `CONTEXT FOR THIS CONVERSATION:\n${conversationContext}\n\n`;
  }

  prompt += `INSTRUCTIONS:
- Respond authentically as ${persona.name} based on your personality, values, and background
- Use natural, conversational language that reflects your character
- Draw from your traits, experiences, and worldview when forming opinions
- Be genuine in your reactions and emotional responses
- Stay consistent with your established characteristics throughout the conversation
- If discussing topics outside your direct experience, respond based on how your personality would approach them`;

  return prompt;
}

function getTraitDescription(trait: string, score: number): string {
  const descriptions = {
    openness: score > 70 ? "highly creative and open to new experiences" : 
             score > 30 ? "moderately open to new ideas" : "prefers familiar and conventional approaches",
    conscientiousness: score > 70 ? "highly organized and disciplined" : 
                      score > 30 ? "moderately organized" : "more spontaneous and flexible",
    extraversion: score > 70 ? "very outgoing and energetic" : 
                  score > 30 ? "moderately social" : "more reserved and introspective",
    agreeableness: score > 70 ? "very cooperative and trusting" : 
                   score > 30 ? "moderately cooperative" : "more competitive and skeptical",
    neuroticism: score > 70 ? "tends to experience stress and negative emotions" : 
                 score > 30 ? "moderately emotionally stable" : "very calm and emotionally stable"
  };
  return descriptions[trait as keyof typeof descriptions] || "balanced";
}

function buildMessageHistory(
  systemPrompt: string, 
  previousMessages: any[], 
  currentMessage: string, 
  imageData?: string
): any[] {
  const messages = [{ role: 'system', content: systemPrompt }];
  
  // Add previous messages
  previousMessages.forEach(msg => {
    if (msg.image && msg.role === 'user') {
      messages.push({
        role: msg.role,
        content: [
          { type: 'text', text: msg.content },
          { type: 'image_url', image_url: { url: msg.image } }
        ]
      });
    } else {
      messages.push({ role: msg.role, content: msg.content });
    }
  });
  
  // Add current message
  if (imageData) {
    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: currentMessage },
        { type: 'image_url', image_url: { url: imageData } }
      ]
    });
  } else {
    messages.push({ role: 'user', content: currentMessage });
  }
  
  return messages;
}

async function generateOpenAIResponse(apiKey: string, messages: any[], persona: any): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: messages,
      max_tokens: 2000,
      temperature: 0.8, // Slightly higher for more personality
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Invalid response from OpenAI API');
  }

  return data.choices[0].message.content;
}