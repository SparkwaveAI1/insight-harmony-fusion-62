// EMERGENCY MINIMAL VERSION - ZERO DEPENDENCIES
// Direct API calls only, no external libraries

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Inline trait analysis engine
class MinimalTraitAnalyzer {
  extractRelevantTraits(userQuestion: string, fullProfile: any): Array<{trait: string, data_value: any, relevance: number}> {
    const questionWords = userQuestion.toLowerCase().split(' ');
    const allTraits: Array<{trait: string, data_value: any}> = [];

    // Extract traits from profile structure
    if (fullProfile?.bias_profile?.cognitive) {
      Object.entries(fullProfile.bias_profile.cognitive).forEach(([key, value]) => {
        allTraits.push({trait: `cognitive_${key}`, data_value: value});
      });
    }

    if (fullProfile?.adoption_profile) {
      Object.entries(fullProfile.adoption_profile).forEach(([key, value]) => {
        allTraits.push({trait: `adoption_${key}`, data_value: value});
      });
    }

    if (fullProfile?.motivation_profile?.primary_drivers) {
      Object.entries(fullProfile.motivation_profile.primary_drivers).forEach(([key, value]) => {
        allTraits.push({trait: `motivation_${key}`, data_value: value});
      });
    }

    // Score relevance and return top 8
    const scoredTraits = allTraits.map(trait => ({
      ...trait,
      relevance: this.calculateRelevance(trait, questionWords, userQuestion)
    })).sort((a, b) => b.relevance - a.relevance).slice(0, 8);

    return scoredTraits;
  }

  calculateRelevance(trait: {trait: string, data_value: any}, questionWords: string[], userQuestion: string): number {
    let score = 0;
    
    // High numeric values get base relevance
    if (typeof trait.data_value === 'number' && trait.data_value > 0.7) {
      score += 0.5;
    }

    // Keyword matching
    const traitKeywords = trait.trait.split('_');
    for (const keyword of traitKeywords) {
      if (questionWords.includes(keyword)) {
        score += 0.3;
      }
    }

    // Business/work context boosting
    if (userQuestion.includes('work') || userQuestion.includes('business') || userQuestion.includes('AI')) {
      if (trait.trait.includes('adoption') || trait.trait.includes('risk') || trait.trait.includes('loss')) {
        score += 0.4;
      }
    }

    return Math.min(score, 1.0);
  }

  synthesizeQualitativeOpinion(relevantTraits: Array<{trait: string, data_value: any}>, userQuestion: string): string {
    // Check for specific trait combinations
    const lossAversion = relevantTraits.find(t => t.trait.includes('loss_aversion'));
    const riskTolerance = relevantTraits.find(t => t.trait.includes('risk_tolerance'));
    const changeResistance = relevantTraits.find(t => t.trait.includes('change_friction'));

    if (lossAversion && lossAversion.data_value > 0.7) {
      if (userQuestion.includes('AI') || userQuestion.includes('tool') || userQuestion.includes('technology')) {
        return "Based on your high loss aversion and conservative approach to change, you evaluate this primarily through the lens of potential risks and unintended consequences rather than benefits.";
      }
    }

    if (riskTolerance && riskTolerance.data_value < 0.3) {
      return "Your low risk tolerance means you approach new initiatives with careful scrutiny, preferring proven methods over experimental approaches.";
    }

    // Generic trait-based response
    const topTraits = relevantTraits.slice(0, 3).map(t => t.trait).join(', ');
    return `Based on your personality profile (${topTraits}), you approach this question through your characteristic lens of careful evaluation and personal experience.`;
  }

  synthesizeCommunicationStyle(relevantTraits: Array<{trait: string, data_value: any}>, fullProfile: any): string {
    const voiceFoundation = fullProfile?.communication_style?.voice_foundation || {};
    const directness = voiceFoundation.directness || 'moderate';
    const formality = voiceFoundation.formality || 'moderate';

    return `Respond authentically based on your natural communication style: ${directness} directness, ${formality} formality. Match your personality traits and speak from your lived experience.`;
  }
}

async function directSupabaseQuery(url: string, method: string, body?: any) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  const response = await fetch(`${supabaseUrl}/rest/v1/${url}`, {
    method,
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'apikey': supabaseKey!,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    throw new Error(`Supabase query failed: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

async function callGrokAPI(messages: any[]) {
  const grokKey = Deno.env.get('GROK_API_KEY');
  
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${grokKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'grok-4-latest',
      messages,
      max_tokens: 2000,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Grok API error: ${errorData.error?.message || response.statusText}`);
  }

  return await response.json();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 MINIMAL V4 GROK - ZERO DEPENDENCIES');
    
    const { persona_id, user_message, conversation_history } = await req.json();
    
    // Direct Supabase query for persona
    const personas = await directSupabaseQuery(
      `v4_personas?persona_id=eq.${persona_id}&select=*`, 
      'GET'
    );

    if (!personas || personas.length === 0) {
      throw new Error(`Persona ${persona_id} not found`);
    }

    const persona = personas[0];
    console.log(`✅ Persona loaded: ${persona.name}`);

    // Initialize trait analyzer
    const analyzer = new MinimalTraitAnalyzer();
    
    // Extract and analyze traits
    const relevantTraits = analyzer.extractRelevantTraits(user_message, persona.full_profile);
    console.log(`🎯 Extracted ${relevantTraits.length} relevant traits`);

    // Generate opinion and communication style
    const qualitativeOpinion = analyzer.synthesizeQualitativeOpinion(relevantTraits, user_message);
    const communicationStyle = analyzer.synthesizeCommunicationStyle(relevantTraits, persona.full_profile);

    console.log(`💭 Generated opinion: ${qualitativeOpinion.substring(0, 50)}...`);

    // Build system message
    const systemMessage = `You are ${persona.name}, responding authentically based on your personality and background.

PERSONALITY STANCE: ${qualitativeOpinion}

COMMUNICATION STYLE: ${communicationStyle}

IDENTITY CONTEXT: ${persona.full_profile?.identity?.occupation || 'Professional'}, ${persona.full_profile?.identity?.age || 'Adult'}, from ${persona.full_profile?.identity?.location?.city || 'Unknown'}

Respond naturally as this person would, incorporating their unique perspective and communication style. Keep responses conversational and authentic to the personality.`;

    // Prepare messages for Grok
    const messages = [
      { role: 'system', content: systemMessage },
      ...(conversation_history || []),
      { role: 'user', content: user_message }
    ];

    // Call Grok API
    console.log('🤖 Calling Grok API...');
    const grokResponse = await callGrokAPI(messages);
    
    const assistantMessage = grokResponse.choices[0]?.message?.content;
    
    console.log('✅ Grok response received');

    return new Response(JSON.stringify({
      success: true,
      response: assistantMessage,
      persona_name: persona.name,
      model_used: 'grok-4-latest',
      traits_selected: relevantTraits.map(t => t.trait)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
      stack: errorStack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});