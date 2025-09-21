import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BulkDeleteResult {
  success: boolean;
  deletedCount: number;
  cleanedCollectionReferences: number;
  cleanedMemories: number;
  error?: string;
  deletedPersonas?: Array<{
    persona_id: string;
    name: string;
    created_at: string;
  }>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Bulk delete old personas function called');

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get request body
    const { preview = false, cutoffDate = '2025-09-19T00:00:00.000Z' } = await req.json().catch(() => ({}));
    
    console.log(`📅 Processing personas created before: ${cutoffDate}`);
    console.log(`👀 Preview mode: ${preview}`);

    // Step 1: Get all personas to be deleted
    console.log('🔍 Fetching personas to delete...');
    const { data: personasToDelete, error: fetchError } = await supabaseClient
      .from('v4_personas')
      .select('persona_id, name, created_at')
      .lt('created_at', cutoffDate)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('❌ Error fetching personas:', fetchError);
      return new Response(
        JSON.stringify({
          success: false,
          deletedCount: 0,
          cleanedCollectionReferences: 0,
          cleanedMemories: 0,
          error: fetchError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!personasToDelete || personasToDelete.length === 0) {
      console.log('✅ No personas found to delete');
      return new Response(
        JSON.stringify({
          success: true,
          deletedCount: 0,
          cleanedCollectionReferences: 0,
          cleanedMemories: 0,
          deletedPersonas: []
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`📊 Found ${personasToDelete.length} personas to delete`);
    personasToDelete.forEach(p => {
      console.log(`  - ${p.name} (${p.persona_id}) created: ${p.created_at}`);
    });

    // If preview mode, return the list without deletion
    if (preview) {
      console.log('👀 Preview mode - returning list without deletion');
      return new Response(
        JSON.stringify({
          success: true,
          deletedCount: personasToDelete.length,
          cleanedCollectionReferences: 0,
          cleanedMemories: 0,
          deletedPersonas: personasToDelete
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const personaIds = personasToDelete.map(p => p.persona_id);
    console.log(`🎯 Processing ${personaIds.length} persona IDs for deletion`);

    // Step 2: Clean up collection references
    console.log('🧹 Cleaning up collection references...');
    const { error: collectionError, count: collectionCount } = await supabaseClient
      .from('collection_personas')
      .delete({ count: 'exact' })
      .in('persona_id', personaIds);

    if (collectionError) {
      console.error('⚠️ Error cleaning collection references:', collectionError);
      // Continue anyway, this might not be critical
    } else {
      console.log(`✅ Cleaned ${collectionCount || 0} collection references`);
    }

    // Step 3: Clean up persona memories
    console.log('🧠 Cleaning up persona memories...');
    const { error: memoriesError, count: memoriesCount } = await supabaseClient
      .from('persona_memories')
      .delete({ count: 'exact' })
      .in('persona_id', personaIds);

    if (memoriesError) {
      console.error('⚠️ Error cleaning persona memories:', memoriesError);
      // Continue anyway
    } else {
      console.log(`✅ Cleaned ${memoriesCount || 0} persona memories`);
    }

    // Step 4: Delete personas from v4_personas table
    console.log('🗑️ Deleting personas from v4_personas table...');
    const { error: deleteError, count: deleteCount } = await supabaseClient
      .from('v4_personas')
      .delete({ count: 'exact' })
      .in('persona_id', personaIds);

    if (deleteError) {
      console.error('❌ Error deleting personas:', deleteError);
      return new Response(
        JSON.stringify({
          success: false,
          deletedCount: 0,
          cleanedCollectionReferences: collectionCount || 0,
          cleanedMemories: memoriesCount || 0,
          error: deleteError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`✅ Successfully deleted ${deleteCount || 0} personas`);
    console.log('🎉 Bulk deletion completed successfully!');

    const result: BulkDeleteResult = {
      success: true,
      deletedCount: deleteCount || 0,
      cleanedCollectionReferences: collectionCount || 0,
      cleanedMemories: memoriesCount || 0,
      deletedPersonas: personasToDelete
    };

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Bulk deletion function failed:', error);
    return new Response(
      JSON.stringify({
        success: false,
        deletedCount: 0,
        cleanedCollectionReferences: 0,
        cleanedMemories: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});