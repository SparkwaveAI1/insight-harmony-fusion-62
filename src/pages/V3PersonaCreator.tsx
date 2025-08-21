import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { V3PersonaCreator } from "@/components/persona-v3/V3PersonaCreator";
import { V3PersonaList } from "@/components/persona-v3/V3PersonaList";
import { PersonaV3 } from "@/types/persona-v3";
import { Sparkles, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const V3PersonaCreatorPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePersonaCreated = (persona: PersonaV3) => {
    console.log('✅ V3-Clean: Persona created, refreshing list:', persona.name);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <div className="relative flex min-h-svh flex-col">
            <Header />
            <main className="flex-1 pt-24">
              <div className="container py-6 max-w-6xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <SidebarTrigger className="hidden md:flex" />
                    <div>
                      <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Sparkles className="h-8 w-8 text-primary" />
                        V3 Persona Creator
                        <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">BETA</span>
                      </h1>
                      <p className="text-muted-foreground mt-1">
                        Create diverse, authentic personas with our advanced V3-Clean generation system
                      </p>
                    </div>
                  </div>
                </div>

                <Alert className="mb-6">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>V3-Clean Features:</strong> This new system creates more diverse and authentic personas 
                    with improved cultural backgrounds, realistic personality variations, and authentic communication styles. 
                    Generation typically takes 8-12 seconds and stores personas separately from the legacy system.
                  </AlertDescription>
                </Alert>

                <div className="space-y-8">
                  <V3PersonaCreator onPersonaCreated={handlePersonaCreated} />
                  <V3PersonaList refreshTrigger={refreshTrigger} />
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

export default V3PersonaCreatorPage;