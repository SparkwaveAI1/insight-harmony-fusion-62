
import { useSearchParams } from 'react-router-dom';
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ResearchHeader } from "@/components/research/ResearchHeader";
import { ResearchConversation } from "@/components/research/ResearchConversation";
import { ResearchModeSelector } from "@/components/research/ResearchModeSelector";
import { SendToPersonaSection } from "@/components/research/SendToPersonaSection";
import { useResearchSession } from "@/components/research/hooks/types";

const Research = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  
  // Use the original research session hook that has all the required properties
  const {
    sessionId,
    loadedPersonas,
    projectDocuments,
    messages,
    isLoading,
    createSession,
    sendMessage,
    sendToPersona
  } = useResearchSession(projectId || undefined);

  const handleExportTranscript = () => {
    const transcript = messages.map(msg => 
      `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research-transcript-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
                
                <ResearchHeader
                  loadedPersonas={loadedPersonas}
                  messages={messages}
                  onExportTranscript={handleExportTranscript}
                  hasProject={Boolean(projectId)}
                />
                
                <div className="flex-1 min-h-0 space-y-6">
                  <ResearchModeSelector 
                    loadedPersonas={loadedPersonas}
                    onCreateSession={createSession}
                  />
                  
                  <ResearchConversation
                    messages={messages}
                    loadedPersonas={loadedPersonas}
                    isLoading={isLoading}
                    onSendMessage={sendMessage}
                  />
                  
                  {loadedPersonas.length > 0 && (
                    <SendToPersonaSection
                      loadedPersonas={loadedPersonas}
                      isLoading={isLoading}
                      onSendToPersona={sendToPersona}
                    />
                  )}
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
