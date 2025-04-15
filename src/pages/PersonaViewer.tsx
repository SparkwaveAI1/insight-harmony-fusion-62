
import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import Section from "@/components/ui-custom/Section";
import PersonaList from "@/components/personas/PersonaList";
import ViewerHeader from "@/components/personas/ViewerHeader";

const PersonaViewer = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Section className="bg-gradient-to-b from-accent/30 via-background to-background pt-24">
          <div className="container px-4 mx-auto">
            <ViewerHeader isLoading={isLoading} />
            <h1 className="text-3xl md:text-4xl font-bold mb-6 font-plasmik">Your Generated Personas</h1>
            <PersonaList />
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
};

export default PersonaViewer;

