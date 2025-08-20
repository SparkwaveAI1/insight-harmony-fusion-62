import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl, supabaseKey);

// ============= TRAIT RELEVANCE ANALYZER =============

interface TraitRelevanceScore {
  category: string;
  trait: string;
  value: number;
  relevance: number;
  behavioral_impact: string;
}

interface TraitScanResult {
  high_priority_traits: TraitRelevanceScore[];
  emotional_triggers: string[];
  knowledge_domains: string[];
  linguistic_markers: string[];
}

class TraitRelevanceAnalyzer {
  static TRAIT_PATHS = [
    // Big Five
    { category: "Big Five", subcategory: "openness", traitPath: "cognitive_profile.big_five.openness" },
    { category: "Big Five", subcategory: "conscientiousness", traitPath: "cognitive_profile.big_five.conscientiousness" },
    { category: "Big Five", subcategory: "extraversion", traitPath: "cognitive_profile.big_five.extraversion" },
    { category: "Big Five", subcategory: "agreeableness", traitPath: "cognitive_profile.big_five.agreeableness" },
    { category: "Big Five", subcategory: "neuroticism", traitPath: "cognitive_profile.big_five.neuroticism" },
    
    // Moral Foundations
    { category: "Moral Foundations", subcategory: "care", traitPath: "cognitive_profile.moral_foundations.care_harm" },
    { category: "Moral Foundations", subcategory: "fairness", traitPath: "cognitive_profile.moral_foundations.fairness_cheating" },
    { category: "Moral Foundations", subcategory: "loyalty", traitPath: "cognitive_profile.moral_foundations.loyalty_betrayal" },
    { category: "Moral Foundations", subcategory: "authority", traitPath: "cognitive_profile.moral_foundations.authority_subversion" },
    { category: "Moral Foundations", subcategory: "sanctity", traitPath: "cognitive_profile.moral_foundations.sanctity_degradation" },
    { category: "Moral Foundations", subcategory: "liberty", traitPath: "cognitive_profile.moral_foundations.liberty_oppression" },
    
    // Social Cognition
    { category: "Social Cognition", subcategory: "empathy", traitPath: "social_cognition.empathy" },
    { category: "Social Cognition", subcategory: "trust", traitPath: "social_cognition.trust_baseline" },
    { category: "Social Cognition", subcategory: "conflict", traitPath: "social_cognition.conflict_orientation" },
    
    // Sexuality & Identity
    { category: "Sexuality", subcategory: "privacy", traitPath: "sexuality_profile.privacy_preference" },
    { category: "Sexuality", subcategory: "expression", traitPath: "sexuality_profile.expression" },
    { category: "Sexuality", subcategory: "boundaries", traitPath: "sexuality_profile.boundaries" },
  ];

  static async analyzeTraitRelevance(userMessage: string, conversationContext: string, personaData: any): Promise<TraitScanResult> {
    const relevantTraits: TraitRelevanceScore[] = [];
    const emotionalTriggers: string[] = [];
    const knowledgeDomains: string[] = [];
    const linguisticMarkers: string[] = [];

    // Analyze each trait for relevance
    for (const traitDef of this.TRAIT_PATHS) {
      const traitValue = this.getTraitValue(personaData, traitDef.traitPath);
      if (traitValue !== null) {
        const relevanceScore = this.calculateTraitRelevance(traitDef, traitValue, userMessage, conversationContext);
        if (relevanceScore.relevance > 0.5) {
          relevantTraits.push(relevanceScore);
        }
      }
    }

    // Check for emotional triggers
    if (personaData.emotional_triggers) {
      for (const [type, triggers] of Object.entries(personaData.emotional_triggers)) {
        if (Array.isArray(triggers)) {
          for (const trigger of triggers) {
            if (userMessage.toLowerCase().includes(trigger.toLowerCase()) || 
                conversationContext.toLowerCase().includes(trigger.toLowerCase())) {
              emotionalTriggers.push(`${type}: ${trigger}`);
            }
          }
        }
      }
    }

    // Extract relevant knowledge domains
    if (personaData.knowledge_profile?.domains_of_expertise) {
      for (const domain of personaData.knowledge_profile.domains_of_expertise) {
        if (this.isDomainRelevant(domain, userMessage, conversationContext)) {
          knowledgeDomains.push(domain);
        }
      }
    }

    // Extract linguistic markers
    if (personaData.linguistic_style) {
      linguisticMarkers.push(`formality: ${personaData.linguistic_style.base_voice?.formality || 'moderate'}`);
      linguisticMarkers.push(`directness: ${personaData.linguistic_style.base_voice?.directness || 'balanced'}`);
      linguisticMarkers.push(`verbosity: ${personaData.linguistic_style.base_voice?.verbosity || 'moderate'}`);
      
      if (personaData.linguistic_style.syntax_and_rhythm?.signature_phrases) {
        linguisticMarkers.push(`signature_phrases: ${personaData.linguistic_style.syntax_and_rhythm.signature_phrases.slice(0, 3).join(', ')}`);
      }
    }

    return {
      high_priority_traits: relevantTraits.sort((a, b) => b.relevance - a.relevance).slice(0, 8),
      emotional_triggers: emotionalTriggers,
      knowledge_domains: knowledgeDomains,
      linguistic_markers: linguisticMarkers
    };
  }

