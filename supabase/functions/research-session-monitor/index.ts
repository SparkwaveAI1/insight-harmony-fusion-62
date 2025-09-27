import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Research session monitor running...');

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find stalled sessions (in_progress but no heartbeat in last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const { data: stalledSessions, error } = await supabase
      .from('research_survey_sessions')
      .select('id, status, last_heartbeat, created_at')
      .eq('status', 'in_progress')
      .lt('last_heartbeat', fiveMinutesAgo);

    if (error) {
      console.error('Error fetching stalled sessions:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${stalledSessions?.length || 0} stalled sessions`);
    
    const resumedSessions = [];
    
    if (stalledSessions && stalledSessions.length > 0) {
      for (const session of stalledSessions) {
        console.log(`Attempting to resume stalled session: ${session.id}`);
        
        try {
          // Mark as active so it can be resumed
          await supabase
            .from('research_survey_sessions')
            .update({ 
              status: 'active',
              last_heartbeat: new Date().toISOString()
            })
            .eq('id', session.id);

          // Invoke the orchestrator to resume
          const resumeResponse = await supabase.functions.invoke('research-session-orchestrator', {
            body: {
              session_id: session.id,
              action: 'resume'
            }
          });

          if (resumeResponse.data?.success) {
            resumedSessions.push(session.id);
            console.log(`Successfully resumed session: ${session.id}`);
          } else {
            console.error(`Failed to resume session ${session.id}:`, resumeResponse.data);
          }

        } catch (error) {
          console.error(`Error resuming session ${session.id}:`, error);
        }
      }
    }

    // Also check for sessions that have been "active" for too long (likely stuck)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    
    const { data: longActiveSessions } = await supabase
      .from('research_survey_sessions')
      .select('id, status, created_at')
      .eq('status', 'active')
      .lt('created_at', thirtyMinutesAgo);

    if (longActiveSessions && longActiveSessions.length > 0) {
      for (const session of longActiveSessions) {
        console.log(`Force resuming long-active session: ${session.id}`);
        
        try {
          const resumeResponse = await supabase.functions.invoke('research-session-orchestrator', {
            body: {
              session_id: session.id,
              action: 'resume'
            }
          });

          if (resumeResponse.data?.success) {
            resumedSessions.push(session.id);
            console.log(`Successfully force-resumed session: ${session.id}`);
          }
        } catch (error) {
          console.error(`Error force-resuming session ${session.id}:`, error);
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      stalledSessions: stalledSessions?.length || 0,
      resumedSessions: resumedSessions.length,
      resumedSessionIds: resumedSessions
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in research session monitor:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});