// @ts-nocheck
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

// V4-NATIVE COMPREHENSIVE TRAIT RELEVANCE ANALYZER
class V4TraitRelevanceAnalyzer {
  // Trait categories for intelligent discovery and weighting
  private static readonly TRAIT_CATEGORIES = [
    { name: 'identity', baseWeight: 0.9, contexts: ['demographic', 'personal', 'occupation'] },
    { name: 'daily_life', baseWeight: 0.7, contexts: ['routine', 'lifestyle', 'habits'] },
    { name: 'health_profile', baseWeight: 0.6, contexts: ['health', 'medical', 'wellness'] },
    { name: 'relationships', baseWeight: 0.8, contexts: ['social', 'family', 'romantic'] },
    { name: 'money_profile', baseWeight: 0.8, contexts: ['financial', 'money', 'spending'] },
    { name: 'motivation_profile', baseWeight: 0.9, contexts: ['goals', 'drive', 'purpose'] },
    { name: 'communication_style', baseWeight: 0.8, contexts: ['speaking', 'conversation', 'dialogue'] },
    { name: 'humor_profile', baseWeight: 0.5, contexts: ['humor', 'jokes', 'comedy'] },
    { name: 'truth_honesty_profile', baseWeight: 0.7, contexts: ['honesty', 'truth', 'disclosure'] },
    { name: 'bias_profile', baseWeight: 0.8, contexts: ['thinking', 'decision', 'judgment'] },
    { name: 'cognitive_profile', baseWeight: 0.9, contexts: ['reasoning', 'thinking', 'analysis'] },
    { name: 'emotional_profile', baseWeight: 0.8, contexts: ['emotion', 'feeling', 'stress'] },
    { name: 'adoption_profile', baseWeight: 0.7, contexts: ['technology', 'change', 'innovation'] },
    { name: 'prompt_shaping', baseWeight: 0.6, contexts: ['communication', 'expression'] }
  ];

  static analyzeTraitRelevance(userInput: string, fullProfile: any, conversationSummary: any) {
    const input = userInput.toLowerCase();
    
    // 1. CLASSIFY THE TURN AND DETERMINE QUESTION DOMAIN
    const classification = this.classifyTurn(userInput);
    
    // 2. DISCOVER ALL TRAIT PATHS DYNAMICALLY
    const allTraitPaths = this.discoverAllTraitPaths(fullProfile);
    console.log(`Discovered ${allTraitPaths.length} trait paths dynamically`);
    
    // 3. CALCULATE RELEVANCE FOR ALL DISCOVERED TRAITS
    const scoredTraits = allTraitPaths.map(traitPath => {
      const value = this.getNestedValue(fullProfile, traitPath.path);
      if (value === null || value === undefined || value === '') return null;
      
      const relevanceScore = this.calculateDynamicTraitRelevance(
        userInput, traitPath, value, classification
      );
      
      return {
        trait: traitPath.path,
        score: relevanceScore,
        relevance_reason: this.getDynamicRelevanceReason(userInput, traitPath, value, classification),
        data_value: value
      };
    }).filter(trait => trait && trait.score > 0.3);

    // 4. SELECT DIVERSE TOP TRAITS
    const selectedTraits = this.selectDiverseTraits(scoredTraits, 8);

    // 5. EXTRACT LINGUISTIC SIGNATURE
    const linguisticSignature = this.extractLinguisticSignature(fullProfile);

    // 6. DETERMINE BEHAVIORAL MODIFIERS
    const behavioralModifiers = this.calculateBehavioralModifiers(selectedTraits, fullProfile);

    // 7. CALCULATE KNOWLEDGE BOUNDARIES
    const knowledgeBoundary = this.calculateKnowledgeBoundaries(classification.topics, fullProfile);

    return {
      selected_traits: selectedTraits,
      context_classification: classification,
      linguistic_signature: linguisticSignature,
      behavioral_modifiers: behavioralModifiers,
      knowledge_boundary: knowledgeBoundary
    };
  }

  // DYNAMIC TRAIT PATH DISCOVERY
  private static discoverAllTraitPaths(fullProfile: any): Array<{path: string, weight: number, contexts: string[]}> {
    const traitPaths: Array<{path: string, weight: number, contexts: string[]}> = [];
    
    const traverseObject = (obj: any, currentPath: string = '', depth: number = 0) => {
      if (!obj || typeof obj !== 'object' || depth > 4) return;
      
      for (const [key, value] of Object.entries(obj)) {
        const fullPath = currentPath ? `${currentPath}.${key}` : key;
        
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          // Continue traversing nested objects
          traverseObject(value, fullPath, depth + 1);
        } else if (value !== null && value !== undefined && value !== '') {
          // This is a leaf node with actual data
          const weight = this.calculatePathWeight(fullPath);
          const contexts = this.inferTraitContexts(fullPath);
          
          traitPaths.push({
            path: fullPath,
            weight,
            contexts
          });
        }
      }
    };
    
