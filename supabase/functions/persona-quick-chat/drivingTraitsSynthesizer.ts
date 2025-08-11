import { TraitRelevanceScore } from './traitRelevanceAnalyzer.ts';

export interface DrivingTrait {
  category: string;
  subcategory: string;
  traitPath: string;
  value: number;
  relevanceScore: number;
  behavioralInfluence: string;
  interactionEffect?: string;
}

export interface DrivingTraitsProfile {
  primaryTraits: DrivingTrait[]; // Top 3-7 most relevant traits
  traitInteractions: TraitInteraction[];
  responseStrategy: string;
  emotionalTone: string;
  communicationStyle: string;
}

export interface TraitInteraction {
  trait1: string;
  trait2: string;
  interactionType: 'amplify' | 'moderate' | 'conflict' | 'compensate';
  effect: string;
}

export class DrivingTraitsSynthesizer {
  private static readonly MIN_DRIVING_TRAITS = 3;
  private static readonly MAX_DRIVING_TRAITS = 7;
  private static readonly MIN_RELEVANCE_THRESHOLD = 6;

  public static async synthesizeDrivingTraits(
    highPriorityTraits: TraitRelevanceScore[],
    traitProfile: any,
    userMessage: string
  ): Promise<DrivingTraitsProfile> {
    console.log('🎯 Synthesizing driving traits from high-priority candidates...');
    
    // Sort by relevance score and select top traits
    const sortedTraits = highPriorityTraits
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, this.MAX_DRIVING_TRAITS);
    
    // Ensure we have minimum number of traits
    if (sortedTraits.length < this.MIN_DRIVING_TRAITS) {
      console.log('⚠️ Insufficient high-priority traits, adding top-scoring traits');
      // Add more traits if needed, lowering threshold
      // This would involve going back to the full trait scan
    }
    
    // Convert to driving traits with behavioral influence
    const drivingTraits = await this.createDrivingTraits(sortedTraits, traitProfile);
    
    // Analyze trait interactions
    const traitInteractions = this.analyzeTraitInteractions(drivingTraits);
    
    // Synthesize response strategy
    const responseStrategy = this.synthesizeResponseStrategy(drivingTraits, traitInteractions, userMessage);
    
    // Determine emotional tone and communication style
    const emotionalTone = this.determineEmotionalTone(drivingTraits);
    const communicationStyle = this.determineCommunicationStyle(drivingTraits);
    
    console.log(`✅ Driving traits synthesized: ${drivingTraits.length} primary traits with ${traitInteractions.length} interactions`);
    
