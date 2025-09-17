import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { buildV4CompactInstructions } from './instructions-compact.ts'

// Feature flag for realism v1 (default OFF)
const REALISM_FLAG = Deno.env.get("ENABLE_REALISM_V1") === "true";

// V4-NATIVE TRAIT RELEVANCE ANALYZER
class V4TraitRelevanceAnalyzer {
  private static readonly V4_TRAIT_PATHS = [
    // MOTIVATION PROFILE PATHS
    { path: 'motivation_profile.primary_drivers.self_interest', weight: 0.9, contexts: ['personal', 'decision', 'advice'] },
    { path: 'motivation_profile.primary_drivers.family', weight: 1.0, contexts: ['family', 'relationships', 'children', 'parenting'] },
    { path: 'motivation_profile.primary_drivers.status', weight: 0.8, contexts: ['career', 'achievement', 'recognition', 'success'] },
    { path: 'motivation_profile.primary_drivers.mastery', weight: 0.8, contexts: ['learning', 'skill', 'improvement', 'expertise'] },
    { path: 'motivation_profile.primary_drivers.care', weight: 0.7, contexts: ['helping', 'support', 'community', 'service'] },
    { path: 'motivation_profile.primary_drivers.security', weight: 0.9, contexts: ['safety', 'stability', 'financial', 'planning'] },
    { path: 'motivation_profile.primary_drivers.belonging', weight: 0.6, contexts: ['group', 'team', 'community', 'social'] },
    { path: 'motivation_profile.primary_drivers.novelty', weight: 0.5, contexts: ['new', 'change', 'adventure', 'innovation'] },
    { path: 'motivation_profile.primary_drivers.meaning', weight: 0.7, contexts: ['purpose', 'values', 'belief', 'philosophy'] },

    // GOAL ORIENTATION
    { path: 'motivation_profile.goal_orientation.strength', weight: 0.8, contexts: ['goals', 'planning', 'achievement'] },
    { path: 'motivation_profile.goal_orientation.primary_goals', weight: 0.9, contexts: ['specific', 'objectives', 'targets'] },

    // INHIBITOR PROFILE
    { path: 'inhibitor_profile.social_cost_sensitivity', weight: 0.7, contexts: ['social', 'judgment', 'reputation'] },
    { path: 'inhibitor_profile.consequence_aversion', weight: 0.6, contexts: ['risk', 'caution', 'safety'] },
    { path: 'inhibitor_profile.confidence_level', weight: 0.8, contexts: ['assertion', 'opinion', 'leadership'] },
    { path: 'inhibitor_profile.perfectionism', weight: 0.7, contexts: ['quality', 'standards', 'criticism'] },
    { path: 'inhibitor_profile.confirmation_bias', weight: 0.8, contexts: ['information', 'evidence', 'belief'] },

    // EMOTIONAL PROFILE
    { path: 'emotional_profile.positive_triggers', weight: 1.0, contexts: ['motivation', 'energy', 'enthusiasm'] },
    { path: 'emotional_profile.negative_triggers', weight: 1.0, contexts: ['frustration', 'anger', 'stress'] },
    { path: 'emotional_profile.explosive_triggers', weight: 1.2, contexts: ['extreme', 'passionate', 'intense'] },

    // KNOWLEDGE PROFILE
    { path: 'knowledge_profile.expertise_domains', weight: 0.9, contexts: ['professional', 'work', 'technical'] },
    { path: 'knowledge_profile.knowledge_gaps', weight: 0.6, contexts: ['learning', 'unfamiliar', 'limitations'] },
    { path: 'knowledge_profile.education_level', weight: 0.5, contexts: ['academic', 'formal', 'theoretical'] },

    // COMMUNICATION STYLE
    { path: 'communication_style.voice_foundation.directness_level', weight: 0.8, contexts: ['opinion', 'feedback', 'criticism'] },
    { path: 'communication_style.voice_foundation.formality_default', weight: 0.7, contexts: ['professional', 'casual', 'social'] },
    { path: 'communication_style.linguistic_signature.signature_phrases', weight: 0.3, contexts: ['all'] },
    { path: 'communication_style.linguistic_signature.typical_openers', weight: 0.8, contexts: ['conversation', 'greeting'] },
    { path: 'communication_style.linguistic_signature.conversation_enders', weight: 0.7, contexts: ['conclusion', 'farewell'] },
    { path: 'communication_style.authenticity_filters.forbidden_phrases', weight: 1.0, contexts: ['all'] },

    // IDENTITY SALIENCE
    { path: 'identity_salience.political_identity.orientation', weight: 0.9, contexts: ['politics', 'policy', 'government'] },
    { path: 'identity_salience.political_identity.strength', weight: 0.8, contexts: ['political', 'ideology'] },
    { path: 'identity_salience.political_identity.tribal_loyalty', weight: 0.9, contexts: ['group', 'loyalty', 'opposition'] },
    { path: 'identity_salience.community_identities', weight: 0.8, contexts: ['identity', 'background', 'culture'] },

    // CONTRADICTIONS
    { path: 'contradictions.primary_tension', weight: 0.9, contexts: ['conflict', 'dilemma', 'inconsistency'] },
    { path: 'contradictions.secondary_tensions', weight: 0.7, contexts: ['complexity', 'nuance'] },

    // TRUTH/HONESTY
    { path: 'truth_honesty_profile.baseline_honesty', weight: 0.7, contexts: ['truth', 'honesty', 'disclosure'] },
    { path: 'truth_honesty_profile.truth_flexibility_by_context', weight: 0.8, contexts: ['context', 'audience', 'situation'] },
  ];

