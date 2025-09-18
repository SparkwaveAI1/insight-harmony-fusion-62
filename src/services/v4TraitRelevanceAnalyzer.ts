import { V4FullProfile } from '../types/persona-v4';
import { V4TraitPath, V4TraitScore, V4TraitAnalysisResult, TurnClassification, KnowledgeBoundary } from '../types/trait-analysis';

// V4-NATIVE TRAIT RELEVANCE ANALYZER
export class V4TraitRelevanceAnalyzer {
  private static readonly V4_TRAIT_PATHS: V4TraitPath[] = [
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
    { path: 'communication_style.linguistic_signature.signature_phrases', weight: 1.0, contexts: ['all'] },
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

  static analyzeTraitRelevance(
    userInput: string,
    fullProfile: V4FullProfile,
    conversationSummary: any
  ): V4TraitAnalysisResult {
    const input = userInput.toLowerCase();
    const selectedTraits: V4TraitScore[] = [];

    // 1. CLASSIFY THE TURN
    const classification = this.classifyTurn(userInput);

    // 2. ANALYZE TRAIT RELEVANCE
    for (const traitPath of this.V4_TRAIT_PATHS) {
      const score = this.calculateTraitRelevance(input, traitPath, fullProfile);
      if (score > 0.3) { // Relevance threshold
        const traitValue = this.getNestedValue(fullProfile, traitPath.path);
        if (traitValue !== undefined) {
          selectedTraits.push({
            trait: traitPath.path,
            score: score,
            relevance_reason: this.getRelevanceReason(input, traitPath),
            data_value: traitValue
          });
        }
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

  private static classifyTurn(userInput: string): TurnClassification {
    const input = userInput.toLowerCase();

    // Classify intent
    let intent: TurnClassification['intent'] = 'clarify';
    if (input.includes('what do you think') || input.includes('opinion')) intent = 'opinion';
    else if (input.includes('how to') || input.includes('advice') || input.includes('should i')) intent = 'advice';
    else if (input.includes('tell me about') || input.includes('experience')) intent = 'story';
    else if (input.includes('vs') || input.includes('compare') || input.includes('better')) intent = 'compare';
    else if (input.includes('wrong') || input.includes('bad') || input.includes('critique')) intent = 'critique';

    // Extract topics
    const topics: string[] = [];
    if (input.includes('work') || input.includes('job') || input.includes('career')) topics.push('work');
    if (input.includes('family') || input.includes('children') || input.includes('kids')) topics.push('family');
    if (input.includes('money') || input.includes('finance') || input.includes('investment')) topics.push('finance');
    if (input.includes('politic') || input.includes('government') || input.includes('policy')) topics.push('politics');
    if (input.includes('relationship') || input.includes('dating') || input.includes('marriage')) topics.push('relationships');

    // Determine audience (simplified)
    const audience: TurnClassification['audience'] = 'peer'; // Default assumption

    // Assess sensitivity
    let sensitivity: TurnClassification['sensitivity'] = 'low';
    if (topics.includes('politics') || input.includes('controversial')) sensitivity = 'high';
    else if (topics.includes('family') || topics.includes('relationships')) sensitivity = 'medium';

    return { intent, topics, audience, sensitivity };
  }

  private static calculateTraitRelevance(
    userInput: string,
    traitPath: V4TraitPath,
    fullProfile: V4FullProfile
  ): number {
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

  private static checkContentRelevance(userInput: string, traitValue: any): number {
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

  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  private static getRelevanceReason(userInput: string, traitPath: V4TraitPath): string {
    const matchedContexts = traitPath.contexts.filter(context => 
      context === 'all' || userInput.toLowerCase().includes(context)
    );
    
    if (matchedContexts.length > 0) {
      return `Matched contexts: ${matchedContexts.join(', ')}`;
    }
    
    return 'Content similarity detected';
  }

  private static extractLinguisticSignature(fullProfile: V4FullProfile): V4TraitAnalysisResult['linguistic_signature'] {
    const styleMarkers = fullProfile?.communication_style?.style_markers;
    const authFilters = fullProfile?.communication_style?.authenticity_filters;

    return {
      signature_phrases: styleMarkers?.metaphor_domains || [],
      forbidden_expressions: authFilters?.avoid_registers || [],
      typical_openers: [],
      conversation_enders: [],
      sentence_patterns: []
    };
  }

  private static calculateBehavioralModifiers(
    selectedTraits: V4TraitScore[],
    fullProfile: V4FullProfile
  ): V4TraitAnalysisResult['behavioral_modifiers'] {
    // Extract confidence adjustment
    const confidenceTraits = selectedTraits.filter(t => t.trait.includes('confidence_level'));
    const confidenceValue = confidenceTraits.length > 0 ? confidenceTraits[0].data_value : 0.5;
    
    // Extract directness level
    const directnessTraits = selectedTraits.filter(t => t.trait.includes('directness_level'));
    const directnessLevel = directnessTraits.length > 0 ? directnessTraits[0].data_value : 'balanced';

    // Determine emotional state from triggers
    const emotionalTraits = selectedTraits.filter(t => 
      t.trait.includes('emotional_profile') || t.trait.includes('explosive_triggers')
    );
    const emotionalState = emotionalTraits.length > 0 ? 'activated' : 'neutral';

    // Extract formality
    const formalityTraits = selectedTraits.filter(t => t.trait.includes('formality_default'));
    const formalityShift = formalityTraits.length > 0 ? formalityTraits[0].data_value : 'neutral';

    return {
      confidence_adjustment: typeof confidenceValue === 'number' ? confidenceValue : 0.5,
      directness_level: typeof directnessLevel === 'string' ? directnessLevel : 'balanced',
      emotional_state: emotionalState,
      formality_shift: typeof formalityShift === 'string' ? formalityShift : 'neutral'
    };
  }

  private static calculateKnowledgeBoundaries(
    userTopics: string[],
    fullProfile: V4FullProfile
  ): KnowledgeBoundary {
    // Extract expertise domains from the persona
    const expertiseDomains = [fullProfile?.identity?.occupation || ''];
    
    // Expand topic keywords for better matching
    const expandedTopics = this.expandTopics(userTopics);
    const expandedExpertise = this.expandExpertiseDomains(expertiseDomains);
    
    // Calculate overlap score
    const overlapScore = this.calculateTopicExpertiseOverlap(expandedTopics, expandedExpertise);
    
    // Determine confidence level
    let confidenceLevel: 'high' | 'medium' | 'low';
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

  private static expandTopics(topics: string[]): string[] {
    const topicExpansions: Record<string, string[]> = {
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

  private static expandExpertiseDomains(domains: string[]): string[] {
    const domainExpansions: Record<string, string[]> = {
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

    const expanded = new Set<string>();
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

  private static calculateTopicExpertiseOverlap(topics: string[], expertise: string[]): number {
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

  private static calculateStringSimilarity(str1: string, str2: string): number {
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

  private static generateKnowledgeGuidance(
    confidence: 'high' | 'medium' | 'low',
    topics: string[],
    expertise: string[]
  ): string {
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