
import { useSearchParams } from 'react-router-dom';
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import ResearchInterface from "@/components/research/ResearchInterface";
import { useResearchSession } from "@/components/research/hooks/useResearchSession";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";

const Research = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  
  const {
    sessionId,
    loadedPersonas,
    projectDocuments,
    messages,
    isLoading,
    createSession,
    sendMessage,
    selectPersonaResponder
  } = useResearchSession(projectId || undefined);

  const sessionData = {
    sessionId,
    loadedPersonas,
    projectDocuments,
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
                  {projectDocuments.length > 0 && (
                    <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-md border border-green-200">
                      ✅ {projectDocuments.length} knowledge base document{projectDocuments.length !== 1 ? 's' : ''} available to research participants
                    </div>
                  )}
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

export default Research;
