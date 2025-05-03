
import React, { useState } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Toaster } from "@/components/ui/toaster";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import PersonaList from "@/components/personas/PersonaList";
import ViewerHeader from "@/components/personas/ViewerHeader";
import PersonaFetcher from "@/components/personas/PersonaFetcher";
import PersonaSummary from "@/components/personas/PersonaSummary";
import { useParams, useLocation } from "react-router-dom";
import { Persona } from "@/services/persona/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Construction } from "lucide-react";

// Create a QueryClient for this route
const queryClient = new QueryClient();

const PersonaViewer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { personaId } = useParams<{ personaId?: string }>();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const location = useLocation();
  
  // Determine if we're in the public library view
  const isLibraryView = location.pathname.includes('/persona-library');

  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <SidebarInset>
            <div className="relative flex min-h-svh flex-col">
              <Header />
              <main className="flex-1 pt-24">
                <div className="container py-6">
                  <ViewerHeader isLoading={isLoading} />
                  
                  {personaId ? (
                    <>
                      <h1 className="text-3xl md:text-4xl font-bold mb-2 font-plasmik">
                        Persona Details
                      </h1>
                      <div className="w-32 h-1 bg-primary mb-6"></div>
                      <PersonaFetcher personaId={personaId} />
                    </>
                  ) : (
                    <>
                      <h1 className="text-3xl md:text-4xl font-bold mb-2 font-plasmik">
                        {isLibraryView ? "Persona Library" : "My Personas"}
                      </h1>
                      {isLibraryView && (
                        <p className="text-muted-foreground mb-2">
                          Browse publicly shared personas from our community
                        </p>
                      )}
                      <div className="w-32 h-1 bg-accent mb-6"></div>
                      
                      {/* Development warning */}
                      <Alert className="mb-6 border-amber-500 bg-amber-50 dark:bg-amber-950/20">
                        <Construction className="h-5 w-5 text-amber-500" />
                        <AlertTitle className="text-amber-600">Under Development</AlertTitle>
                        <AlertDescription className="text-amber-600">
                          Some features of the persona viewer are still under development and may not function correctly.
                        </AlertDescription>
                      </Alert>
                      
                      <PersonaList 
                        onPersonasLoad={setPersonas} 
                        publicOnly={isLibraryView}
                      />
                      {personas.length > 0 && <PersonaSummary personas={personas} />}
                    </>
                  )}
                </div>
              </main>
              <Footer />
              <Toaster />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </QueryClientProvider>
  );
};

export default PersonaViewer;
