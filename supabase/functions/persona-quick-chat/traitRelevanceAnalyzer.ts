export interface TraitRelevanceScore {
  category: string;
  subcategory?: string;
  traitPath: string;
  relevanceScore: number; // 1-10 scale
  reasoning: string;
}

export interface TraitScanResult {
  scores: TraitRelevanceScore[];
  highPriorityTraits: TraitRelevanceScore[]; // Score >= 6
  totalScanned: number;
}

// @ts-nocheck
export class TraitRelevanceAnalyzer {
  private static TRAIT_PATHS = [
    // Big Five - THESE MATCH
    { category: 'Big Five', path: 'big_five.openness', subcategory: 'Openness' },
    { category: 'Big Five', path: 'big_five.conscientiousness', subcategory: 'Conscientiousness' },
    { category: 'Big Five', path: 'big_five.extraversion', subcategory: 'Extraversion' },
    { category: 'Big Five', path: 'big_five.agreeableness', subcategory: 'Agreeableness' },
    { category: 'Big Five', path: 'big_five.neuroticism', subcategory: 'Neuroticism' },
    
    // Moral Foundations - FIXED TO MATCH ACTUAL DATA
    { category: 'Moral Foundations', path: 'moral_foundations.care', subcategory: 'Care' },
    { category: 'Moral Foundations', path: 'moral_foundations.fairness', subcategory: 'Fairness' },
    { category: 'Moral Foundations', path: 'moral_foundations.loyalty', subcategory: 'Loyalty' },
    { category: 'Moral Foundations', path: 'moral_foundations.authority', subcategory: 'Authority' },
    { category: 'Moral Foundations', path: 'moral_foundations.sanctity', subcategory: 'Sanctity' },
    { category: 'Moral Foundations', path: 'moral_foundations.liberty', subcategory: 'Liberty' },
    
    // World Values - FIXED TO MATCH ACTUAL DATA
    { category: 'World Values', path: 'world_values.traditional_vs_secular', subcategory: 'Traditional vs Secular' },
    { category: 'World Values', path: 'world_values.survival_vs_self_expression', subcategory: 'Survival vs Self-Expression' },
    { category: 'World Values', path: 'world_values.materialist_vs_postmaterialist', subcategory: 'Materialist vs Post-Materialist' },
    
    // Political Compass - FIXED TO MATCH ACTUAL DATA
    { category: 'Political Compass', path: 'political_compass.economic', subcategory: 'Economic Left-Right' },
    { category: 'Political Compass', path: 'political_compass.authoritarian_libertarian', subcategory: 'Authoritarian-Libertarian' },
    { category: 'Political Compass', path: 'political_compass.cultural_conservative_progressive', subcategory: 'Cultural Conservative-Progressive' },
    
    // Behavioral Economics - FIXED TO MATCH ACTUAL DATA
    { category: 'Behavioral Economics', path: 'behavioral_economics.risk_sensitivity', subcategory: 'Risk Sensitivity' },
    { category: 'Behavioral Economics', path: 'behavioral_economics.loss_aversion', subcategory: 'Loss Aversion' },
    { category: 'Behavioral Economics', path: 'behavioral_economics.present_bias', subcategory: 'Present Bias' },
    { category: 'Behavioral Economics', path: 'behavioral_economics.overconfidence', subcategory: 'Overconfidence' },
    { category: 'Behavioral Economics', path: 'behavioral_economics.scarcity_sensitivity', subcategory: 'Scarcity Sensitivity' },
    
    // Cultural Dimensions - FIXED TO MATCH ACTUAL DATA
    { category: 'Cultural Dimensions', path: 'cultural_dimensions.individualism_vs_collectivism', subcategory: 'Individualism vs Collectivism' },
    { category: 'Cultural Dimensions', path: 'cultural_dimensions.power_distance', subcategory: 'Power Distance' },
    { category: 'Cultural Dimensions', path: 'cultural_dimensions.uncertainty_avoidance', subcategory: 'Uncertainty Avoidance' },
    { category: 'Cultural Dimensions', path: 'cultural_dimensions.masculinity_vs_femininity', subcategory: 'Masculinity vs Femininity' },
    { category: 'Cultural Dimensions', path: 'cultural_dimensions.long_term_orientation', subcategory: 'Long Term Orientation' },
    { category: 'Cultural Dimensions', path: 'cultural_dimensions.indulgence_vs_restraint', subcategory: 'Indulgence vs Restraint' },
    
    // Social Identity - FIXED TO MATCH ACTUAL DATA
    { category: 'Social Identity', path: 'social_identity.social_dominance_orientation', subcategory: 'Social Dominance' },
    { category: 'Social Identity', path: 'social_identity.system_justification', subcategory: 'System Justification' },
    { category: 'Social Identity', path: 'social_identity.ingroup_bias_tendency', subcategory: 'Ingroup Bias' },
    { category: 'Social Identity', path: 'social_identity.cultural_intelligence', subcategory: 'Cultural Intelligence' },
    { category: 'Social Identity', path: 'social_identity.identity_strength', subcategory: 'Identity Strength' },
    
    // Extended Traits - FIXED TO MATCH ACTUAL DATA
    { category: 'Extended Traits', path: 'extended_traits.empathy', subcategory: 'Empathy' },
    { category: 'Extended Traits', path: 'extended_traits.self_awareness', subcategory: 'Self Awareness' },
    { category: 'Extended Traits', path: 'extended_traits.manipulativeness', subcategory: 'Manipulativeness' },
    { category: 'Extended Traits', path: 'extended_traits.emotional_regulation', subcategory: 'Emotional Regulation' },
    { category: 'Extended Traits', path: 'extended_traits.cognitive_flexibility', subcategory: 'Cognitive Flexibility' },
    { category: 'Extended Traits', path: 'extended_traits.truth_orientation', subcategory: 'Truth Orientation' },
    { category: 'Extended Traits', path: 'extended_traits.impulse_control', subcategory: 'Impulse Control' },
    { category: 'Extended Traits', path: 'extended_traits.self_efficacy', subcategory: 'Self Efficacy' },
    { category: 'Extended Traits', path: 'extended_traits.conflict_avoidance', subcategory: 'Conflict Avoidance' },
    { category: 'Extended Traits', path: 'extended_traits.conformity_tendency', subcategory: 'Conformity Tendency' },
    { category: 'Extended Traits', path: 'extended_traits.moral_consistency', subcategory: 'Moral Consistency' },
    { category: 'Extended Traits', path: 'extended_traits.cognitive_load_resilience', subcategory: 'Cognitive Load Resilience' },
    { category: 'Extended Traits', path: 'extended_traits.need_for_cognitive_closure', subcategory: 'Need for Cognitive Closure' },
    { category: 'Extended Traits', path: 'extended_traits.institutional_trust', subcategory: 'Institutional Trust' },
    { category: 'Extended Traits', path: 'extended_traits.emotional_intensity', subcategory: 'Emotional Intensity' },
    
    // Dynamic State - FIXED TO MATCH ACTUAL DATA
    { category: 'Dynamic State', path: 'dynamic_state.current_stress_level', subcategory: 'Current Stress Level' },
    { category: 'Dynamic State', path: 'dynamic_state.emotional_stability_context', subcategory: 'Emotional Stability' },
    { category: 'Dynamic State', path: 'dynamic_state.trigger_threshold', subcategory: 'Trigger Threshold' },
    { category: 'Dynamic State', path: 'dynamic_state.motivation_orientation', subcategory: 'Motivation Orientation' }
  ];

