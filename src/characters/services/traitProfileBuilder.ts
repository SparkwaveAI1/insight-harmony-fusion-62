
import { CreativeCharacterData, CharacterTraitProfile } from '../types/characterTraitTypes';
import { CognitiveModelBuilder } from './cognitiveModelBuilder';
import { ConstraintModelBuilder } from './constraintModelBuilder';
import { EvolutionModelBuilder } from './evolutionModelBuilder';
import { AppearanceModelBuilder } from './appearanceModelBuilder';

export class TraitProfileBuilder {
  static buildEnhancedTraitProfile(data: CreativeCharacterData): CharacterTraitProfile {
    return {
      // Core identity
      entity_type: data.entityType,
      narrative_domain: data.narrativeDomain,
      functional_role: data.functionalRole,
      description: data.description,
      
      // Creative character traits
      core_drives: data.coreDrives,
      surface_triggers: data.surfaceTriggers,
      change_response_style: data.changeResponseStyle,
      
      // Enhanced Character Lab systems
      cognition_model: CognitiveModelBuilder.generateCognitiveModel(data),
      constraint_model: ConstraintModelBuilder.generateConstraintModel(data),
      evolution_model: EvolutionModelBuilder.generateEvolutionModel(data),
      appearance_model: AppearanceModelBuilder.generateAppearanceModel(data),
      
      // Physical characteristics
      physical_form: data.physicalForm,
      environment: data.environment,
      communication_method: data.communication,
      
      // Auto-generated personality summary
      personality_summary: this.generatePersonalitySummary(data)
    };
  }

  static generatePersonalitySummary(data: CreativeCharacterData): string {
    const driveText = data.coreDrives.length > 0 ? data.coreDrives[0] : 'existence';
    const responseText = data.changeResponseStyle.replace('_', ' ');
    const entityText = data.entityType === 'other' ? 'unique entity' : data.entityType;
    
    return `An ${entityText} of ${data.narrativeDomain.toLowerCase()}, driven by ${driveText}, with a tendency to ${responseText} when faced with change. Exists within ${data.environment} and manifests through ${data.communication}.`;
  }
}