  static calculateTraitRelevance(traitDef: any, traitValue: number, userMessage: string, conversationContext: string): TraitRelevanceScore {
    const text = (userMessage + ' ' + conversationContext).toLowerCase();
    let relevance = 0.3; // Base relevance
    let behavioral_impact = '';

    // Context-specific relevance boosts
    const contextBoosts: Record<string, string[]> = {
      'agreeableness': ['disagree', 'conflict', 'argument', 'opinion', 'wrong'],
      'neuroticism': ['stress', 'worry', 'anxiety', 'nervous', 'upset', 'problem'],
      'extraversion': ['social', 'people', 'party', 'group', 'meeting', 'talk'],
      'openness': ['creative', 'new', 'different', 'idea', 'change', 'art'],
      'conscientiousness': ['plan', 'organize', 'work', 'deadline', 'schedule', 'responsible'],
      'care': ['hurt', 'help', 'protect', 'harm', 'welfare', 'suffering'],
      'fairness': ['fair', 'unfair', 'justice', 'equal', 'deserve', 'rights'],
      'authority': ['boss', 'leader', 'rule', 'policy', 'government', 'order'],
      'empathy': ['feel', 'understand', 'emotion', 'perspective', 'sympathy'],
      'conflict': ['argue', 'fight', 'disagree', 'tension', 'dispute'],
    };

    // Check for contextual relevance
    for (const [trait, keywords] of Object.entries(contextBoosts)) {
      if (traitDef.subcategory.includes(trait) || traitDef.traitPath.includes(trait)) {
        const matches = keywords.filter(keyword => text.includes(keyword)).length;
        relevance += matches * 0.2;
      }
    }

    // Extreme values are more relevant
    const extremeness = Math.abs(traitValue - 0.5) * 2;
    relevance += extremeness * 0.3;

    // Generate behavioral impact description
    if (traitDef.category === 'Big Five') {
      behavioral_impact = this.getBigFiveBehavioral(traitDef.subcategory, traitValue);
    } else if (traitDef.category === 'Moral Foundations') {
      behavioral_impact = this.getMoralFoundationBehavioral(traitDef.subcategory, traitValue);
    } else {
      behavioral_impact = this.getGeneralBehavioral(traitDef.subcategory, traitValue);
    }

    return {
      category: traitDef.category,
      trait: traitDef.subcategory,
      value: traitValue,
      relevance: Math.min(1.0, relevance),
      behavioral_impact
    };
  }

