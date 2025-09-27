import { V4FullProfile } from '../types/persona-v4';
import { V4TraitPath, V4TraitScore, V4TraitAnalysisResult, TurnClassification, KnowledgeBoundary } from '../types/trait-analysis';

interface TraitCategory {
  name: string;
  baseWeight: number;
  relevanceContexts: string[];
}

// Define trait categories with their importance and relevance contexts
const TRAIT_CATEGORIES: TraitCategory[] = [
  { name: "identity", baseWeight: 1.0, relevanceContexts: ["personal", "background", "demographic"] },
  { name: "daily_life", baseWeight: 0.8, relevanceContexts: ["routine", "lifestyle", "habits", "work", "time"] },
  { name: "health_profile", baseWeight: 0.7, relevanceContexts: ["health", "medical", "fitness", "wellness", "sleep"] },
  { name: "relationships", baseWeight: 0.8, relevanceContexts: ["family", "friends", "social", "romantic", "partnership"] },
  { name: "money_profile", baseWeight: 0.8, relevanceContexts: ["money", "financial", "spending", "saving", "income"] },
  { name: "motivation_profile", baseWeight: 0.9, relevanceContexts: ["goals", "motivation", "values", "purpose", "drive"] },
  { name: "communication_style", baseWeight: 0.9, relevanceContexts: ["communication", "speaking", "style", "interaction"] },
  { name: "humor_profile", baseWeight: 0.6, relevanceContexts: ["humor", "funny", "joke", "laugh", "wit"] },
  { name: "truth_honesty_profile", baseWeight: 0.9, relevanceContexts: ["honesty", "truth", "authentic", "transparent"] },
  { name: "bias_profile", baseWeight: 0.8, relevanceContexts: ["decision", "thinking", "bias", "judgment", "belief"] },
  { name: "cognitive_profile", baseWeight: 0.8, relevanceContexts: ["thinking", "reasoning", "intelligence", "problem"] },
  { name: "emotional_profile", baseWeight: 0.9, relevanceContexts: ["emotion", "feeling", "mood", "reaction", "trigger"] },
  { name: "attitude_narrative", baseWeight: 0.7, relevanceContexts: ["attitude", "perspective", "worldview", "opinion"] },
  { name: "political_narrative", baseWeight: 0.6, relevanceContexts: ["politics", "political", "government", "policy"] },
  { name: "adoption_profile", baseWeight: 0.6, relevanceContexts: ["technology", "adoption", "change", "new", "innovation"] },
  { name: "prompt_shaping", baseWeight: 0.5, relevanceContexts: ["context", "situation", "response"] }
];

// V4-NATIVE TRAIT RELEVANCE ANALYZER - REDESIGNED FOR COMPREHENSIVE SCANNING
export class V4TraitRelevanceAnalyzer {
  static analyzeTraitRelevance(
    userInput: string,
    fullProfile: V4FullProfile,
    conversationSummary: any
  ): V4TraitAnalysisResult {
    console.log('🔍 V4 Trait Analysis Starting - Dynamic Discovery Mode');
    
    // 1. Classify the user's turn
    const turnClassification = this.classifyTurn(userInput);
    console.log('📋 Turn Classification:', turnClassification);
    
    // 2. Dynamically discover ALL trait paths in the persona
    const allTraitPaths = this.discoverAllTraitPaths(fullProfile);
    console.log(`🗺️ Discovered ${allTraitPaths.length} total trait paths in persona`);
    
    // 3. Calculate relevance for ALL discovered traits
    const traitScores: V4TraitScore[] = [];
    
    allTraitPaths.forEach(traitPath => {
      const relevanceScore = this.calculateDynamicTraitRelevance(userInput, traitPath, fullProfile, turnClassification);
      const traitValue = this.getNestedValue(fullProfile, traitPath.path);
      
      if (relevanceScore > 0.2 && traitValue !== undefined && traitValue !== null) {
        traitScores.push({
          trait: traitPath.path,
          score: relevanceScore,
          relevance_reason: this.getDynamicRelevanceReason(userInput, traitPath, traitValue),
          data_value: traitValue
        });
      }
    });
    
    // 4. Sort by relevance and take top traits with diversity
    const selectedTraits = this.selectDiverseTraits(traitScores, 20);
    
    console.log(`🎯 Selected ${selectedTraits.length} relevant traits from ${allTraitPaths.length} discovered paths`);
    console.log('📊 Top trait categories:', this.getTraitCategoryDistribution(selectedTraits));
    
    // 5. Extract linguistic signature
    const linguisticSignature = this.extractLinguisticSignature(fullProfile);
    
    // 6. Calculate behavioral modifiers
    const behavioralModifiers = this.calculateBehavioralModifiers(selectedTraits, fullProfile);
    
    // 7. Calculate knowledge boundaries
    const knowledgeBoundary = this.calculateKnowledgeBoundaries(turnClassification.topics, fullProfile);
    
    return {
      selected_traits: selectedTraits,
      context_classification: turnClassification,
      linguistic_signature: linguisticSignature,
      behavioral_modifiers: behavioralModifiers,
      knowledge_boundary: knowledgeBoundary
    };
  }

