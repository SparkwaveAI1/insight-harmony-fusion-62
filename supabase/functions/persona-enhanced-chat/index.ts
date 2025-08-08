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
  const age = persona.age || persona.metadata?.age || 30;
  const education = persona.education || persona.metadata?.education_level || persona.metadata?.education || 'high school';
  const occupation = persona.occupation || persona.metadata?.occupation || 'unknown';
  
  // Extract personality traits
  const bigFive = persona.trait_profile?.big_five || {
    openness: persona.openness,
    conscientiousness: persona.conscientiousness,
    extraversion: persona.extraversion,
    agreeableness: persona.agreeableness,
    neuroticism: persona.neuroticism
  };

  // Extract knowledge domains and education level
  const knowledgeDomains = persona.metadata?.knowledge_domains || {};
  const educationLevel = getEducationLevel(education);

  let prompt = `You are ${persona.name}. Respond naturally as this person would.\n\n`;
  
  // Core identity
  prompt += `WHO YOU ARE:\n`;
  if (age) prompt += `${age} years old\n`;
  if (persona.gender) prompt += `${persona.gender}\n`;
  if (persona.location) prompt += `From ${persona.location}\n`;
  if (occupation) prompt += `Work: ${occupation}\n`;
  if (education) prompt += `Education: ${education}\n`;
  prompt += '\n';

  // Personality-driven behavior
  prompt += `YOUR PERSONALITY DRIVES YOUR RESPONSES:\n`;
  if (bigFive.extraversion !== undefined) {
    const ext = parseFloat(bigFive.extraversion) || 0.5;
    if (ext > 0.7) prompt += `• You're talkative and social\n`;
    else if (ext < 0.3) prompt += `• You're reserved, prefer brief responses\n`;
  }
  if (bigFive.agreeableness !== undefined) {
    const agr = parseFloat(bigFive.agreeableness) || 0.5;
    if (agr > 0.7) prompt += `• You avoid conflict, find common ground\n`;
    else if (agr < 0.3) prompt += `• You readily disagree, can be blunt\n`;
  }
  if (bigFive.neuroticism !== undefined) {
    const neu = parseFloat(bigFive.neuroticism) || 0.5;
    if (neu > 0.7) prompt += `• You react emotionally, show stress\n`;
    else if (neu < 0.3) prompt += `• You stay calm, don't get worked up\n`;
  }
  if (bigFive.conscientiousness !== undefined) {
    const con = parseFloat(bigFive.conscientiousness) || 0.5;
    if (con > 0.7) prompt += `• You're organized, detail-oriented\n`;
    else if (con < 0.3) prompt += `• You're spontaneous, don't overthink\n`;
  }
  if (bigFive.openness !== undefined) {
    const ope = parseFloat(bigFive.openness) || 0.5;
    if (ope > 0.7) prompt += `• You're curious about new ideas\n`;
    else if (ope < 0.3) prompt += `• You stick with what you know\n`;
  }
  prompt += '\n';

  // Knowledge boundaries based on education and background
  prompt += `YOUR KNOWLEDGE BOUNDARIES:\n`;
  if (educationLevel === 'basic') {
    prompt += `• Your vocabulary is straightforward, no academic jargon\n`;
    prompt += `• If you don't understand something complex, say so naturally\n`;
  } else if (educationLevel === 'advanced') {
    prompt += `• You can discuss complex topics in your field\n`;
    prompt += `• Still acknowledge when things are outside your expertise\n`;
  }
  
  // Topic-specific knowledge
  if (Object.keys(knowledgeDomains).length > 0) {
    const topDomains = Object.entries(knowledgeDomains)
      .filter(([, level]) => (level as number) > 3)
      .map(([domain]) => domain.replace(/_/g, ' '));
    if (topDomains.length > 0) {
      prompt += `• You know about: ${topDomains.join(', ')}\n`;
    }
  }
  prompt += '\n';

  // Background context
  if (persona.description) {
    prompt += `BACKGROUND:\n${persona.description}\n\n`;
  }

  if (conversationContext.trim()) {
    prompt += `CONVERSATION CONTEXT:\n${conversationContext}\n\n`;
  }

  // Critical behavioral instructions
  prompt += `CRITICAL - RESPOND AUTHENTICALLY:\n`;
  prompt += `• Never organize thoughts with headings or bullet points\n`;
  prompt += `• Never say "here's my take", "I'll be honest", "honestly", "that's a good question", "well, honestly", "to be fair", "truth be told", "let's be real"\n`;
  prompt += `• Never reference yourself as if you're an AI playing a role\n`;
  prompt += `• DON'T all focus on the same obvious issues - be selfish about what affects YOU specifically\n`;
  prompt += `• Go off on tangents, contradict yourself, be human\n`;
  prompt += `• If you don't know something, just say you don't know\n`;
  prompt += `• Use your education level vocabulary - don't sound too smart or too simple\n`;
  prompt += `• Focus on how things affect YOU personally, not comprehensive analysis\n`;
  prompt += `• Show your personality through how you respond, not what you say about responding\n`;

  return prompt;
}

function getEducationLevel(education: string): string {
  const ed = education.toLowerCase();
  if (ed.includes('phd') || ed.includes('doctorate') || ed.includes('graduate')) return 'advanced';
  if (ed.includes('college') || ed.includes('bachelor') || ed.includes('university')) return 'college';
  if (ed.includes('high school') || ed.includes('ged') || ed.includes('diploma')) return 'basic';
  return 'basic'; // default to basic if unclear
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