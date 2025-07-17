
import { CreativeCharacterData } from '../types/characterTraitTypes';

export class ConstraintModelBuilder {
  static generateConstraintModel(data: CreativeCharacterData) {
    const constraintStyles = {
      'adapt_preserve': {
        enforcement_style: 'gentle guidance',
        deviation_tolerance: 0.7,
        constraint_type: 'soft' as const
      },
      'mutate_adapt': {
        enforcement_style: 'flexible boundaries',
        deviation_tolerance: 0.8,
        constraint_type: 'adaptive' as const
      },
      'resist_change': {
        enforcement_style: 'rigid adherence',
        deviation_tolerance: 0.3,
        constraint_type: 'hard' as const
      }
    };

    const baseConstraints = constraintStyles[data.changeResponseStyle as keyof typeof constraintStyles] || constraintStyles.mutate_adapt;
    
    // Generate contextual forbidden behaviors based on narrative domain
    const forbiddenBehaviors = this.generateForbiddenBehaviors(data.narrativeDomain, data.entityType);
    const requiredRituals = this.generateRequiredRituals(data.narrativeDomain, data.coreDrives);

    return {
      ...baseConstraints,
      forbidden_behaviors: forbiddenBehaviors,
      required_rituals: requiredRituals
    };
  }

  static generateForbiddenBehaviors(narrativeDomain: string, entityType: string): string[] {
    const domainBehaviors = {
      'sci-fi': ['violating technological protocols', 'ignoring data integrity'],
      'fantasy': ['breaking magical laws', 'desecrating sacred spaces'],
      'horror': ['revealing hidden truths prematurely', 'showing vulnerability openly'],
      'mystery': ['solving puzzles too quickly', 'revealing all knowledge at once']
    };

    const entityBehaviors = {
      'human': ['acting purely on instinct', 'ignoring social context'],
      'animal': ['complex abstract reasoning', 'sophisticated tool use'],
      'plant': ['rapid movement', 'aggressive behavior'],
      'energy': ['maintaining fixed form', 'material attachment'],
      'other': ['following conventional patterns', 'predictable responses']
    };

    const domain = narrativeDomain.toLowerCase();
    const forbidden = [
      ...(domainBehaviors[domain as keyof typeof domainBehaviors] || []),
      ...(entityBehaviors[entityType as keyof typeof entityBehaviors] || [])
    ];

    return forbidden.slice(0, 4); // Limit to top 4 forbidden behaviors
  }

  static generateRequiredRituals(narrativeDomain: string, coreDrives: string[]): string[] {
    const domainRituals = {
      'sci-fi': ['data verification protocols', 'system status checks'],
      'fantasy': ['daily attunement practices', 'elemental acknowledgments'],
      'horror': ['protective ward maintenance', 'fear assessment rituals'],
      'mystery': ['evidence cataloging', 'pattern verification checks']
    };

    const driveRituals = coreDrives.map(drive => 
      `${drive.toLowerCase().replace(/\s+/g, '_')}_affirmation_practice`
    );

    const domain = narrativeDomain.toLowerCase();
    const rituals = [
      ...(domainRituals[domain as keyof typeof domainRituals] || ['daily_existence_acknowledgment']),
      ...driveRituals.slice(0, 2) // Limit drive rituals
    ];

    return rituals.slice(0, 4); // Limit to top 4 required rituals
  }
}
