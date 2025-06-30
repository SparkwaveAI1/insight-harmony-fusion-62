import Hero from "@/components/sections/Hero";
import CustomAIPersonas from "@/components/sections/CustomAIPersonas";
import HowItWorks from "@/components/sections/HowItWorks";
import InsightPaths from "@/components/sections/InsightPaths";
import PersonaBehavior from "@/components/sections/PersonaBehavior";
import TokenEcosystem from "@/components/sections/TokenEcosystem";
import CharactersHero from "@/components/sections/CharactersHero";

export interface HomepageSection {
  id: string;
  Component: React.ComponentType;
}

export const homepageSections: HomepageSection[] = [
  { id: 'hero', Component: Hero },
  { id: 'insightPaths', Component: InsightPaths },
  { id: 'howItWorks', Component: HowItWorks },
  { id: 'customAIPersonas', Component: CustomAIPersonas },
  { id: 'personaBehavior', Component: PersonaBehavior },
  {
    id: "characters-hero",
    Component: CharactersHero,
  },
  {
    id: "token-ecosystem",
    Component: TokenEcosystem,
  },
];