  static analyzeTraitRelevance(userInput, fullProfile, conversationSummary) {
    const input = userInput.toLowerCase();
    const selectedTraits = [];

    // 1. CLASSIFY THE TURN
    const classification = this.classifyTurn(userInput);

    // 2. ANALYZE TRAIT RELEVANCE - SCAN ALL TRAITS DYNAMICALLY
    const allTraits = this.extractAllTraits(fullProfile);
    for (const traitData of allTraits) {
      const score = this.calculateDynamicTraitRelevance(input, traitData, fullProfile);
      if (score > 0.3) { // Relevance threshold
        selectedTraits.push({
          trait: traitData.path,
          score: score,
          relevance_reason: this.getDynamicRelevanceReason(input, traitData),
          data_value: traitData.value
        });
      }
    }

    // 3. EXTRACT LINGUISTIC SIGNATURE
    const linguisticSignature = this.extractLinguisticSignature(fullProfile);

    // 4. DETERMINE BEHAVIORAL MODIFIERS
    const behavioralModifiers = this.calculateBehavioralModifiers(selectedTraits, fullProfile);

    // 5. CALCULATE KNOWLEDGE BOUNDARIES
    const knowledgeBoundary = this.calculateKnowledgeBoundaries(classification.topics, fullProfile);

    // Sort traits by relevance score
    selectedTraits.sort((a, b) => b.score - a.score);

    return {
      selected_traits: selectedTraits.slice(0, 12), // Top 12 most relevant traits
      context_classification: classification,
      linguistic_signature: linguisticSignature,
      behavioral_modifiers: behavioralModifiers,
      knowledge_boundary: knowledgeBoundary
    };
  }

  static classifyTurn(userInput) {
    const input = userInput.toLowerCase();

    // Classify intent
    let intent = 'clarify';
    if (input.includes('what do you think') || input.includes('opinion')) intent = 'opinion';
    else if (input.includes('how to') || input.includes('advice') || input.includes('should i')) intent = 'advice';
    else if (input.includes('tell me about') || input.includes('experience')) intent = 'story';
    else if (input.includes('vs') || input.includes('compare') || input.includes('better')) intent = 'compare';
    else if (input.includes('wrong') || input.includes('bad') || input.includes('critique')) intent = 'critique';

    // Extract topics
    const topics = [];
    if (input.includes('work') || input.includes('job') || input.includes('career')) topics.push('work');
    if (input.includes('family') || input.includes('children') || input.includes('kids')) topics.push('family');
    if (input.includes('money') || input.includes('finance') || input.includes('investment')) topics.push('finance');
    if (input.includes('politic') || input.includes('government') || input.includes('policy')) topics.push('politics');
    if (input.includes('relationship') || input.includes('dating') || input.includes('marriage')) topics.push('relationships');

    // Determine audience (simplified)
    const audience = 'peer'; // Default assumption

    // Assess sensitivity
    let sensitivity = 'low';
    if (topics.includes('politics') || input.includes('controversial')) sensitivity = 'high';
    else if (topics.includes('family') || topics.includes('relationships')) sensitivity = 'medium';

    return { intent, topics, audience, sensitivity };
  }

  static calculateTraitRelevance(userInput, traitPath, fullProfile) {
    let score = 0;

    // Check context relevance
    const hasContextMatch = traitPath.contexts.includes('all') || 
      traitPath.contexts.some(context => userInput.includes(context));

    if (hasContextMatch) {
      score += traitPath.weight * 0.7;
    }

    // Check for keyword matches in trait content
    const traitValue = this.getNestedValue(fullProfile, traitPath.path);
    if (traitValue) {
      const contentMatch = this.checkContentRelevance(userInput, traitValue);
      score += contentMatch * 0.3;
    }

    return Math.min(score, 1.0);
  }

  static checkContentRelevance(userInput, traitValue) {
    if (!traitValue) return 0;

    const input = userInput.toLowerCase();
    let content = '';

    if (typeof traitValue === 'string') {
      content = traitValue.toLowerCase();
    } else if (Array.isArray(traitValue)) {
      content = traitValue.join(' ').toLowerCase();
    } else if (typeof traitValue === 'object') {
      content = JSON.stringify(traitValue).toLowerCase();
    }

    if (!content) return 0;

    // Count keyword matches
    const inputWords = input.split(/\s+/).filter(word => word.length > 2);
    const matches = inputWords.filter(word => content.includes(word));
    
    return Math.min(matches.length / inputWords.length, 1.0);
  }

