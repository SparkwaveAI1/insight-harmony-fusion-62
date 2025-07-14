
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import ResearchInterface from "@/components/research/ResearchInterface";
import SurveyInterface from "@/components/research/SurveyInterface";
import { useResearchSession } from "@/components/research/hooks/useResearchSession";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, FileText, ArrowLeft } from "lucide-react";

const Research = () => {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'select' | 'research' | 'survey'>('select');
  const projectId = searchParams.get('project');
  
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

  const sessionData = {
    sessionId,
    loadedPersonas,
    projectDocuments,
    messages,
    isLoading
  };

  const renderModeSelection = () => (
    <div className="container h-full flex flex-col justify-center items-center p-6">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Research Module</h1>
          <p className="text-muted-foreground">
            Choose how you'd like to conduct your research with personas
          </p>
          {projectDocuments.length > 0 && (
            <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-md border border-green-200 inline-block">
              ✅ {projectDocuments.length} knowledge base document{projectDocuments.length !== 1 ? 's' : ''} available
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-blue-600" />
                Research Session
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">
                Interactive conversation with multiple personas. Ask questions and follow up dynamically.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Real-time conversation flow</li>
                <li>• Follow-up questions</li>
                <li>• Dynamic exploration</li>
                <li>• Up to 4 personas</li>
              </ul>
              <Button 
                onClick={() => setMode('research')} 
                className="w-full"
              >
                Start Research Session
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-green-600" />
                Survey Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">
                Structured questionnaire with predefined questions. Collect responses from multiple personas.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Predefined questions</li>
                <li>• Bulk persona surveying</li>
                <li>• CSV import/export</li>
                <li>• Up to 10 personas</li>
              </ul>
              <Button 
                onClick={() => setMode('survey')} 
                className="w-full"
                variant="outline"
              >
                Create Survey
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  if (mode === 'select') {
    return (
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <SidebarInset>
            <div className="relative flex min-h-svh flex-col">
              <Header />
              <main className="flex-1 min-h-0">
                <div className="flex items-center justify-between mb-4 pt-24 px-6 flex-shrink-0">
                  <SidebarTrigger className="hidden md:flex" />
                </div>
                {renderModeSelection()}
              </main>
              <Footer />
              <Toaster />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  if (mode === 'survey') {
    return (
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <SidebarInset>
            <div className="relative flex min-h-svh flex-col">
              <Header />
              <main className="flex-1 min-h-0">
                <div className="flex items-center justify-between mb-4 pt-24 px-6 flex-shrink-0">
                  <Button
                    variant="outline"
                    onClick={() => setMode('select')}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Research
                  </Button>
                  <SidebarTrigger className="hidden md:flex" />
                </div>
                <SurveyInterface onBack={() => setMode('select')} />
              </main>
              <Footer />
              <Toaster />
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
              <div className="container h-full flex flex-col">
                <div className="flex items-center justify-between mb-4 pt-24 flex-shrink-0">
                  <Button
                    variant="outline"
                    onClick={() => setMode('select')}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Research
                  </Button>
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
                    onSendToPersona={sendToPersona}
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
