import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Intelligent trait analysis - scans trait content for relevance
function analyzeTraitRelevance(userInput: string, conversationSummary: any): any {
  const selectedTraits: any = {};
  const input = userInput.toLowerCase();
  
  // ALWAYS include core traits
  selectedTraits.background = conversationSummary.demographics.background_description;
  selectedTraits.name = conversationSummary.demographics.name;
  selectedTraits.basic_communication = {
    directness: conversationSummary.communication_style.directness,
    formality: conversationSummary.communication_style.formality
  };
  
  // Check for simple greetings (minimal response needed)
  const simpleGreetings = ['hi', 'hello', 'hey', 'how are you', 'whats up', "what's up", 'good morning', 'good afternoon'];
  const isSimpleGreeting = simpleGreetings.some(greeting => 
    input.includes(greeting) && input.split(' ').length <= 4
  );
  
  if (isSimpleGreeting) {
    selectedTraits.current_mood = "responding to greeting naturally";
    return selectedTraits;
  }

  // INTELLIGENT CONTENT ANALYSIS - scan actual trait content for relevance
  
  // 1. EXPLOSIVE TRIGGERS (HIGHEST PRIORITY)
  const emotionalTriggers = conversationSummary.emotional_triggers_summary || '';
  if (checkContentMatch(input, emotionalTriggers)) {
    console.log('Grok - Explosive trigger detected');
    selectedTraits.emotional_trigger_activated = emotionalTriggers;
    selectedTraits.emotional_regulation = "activated explosive response";
    
    // Add supporting psychological traits for explosive reactions
    selectedTraits.psychological_state = conversationSummary.inhibitor_summary;
    selectedTraits.confirmation_bias = conversationSummary.truth_flexibility_summary;
    
    // If political trigger, add political identity
    if (emotionalTriggers.toLowerCase().includes('liberal') || 
        emotionalTriggers.toLowerCase().includes('immigrant') ||
        emotionalTriggers.toLowerCase().includes('political')) {
      selectedTraits.political_viewpoint = "strong conservative identity with high tribal loyalty";
    }
  }
  
  // 2. CONTRADICTIONS/INTERNAL TENSIONS
  const contradictions = conversationSummary.contradictions_summary || '';
  if (checkContentMatch(input, contradictions)) {
    console.log('Grok - Internal contradiction detected');
    selectedTraits.internal_conflict = contradictions;
    selectedTraits.psychological_barriers = conversationSummary.inhibitor_summary;
  }
  
  // 3. MOTIVATIONS AND GOALS
  const motivations = conversationSummary.motivation_summary || '';
  const goals = conversationSummary.goal_priorities || '';
  if (checkContentMatch(input, motivations) || checkContentMatch(input, goals)) {
    console.log('Grok - Motivation/goal relevance detected');
    selectedTraits.driving_forces = motivations;
    selectedTraits.current_goals = goals;
    selectedTraits.decision_patterns = conversationSummary.want_vs_should_pattern;
  }
  
  // 4. WORK/PROFESSIONAL CONTENT
  const knowledge = conversationSummary.knowledge_profile || {};
  const expertiseDomains = knowledge.expertise_domains ? knowledge.expertise_domains.join(' ') : '';
  if (checkContentMatch(input, expertiseDomains) || 
      input.includes('work') || input.includes('job') || input.includes('career')) {
    console.log('Grok - Work/expertise relevance detected');
    selectedTraits.professional_expertise = knowledge.expertise_domains;
    selectedTraits.knowledge_limitations = knowledge.knowledge_gaps;
    selectedTraits.work_related_motivation = extractWorkContent(motivations);
  }
  
  // 5. FAMILY/RELATIONSHIP CONTENT
  if (checkContentMatch(input, motivations, ['family', 'children', 'relationship']) ||
      input.includes('family') || input.includes('kids') || input.includes('children')) {
    console.log('Grok - Family relevance detected');
    selectedTraits.family_dynamics = extractFamilyContent(motivations);
    selectedTraits.family_decisions = conversationSummary.want_vs_should_pattern;
  }
  
  // 6. PERSONAL/EMOTIONAL TOPICS
  if (input.includes('feel') || input.includes('emotion') || input.includes('personal') ||
      checkContentMatch(input, emotionalTriggers, ['stress', 'anxiety', 'depression', 'lonely'])) {
    console.log('Grok - Emotional content detected');
    selectedTraits.emotional_patterns = emotionalTriggers;
    selectedTraits.psychological_barriers = conversationSummary.inhibitor_summary;
  }

  return selectedTraits;
}

