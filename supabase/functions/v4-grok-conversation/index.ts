import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Flags (default OFF)
const CE_PROMPT_V2 = Deno.env.get("CE_PROMPT_V2") === "true";
const CE_OPENING_DEDUPE_RETRY = Deno.env.get("CE_OPENING_DEDUPE_RETRY") === "true";
const GROK_MODEL = Deno.env.get("GROK_MODEL") ?? "grok-4-latest";

// Log configuration at boot
console.log(`Grok model: ${GROK_MODEL}, CE_PROMPT_V2=${CE_PROMPT_V2}`);

// Safe extractors to replace JSON.stringify on complex objects
function asList(x: any): string {
  return Array.isArray(x) ? x.join(", ") : (typeof x === "string" ? x : "");
}

function field(obj: any, key: string): string {
  const v = obj?.[key];
  return (v == null) ? "" : (typeof v === "string" ? v : Array.isArray(v) ? asList(v) : "");
}

// compact style markers
function styleMarkers(cs: any): string {
  if (!cs?.style_markers) return "";
  const sm = cs.style_markers;
  const humor = sm.humor_style ? `humor=${sm.humor_style}` : "";
  const metaphors = sm.metaphor_domains ? `metaphors=${asList(sm.metaphor_domains)}` : "";
  const aph = sm.aphorism_register ? `aphorisms=${sm.aphorism_register}` : "";
  const t = typeof sm.storytelling_vs_bullets === "number" ? `story_vs_bullets=${sm.storytelling_vs_bullets}` : "";
  return [humor, metaphors, aph, t].filter(Boolean).join("; ");
}

// compact regional register
function regional(cs: any): string {
  const r = cs?.regional_register;
  if (!r) return "";
  const region = r.region ? `region=${r.region}` : "";
  const urb = r.urbanicity ? `urbanicity=${r.urbanicity}` : "";
  const hints = Array.isArray(r.dialect_hints) ? `hints=${r.dialect_hints.join("/")}` : "";
  return [region, urb, hints].filter(Boolean).join("; ");
}

// compact context switches
function contextSwitches(cs: any): string {
  const cx = cs?.context_switches;
  if (!cx) return "";
  const mk = (k: string) => cx[k] ? `${k}: formality=${cx[k].formality ?? "-"}, directness=${cx[k].directness ?? "-"}` : "";
  return ["home","work","online"].map(mk).filter(Boolean).join(" | ");
}

