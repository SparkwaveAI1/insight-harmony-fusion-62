import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import HowItWorks from "@/components/sections/HowItWorks";
import AIFocusGroupsSection from "@/components/sections/AIFocusGroupsSection";
import WhyPersonaAI from "@/components/sections/WhyPersonaAI";
import ProductShowcase from "@/components/sections/ProductShowcase";

export const homepageSections = [
  { id: "hero", Component: Hero },
  { id: "features", Component: Features },
  { id: "how-it-works", Component: HowItWorks },
  { id: "ai-focus-groups", Component: AIFocusGroupsSection },
  { id: "why-persona-ai", Component: WhyPersonaAI },
  { id: "product-showcase", Component: ProductShowcase },
];
