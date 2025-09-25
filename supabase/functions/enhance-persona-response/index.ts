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
      JSON.stringify({ error: `Enhancement failed: ${error instanceof Error ? error.message : 'Unknown error'}` }),
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
  const age = persona.metadata?.age || persona.age || 30;
  const education = persona.metadata?.education_level || persona.metadata?.education || 'high school';
  const occupation = persona.metadata?.occupation || persona.occupation || 'unknown';
  
  // Determine education level for vocabulary constraints
  const educationLevel = getEducationLevel(education);
  const knowledgeConstraints = getKnowledgeConstraints(age, education, occupation);
  
  return `MAKE THIS RESPONSE AUTHENTICALLY PERSONAL FOR ${persona.name}

ORIGINAL RESPONSE:
"${initialResponse}"

USER MESSAGE: "${userMessage}"

PERSONA: ${persona.name}, ${age}, ${occupation}, ${education}

CRITICAL FIXES NEEDED:

1. FOCUS ON THEIR PERSONAL EXPERIENCE:
- Change any comprehensive analysis to focus on how this affects THEM personally
- Remove balanced perspectives - give their biased reaction based on their life
- Make them relate everything back to their own experience and circumstances
- Only engage deeply with topics that connect to their actual world

2. REMOVE AI-SPEAK PATTERNS:
- HONESTY DISCLAIMERS: "Honestly", "I'll be honest", "To be honest", "If I'm being honest", "I'm going to be straight"
- GENERIC OPENERS: "Well", "Alright", "Look", "Here's the thing", "That's a good question", "Here's my take"
- ANALYSIS LANGUAGE: "It's important to note", "However", "On the other hand", "That's complex"
- Lists, bullet points, or structured analysis
- Academic or overly formal language for their education level

3. START AUTHENTICALLY BASED ON PERSONALITY:
${getOpeningStyle(persona)}

4. ADD AUTHENTIC HUMAN LIMITATIONS:
${knowledgeConstraints.join('\n')}

5. PERSONALITY-DRIVEN REACTIONS:
${getPersonalityAdjustments(persona)}

6. NATURAL ENGAGEMENT BOUNDARIES:
- Their knowledge and interest domains naturally limit what they engage with
- Topics outside their world get brief, honest responses
- They focus energy on what actually matters to their life situation

INSTRUCTIONS:
Transform this from an AI analysis into an authentic human reaction from THEIR perspective and circumstances. Make it personal, naturally biased by their traits and experience, and focused on what matters in their world.`;
}

function getEducationLevel(education: string): string {
  const ed = education.toLowerCase();
  if (ed.includes('phd') || ed.includes('doctorate') || ed.includes('graduate')) return 'advanced';
  if (ed.includes('college') || ed.includes('bachelor') || ed.includes('university')) return 'college';
  return 'basic'; // high school or less
}

function getKnowledgeConstraints(age: number, education: string, occupation: string): string[] {
  const constraints = [];
  const educationLevel = getEducationLevel(education);
  
  if (educationLevel === 'basic') {
    constraints.push('• NO academic jargon or complex theoretical concepts');
    constraints.push('• NO detailed financial, medical, or legal knowledge');
    constraints.push('• Express genuine confusion about complex topics');
  }
  
  if (age < 25) {
    constraints.push('• NO deep historical knowledge or "back in my day" references');
    constraints.push('• NO professional expertise beyond entry-level');
  }
  
  const occLower = occupation.toLowerCase();
  if (occLower.includes('retail') || occLower.includes('warehouse') || occLower.includes('service')) {
    constraints.push('• NO expertise in finance, technology, medicine, or law');
    constraints.push('• NO academic or professional jargon');
  }
  
  // Universal constraints
  constraints.push('• If unfamiliar with a topic, express genuine ignorance');
  constraints.push('• Use vocabulary appropriate to education level');
  constraints.push('• Avoid explaining concepts beyond your background');
  
  return constraints;
}

function getOpeningStyle(persona: any): string {
  const bigFive = persona.trait_profile?.big_five || {};
  const extraversion = parseFloat(bigFive.extraversion || '0.5');
  const agreeableness = parseFloat(bigFive.agreeableness || '0.5');
  const conscientiousness = parseFloat(bigFive.conscientiousness || '0.5');
  
  const openings = [];
  
  if (extraversion > 0.7) {
    openings.push("Start enthusiastically or conversationally");
  } else if (extraversion < 0.3) {
    openings.push("Start quietly, get to the point directly");
  }
  
  if (agreeableness < 0.3) {
    openings.push("Can start bluntly or with disagreement");
  } else if (agreeableness > 0.7) {
    openings.push("Start warmly or considerately");
  }
  
  if (conscientiousness > 0.7) {
    openings.push("Can start with precise details or corrections");
  }
  
  return openings.length > 0 ? openings.join(', ') : "Start naturally based on their personality";
}

function getPersonalityAdjustments(persona: any): string {
  const bigFive = persona.trait_profile?.big_five || {};
  const adjustments = [];
  
  const agreeableness = parseFloat(bigFive.agreeableness || '0.5');
  if (agreeableness > 0.7) {
    adjustments.push('• More agreeable - find common ground, avoid direct confrontation');
  } else if (agreeableness < 0.3) {
    adjustments.push('• More disagreeable - be more direct, willing to challenge');
  }
  
  const neuroticism = parseFloat(bigFive.neuroticism || '0.5');
  if (neuroticism > 0.7) {
    adjustments.push('• Show more emotional reaction, stress, or worry');
  } else if (neuroticism < 0.3) {
    adjustments.push('• Stay calmer, less emotional reaction');
  }
  
  const extraversion = parseFloat(bigFive.extraversion || '0.5');
  if (extraversion < 0.3) {
    adjustments.push('• Keep response shorter, more reserved');
  }
  
  return adjustments.length > 0 ? adjustments.join('\n') : '• No major personality adjustments needed';
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
