
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
    selectPersonaResponder
  } = useResearchSession();

  // Show persona selector when there are personas loaded and the last message is from user
  const shouldShowPersonaSelector = () => {
    console.log('Checking persona selector visibility:', {
      messagesLength: messages.length,
      loadedPersonasLength: loadedPersonas.length,
      lastMessageRole: messages.length > 0 ? messages[messages.length - 1]?.role : 'none'
    });
    
    // Don't show if no personas loaded
    if (loadedPersonas.length === 0) {
      console.log('No personas loaded');
      return false;
    }
    
    // Don't show if no messages yet
    if (messages.length === 0) {
      console.log('No messages yet');
      return false;
    }
    
    // Show selector after user messages
    const lastMessage = messages[messages.length - 1];
    const shouldShow = lastMessage?.role === 'user';
    console.log('Last message role:', lastMessage?.role, 'Should show:', shouldShow);
    return shouldShow;
  };

  const showSelector = shouldShowPersonaSelector();
  console.log('Should show persona selector:', showSelector);

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
                
                {/* Persona Response Selector - Always Outside Chat Window */}
                {showSelector && (
                  <div className="mt-4 mb-8">
                    <PersonaResponseSelector
                      personas={loadedPersonas}
                      onSelect={selectPersonaResponder}
                      isVisible={true}
                    />
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

export default Research;