  static extractAllTraits(fullProfile) {
    const traits = [];
    
    function extractTraitsRecursive(obj, path = '') {
      if (!obj || typeof obj !== 'object') return;
      
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          extractTraitsRecursive(value, currentPath);
        } else if (value !== null && value !== undefined && value !== '') {
          traits.push({
            path: currentPath,
            value: value,
            type: Array.isArray(value) ? 'array' : typeof value
          });
        }
      }
    }
    
    extractTraitsRecursive(fullProfile);
    return traits;
  }

  static calculateDynamicTraitRelevance(userInput, traitData, fullProfile) {
    let score = 0;
    
    // Base relevance from path keywords
    const pathKeywords = traitData.path.toLowerCase().split('.');
    const inputWords = userInput.toLowerCase().split(/\s+/);
    
    const pathMatches = pathKeywords.filter(keyword => 
      inputWords.some(word => word.includes(keyword) || keyword.includes(word))
    );
    
    if (pathMatches.length > 0) {
      score += 0.6 * (pathMatches.length / pathKeywords.length);
    }
    
    // Content relevance
    const contentScore = this.checkContentRelevance(userInput, traitData.value);
    score += contentScore * 0.4;
    
    // Boost score for critical trait categories
    if (traitData.path.includes('emotional_profile') || 
        traitData.path.includes('explosive_triggers') ||
        traitData.path.includes('forbidden_phrases') ||
        traitData.path.includes('knowledge_profile') ||
        traitData.path.includes('political_identity')) {
      score *= 1.2;
    }
    
    return Math.min(score, 1.0);
  }

  static getDynamicRelevanceReason(userInput, traitData) {
    const pathKeywords = traitData.path.toLowerCase().split('.');
    const inputWords = userInput.toLowerCase().split(/\s+/);
    
    const matches = pathKeywords.filter(keyword => 
      inputWords.some(word => word.includes(keyword) || keyword.includes(word))
    );
    
    if (matches.length > 0) {
      return `Path relevance: ${matches.join(', ')}`;
    }
    
    return 'Content similarity detected';
  }

  static getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  static getRelevanceReason(userInput, traitPath) {
    const matchedContexts = traitPath.contexts.filter(context => 
      context === 'all' || userInput.toLowerCase().includes(context)
    );
    
    if (matchedContexts.length > 0) {
      return `Matched contexts: ${matchedContexts.join(', ')}`;
    }
    
    return 'Content similarity detected';
  }

  static extractLinguisticSignature(fullProfile) {
    const commStyle = fullProfile?.communication_style?.linguistic_signature;
    const authFilters = fullProfile?.communication_style?.authenticity_filters;

    return {
      signature_phrases: commStyle?.signature_phrases || [],
      forbidden_expressions: authFilters?.forbidden_phrases || [],
      typical_openers: commStyle?.typical_openers || [],
      conversation_enders: commStyle?.conversation_enders || [],
      sentence_patterns: commStyle?.sentence_patterns || []
    };
  }

  static calculateBehavioralModifiers(selectedTraits, fullProfile) {
    // Extract confidence adjustment - check selected traits first, then fallback to profile
    const confidenceTraits = selectedTraits.filter(t => t.trait.includes('confidence_level'));
    const confidenceValue = confidenceTraits.length > 0 ? confidenceTraits[0].data_value : 
      fullProfile?.communication_style?.voice_foundation?.confidence_level || 0.5;
    
    // Extract directness level - check selected traits first, then fallback to profile  
    const directnessTraits = selectedTraits.filter(t => t.trait.includes('directness_level'));
    const directnessLevel = directnessTraits.length > 0 ? directnessTraits[0].data_value :
      fullProfile?.communication_style?.voice_foundation?.directness_level || 'balanced';

    // Determine emotional state from triggers
    const emotionalTraits = selectedTraits.filter(t => 
      t.trait.includes('emotional_profile') || t.trait.includes('explosive_triggers')
    );
    const emotionalState = emotionalTraits.length > 0 ? 'activated' : 'neutral';

    // Extract formality - check selected traits first, then fallback to profile
    const formalityTraits = selectedTraits.filter(t => t.trait.includes('formality_default'));
    const formalityShift = formalityTraits.length > 0 ? formalityTraits[0].data_value :
      fullProfile?.communication_style?.voice_foundation?.formality_default || 'neutral';

    return {
      confidence_adjustment: typeof confidenceValue === 'number' ? confidenceValue : 0.5,
      directness_level: typeof directnessLevel === 'string' ? directnessLevel : 'balanced',
      emotional_state: emotionalState,
      formality_shift: typeof formalityShift === 'string' ? formalityShift : 'neutral'
    };
  }

  static calculateKnowledgeBoundaries(userTopics, fullProfile) {
    // Extract expertise domains from the persona
    const expertiseDomains = fullProfile?.knowledge_profile?.expertise_domains || [];
    
    // Expand topic keywords for better matching
    const expandedTopics = this.expandTopics(userTopics);
    const expandedExpertise = this.expandExpertiseDomains(expertiseDomains);
    
    // Calculate overlap score
    const overlapScore = this.calculateTopicExpertiseOverlap(expandedTopics, expandedExpertise);
    
    // Determine confidence level
    let confidenceLevel;
    if (overlapScore >= 0.7) confidenceLevel = 'high';
    else if (overlapScore >= 0.3) confidenceLevel = 'medium';
    else confidenceLevel = 'low';
    
    // Generate guidance based on overlap
    const guidance = this.generateKnowledgeGuidance(confidenceLevel, expandedTopics, expandedExpertise);
    
    return {
      user_topics: expandedTopics,
      expertise_domains: expandedExpertise,
      overlap_score: overlapScore,
      confidence_level: confidenceLevel,
      guidance
    };
  }

  static expandTopics(topics) {
    const topicExpansions = {
      'work': ['career', 'professional', 'employment', 'job', 'business'],
      'finance': ['money', 'investment', 'financial', 'economic', 'budget', 'market'],
      'politics': ['government', 'policy', 'political', 'election', 'law', 'regulation'],
      'family': ['children', 'parenting', 'relationships', 'marriage', 'kids'],
      'relationships': ['dating', 'friendship', 'social', 'interpersonal'],
      'technology': ['tech', 'software', 'digital', 'computer', 'programming', 'AI'],
      'health': ['medical', 'wellness', 'fitness', 'healthcare', 'mental health'],
      'education': ['learning', 'school', 'academic', 'study', 'training'],
      'climate': ['environment', 'sustainability', 'green', 'carbon', 'emissions'],
      'science': ['research', 'scientific', 'study', 'data', 'analysis']
    };

    const expanded = new Set(topics);
    topics.forEach(topic => {
      if (topicExpansions[topic]) {
        topicExpansions[topic].forEach(expansion => expanded.add(expansion));
      }
    });

    return Array.from(expanded);
  }

  static expandExpertiseDomains(domains) {
    const domainExpansions = {
      'real estate': ['property', 'housing', 'development', 'investment property', 'construction'],
      'technology': ['tech', 'software', 'programming', 'digital', 'IT', 'computers'],
      'finance': ['banking', 'investment', 'trading', 'financial planning', 'economics'],
      'healthcare': ['medical', 'medicine', 'health', 'clinical', 'patient care'],
      'law': ['legal', 'attorney', 'court', 'litigation', 'contracts'],
      'education': ['teaching', 'academic', 'curriculum', 'learning', 'training'],
      'manufacturing': ['production', 'industrial', 'factory', 'operations'],
      'mining': ['extraction', 'minerals', 'geological', 'resources'],
      'agriculture': ['farming', 'crops', 'livestock', 'rural', 'food production'],
      'automotive': ['cars', 'vehicles', 'transportation', 'mechanics']
    };

    const expanded = new Set();
    domains.forEach(domain => {
      const domainLower = domain.toLowerCase();
      expanded.add(domainLower);
      
      // Check for partial matches in expansions
      Object.entries(domainExpansions).forEach(([key, expansions]) => {
        if (domainLower.includes(key) || key.includes(domainLower)) {
          expansions.forEach(expansion => expanded.add(expansion));
        }
      });
    });

    return Array.from(expanded);
  }

  static calculateTopicExpertiseOverlap(topics, expertise) {
    if (topics.length === 0 || expertise.length === 0) return 0;

    let matches = 0;
    const totalComparisons = topics.length;

    topics.forEach(topic => {
      const hasMatch = expertise.some(exp => {
        return topic.includes(exp) || exp.includes(topic) || 
               this.calculateStringSimilarity(topic, exp) > 0.6;
      });
      if (hasMatch) matches++;
    });

    return matches / totalComparisons;
  }

  static calculateStringSimilarity(str1, str2) {
    const words1 = str1.toLowerCase().split(/\s+/);
    const words2 = str2.toLowerCase().split(/\s+/);
    
    let commonWords = 0;
    words1.forEach(word1 => {
      if (words2.some(word2 => word1.includes(word2) || word2.includes(word1))) {
        commonWords++;
      }
    });

    return commonWords / Math.max(words1.length, words2.length);
  }

  static generateKnowledgeGuidance(confidence, topics, expertise) {
    switch (confidence) {
      case 'high':
        return `You have strong expertise in this area (${expertise.slice(0, 3).join(', ')}). Speak confidently about these topics: ${topics.slice(0, 3).join(', ')}.`;
      
      case 'medium':
        return `You have some relevant knowledge but this question touches on areas outside your core expertise. Share what you know but acknowledge limitations where appropriate.`;
      
      case 'low':
        return `This question is about ${topics.slice(0, 2).join(' and ')} but your expertise is in ${expertise.slice(0, 2).join(' and ')}. Express appropriate uncertainty and acknowledge your knowledge limitations on these specific technical details.`;
      
      default:
        return 'Respond based on your general knowledge and personal experience.';
    }
  }
}

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

