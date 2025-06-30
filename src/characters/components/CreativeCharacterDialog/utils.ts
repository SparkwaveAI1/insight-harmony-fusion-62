
import { CreativeCharacterData } from './types';

export const canProceed = (step: number, formData: CreativeCharacterData): boolean => {
  console.log('canProceed called for step:', step);
  
  switch (step) {
    case 1:
      const step1Valid = formData.name.trim().length > 0;
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
      // Step 4 is optional, always valid
      console.log('Step 4 valid: true (optional)');
      return true;
    case 5:
      const step5Valid = formData.description.trim().length >= 50;
      console.log('Step 5 valid:', step5Valid, 'description length:', formData.description.length);
      return step5Valid;
    case 6:
      const step6Valid = formData.environment.trim().length > 0;
      console.log('Step 6 valid:', step6Valid, 'environment:', formData.environment);
      return step6Valid;
    case 7:
      const step7Valid = formData.coreDrives.length > 0 && formData.surfaceTriggers.length > 0;
      console.log('Step 7 valid:', step7Valid, 'coreDrives length:', formData.coreDrives.length, 'surfaceTriggers length:', formData.surfaceTriggers.length);
      return step7Valid;
    default:
      console.log('Unknown step in canProceed:', step);
      return false;
  }
};

export const compileForHistoricalCreator = (data: CreativeCharacterData): string => {
  const drives = data.coreDrives.length > 0 ? `Core drives: ${data.coreDrives.join(', ')}. ` : '';
  const triggers = data.surfaceTriggers.length > 0 ? `Surface triggers: ${data.surfaceTriggers.join(', ')}. ` : '';
  const role = data.functionalRole ? `Role: ${data.functionalRole}. ` : '';
  
  return `${data.description} ${drives}${triggers}${role}Environment: ${data.environment}`.trim();
};
