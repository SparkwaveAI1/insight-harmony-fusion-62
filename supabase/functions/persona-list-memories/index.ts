// deno-lint-ignore-file no-explicit-any
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
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20"), 100);
  const cursor = url.searchParams.get("cursor"); // "<iso>|<id>"
  const type = url.searchParams.get("type");     // optional
  const tag = url.searchParams.get("tag");       // optional
  const includeGlobal = (url.searchParams.get("include_global") ?? "true") === "true";

  console.log(`[MEMORIES] Fetching memories for persona: ${personaId}, limit: ${limit}, cursor: ${cursor}`);

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

  // parse cursor
  let cursorIso: string | null = null;
  let cursorId: string | null = null;
  if (cursor && cursor.includes("|")) {
    [cursorIso, cursorId] = cursor.split("|");
  }

  // persona memories
  let q = supabase
    .from("persona_memories")
    .select("id, persona_id, type, title, content, tags, created_at")
    .eq("persona_id", personaId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit);

  if (type) q = q.eq("type", type);
  if (tag) q = q.contains("tags", [tag]);
  if (cursorIso && cursorId) {
    // (created_at < cursorIso) OR (created_at = cursorIso AND id < cursorId)
    q = q.or(`created_at.lt.${cursorIso},and(created_at.eq.${cursorIso},id.lt.${cursorId})`);
  }

  const { data: own, error } = await q;
  if (error) {
    console.error("[MEMORIES] list error", error);
    return new Response(JSON.stringify({ error: "query_failed" }), { 
      status: 500, 
      headers: { ...cors, "Content-Type": "application/json" } 
    });
  }

  let merged: any[] = own ?? [];

  // virtual merge globals (no RLS write; read only)
  if (includeGlobal) {
    let gq = supabase
      .from("global_memories")
      .select("id, type, title, content, tags, created_at")
      .order("created_at", { ascending: false })
      .limit(Math.max(10, Math.min(100, limit)));

    if (type && type !== "global") {
      // if a specific persona type is requested (not 'global'), still allow globals
    }
    if (tag) gq = gq.contains("tags", [tag]);

    const { data: globals } = await gq;
    const mapped = (globals ?? []).map((g) => ({
      id: `global_${g.id}`,
      persona_id: personaId,
      type: "global",
      title: g.title,
      content: { ...g.content, ref: g.id },
      tags: g.tags,
      created_at: g.created_at,
    }));
    merged = [...merged, ...mapped];
  }

  // stable sort + page cut
  merged.sort((a, b) => {
    const d = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return d !== 0 ? d : String(b.id).localeCompare(String(a.id));
  });

  const limited = merged.slice(0, limit);
  const hasMore = merged.length > limit;
  const next = hasMore ? `${limited[limited.length - 1].created_at}|${limited[limited.length - 1].id}` : null;

  console.log(`[MEMORIES] Returning ${limited.length} memories, hasMore: ${hasMore}`);

  return new Response(JSON.stringify({ data: limited, next_cursor: next, has_more: hasMore }), {
    headers: { ...cors, "Content-Type": "application/json" },
  });
});