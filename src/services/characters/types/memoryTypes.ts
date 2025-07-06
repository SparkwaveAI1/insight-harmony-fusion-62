
export interface CharacterMemory {
  id: string;
  character_id: string;
  title: string;
  content: string | null;
  file_url: string | null;
  file_type: string | null;
  file_size: number | null;
  memory_type: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface CreateMemoryData {
  character_id: string;
  title: string;
  content?: string;
  file?: File;
  memory_type?: string;
  tags?: string[];
}