  static getBigFiveBehavioral(trait: string, value: number): string {
    const level = value > 0.7 ? 'high' : value < 0.3 ? 'low' : 'moderate';
    
    const behaviors: Record<string, Record<string, string>> = {
      'openness': {
        'high': 'Creative, curious, seeks new experiences',
        'moderate': 'Balanced between tradition and innovation',
        'low': 'Practical, traditional, prefers familiar approaches'
      },
      'conscientiousness': {
        'high': 'Organized, disciplined, detail-oriented',
        'moderate': 'Generally reliable with some flexibility',
        'low': 'Spontaneous, flexible, less concerned with details'
      },
      'extraversion': {
        'high': 'Outgoing, energetic, seeks social interaction',
        'moderate': 'Balanced social preferences',
        'low': 'Reserved, prefers quiet environments, thoughtful'
      },
      'agreeableness': {
        'high': 'Cooperative, trusting, accommodating',
        'moderate': 'Balanced approach to cooperation and assertiveness',
        'low': 'Direct, skeptical, prioritizes own interests'
      },
      'neuroticism': {
        'high': 'Emotionally reactive, stress-sensitive, worries easily',
        'moderate': 'Generally stable with occasional emotional fluctuations',
        'low': 'Calm, resilient, emotionally stable'
      }
    };

    return behaviors[trait]?.[level] || `${level} ${trait}`;
  }

  static getMoralFoundationBehavioral(trait: string, value: number): string {
    const level = value > 0.7 ? 'high' : value < 0.3 ? 'low' : 'moderate';
    
    const behaviors: Record<string, Record<string, string>> = {
      'care': {
        'high': 'Highly protective, empathetic, concerned with suffering',
        'moderate': 'Generally caring but balanced with other concerns',
        'low': 'Less emotionally driven by care/harm considerations'
      },
      'fairness': {
        'high': 'Strong justice orientation, equality-focused',
        'moderate': 'Balanced fairness concerns',
        'low': 'Less concerned with equality, more hierarchical thinking'
      },
      'authority': {
        'high': 'Respects hierarchy, follows rules and traditions',
        'moderate': 'Balanced respect for authority',
        'low': 'Questions authority, prefers individual autonomy'
      },
      'liberty': {
        'high': 'Values freedom, resists oppression and control',
        'moderate': 'Balanced liberty concerns',
        'low': 'More accepting of constraints and limitations'
      }
    };

    return behaviors[trait]?.[level] || `${level} ${trait} orientation`;
  }

  static getGeneralBehavioral(trait: string, value: any): string {
    if (typeof value === 'string') {
      return `${trait}: ${value}`;
    }
    if (typeof value === 'number') {
      const level = value > 0.7 ? 'high' : value < 0.3 ? 'low' : 'moderate';
      return `${level} ${trait}`;
    }
    return `${trait}: ${String(value)}`;
  }

  static isDomainRelevant(domain: string, userMessage: string, conversationContext: string): boolean {
    const text = (userMessage + ' ' + conversationContext).toLowerCase();
    const domainKeywords = domain.toLowerCase().split(/[\s_-]+/);
    return domainKeywords.some(keyword => text.includes(keyword));
  }

  static getTraitValue(personaData: any, path: string): number | null {
    const parts = path.split('.');
    let current = personaData;
    
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return null;
      }
    }
    
    return typeof current === 'number' ? current : null;
  }
}

// ============= JSON PROMPT BUILDER =============

interface PersonaAuthenticChatRequest {
  personaId: string;
  message: string;
  previousMessages?: Array<{ role: string; content: string }>;
  conversationContext?: string;
  imageData?: string;
}

