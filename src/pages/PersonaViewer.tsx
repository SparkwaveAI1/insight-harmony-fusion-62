
import React, { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import Section from "@/components/ui-custom/Section";
import PersonaList from "@/components/personas/PersonaList";
import ViewerHeader from "@/components/personas/ViewerHeader";
import PersonaFetcher from "@/components/personas/PersonaFetcher";
import PersonaSummary from "@/components/personas/PersonaSummary";
import { useParams } from "react-router-dom";

const PersonaViewer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { personaId } = useParams<{ personaId?: string }>();
  const [personas, setPersonas] = useState<any[]>([]);

  console.log("PersonaViewer - Current personaId from URL:", personaId);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Section className="bg-gradient-to-b from-accent/30 via-background to-background pt-24">
          <div className="container px-4 mx-auto">
            <ViewerHeader isLoading={isLoading} />
            
            {personaId ? (
              <>
                <h1 className="text-3xl md:text-4xl font-bold mb-6 font-plasmik">Persona Details</h1>
                <PersonaFetcher personaId={personaId} />
              </>
            ) : (
              <>
                <h1 className="text-3xl md:text-4xl font-bold mb-6 font-plasmik">Your Generated Personas</h1>
                <PersonaList onPersonasLoad={setPersonas} />
                {personas.length > 0 && <PersonaSummary personas={personas} />}
              </>
            )}
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
};

export default PersonaViewer;
