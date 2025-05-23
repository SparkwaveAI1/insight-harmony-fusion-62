
// Import the properly defined Database type from the Supabase types file
import type { Json, Database } from "@/integrations/supabase/types";

// Define proper types for our research projects and media
export type ResearchProject = {
  id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string | null;
  instructions: string | null;
  persona_ids: string[];
  collection_ids: string[];
  media_ids: string[];
  session_ids: string[];
};

export type ResearchProjectInsert = Omit<
  ResearchProject,
  "id" | "created_at" | "updated_at"
>;

export type ResearchProjectUpdate = Partial<Omit<ResearchProjectInsert, "created_by">>;

export type ResearchMedia = {
  id: string;
  user_id: string;
  project_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  file_url: string;
  original_name: string;
  created_at: string;
  updated_at: string;
  is_processed: boolean | null;
  text_content: string | null;
  metadata: Json | null;
};

export type ResearchMediaInsert = Omit<
  ResearchMedia,
  "id" | "created_at" | "updated_at"
>;

export type ResearchMediaUpdate = Partial<Omit<ResearchMediaInsert, "user_id">>;