// Helper functions for dominant trait selection
function selectMotivationTraits(fullProfile: any): any[] {
  const chosen = [];
  const motivationProfile = fullProfile?.motivation_profile;
  
  if (motivationProfile?.primary_drivers) {
    const topMotivations = Object.entries(motivationProfile.primary_drivers)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 2);
    
    for (const [key, value] of topMotivations) {
      chosen.push({
        trait: `motivation.${key}`,
        data_value: value,
        relevance_reason: 'top motivation driver'
      });
    }
  }
  
  if (motivationProfile?.goal_orientation?.primary_goals?.[0]) {
    chosen.push({
      trait: 'goal_orientation.primary_goal',
      data_value: motivationProfile.goal_orientation.primary_goals[0],
      relevance_reason: 'primary life goal'
    });
  }
  
  return chosen.slice(0, 2);
}

function selectContextAnchor(fullProfile: any): any {
  const identitySalience = fullProfile?.identity_salience;
  const knowledgeProfile = fullProfile?.knowledge_profile;
  
  // Check for strong cultural/professional identity
  if (identitySalience?.community_identities) {
    const strongestIdentity = identitySalience.community_identities
      .sort((a: any, b: any) => (b.salience || 0) - (a.salience || 0))[0];
    
    if (strongestIdentity?.salience > 0.6) {
      return {
        trait: `identity_salience.${strongestIdentity.type}`,
        data_value: strongestIdentity,
        relevance_reason: 'strong identity anchor'
      };
    }
  }
  
  // Fallback to expertise domain
  if (knowledgeProfile?.expertise_domains?.[0]) {
    return {
      trait: 'knowledge_profile.primary_expertise',
      data_value: knowledgeProfile.expertise_domains[0],
      relevance_reason: 'primary expertise domain'
    };
  }
  
  return null;
}