  public static async analyzeTraitRelevance(
    userMessage: string,
    conversationContext: string,
    traitProfile: any
  ): Promise<TraitScanResult> {
    console.log('🔍 Starting comprehensive trait relevance analysis...');
    
    const scores: TraitRelevanceScore[] = [];
    
    // Create analysis prompt for all traits at once
    const analysisPrompt = this.createTraitAnalysisPrompt(userMessage, conversationContext);
    
    // Analyze each trait path
    for (const traitDef of this.TRAIT_PATHS) {
      const traitValue = this.getTraitValue(traitProfile, traitDef.path);
      
      if (traitValue !== null) {
        const relevanceScore = await this.scoreTraitRelevance(
          traitDef,
          traitValue,
          analysisPrompt
        );
        
        scores.push(relevanceScore);
      }
    }
    
    // Include knowledge domains if they exist
    if (traitProfile.knowledge_domains) {
      const knowledgeScores = await this.analyzeKnowledgeDomains(
        traitProfile.knowledge_domains,
        analysisPrompt
      );
      scores.push(...knowledgeScores);
    }
    
    // Use ALL traits - no filtering for complete personality influence
    const highPriorityTraits = scores;
    
    console.log(`📊 Trait analysis complete: ${scores.length} traits analyzed, ${highPriorityTraits.length} high-priority`);
    
    return {
      scores,
      highPriorityTraits,
      totalScanned: scores.length
    };
  }

  private static createTraitAnalysisPrompt(userMessage: string, conversationContext: string): string {
    return `
User Message: "${userMessage}"
Conversation Context: "${conversationContext}"

Analyze how relevant each personality trait would be for generating an authentic response to this specific message.
Consider:
- Direct relevance to the topic/question
- Emotional triggers in the message
- Social dynamics involved
- Decision-making aspects
- Value conflicts that might arise
- Communication style needed

Rate relevance on 1-10 scale:
1-3: Minimal influence on response
4-5: Some influence, background factor
6-7: Significant influence, shapes key aspects
8-10: Critical influence, primary driver of response
    `;
  }

