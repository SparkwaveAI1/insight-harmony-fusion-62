
import { Persona } from '@/services/persona/types';

export interface AudienceDefinition {
  selected_personas: string[];
  demographics: {
    age_range?: string;
    income_level?: string;
    location?: string;
    occupation?: string;
  };
}

export interface DefineAudienceProps {
  onAudienceDefined: (audience: AudienceDefinition) => void;
  maxPersonas?: number;
  initialAudience?: AudienceDefinition | null;
}