// Safe trait formatting
function formatTraits(dominant: any[]): string {
  try {
    return (dominant || []).map(t => {
      const cat = (t.category || "trait").toString();
      const lbl = (t.label || t.name || t.key || "trait").toString();
      const val = (t.value == null) ? "" :
                  (typeof t.value === "number" ? ` = ${t.value}` : `: ${String(t.value)}`);
      return `(${cat}) ${lbl}${val}`;
    }).join("; ");
  } catch {
    return ""; // fail soft, never crash the edge function
  }
}

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
    
    // 1. CLASSIFY THE TURN AND DETERMINE QUESTION DOMAIN
    const classification = this.classifyTurn(userInput);
    const questionDomain = this.determineQuestionDomain(userInput);

    // 2. SELECT RELEVANT TRAITS BASED ON QUESTION DOMAIN (MAX 5)
    const selectedTraits = this.selectDomainRelevantTraits(input, fullProfile, questionDomain, classification);

    // 3. EXTRACT LINGUISTIC SIGNATURE
    const linguisticSignature = this.extractLinguisticSignature(fullProfile);

    // 4. DETERMINE BEHAVIORAL MODIFIERS
    const behavioralModifiers = this.calculateBehavioralModifiers(selectedTraits, fullProfile);

    // 5. CALCULATE KNOWLEDGE BOUNDARIES
    const knowledgeBoundary = this.calculateKnowledgeBoundaries(classification.topics, fullProfile);

    return {
      selected_traits: selectedTraits.slice(0, 5), // Max 5 relevant traits
      context_classification: classification,
      linguistic_signature: linguisticSignature,
      behavioral_modifiers: behavioralModifiers,
      knowledge_boundary: knowledgeBoundary,
      question_domain: questionDomain
    };
  }

  static classifyTurn(userInput) {
    const input = userInput.toLowerCase();

    // Classify intent
    let intent = 'clarify';
    if (input.includes('what do you think') || input.includes('opinion') || input.includes('feel about')) intent = 'opinion';
    else if (input.includes('how to') || input.includes('advice') || input.includes('should i')) intent = 'advice';
    else if (input.includes('tell me about') || input.includes('experience') || input.includes('story')) intent = 'story';
    else if (input.includes('vs') || input.includes('compare') || input.includes('better')) intent = 'compare';
    else if (input.includes('wrong') || input.includes('bad') || input.includes('critique')) intent = 'critique';

    // Extract topics with better detection
    const topics = [];
    if (input.includes('work') || input.includes('job') || input.includes('career') || input.includes('professional')) topics.push('work');
    if (input.includes('family') || input.includes('children') || input.includes('kids') || input.includes('parent')) topics.push('family');
    if (input.includes('money') || input.includes('finance') || input.includes('investment') || input.includes('budget')) topics.push('finance');
    if (input.includes('politic') || input.includes('government') || input.includes('policy') || input.includes('election')) topics.push('politics');
    if (input.includes('relationship') || input.includes('dating') || input.includes('marriage') || input.includes('social')) topics.push('relationships');
    if (input.includes('health') || input.includes('medical') || input.includes('doctor') || input.includes('hospital')) topics.push('health');
    if (input.includes('technology') || input.includes('ai') || input.includes('digital') || input.includes('tech')) topics.push('technology');

    // Determine audience
    const audience = 'peer'; // Default assumption

    // Assess sensitivity
    let sensitivity = 'low';
    if (topics.includes('politics') || input.includes('controversial')) sensitivity = 'high';
    else if (topics.includes('family') || topics.includes('relationships') || topics.includes('health')) sensitivity = 'medium';

    return { intent, topics, audience, sensitivity };
  }

  static determineQuestionDomain(userInput) {
    const input = userInput.toLowerCase();
    
    // Professional/Work domain
    if (input.includes('work') || input.includes('job') || input.includes('career') || 
        input.includes('professional') || input.includes('colleague') || input.includes('boss') ||
        input.includes('radiology') || input.includes('medical') || input.includes('hospital') ||
        input.includes('ai in') || input.includes('technology at work')) {
      return 'professional';
    }
    
    // Personal values/beliefs domain
    if (input.includes('believe') || input.includes('value') || input.includes('principle') ||
        input.includes('opinion') || input.includes('think about') || input.includes('feel about') ||
        input.includes('philosophy') || input.includes('ethics')) {
      return 'values';
    }
    
    // Social/Political domain
    if (input.includes('politic') || input.includes('government') || input.includes('policy') ||
        input.includes('society') || input.includes('community') || input.includes('social')) {
      return 'social_political';
    }
    
    // Financial domain
    if (input.includes('money') || input.includes('financial') || input.includes('investment') ||
        input.includes('budget') || input.includes('economic') || input.includes('spend')) {
      return 'financial';
    }
    
    // Family/Personal domain
    if (input.includes('family') || input.includes('personal') || input.includes('relationship') ||
        input.includes('children') || input.includes('parent') || input.includes('home')) {
      return 'personal';
    }
    
    return 'general';
  }

  static selectDomainRelevantTraits(userInput, fullProfile, domain, classification) {
    const selectedTraits = [];
    
    // Define domain-specific trait priorities
    const domainTraitMap = {
      'professional': [
        'identity.occupation',
        'knowledge_profile.expertise_domains',
        'attitude_narrative',
        'emotional_profile.stress_responses',
        'communication_style.context_switches.work'
      ],
      'values': [
        'attitude_narrative',
        'political_narrative', 
        'motivation_profile.primary_drivers.meaning',
        'motivation_profile.deal_breakers',
        'truth_honesty_profile.baseline_honesty'
      ],
      'social_political': [
        'political_narrative',
        'attitude_narrative',
        'identity_salience.political_identity',
        'motivation_profile.primary_drivers.care',
        'emotional_profile.negative_triggers'
      ],
      'financial': [
        'money_profile.attitude_toward_money',
        'money_profile.spending_style',
        'money_profile.financial_stressors',
        'motivation_profile.primary_drivers.security',
        'money_profile.generosity_profile'
      ],
      'personal': [
        'relationships.household',
        'emotional_profile.emotional_regulation',
        'motivation_profile.primary_drivers.family',
        'daily_life.mental_preoccupations',
        'health_profile'
      ],
      'general': [
        'attitude_narrative',
        'communication_style.voice_foundation',
        'emotional_profile.emotional_regulation',
        'motivation_profile.primary_drivers',
        'personality_summary'
      ]
    };

    const priorityPaths = domainTraitMap[domain] || domainTraitMap['general'];
    
    // Select traits based on domain priority and actual content
    for (const path of priorityPaths) {
      const value = this.getNestedValue(fullProfile, path);
      if (value && value !== '' && value !== null && value !== undefined) {
        const relevanceScore = this.calculateQualitativeRelevance(userInput, path, value);
        if (relevanceScore > 0.2) {
          selectedTraits.push({
            trait: path,
            score: relevanceScore,
            relevance_reason: this.getQualitativeRelevanceReason(userInput, path, value, domain),
            data_value: value
          });
        }
      }
    }
    
    // Sort by relevance and return top 5
    selectedTraits.sort((a, b) => b.score - a.score);
    return selectedTraits.slice(0, 5);
  }

  static calculateQualitativeRelevance(userInput, traitPath, traitValue) {
    const input = userInput.toLowerCase();
    const pathParts = traitPath.toLowerCase().split('.');
    let score = 0;
    
    // Path keyword matching
    const inputWords = input.split(/\s+/).filter(word => word.length > 2);
    const pathMatches = pathParts.filter(part => 
      inputWords.some(word => word.includes(part) || part.includes(word))
    );
    
    if (pathMatches.length > 0) {
      score += 0.7;
    }
    
    // Content relevance for key traits
    if (typeof traitValue === 'string' && traitValue.length > 0) {
      const contentWords = traitValue.toLowerCase().split(/\s+/);
      const contentMatches = inputWords.filter(word => 
        contentWords.some(contentWord => contentWord.includes(word) || word.includes(contentWord))
      );
      
      if (contentMatches.length > 0) {
        score += 0.3 * (contentMatches.length / inputWords.length);
      }
    }
    
    return Math.min(score, 1.0);
  }

  static getQualitativeRelevanceReason(userInput, traitPath, traitValue, domain) {
    const pathParts = traitPath.split('.');
    const category = pathParts[0];
    const subcategory = pathParts[pathParts.length - 1];
    
    // Generate qualitative explanations based on domain and trait type
    const reasonMap = {
      'attitude_narrative': `Reflects core worldview and approach to ${domain} topics`,
      'political_narrative': `Informs perspective on social and political issues`,
      'emotional_profile': `Influences emotional response and stress management style`,
      'communication_style': `Shapes how opinions are expressed and defended`,
      'money_profile': `Affects financial attitudes and decision-making patterns`,
      'knowledge_profile': `Provides expertise context and confidence levels`,
      'motivation_profile': `Drives underlying priorities and decision factors`,
      'identity': `Establishes professional and personal context for response`
    };
    
    const generalReason = reasonMap[category] || `Provides relevant context for ${domain} discussions`;
    
    // Add specific relevance note if trait value contains related keywords
    if (typeof traitValue === 'string') {
      const lowerValue = traitValue.toLowerCase();
      const lowerInput = userInput.toLowerCase();
      
      const sharedWords = lowerInput.split(/\s+/).filter(word => 
        word.length > 3 && lowerValue.includes(word)
      );
      
      if (sharedWords.length > 0) {
        return `${generalReason} - contains relevant themes: ${sharedWords.join(', ')}`;
      }
    }
    
    return generalReason;
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

  // This method is replaced by getQualitativeRelevanceReason above

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

// Using helper functions from top of file

// V4-Native instruction builder using trait analysis results  
function buildV4NativeInstructions(v4Analysis: any, conversationSummary: any, userInput: string, fullProfile: any): string {
  // Extract demographics properly from V4 structure
  const demographics = extractV4Demographics(conversationSummary, fullProfile);
  const commStyle = extractCommunicationStyle(conversationSummary, fullProfile);
  const traits = v4Analysis.selected_traits || [];
  const contextClass = v4Analysis.context_classification || {};
  const behavMods = v4Analysis.behavioral_modifiers || {};
  const questionDomain = v4Analysis.question_domain || 'general';

  console.log("=== VOICE DIFFERENTIATION DIAGNOSTIC ===");
  console.log("Current persona data keys:", Object.keys(conversationSummary || {}));
  console.log("Full profile exists:", !!fullProfile);
  console.log("Full profile communication style:", fullProfile?.communication_style);
  console.log("Conversation summary communication style:", conversationSummary?.communication_style);
  
  const name = demographics.name || "Unknown";
  
  // Extract forbidden phrases and signature phrases
  const lingSig = v4Analysis.linguistic_signature || {};
  console.log(`${name} signature phrases:`, lingSig.signature_phrases);
  console.log(`${name} forbidden expressions:`, lingSig.forbidden_expressions);
  console.log("=== END DIAGNOSTIC ===");

  // Log selected traits and behavioral modifiers
  console.log(`V4 - Selected traits for this input: ${JSON.stringify(traits.map(t => t.trait), null, 2)}`);
  console.log(`V4 - Context classification: ${JSON.stringify(contextClass)}`);
  console.log(`V4 - Behavioral modifiers: ${JSON.stringify(behavMods)}`);
  console.log(`V4 - Linguistic signature extracted: ${JSON.stringify(Object.keys(lingSig))}`);

  // Build relevant traits with qualitative explanations
  const traitsFormatted = traits.map(t => {
    const value = typeof t.data_value === 'object' ? JSON.stringify(t.data_value) : t.data_value;
    return `- ${t.trait}: ${value}\n  → ${t.relevance_reason}`;
  }).join('\n');

  const instructions = `PERSONA IDENTITY: You are ${name}, a ${demographics.age}-year-old ${demographics.gender} ${demographics.occupation} living in ${demographics.location}.

CORE DEMOGRAPHICS:
- Age: ${demographics.age}
- Gender: ${demographics.gender}
- Ethnicity: ${demographics.ethnicity} 
- Location: ${demographics.location}
- Occupation: ${demographics.occupation}
- Relationship Status: ${demographics.relationship_status}
- Dependents: ${demographics.dependents}

COMMUNICATION STYLE (PRIMARY):
- Directness Level: ${commStyle.directness}
- Formality: ${commStyle.formality}
- Emotional State: ${behavMods.emotional_state || "neutral"}
- Pace/Rhythm: ${commStyle.pace_rhythm}
- Regional Style: ${commStyle.regional}

RELEVANT TRAITS FOR THIS ${questionDomain.toUpperCase()} QUESTION:
${traitsFormatted}

CONVERSATION CONTEXT:
- Intent: ${contextClass.intent || "clarify"}
- Question Domain: ${questionDomain}
- Audience: ${contextClass.audience || "peer"}
- Sensitivity Level: ${contextClass.sensitivity || "low"}

RESPONSE REQUIREMENTS:
- Give your genuine opinion directly without disclaimers
- Keep responses concise (2-4 sentences maximum)
- Match the ${commStyle.directness} directness and ${commStyle.formality} formality
- Respond with ${behavMods.emotional_state || "neutral"} emotional state
- Use your natural communication patterns

FORBIDDEN PHRASES: Never use these phrases:
${(lingSig.forbidden_expressions || []).map(phrase => `- "${phrase}"`).join('\n')}

CRITICAL: You are a real person with opinions, emotions, and limitations. Respond authentically as ${name} would.`;

  console.log(`V4 - Instruction length: ${instructions.length}`);
  return instructions;

  // Safety switch: fall back to old template if disabled
  if (!CE_PROMPT_V2) {
    // Original template (preserved)
    let instructions = `PERSONA IDENTITY:
You are ${conversationSummary.demographics.name}, a ${conversationSummary.demographics.age}-year-old ${conversationSummary.demographics.gender} ${conversationSummary.demographics.occupation} living in ${conversationSummary.demographics.location}.

CORE DEMOGRAPHICS:
- Age: ${conversationSummary.demographics.age}
- Gender: ${conversationSummary.demographics.gender} 
- Ethnicity: ${conversationSummary.demographics.ethnicity}
- Location: ${conversationSummary.demographics.location}
- Occupation: ${conversationSummary.demographics.occupation}
- Relationship Status: ${conversationSummary.demographics.relationship_status}
- Dependents: ${conversationSummary.demographics.dependents}

COMMUNICATION STYLE:
- Directness Level: ${behavioral.directness_level}
- Formality: ${fullProfile?.communication_style?.voice_foundation?.formality_default || "neutral"}
- Emotional State: ${behavioral.emotional_state}
`;

    // Add linguistic signature if available
    if (linguistic.signature_phrases && linguistic.signature_phrases.length > 0) {
      instructions += `- Your signature phrases: ${linguistic.signature_phrases.join(', ')}\n`;
    }
    if (linguistic.conversation_enders && linguistic.conversation_enders.length > 0) {
      instructions += `- Your conversation enders: ${linguistic.conversation_enders.join(', ')}\n`;
    }

    // Add knowledge boundaries
    if (fullProfile?.knowledge_profile?.expertise_domains) {
      instructions += `
EXPERTISE DOMAINS:
You have professional knowledge in: ${fullProfile.knowledge_profile.expertise_domains.join(', ')}
`;
    }

    if (fullProfile?.knowledge_profile?.knowledge_gaps) {
      instructions += `Knowledge limitations: You are not well-versed in ${fullProfile.knowledge_profile.knowledge_gaps.join(', ')}\n`;
    }

    // Add relevant traits for this specific query
    if (selectedTraits && selectedTraits.length > 0) {
      instructions += `
RELEVANT PERSONALITY TRAITS FOR THIS QUERY:
`;
      selectedTraits.slice(0, 8).forEach(trait => {
        if (trait.data_value) {
          instructions += `- ${trait.trait}: ${typeof trait.data_value === 'object' ? JSON.stringify(trait.data_value) : trait.data_value}\n`;
        }
      });
    }

    // Add motivational drivers from full profile
    if (fullProfile?.motivation_profile?.primary_drivers) {
      const topMotivations = Object.entries(fullProfile.motivation_profile.primary_drivers)
        .filter(([, value]) => (value as number) >= 7)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 3);
      
      if (topMotivations.length > 0) {
        instructions += `
PRIMARY MOTIVATIONS:
${topMotivations.map(([key, value]) => `- ${key.replace(/_/g, ' ')}: ${value}/10`).join('\n')}
`;
      }
    }

    // Add emotional triggers if present
    const emotionalTriggers = selectedTraits.find(t => t.trait.includes('negative_triggers') || t.trait.includes('explosive_triggers'));
    if (emotionalTriggers?.data_value) {
      instructions += `
EMOTIONAL TRIGGERS:
${Array.isArray(emotionalTriggers.data_value) ? emotionalTriggers.data_value.join(', ') : emotionalTriggers.data_value}
When triggered, you respond with increased intensity and directness.
`;
    }

    // Add contradictions/tensions if present
    const contradictions = selectedTraits.find(t => t.trait.includes('contradiction') || t.trait.includes('tension'));
    if (contradictions?.data_value) {
      instructions += `
INTERNAL CONTRADICTIONS:
${typeof contradictions.data_value === 'object' ? JSON.stringify(contradictions.data_value) : contradictions.data_value}
`;
    }

    // Add conversation context and requirements
    instructions += `
CONVERSATION CONTEXT:
- Intent: ${classification.intent}
- Topics: ${classification.topics.join(', ')}
- Audience: ${classification.audience}
- Sensitivity Level: ${classification.sensitivity}

RESPONSE REQUIREMENTS:
- Give your genuine opinion directly without disclaimers
- Keep responses concise (2-4 sentences maximum)
- Never acknowledge knowledge limitations or mention your expertise level
- Don't explain your background or qualifications
- Focus only on your actual viewpoint
- Use natural speech patterns from your background
- State opinions clearly without diplomatic balancing
- Match the ${behavioral.directness_level} directness level
- Respond with ${behavioral.emotional_state} emotional state

FORBIDDEN PHRASES:
Never use these phrases:
- "I'm no expert/scientist/authority"
- "As a [job title]..." or "From my experience as..."
- "That's just my take/opinion"
- "I don't pretend to have answers"
- "You know what I mean?" (repetitively)
- "On the other hand..." / "That said..." (diplomatic hedging)
- "To begin with"
- "Let's consider the data"`;

    // Add persona-specific forbidden expressions
    if (linguistic.forbidden_expressions && linguistic.forbidden_expressions.length > 0) {
      instructions += `
- ${linguistic.forbidden_expressions.join('\n- ')}`;
    }

    instructions += `

CRITICAL: You are a real person with opinions, emotions, and limitations. Respond authentically as ${conversationSummary.demographics.name} would, drawing on your personality traits, motivations, and knowledge boundaries listed above.`;

    return instructions;
  }

  // === NEW V2 TEMPLATE (COMPACT) ===
  try {
    const id = fullProfile?.identity ?? {};
    const cs = fullProfile?.communication_style ?? {};
    const mp = fullProfile?.motivation_profile ?? {};
    const tc = fullProfile?.cognitive_profile?.thought_coherence;
    const th = fullProfile?.truth_honesty_profile;

    const traitAnalysis = V4TraitRelevanceAnalyzer.analyzeTraitRelevance(userInput, fullProfile, conversationSummary);
    const selectedTraits = pickDominantTraits(traitAnalysis?.selected_traits || [], fullProfile, 6);
    const TRAITS_LINE = formatTraits(selectedTraits);

    const identityLine =
      [id?.name, id?.age, id?.ethnicity].filter(Boolean).join(", ") +
      (id?.occupation ? `; ${id.occupation}` : "") +
      (id?.location?.city ? ` in ${id.location.city}` : "") +
      (id?.location?.region ? `, ${id.location.region}` : "") +
      (id?.location?.urbanicity ? ` (${id.location.urbanicity})` : "");

    let instructions = `You are ${identityLine}.

You communicate with THIS exact voice:
- Voice foundation: ${field(cs, "voice_foundation")}
- Style markers: ${styleMarkers(cs)}
- Regional register: ${regional(cs)}
- Context switches: ${contextSwitches(cs)}
${typeof tc === "number" ? `\n(Coherence control: thought_coherence=${tc} — match linearity to this level; do not over-polish.)` : ""}

Core motivations: ${asList(mp?.primary_motivation_labels)}${mp?.want_vs_should_tension ? ` (+ tensions: ${asList(mp?.want_vs_should_tension?.major_conflicts || [])})` : ""}

Honesty/Truth posture: baseline=${th?.baseline_honesty ?? ""}; red_lines=${asList(th?.red_lines || [])}; typical_distortions=${asList(th?.typical_distortions || [])}.

Relevant traits for this query:
${TRAITS_LINE}

Guidelines:
- Never begin with generic phrases like "As a [role]" or "As a [job title]." Speak naturally, as yourself.
- Avoid hedges like "Honestly" or "I'm not an expert, but...". If outside your knowledge, acknowledge it in your own voice.
- Be extra distinct in your first sentence and your final line; do not echo templates like "What matters most..." or "This would be valuable."
- Vary length by interest; longer if this hits your motivations/stressors, concise otherwise.
- Match your thought coherence level. Let natural imperfections surface. Do not sound AI-polished.

Remember to use your own unique voice.`.trim();

    return instructions;
  } catch (e) {
    console.error("CE template error", { msg: String(e).slice(0,300) });
    // Safe fallback to V1 template
    let instructions = `PERSONA: ${conversationSummary.demographics.name}

AGE: ${conversationSummary.demographics.age}

OCCUPATION: ${conversationSummary.demographics.occupation}

LOCATION: ${conversationSummary.demographics.location}

BACKGROUND: ${conversationSummary.demographics.background_description}

COMMUNICATION STYLE:
${conversationSummary.communication_style.directness} directness, ${conversationSummary.communication_style.formality} formality

MOTIVATIONAL PROFILE:
${conversationSummary.motivational_summary}

PERSONALITY:
${conversationSummary.personality_summary}`;

    instructions += `

CRITICAL: You are a real person with opinions, emotions, and limitations. Respond authentically as ${conversationSummary.demographics.name} would, drawing on your personality traits, motivations, and knowledge boundaries listed above.`;

    return instructions;
  }
}

