import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Monitor, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { getPersonaDisplayName, isV4PersonaId } from "@/utils/personaHelpers";

interface GrokConversation {
  id: string;
  created_at: string;
  persona_name: string;
  user_message: string;
  response: string;
  traits_selected?: string[];
  prompt_structure?: any;
}

export function GrokPromptMonitor() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [conversations, setConversations] = useState<GrokConversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRecentGrokConversations = async () => {
    setIsLoading(true);
    try {
      // Read recent logged Grok prompts from admin_alerts
      const { data: messages, error } = await supabase
        .from('admin_alerts')
        .select(`id, created_at, message, metadata`)
        .eq('type', 'grok_prompt')
        .order('created_at', { ascending: false })
        .limit(15);

      if (error) {
        console.error('Error fetching Grok conversations:', error);
        return;
      }

      // Transform the data into our format with proper persona name resolution
      const grokConversations: GrokConversation[] = await Promise.all(
        (messages || []).map(async (row: any) => {
          const meta = row.metadata || {};
          let personaName = 'Unknown Persona';
          
          // Try to get persona name from metadata first
          if (meta.persona_name) {
            personaName = meta.persona_name;
          } else if (meta.persona_id && isV4PersonaId(meta.persona_id)) {
            // Fetch actual persona name if we have a valid ID
            personaName = await getPersonaDisplayName(meta.persona_id);
          } else if (meta.persona_id) {
            personaName = `Invalid ID: ${meta.persona_id}`;
          }
          
          return {
            id: row.id,
            created_at: row.created_at,
            persona_name: personaName,
            user_message: meta.user_message || '',
            response: meta.system_instructions || meta.user_message || '', // Show full system prompt
            traits_selected: [],
            prompt_structure: null,
          };
        })
      );

      setConversations(grokConversations);
    } catch (error) {
      console.error('Error loading Grok conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isCollapsed) {
      fetchRecentGrokConversations();
    }
  }, [isCollapsed]);

  // Set up real-time updates when expanded
  useEffect(() => {
    if (isCollapsed) return;

    const channel = supabase
      .channel('grok-monitor')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_alerts',
          filter: 'type=eq.grok_prompt'
        },
        () => {
          fetchRecentGrokConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isCollapsed]);

  return (
    <Card className="w-full">
      <CardHeader 
        className="cursor-pointer flex flex-row items-center justify-between py-3"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          <Monitor className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-lg">Grok Prompt Monitor</CardTitle>
            <CardDescription className="text-sm">
              Real-time view of prompts sent to Grok (admin-only)
            </CardDescription>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          {isCollapsed ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      
      {!isCollapsed && (
        <CardContent className="pt-0">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2">Loading Grok prompt logs...</span>
              </div>
            ) : conversations.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {conversations.map((conversation, index) => (
                <div key={conversation.id} className="font-mono text-sm">
                  <div className="text-primary font-semibold">
                    === Grok Conversation - {formatDistanceToNow(new Date(conversation.created_at), { addSuffix: true })} ===
                  </div>
                  <div className="mt-2 space-y-1 text-muted-foreground">
                    <div><span className="text-accent font-medium">Persona:</span> {conversation.persona_name}</div>
                    <div><span className="text-accent font-medium">User Question:</span> {conversation.user_message}</div>
                    <div><span className="text-accent font-medium">System Prompt:</span></div>
                    <div className="ml-4 bg-muted/50 p-2 rounded text-xs max-h-96 overflow-y-auto whitespace-pre-wrap font-mono">
                      {conversation.response}
                    </div>
                  </div>
                  
                  {index < conversations.length - 1 && (
                    <div className="mt-3 border-b border-muted-foreground/20 pb-2">
                      <div className="text-center text-muted-foreground/60 text-xs">
                        ─────────────────────────
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No Grok conversations found</p>
              <p className="text-xs mt-1">Start a conversation with a persona to see prompts here</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}