// Helper function for intelligent content matching
function checkContentMatch(userInput: string, traitContent: string, additionalKeywords: string[] = []): boolean {
  if (!traitContent) return false;
  
  const input = userInput.toLowerCase();
  const content = traitContent.toLowerCase();
  
  // Extract key concepts from user input
  const inputWords = input.split(/\s+/).filter(word => word.length > 2);
  
  // Check for direct word matches in trait content
  const hasDirectMatch = inputWords.some(word => content.includes(word));
  
  // Check for conceptual matches
  const hasConceptualMatch = additionalKeywords.some(keyword => 
    input.includes(keyword) && content.includes(keyword)
  );
  
  // Special case: political content matching
  if (input.includes('liberal') || input.includes('immigrant') || input.includes('politics')) {
    return content.includes('liberal') || content.includes('immigrant') || content.includes('political');
  }
  
  return hasDirectMatch || hasConceptualMatch;
}

// Helper function to extract work-related content from motivations
function extractWorkContent(motivationSummary: string): string {
  if (!motivationSummary) return '';
  
  const sentences = motivationSummary.split(/[.!?]+/);
  const workSentences = sentences.filter(sentence => {
    const lower = sentence.toLowerCase();
    return lower.includes('work') || lower.includes('career') || lower.includes('professional') || 
           lower.includes('job') || lower.includes('patient') || lower.includes('client');
  });
  
  return workSentences.join('. ').trim();
}

// Helper function to extract family-related content from motivations
function extractFamilyContent(motivationSummary: string): string {
  if (!motivationSummary) return '';
  
  const sentences = motivationSummary.split(/[.!?]+/);
  const familySentences = sentences.filter(sentence => {
    const lower = sentence.toLowerCase();
    return lower.includes('family') || lower.includes('children') || lower.includes('child') || 
           lower.includes('parent') || lower.includes('spouse') || lower.includes('kid');
  });
  
  return familySentences.join('. ').trim();
}

// Enhanced instruction builder that handles explosive emotional states
function buildV4Instructions(selectedTraits: any, userInput: string): string {
  let instructions = `You are ${selectedTraits.name}. ${selectedTraits.background}

`;

  // EXPLOSIVE TRIGGER HANDLING (HIGHEST PRIORITY)
  if (selectedTraits.emotional_trigger_activated) {
    instructions += `CRITICAL: This topic triggers strong emotional reactions in you.
Your emotional triggers: ${selectedTraits.emotional_trigger_activated}
Your emotional regulation: You have low emotional control and tend to react strongly.
`;
    
    if (selectedTraits.political_viewpoint) {
      instructions += `Your political identity: ${selectedTraits.political_viewpoint}
`;
    }
    
    if (selectedTraits.confirmation_bias) {
      instructions += `Your bias patterns: ${selectedTraits.confirmation_bias}
`;
    }
  }

  // Add other traits as before, but only if not in explosive mode
  if (!selectedTraits.emotional_trigger_activated) {
    // Regular trait loading for non-explosive topics
    if (selectedTraits.current_mood) {
      instructions += `Current state: ${selectedTraits.current_mood}\n`;
    }
    
    if (selectedTraits.driving_forces) {
      instructions += `What motivates you: ${selectedTraits.driving_forces}\n`;
    }
    
    if (selectedTraits.internal_conflict) {
      instructions += `Your internal tensions: ${selectedTraits.internal_conflict}\n`;
    }
  }

  // Add remaining traits...
  if (selectedTraits.professional_expertise) {
    instructions += `Your expertise: ${selectedTraits.professional_expertise.join(', ')}\n`;
  }
  
  if (selectedTraits.family_dynamics) {
    instructions += `Family relationships: ${selectedTraits.family_dynamics}\n`;
  }
  
  if (selectedTraits.psychological_barriers) {
    instructions += `What holds you back: ${selectedTraits.psychological_barriers}\n`;
  }

  // Response requirements adapted for emotional state
  if (selectedTraits.emotional_trigger_activated) {
    instructions += `
RESPONSE REQUIREMENTS:
- This topic triggers strong emotions in you - respond authentically with that emotional intensity
- Be blunt and direct as this is how you naturally react when triggered
- Your emotional control is low - let your genuine reaction show
- Don't be diplomatic or balanced - react according to your actual feelings and biases
- Keep it short and intense - you're not in a mood for long explanations`;
  } else {
    instructions += `
RESPONSE REQUIREMENTS:
- Respond as yourself in this conversation, not as a role you're playing
- Match the energy and length of the input (simple questions = short answers)
- Be naturally human - use contractions, be imperfect, react authentically  
- Don't announce your profession or explain your background unless directly asked
- Respond directly to what was asked without over-explaining`;
  }

  instructions += `

USER: "${userInput}"

Your response:`;

  return instructions;
}

