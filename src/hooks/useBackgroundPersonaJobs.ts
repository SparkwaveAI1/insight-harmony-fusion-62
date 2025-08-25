import { useState, useEffect } from 'react';
import { backgroundJobService, PersonaCreationJob } from '@/services/persona/backgroundJobService';

export const useBackgroundPersonaJobs = () => {
  const [activeJobs, setActiveJobs] = useState<PersonaCreationJob[]>([]);
  const [completedJobs, setCompletedJobs] = useState<PersonaCreationJob[]>([]);

  useEffect(() => {
    // Initial load
    setActiveJobs(backgroundJobService.getActiveJobs());
    setCompletedJobs(backgroundJobService.getCompletedJobs());

    // Subscribe to updates
    const unsubscribe = backgroundJobService.subscribe((jobs) => {
      setActiveJobs(jobs);
      setCompletedJobs(backgroundJobService.getCompletedJobs());
    });

    return () => unsubscribe();
  }, []);

  const hasActiveJobs = activeJobs.length > 0;
  const hasCompletedJobs = completedJobs.length > 0;
  const totalProgress = activeJobs.length > 0 
    ? activeJobs.reduce((sum, job) => sum + job.progress, 0) / activeJobs.length 
    : 0;

  return {
    activeJobs,
    completedJobs,
    hasActiveJobs,
    hasCompletedJobs,
    totalProgress,
    removeJob: backgroundJobService.removeJob.bind(backgroundJobService),
    clearCompletedJobs: backgroundJobService.clearCompletedJobs.bind(backgroundJobService),
  };
};

export const usePersonaCreationJob = (jobId?: string) => {
  const [job, setJob] = useState<PersonaCreationJob | null>(null);

  useEffect(() => {
    if (!jobId) {
      setJob(null);
      return;
    }

    // Initial load
    const currentJob = backgroundJobService.getJob(jobId);
    setJob(currentJob || null);

    // Subscribe to updates
    const unsubscribe = backgroundJobService.subscribe(() => {
      const updatedJob = backgroundJobService.getJob(jobId);
      setJob(updatedJob || null);
    });

    return () => unsubscribe();
  }, [jobId]);

  return job;
};