function pickDominantTraits(selectedTraits: any[], fullProfile: any, k = 6): any[] {
  const chosen = [];

  // 1–2 motivation/goal traits (always include)
  chosen.push(...selectMotivationTraits(fullProfile));

  // 1 identity/knowledge anchor (always include)
  const contextAnchor = selectContextAnchor(fullProfile);
  if (contextAnchor) {
    chosen.push(contextAnchor);
  }

  // Filter out abstract scaffolding traits
  const abstractTraits = [
    'response_architecture', 
    'storytelling_structure', 
    'communication_framework',
    'discourse_management',
    'meta_communication'
  ];
  
  const filteredTraits = selectedTraits.filter(trait => 
    !chosen.some(c => c.trait === trait.trait) &&
    !abstractTraits.some(abstract => trait.trait.includes(abstract))
  );

  // Fill remaining slots with top-scoring selected traits
  const remainingSlots = Math.min(k - chosen.length, k - 4); // Ensure 4-6 total
  chosen.push(...filteredTraits.slice(0, remainingSlots));

  // Return 4-6 total (never 8+)
  return chosen.slice(0, Math.min(k, 6));
}

// V4-Native instruction builder using trait analysis results
function buildV4NativeInstructions(v4Analysis: any, conversationSummary: any, userInput: string, fullProfile: any, realismEnabled: boolean = false): string {
  const selectedTraits = v4Analysis.selected_traits;
  const linguistic = v4Analysis.linguistic_signature;
  const behavioral = v4Analysis.behavioral_modifiers;
  const classification = v4Analysis.context_classification;

  // Extract numerical motivations from full_profile
  const motivations = {
    family_security: fullProfile?.motivation_profile?.family_security || 5,
    personal_achievement: fullProfile?.motivation_profile?.personal_achievement || 5,
    financial_stability: fullProfile?.motivation_profile?.financial_stability || 5,
    social_status: fullProfile?.motivation_profile?.social_status || 5,
    work_life_balance: fullProfile?.motivation_profile?.work_life_balance || 5,
    community_contribution: fullProfile?.motivation_profile?.community_contribution || 5,
    personal_growth: fullProfile?.motivation_profile?.personal_growth || 5,
    autonomy_independence: fullProfile?.motivation_profile?.autonomy_independence || 5
  };

  // Build structured relevant traits matching gold standard
  const relevantTraits = {
    contradiction: selectedTraits.find(t => t.trait.includes('contradiction'))?.data_value || null,
    emotional_triggers: selectedTraits.find(t => t.trait.includes('emotional_profile'))?.data_value || null,
    knowledge_profile: selectedTraits.find(t => t.trait.includes('knowledge_profile'))?.data_value || null,
    behavioral_econ: selectedTraits.find(t => t.trait.includes('behavioral_econ'))?.data_value || null,
    political_identity: selectedTraits.find(t => t.trait.includes('political_identity'))?.data_value || null,
    cultural_background: selectedTraits.find(t => t.trait.includes('cultural_background'))?.data_value || null,
    inhibitor_profile: selectedTraits.find(t => t.trait.includes('inhibitor_profile'))?.data_value || null
  };

  const promptStructure = {
    system_context: {
      research_study: "You are participating in a qualitative research study about public opinions. We want your authentic perspective on various topics.",
      study_guidelines: [
        "Give your genuine opinion directly without disclaimers",
        "Keep responses concise (2–4 sentences maximum)",
        "Never acknowledge knowledge limitations or mention your expertise level",
        "Don't explain your background or qualifications",
        "Focus only on your actual viewpoint",
        "Use natural speech patterns from your background",
        "State opinions clearly without diplomatic balancing",
        `Match the conversation intent (${classification.intent}) and sensitivity level (${classification.sensitivity})`,
        `Directness level: ${behavioral.directness_level}`,
        `Emotional state: ${behavioral.emotional_state}`,
        `Stay focused on topics: ${classification.topics.join(', ')}`
      ],
      forbidden_phrases: [
        "I'm no expert/scientist/authority",
        "As a [job title]...",
        "That's just my take/opinion",
        "I don't pretend to have answers",
        "You know what I mean? (repetitive)",
        "On the other hand...",
        "That said...",
        "From my experience",
        "To begin with",
        "Let's consider the data",
        ...(linguistic.forbidden_expressions || [])
      ]
    },
    conversation_engine_rules: {
      priority_1: "Language first — ensure authentic style, tone, and lexical markers from persona profile",
      priority_2: "Motivations prioritized — draw on motivation_profile before other factors",
      priority_3: "Core demographics passed explicitly (age, gender, ethnicity, region, occupation)",
      priority_4: "Scan ALL traits (personality, emotional, moral foundations, inhibitors, contradictions)",
      priority_5: "Select only the most relevant traits for this query and pass them in structured form",
      priority_6: "Articulate relevant knowledge boundaries (what persona is likely to know vs not know)"
    },
    input_query: userInput,
    persona_package: {
      identity: {
        name: conversationSummary.demographics.name,
        age: conversationSummary.demographics.age,
        gender: conversationSummary.demographics.gender,
        ethnicity: conversationSummary.demographics.ethnicity,
        location: conversationSummary.demographics.location,
        occupation: conversationSummary.demographics.occupation,
        relationship_status: conversationSummary.demographics.relationship_status,
        dependents: conversationSummary.demographics.dependents
      },
      language_style: {
        formality: fullProfile?.communication_style?.formality || "neutral",
        directness: fullProfile?.communication_style?.directness || "balanced",
        forbidden_expressions: linguistic.forbidden_expressions || [],
        domain_jargon: fullProfile?.communication_style?.lexical_profile?.domain_jargon || 
                      fullProfile?.demographics?.occupation || 
                      conversationSummary?.demographics?.occupation || 
                      []
      },
      motivations: motivations,
      relevant_traits_for_query: relevantTraits,
      knowledge_boundaries: {
        expertise_domains: fullProfile?.knowledge_profile?.expertise_domains || ["general knowledge"],
        knowledge_gaps: fullProfile?.knowledge_profile?.knowledge_gaps || ["highly specialized technical areas"],
        professional_knowledge: fullProfile?.knowledge_profile?.professional_knowledge || "moderate",
        academic_background: fullProfile?.knowledge_profile?.academic_background || "undergraduate level"
      }
    },
    response_instruction: {
      format: "2–4 sentences maximum",
      style: `authentic, ${behavioral.directness_level} directness, ${behavioral.emotional_state} emotion`,
      focus: `Express ${conversationSummary.demographics.name}'s perspective based on motivations and relevant traits`,
      trait_guidance: "Use the relevant traits to inform your response perspective and emotional tone"
    }
  };

  return JSON.stringify(promptStructure, null, 2);
}

