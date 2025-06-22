
// Character type definitions - completely separate from persona types
export interface Character {
  id: string;
  name: string;
  description?: string;
  backstory?: string;
  personality_traits?: string[];
  appearance?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface CharacterFilters {
  search?: string;
  sortBy?: 'name' | 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
}
