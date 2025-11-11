import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";
import { applyCursor, parseCursor } from "../_shared/pagination.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,GET,OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Vary": "Origin",
  "Cache-Control": "no-store",
};

const PAGE_SIZE = 20;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  // Support both POST body and GET params
  let type = "user";
  let cursorParam: string | null = null;

  if (req.method === "POST") {
    try {
      const body = await req.json();
      type = body.type || "user";
      cursorParam = body.cursor || null;
    } catch {
      // Invalid JSON, continue with defaults
    }
  } else {
    const url = new URL(req.url);
    type = url.searchParams.get("type") || "user";
    cursorParam = url.searchParams.get("cursor");
  }
  
  console.log(`[COLLECTIONS] Fetching ${type} collections, cursor:`, cursorParam || "none");

  const authHeader = req.headers.get("authorization") ?? "";
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      global: { headers: { authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );

  try {
    const cursor = parseCursor(cursorParam);
    
    // Get user ID for user collections
    let userId: string | null = null;
    if (type === "user") {
      // Extract token properly - handle both "Bearer " prefix and raw token
      const token = authHeader.startsWith("Bearer ") 
        ? authHeader.slice(7).trim() 
        : authHeader.trim();
        
      if (!token) {
        console.warn("[COLLECTIONS] No auth token provided for user request");
        return new Response(JSON.stringify({ error: "unauthorized", message: "No auth token" }), { 
          status: 401, 
          headers: { ...cors, "Content-Type": "application/json" } 
        });
      }
      
      // Pass token explicitly to getUser
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      
      if (userError) {
        console.error("[COLLECTIONS] getUser error:", userError);
        return new Response(JSON.stringify({ error: "unauthorized", message: userError.message }), { 
          status: 401, 
          headers: { ...cors, "Content-Type": "application/json" } 
        });
      }
      
      if (!user) {
        console.error("[COLLECTIONS] No user found for token");
        return new Response(JSON.stringify({ error: "unauthorized", message: "Invalid token" }), { 
          status: 401, 
          headers: { ...cors, "Content-Type": "application/json" } 
        });
      }
      
      userId = user.id;
      console.log(`[COLLECTIONS] Authenticated user: ${userId}`);
    }

    // Build query
    let query = supabase
      .from("collections")
      .select("id, name, description, is_public, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(PAGE_SIZE + 1);

    // Apply filters
    if (type === "user" && userId) {
      query = query.eq("user_id", userId);
    } else if (type === "public") {
      query = query.eq("is_public", true);
    }

    // Apply cursor pagination
    query = applyCursor(query, {
      cursor,
      createdCol: "updated_at",
      idCol: "id",
    });

    const { data, error } = await query;

    if (error) {
      console.error("[COLLECTIONS] query error", error);
      return new Response(JSON.stringify({ error: "query_failed" }), { 
        status: 500, 
        headers: { ...cors, "Content-Type": "application/json" } 
      });
    }

    const hasMore = data.length > PAGE_SIZE;
    const collections = hasMore ? data.slice(0, PAGE_SIZE) : data;

    // Get persona counts for each collection
    const collectionsWithCounts = await Promise.all(
      collections.map(async (collection) => {
        const { count } = await supabase
          .from("collection_personas")
          .select("*", { count: "exact", head: true })
          .eq("collection_id", collection.id);

        return {
          ...collection,
          persona_count: count || 0,
        };
      })
    );

    let nextCursor: string | null = null;
    if (hasMore) {
      const last = collections[collections.length - 1];
      nextCursor = `${last.updated_at}|${last.id}`;
    }

    console.log(`[COLLECTIONS] Returning ${collectionsWithCounts.length} collections, hasMore: ${hasMore}`);

    return new Response(
      JSON.stringify({ 
        data: collectionsWithCounts, 
        next_cursor: nextCursor 
      }), 
      { headers: { ...cors, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[COLLECTIONS] unexpected error", err);
    return new Response(JSON.stringify({ error: "internal_error" }), { 
      status: 500, 
      headers: { ...cors, "Content-Type": "application/json" } 
    });
  }
});
