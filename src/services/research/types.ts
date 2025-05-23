
import { Database } from "@/integrations/supabase/types";

export type ResearchProject = Database["public"]["Tables"]["research_projects"]["Row"];

export type ResearchProjectInsert = Omit<
  Database["public"]["Tables"]["research_projects"]["Insert"],
  "id" | "created_at" | "updated_at"
>;

export type ResearchProjectUpdate = Partial<Omit<ResearchProjectInsert, "created_by">>;
