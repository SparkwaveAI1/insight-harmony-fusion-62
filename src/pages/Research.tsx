
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import ResearchInterface from "@/components/research/ResearchInterface";
import { useResearchSession } from "@/components/research/hooks/useResearchSession";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Research = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  
  const {
    sessionId,
    loadedPersonas,
    messages,
    isLoading,
    createSession,
    sendMessage,
    selectPersonaResponder
  } = useResearchSession();

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
                  <div className="flex items-center gap-4">
                    <SidebarTrigger className="hidden md:flex" />
                    {projectId && (
                      <>
                        <Link to={`/projects/${projectId}`}>
                          <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Project
                          </Button>
                        </Link>
                        <Badge variant="outline">Project Research Session</Badge>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-h-0">
                  <ResearchInterface 
                    sessionData={sessionData}
                    onCreateSession={createSession}
                    onSendMessage={sendMessage}
                    onSelectResponder={selectPersonaResponder}
                    projectId={projectId}
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
