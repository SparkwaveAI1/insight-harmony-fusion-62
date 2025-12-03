import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ACPSurveyResults } from '@/components/acp/ACPSurveyResults';

interface ACPJobResults {
  study_results?: {
    personas_interviewed?: number;
    questions_asked?: number;
    selection_method?: string;
    responses?: Array<{
      persona_id: string;
      persona_name: string;
      persona_summary?: string;
      responses: Array<{
        question: string;
        response: string;
      }>;
    }>;
    summary_report?: {
      qualitative_report?: any;
    };
  };
}

interface ACPJob {
  id: string;
  external_job_id: string;
  status: string;
  results: ACPJobResults | null;
  created_at: string;
  completed_at: string | null;
}

const ACPResults = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<ACPJob | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (jobId) {
      loadACPJob(jobId);
    }
  }, [jobId]);

  const loadACPJob = async (externalJobId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('acp_jobs')
        .select('*')
        .eq('external_job_id', externalJobId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching ACP job:', fetchError);
        setError("Research results not found or you don't have access to them");
        return;
      }
      
      if (!data) {
        setError("Research results not found");
        return;
      }
      
      setJob(data as ACPJob);
    } catch (err) {
      console.error('Error loading ACP job:', err);
      setError("Failed to load research results");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-6 pt-24 pb-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading research results...</span>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-6 pt-24 pb-8">
          <Alert variant="destructive">
            <AlertDescription>
              {error || "Research results not found"}
            </AlertDescription>
          </Alert>
          <div className="mt-6 text-center">
            <p className="text-muted-foreground mb-4">
              If you believe this is an error, please contact support with job ID: {jobId}
            </p>
            <Button variant="outline" asChild>
              <a href="https://personaresearch.ai" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit PersonaAI
              </a>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 pt-24 pb-8">
        <ACPSurveyResults job={job} />
      </main>
      <Footer />
    </div>
  );
};

export default ACPResults;