  // Dynamic trait path discovery - recursively find ALL trait paths
  private static discoverAllTraitPaths(fullProfile: V4FullProfile): V4TraitPath[] {
    const discoveredPaths: V4TraitPath[] = [];
    
    const traverseObject = (obj: any, currentPath: string = '', depth: number = 0) => {
      if (depth > 5 || obj === null || obj === undefined) return; // Prevent infinite recursion
      
      if (typeof obj === 'object' && !Array.isArray(obj)) {
        // It's an object, traverse its properties
        Object.keys(obj).forEach(key => {
          const newPath = currentPath ? `${currentPath}.${key}` : key;
          traverseObject(obj[key], newPath, depth + 1);
        });
      } else {
        // It's a value (string, number, boolean, array), create a trait path
        const category = this.getTraitCategory(currentPath);
        if (category) {
          discoveredPaths.push({
            path: currentPath,
            weight: this.calculatePathWeight(currentPath, category, depth),
            contexts: this.inferTraitContexts(currentPath, obj, category)
          });
        }
      }
    };
    
    traverseObject(fullProfile);
    return discoveredPaths;
  }

  // Calculate dynamic trait relevance with enhanced scoring
  private static calculateDynamicTraitRelevance(
    userInput: string, 
    traitPath: V4TraitPath, 
    fullProfile: V4FullProfile, 
    turnClassification: TurnClassification
  ): number {
    let score = 0;
    const inputLower = userInput.toLowerCase();
    
    // 1. Context-based relevance (keyword matching)
    const contextMatches = traitPath.contexts.filter(context => 
      inputLower.includes(context.toLowerCase())
    ).length;
    
    if (contextMatches > 0) {
      score += (contextMatches / traitPath.contexts.length) * traitPath.weight * 0.4;
    }
    
    // 2. Topic-based relevance (classification topics match trait category)
    const traitCategory = this.getTraitCategory(traitPath.path);
    if (traitCategory) {
      const topicRelevance = this.calculateTopicRelevance(turnClassification.topics, traitCategory);
      score += topicRelevance * traitPath.weight * 0.3;
    }
    
    // 3. Content-based relevance (semantic similarity)
    const traitValue = this.getNestedValue(fullProfile, traitPath.path);
    if (traitValue) {
      score += this.checkContentRelevance(userInput, traitValue) * 0.2;
    }
    
    // 4. Intent-based relevance boost
    score += this.calculateIntentRelevance(turnClassification.intent, traitPath) * 0.1;
    
    return Math.min(score, 1.0);
  }

  // Helper methods for dynamic trait discovery
  private static getTraitCategory(traitPath: string): TraitCategory | null {
    const topLevelKey = traitPath.split('.')[0];
    return TRAIT_CATEGORIES.find(cat => cat.name === topLevelKey) || null;
  }

  private static calculatePathWeight(path: string, category: TraitCategory, depth: number): number {
    // Base weight from category, reduced by depth to prioritize top-level traits
    const depthPenalty = Math.pow(0.9, depth - 1);
    return category.baseWeight * depthPenalty;
  }

  private static inferTraitContexts(path: string, value: any, category: TraitCategory): string[] {
    const contexts = [...category.relevanceContexts];
    
    // Add path-specific contexts based on the trait name
    const pathParts = path.split('.');
    pathParts.forEach(part => {
      contexts.push(part.replace(/_/g, ' '));
    });
    
    // Add value-specific contexts for certain types
    if (typeof value === 'string') {
      contexts.push(...value.split(' ').slice(0, 3)); // Add first few words
    } else if (Array.isArray(value)) {
      value.slice(0, 3).forEach(item => {
        if (typeof item === 'string') contexts.push(item);
      });
    }
    
    return contexts.slice(0, 10); // Limit context size
  }

  private static calculateTopicRelevance(topics: string[], category: TraitCategory): number {
    const topicMatches = topics.filter(topic => 
      category.relevanceContexts.some(context => 
        topic.toLowerCase().includes(context.toLowerCase()) ||
        context.toLowerCase().includes(topic.toLowerCase())
      )
    ).length;
    
    return topics.length > 0 ? topicMatches / topics.length : 0;
  }

