
import { InterviewSection } from './interview';

export interface DbPersona {
  id: string;
  persona_id: string;
  name: string;
  description: string | null;
  user_id: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  profile_image_url?: string;
  prompt?: string;
  version?: string;
  
  // V3 structure - primary data storage
  persona_data: any;
}
