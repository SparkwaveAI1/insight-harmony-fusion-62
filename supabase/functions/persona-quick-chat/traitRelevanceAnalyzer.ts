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

export class TraitRelevanceAnalyzer {
  private static TRAIT_PATHS = [
    // Big Five
    { category: 'Big Five', path: 'big_five.openness', subcategory: 'Openness' },
    { category: 'Big Five', path: 'big_five.conscientiousness', subcategory: 'Conscientiousness' },
    { category: 'Big Five', path: 'big_five.extraversion', subcategory: 'Extraversion' },
    { category: 'Big Five', path: 'big_five.agreeableness', subcategory: 'Agreeableness' },
    { category: 'Big Five', path: 'big_five.neuroticism', subcategory: 'Neuroticism' },
    
    // Moral Foundations
    { category: 'Moral Foundations', path: 'moral_foundations.care_harm', subcategory: 'Care/Harm' },
    { category: 'Moral Foundations', path: 'moral_foundations.fairness_cheating', subcategory: 'Fairness/Cheating' },
    { category: 'Moral Foundations', path: 'moral_foundations.loyalty_betrayal', subcategory: 'Loyalty/Betrayal' },
    { category: 'Moral Foundations', path: 'moral_foundations.authority_subversion', subcategory: 'Authority/Subversion' },
    { category: 'Moral Foundations', path: 'moral_foundations.sanctity_degradation', subcategory: 'Sanctity/Degradation' },
    { category: 'Moral Foundations', path: 'moral_foundations.liberty_oppression', subcategory: 'Liberty/Oppression' },
    
    // World Values Survey
    { category: 'World Values', path: 'world_values.traditional_secular_rational', subcategory: 'Traditional vs Secular-Rational' },
    { category: 'World Values', path: 'world_values.survival_self_expression', subcategory: 'Survival vs Self-Expression' },
    
    // Political Compass
    { category: 'Political Compass', path: 'political_compass.economic_left_right', subcategory: 'Economic Left-Right' },
    { category: 'Political Compass', path: 'political_compass.social_libertarian_authoritarian', subcategory: 'Social Libertarian-Authoritarian' },
    
    // Behavioral Economics
    { category: 'Behavioral Economics', path: 'behavioral_economics.risk_tolerance', subcategory: 'Risk Tolerance' },
    { category: 'Behavioral Economics', path: 'behavioral_economics.time_preference', subcategory: 'Time Preference' },
    { category: 'Behavioral Economics', path: 'behavioral_economics.loss_aversion', subcategory: 'Loss Aversion' },
    { category: 'Behavioral Economics', path: 'behavioral_economics.social_proof_susceptibility', subcategory: 'Social Proof' },
    
    // Cultural Dimensions
    { category: 'Cultural Dimensions', path: 'cultural_dimensions.individualism_collectivism', subcategory: 'Individualism/Collectivism' },
    { category: 'Cultural Dimensions', path: 'cultural_dimensions.power_distance', subcategory: 'Power Distance' },
    { category: 'Cultural Dimensions', path: 'cultural_dimensions.uncertainty_avoidance', subcategory: 'Uncertainty Avoidance' },
    { category: 'Cultural Dimensions', path: 'cultural_dimensions.masculinity_femininity', subcategory: 'Masculinity/Femininity' },
    { category: 'Cultural Dimensions', path: 'cultural_dimensions.long_short_term_orientation', subcategory: 'Long/Short Term Orientation' },
    
    // Social Identity
    { category: 'Social Identity', path: 'social_identity.in_group_loyalty', subcategory: 'In-group Loyalty' },
    { category: 'Social Identity', path: 'social_identity.social_dominance_orientation', subcategory: 'Social Dominance' },
    { category: 'Social Identity', path: 'social_identity.system_justification', subcategory: 'System Justification' },
    
    // Extended Traits (Key ones)
    { category: 'Extended Traits', path: 'truth_orientation', subcategory: 'Truth Orientation' },
    { category: 'Extended Traits', path: 'self_awareness', subcategory: 'Self Awareness' },
    { category: 'Extended Traits', path: 'manipulativeness', subcategory: 'Manipulativeness' },
    { category: 'Extended Traits', path: 'emotional_regulation', subcategory: 'Emotional Regulation' },
    { category: 'Extended Traits', path: 'social_adaptability', subcategory: 'Social Adaptability' },
    { category: 'Extended Traits', path: 'intellectual_humility', subcategory: 'Intellectual Humility' },
    { category: 'Extended Traits', path: 'conflict_resolution_style', subcategory: 'Conflict Resolution' },
    
    // Dynamic State Modifiers
    { category: 'Dynamic State', path: 'stress_level', subcategory: 'Stress Level' },
    { category: 'Dynamic State', path: 'emotional_stability', subcategory: 'Emotional Stability' },
    { category: 'Dynamic State', path: 'trigger_threshold', subcategory: 'Trigger Threshold' }
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
    
    // Filter high priority traits (score >= 6)
    const highPriorityTraits = scores.filter(score => score.relevanceScore >= 6);
    
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
    // For now, use heuristic scoring based on trait type and value
    // In production, this could call an AI service for more sophisticated analysis
    
    let baseRelevance = 3; // Default low relevance
    let reasoning = `${traitDef.subcategory} shows moderate expression`;
    
    // Extreme values (very high/low) are more likely to be relevant
    if (traitValue >= 0.8 || traitValue <= 0.2) {
      baseRelevance += 2;
      reasoning = `${traitDef.subcategory} shows extreme ${traitValue >= 0.8 ? 'high' : 'low'} expression`;
    }
    
    // Add topic-specific relevance heuristics
    const relevanceBoost = this.getTopicRelevanceBoost(traitDef, analysisPrompt);
    const finalScore = Math.min(10, baseRelevance + relevanceBoost);
    
    return {
      category: traitDef.category,
      subcategory: traitDef.subcategory,
      traitPath: traitDef.path,
      relevanceScore: finalScore,
      reasoning: reasoning + (relevanceBoost > 0 ? ` (topic relevance +${relevanceBoost})` : '')
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
    
    const patterns = relevancePatterns[traitDef.subcategory] || [];
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
            const relevanceScore = Math.min(10, topicRelevance + expertiseLevel * 2);
            
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
    
    const keywords = domainKeywords[lowerDomain] || [];
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