import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "authorization,content-type",
  "Vary": "Origin",
  "Cache-Control": "no-store",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const url = new URL(req.url);
  const personaId = url.searchParams.get("persona_id");
  
  console.log(`[COLLECTIONS] Fetching collections for persona: ${personaId}`);
  
  if (!personaId) {
    return new Response(JSON.stringify({ error: "persona_id required" }), { 
      status: 400, 
      headers: { ...cors, "Content-Type": "application/json" } 
    });
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      global: { headers: { authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );

  const { data, error } = await supabase
    .from("collection_personas")
    .select("added_at, collections(id, name, description, created_at)")
    .eq("persona_id", personaId)
    .order("added_at", { ascending: false });

  if (error) {
    console.error("[COLLECTIONS] list error", error);
    return new Response(JSON.stringify({ error: "query_failed" }), { 
      status: 500, 
      headers: { ...cors, "Content-Type": "application/json" } 
    });
  }

  const mapped = (data ?? []).map((r) => r.collections).filter(Boolean);
  
  console.log(`[COLLECTIONS] Returning ${mapped.length} collections`);
  
  return new Response(JSON.stringify({ data: mapped }), { 
    headers: { ...cors, "Content-Type": "application/json" } 
  });
});