function buildAuthenticPersonaPrompt(
  personaData: any, 
  traitScan: TraitScanResult,
  currentMessage: string,
  conversationHistory: Array<{ role: string; content: string }>,
  conversationContext: string
) {
  // Extract core identity
  const identity = personaData.identity || {};
  const lifeContext = personaData.life_context || {};
  const knowledgeProfile = personaData.knowledge_profile || {};
  const linguisticStyle = personaData.linguistic_style || {};
  const currentState = personaData.state_modifiers?.current_state || {};

  return {
    system_directive: "Generate response AS this specific person, not as helpful AI. Use their actual personality traits, not sanitized versions. Respond from their genuine perspective, knowledge limitations, and emotional state.",
    
    persona: {
      core_identity: {
        name: identity.name || 'Unknown',
        age: identity.age,
        occupation: identity.occupation,
        location: identity.location ? `${identity.location.city}, ${identity.location.region}` : undefined,
        background: lifeContext.background_narrative,
        current_situation: lifeContext.current_situation,
        life_stressors: lifeContext.stressors || []
      },
      
      active_traits: traitScan.high_priority_traits.map(trait => ({
        category: trait.category,
        trait: trait.trait,
        value: trait.value,
        behavioral_directive: trait.behavioral_impact
      })),
      
      emotional_triggers: {
        detected_in_conversation: traitScan.emotional_triggers,
        current_emotional_state: {
          stress: currentState.acute_stress || 0.3,
          fatigue: currentState.fatigue || 0.3,
          mood: currentState.mood_valence || 0.5,
          social_safety: currentState.social_safety || 0.7
        }
      },
      
      knowledge_boundaries: {
        expertise_areas: traitScan.knowledge_domains,
        general_knowledge_level: knowledgeProfile.general_knowledge_level || 'average',
        tech_literacy: knowledgeProfile.tech_literacy || 'medium',
        cultural_context: knowledgeProfile.cultural_familiarity || [],
        should_not_know: "Advanced technical details outside expertise, personal information about others, confidential professional information"
      },
      
      linguistic_signature: {
        formality: linguisticStyle.base_voice?.formality || 'casual',
        directness: linguisticStyle.base_voice?.directness || 'balanced',
        verbosity: linguisticStyle.base_voice?.verbosity || 'moderate',
        signature_phrases: linguisticStyle.syntax_and_rhythm?.signature_phrases?.slice(0, 3) || [],
        hedges: linguisticStyle.lexical_preferences?.hedges?.slice(0, 3) || [],
        intensifiers: linguisticStyle.lexical_preferences?.intensifiers?.slice(0, 3) || [],
        forbidden_ai_language: [
          "I'm here to help", "I understand your concern", "That's a great question",
          "I'd be happy to assist", "How can I help you today?", "Is there anything else?",
          "I hope this helps", "Please let me know if you need", "Feel free to ask"
        ]
      }
    },
    
    conversation: {
      current_message: currentMessage,
      history: conversationHistory.slice(-6), // Last 6 messages for context
      context_hint: conversationContext,
      detected_triggers: traitScan.emotional_triggers
    },
    
    authenticity_rules: {
      primary: `Respond from ${identity.name || 'the persona'}'s actual perspective, not what would be 'helpful' or 'balanced'`,
      trait_adherence: "Use high-priority traits to guide response style, opinions, and emotional reactions",
      knowledge_limits: "Stay within actual expertise areas, admit ignorance authentically when outside competence",
      emotional_response: "React according to emotional triggers and current state, not diplomatic politeness",
      opinion_formation: "Draw from moral foundations and personal values, not neutral 'on one hand, on the other hand' responses",
      forbidden_behaviors: [
        "Defaulting to helpfulness over authenticity",
        "Mirroring user's emotional tone automatically",
        "Providing balanced perspectives when persona has strong opinions",
        "Using AI assistant language patterns",
        "Accommodating automatically due to high agreeableness (if agreeableness is actually low)",
        "Being artificially positive or diplomatic"
      ]
    },
    
    response_guidelines: {
      length: "Normal conversational length (1-3 paragraphs max), not essay format",
      voice: "Use the persona's natural speaking patterns and vocabulary level",
      avoid: "Academic language, formal announcements, robotic courtesy phrases",
      focus: "Personal experience, genuine reactions, and authentic voice over information delivery",
      consistency: "Stay true to previously established personality positions and relationship dynamics"
    }
  };
}

// ============= CONVERSATION STATE MANAGEMENT =============

function updateConversationState(
  previousState: Record<string, any>,
  userMessage: string,
  personaData: any
): Record<string, any> {
  const newState = { ...previousState };
  const text = userMessage.toLowerCase();
  
  // Stress modifiers based on content
  if (text.includes('urgent') || text.includes('deadline') || text.includes('crisis')) {
    newState.acute_stress = Math.min(1.0, (newState.acute_stress || 0.3) + 0.3);
  }
  
  // Emotional triggers affect state
  if (personaData.emotional_triggers?.explosive) {
    for (const trigger of personaData.emotional_triggers.explosive) {
      if (text.includes(trigger.toLowerCase())) {
        newState.mood_valence = Math.max(0.0, (newState.mood_valence || 0.5) - 0.4);
        newState.acute_stress = Math.min(1.0, (newState.acute_stress || 0.3) + 0.5);
      }
    }
  }
  
  // Positive triggers
  if (personaData.emotional_triggers?.positive) {
    for (const trigger of personaData.emotional_triggers.positive) {
      if (text.includes(trigger.toLowerCase())) {
        newState.mood_valence = Math.min(1.0, (newState.mood_valence || 0.5) + 0.3);
      }
    }
  }
  
  // Social safety assessment
  if (text.includes('trust') || text.includes('safe') || text.includes('comfortable')) {
    newState.social_safety = Math.min(1.0, (newState.social_safety || 0.7) + 0.2);
  } else if (text.includes('attack') || text.includes('judge') || text.includes('wrong')) {
    newState.social_safety = Math.max(0.0, (newState.social_safety || 0.7) - 0.3);
  }
  
  return newState;
}

