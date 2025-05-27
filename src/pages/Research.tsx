
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import ResearchInterface from "@/components/research/ResearchInterface";
import { PersonaResponseSelector } from "@/components/research/PersonaResponseSelector";
import { useResearchSession } from "@/components/research/hooks/useResearchSession";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";

const Research = () => {
  const {
    loadedPersonas,
    messages,
    autoMode,
    selectPersonaResponder
  } = useResearchSession();

  // Determine if persona selector should be shown
  const shouldShowPersonaSelector = () => {
    if (autoMode || messages.length === 0) return false;
    
    // Show selector after user messages
    const lastMessage = messages[messages.length - 1];
    return lastMessage?.role === 'user';
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <div className="relative flex min-h-svh flex-col">
            <Header />
            <main className="flex-1 pt-24">
              <div className="container h-full">
                <div className="flex items-center justify-between mb-4">
                  <SidebarTrigger className="hidden md:flex" />
                </div>
                <div className="h-[calc(100vh-2rem)]">
                  <ResearchInterface />
                </div>
                
                {/* Separate Persona Response Selector - Outside Chat Window */}
                <PersonaResponseSelector
                  personas={loadedPersonas}
                  onSelect={selectPersonaResponder}
                  isVisible={shouldShowPersonaSelector()}
                />
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
