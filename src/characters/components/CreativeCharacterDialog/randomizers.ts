
import { CreativeCharacterData } from './types';
import { narrativeDomains, functionalRoles, coreDriveOptions, surfaceTriggerOptions, changeResponseStyles } from './constants';

export const handleRandomize = (currentStep: number, formData: CreativeCharacterData, setFormData: (data: CreativeCharacterData) => void) => {
  switch (currentStep) {
    case 1:
      const randomNames = ['Zephyr', 'Axiom', 'Vex', 'Quill', 'Ember', 'Drift', 'Pulse', 'Void', 'Echo', 'Flux'];
      setFormData({ ...formData, name: randomNames[Math.floor(Math.random() * randomNames.length)] });
      break;
    case 2:
      setFormData({ ...formData, entityType: Math.random() > 0.5 ? 'human' : 'non-humanoid' });
      break;
    case 3:
      const randomDomain = narrativeDomains[Math.floor(Math.random() * narrativeDomains.length)];
      setFormData({ ...formData, narrativeDomain: randomDomain.id });
      break;
    case 4:
      const randomRole = functionalRoles[Math.floor(Math.random() * functionalRoles.length)];
      setFormData({ ...formData, functionalRole: randomRole });
      break;
    case 6:
      const randomEnvironment = formData.narrativeDomain === 'sci-fi' 
        ? 'Quantum processing networks beneath Europa\'s ice'
        : formData.narrativeDomain === 'fantasy'
        ? 'Ancient grove where moonlight pools into silver memory'
        : 'Liminal space between waking and dreaming';
      setFormData({ ...formData, environment: randomEnvironment });
      break;
    case 7:
      const randomDrives = coreDriveOptions
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      const randomTriggers = surfaceTriggerOptions
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);
      setFormData({ ...formData, coreDrives: randomDrives, surfaceTriggers: randomTriggers });
      break;
    case 8:
      const randomResponse = changeResponseStyles[Math.floor(Math.random() * changeResponseStyles.length)];
      setFormData({ ...formData, changeResponseStyle: randomResponse.id });
      break;
  }
};
