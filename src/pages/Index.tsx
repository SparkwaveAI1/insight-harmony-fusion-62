
import Header from "@/components/layout/Header";
import Hero from "@/components/sections/Hero";
import CustomAIPersonas from "@/components/sections/CustomAIPersonas";
import HowItWorks from "@/components/sections/HowItWorks";
import InsightPaths from "@/components/sections/InsightPaths";
import PersonaBehavior from "@/components/sections/PersonaBehavior";
import SimulatedPersona from "@/components/sections/SimulatedPersona";
import TokenEcosystem from "@/components/sections/TokenEcosystem";
import Footer from "@/components/sections/Footer";
import { Toaster } from "@/components/ui/toaster";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        <InsightPaths />
        <HowItWorks />
        <CustomAIPersonas />
        <PersonaBehavior />
        <SimulatedPersona />
        <TokenEcosystem />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
};

export default Index;
