
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FlaskConical, ArrowLeft, Bot, Users, Lightbulb, BookOpen, Target, Database, FileText, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import ResearchConversation from "@/components/research/ResearchConversation";
import { useResearchSession } from "@/components/research/hooks/useResearchSession";
import { toast } from "sonner";
import { ConversationKnowledgeBase } from "@/components/research/ConversationKnowledgeBase";

const StructuredStudySession = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session');
  const personasParam = searchParams.get('personas');
  const projectId = searchParams.get('project');
  
  const [researchInsights, setResearchInsights] = useState<string[]>([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
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
    projectId
  });

  // AI Research Assistant functionality
  const analyzeConversation = () => {
    if (messages.length < 3) return;

    // Mock insights - in real implementation, this would call an AI service
    const mockInsights = [
      "Participants show strong preference for mobile-first solutions",
      "Cost sensitivity is a recurring theme across responses",
      "User experience concerns mentioned 3 times",
      "Technology adoption patterns vary by demographic"
    ];

    const mockQuestions = [
      "What specific mobile features would be most valuable?",
      "How much would you be willing to pay for this solution?",
      "What would make you trust this technology more?",
      "How do you currently solve this problem?"
    ];

    setResearchInsights(mockInsights.slice(0, Math.min(3, Math.floor(messages.length / 2))));
    setSuggestedQuestions(mockQuestions.slice(0, Math.min(2, Math.floor(messages.length / 3))));
  };

  useEffect(() => {
    if (assistantActive && messages.length > 0) {
      const timer = setTimeout(() => analyzeConversation(), 2000);
      return () => clearTimeout(timer);
    }
  }, [messages.length, assistantActive]);

  if (!personasParam) {
    return (
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <SidebarInset>
            <div className="relative flex min-h-svh flex-col">
              <Header />
              <main className="flex-1 min-h-0 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2">No Study Session Found</h2>
                  <p className="text-muted-foreground mb-4">Please start a structured study session first.</p>
                  <Link to="/research/setup/structured">
                    <Button>Return to Study Setup</Button>
                  </Link>
                </div>
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
                  <div className="border-b p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Link to="/research/setup/structured">
                          <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Setup
                          </Button>
                        </Link>
                        
                        <Separator orientation="vertical" className="h-6" />
                        
                        <div className="flex items-center gap-2">
                          <FlaskConical className="h-5 w-5 text-primary" />
                          <h1 className="text-lg font-semibold">Structured Study Session</h1>
                        </div>
                        
                        {projectId && (
                          <Badge variant="outline">Project Session</Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {loadedPersonas.length} Persona{loadedPersonas.length !== 1 ? 's' : ''}
                        </Badge>
                        
                        <Button
                          variant={knowledgeBaseActive ? "default" : "outline"}
                          size="sm"
                          onClick={() => setKnowledgeBaseActive(!knowledgeBaseActive)}
                          className="gap-2"
                        >
                          <Database className="h-4 w-4" />
                          Knowledge Base
                        </Button>
                        
                        <Button
                          variant={assistantActive ? "default" : "outline"}
                          size="sm"
                          onClick={() => setAssistantActive(!assistantActive)}
                          className="gap-2"
                        >
                          <Bot className="h-4 w-4" />
                          AI Assistant
                        </Button>
                      </div>
                    </div>
                  </div>

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
                  <div className="w-80 border-l bg-muted/30">
                    <div className="p-4 border-b">
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="h-5 w-5 text-primary" />
                        <h2 className="font-semibold">Research Assistant</h2>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        AI-powered insights and guidance for your study
                      </p>
                    </div>

                    <div className="p-4 space-y-6">
                      {/* Real-time Insights */}
                      {researchInsights.length > 0 && (
                        <Card className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Lightbulb className="h-4 w-4 text-amber-500" />
                            <h3 className="font-medium text-sm">Key Insights</h3>
                          </div>
                          <div className="space-y-2">
                            {researchInsights.map((insight, index) => (
                              <div key={index} className="text-xs text-muted-foreground border-l-2 border-primary/20 pl-2">
                                {insight}
                              </div>
                            ))}
                          </div>
                        </Card>
                      )}

                      {/* Suggested Questions */}
                      {suggestedQuestions.length > 0 && (
                        <Card className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Target className="h-4 w-4 text-blue-500" />
                            <h3 className="font-medium text-sm">Suggested Questions</h3>
                          </div>
                          <div className="space-y-2">
                            {suggestedQuestions.map((question, index) => (
                              <Button
                                key={index}
                                variant="ghost"
                                size="sm"
                                className="w-full text-left justify-start h-auto p-2 text-xs"
                                onClick={() => {
                                  sendMessage(question);
                                  toast.success("Question sent to participants");
                                }}
                              >
                                {question}
                              </Button>
                            ))}
                          </div>
                        </Card>
                      )}

                      {/* Research Best Practices */}
                      <Card className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <BookOpen className="h-4 w-4 text-green-500" />
                          <h3 className="font-medium text-sm">Best Practices</h3>
                        </div>
                        <div className="space-y-2 text-xs text-muted-foreground">
                          <div>• Ask open-ended questions to encourage detailed responses</div>
                          <div>• Follow up on interesting insights with deeper questions</div>
                          <div>• Look for patterns across different persona responses</div>
                          <div>• Document key quotes and reactions for your report</div>
                        </div>
                      </Card>

                      {/* Session Stats */}
                      <Card className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Users className="h-4 w-4 text-purple-500" />
                          <h3 className="font-medium text-sm">Session Stats</h3>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Messages:</span>
                            <span>{messages.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Participants:</span>
                            <span>{loadedPersonas.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Insights:</span>
                            <span>{researchInsights.length}</span>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
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
