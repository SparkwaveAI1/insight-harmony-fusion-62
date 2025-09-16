import { supabase } from '@/integrations/supabase/client';

export interface QueueHealthStatus {
  total_pending: number;
  total_processing: number;
  total_stuck: number;
  oldest_stuck_item: string | null;
  processing_time_minutes: number | null;
}

export const getQueueHealthStatus = async (): Promise<QueueHealthStatus> => {
  const { data, error } = await supabase.rpc('get_queue_health_status');
  
  if (error) {
    console.error('Error getting queue health status:', error);
    throw error;
  }

  return data?.[0] || {
    total_pending: 0,
    total_processing: 0,
    total_stuck: 0,
    oldest_stuck_item: null,
    processing_time_minutes: null
  };
};

export const fixOrphanedPersonaQueueItems = async (): Promise<void> => {
  const { error } = await supabase.rpc('fix_orphaned_persona_queue_items');
  
  if (error) {
    console.error('Error fixing orphaned persona queue items:', error);
    throw error;
  }
};

export const getProcessingTimeText = (processing_started_at: string | null): string => {
  if (!processing_started_at) return '';
  
  const startTime = new Date(processing_started_at);
  const now = new Date();
  const diffMs = now.getTime() - startTime.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffMinutes < 1) return 'Just started';
  if (diffMinutes < 60) return `${diffMinutes}m`;
  
  const hours = Math.floor(diffMinutes / 60);
  const remainingMinutes = diffMinutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending': return 'text-muted-foreground';
    case 'processing': return 'text-blue-600';
    case 'processing_stage1': return 'text-blue-600';
    case 'processing_stage2': return 'text-blue-600';
    case 'processing_stage3': return 'text-blue-600';
    case 'completed': return 'text-green-600';
    case 'failed': return 'text-red-600';
    default: return 'text-muted-foreground';
  }
};

export const getStatusDisplay = (status: string): string => {
  switch (status) {
    case 'pending': return 'Pending';
    case 'processing': return 'Processing';
    case 'processing_stage1': return 'Stage 1: Creating';
    case 'processing_stage2': return 'Stage 2: Enriching';
    case 'processing_stage3': return 'Stage 3: Image Gen';
    case 'completed': return 'Completed';
    case 'failed': return 'Failed';
    default: return status;
  }
};