    return {
      primaryTraits: drivingTraits,
      traitInteractions,
      responseStrategy,
      emotionalTone,
      communicationStyle
    };
  }

  private static async createDrivingTraits(
    relevantTraits: TraitRelevanceScore[],
    traitProfile: any
  ): Promise<DrivingTrait[]> {
    const drivingTraits: DrivingTrait[] = [];
    
    for (const trait of relevantTraits) {
      const traitValue = this.getTraitValue(traitProfile, trait.traitPath);
      if (traitValue !== null) {
        const behavioralInfluence = this.describeBehavioralInfluence(
          trait.subcategory || trait.category,
          traitValue,
          trait.relevanceScore
        );
        
        drivingTraits.push({
          category: trait.category,
          subcategory: trait.subcategory || trait.category,
          traitPath: trait.traitPath,
          value: traitValue,
          relevanceScore: trait.relevanceScore,
          behavioralInfluence
        });
      }
    }
    
    return drivingTraits;
  }

  private static describeBehavioralInfluence(
    traitName: string,
    value: number,
    relevance: number
  ): string {
    const intensity = value >= 0.8 ? 'very high' : value >= 0.6 ? 'high' : 
                     value >= 0.4 ? 'moderate' : value >= 0.2 ? 'low' : 'very low';
    
    const influenceStrength = relevance >= 8 ? 'strongly' : relevance >= 6 ? 'moderately' : 'somewhat';
    
    const behaviorMappings = {
      'Openness': {
        'very high': 'embraces novel ideas and unconventional perspectives',
        'high': 'welcomes new concepts and creative solutions',
        'moderate': 'considers new ideas with some deliberation',
        'low': 'prefers familiar approaches and proven methods',
        'very low': 'strongly resists change and unconventional ideas'
      },
      'Conscientiousness': {
        'very high': 'demands precision, order, and thorough planning',
        'high': 'emphasizes organization and careful consideration',
        'moderate': 'balances structure with flexibility',
        'low': 'prefers spontaneous and flexible approaches',
        'very low': 'acts impulsively without detailed planning'
      },
      'Extraversion': {
        'very high': 'seeks social engagement and expressive communication',
        'high': 'enjoys interaction and tends toward enthusiasm',
        'moderate': 'comfortable with both social and solitary responses',
        'low': 'prefers quiet reflection and measured responses',
        'very low': 'avoids social attention and gives minimal responses'
      },
      'Agreeableness': {
        'very high': 'prioritizes harmony and avoids confrontation',
        'high': 'seeks cooperative and understanding approaches',
        'moderate': 'balances cooperation with assertiveness',
        'low': 'willing to challenge and express disagreement',
        'very low': 'readily confronts and expresses strong opposition'
      },
      'Neuroticism': {
        'very high': 'experiences intense emotional reactions and anxiety',
        'high': 'shows heightened emotional sensitivity',
        'moderate': 'has normal emotional variability',
        'low': 'maintains emotional stability under stress',
        'very low': 'remains remarkably calm and composed'
      }
    };
    
    const behavior = behaviorMappings[traitName]?.[intensity] || 
                    `exhibits ${intensity} levels of ${traitName.toLowerCase()}`;
    
    return `${influenceStrength} ${behavior}`;
  }

  private static analyzeTraitInteractions(drivingTraits: DrivingTrait[]): TraitInteraction[] {
    const interactions: TraitInteraction[] = [];
    
    // Check for key trait combinations
    for (let i = 0; i < drivingTraits.length; i++) {
      for (let j = i + 1; j < drivingTraits.length; j++) {
        const trait1 = drivingTraits[i];
        const trait2 = drivingTraits[j];
        
        const interaction = this.identifyInteraction(trait1, trait2);
        if (interaction) {
          interactions.push(interaction);
        }
      }
    }
    
    return interactions;
  }

  private static identifyInteraction(trait1: DrivingTrait, trait2: DrivingTrait): TraitInteraction | null {
    const interactions = {
      // High Agreeableness + High Neuroticism = Conflict avoidance with anxiety
      'Agreeableness_Neuroticism': (a: number, n: number) => {
        if (a >= 0.7 && n >= 0.7) {
          return {
            trait1: 'Agreeableness',
            trait2: 'Neuroticism',
            interactionType: 'conflict' as const,
            effect: 'wants to avoid conflict but becomes anxious about disagreement'
          };
        }
        return null;
      },
      
      // High Conscientiousness + Low Openness = Rigid structure
      'Conscientiousness_Openness': (c: number, o: number) => {
        if (c >= 0.7 && o <= 0.3) {
          return {
            trait1: 'Conscientiousness',
            trait2: 'Openness',
            interactionType: 'amplify' as const,
            effect: 'emphasizes established procedures and resists novel approaches'
          };
        }
        return null;
      },
      
      // High Extraversion + High Agreeableness = Social harmony seeking
      'Extraversion_Agreeableness': (e: number, a: number) => {
        if (e >= 0.6 && a >= 0.6) {
          return {
            trait1: 'Extraversion',
            trait2: 'Agreeableness',
            interactionType: 'amplify' as const,
            effect: 'actively seeks social connection and consensus-building'
          };
        }
        return null;
      },
      
      // High Neuroticism + Low Agreeableness = Emotional confrontation
      'Neuroticism_Agreeableness_Conflict': (n: number, a: number) => {
        if (n >= 0.6 && a <= 0.4) {
          return {
            trait1: 'Neuroticism',
            trait2: 'Agreeableness',
            interactionType: 'amplify' as const,
            effect: 'expresses disagreement with emotional intensity'
          };
        }
        return null;
      }
    };
    
    // Check for matching interaction patterns
    const key1 = `${trait1.subcategory}_${trait2.subcategory}`;
    const key2 = `${trait2.subcategory}_${trait1.subcategory}`;
    
    if (interactions[key1]) {
      return interactions[key1](trait1.value, trait2.value);
    }
    if (interactions[key2]) {
      return interactions[key2](trait2.value, trait1.value);
    }
    
    return null;
  }

  private static synthesizeResponseStrategy(
    drivingTraits: DrivingTrait[],
    interactions: TraitInteraction[],
    userMessage: string
  ): string {
    const strategies: string[] = [];
    
    // Primary trait strategies
    drivingTraits.forEach(trait => {
      const strategy = this.getTraitStrategy(trait, userMessage);
      if (strategy) strategies.push(strategy);
    });
    
    // Interaction modifications
    interactions.forEach(interaction => {
      strategies.push(`Consider ${interaction.effect}`);
    });
    
    return strategies.join('. ');
  }

  private static getTraitStrategy(trait: DrivingTrait, userMessage: string): string {
    const isQuestion = userMessage.includes('?');
    const isEmotional = /\b(feel|emotion|upset|angry|happy|sad|excited)\b/i.test(userMessage);
    
    const strategyMappings = {
      'Openness': trait.value >= 0.6 ? 
        'explore creative angles and novel perspectives' : 
        'focus on practical and proven approaches',
      
      'Conscientiousness': trait.value >= 0.6 ? 
        'provide structured and detailed responses' : 
        'keep responses flexible and spontaneous',
      
      'Extraversion': trait.value >= 0.6 ? 
        'engage enthusiastically and expressively' : 
        'respond thoughtfully and concisely',
      
      'Agreeableness': trait.value >= 0.6 ? 
        'seek common ground and maintain harmony' : 
        'express genuine opinions even if controversial',
      
      'Neuroticism': trait.value >= 0.6 ? 
        'acknowledge emotional aspects and potential concerns' : 
        'maintain calm and balanced perspective'
    };
    
    return strategyMappings[trait.subcategory] || '';
  }

  private static determineEmotionalTone(drivingTraits: DrivingTrait[]): string {
    const neuroticismTrait = drivingTraits.find(t => t.subcategory === 'Neuroticism');
    const agreeablenessTrait = drivingTraits.find(t => t.subcategory === 'Agreeableness');
    const extraversionTrait = drivingTraits.find(t => t.subcategory === 'Extraversion');
    
    if (neuroticismTrait?.value >= 0.7) return 'anxious and emotionally reactive';
    if (agreeablenessTrait?.value >= 0.7) return 'warm and accommodating';
    if (extraversionTrait?.value >= 0.7) return 'enthusiastic and energetic';
    if (agreeablenessTrait?.value <= 0.3) return 'direct and potentially challenging';
    
    return 'balanced and measured';
  }

  private static determineCommunicationStyle(drivingTraits: DrivingTrait[]): string {
    const styles: string[] = [];
    
    drivingTraits.forEach(trait => {
      switch (trait.subcategory) {
        case 'Conscientiousness':
          styles.push(trait.value >= 0.6 ? 'detailed and organized' : 'casual and flexible');
          break;
        case 'Extraversion':
          styles.push(trait.value >= 0.6 ? 'expressive and engaging' : 'reserved and thoughtful');
          break;
        case 'Openness':
          styles.push(trait.value >= 0.6 ? 'creative and exploratory' : 'practical and conventional');
          break;
      }
    });
    
    return styles.join(', ') || 'natural conversational style';
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