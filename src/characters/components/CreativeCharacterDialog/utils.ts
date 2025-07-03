
import { CreativeCharacterData } from './types';

export const canProceed = (currentStep: number, formData: CreativeCharacterData): boolean => {
  console.log('canProceed called with step:', currentStep, 'formData:', formData);
  
  switch (currentStep) {
    case 1:
      return formData.name.trim().length > 0;
    case 2:
      return formData.narrativeDomain.trim().length > 0;
    case 3:
      // Core Identity step - require primary ability and core purpose
      return formData.primaryAbility.trim().length > 0 && 
             formData.corePurpose.trim().length > 0;
    case 4:
      return formData.description.trim().length > 0;
    case 5:
      return formData.environment.trim().length > 0;
    default:
      return false;
  }
};