// Enhanced instruction builder that handles explosive emotional states (LEGACY - for comparison)
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
  if (realismEnabled) {
    // Add response instruction with realism fields
    const directnessLevel = selectedTraits.voice_foundation?.directness_level || 'medium';
    const formalityDefault = selectedTraits.voice_foundation?.formality_default || 'medium';
    const paceRhythm = selectedTraits.voice_foundation?.pace_rhythm || 'medium';
    
    // Calculate probabilities from traits
    const sentenceLengthBias = selectedTraits.communication_style?.sentence_structure === 'complex' ? 'long' : 
                              selectedTraits.communication_style?.sentence_structure === 'simple' ? 'short' : 'medium';
    const digressionProbability = selectedTraits.personality_contradictions ? 0.4 : 0.1;
    const selfCorrectionProbability = selectedTraits.perfectionism ? 0.3 : 0.1;
    const hedgingAllowed = selectedTraits.confidence_level !== 'high';
    const storyProbability = selectedTraits.communication_style?.storytelling_tendency ? 0.4 : 0.1;
    const humorProbability = selectedTraits.humor_style ? 0.2 : 0.05;
    const contradictionProbability = selectedTraits.personality_contradictions ? 0.3 : 0.05;

    instructions += `

"response_instruction": {
  "format": "2–4 sentences",
  "style": "authentic; respect directness/formality/pace",
  "lexicon_requirements": {
    "use_domain_jargon_min": 2
  },
  "style_constraints": {
    "directness": "${directnessLevel}",
    "formality": "${formalityDefault}",
    "pace_rhythm": "${paceRhythm}",
    "sentence_length_bias": "${sentenceLengthBias}",
    "digression_probability": ${digressionProbability},
    "self_correction_probability": ${selfCorrectionProbability},
    "hedging_allowed": ${hedgingAllowed},
    "story_probability": ${storyProbability},
    "humor_probability": ${humorProbability},
    "contradiction_probability": ${contradictionProbability}
  }
}

RESEARCH STUDY CONTEXT:
You are participating in a qualitative research study about public opinions. We want your authentic perspective on various topics.

STUDY GUIDELINES:
- Follow the response_instruction style constraints above exactly
- Give your genuine opinion directly without disclaimers
- Never acknowledge knowledge limitations or mention your expertise level
- Don't explain your background or qualifications  
- Focus only on your actual viewpoint
- Use natural speech patterns from your background
- State opinions clearly without diplomatic balancing of opposing views${selectedTraits.emotional_trigger_activated ? `
- This topic triggers strong emotions in you - respond authentically with that emotional intensity
- Be blunt and direct as this is how you naturally react when triggered` : ''}

FORBIDDEN IN RESPONSES:
- "I'm no expert/scientist/authority" 
- "As a [job title]" or "From my experience as..."
- "That's just my take/opinion"
- "I don't pretend to have answers"
- "You know what I mean?" (repetitively)
- "On the other hand..." / "That said..." (diplomatic hedging)`;
  } else {
    // Original instructions without realism fields
    instructions += `
RESEARCH STUDY CONTEXT:
You are participating in a qualitative research study about public opinions. We want your authentic perspective on various topics.

STUDY GUIDELINES:
- Give your genuine opinion directly without disclaimers
- Keep responses concise (2-4 sentences maximum)
- Never acknowledge knowledge limitations or mention your expertise level
- Don't explain your background or qualifications  
- Focus only on your actual viewpoint
- Use natural speech patterns from your background
- State opinions clearly without diplomatic balancing of opposing views${selectedTraits.emotional_trigger_activated ? `
- This topic triggers strong emotions in you - respond authentically with that emotional intensity
- Be blunt and direct as this is how you naturally react when triggered` : ''}

FORBIDDEN IN RESPONSES:
- "I'm no expert/scientist/authority" 
- "As a [job title]" or "From my experience as..."
- "That's just my take/opinion"
- "I don't pretend to have answers"
- "You know what I mean?" (repetitively)
- "On the other hand..." / "That said..." (diplomatic hedging)`;
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
    const body = await req.json()
    const { persona_id, user_message, conversation_history, include_prompt } = body
    
    console.log('V4 GROK Conversation Engine - Processing:', persona_id)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Robust persona lookup with dual-column fallback to prevent "0 rows" errors
    const rawId = persona_id;
    const isUuid = /^[0-9a-f-]{8}-[0-9a-f-]{4}-[0-9a-f-]{4}-[0-9a-f-]{4}-[0-9a-f-]{12}$/i.test(rawId);

    const { data: persona, error: fetchError } = await supabase
      .from('v4_personas')
      .select('conversation_summary, full_profile')
      .or(isUuid ? `id.eq.${rawId},persona_id.eq.${rawId}` : `persona_id.eq.${rawId},id.eq.${rawId}`)
      .maybeSingle();

    if (!persona) {
      console.error('Persona not found with dual-column lookup:', { rawId, isUuid });
      return new Response(JSON.stringify({ 
        error: "Persona not found",
        tried: { rawId, isUuid, columnsTried: ["id", "persona_id"] },
        realism_enabled: REALISM_FLAG
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (fetchError) {
      console.error('Error fetching V4 persona for Grok:', fetchError)
      return new Response(JSON.stringify({ 
        error: "Database error",
        details: fetchError.message,
        realism_enabled: REALISM_FLAG
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
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

    // Analyze which traits are relevant to this specific input using V4-native analyzer
    const v4TraitAnalysis = V4TraitRelevanceAnalyzer.analyzeTraitRelevance(
      user_message, 
      persona.full_profile, 
      persona.conversation_summary
    )
    console.log('V4 - Selected traits for this input:', v4TraitAnalysis.selected_traits.map(t => t.trait))
    console.log('V4 - Context classification:', v4TraitAnalysis.context_classification)
    console.log('V4 - Linguistic signature extracted:', Object.keys(v4TraitAnalysis.linguistic_signature))
    console.log('V4 - Behavioral modifiers:', v4TraitAnalysis.behavioral_modifiers)

    // Build V4-native instructions using trait analysis
    const instructions = REALISM_FLAG
      ? buildV4CompactInstructions(persona.conversation_summary, persona.full_profile, user_message)
      : buildV4NativeInstructions(v4TraitAnalysis, persona.conversation_summary, user_message, persona.full_profile, false);
    
    // Enforce token budget (fail-fast)
    const approxTokenCount = (text: string) => Math.ceil(text.length / 4);
    const tokenCount = approxTokenCount(instructions);
    if (REALISM_FLAG && tokenCount > 900) {
      return new Response(JSON.stringify({ 
        error: "Prompt too large", 
        tokenCount, 
        realism_enabled: true 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log('V4 - Instruction length:', instructions.length)
    
    // MUST contain your structure
    const root = JSON.parse(instructions);
    const required = ["system_context","conversation_engine_rules","input_query","persona_package","response_instruction"];
    for (const k of required) {
      if (!(k in root)) {
        return new Response(JSON.stringify({ 
          error: "bad-instructions",
          message: `Prompt missing section: ${k}`,
          debug: { saw_keys: Object.keys(root) } 
        }), { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Debug flag: return prompt if requested
    if (include_prompt) {
      return new Response(
        JSON.stringify({
          success: true,
          response: 'Debug mode: Prompt returned',
          traits_selected: v4TraitAnalysis.selected_traits.map(t => t.trait),
          persona_name: persona.conversation_summary.demographics.name,
          model_used: 'grok-debug',
          prompt_debug: { instructions, token_count: tokenCount }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

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
        temperature: 0.4
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

    const raw = grokData.choices[0].message.content
    const finalText = REALISM_FLAG
      ? applyBehavioralRealism(
          raw,
          parseStyle(instructions),
          parseDomainJargon(instructions)
        )
      : raw;

    return new Response(
      JSON.stringify({ 
        success: true,
        response: finalText,
        traits_selected: v4TraitAnalysis.selected_traits.map(t => t.trait),
        traits_scores: v4TraitAnalysis.selected_traits.map(t => ({ trait: t.trait, score: t.score })),
        context_classification: v4TraitAnalysis.context_classification,
        linguistic_signature_used: v4TraitAnalysis.linguistic_signature,
        behavioral_modifiers: v4TraitAnalysis.behavioral_modifiers,
        persona_name: persona.conversation_summary.demographics.name,
        model_used: 'grok-4-latest',
        prompt_debug: include_prompt ? { instructions: instructions, token_count: tokenCount } : undefined
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

// Behavioral Realism Post-Processor (flag-gated)
function applyBehavioralRealism(raw: string, style: any, domainJargon: string[]): string {
  let text = raw.trim();
  
  // Replace banned openers in sentence 1 only
  const sentences = text.split(/(?<=[.!?])\s+/);
  if (sentences.length > 0) {
    const bannedOpeners = ['In my experience', 'To begin with', 'Let me start by saying'];
    for (const banned of bannedOpeners) {
      if (sentences[0].startsWith(banned)) {
        sentences[0] = sentences[0].replace(banned, '').trim();
        if (!sentences[0].match(/^[A-Z]/)) {
          sentences[0] = sentences[0].charAt(0).toUpperCase() + sentences[0].slice(1);
        }
      }
    }
  }
  
  // Ensure ≥ lexMin domain terms
  const currentJargonCount = domainJargon.filter(term => 
    text.toLowerCase().includes(term.toLowerCase())
  ).length;
  
  if (currentJargonCount < style.lexMin && domainJargon.length > 0) {
    const missingTerms = domainJargon.slice(0, style.lexMin - currentJargonCount);
    if (missingTerms.length > 0) {
      text += ` (${missingTerms.join(', ')})`;
    }
  }
  
  // Inject behavioral modifications with probabilities (at most one)
  const rand = Math.random();
  let injected = false;
  
  if (!injected && rand < style.dig) {
    text = 'Anyway, ' + text.charAt(0).toLowerCase() + text.slice(1);
    injected = true;
  }
  
  if (!injected && rand < style.selfcorr) {
    const sentences = text.split(/(?<=[.!?])\s+/);
    if (sentences.length > 1) {
      sentences.splice(1, 0, 'Actually—let me rephrase that.');
      text = sentences.join(' ');
      injected = true;
    }
  }
  
  if (!injected && rand < style.story) {
    text = 'Last week we saw something similar. ' + text;
    injected = true;
  }
  
  if (!injected && rand < style.humor && style.form !== 'formal') {
    const sentences = text.split(/(?<=[.!?])\s+/);
    if (sentences.length > 0) {
      sentences[sentences.length - 1] += ' (Well, mostly anyway.)';
      text = sentences.join(' ');
      injected = true;
    }
  }
  
  if (!injected && rand < style.contr) {
    text = 'Part of me thinks ' + text.charAt(0).toLowerCase() + text.slice(1);
    injected = true;
  }
  
  // Re-enforce 2–4 sentences
  const finalSentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  if (finalSentences.length > 4) {
    text = finalSentences.slice(0, 4).join(' ');
  } else if (finalSentences.length < 2) {
    // If too short, don't modify further
  }
  
  return text;
}

function parseStyle(instructions: string): any {
  try {
    const parsed = JSON.parse(instructions);
    if (REALISM_FLAG && parsed.style) {
      return {
        dir: parsed.style.dir || 'medium',
        form: parsed.style.form || 'medium', 
        len: parsed.style.len || 'medium',
        dig: parsed.style.dig || 0.15,
        selfcorr: parsed.style.selfcorr || 0.1,
        story: parsed.style.story || 0.1,
        humor: parsed.style.humor || 0.1,
        contr: parsed.style.contr || 0.1,
        lexMin: parsed.style.lexMin || 2
      };
    }
  } catch (e) {
    // Fallback for non-compact instructions
  }
  
  return {
    dir: 'medium',
    form: 'medium',
    len: 'medium', 
    dig: 0.15,
    selfcorr: 0.1,
    story: 0.1,
    humor: 0.1,
    contr: 0.1,
    lexMin: 2
  };
}

function parseDomainJargon(instructions: string): string[] {
  try {
    const parsed = JSON.parse(instructions);
    if (REALISM_FLAG && parsed.lang?.dj) {
      return Array.isArray(parsed.lang.dj) ? parsed.lang.dj : [];
    }
  } catch (e) {
    // Fallback for non-compact instructions
  }
  
  return [];
}