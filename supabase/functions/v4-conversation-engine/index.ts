import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Smart trait selection based on input analysis
function analyzeTraitRelevance(userInput: string, conversationSummary: any): any {
  const input = userInput.toLowerCase();
  const selectedTraits: any = {};
  
  // ALWAYS include these core traits
  selectedTraits.background = conversationSummary.demographics.background_description;
  selectedTraits.name = conversationSummary.demographics.name;
  selectedTraits.basic_communication = {
    directness: conversationSummary.communication_style.directness,
    formality: conversationSummary.communication_style.formality
  };
  
  // Simple greeting detection - minimal traits needed
  const simpleGreetings = ['hi', 'hello', 'hey', 'how are you', 'whats up', "what's up", 'good morning', 'good afternoon'];
  const isSimpleGreeting = simpleGreetings.some(greeting => 
    input.includes(greeting) && input.split(' ').length <= 4
  );
  
  if (isSimpleGreeting) {
    // Only basic traits for simple greetings
    selectedTraits.current_mood = "feeling good after recent activities";
    return selectedTraits;
  }
  
  // Work/Career topics
  if (input.includes('work') || input.includes('job') || input.includes('career') || 
      input.includes('profession') || input.includes('workplace')) {
    selectedTraits.expertise = conversationSummary.knowledge_profile.expertise_domains;
    selectedTraits.knowledge_gaps = conversationSummary.knowledge_profile.knowledge_gaps;
    selectedTraits.work_motivation = extractWorkRelatedMotivation(conversationSummary.motivation_summary);
    if (conversationSummary.contradictions_summary.includes('work')) {
      selectedTraits.work_tension = conversationSummary.contradictions_summary;
    }
  }
  
  // Family topics
  if (input.includes('family') || input.includes('children') || input.includes('kids') || 
      input.includes('spouse') || input.includes('parent')) {
    selectedTraits.family_priority = extractFamilyMotivation(conversationSummary.motivation_summary);
    selectedTraits.family_decisions = conversationSummary.want_vs_should_pattern;
  }
  
  // Opinion/Values topics
  if (input.includes('think') || input.includes('believe') || input.includes('opinion') || 
      input.includes('feel about') || input.includes('view')) {
    selectedTraits.honesty_approach = conversationSummary.truth_flexibility_summary;
    selectedTraits.internal_tensions = conversationSummary.contradictions_summary;
  }
  
  // Goal/Future topics
  if (input.includes('goal') || input.includes('plan') || input.includes('future') || 
      input.includes('want') || input.includes('hope')) {
    selectedTraits.goals = conversationSummary.goal_priorities;
    selectedTraits.motivation_drivers = conversationSummary.motivation_summary;
    selectedTraits.decision_pattern = conversationSummary.want_vs_should_pattern;
  }
  
  // Emotional/Personal topics
  if (input.includes('feel') || input.includes('emotion') || input.includes('upset') || 
      input.includes('happy') || input.includes('stress') || input.includes('difficult')) {
    selectedTraits.emotional_patterns = conversationSummary.emotional_triggers_summary;
    selectedTraits.barriers = conversationSummary.inhibitor_summary;
  }
  
  // Challenge/Problem topics
  if (input.includes('problem') || input.includes('challenge') || input.includes('difficult') || 
      input.includes('struggle') || input.includes('hard')) {
    selectedTraits.psychological_barriers = conversationSummary.inhibitor_summary;
    selectedTraits.stress_responses = extractStressInfo(conversationSummary.emotional_triggers_summary);
  }
  
  return selectedTraits;
}

// Helper functions to extract specific info
function extractWorkRelatedMotivation(motivationSummary: string): string {
  // Extract work-related motivations from the summary
  const workKeywords = ['work', 'career', 'professional', 'patient', 'job'];
  const sentences = motivationSummary.split('.');
  const workSentences = sentences.filter(sentence => 
    workKeywords.some(keyword => sentence.toLowerCase().includes(keyword))
  );
  return workSentences.join('.').trim();
}