serve(async (req) => {
  console.log('🔥 DEPLOYMENT TEST - Edge function is live and updated!')
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { persona_id, user_message, conversation_history } = await req.json()
    
    console.log('V4 GROK Conversation Engine - Processing:', persona_id)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch V4 persona conversation summary AND full_profile for diagnostic
    const { data: persona, error: fetchError } = await supabase
      .from('v4_personas')
      .select('conversation_summary, full_profile')
      .eq('persona_id', persona_id)
      .single()

    if (fetchError) {
      console.error('Error fetching V4 persona for Grok:', fetchError)
      throw fetchError
    }

    console.log('V4 persona loaded for Grok:', persona.conversation_summary.demographics.name)

    // === VOICE DIFFERENTIATION DIAGNOSTIC ===
    console.log('=== VOICE DIFFERENTIATION DIAGNOSTIC ===');
    console.log('Current persona data keys:', Object.keys(persona));
    console.log('Conversation summary communication style:', persona.conversation_summary?.communication_style);
    console.log('Full profile exists:', !!persona.full_profile);
    console.log('Full profile communication style:', persona.full_profile?.communication_style?.linguistic_signature);
    console.log('David Kim signature phrases:', persona.full_profile?.communication_style?.linguistic_signature?.signature_phrases);
    console.log('David Kim forbidden expressions:', persona.full_profile?.communication_style?.linguistic_signature?.forbidden_expressions);
    console.log('=== END DIAGNOSTIC ===');

    // Analyze which traits are relevant to this specific input
    const selectedTraits = analyzeTraitRelevance(user_message, persona.conversation_summary)
    console.log('Grok - Selected traits for this input:', Object.keys(selectedTraits))

    // Build focused instructions using only relevant traits
    const instructions = buildV4Instructions(selectedTraits, user_message)
    console.log('Grok - Instruction length:', instructions.length)

    // Call Grok API with trait-specific instructions
    const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('GROK_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-4-latest',
        messages: [
          {
            role: 'system',
            content: instructions
          },
          // Add conversation history if provided
          ...(conversation_history || []),
          {
            role: 'user',
            content: user_message
          }
        ],
        stream: false,
        temperature: 0
      })
    })

    console.log('Grok response received')
    
    // Check if response is ok
    if (!grokResponse.ok) {
      const errorText = await grokResponse.text()
      console.error('Grok API error:', grokResponse.status, errorText)
      throw new Error(`Grok API error: ${grokResponse.status} - ${errorText}`)
    }

    const grokData = await grokResponse.json()
    console.log('Grok response data:', JSON.stringify(grokData, null, 2))

    // Validate response structure
    if (!grokData.choices || !Array.isArray(grokData.choices) || grokData.choices.length === 0) {
      console.error('Invalid Grok response structure:', grokData)
      throw new Error('Invalid response structure from Grok API - no choices array')
    }

    if (!grokData.choices[0].message || !grokData.choices[0].message.content) {
      console.error('Invalid Grok choice structure:', grokData.choices[0])
      throw new Error('Invalid response structure from Grok API - no message content')
    }

    const personaResponse = grokData.choices[0].message.content

    return new Response(
      JSON.stringify({ 
        success: true,
        response: personaResponse,
        traits_selected: Object.keys(selectedTraits),
        persona_name: persona.conversation_summary.demographics.name,
        model_used: 'grok-4-latest'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in v4-grok-conversation:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})