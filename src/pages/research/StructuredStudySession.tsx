
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { SessionHeader } from "@/components/research/structured-session/SessionHeader";
import { NoSessionFound } from "@/components/research/structured-session/NoSessionFound";
import { structuredStudyService } from "@/services/structuredStudy/structuredStudyService";
import ResearchInterface from "@/components/research/ResearchInterface";
import { useResearchSession } from "@/components/research/hooks/useResearchSession";

const StructuredStudySession = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get URL parameters
  const sessionId = searchParams.get('session');
  const personaIds = searchParams.get('personas')?.split(',') || [];
  const projectId = searchParams.get('project');

  // Use the research session hook
  const {
    sessionId: researchSessionId,
    loadedPersonas,
    messages,
    isLoading: researchLoading,
    createSession,
    sendMessage,
    selectPersonaResponder
  } = useResearchSession();

  useEffect(() => {
    const loadSessionAndStartResearch = async () => {
      if (!sessionId) {
        console.log('No session ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log("Loading session with ID:", sessionId);
        
        // Load the structured study session
        const structuredSession = await structuredStudyService.getSession(sessionId);
        
        if (!structuredSession) {
          console.error('No structured session found');
          toast.error("Study session not found");
          setIsLoading(false);
          return;
        }
        
        console.log("Structured session data loaded:", structuredSession);
        setSession(structuredSession);
        
        // Auto-start the research session if we have personas
        if (personaIds && personaIds.length > 0) {
          console.log('Starting research session with personas:', personaIds);
          const success = await createSession(personaIds, projectId);
          if (success) {
            console.log('Research session started successfully');
            toast.success("Research session started successfully");
          } else {
            toast.error("Failed to start research session");
          }
        } else {
          console.warn('No personas provided for research session');
          toast.error("No personas selected for research session");
        }
        
      } catch (error) {
        console.error("Error loading session:", error);
        toast.error("Failed to load study session");
      } finally {
        setIsLoading(false);
      }
    };

    loadSessionAndStartResearch();
  }, [sessionId, personaIds, projectId, createSession]);

  const handleSendMessage = async (message: string, imageFile?: File): Promise<void> => {
    await sendMessage(message, imageFile);
  };

  const handleSelectResponder = async (personaId: string): Promise<void> => {
    await selectPersonaResponder(personaId);
  };

  const handleCreateSession = async (selectedPersonas: string[], selectedProjectId?: string | null): Promise<boolean> => {
    return await createSession(selectedPersonas, selectedProjectId);
  };

  if (isLoading) {
    return (
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <SidebarInset>
            <div className="relative flex min-h-svh flex-col">
              <Header />
              <main className="flex-1 pt-24">
                <div className="container py-6">
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p>Loading study session...</p>
                    </div>
                  </div>
                </div>
              </main>
              <Footer />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  if (!session) {
    return (
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <SidebarInset>
            <div className="relative flex min-h-svh flex-col">
              <Header />
              <main className="flex-1 pt-24">
                <div className="container py-6">
                  <NoSessionFound />
                </div>
              </main>
              <Footer />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  // Prepare session data for the research interface
  const sessionData = {
    sessionId: researchSessionId,
    loadedPersonas,
    messages,
    isLoading: researchLoading
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <div className="relative flex min-h-svh flex-col">
            <Header />
            <main className="flex-1 min-h-0">
              <div className="container h-full flex flex-col">
                <div className="flex items-center gap-4 mb-6 pt-24 flex-shrink-0">
                  <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold">Structured Research Session</h1>
                    <p className="text-sm text-muted-foreground">
                      {session.title || 'Research Session'}
                    </p>
                  </div>
                </div>

                <div className="flex-1 min-h-0">
                  <ResearchInterface 
                    sessionData={sessionData}
                    onCreateSession={handleCreateSession}
                    onSendMessage={handleSendMessage}
                    onSelectResponder={handleSelectResponder}
                  />
                </div>
              </div>
            </main>
            <Footer />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default StructuredStudySession;
