import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import AIFocusGroupsSection from "@/components/sections/AIFocusGroupsSection";
import WhyPersonaAI from "@/components/sections/WhyPersonaAI";
import TokenEcosystem from "@/components/sections/TokenEcosystem";

export const homepageSections = [
  { id: "hero", Component: Hero },
  { id: "how-it-works", Component: HowItWorks },
  { id: "ai-focus-groups", Component: AIFocusGroupsSection },
  { id: "why-persona-ai", Component: WhyPersonaAI },
  { id: "token-ecosystem", Component: TokenEcosystem },
];
