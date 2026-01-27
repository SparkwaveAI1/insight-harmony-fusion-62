import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    // Parse request body to get depth for chain safety limit
    const body = await req.json().catch(() => ({}))
    const depth = body?.depth || 0
    const trigger = body?.trigger || 'unknown'

    console.log(`[process-queue-item] Starting queue processing... (trigger: ${trigger}, depth: ${depth})`)

    // Step 1: Atomically pop the next pending queue item
    const { data: item, error: popError } = await supabase.rpc('pop_next_persona_queue')

    if (popError) {
      console.error('[process-queue-item] Error popping queue item:', popError)
      throw new Error(`Failed to pop queue item: ${popError.message}`)
    }

    if (!item) {
      console.log('[process-queue-item] No pending items in queue')
      return new Response(
        JSON.stringify({ success: true, message: 'No pending items to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[process-queue-item] Processing: ${item.name} (${item.id})`)

    // Step 2: Call v4-persona-unified to create the persona
    const { data: unifiedResult, error: unifiedError } = await supabase.functions.invoke('v4-persona-unified', {
      body: {
        user_description: item.description,
        user_id: item.user_id
      }
    })

    if (unifiedError || !unifiedResult?.success) {
      const errorMsg = unifiedError?.message || unifiedResult?.error || 'Unknown error'
      console.error(`[process-queue-item] Persona creation failed for ${item.name}:`, errorMsg)

      // Delete failed item from queue (matches client-side behavior)
      await supabase
        .from('persona_creation_queue')
        .delete()
        .eq('id', item.id)

      return new Response(
        JSON.stringify({
          success: false,
          message: `Persona creation failed: ${errorMsg}`,
          item_name: item.name,
          deleted: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const personaId = unifiedResult.persona_id
    console.log(`[process-queue-item] Persona created: ${personaId}`)

    // Validate persona_id format
    if (!personaId || !String(personaId).startsWith('v4_')) {
      console.error(`[process-queue-item] Invalid persona_id returned: ${personaId}`)
      await supabase
        .from('persona_creation_queue')
        .delete()
        .eq('id', item.id)

      return new Response(
        JSON.stringify({
          success: false,
          message: `Invalid persona_id: ${personaId}`,
          deleted: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Step 3: Add to collections if specified
    if (item.collections && item.collections.length > 0) {
      console.log(`[process-queue-item] Adding to collections: ${item.collections.join(', ')}`)

      // Get user's collections
      const { data: userCollections } = await supabase
        .from('collections')
        .select('id, name')
        .eq('user_id', item.user_id)

      if (userCollections) {
        const collectionMap = new Map(
          userCollections.map(c => [c.name.toLowerCase().trim(), c.id])
        )

        for (const collectionName of item.collections) {
          const collectionId = collectionMap.get(collectionName.toLowerCase().trim())
          if (collectionId) {
            const { error: addError } = await supabase
              .from('collection_personas')
              .insert({ collection_id: collectionId, persona_id: personaId })

            if (addError && !addError.message.includes('duplicate')) {
              console.warn(`[process-queue-item] Failed to add to collection "${collectionName}":`, addError.message)
            } else {
              console.log(`[process-queue-item] Added to collection: ${collectionName}`)
            }
          } else {
            console.warn(`[process-queue-item] Collection not found: ${collectionName}`)
          }
        }
      }
    }

    // Step 4: Mark queue item as completed
    const { error: updateError } = await supabase
      .from('persona_creation_queue')
      .update({
        status: 'completed',
        persona_id: personaId,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', item.id)

    if (updateError) {
      console.error(`[process-queue-item] Failed to update queue status:`, updateError)
      // Don't fail - persona was created successfully
    }

    console.log(`[process-queue-item] Successfully processed: ${item.name} -> ${personaId}`)

    // Step 5: Check for next item and chain (continuous processing)
    let chainedToNext = false

    if (depth < 25) {  // Safety limit: max 25 personas per chain
      console.log('[process-queue-item] Checking for next item in queue...')

      const { data: nextItem, error: nextError } = await supabase.rpc('pop_next_persona_queue')

      if (!nextError && nextItem) {
        console.log(`[process-queue-item] Found next item: ${nextItem.name}, chaining...`)
        chainedToNext = true

        // Invoke this function recursively for the next item
        try {
          // Use setTimeout to avoid blocking the current response
          setTimeout(async () => {
            try {
              await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/process-queue-item`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  trigger: 'chain',
                  depth: depth + 1,
                  previous_item: item.name
                })
              })
              console.log('[process-queue-item] Chain invoked successfully')
            } catch (chainError) {
              console.error('[process-queue-item] Chain invocation failed:', chainError)
            }
          }, 100) // Small delay to ensure current response completes
        } catch (chainError) {
          console.error('[process-queue-item] Chain setup failed:', chainError)
          // Don't throw - current persona was still processed successfully
        }
      } else if (nextError) {
        console.error('[process-queue-item] Error checking for next item:', nextError)
      } else {
        console.log('[process-queue-item] No more items in queue, chain complete')
      }
    } else {
      console.log(`[process-queue-item] Depth limit reached (${depth}), stopping chain. Cron will pick up remaining items.`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${item.name}`,
        persona_id: personaId,
        item_id: item.id,
        chained_to_next: chainedToNext,
        depth: depth
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('[process-queue-item] Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
