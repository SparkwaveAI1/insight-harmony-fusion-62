// Temporarily simplified to isolate the issue
import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";

export interface HomepageSection {
  id: string;
  Component: React.ComponentType;
}

// Start with just the core sections to test
export const homepageSections: HomepageSection[] = [
  { id: 'hero', Component: Hero },
  { id: 'howItWorks', Component: HowItWorks },
];