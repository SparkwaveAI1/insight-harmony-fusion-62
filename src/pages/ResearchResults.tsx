import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { getResearchSessionById, getResearchReport, ResearchSurveySession, ResearchReport } from '@/services/collections/researchOperations';
import SurveyResults from '@/components/research/SurveyResults';
import { Alert, AlertDescription } from "@/components/ui/alert";

const ResearchResults = () => {
  const { surveySessionId } = useParams<{ surveySessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<ResearchSurveySession | null>(null);
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (surveySessionId) {
      loadResearchData(surveySessionId);
    }
  }, [surveySessionId]);

  const loadResearchData = async (sessionId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [sessionData, reportData] = await Promise.all([
        getResearchSessionById(sessionId),
        getResearchReport(sessionId)
      ]);
      
      if (!sessionData) {
        setError("Research session not found or you don't have access to it");
        return;
      }
      
      setSession(sessionData);
      setReport(reportData);
    } catch (err) {
      console.error('Error loading research data:', err);
      setError("Failed to load research data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToProject = () => {
    if (session?.project_id) {
      navigate(`/projects/${session.project_id}`);
    } else {
      navigate('/projects');
    }
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header />
          <div className="flex min-h-screen flex-col">
            <main className="flex-1 container mx-auto px-6 py-8">
              <div className="flex items-center justify-center h-64">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Loading research results...</span>
                </div>
              </div>
            </main>
            <Footer />
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (error || !session) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header />
          <div className="flex min-h-screen flex-col">
            <main className="flex-1 container mx-auto px-6 py-8">
              <div className="mb-6">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/projects')}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Projects</span>
                </Button>
              </div>
              
              <Alert variant="destructive">
                <AlertDescription>
                  {error || "Research session not found"}
                </AlertDescription>
              </Alert>
            </main>
            <Footer />
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className="flex min-h-screen flex-col">
          <main className="flex-1 container mx-auto px-6 py-8">
            <div className="mb-6">
              <Button 
                variant="ghost" 
                onClick={handleBackToProject}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Project</span>
              </Button>
            </div>
            
            <SurveyResults
              surveyName={session.survey_name || 'Research Survey'}
              surveyDescription={session.survey_description}
              questions={session.survey_questions || []}
              sessionId={session.id}
              surveySessionId={session.id}
              loadedPersonas={session.selected_personas.map(id => ({ 
                persona_id: id,
                id: id,
                name: `Persona ${id}`,
                creation_date: '',
                created_at: '',
                metadata: {},
                trait_profile: {},
                simulation_directives: {},
                behavioral_modulation: {},
                interview_sections: [],
                preinterview_tags: [],
                linguistic_profile: {},
                persona_context: '',
                persona_type: 'persona'
              }))}
              onBack={handleBackToProject}
            />
          </main>
          <Footer />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ResearchResults;