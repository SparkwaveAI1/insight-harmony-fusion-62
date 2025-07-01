
import { CreativeCharacterData } from '../types/characterTraitTypes';

export class AppearanceModelBuilder {
  static generateAppearanceDescription(data: CreativeCharacterData): string {
    const domainModifiers = {
      'sci-fi': 'with technological augmentations and energy emanations',
      'fantasy': 'with mystical auras and arcane symbols',
      'horror': 'with unsettling features and shadow distortions',
      'mystery': 'with subtle enigmatic qualities and hidden depths',
      'default': 'with distinctive characteristic features'
    };

    const entityDescriptors = {
      'human': 'humanoid figure',
      'animal': 'creature form',
      'plant': 'botanical entity',
      'energy': 'energy manifestation',
      'hybrid': 'hybrid being',
      'other': 'unique entity'
    };

    const domain = data.narrativeDomain.toLowerCase();
    const modifier = domainModifiers[domain as keyof typeof domainModifiers] || domainModifiers.default;
    const descriptor = entityDescriptors[data.entityType as keyof typeof entityDescriptors] || entityDescriptors.other;

    let description = `${data.name} appears as a ${descriptor} ${modifier}.`;
    
    if (data.physicalForm) {
      description += ` ${data.physicalForm}.`;
    }
    
    if (data.environment) {
      description += ` Naturally found in ${data.environment}, their presence harmonizes with this environment.`;
    }

    if (data.communication) {
      description += ` They communicate through ${data.communication}, which influences their physical manifestation.`;
    }

    return description;
  }

  static generateAppearanceModel(data: CreativeCharacterData) {
    const visualThemes = {
      'sci-fi': 'technological-futuristic',
      'fantasy': 'mystical-arcane',
      'horror': 'dark-unsettling',
      'mystery': 'enigmatic-subtle'
    };

    const aestheticClasses = {
      'human': 'anthropomorphic',
      'animal': 'zoomorphic',
      'plant': 'botanical',
      'energy': 'ethereal',
      'hybrid': 'chimeric',
      'other': 'abstract'
    };

    return {
      appearance_description: this.generateAppearanceDescription(data),
      aesthetic_class: aestheticClasses[data.entityType as keyof typeof aestheticClasses] || 'abstract',
      visual_theme: visualThemes[data.narrativeDomain.toLowerCase() as keyof typeof visualThemes] || 'naturalistic',
      signature_features: this.generateSignatureFeatures(data)
    };
  }

  static generateSignatureFeatures(data: CreativeCharacterData): string[] {
    const features = [];
    
    if (data.coreDrives.length > 0) {
      features.push(`Motivation-driven: ${data.coreDrives[0]} manifestation`);
    }
    
    if (data.physicalForm) {
      features.push(`Physical trait: ${data.physicalForm}`);
    }
    
    if (data.communication !== 'speech') {
      features.push(`Communication method: ${data.communication}`);
    }

    return features.slice(0, 3); // Limit to top 3 signature features
  }
}
