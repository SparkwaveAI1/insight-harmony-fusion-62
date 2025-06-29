
import { CreativeCharacterData } from './types';
import { narrativeDomains } from './constants';

export const canProceed = (currentStep: number, formData: CreativeCharacterData): boolean => {
  console.log('canProceed called for step:', currentStep);
  switch (currentStep) {
    case 1: 
      const step1Valid = formData.name.trim() !== '';
      console.log('Step 1 valid:', step1Valid, 'name:', formData.name);
      return step1Valid;
    case 2: 
      const step2Valid = formData.entityType !== '';
      console.log('Step 2 valid:', step2Valid, 'entityType:', formData.entityType);
      return step2Valid;
    case 3: 
      const step3Valid = formData.narrativeDomain !== '';
      console.log('Step 3 valid:', step3Valid, 'narrativeDomain:', formData.narrativeDomain);
      return step3Valid;
    case 4: 
      console.log('Step 4 valid: true (optional step)');
      return true; // Optional step
    case 5: 
      const step5Valid = formData.description.length >= 50;
      console.log('Step 5 valid:', step5Valid, 'description length:', formData.description.length);
      return step5Valid;
    case 6: 
      const step6Valid = formData.environment.trim() !== '';
      console.log('Step 6 valid:', step6Valid, 'environment:', formData.environment);
      return step6Valid;
    case 7: 
      const step7Valid = formData.coreDrives.length > 0;
      console.log('Step 7 valid:', step7Valid, 'coreDrives length:', formData.coreDrives.length);
      return step7Valid;
    case 8: 
      const step8Valid = formData.changeResponseStyle !== '';
      console.log('Step 8 valid:', step8Valid, 'changeResponseStyle:', formData.changeResponseStyle);
      return step8Valid;
    default: 
      console.log('Unknown step:', currentStep);
      return false;
  }
};

export const compileForHistoricalCreator = (data: CreativeCharacterData): string => {
  return `Creative Character Genesis - ${data.name}

${data.description}

Character Context:
- Name: ${data.name}
- Entity Type: ${data.entityType}
- Narrative Domain: ${data.narrativeDomain}
- Functional Role: ${data.functionalRole || 'Undefined'}
- Environment: ${data.environment}
- Core Drives: ${data.coreDrives.join(', ')}
- Surface Triggers: ${data.surfaceTriggers.join(', ')}
- Change Response: ${data.changeResponseStyle}
- Source: Creative Character Genesis

This character was created through the Creative Character Genesis process.`;
};
