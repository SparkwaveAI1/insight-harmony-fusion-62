
import Header from "@/components/layout/Header";
import Hero from "@/components/sections/Hero";
import WhyPersonaAI from "@/components/sections/WhyPersonaAI";
import CustomAIPersonas from "@/components/sections/CustomAIPersonas";
import Features from "@/components/sections/Features";
import ProductShowcase from "@/components/sections/ProductShowcase";
import QualitativeAnalysis from "@/components/sections/QualitativeAnalysis";
import Footer from "@/components/sections/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        <WhyPersonaAI />
        <CustomAIPersonas />
        <Features />
        <QualitativeAnalysis />
        <ProductShowcase />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
