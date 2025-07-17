import { CreativeCharacterData } from './types';

const domainOptions = [
  'modern', 'sci-fi', 'fantasy', 'horror', 'surreal'
];

const entityTypeOptions = [
  'human', 'non_humanoid'
];

const changeResponseOptions = [
  'mutate_adapt', 'resist_preserve', 'ignore_drift', 'seek_novelty'
];

const coreAbilities = [
  'Memory Erasure', 'Time Manipulation', 'Telepathy', 'Shape-shifting', 
  'Invisibility', 'Elemental Control', 'Precognition', 'Telekinesis',
  'Dream Walking', 'Soul Reading', 'Reality Bending', 'Phase Shifting'
];

const corePurposes = [
  'Secret Agent', 'Guardian', 'Explorer', 'Scholar', 'Protector',
  'Investigator', 'Mediator', 'Rebel', 'Teacher', 'Healer',
  'Enforcer', 'Observer', 'Creator', 'Destroyer'
];

const commonActivities = [
  'Infiltration', 'Intelligence Gathering', 'Combat Training', 'Research',
  'Meditation', 'Patrol Duties', 'Investigation', 'Teaching',
  'Healing', 'Creation', 'Exploration', 'Protection'
];

const importantKnowledgeTemplates = [
  'Knows about their abilities',
  'Aware of their organization',
  'Understands their mission',
  'Remembers their training',
  'Knows their true identity',
  'Aware of hidden threats'
];

export const handleRandomize = (
  currentStep: number, 
  formData: CreativeCharacterData, 
  setFormData: (data: CreativeCharacterData) => void
): void => {
  const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const getRandomItems = <T>(arr: T[], count: number): T[] => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  switch (currentStep) {
    case 1:
      setFormData({
        ...formData,
        name: `Random Name ${Math.floor(Math.random() * 100)}`
      });
      break;
      
    case 2:
      setFormData({
        ...formData,
        narrativeDomain: getRandomItem(domainOptions),
        entityType: getRandomItem(entityTypeOptions)
      });
      break;
      
    case 3:
      // Core Identity randomization
      setFormData({
        ...formData,
        primaryAbility: getRandomItem(coreAbilities),
        corePurpose: getRandomItem(corePurposes),
        keyActivities: getRandomItems(commonActivities, Math.floor(Math.random() * 3) + 2),
        importantKnowledge: getRandomItems(importantKnowledgeTemplates, Math.floor(Math.random() * 2) + 2)
      });
      break;
      
    case 4:
      setFormData({
        ...formData,
        description: `A ${getRandomItem(domainOptions)} character with a unique background.`
      });
      break;
      
    case 5:
      setFormData({
        ...formData,
        environment: `A ${getRandomItem(domainOptions)} setting.`
      });
      break;
  }
};
