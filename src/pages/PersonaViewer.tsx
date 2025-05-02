
import React, { useState } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import Section from "@/components/ui-custom/Section";
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
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow">
          <Section className="bg-gradient-to-b from-[#F8F9FA] via-gray-50 to-background pt-24">
            <div className="container px-4 mx-auto">
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
          </Section>
        </main>
        <Footer />
      </div>
    </QueryClientProvider>
  );
};

export default PersonaViewer;
