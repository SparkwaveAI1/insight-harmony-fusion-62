
import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import HeroSection from "@/components/simulated-persona/HeroSection";
import HowItWorksSection from "@/components/simulated-persona/HowItWorksSection";
import UseCasesSection from "@/components/simulated-persona/UseCasesSection";
import WhyDifferentSection from "@/components/simulated-persona/WhyDifferentSection";
import SaveAccessSection from "@/components/simulated-persona/SaveAccessSection";

const SimulatedPersonaPage = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleGeneratePersona = () => {
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <HeroSection onGenerate={handleGeneratePersona} isGenerating={isGenerating} />
        <HowItWorksSection />
        <UseCasesSection />
        <WhyDifferentSection />
        <SaveAccessSection />
      </main>
      <Footer />
    </div>
  );
};

export default SimulatedPersonaPage;