  private static async scoreTraitRelevance(
    traitDef: any,
    traitValue: number,
    analysisPrompt: string
  ): Promise<TraitRelevanceScore> {
    // Calculate actual relevance score based on trait strength and context
    
    let relevanceScore = 0;
    let reasoning = '';
    
    // Only extreme trait values should be high priority - be much more selective
    if (traitValue >= 0.85) {
      relevanceScore = 8;
      reasoning = `Very strong ${traitDef.subcategory} (${traitValue.toFixed(2)}) will significantly shape response`;
    } else if (traitValue >= 0.75) {
      relevanceScore = 6;
      reasoning = `Strong ${traitDef.subcategory} (${traitValue.toFixed(2)}) will influence response`;
    } else if (traitValue <= 0.15) {
      relevanceScore = 7;
      reasoning = `Extremely low ${traitDef.subcategory} (${traitValue.toFixed(2)}) creates notable absence effect`;
    } else if (traitValue <= 0.25) {
      relevanceScore = 5;
      reasoning = `Low ${traitDef.subcategory} (${traitValue.toFixed(2)}) may influence response`;
    } else {
      relevanceScore = 3;
      reasoning = `Moderate ${traitDef.subcategory} (${traitValue.toFixed(2)}) provides minimal influence`;
    }
    
    // Add context-specific boost for topic relevance
    const topicBoost = this.getTopicRelevanceBoost(traitDef, analysisPrompt);
    if (topicBoost > 0) {
      relevanceScore = Math.min(10, relevanceScore + topicBoost);
      reasoning += ` (topic relevance +${topicBoost})`;
    }
    
    return {
      category: traitDef.category,
      subcategory: traitDef.subcategory,
      traitPath: traitDef.path,
      relevanceScore,
      reasoning
    };
  }

  private static getTopicRelevanceBoost(traitDef: any, prompt: string): number {
    const lowerPrompt = prompt.toLowerCase();
    let boost = 0;
    
    // Topic-based relevance patterns
    const relevancePatterns = {
      'Agreeableness': ['conflict', 'disagree', 'argue', 'cooperation', 'team'],
      'Neuroticism': ['stress', 'worry', 'anxiety', 'pressure', 'threat'],
      'Openness': ['creative', 'new', 'idea', 'innovation', 'art', 'culture'],
      'Conscientiousness': ['plan', 'organize', 'deadline', 'responsibility', 'detail'],
      'Extraversion': ['social', 'party', 'group', 'meeting', 'presentation'],
      'Care/Harm': ['hurt', 'suffering', 'protect', 'help', 'welfare'],
      'Fairness/Cheating': ['unfair', 'justice', 'equal', 'rights', 'deserve'],
      'Authority/Subversion': ['leader', 'boss', 'rule', 'tradition', 'hierarchy'],
      'Risk Tolerance': ['investment', 'gamble', 'safe', 'risky', 'uncertain'],
      'Loss Aversion': ['lose', 'cost', 'price', 'expensive', 'sacrifice']
    };
    
    const patterns = (relevancePatterns as any)[traitDef.subcategory] || [];
    for (const pattern of patterns) {
      if (lowerPrompt.includes(pattern)) {
        boost += 2;
      }
    }
    
    return Math.min(4, boost); // Cap the boost
  }

  private static async analyzeKnowledgeDomains(
    knowledgeDomains: any,
    analysisPrompt: string
  ): Promise<TraitRelevanceScore[]> {
    const scores: TraitRelevanceScore[] = [];
    
    if (knowledgeDomains && typeof knowledgeDomains === 'object') {
      for (const [domain, data] of Object.entries(knowledgeDomains)) {
        if (data && typeof data === 'object' && 'expertise_level' in data) {
          const expertiseLevel = data.expertise_level || 0;
          const topicRelevance = this.assessDomainRelevance(domain, analysisPrompt);
          
          if (topicRelevance > 0) {
            const relevanceScore = Math.min(10, topicRelevance + (expertiseLevel as number) * 2);
            
            scores.push({
              category: 'Knowledge Domain',
              subcategory: domain,
              traitPath: `knowledge_domains.${domain}`,
              relevanceScore,
              reasoning: `Domain expertise (${expertiseLevel}/5) with topic relevance`
            });
          }
        }
      }
    }
    
    return scores;
  }

  private static assessDomainRelevance(domain: string, prompt: string): number {
    const lowerDomain = domain.toLowerCase();
    const lowerPrompt = prompt.toLowerCase();
    
    // Direct domain mention
    if (lowerPrompt.includes(lowerDomain)) return 8;
    
    // Related keywords
    const domainKeywords = {
      'technology': ['tech', 'software', 'computer', 'digital', 'programming'],
      'politics': ['government', 'policy', 'election', 'political', 'vote'],
      'economics': ['money', 'finance', 'economic', 'market', 'business'],
      'science': ['research', 'study', 'experiment', 'scientific', 'evidence'],
      'arts': ['creative', 'design', 'aesthetic', 'artistic', 'culture']
    };
    
    const keywords = (domainKeywords as any)[lowerDomain] || [];
    for (const keyword of keywords) {
      if (lowerPrompt.includes(keyword)) return 6;
    }
    
    return 0;
  }

  private static getTraitValue(traitProfile: any, path: string): number | null {
    const parts = path.split('.');
    let value = traitProfile;
    
    for (const part of parts) {
      value = value?.[part];
      if (value === undefined || value === null) return null;
    }
    
    if (typeof value === 'number') return Math.max(0, Math.min(1, value));
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) return Math.max(0, Math.min(1, parsed));
    }
    
    return null;
  }
}