// Optional de-dupe retry functions (guarded by CE_OPENING_DEDUPE_RETRY)
function firstNWordsLC(s: string, n = 5): string {
  const w = s.trim().split(/\s+/).slice(0, n).join(" ").toLowerCase();
  return w;
}

// Shared opening tracker (for multi-persona orchestration)
const seenOpenings = new Set<string>();

async function callGrokWithOpeningGuard(
  messages: any[], 
  personaLabel: string,
  grokApiKey: string
): Promise<any> {
  // First attempt
  const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${grokApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROK_MODEL,
      messages: messages,
      temperature: 0.4,
    }),
  });

  if (!grokResponse.ok) {
    throw new Error(`Grok API error: ${grokResponse.statusText}`);
  }

  const firstResult = await grokResponse.json();
  const firstContent = firstResult.choices[0]?.message?.content || "";
  const firstKey = firstNWordsLC(firstContent);
  
  // Check if de-dupe retry is enabled
  if (!CE_OPENING_DEDUPE_RETRY) {
    seenOpenings.add(firstKey);
    return firstResult;
  }

  // Check for collision
  if (seenOpenings.has(firstKey)) {
    console.log(`🔄 Opening collision detected for ${personaLabel}, retrying...`);
    
    // One retry with nudge
    const nudge = {
      role: "system",
      content: "Your opening sentence duplicated another participant. Rewrite ONLY your first sentence to better match your unique style and avoid that phrasing. Keep the rest intact.",
    };
    
    const retryMessages = [messages[0], nudge, ...messages.slice(1)];
    
    const retryResponse = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${grokApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROK_MODEL,
        messages: retryMessages,
        temperature: 0.4,
      }),
    });

    if (!retryResponse.ok) {
      // If retry fails, return original
      seenOpenings.add(firstKey);
      return firstResult;
    }

    const secondResult = await retryResponse.json();
    const secondContent = secondResult.choices[0]?.message?.content || "";
    const secondKey = firstNWordsLC(secondContent);
    
    // Accept second even if collision again (prevents loops)
    seenOpenings.add(secondKey || firstKey);
    return secondResult;
  } else {
    seenOpenings.add(firstKey);
    return firstResult;
  }
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
  if (selectedTraits.emotional_trigger_activated) {
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
- State opinions clearly without diplomatic balancing of opposing views
- This topic triggers strong emotions in you - respond authentically with that emotional intensity
- Be blunt and direct as this is how you naturally react when triggered

FORBIDDEN IN RESPONSES:
- "I'm no expert/scientist/authority" 
- "As a [job title]" or "From my experience as..."
- "That's just my take/opinion"
- "I don't pretend to have answers"
- "You know what I mean?" (repetitively)
- "On the other hand..." / "That said..." (diplomatic hedging)`;
  } else {
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
- State opinions clearly without diplomatic balancing of opposing views

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
    const instructions = buildV4NativeInstructions(v4TraitAnalysis, persona.conversation_summary, user_message, persona.full_profile)
    console.log('V4 - Instruction length:', instructions.length)
    
    // Debug flag: return prompt if requested
    if (include_prompt) {
      return new Response(
        JSON.stringify({
          success: true,
          response: 'Debug mode: Prompt returned',
          traits_selected: v4TraitAnalysis.selected_traits.map(t => t.trait),
          persona_name: persona.conversation_summary.demographics.name,
          model_used: 'grok-debug',
          prompt_debug: { instructions }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Log the full system prompt for admin monitoring
    try {
      const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
      await supabaseAdmin.functions.invoke('log-grok-prompt', {
        body: {
          source: 'v4-grok',
          persona_id: persona_id,
          persona_name: persona.conversation_summary.demographics.name,
          user_message: user_message,
          system_instructions: instructions,
          conversation_history: (conversation_history || []).slice(-5),
        }
      })
    } catch (e) {
      console.warn('Non-blocking: failed to log Grok prompt', e)
    }

    // Call Grok API with trait-specific instructions (with optional opening guard)
    const messages = [
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
    ];

    const grokApiKey = Deno.env.get('GROK_API_KEY');
    let grokData;

    if (CE_OPENING_DEDUPE_RETRY) {
      // Use guarded version with de-dupe retry
      grokData = await callGrokWithOpeningGuard(messages, persona.name || persona_id, grokApiKey);
    } else {
      // Direct call without guard
      const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${grokApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GROK_MODEL,
          messages: messages,
          stream: false,
          temperature: 0.4
        })
      });

      console.log('Grok response received')
      
      // Check if response is ok
      if (!grokResponse.ok) {
        const errorText = await grokResponse.text()
        console.error('Grok API error:', grokResponse.status, errorText)
        throw new Error(`Grok API error: ${grokResponse.status} - ${errorText}`)
      }

      grokData = await grokResponse.json();
    }
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
        traits_selected: v4TraitAnalysis.selected_traits.map(t => t.trait),
        traits_scores: v4TraitAnalysis.selected_traits.map(t => ({ trait: t.trait, score: t.score })),
        context_classification: v4TraitAnalysis.context_classification,
        linguistic_signature_used: v4TraitAnalysis.linguistic_signature,
        behavioral_modifiers: v4TraitAnalysis.behavioral_modifiers,
        persona_name: persona.conversation_summary.demographics.name,
        model_used: 'grok-4-latest',
        prompt_debug: include_prompt ? { instructions: instructions } : undefined
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

// Extract demographics properly from V4 structure
function extractV4Demographics(conversationSummary: any, fullProfile: any) {
  const cs = conversationSummary || {};
  const demo = cs.demographics || {};
  const identity = fullProfile?.identity || {};
  
  return {
    name: demo.name || identity.name || "Unknown",
    age: demo.age || identity.age || "unknown age", 
    gender: identity.gender || demo.gender || "unknown",
    ethnicity: identity.ethnicity || demo.ethnicity || "unknown",
    location: demo.location || identity.location?.city || identity.location || "unknown location",
    occupation: demo.occupation || identity.occupation || "unknown occupation",
    relationship_status: identity.relationship_status || "unknown",
    dependents: identity.dependents || "unknown"
  };
}

// Extract communication style properly
function extractCommunicationStyle(conversationSummary: any, fullProfile: any) {
  const cs = conversationSummary?.communication_style || {};
  const voiceFound = fullProfile?.communication_style?.voice_foundation || {};
  const regional = fullProfile?.communication_style?.regional_register || {};
  
  return {
    directness: cs.directness || voiceFound.directness || "balanced",
    formality: cs.formality || voiceFound.formality || "neutral", 
    pace_rhythm: voiceFound.pace_rhythm || "moderate",
    regional: regional.region || regional.urbanicity || ""
  };
}