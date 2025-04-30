
import { supabase } from "@/integrations/supabase/client";

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CollectionWithPersonaCount extends Collection {
  persona_count: number;
}
