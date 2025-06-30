
import { CreativeCharacterData } from './types';

export function canProceed(currentStep: number, formData: CreativeCharacterData): boolean {
  switch (currentStep) {
    case 1:
      return formData.name.trim().length > 0;
    case 2:
      return formData.entityType.trim().length > 0;
    case 3:
      return formData.narrativeDomain.trim().length > 0;
    case 4:
      return formData.functionalRole.trim().length > 0;
    case 5:
      return formData.description.trim().length >= 10;
    case 6:
      return formData.physicalAppearanceDescription.trim().length >= 10;
    case 7:
      return formData.environment.trim().length > 0;
    case 8:
      return formData.coreDrives.length > 0 && formData.surfaceTriggers.length > 0;
    default:
      return false;
  }
}
