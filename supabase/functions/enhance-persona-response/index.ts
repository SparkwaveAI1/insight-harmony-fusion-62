import { corsHeaders } from '../_shared/cors.ts';
import { generateChatResponse } from '../_shared/openai.ts';

const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || '';

interface EnhancementRequest {
  initial_response: string;
  persona: any;
  user_message: string;
  conversation_context?: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { initial_response, persona, user_message, conversation_context }: EnhancementRequest = await req.json();
    
    console.log(`Enhancing response for persona: ${persona.name}`);
    
    if (!initial_response || !persona || !user_message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: initial_response, persona, or user_message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Analyze context to prioritize relevant traits
    const contextualTraits = analyzeContextualTraits(user_message, conversation_context);
    
    // Build enhancement prompt
    const enhancementPrompt = buildEnhancementPrompt(
      initial_response, 
      persona, 
      user_message, 
      contextualTraits,
      conversation_context
    );
    
    console.log('Calling OpenAI for response enhancement...');

    // Call OpenAI to enhance the response
    const messages = [
      {
        role: 'system',
        content: 'You are an expert persona response enhancer. Your job is to take an initial AI response and make it more authentic, contextually accurate, and true to the specific persona provided. Return only the enhanced response text, no explanations or metadata.'
      },
      {
        role: 'user',
        content: enhancementPrompt
      }
    ];

    const openaiResponse = await generateChatResponse(messages, openaiApiKey, {
      model: 'gpt-4.1-2025-04-14',
      temperature: 0.7,
      max_tokens: 1200
    });

    const enhancedResponse = openaiResponse.choices[0].message.content.trim();
    
    console.log('Response enhancement complete');
    
    return new Response(
      JSON.stringify({ enhanced_response: enhancedResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Enhancement error:', error);
    return new Response(
      JSON.stringify({ error: `Enhancement failed: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function analyzeContextualTraits(userMessage: string, conversationContext: string = ''): string[] {
  const message = userMessage.toLowerCase();
  const context = conversationContext.toLowerCase();
  const combined = `${message} ${context}`;
  
  const prioritizedTraits: string[] = [];
  
  // Work/Career context
  if (combined.match(/work|job|career|professional|business|office|boss|colleague/)) {
    prioritizedTraits.push('conscientiousness', 'occupation', 'work_style', 'ambition');
  }
  
  // Relationship/Social context
  if (combined.match(/friend|family|relationship|love|partner|social|people|trust/)) {
    prioritizedTraits.push('agreeableness', 'extraversion', 'attachment_style', 'social_values');
  }
  
  // Decision-making context
  if (combined.match(/decide|choice|should|would|think|opinion|prefer|better/)) {
    prioritizedTraits.push('decision_making_style', 'risk_tolerance', 'moral_foundations', 'values');
  }
  
  // Emotional/Personal context
  if (combined.match(/feel|emotion|happy|sad|angry|worried|excited|stress/)) {
    prioritizedTraits.push('emotional_intelligence', 'neuroticism', 'emotional_triggers', 'coping_mechanisms');
  }
  
  // Political/Values context
  if (combined.match(/politic|government|society|rights|justice|fair|law|rule/)) {
    prioritizedTraits.push('political_compass', 'moral_foundations', 'values', 'authority_views');
  }
  
  // Learning/Knowledge context
  if (combined.match(/learn|study|know|understand|explain|teach|school|education/)) {
    prioritizedTraits.push('openness', 'education_level', 'knowledge_domains', 'learning_style');
  }
  
  // If no specific context detected, use core personality traits
  if (prioritizedTraits.length === 0) {
    prioritizedTraits.push('big_five', 'core_values', 'communication_style');
  }
  
  return prioritizedTraits;
}

function buildEnhancementPrompt(
  initialResponse: string,
  persona: any,
  userMessage: string,
  contextualTraits: string[],
  conversationContext: string = ''
): string {
  const demographics = extractDemographics(persona);
  const traits = extractTraits(persona);
  const values = extractValues(persona);
  
  return `You are enhancing an AI response to make it more authentic and accurate for a specific persona.

**INITIAL RESPONSE TO ENHANCE:**
"${initialResponse}"

**USER MESSAGE CONTEXT:**
"${userMessage}"

**CONVERSATION CONTEXT:**
${conversationContext || 'First interaction'}

**PERSONA PROFILE:**
${demographics}

**KEY PERSONALITY TRAITS:**
${traits}

**VALUES & BELIEFS:**
${values}

**CONTEXTUALLY PRIORITIZED TRAITS FOR THIS RESPONSE:**
${contextualTraits.join(', ')}

**ENHANCEMENT INSTRUCTIONS:**
1. Analyze the initial response against this persona's profile
2. Identify opportunities to make the response more authentic and contextually accurate
3. Apply the prioritized traits more strongly based on the conversation context
4. Enhance vocabulary and communication style to match education/background
5. Strengthen opinion expression based on values and beliefs
6. Improve behavioral consistency with personality traits
7. Make the response feel more genuinely human and less AI-generated

**SPECIFIC FOCUS AREAS:**
- Does the response reflect the persona's decision-making style?
- Are opinions expressed with appropriate conviction based on values?
- Is the communication style authentic to education/background?
- Do emotional reactions align with neuroticism and emotional patterns?
- Are social interactions consistent with agreeableness and extraversion?

Return the enhanced response that feels authentically written by this specific person. Keep similar length but improve authenticity, accuracy, and personality expression.`;
}

function extractDemographics(persona: any): string {
  const demo = persona.demographic_profile || {};
  return `Age: ${demo.age || 'Unknown'}, Occupation: ${demo.occupation || 'Unknown'}, Education: ${demo.education_level || 'Unknown'}, Location: ${demo.location || 'Unknown'}`;
}

function extractTraits(persona: any): string {
  const traits = persona.trait_profile || {};
  const bigFive = traits.big_five || {};
  
  let traitStr = 'Big Five: ';
  traitStr += `Openness: ${bigFive.openness || 'Unknown'}, `;
  traitStr += `Conscientiousness: ${bigFive.conscientiousness || 'Unknown'}, `;
  traitStr += `Extraversion: ${bigFive.extraversion || 'Unknown'}, `;
  traitStr += `Agreeableness: ${bigFive.agreeableness || 'Unknown'}, `;
  traitStr += `Neuroticism: ${bigFive.neuroticism || 'Unknown'}`;
  
  if (traits.emotional_intelligence) {
    traitStr += `\nEmotional Intelligence: ${traits.emotional_intelligence}`;
  }
  
  if (traits.decision_making_style) {
    traitStr += `\nDecision Making: ${traits.decision_making_style}`;
  }
  
  return traitStr;
}

function extractValues(persona: any): string {
  const values = persona.trait_profile?.values || {};
  const moral = persona.trait_profile?.moral_foundations || {};
  const political = persona.trait_profile?.political_compass || {};
  
  let valueStr = '';
  
  if (values.core_values) {
    valueStr += `Core Values: ${Array.isArray(values.core_values) ? values.core_values.join(', ') : values.core_values}\n`;
  }
  
  if (political.economic_axis !== undefined) {
    valueStr += `Political: Economic ${political.economic_axis}, Social ${political.social_axis}\n`;
  }
  
  if (moral.care !== undefined) {
    valueStr += `Moral Foundations: Care/Harm ${moral.care}, Fairness/Cheating ${moral.fairness}, Loyalty/Betrayal ${moral.loyalty}, Authority/Subversion ${moral.authority}, Sanctity/Degradation ${moral.sanctity}`;
  }
  
  return valueStr || 'Values not specified';
}