  private static calculateIntentRelevance(intent: string, traitPath: V4TraitPath): number {
    const intentTraitMap: Record<string, string[]> = {
      "opinion": ["attitude", "belief", "value", "perspective"],
      "advice": ["experience", "knowledge", "wisdom", "guidance"],
      "story": ["memory", "experience", "narrative", "background"],
      "compare": ["preference", "choice", "evaluation", "judgment"],
      "critique": ["standard", "expectation", "quality", "assessment"],
      "clarify": ["definition", "understanding", "knowledge", "explanation"]
    };
    
    const relevantTraitTypes = intentTraitMap[intent] || [];
    const pathLower = traitPath.path.toLowerCase();
    
    return relevantTraitTypes.some(type => pathLower.includes(type)) ? 0.3 : 0;
  }

  private static selectDiverseTraits(traitScores: V4TraitScore[], maxTraits: number): V4TraitScore[] {
    // Sort by score first
    const sortedTraits = traitScores.sort((a, b) => b.score - a.score);
    
    // Group by category to ensure diversity
    const categoryGroups: Record<string, V4TraitScore[]> = {};
    
    sortedTraits.forEach(trait => {
      const category = trait.trait.split('.')[0];
      if (!categoryGroups[category]) categoryGroups[category] = [];
      categoryGroups[category].push(trait);
    });
    
    // Select top traits from each category
    const selectedTraits: V4TraitScore[] = [];
    const categoriesByImportance = Object.keys(categoryGroups).sort((a, b) => {
      const catA = TRAIT_CATEGORIES.find(c => c.name === a);
      const catB = TRAIT_CATEGORIES.find(c => c.name === b);
      return (catB?.baseWeight || 0) - (catA?.baseWeight || 0);
    });
    
    let traitsPerCategory = Math.max(1, Math.floor(maxTraits / categoriesByImportance.length));
    let remainingSlots = maxTraits;
    
    categoriesByImportance.forEach(category => {
      const categoryTraits = categoryGroups[category];
      const slotsToUse = Math.min(traitsPerCategory, categoryTraits.length, remainingSlots);
      
      selectedTraits.push(...categoryTraits.slice(0, slotsToUse));
      remainingSlots -= slotsToUse;
    });
    
    // Fill remaining slots with highest scoring traits
    const allRemaining = sortedTraits.filter(trait => 
      !selectedTraits.some(selected => selected.trait === trait.trait)
    );
    selectedTraits.push(...allRemaining.slice(0, remainingSlots));
    
    return selectedTraits.slice(0, maxTraits);
  }

