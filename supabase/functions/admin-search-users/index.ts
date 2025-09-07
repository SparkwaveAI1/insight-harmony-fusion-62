import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Admin emails
const ADMIN_EMAILS = [
  "cumbucotrader@gmail.com", 
  "scott@sparkwave-ai.com",
];

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🔍 [ADMIN-SEARCH] Starting user search request");

    // Parse request
    const { query } = await req.json();
    
    if (!query || typeof query !== 'string') {
      console.error("❌ [ADMIN-SEARCH] Missing or invalid query");
      return new Response(
        JSON.stringify({ error: "Query parameter required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Guard against very short queries to avoid huge scans
    if (query.length < 3) {
      console.log("⚠️ [ADMIN-SEARCH] Query too short, returning empty results");
      return new Response(
        JSON.stringify({ users: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get JWT token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error("❌ [ADMIN-SEARCH] Missing or invalid authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verify the calling user is an admin using the anon client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user?.email) {
      console.error("❌ [ADMIN-SEARCH] Failed to get user from JWT:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    if (!ADMIN_EMAILS.includes(user.email)) {
      console.error(`❌ [ADMIN-SEARCH] User ${user.email} is not an admin`);
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ [ADMIN-SEARCH] Admin ${user.email} authorized, searching for: "${query}"`);

    let users: Array<{ id: string; email: string }> = [];

    // Check if query looks like a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (uuidRegex.test(query)) {
      // Search by user ID
      console.log("🔍 [ADMIN-SEARCH] Searching by UUID");
      const { data: userData, error: userFetchError } = await supabaseAdmin.auth.admin.getUserById(query);
      
      if (userFetchError) {
        console.error("❌ [ADMIN-SEARCH] Error fetching user by ID:", userFetchError);
      } else if (userData.user) {
        users = [{
          id: userData.user.id,
          email: userData.user.email || 'No email'
        }];
        console.log(`✅ [ADMIN-SEARCH] Found user by ID: ${userData.user.email}`);
      }
    } else {
      // Search by email (partial match)
      console.log("🔍 [ADMIN-SEARCH] Searching by email");
      const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 20
      });

      if (usersError) {
        console.error("❌ [ADMIN-SEARCH] Error listing users:", usersError);
        throw new Error("Failed to search users");
      }

      // Filter users by email containing the query (case-insensitive)
      const filteredUsers = usersData.users.filter(u => 
        u.email && u.email.toLowerCase().includes(query.toLowerCase())
      );

      users = filteredUsers.map(u => ({
        id: u.id,
        email: u.email || 'No email'
      }));

      console.log(`✅ [ADMIN-SEARCH] Found ${users.length} users matching email query`);
    }

    return new Response(
      JSON.stringify({ users }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("❌ [ADMIN-SEARCH] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});