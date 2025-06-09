
import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import ResearchInterface from "@/components/research/ResearchInterface";
import { useResearchSession } from "@/components/research/hooks/useResearchSession";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { toast } from "sonner";

const FocusGroup = () => {
  const {
    sessionId,
    loadedPersonas,
    messages,
    isLoading,
    createSession,
    sendMessage,
    selectPersonaResponder
  } = useResearchSession();

  // Check for quick research session data on component mount
  useEffect(() => {
    const quickResearchData = sessionStorage.getItem('quickResearchSession');
    if (quickResearchData) {
      try {
        const sessionData = JSON.parse(quickResearchData);
        console.log('Found quick research session data:', sessionData);
        
        // Auto-start the session with the selected personas
        if (sessionData.personas && sessionData.personas.length > 0) {
          createSession(sessionData.personas, sessionData.objective);
          toast.success(`Starting research session: ${sessionData.objective}`);
        }
        
        // Clear the session data after using it
        sessionStorage.removeItem('quickResearchSession');
      } catch (error) {
        console.error('Error parsing quick research session data:', error);
        sessionStorage.removeItem('quickResearchSession');
      }
    }
  }, [createSession]);

  const sessionData = {
    sessionId,
    loadedPersonas,
    messages,
    isLoading
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
                <div className="flex items-center justify-between mb-4 pt-24 flex-shrink-0">
                  <SidebarTrigger className="hidden md:flex" />
                </div>
                <div className="flex-1 min-h-0">
                  <ResearchInterface 
                    sessionData={sessionData}
                    onCreateSession={createSession}
                    onSendMessage={sendMessage}
                    onSelectResponder={selectPersonaResponder}
                  />
                </div>
              </div>
            </main>
            <Footer />
            <Toaster />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default FocusGroup;
