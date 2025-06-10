
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStructuredStudySession } from "@/services/structuredStudy/structuredStudyService";
import { toast } from "sonner";
import SessionHeader from "@/components/research/structured-session/SessionHeader";
import NoSessionFound from "@/components/research/structured-session/NoSessionFound";
import AIResearchAssistant from "@/components/research/structured-session/AIResearchAssistant";

const StructuredStudySession = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      if (!sessionId) {
        setIsLoading(false);
        return;
      }

      try {
        console.log("Loading session with ID:", sessionId);
        const sessionData = await getStructuredStudySession(sessionId);
        console.log("Session data loaded:", sessionData);
        
        if (sessionData) {
          setSession(sessionData);
        } else {
          console.log("No session data found");
          toast.error("Study session not found");
        }
      } catch (error) {
        console.error("Error loading session:", error);
        toast.error("Failed to load study session");
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, [sessionId]);

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
    return <NoSessionFound />;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <div className="relative flex min-h-svh flex-col">
            <Header />
            <main className="flex-1 pt-24">
              <div className="container py-6">
                <div className="flex items-center gap-4 mb-6">
                  <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <SessionHeader session={session} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <AIResearchAssistant session={session} />
                  </div>

                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Study Overview</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {session.study_goal && (
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">Study Goal</h4>
                            <p className="text-sm">{session.study_goal.description || "No description provided"}</p>
                          </div>
                        )}

                        {session.audience_definition && (
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">Target Audience</h4>
                            <p className="text-sm">{session.audience_definition.description || "No description provided"}</p>
                          </div>
                        )}

                        {session.research_format && (
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">Research Format</h4>
                            <p className="text-sm">{session.research_format.type || "Not specified"}</p>
                          </div>
                        )}

                        {session.output_goals && (
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">Output Goals</h4>
                            <p className="text-sm">{session.output_goals.description || "No description provided"}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
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
};

export default StructuredStudySession;
