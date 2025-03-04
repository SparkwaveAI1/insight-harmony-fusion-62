
import Header from "@/components/layout/Header";
import Hero from "@/components/sections/Hero";
import CustomAIPersonas from "@/components/sections/CustomAIPersonas";
import HowToUsePersonaAI from "@/components/sections/HowToUsePersonaAI";
import Features from "@/components/sections/Features";
import HowItWorks from "@/components/sections/HowItWorks";
import ProductShowcase from "@/components/sections/ProductShowcase";
import QualitativeAnalysis from "@/components/sections/QualitativeAnalysis";
import Footer from "@/components/sections/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        <CustomAIPersonas />
        <HowToUsePersonaAI />
        <Features />
        <HowItWorks />
        <QualitativeAnalysis />
        <ProductShowcase />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