function extractFamilyMotivation(motivationSummary: string): string {
  const familyKeywords = ['family', 'children', 'child', 'parent', 'spouse'];
  const sentences = motivationSummary.split('.');
  const familySentences = sentences.filter(sentence => 
    familyKeywords.some(keyword => sentence.toLowerCase().includes(keyword))
  );
  return familySentences.join('.').trim();
}

function extractStressInfo(emotionalSummary: string): string {
  if (emotionalSummary.includes('Frustrated by:')) {
    return emotionalSummary.split('Frustrated by:')[1].split('.')[0];
  }
  return '';
}

// Build focused instructions using only selected traits
function buildV4Instructions(selectedTraits: any, userInput: string): string {
  let instructions = `You are ${selectedTraits.name}. ${selectedTraits.background}

`;

  // Add trait-specific context only if traits were selected
  if (selectedTraits.current_mood) {
    instructions += `Right now: ${selectedTraits.current_mood}\n`;
  }
  
  if (selectedTraits.expertise) {
    instructions += `Your expertise: ${selectedTraits.expertise.join(', ')}\n`;
  }
  
  if (selectedTraits.knowledge_gaps) {
    instructions += `Areas you're not expert in: ${selectedTraits.knowledge_gaps.join(', ')}\n`;
  }
  
  if (selectedTraits.work_motivation) {
    instructions += `What drives you at work: ${selectedTraits.work_motivation}\n`;
  }
  
  if (selectedTraits.work_tension) {
    instructions += `Your work tension: ${selectedTraits.work_tension}\n`;
  }
  
  if (selectedTraits.family_priority) {
    instructions += `About family: ${selectedTraits.family_priority}\n`;
  }
  
  if (selectedTraits.family_decisions) {
    instructions += `Family decisions: ${selectedTraits.family_decisions}\n`;
  }
  
  if (selectedTraits.goals) {
    instructions += `Your current goals: ${selectedTraits.goals}\n`;
  }
  
  if (selectedTraits.motivation_drivers) {
    instructions += `What motivates you: ${selectedTraits.motivation_drivers}\n`;
  }
  
  if (selectedTraits.honesty_approach) {
    instructions += `Your approach to honesty: ${selectedTraits.honesty_approach}\n`;
  }
  
  if (selectedTraits.emotional_patterns) {
    instructions += `Your emotional patterns: ${selectedTraits.emotional_patterns}\n`;
  }
  
  if (selectedTraits.psychological_barriers) {
    instructions += `What holds you back: ${selectedTraits.psychological_barriers}\n`;
  }

  // Universal response requirements
  instructions += `
RESPONSE REQUIREMENTS:
- Respond as yourself in this conversation, not as a role you're playing
- Match the energy and length of the input (simple questions = short answers)
- Be naturally human - use contractions, be imperfect, react authentically  
- Don't announce your profession or explain your background unless directly asked
- Respond directly to what was asked without over-explaining

USER: "${userInput}"

Your response:`;

  return instructions;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { persona_id, user_message, conversation_history } = await req.json()
    
    console.log('V4 Conversation Engine - Processing:', persona_id)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch V4 persona conversation summary
    const { data: persona, error: fetchError } = await supabase
      .from('v4_personas')
      .select('conversation_summary')
      .eq('persona_id', persona_id)
      .single()

    if (fetchError) {
      console.error('Error fetching V4 persona:', fetchError)
      throw fetchError
    }

    console.log('V4 persona loaded:', persona.conversation_summary.demographics.name)

    // Analyze which traits are relevant to this specific input
    const selectedTraits = analyzeTraitRelevance(user_message, persona.conversation_summary)
    console.log('Selected traits for this input:', Object.keys(selectedTraits))

    // Build focused instructions using only relevant traits
    const instructions = buildV4Instructions(selectedTraits, user_message)
    console.log('Instruction length:', instructions.length)

    // Call OpenAI with trait-specific instructions
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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
        temperature: 0.8,
        max_tokens: 300
      })
    })

    const openaiData = await openaiResponse.json()
    console.log('OpenAI response received')

    const personaResponse = openaiData.choices[0].message.content

    return new Response(
      JSON.stringify({ 
        success: true,
        response: personaResponse,
        traits_selected: Object.keys(selectedTraits),
        persona_name: persona.conversation_summary.demographics.name
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in v4-conversation-engine:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})