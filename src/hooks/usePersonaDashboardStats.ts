import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PersonaDashboardStats {
  totalPersonas: number;
  pendingQueue: number;
  processingQueue: number;
  failedQueue: number;
}

export function usePersonaDashboardStats() {
  const [stats, setStats] = useState<PersonaDashboardStats>({
    totalPersonas: 0,
    pendingQueue: 0,
    processingQueue: 0,
    failedQueue: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Error getting user:', userError);
        return;
      }

      // Fetch total completed personas
      const { count: totalCount, error: personaError } = await supabase
        .from('v4_personas')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('creation_completed', true);

      if (personaError) {
        console.error('Error fetching personas:', personaError);
      }

      // Fetch queue stats
      const { data: queueData, error: queueError } = await supabase
        .from('persona_creation_queue')
        .select('status')
        .eq('user_id', user.id);

      if (queueError) {
        console.error('Error fetching queue:', queueError);
      }

      const pending = queueData?.filter(q => q.status === 'pending').length || 0;
      const processing = queueData?.filter(q => 
        q.status === 'processing' || 
        q.status === 'processing_stage1' || 
        q.status === 'processing_stage2' || 
        q.status === 'processing_stage3'
      ).length || 0;
      const failed = queueData?.filter(q => q.status === 'failed').length || 0;

      setStats({
        totalPersonas: totalCount || 0,
        pendingQueue: pending,
        processingQueue: processing,
        failedQueue: failed,
      });

    } catch (error) {
      console.error('Error calculating dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Subscribe to queue changes for live updates
    const channel = supabase
      .channel('persona-queue-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'persona_creation_queue'
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { stats, loading, refetch: fetchStats };
}
