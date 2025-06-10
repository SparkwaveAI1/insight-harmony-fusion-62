
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import ResearchConversation from "@/components/research/ResearchConversation";
import { useResearchSession } from "@/components/research/hooks/useResearchSession";
import { ConversationKnowledgeBase } from "@/components/research/ConversationKnowledgeBase";
import { SessionHeader } from "@/components/research/structured-session/SessionHeader";
import { AIResearchAssistant } from "@/components/research/structured-session/AIResearchAssistant";
import { NoSessionFound } from "@/components/research/structured-session/NoSessionFound";
import { useAIAssistant } from "@/components/research/structured-session/useAIAssistant";

const StructuredStudySession = () => {
  const [searchParams] = useSearchParams();
  const personasParam = searchParams.get('personas');
  const projectId = searchParams.get('project');
  
  const [assistantActive, setAssistantActive] = useState(true);
  const [knowledgeBaseActive, setKnowledgeBaseActive] = useState(false);

  const {
    loadedPersonas,
    messages,
    isLoading,
    sessionId: currentSessionId,
    sendMessage,
    selectPersonaResponder
  } = useResearchSession({
    initialPersonas: personasParam ? personasParam.split(',') : [],
    projectId: projectId || undefined
  });

  const { researchInsights, suggestedQuestions } = useAIAssistant(messages, assistantActive);

  if (!personasParam) {
    return (
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <SidebarInset>
            <div className="relative flex min-h-svh flex-col">
              <Header />
              <main className="flex-1 min-h-0 flex items-center justify-center">
                <NoSessionFound />
              </main>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <div className="relative flex min-h-svh flex-col">
            <Header />
            <main className="flex-1 min-h-0">
              <div className="h-full flex">
                {/* Main research conversation */}
                <div className="flex-1 flex flex-col min-w-0">
                  <SessionHeader
                    projectId={projectId}
                    loadedPersonasCount={loadedPersonas.length}
                    knowledgeBaseActive={knowledgeBaseActive}
                    assistantActive={assistantActive}
                    onToggleKnowledgeBase={() => setKnowledgeBaseActive(!knowledgeBaseActive)}
                    onToggleAssistant={() => setAssistantActive(!assistantActive)}
                  />

                  <ResearchConversation
                    sessionId={currentSessionId}
                    loadedPersonas={loadedPersonas}
                    messages={messages}
                    isLoading={isLoading}
                    onSendMessage={sendMessage}
                    onSelectResponder={selectPersonaResponder}
                    projectId={projectId}
                  />
                </div>

                {/* Knowledge Base Sidebar */}
                {knowledgeBaseActive && (
                  <div className="w-80 border-l bg-muted/30">
                    <ConversationKnowledgeBase
                      sessionId={currentSessionId}
                      projectId={projectId}
                    />
                  </div>
                )}

                {/* AI Research Assistant Sidebar */}
                {assistantActive && !knowledgeBaseActive && (
                  <AIResearchAssistant
                    researchInsights={researchInsights}
                    suggestedQuestions={suggestedQuestions}
                    messages={messages}
                    onSendMessage={sendMessage}
                    loadedPersonasCount={loadedPersonas.length}
                  />
                )}
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

export default StructuredStudySession;