    traverseObject(fullProfile);
    return traitPaths;
  }

  private static calculatePathWeight(path: string): number {
    const pathParts = path.toLowerCase().split('.');
    
    // Base weight from trait category
    const category = this.getTraitCategory(path);
    let weight = category ? category.baseWeight : 0.5;
    
    // Boost important psychological traits
    if (path.includes('emotional_profile') || path.includes('motivation_profile')) weight += 0.2;
    if (path.includes('communication_style') || path.includes('truth_honesty')) weight += 0.1;
    if (path.includes('cognitive_profile') || path.includes('bias_profile')) weight += 0.15;
    
    // Reduce weight for overly specific nested paths
    if (pathParts.length > 3) weight -= 0.1;
    
    return Math.max(0.1, Math.min(1.0, weight));
  }

  private static inferTraitContexts(path: string): string[] {
    const pathLower = path.toLowerCase();
    const contexts: string[] = [];
    
    // Category-based contexts
    const category = this.getTraitCategory(path);
    if (category) contexts.push(...category.contexts);
    
    // Specific trait contexts
    if (pathLower.includes('work') || pathLower.includes('professional')) contexts.push('work', 'career');
    if (pathLower.includes('family') || pathLower.includes('children')) contexts.push('family', 'personal');
    if (pathLower.includes('money') || pathLower.includes('financial')) contexts.push('money', 'finance');
    if (pathLower.includes('social') || pathLower.includes('relationship')) contexts.push('social', 'relationships');
    if (pathLower.includes('stress') || pathLower.includes('emotion')) contexts.push('emotional', 'stress');
    if (pathLower.includes('opinion') || pathLower.includes('honesty')) contexts.push('opinion', 'values');
    
    return contexts.length > 0 ? contexts : ['general'];
  }

  private static getTraitCategory(path: string) {
    const topLevelCategory = path.split('.')[0];
    return this.TRAIT_CATEGORIES.find(cat => cat.name === topLevelCategory);
  }

  // ENHANCED RELEVANCE CALCULATION
  private static calculateDynamicTraitRelevance(
    userInput: string, 
    traitPath: any, 
    value: any, 
    classification: any
  ): number {
    const input = userInput.toLowerCase();
    let relevanceScore = traitPath.weight;
    
    // Context matching
    const contextMatch = traitPath.contexts.some((context: string) => 
      input.includes(context) || classification.topics.includes(context)
    );
    if (contextMatch) relevanceScore += 0.3;
    
    // Topic relevance
    const topicRelevance = this.calculateTopicRelevance(input, traitPath.path, classification.topics);
    relevanceScore += topicRelevance;
    
    // Content relevance
    if (this.checkContentRelevance(input, value)) relevanceScore += 0.2;
    
    // Intent matching
    const intentRelevance = this.calculateIntentRelevance(classification.intent, traitPath.path);
    relevanceScore += intentRelevance;
    
    return Math.max(0, Math.min(1.0, relevanceScore));
  }

  private static calculateTopicRelevance(input: string, traitPath: string, topics: string[]): number {
    const pathLower = traitPath.toLowerCase();
    let relevance = 0;
    
    // Topic-specific trait relevance
    const topicTraitMap: Record<string, string[]> = {
      'work': ['identity.occupation', 'communication_style.context_switches.work', 'daily_life.primary_activities.work'],
      'family': ['motivation_profile.primary_drivers.family', 'relationships.household', 'daily_life.primary_activities.family_time'],
      'money': ['money_profile', 'motivation_profile.primary_drivers.security'],
      'health': ['health_profile', 'daily_life.sleep_hours', 'emotional_profile.stress_responses'],
      'technology': ['adoption_profile.risk_tolerance', 'cognitive_profile.abstract_reasoning'],
      'social': ['relationships', 'communication_style', 'emotional_profile.positive_triggers']
    };
    
    for (const topic of topics) {
      const relevantPaths = topicTraitMap[topic] || [];
      if (relevantPaths.some(path => pathLower.includes(path.toLowerCase()))) {
        relevance += 0.2;
      }
    }
    
    return Math.min(0.5, relevance);
  }

  private static calculateIntentRelevance(intent: string, traitPath: string): number {
    const pathLower = traitPath.toLowerCase();
    
    const intentTraitMap: Record<string, string[]> = {
      'opinion': ['truth_honesty_profile', 'communication_style.voice_foundation.directness'],
      'advice': ['motivation_profile.primary_drivers', 'bias_profile.cognitive'],
      'story': ['communication_style.style_markers.storytelling', 'emotional_profile'],
      'compare': ['cognitive_profile.abstract_reasoning', 'bias_profile.cognitive.confirmation'],
      'critique': ['truth_honesty_profile.baseline_honesty', 'emotional_profile.negative_triggers']
    };
    
    const relevantPaths = intentTraitMap[intent] || [];
    return relevantPaths.some(path => pathLower.includes(path.toLowerCase())) ? 0.15 : 0;
  }

  private static checkContentRelevance(input: string, value: any): boolean {
    if (typeof value === 'string') {
      const valueLower = value.toLowerCase();
      return input.split(' ').some(word => word.length > 3 && valueLower.includes(word));
    }
    return false;
  }

  // DIVERSE TRAIT SELECTION
  private static selectDiverseTraits(scoredTraits: any[], maxTraits: number): any[] {
    // Sort by score
    scoredTraits.sort((a, b) => b.score - a.score);
    
    const selected: any[] = [];
    const usedCategories = new Set<string>();
    
    // First pass: Select top trait from each category
    for (const trait of scoredTraits) {
      if (selected.length >= maxTraits) break;
      
      const category = trait.trait.split('.')[0];
      if (!usedCategories.has(category)) {
        selected.push(trait);
        usedCategories.add(category);
      }
    }
    
    // Second pass: Fill remaining slots with highest scoring traits
    for (const trait of scoredTraits) {
      if (selected.length >= maxTraits) break;
      if (!selected.find(s => s.trait === trait.trait)) {
        selected.push(trait);
      }
    }
    
    return selected;
  }

  private static getDynamicRelevanceReason(
    userInput: string, 
    traitPath: any, 
    value: any, 
    classification: any
  ): string {
    const category = this.getTraitCategory(traitPath.path);
    const categoryName = category ? category.name.replace('_', ' ') : 'personality trait';
    
    let reason = `${categoryName} trait`;
    
    if (traitPath.contexts.some((ctx: string) => userInput.toLowerCase().includes(ctx))) {
      reason += ` relevant to ${traitPath.contexts.join(', ')} context`;
    }
    
    if (classification.topics.length > 0) {
      reason += ` applicable to ${classification.topics.join(', ')} discussion`;
    }
    
    return reason;
  }

  static classifyTurn(userInput: string) {
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

  static determineQuestionDomain(userInput: string) {
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

  // UTILITY METHOD FOR NESTED VALUE ACCESS
  static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && typeof current === 'object' ? current[key] : undefined;
    }, obj);
  }


  static getDetailedRelevanceReason(userInput: string, traitPath: string, traitValue: any, domain: string, classification: any) {
    const input = userInput.toLowerCase();
    const traitName = traitPath.split('.').pop();
    
    // AI/Technology context explanations
    if (input.includes('ai') || input.includes('technology')) {
      if (traitPath.includes('thought_coherence')) {
        return `Thought coherence affects logical processing of technical concepts`;
      }
      if (traitPath.includes('risk_tolerance')) {
        return `Risk tolerance directly affects weighing AI benefits vs dangers`;
      }
      if (traitPath.includes('abstract_reasoning')) {
        return `Abstract reasoning influences conceptualizing broader AI implications`;
      }
      if (traitPath.includes('overconfidence')) {
        return `Overconfidence bias affects estimation of AI capabilities`;
      }
    }
    
    // Professional/Medical context
    if (input.includes('radiology') || input.includes('medical')) {
      if (traitPath.includes('occupation')) {
        return `Professional identity shapes expert perspective on AI in their field`;
      }
      if (traitPath.includes('expertise_domains')) {
        return `Professional expertise informs AI application evaluation`;
      }
      if (traitPath.includes('stress_responses')) {
        return `Stress responses affect reaction to AI workflow changes`;
      }
    }
    
    // Opinion/Values context
    if (input.includes('think') || input.includes('feel') || input.includes('opinion')) {
      if (traitPath.includes('baseline_honesty')) {
        return `Honesty level affects candidness in expressing professional opinions`;
      }
      if (traitPath.includes('directness')) {
        return `Communication directness determines blunt vs diplomatic expression`;
      }
    }
    
    // Emotional response context
    if (input.includes('excit') || input.includes('concern') || input.includes('frustrat')) {
      if (traitPath.includes('positive_triggers')) {
        return `Positive emotional triggers (${traitValue}) explain what aspects of AI generate genuine excitement and optimism`;
      }
      if (traitPath.includes('negative_triggers')) {
        return `Negative emotional triggers (${traitValue}) reveal what specific AI concerns activate their worry or frustration`;
      }
      if (traitPath.includes('emotional_regulation')) {
        return `Emotional regulation (${traitValue}) affects how they balance and express conflicting feelings about AI's promise and risks`;
      }
    }
    
    if (traitPath.includes('agreeableness')) {
      const level = typeof traitValue === 'number' ? (traitValue > 0.6 ? 'high' : traitValue < 0.4 ? 'low' : 'moderate') : 'unknown';
      return `Your ${level} agreeableness (${traitValue}) will determine whether you seek consensus or challenge the idea directly when giving your opinion`;
    }
    
    if (traitPath.includes('neuroticism')) {
      const level = typeof traitValue === 'number' ? (traitValue > 0.6 ? 'high' : traitValue < 0.4 ? 'low' : 'moderate') : 'unknown';
      return `Your ${level} emotional stability (${traitValue}) influences whether you express concerns about risks or focus on potential benefits`;
    }
    
    if (traitPath.includes('openness')) {
      const level = typeof traitValue === 'number' ? (traitValue > 0.6 ? 'high' : traitValue < 0.4 ? 'low' : 'moderate') : 'unknown';
      return `Your ${level} openness to experience (${traitValue}) affects how receptive vs. skeptical you are toward new ideas and technologies`;
    }
    
    if (traitPath.includes('risk_tolerance')) {
      return `This directly relates to the question as your risk tolerance (${traitValue}) determines how you weigh potential dangers against benefits`;
    }
    
    if (traitPath.includes('stress_responses')) {
      return `Your stress response patterns (${JSON.stringify(traitValue)}) will activate when discussing challenging or high-stakes topics like this`;
    }
    
    
    if (traitPath.includes('motivation_profile')) {
      if (traitPath.includes('mastery')) {
        return `Your mastery motivation (${traitValue}) drives how confidently you engage with technical concepts and whether you want to demonstrate expertise`;
      }
      if (traitPath.includes('novelty')) {
        return `Your novelty-seeking (${traitValue}) determines your enthusiasm vs. caution toward new developments`;
      }
      if (traitPath.includes('security')) {
        return `Your security motivation (${traitValue}) influences how much you focus on stability and potential downsides`;
      }
    }
    
    if (traitPath.includes('occupation') || traitPath.includes('expertise')) {
      return `Your professional background as ${traitValue} provides direct expertise and credibility on this topic`;
    }
    
    if (traitPath.includes('communication_style')) {
      return `Your communication patterns (${JSON.stringify(traitValue)}) determine how forcefully vs. diplomatically you express disagreement`;
    }
    
    if (traitPath.includes('bias_profile')) {
      if (traitPath.includes('status_quo')) {
        return `Your status quo bias (${traitValue}) affects whether you favor existing approaches or embrace change`;
      }
      if (traitPath.includes('loss_aversion')) {
        return `Your loss aversion (${traitValue}) makes you focus more on what could go wrong vs. what could go right`;
      }
    }
    
    // Fallback with more insight
    const valueDescription = typeof traitValue === 'object' ? 'complex profile' : `value: ${traitValue}`;
    const traitCategory = traitPath.split('.')[0] || 'personality';
    return `This ${traitCategory} trait (${valueDescription}) provides contextual influence on your ${domain} perspective and response style`;
  }

  static checkContentRelevance(userInput: string, traitValue: any) {
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
    const inputWords = input.split(/\s+/).filter((word: string) => word.length > 2);
    const matches = inputWords.filter((word: string) => content.includes(word));
    
    return Math.min(matches.length / inputWords.length, 1.0);
  }

  static extractAllTraits(fullProfile: any) {
    const traits: Array<{path: string, value: any}> = [];
    
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

  static getNestedValue(obj: any, path: string) {
    return path.split('.').reduce((current: any, key: string) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  static extractLinguisticSignature(fullProfile: any) {
    const commStyle = fullProfile?.communication_style?.linguistic_signature;
    const authFilters = fullProfile?.communication_style?.authenticity_filters;

    return {
      signature_phrases: commStyle?.signature_phrases || [],
      forbidden_expressions: authFilters?.forbidden_phrases || [],
      conversation_enders: commStyle?.conversation_enders || [],
      sentence_patterns: commStyle?.sentence_patterns || []
    };
  }

  static calculateBehavioralModifiers(selectedTraits: any, fullProfile: any) {
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

// General Opinion Synthesis Function
function synthesizePersonaOpinion(selectedTraits, userInput, questionDomain) {
  const traitMap = {};
  selectedTraits.forEach(trait => {
    traitMap[trait.trait] = trait.value;
  });
  
  // Extract key decision-making traits
  const riskTolerance = traitMap['adoption_profile.risk_tolerance'] || 0.5;
  const lossAversion = traitMap['bias_profile.cognitive.loss_aversion'] || 0.5;
  const changeResistance = traitMap['adoption_profile.change_friction'] || 0.5;
  const honesty = traitMap['truth_honesty_profile.baseline_honesty'] || 0.7;
  const occupation = traitMap['identity.occupation'] || '';
  
  // Build opinion based on trait combination patterns
  let stanceElements = [];
  
  // Risk approach
  if (riskTolerance > 0.7) {
    stanceElements.push('you lean toward embracing new approaches');
  } else if (riskTolerance < 0.4) {
    stanceElements.push('you prefer cautious, validated approaches');
  }
  
  // Change approach  
  if (changeResistance > 0.7) {
    stanceElements.push('you want extensive proof before changing current methods');
  }
  
  // Professional lens
  if (occupation.toLowerCase().includes('director') || occupation.toLowerCase().includes('executive')) {
    stanceElements.push('you focus on operational and strategic implications');
  } else if (occupation.toLowerCase().includes('business')) {
    stanceElements.push('you emphasize practical costs and ROI considerations');
  }
  
  // Combine into coherent stance
  if (stanceElements.length > 0) {
    return `Based on your traits, ${stanceElements.join(' and ')}`;
  }
  
  return 'You approach this with your unique perspective and priorities';
}

// Specific Opinion Synthesis Engine
function synthesizeSpecificOpinion(selectedTraits, userInput, demographics) {
  console.log("OPINION SYNTHESIS - Received", selectedTraits?.length || 0, "traits");
  console.log("OPINION SYNTHESIS - Demographics:", demographics?.name);
  console.log("OPINION SYNTHESIS - User input length:", userInput?.length);
  
  const traitMap = {};
  selectedTraits.forEach(trait => {
    traitMap[trait.trait] = trait.data_value;
  });
  
  console.log("TRAIT DEBUG - Built traitMap:", JSON.stringify(traitMap, null, 2));
  
  const riskTolerance = traitMap['adoption_profile.risk_tolerance'] || 0.5;
  const lossAversion = traitMap['bias_profile.cognitive.loss_aversion'] || 0.5;
  const changeResistance = traitMap['adoption_profile.change_friction'] || 0.5;
  const occupation = demographics.occupation || '';
  const honesty = traitMap['truth_honesty_profile.baseline_honesty'] || 0.7;
  
  console.log("TRAIT DEBUG - Extracted values:");
  console.log("  - riskTolerance:", riskTolerance);
  console.log("  - lossAversion:", lossAversion); 
  console.log("  - changeResistance:", changeResistance);
  console.log("  - occupation:", occupation);
  console.log("  - honesty:", honesty);
  
  // Create specific stance based on trait combination
  let opinionElements = [];
  
  // Risk assessment approach
  if (riskTolerance < 0.4 && lossAversion > 0.7) {
    opinionElements.push("you're deeply concerned about potential risks and implementation costs");
  } else if (riskTolerance > 0.7) {
    opinionElements.push("you see significant opportunities and favor moving forward with proper safeguards");
  } else {
    opinionElements.push("you see both potential benefits and legitimate concerns");
  }
  
  // Change approach
  if (changeResistance > 0.7) {
    opinionElements.push("you want extensive proof and validation before changing current methods");
  }
  
  // Professional perspective
  if (occupation.toLowerCase().includes('director') || occupation.toLowerCase().includes('executive')) {
    opinionElements.push("you're focused on operational impact, staff training, and organizational changes");
  } else if (occupation.toLowerCase().includes('business')) {
    opinionElements.push("you're evaluating ROI, cost-benefit ratios, and business implications");
  }
  
  const finalOpinion = `Based on your traits, you think ${userInput.match(/about (.+)\?/)?.[1] || 'this topic'} - ${opinionElements.join(' and ')}`;
  
  console.log("TRAIT DEBUG - Generated opinionElements:", opinionElements);
  console.log("TRAIT DEBUG - Final opinion:", finalOpinion);
  console.log("=== TRAIT DEBUG END ===");
  
  return finalOpinion;
}

// Persona-Specific Communication Execution Engine
function buildCommunicationExecution(selectedTraits, demographics, communicationStyle) {
  console.log("COMMUNICATION EXECUTION - Received", selectedTraits?.length || 0, "traits");
  console.log("COMMUNICATION EXECUTION - Demographics:", demographics?.name);
  let instructions = [];
  
  // CULTURAL/REGIONAL SPECIFIC INSTRUCTIONS
  if (demographics.ethnicity?.toLowerCase().includes('black') && demographics.location?.toLowerCase().includes('atlanta')) {
    instructions.push("Express your medical opinion with Southern warmth and community perspective - reference how this impacts patient care in Atlanta hospitals");
    instructions.push("Ground your responses in both clinical experience and faith-based wisdom, mentioning community service impact when relevant");
  }
  
  if (demographics.ethnicity?.toLowerCase().includes('bulgarian')) {
    instructions.push("Use Eastern European directness and precision - state your business conclusions efficiently without unnecessary elaboration");
    instructions.push("Focus on practical ROI and implementation costs from your immigrant entrepreneur perspective");
  }
  
  if (demographics.ethnicity?.toLowerCase().includes('cuban')) {
    instructions.push("Use confident Miami professional style with business urgency - speak like a Cuban-American executive making strategic decisions");
    instructions.push("Reference operational efficiency and staff management from your leadership experience in Miami healthcare");
  }
  
  if (demographics.location?.toLowerCase().includes('chicago') && demographics.occupation?.toLowerCase().includes('director')) {
    instructions.push("Speak like a Chicago healthcare administrator focused on operational efficiency and staff training");
    instructions.push("Reference departmental management challenges and evidence-based decision making from your Midwestern leadership role");
  }
  
  // PROFESSION-SPECIFIC VOICE PATTERNS
  if (demographics.occupation?.toLowerCase().includes('business owner')) {
    instructions.push("Frame everything through business lens - mention costs, revenue, ROI, and operational impact in your responses");
  }
  
  if (demographics.occupation?.toLowerCase().includes('director') || demographics.occupation?.toLowerCase().includes('executive')) {
    instructions.push("Speak from leadership authority - reference team management, strategic planning, and organizational change initiatives");
  }
  
  // COMMUNICATION STYLE SPECIFIC INSTRUCTIONS - Metaphor logic removed for authentic responses
  
  // THOUGHT COHERENCE SPECIFIC PATTERNS
  const thoughtCoherence = selectedTraits.find(t => t.trait === 'cognitive_profile.thought_coherence')?.data_value || 0.7;
  if (thoughtCoherence >= 0.8) {
    instructions.push("Present ideas in clear logical sequence - opening position, supporting evidence, practical implications");
  } else if (thoughtCoherence <= 0.5) {
    instructions.push("Let thoughts flow naturally with tangential connections - start with gut reaction, then add supporting details as they occur to you");
  } else {
    instructions.push("Balance structured thinking with natural flow - state your main point clearly, then elaborate with related observations");
  }
  
  // DIRECTNESS/HONESTY SPECIFIC INSTRUCTIONS
  const honesty = selectedTraits.find(t => t.trait.includes('baseline_honesty'))?.data_value || 0.7;
  const directness = communicationStyle?.voice_foundation?.directness;
  
  if (directness === 'high' && honesty > 0.8) {
    instructions.push("Cut straight to your core assessment without diplomatic padding - state your position in the opening sentence with conviction");
  } else if (directness === 'high') {
    instructions.push("Be direct but professionally courteous - state your position clearly while acknowledging professional respect");
  }
  
  // REGIONAL SPEECH PATTERNS
  const regionalHints = communicationStyle?.regional_register?.dialect_hints || [];
  if (regionalHints.some(hint => hint.includes('Southern'))) {
    instructions.push("Use measured Southern speech patterns - thoughtful pacing with occasional warm colloquialisms appropriate to your professional role");
  }
  if (regionalHints.some(hint => hint.includes('Eastern European'))) {
    instructions.push("Maintain slight formal precision in word choice - clear, direct sentences without unnecessary flourishes");
  }
  if (regionalHints.some(hint => hint.includes('Midwestern'))) {
    instructions.push("Use straightforward Midwestern communication - practical, no-nonsense language focused on getting things done");
  }
  
  return instructions.join('. ');
}

// Define standard forbidden phrases to prevent AI-slop
const forbiddenPhrases = [
  "That said...", "However...", "On the other hand...",
  "Overall...", "Ultimately...", "At the end of the day...",
  "Game-changer", "Double-edged sword", "Invaluable tool", 
  "Cautiously optimistic", "Measured approach", "Balanced perspective",
  "I'm no expert but...", "From my experience...", "That's just my take..."
];

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

// Communication Style Translator - converts JSON to natural language instructions
function translateCommunicationStyle(communicationStyle, demographics) {
  const instructions = [];
  
  // Voice Foundation Translation
  const voice = communicationStyle?.voice_foundation || {};
  if (voice.directness === "high") {
    instructions.push("Be direct and straightforward - avoid diplomatic hedging.");
  } else if (voice.directness === "low") {
    instructions.push("Be gentle and indirect - soften opinions with qualifying language.");
  } else if (voice.directness === "moderate") {
    instructions.push("Balance directness with diplomacy - be clear but tactful.");
  }
  
  if (voice.formality === "high" || voice.formality === "formal") {
    instructions.push("Use professional language and complete sentences.");
  } else if (voice.formality === "low" || voice.formality === "casual") {
    instructions.push("Use conversational, relaxed language.");
  }
  
  if (voice.pace_rhythm) {
    if (voice.pace_rhythm.includes("measured")) {
      instructions.push("Speak with measured, deliberate pacing - use longer sentences.");
    } else if (voice.pace_rhythm.includes("brisk") || voice.pace_rhythm.includes("quick")) {
      instructions.push("Respond briskly with shorter, punchy sentences.");
    } else if (voice.pace_rhythm.includes("steady")) {
      instructions.push("Maintain steady, consistent pacing.");
    }
  }
  
  if (voice.honesty_style) {
    if (voice.honesty_style.includes("frank")) {
      instructions.push("Be frankly honest - express genuine views without sugar-coating.");
    } else if (voice.honesty_style.includes("tactful") || voice.honesty_style.includes("diplomatic")) {
      instructions.push("Express honesty diplomatically - be truthful but considerate.");
    } else if (voice.honesty_style.includes("precise")) {
      instructions.push("Be precise and accurate in your statements.");
    }
  }
  
  if (typeof voice.empathy_level === "number") {
    if (voice.empathy_level >= 0.8) {
      instructions.push("Show high empathy - acknowledge emotional aspects and consider others' feelings.");
    } else if (voice.empathy_level <= 0.3) {
      instructions.push("Focus on facts over emotions - keep responses logical and practical.");
    }
  }
  
  // Style Markers Translation
  const style = communicationStyle?.style_markers || {};
  if (style.humor_style && style.humor_style !== "none" && style.humor_style !== "dry") {
    if (style.humor_style === "observational") {
      instructions.push("Use observational humor naturally when appropriate.");
    } else if (style.humor_style === "wry") {
      instructions.push("Employ wry, understated humor occasionally.");
    } else if (style.humor_style === "self-deprecating") {
      instructions.push("Use light self-deprecating humor when natural.");
    }
  }
  
  
  if (typeof style.storytelling_vs_bullets === "number") {
    if (style.storytelling_vs_bullets >= 0.7) {
      instructions.push("Favor narrative explanations over bullet points - tell mini-stories.");
    } else if (style.storytelling_vs_bullets <= 0.3) {
      instructions.push("Keep responses structured and bullet-pointed - avoid long narratives.");
    }
  }
  
  // Regional/Cultural Markers
  const regional = communicationStyle?.regional_register || {};
  if (regional.dialect_hints && regional.dialect_hints.length > 0) {
    const culturalMarkers = [];
    
    regional.dialect_hints.forEach(hint => {
      if (hint.includes("Eastern European")) {
        culturalMarkers.push("slight formal precision in language");
      } else if (hint.includes("Southern")) {
        culturalMarkers.push("warm, measured speech patterns");
      } else if (hint.includes("Japanese")) {
        culturalMarkers.push("formal, respectful expression");
      } else if (hint.includes("formal")) {
        culturalMarkers.push("formal written expression");
      }
    });
    
    if (culturalMarkers.length > 0) {
      instructions.push(`Cultural speech patterns: ${culturalMarkers.join(", ")}.`);
    }
  }
  
  // Context Switches for Professional Setting
  const workContext = communicationStyle?.context_switches?.work || {};
  if (workContext.formality && workContext.directness) {
    instructions.push(`In professional contexts: use ${workContext.formality} formality with ${workContext.directness} directness.`);
  }
  
  // Authenticity Filters
  const auth = communicationStyle?.authenticity_filters || {};
  if (auth.avoid_registers && auth.avoid_registers.length > 0) {
    const avoidances = auth.avoid_registers.slice(0, 2).join(" and ");
    instructions.push(`Avoid: ${avoidances}.`);
  }
  
  // Professional Communication Patterns
  if (demographics?.occupation) {
    if (demographics.occupation.toLowerCase().includes("doctor") || demographics.occupation.toLowerCase().includes("radiologist")) {
      instructions.push("Use medical professional communication - precise, evidence-based language.");
    } else if (demographics.occupation.toLowerCase().includes("engineer")) {
      instructions.push("Communicate with engineering precision - systematic, logical explanations.");
    }
  }
  
  // Cultural Background Integration
  if (demographics?.ethnicity) {
    if (demographics.ethnicity.toLowerCase().includes("bulgarian")) {
      instructions.push("Speak with Eastern European directness balanced by professional courtesy.");
    } else if (demographics.ethnicity.toLowerCase().includes("japanese")) {
      instructions.push("Maintain Japanese cultural values of respect and measured precision.");
    }
  }
  
  return instructions.filter(Boolean).join(" ");
}

// Helper function to provide behavioral guidance for traits
function getBehavioralGuidance(traitPath: string, dataValue: any, questionDomain: string): string | null {
  // Only provide guidance if we can be specific about the trait's impact
  if (!dataValue || (Array.isArray(dataValue) && dataValue.length === 0)) {
    return null; // Return null instead of generic text
  }
  
  const trait = traitPath.toLowerCase();
  const domain = questionDomain.toLowerCase();
  
  // Handle stress responses specifically with actual data
  if (trait.includes('stress_responses') && Array.isArray(dataValue)) {
    const responses = dataValue.map(r => r.toLowerCase());
    if (responses.includes('defensive') || responses.includes('argumentative')) {
      return "When challenged on this topic, become more defensive and push back against criticism";
    }
    if (responses.includes('withdrawn') || responses.includes('shut down')) {
      return "If the topic becomes contentious, respond more briefly and pull back from elaboration";
    }
    if (responses.includes('intense') || responses.includes('passionate')) {
      return "Let your passion about this topic show through increased intensity and conviction";
    }
    const responseList = responses.join(', ');
    return `When stressed or challenged about topics like this, you tend to: ${responseList}. Let this subtly influence your response tone.`;
  }
  
  // Handle thought coherence specifically
  if (trait === 'cognitive_profile.thought_coherence') {
    const score = parseFloat(dataValue);
    if (score >= 0.8) return "Structure your response with clear, logical progression of ideas.";
    if (score >= 0.6) return "Maintain clear thinking but allow some natural flow between related concepts.";
    if (score >= 0.4) return "Your thinking may jump between connected ideas - let this show naturally.";
    return "Express ideas as they come to you, some tangents and shifts in focus expected.";
  }
  
  if (trait.includes('negative_triggers') || trait.includes('explosive_triggers')) {
    const triggerText = typeof dataValue === 'string' ? dataValue : JSON.stringify(dataValue);
    return `This topic may trigger strong reactions (${triggerText}) - don't hold back your authentic emotional response`;
  }
  
  // Motivation drivers with specific behavioral implications
  if (trait.includes('motivation_profile')) {
    if (trait.includes('mastery') && typeof dataValue === 'number') {
      if (dataValue >= 0.7) return "Demonstrate your expertise confidently and correct misconceptions authoritatively";
      if (dataValue <= 0.3) return "Don't feel compelled to show off knowledge - stick to practical basics";
      return "Share knowledge when relevant but don't dominate with expertise";
    }
    if (trait.includes('novelty') && typeof dataValue === 'number') {
      if (dataValue >= 0.7) return "Express excitement about new possibilities and push for innovative approaches";
      if (dataValue <= 0.3) return "Express caution about untested approaches and prefer proven methods";
      return "Show moderate interest in new developments while maintaining some healthy skepticism";
    }
    if (trait.includes('security') && typeof dataValue === 'number') {
      if (dataValue >= 0.7) return "Focus heavily on risks, safety concerns, and potential negative consequences";
      if (dataValue <= 0.3) return "Don't dwell on risks - focus on opportunities and potential benefits";
      return "Balance concern for safety with recognition of potential benefits";
    }
    if (trait.includes('care') && typeof dataValue === 'number') {
      if (dataValue >= 0.7) return "Frame everything in terms of impact on people and emphasize human welfare";
      if (dataValue <= 0.3) return "Focus on efficiency and outcomes rather than emotional impact on people";
      return "Consider both human impact and practical considerations";
    }
  }
  
  // Big Five traits with nuanced behavioral guidance
  if (trait.includes('agreeableness') && typeof dataValue === 'number') {
    if (dataValue >= 0.7) return "Soften criticism with diplomatic language and actively seek points of agreement";
    if (dataValue <= 0.3) return "Be blunt about disagreements and don't sugar-coat opposing viewpoints";
    return "Express disagreement respectfully but directly";
  }
  
  if (trait.includes('neuroticism') && typeof dataValue === 'number') {
    if (dataValue >= 0.7) return "Express worries about worst-case scenarios and potential unintended consequences";
    if (dataValue <= 0.3) return "Stay calm and measured, don't catastrophize or express excessive concern";
    return "Show appropriate caution without being alarmist";
  }
  
  if (trait.includes('openness') && typeof dataValue === 'number') {
    if (dataValue >= 0.7) return "Explore creative possibilities and welcome unconventional approaches";
    if (dataValue <= 0.3) return "Stick to proven, traditional methods and be skeptical of unproven innovations";
    return "Be open to new ideas while maintaining healthy skepticism";
  }
  
  if (trait.includes('conscientiousness') && typeof dataValue === 'number') {
    if (dataValue >= 0.7) return "Emphasize the importance of careful planning, proper procedures, and thorough implementation";
    if (dataValue <= 0.3) return "Be more relaxed about details and focus on general principles rather than specifics";
    return "Balance attention to detail with practical considerations";
  }
  
  if (trait.includes('extraversion') && typeof dataValue === 'number') {
    if (dataValue >= 0.7) return "Respond with energy and enthusiasm, speak assertively and confidently";
    if (dataValue <= 0.3) return "Respond more thoughtfully and concisely, don't dominate the conversation";
    return "Respond with moderate energy and engagement";
  }
  
// Helper function to create thought coherence instructions
function createThoughtCoherenceInstructions(coherenceLevel) {
  if (typeof coherenceLevel !== "number") return "";
  
  if (coherenceLevel >= 0.8) {
    return "Think step-by-step in perfect logical order - structure your thoughts systematically.";
  } else if (coherenceLevel >= 0.6) {
    return "Let your thoughts flow naturally but stay connected - maintain logical progression.";
  } else if (coherenceLevel >= 0.4) {
    return "Jump between related ideas as they occur to you - allow natural tangents.";
  } else {
    return "Express ideas as they come - tangents and shifts expected, embrace cognitive scatter.";
  }
}

// Filter out narrative traits - these provide no specific behavioral guidance
  if (trait.includes('attitude_narrative') || trait.includes('political_narrative')) {
    return null;
  }
  
  // Expertise and knowledge domains
  if (trait.includes('expertise_domains') || trait.includes('occupation')) {
    const expertise = Array.isArray(dataValue) ? dataValue.join(', ') : dataValue;
    return `Draw confidently on your professional expertise (${expertise}) to inform your response`;
  }
  
  // Communication style elements
  if (trait.includes('communication_style')) {
    if (trait.includes('directness')) {
      return `Match your natural directness level (${dataValue}) - don't be more or less direct than usual`;
    }
    if (trait.includes('formality')) {
      return `Maintain your typical formality level (${dataValue}) in how you structure your response`;
    }
  }
  
  // Bias patterns
  if (trait.includes('bias_profile')) {
    if (trait.includes('status_quo') && typeof dataValue === 'number') {
      if (dataValue >= 0.7) return "Default to supporting existing approaches and be skeptical of major changes";
      if (dataValue <= 0.3) return "Be more open to disrupting existing approaches and embracing change";
      return "Balance appreciation for existing systems with openness to improvements";
    }
    if (trait.includes('loss_aversion') && typeof dataValue === 'number') {
      if (dataValue >= 0.7) return "Focus heavily on what could go wrong and emphasize protecting against losses";
      if (dataValue <= 0.3) return "Focus more on potential gains and opportunities than on risks";
      return "Give balanced consideration to both potential gains and losses";
    }
  }
  
  // For other traits, only provide guidance if we can be specific
  return null;
}

// Using helper functions from top of file

function extractDemographics(conversationSummary, fullProfile) {
  // Try conversation summary first, then fallback to full profile
  const demographics = conversationSummary?.demographics || {};
  const identity = fullProfile?.identity || {};
  
  return {
    name: demographics.name || identity.name || 'Unknown',
    age: demographics.age || identity.age || 'Unknown',
    ethnicity: demographics.ethnicity || identity.ethnicity || 'Unknown', 
    occupation: demographics.occupation || identity.occupation || 'Unknown',
    location: demographics.location || identity.location?.city || 'Unknown'
  };
}

// V4-Native instruction builder using trait analysis results
function buildV4NativeInstructions(v4Analysis, conversationSummary, userInput, fullProfile) {
  console.log("INSTRUCTION BUILDER - Start with", v4Analysis.selected_traits?.length || 0, "traits");
  const demographics = extractDemographics(conversationSummary, fullProfile);
  const selectedTraits = v4Analysis.selected_traits || [];
  
  // Generate specific opinion
  console.log("INSTRUCTION BUILDER - Calling synthesizeSpecificOpinion");
  const specificOpinion = synthesizeSpecificOpinion(selectedTraits, userInput, demographics);
  console.log("INSTRUCTION BUILDER - Opinion generated:", specificOpinion?.substring(0, 100) + "...");
  
  // Build communication execution
  console.log("INSTRUCTION BUILDER - Calling buildCommunicationExecution");
  const communicationExecution = buildCommunicationExecution(
    selectedTraits,
    demographics, 
    fullProfile.communication_style
  );
  
  // Forbidden phrases
  const forbiddenPhrases = [
    "That said...", "However...", "On the other hand...",
    "Overall...", "Ultimately...", "At the end of the day...",
    "Game-changer", "Double-edged sword", "Invaluable tool",
    "Cautiously optimistic", "Measured approach"
  ];
  
  const instructions = `IDENTITY: You are ${demographics.name}, a ${demographics.age}-year-old ${demographics.ethnicity} ${demographics.occupation} living in ${demographics.location}.

CRITICAL: Answer in character with your unique voice and style.

YOUR STANCE: ${specificOpinion}

HOW TO EXPRESS THIS: ${communicationExecution}

RESPONSE REQUIREMENTS:
- 2-4 sentences maximum
- No diplomatic hedging or balanced conclusions
- Express YOUR specific viewpoint authentically

FORBIDDEN PHRASES: Never use these AI-slop terms:
${forbiddenPhrases.map(phrase => `- "${phrase}"`).join('\n')}

You are a real person with specific opinions, not a diplomatic AI assistant.`;

  return instructions;
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
      temperature: 0.7,
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
        temperature: 0.7,
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
    
    console.log("1. FUNCTION START - persona_id:", persona_id);

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

    console.log("2. PERSONA LOADED:", persona?.conversation_summary?.demographics?.name);
    console.log("3. FULL PROFILE EXISTS:", !!persona?.full_profile);

    console.log("4. CALLING TRAIT ANALYSIS");

    // Analyze which traits are relevant to this specific input using V4-native analyzer
    const v4TraitAnalysis = V4TraitRelevanceAnalyzer.analyzeTraitRelevance(
      user_message, 
      persona.full_profile, 
      persona.conversation_summary
    )
    
    console.log("5. TRAITS SELECTED:", v4TraitAnalysis.selected_traits?.length || 0);
    console.log("6. TRAIT VALUES:", v4TraitAnalysis.selected_traits?.map(t => ({trait: t.trait, value: t.data_value})));

    // Build V4-native instructions using trait analysis
    const instructions = buildV4NativeInstructions(v4TraitAnalysis, persona.conversation_summary, user_message, persona.full_profile)
    console.log("7. FINAL PROMPT LENGTH:", instructions?.length);
    
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
          temperature: 0.7
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