
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
import { useParams } from "react-router-dom";
import { Persona } from "@/services/persona/types";

// Create a QueryClient for this route
const queryClient = new QueryClient();

const PersonaViewer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { personaId } = useParams<{ personaId?: string }>();
  const [personas, setPersonas] = useState<Persona[]>([]);

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
                        Persona Library
                      </h1>
                      <div className="w-32 h-1 bg-primary mb-6"></div>
                      <PersonaList onPersonasLoad={setPersonas} />
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
