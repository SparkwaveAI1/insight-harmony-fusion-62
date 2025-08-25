import { CreateV4PersonaResponse } from '../v4-persona/createV4Persona';

export interface PersonaCreationJob {
  id: string;
  userId: string;
  prompt: string;
  generateImage: boolean;
  selectedCollections: string[];
  status: 'pending' | 'stage1' | 'stage2' | 'stage3' | 'completed' | 'failed';
  progress: number;
  message: string;
  personaId?: string;
  personaName?: string;
  imageUrl?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

const JOBS_STORAGE_KEY = 'persona_creation_jobs';

class BackgroundPersonaJobService {
  private jobs: Map<string, PersonaCreationJob> = new Map();
  private listeners: Set<(jobs: PersonaCreationJob[]) => void> = new Set();

  constructor() {
    this.loadJobsFromStorage();
  }

  private loadJobsFromStorage() {
    try {
      const stored = localStorage.getItem(JOBS_STORAGE_KEY);
      if (stored) {
        const jobsArray: PersonaCreationJob[] = JSON.parse(stored);
        jobsArray.forEach(job => this.jobs.set(job.id, job));
      }
    } catch (error) {
      console.error('Failed to load jobs from storage:', error);
    }
  }

  private saveJobsToStorage() {
    try {
      const jobsArray = Array.from(this.jobs.values());
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobsArray));
    } catch (error) {
      console.error('Failed to save jobs to storage:', error);
    }
  }

  private notifyListeners() {
    const activeJobs = this.getActiveJobs();
    this.listeners.forEach(listener => listener(activeJobs));
  }

  createJob(params: {
    userId: string;
    prompt: string;
    generateImage: boolean;
    selectedCollections: string[];
  }): PersonaCreationJob {
    const job: PersonaCreationJob = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: params.userId,
      prompt: params.prompt,
      generateImage: params.generateImage,
      selectedCollections: params.selectedCollections,
      status: 'pending',
      progress: 0,
      message: 'Starting persona creation...',
      createdAt: new Date().toISOString(),
    };

    this.jobs.set(job.id, job);
    this.saveJobsToStorage();
    this.notifyListeners();
    return job;
  }

  updateJob(jobId: string, updates: Partial<PersonaCreationJob>) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    const updatedJob = { ...job, ...updates };
    this.jobs.set(jobId, updatedJob);
    this.saveJobsToStorage();
    this.notifyListeners();
  }

  completeJob(jobId: string, result: {
    personaId: string;
    personaName: string;
    imageUrl?: string;
  }) {
    this.updateJob(jobId, {
      status: 'completed',
      progress: 100,
      message: 'Persona created successfully!',
      personaId: result.personaId,
      personaName: result.personaName,
      imageUrl: result.imageUrl,
      completedAt: new Date().toISOString(),
    });
  }

  failJob(jobId: string, error: string) {
    this.updateJob(jobId, {
      status: 'failed',
      progress: 0,
      message: 'Failed to create persona',
      error,
      completedAt: new Date().toISOString(),
    });
  }

  getJob(jobId: string): PersonaCreationJob | undefined {
    return this.jobs.get(jobId);
  }

  getActiveJobs(): PersonaCreationJob[] {
    return Array.from(this.jobs.values()).filter(
      job => job.status !== 'completed' && job.status !== 'failed'
    );
  }

  getCompletedJobs(): PersonaCreationJob[] {
    return Array.from(this.jobs.values()).filter(
      job => job.status === 'completed' || job.status === 'failed'
    );
  }

  getAllJobs(): PersonaCreationJob[] {
    return Array.from(this.jobs.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  removeJob(jobId: string) {
    this.jobs.delete(jobId);
    this.saveJobsToStorage();
    this.notifyListeners();
  }

  clearCompletedJobs() {
    const activeJobs = this.getActiveJobs();
    this.jobs.clear();
    activeJobs.forEach(job => this.jobs.set(job.id, job));
    this.saveJobsToStorage();
    this.notifyListeners();
  }

  subscribe(listener: (jobs: PersonaCreationJob[]) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  updateJobFromApiResponse(jobId: string, response: CreateV4PersonaResponse) {
    const updates: Partial<PersonaCreationJob> = {
      progress: this.getProgressFromStage(response.stage),
      message: response.message || 'Processing...',
    };

    switch (response.stage) {
      case 'traits_complete':
        updates.status = 'stage1';
        break;
      case 'summary_complete':
        updates.status = 'stage2';
        break;
      case 'creation_complete':
        updates.status = response.success ? 'completed' : 'failed';
        if (response.success) {
          updates.personaId = response.persona_id;
          updates.personaName = response.persona_name;
          updates.imageUrl = response.image_url;
          updates.completedAt = new Date().toISOString();
        } else {
          updates.error = response.error;
        }
        break;
    }

    this.updateJob(jobId, updates);
  }

  private getProgressFromStage(stage: string): number {
    switch (stage) {
      case 'traits_complete': return 33;
      case 'summary_complete': return 66;
      case 'creation_complete': return 100;
      default: return 0;
    }
  }
}

export const backgroundJobService = new BackgroundPersonaJobService();