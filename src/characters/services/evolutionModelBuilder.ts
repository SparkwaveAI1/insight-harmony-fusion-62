
import { CreativeCharacterData } from '../types/characterTraitTypes';

export class EvolutionModelBuilder {
  static generateEvolutionModel(data: CreativeCharacterData) {
    const evolutionConditions = [
      `Contradiction with core drive: ${data.coreDrives[0] || 'primary motivation'}`,
      `Environmental pressure from: ${data.environment}`,
      `Interaction paradox regarding: ${data.communication}`
    ];

    const adaptationStyles = {
      'adapt_preserve': 'incremental adjustment',
      'mutate_adapt': 'transformative flexibility',
      'resist_change': 'minimal accommodation'
    };

    return {
      evolution_conditions: evolutionConditions,
      trait_mutation_history: [], // Initialize empty for new characters
      contradiction_tolerance: data.changeResponseStyle === 'resist_change' ? 0.2 : 0.6,
      adaptation_style: adaptationStyles[data.changeResponseStyle as keyof typeof adaptationStyles],
      growth_rate: data.changeResponseStyle === 'mutate_adapt' ? 0.8 : 0.4,
      transformation_triggers: data.surfaceTriggers.slice(0, 3) // Use first 3 surface triggers
    };
  }
}
