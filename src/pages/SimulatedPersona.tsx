
import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import HeroSection from "@/components/simulated-persona/HeroSection";
import HowItWorksSection from "@/components/simulated-persona/HowItWorksSection";
import UseCasesSection from "@/components/simulated-persona/UseCasesSection";
import WhyDifferentSection from "@/components/simulated-persona/WhyDifferentSection";

const SimulatedPersonaPage = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleGeneratePersona = () => {
    // Toggle the generating state
    setIsGenerating(prevState => !prevState);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow">
        <HeroSection onGenerate={handleGeneratePersona} isGenerating={isGenerating} />
        <HowItWorksSection />
        <UseCasesSection />
        <WhyDifferentSection />
      </main>
      <Footer />
    </div>
  );
};

export default SimulatedPersonaPage;
