
// Standardized interface for character card data
export interface CharacterCardData {
  character_id: string;
  name: string;
  user_id: string;
  is_public: boolean;
  profile_image_url: string | null;
  created_at: string;
  // Brief description for cards only
  description: string;
  // Essential metadata for card badges
  narrative_domain?: string;
  functional_role?: string;
  entity_type?: string;
}

// Full character data extends card data
export interface FullCharacterData extends CharacterCardData {
  character_type: string;
  creation_source: string;
  creation_date: string;
  trait_profile: any;
  metadata: any;
  behavioral_modulation: any;
  interview_sections: any[];
  linguistic_profile: any;
  preinterview_tags: any[];
  simulation_directives: any;
  enhanced_metadata_version: number;
}
