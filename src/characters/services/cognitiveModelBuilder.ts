
import { CreativeCharacterData } from '../types/characterTraitTypes';

export class CognitiveModelBuilder {
  static generateCognitiveModel(data: CreativeCharacterData) {
    const cognitivePatterns = {
      'sci-fi': {
        temporal_perception: 'quantum-parallel processing',
        pattern_preference: 'algorithmic cascade detection',
        cognitive_form: 'data-stream synthesis'
      },
      'fantasy': {
        temporal_perception: 'cyclical-seasonal awareness',
        pattern_preference: 'mystical resonance tracking',
        cognitive_form: 'intuitive essence reading'
      },
      'horror': {
        temporal_perception: 'fragmented memory layering',
        pattern_preference: 'threat-anticipation focus',
        cognitive_form: 'survival instinct override'
      },
      'mystery': {
        temporal_perception: 'sequential detail cataloging',
        pattern_preference: 'anomaly detection emphasis',
        cognitive_form: 'deductive reasoning chains'
      },
      'default': {
        temporal_perception: 'present-moment anchoring',
        pattern_preference: 'contextual relationship mapping',
        cognitive_form: 'adaptive pattern synthesis'
      }
    };

    const domain = data.narrativeDomain.toLowerCase();
    const baseModel = cognitivePatterns[domain as keyof typeof cognitivePatterns] || cognitivePatterns.default;
    
    return {
      ...baseModel,
      processing_speed: data.entityType === 'human' ? 'biological standard' : 'entity-specific variable',
      memory_architecture: data.changeResponseStyle === 'adapt_preserve' ? 'layered preservation' : 'dynamic restructuring'
    };
  }
}
