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
  const knowledgeBoundaries = extractKnowledgeBoundaries(persona);
  const antiPatterns = getKnowledgeAntiPatterns(persona);
  
  return `You are a Persona Output Generator creating authentic responses that match a specific person's voice and knowledge boundaries.

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

**KNOWLEDGE BOUNDARIES:**
${knowledgeBoundaries}

**ANTI-PATTERNS - NEVER DO THESE:**
${antiPatterns}

**CONTEXTUALLY PRIORITIZED TRAITS FOR THIS RESPONSE:**
${contextualTraits.join(', ')}

**ENHANCEMENT INSTRUCTIONS:**
1. Remove any knowledge claims beyond the persona's education/occupation/age
2. Adjust vocabulary to match education level appropriately
3. Filter out generic AI phrases like "I understand your perspective, but..."
4. Apply personality traits more authentically (especially agreeableness/neuroticism)
5. Ensure opinions reflect personal values and background
6. Add appropriate uncertainty for topics outside expertise
7. Make language patterns match the persona's natural communication style

**SPECIFIC FOCUS AREAS:**
- Does the response demonstrate knowledge the persona shouldn't have?
- Is the vocabulary appropriate for their education level?
- Are opinions expressed with conviction matching their personality?
- Does uncertainty show appropriately for unfamiliar topics?
- Is the communication style authentic to their background?

Return the enhanced response that respects knowledge boundaries while maintaining authentic personality expression.`;
}

function extractDemographics(persona: any): string {
  const demo = persona.metadata || persona.demographic_profile || {};
  const age = demo.age || 'Unknown';
  const currentYear = new Date().getFullYear();
  const birthYear = age !== 'Unknown' ? currentYear - parseInt(age) : 'Unknown';
  
  return `Age: ${age} (born ${birthYear}), Occupation: ${demo.occupation || 'Unknown'}, Education: ${demo.education_level || demo.education || 'Unknown'}, Location: ${demo.location || 'Unknown'}`;
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

function extractKnowledgeBoundaries(persona: any): string {
  const age = persona.metadata?.age ? parseInt(persona.metadata.age) : 30;
  const currentYear = new Date().getFullYear();
  const occupation = persona.metadata?.occupation || 'unspecified';
  const education = persona.metadata?.education_level || persona.metadata?.education || 'unspecified';
  const domains = persona.metadata?.knowledge_domains || {};
  
  let boundaries = `Time Cutoff: Born ${currentYear - age}, no knowledge after ${currentYear - 5}\n`;
  boundaries += `Expertise: ${occupation} with ${education} education\n`;
  
  if (Object.keys(domains).length > 0) {
    const domainsList = Object.entries(domains)
      .map(([domain, level]) => `${domain}: ${level}/5`)
      .join(', ');
    boundaries += `Knowledge Domains: ${domainsList}`;
  }
  
  return boundaries;
}

function getKnowledgeAntiPatterns(persona: any): string {
  const age = persona.metadata?.age ? parseInt(persona.metadata.age) : 30;
  const occupation = persona.metadata?.occupation?.toLowerCase() || '';
  const education = persona.metadata?.education_level?.toLowerCase() || persona.metadata?.education?.toLowerCase() || '';
  
  let antiPatterns = [];
  
  // Age-based restrictions
  if (age < 25) {
    antiPatterns.push("❌ Don't reference experiences from before your time");
    antiPatterns.push("❌ Don't demonstrate deep historical knowledge");
  }
  
  // Education-based restrictions
  if (education.includes('high school') || education.includes('ged')) {
    antiPatterns.push("❌ Don't use academic jargon or cite scholarly research");
    antiPatterns.push("❌ Don't explain complex theoretical concepts");
  }
  
  // Occupation-based restrictions
  if (occupation.includes('warehouse') || occupation.includes('retail') || occupation.includes('service')) {
    antiPatterns.push("❌ Don't demonstrate expertise in finance, law, or medicine");
    antiPatterns.push("❌ Don't use professional jargon from other fields");
  }
  
  // Universal restrictions
  antiPatterns.push("❌ Don't use phrases like 'I understand your perspective, but...'");
  antiPatterns.push("❌ Don't suddenly become expert on unfamiliar topics");
  antiPatterns.push("❌ Don't use vocabulary above education level");
  
  return antiPatterns.join('\n');
}