// ============= MAIN EDGE FUNCTION =============

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      personaId, 
      message, 
      previousMessages = [], 
      conversationContext = '',
      imageData
    }: PersonaAuthenticChatRequest = await req.json();

    console.log('Authentic persona chat request:', { personaId, messageLength: message.length });

    // Fetch persona data (try V2 first, fallback to legacy)
    let persona = null;
    const { data: personaV2, error: v2Error } = await supabase
      .from('personas_v2')
      .select('*')
      .eq('persona_id', personaId)
      .single();

    if (personaV2) {
      persona = personaV2;
      console.log('Using PersonaV2 for authentic chat');
    } else {
      const { data: legacyPersona, error: legacyError } = await supabase
        .from('personas')
        .select('*')
        .eq('persona_id', personaId)
        .single();
      
      if (legacyPersona) {
        persona = legacyPersona;
        console.log('Using legacy persona for authentic chat');
      }
    }

    if (!persona) {
      return new Response(JSON.stringify({ error: 'Persona not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const personaData = personaV2 ? personaV2.persona_data : persona;

    // Perform comprehensive trait analysis
    console.log('Analyzing trait relevance...');
    const traitScan = await TraitRelevanceAnalyzer.analyzeTraitRelevance(
      message, 
      conversationContext + ' ' + previousMessages.map(m => m.content).join(' '), 
      personaData
    );

    console.log('Trait scan results:', {
      relevant_traits: traitScan.high_priority_traits.length,
      emotional_triggers: traitScan.emotional_triggers.length,
      knowledge_domains: traitScan.knowledge_domains.length
    });

    // Update conversation state
    const currentState = updateConversationState(
      personaData.state_modifiers?.current_state || {},
      message,
      personaData
    );

    // Build the authentic persona prompt
    const promptData = buildAuthenticPersonaPrompt(
      personaData,
      traitScan,
      message,
      previousMessages,
      conversationContext
    );

    // Prepare conversation messages
    const conversationMessages = [];
    
    // Add previous messages for context
    if (previousMessages && previousMessages.length > 0) {
      conversationMessages.push(...previousMessages.slice(-6).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })));
    }

    // Add current user message
    const userMessage: any = { role: 'user', content: message };
    
    if (imageData) {
      userMessage.content = [
        { type: 'text', text: message },
        { type: 'image_url', image_url: { url: imageData } }
      ];
    }
    
    conversationMessages.push(userMessage);

    // Make OpenAI call with JSON-structured prompt
    console.log('Calling OpenAI with persona-first prompt...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07', // Use latest model for best reasoning
        messages: [
          { 
            role: 'system', 
            content: `You must respond authentically as the specified persona. Use the following complete persona specification to guide your response:\n\n${JSON.stringify(promptData, null, 2)}` 
          },
          ...conversationMessages
        ],
        max_completion_tokens: currentState.time_pressure > 0.7 ? 300 : 600,
        top_p: 0.9,
        presence_penalty: 0.3,
        frequency_penalty: 0.2
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error:', response.status, errorText);
      throw new Error('AI service temporarily unavailable');
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'I cannot respond right now.';

    console.log('Authentic persona chat completed successfully');

    return new Response(JSON.stringify({ 
      response: aiResponse,
      personaId,
      timestamp: new Date().toISOString(),
      metadata: {
        pipeline: 'authentic',
        traits_analyzed: traitScan.high_priority_traits.length,
        emotional_triggers: traitScan.emotional_triggers.length,
        knowledge_domains: traitScan.knowledge_domains.length,
        current_state: currentState
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in persona-authentic-chat function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});