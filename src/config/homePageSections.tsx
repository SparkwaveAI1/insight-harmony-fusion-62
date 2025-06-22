import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import Features from "@/components/sections/Features";
import PersonaBehavior from "@/components/sections/PersonaBehavior";
import CustomAIPersonas from "@/components/sections/CustomAIPersonas";
import HowToUsePersonaAI from "@/components/sections/HowToUsePersonaAI";
import ProductShowcase from "@/components/sections/ProductShowcase";
import QualitativeAnalysis from "@/components/sections/QualitativeAnalysis";
import InsightPaths from "@/components/sections/InsightPaths";
import TokenEcosystem from "@/components/sections/TokenEcosystem";
import WhyPersonaAI from "@/components/sections/WhyPersonaAI";
import CharacterSection from "@/components/sections/CharacterSection";

export const homepageSections = [
  { id: "hero", Component: Hero },
  { id: "how-it-works", Component: HowItWorks },
  { id: "features", Component: Features },
  { id: "persona-behavior", Component: PersonaBehavior },
  { id: "custom-ai-personas", Component: CustomAIPersonas },
  { id: "how-to-use", Component: HowToUsePersonaAI },
  { id: "product-showcase", Component: ProductShowcase },
  { id: "qualitative-analysis", Component: QualitativeAnalysis },
  { id: "insight-paths", Component: InsightPaths },
  { id: "character-section", Component: CharacterSection },
  { id: "token-ecosystem", Component: TokenEcosystem },
  { id: "why-persona-ai", Component: WhyPersonaAI },
];
