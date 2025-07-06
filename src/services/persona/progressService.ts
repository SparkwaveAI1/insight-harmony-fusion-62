
export enum CREATION_STEPS {
  VALIDATION = 'validation',
  DEMOGRAPHICS = 'demographics',
  TRAITS = 'traits',
  INTERVIEW = 'interview',
  DESCRIPTION = 'description', // Add description step
  SAVING = 'saving',
  COMPLETE = 'complete'
}

export interface PersonaCreationProgress {
  step: CREATION_STEPS;
  progress: number;
  message: string;
  isComplete: boolean;
  hasError: boolean;
  errorMessage?: string;
}

export type ProgressCallback = (progress: PersonaCreationProgress) => void;

export const createProgressUpdate = (
  step: CREATION_STEPS, 
  hasError: boolean = false, 
  errorMessage?: string
): PersonaCreationProgress => {
  const stepMessages = {
    [CREATION_STEPS.VALIDATION]: 'Validating input and preparing generation...',
    [CREATION_STEPS.DEMOGRAPHICS]: 'Generating core demographics and personality...',
    [CREATION_STEPS.TRAITS]: 'Creating detailed trait profiles and behaviors...',
    [CREATION_STEPS.INTERVIEW]: 'Generating interview responses...',
    [CREATION_STEPS.DESCRIPTION]: 'Creating persona description...',
    [CREATION_STEPS.SAVING]: 'Saving persona to database...',
    [CREATION_STEPS.COMPLETE]: 'Persona created successfully!'
  };

  const stepProgress = {
    [CREATION_STEPS.VALIDATION]: 10,
    [CREATION_STEPS.DEMOGRAPHICS]: 30,
    [CREATION_STEPS.TRAITS]: 60,
    [CREATION_STEPS.INTERVIEW]: 80,
    [CREATION_STEPS.DESCRIPTION]: 90,
    [CREATION_STEPS.SAVING]: 95,
    [CREATION_STEPS.COMPLETE]: 100
  };

  return {
    step,
    progress: stepProgress[step],
    message: hasError ? (errorMessage || 'An error occurred') : stepMessages[step],
    isComplete: step === CREATION_STEPS.COMPLETE && !hasError,
    hasError,
    errorMessage: hasError ? errorMessage : undefined
  };
};
