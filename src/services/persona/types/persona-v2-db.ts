import { PersonaV2 } from '../../../types/persona-v2';
import { VoicepackRuntime } from '../../../types/voicepack';

export interface DbPersonaV2 {
  id: string;
  persona_id: string;
  user_id: string;
  name: string;
  description: string | null;
  persona_data: PersonaV2;
  persona_type: string;
  is_public: boolean;
  profile_image_url: string | null;
  voicepack_runtime: VoicepackRuntime | null;
  voicepack_hash: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePersonaV2Request {
  persona_id: string;
  name: string;
  description?: string;
  persona_data: PersonaV2;
  persona_type?: string;
  is_public?: boolean;
  profile_image_url?: string;
}

export interface UpdatePersonaV2Request {
  name?: string;
  description?: string;
  persona_data?: PersonaV2;
  is_public?: boolean;
  profile_image_url?: string;
  voicepack_runtime?: VoicepackRuntime;
  voicepack_hash?: string;
}