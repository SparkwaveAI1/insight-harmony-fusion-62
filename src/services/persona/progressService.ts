
export interface PersonaCreationProgress {
  step: string;
  progress: number;
  message: string;
  isComplete: boolean;
  hasError: boolean;
  errorMessage?: string;
}

export type ProgressCallback = (progress: PersonaCreationProgress) => void;

export const CREATION_STEPS = {
  VALIDATION: { step: 'validation', progress: 10, message: 'Validating your prompt...', isComplete: false },
  DEMOGRAPHICS: { step: 'demographics', progress: 30, message: 'Generating demographics and background...', isComplete: false },
  TRAITS: { step: 'traits', progress: 60, message: 'Creating personality traits and behavioral patterns...', isComplete: false },
  INTERVIEW: { step: 'interview', progress: 85, message: 'Generating interview responses...', isComplete: false },
  SAVING: { step: 'saving', progress: 95, message: 'Saving your persona...', isComplete: false },
  COMPLETE: { step: 'complete', progress: 100, message: 'Persona created successfully!', isComplete: true }
};

export const createProgressUpdate = (
  stepInfo: typeof CREATION_STEPS[keyof typeof CREATION_STEPS],
  hasError: boolean = false,
  errorMessage?: string
): PersonaCreationProgress => ({
  ...stepInfo,
  hasError,
  errorMessage
});
