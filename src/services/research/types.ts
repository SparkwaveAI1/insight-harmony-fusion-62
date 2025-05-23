
import type { Json, Database as SupabaseDatabase } from "@/integrations/supabase/types";

// Use the properly imported Database type
export type ResearchProject = SupabaseDatabase["public"]["Tables"]["research_projects"]["Row"];

export type ResearchProjectInsert = Omit<
  SupabaseDatabase["public"]["Tables"]["research_projects"]["Insert"],
  "id" | "created_at" | "updated_at"
>;

export type ResearchProjectUpdate = Partial<Omit<ResearchProjectInsert, "created_by">>;

export type ResearchMedia = SupabaseDatabase["public"]["Tables"]["research_media"]["Row"];

export type ResearchMediaInsert = Omit<
  SupabaseDatabase["public"]["Tables"]["research_media"]["Insert"],
  "id" | "created_at" | "updated_at"
>;

export type ResearchMediaUpdate = Partial<Omit<ResearchMediaInsert, "user_id">>;
