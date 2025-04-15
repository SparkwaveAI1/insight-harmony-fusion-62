
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import Section from "@/components/ui-custom/Section";
import Button from "@/components/ui-custom/Button";
import PersonaList from "@/components/personas/PersonaList";

const PersonaViewer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Section className="bg-gradient-to-b from-accent/30 via-background to-background pt-24">
          <div className="container px-4 mx-auto">
            <div className="flex items-center justify-between mb-6">
              <Button 
                variant="ghost" 
                onClick={() => navigate(-1)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="gap-2"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
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