  private static getTraitCategoryDistribution(traits: V4TraitScore[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    traits.forEach(trait => {
      const category = trait.trait.split('.')[0];
      distribution[category] = (distribution[category] || 0) + 1;
    });
    return distribution;
  }

  private static getDynamicRelevanceReason(userInput: string, traitPath: V4TraitPath, traitValue: any): string {
    const inputLower = userInput.toLowerCase();
    const matchedContexts = traitPath.contexts.filter(context => 
      inputLower.includes(context.toLowerCase())
    );
    
    if (matchedContexts.length > 0) {
      return `Context match: ${matchedContexts.slice(0, 2).join(', ')} | Value: ${this.formatTraitValue(traitValue)}`;
    }
    
    const category = this.getTraitCategory(traitPath.path);
    return `${category?.name || 'trait'} relevance | Value: ${this.formatTraitValue(traitValue)}`;
  }

  private static formatTraitValue(value: any): string {
    if (typeof value === 'string') return value.slice(0, 50);
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value.toString();
    if (Array.isArray(value)) return `[${value.slice(0, 2).join(', ')}${value.length > 2 ? '...' : ''}]`;
    return JSON.stringify(value).slice(0, 50);
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

    // Extract topics - Enhanced topic detection
    const topics: string[] = [];
    if (input.includes('work') || input.includes('job') || input.includes('career') || input.includes('balance')) topics.push('work');
    if (input.includes('family') || input.includes('children') || input.includes('kids')) topics.push('family');
    if (input.includes('money') || input.includes('finance') || input.includes('investment')) topics.push('finance');
    if (input.includes('politic') || input.includes('government') || input.includes('policy')) topics.push('politics');
    if (input.includes('relationship') || input.includes('dating') || input.includes('marriage')) topics.push('relationships');
    if (input.includes('health') || input.includes('medical') || input.includes('wellness')) topics.push('health');
    if (input.includes('food') || input.includes('eat') || input.includes('diet')) topics.push('lifestyle');
    if (input.includes('hobby') || input.includes('fun') || input.includes('leisure')) topics.push('personal');
    if (input.includes('technology') || input.includes('tech') || input.includes('ai')) topics.push('technology');
    if (input.includes('education') || input.includes('learning') || input.includes('school')) topics.push('education');

    // Determine audience (simplified)
    const audience: TurnClassification['audience'] = 'peer'; // Default assumption

    // Assess sensitivity
    let sensitivity: TurnClassification['sensitivity'] = 'low';
    if (topics.includes('politics') || input.includes('controversial')) sensitivity = 'high';
    else if (topics.includes('family') || topics.includes('relationships')) sensitivity = 'medium';

    return { intent, topics, audience, sensitivity };
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

  private static extractLinguisticSignature(fullProfile: V4FullProfile): V4TraitAnalysisResult['linguistic_signature'] {
    const styleMarkers = fullProfile?.communication_style?.style_markers;
    const authFilters = fullProfile?.communication_style?.authenticity_filters;

    return {
      signature_phrases: styleMarkers?.metaphor_domains || [],
      forbidden_expressions: authFilters?.avoid_registers || [],
      conversation_enders: [],
      sentence_patterns: []
    };
  }

  private static calculateBehavioralModifiers(
    selectedTraits: V4TraitScore[],
    fullProfile: V4FullProfile
  ): V4TraitAnalysisResult['behavioral_modifiers'] {
    // Extract confidence adjustment from multiple sources
    const confidenceTraits = selectedTraits.filter(t => 
      t.trait.includes('confidence') || t.trait.includes('self_assurance')
    );
    const confidenceValue = confidenceTraits.length > 0 ? confidenceTraits[0].data_value : 0.5;
    
    // Extract directness level from communication style
    const directnessTraits = selectedTraits.filter(t => 
      t.trait.includes('directness') || t.trait.includes('communication_style')
    );
    const directnessLevel = directnessTraits.length > 0 ? directnessTraits[0].data_value : 'balanced';

    // Determine emotional state from triggers and current context
    const emotionalTraits = selectedTraits.filter(t => 
      t.trait.includes('emotional') || t.trait.includes('trigger') || t.trait.includes('stress')
    );
    const emotionalState = emotionalTraits.length > 0 ? 'activated' : 'neutral';

    // Extract formality from communication context
    const formalityTraits = selectedTraits.filter(t => 
      t.trait.includes('formality') || t.trait.includes('voice_foundation')
    );
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
    // Extract expertise domains from multiple sources
    const expertiseDomains = [
      fullProfile?.identity?.occupation || '',
      ...(fullProfile?.daily_life?.primary_activities ? Object.keys(fullProfile.daily_life.primary_activities) : []),
      // Extract goals as strings
      ...(fullProfile?.motivation_profile?.goal_orientation?.primary_goals || []).map(goal => 
        typeof goal === 'string' ? goal : (goal as any)?.goal || ''
      )
    ].filter(domain => domain && typeof domain === 'string' && domain.length > 0);
    
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
      'work': ['career', 'professional', 'employment', 'job', 'business', 'balance'],
      'finance': ['money', 'investment', 'financial', 'economic', 'budget', 'market'],
      'politics': ['government', 'policy', 'political', 'election', 'law', 'regulation'],
      'family': ['children', 'parenting', 'relationships', 'marriage', 'kids'],
      'relationships': ['dating', 'friendship', 'social', 'interpersonal'],
      'technology': ['tech', 'software', 'digital', 'computer', 'programming', 'AI'],
      'health': ['medical', 'wellness', 'fitness', 'healthcare', 'mental health'],
      'education': ['learning', 'school', 'academic', 'study', 'training'],
      'lifestyle': ['habits', 'routine', 'personal', 'daily', 'preferences'],
      'personal': ['individual', 'private', 'personality', 'character']
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
      'healthcare': ['medical', 'medicine', 'health', 'clinical', 'patient care', 'hospital', 'radiology'],
      'technology': ['tech', 'software', 'programming', 'digital', 'IT', 'computers'],
      'finance': ['banking', 'investment', 'trading', 'financial planning', 'economics'],
      'law': ['legal', 'attorney', 'court', 'litigation', 'contracts'],
      'education': ['teaching', 'academic', 'curriculum', 'learning', 'training'],
      'management': ['leadership', 'operations', 'administration', 'supervision'],
      'operations': ['management', 'workflow', 'efficiency', 'processes']
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