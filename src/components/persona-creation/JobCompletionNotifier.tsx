import { useEffect, useRef } from 'react';
import { useBackgroundPersonaJobs } from '@/hooks/useBackgroundPersonaJobs';
import { useToast } from '@/hooks/use-toast';

export const JobCompletionNotifier: React.FC = () => {
  const { completedJobs } = useBackgroundPersonaJobs();
  const { toast } = useToast();
  const notifiedJobsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Check for newly completed jobs
    completedJobs.forEach(job => {
      if (!notifiedJobsRef.current.has(job.id)) {
        notifiedJobsRef.current.add(job.id);
        
        if (job.status === 'completed') {
          toast({
            title: "Persona Ready!",
            description: `"${job.personaName}" has been created successfully and is ready to chat with.`,
            duration: 6000,
          });
        } else if (job.status === 'failed') {
          toast({
            title: "Persona Creation Failed",
            description: `Failed to create persona: ${job.error || 'Unknown error'}`,
            variant: "destructive",
            duration: 8000,
          });
        }
      }
    });
  }, [completedJobs, toast]);

  // This component doesn't render anything - it just manages notifications
  return null;
};