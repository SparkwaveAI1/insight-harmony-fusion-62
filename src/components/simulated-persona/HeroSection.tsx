
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import Button from "@/components/ui-custom/Button";
import Reveal from "@/components/ui-custom/Reveal";
import Card from "@/components/ui-custom/Card";
import Section from "@/components/ui-custom/Section";  // Add this import

interface HeroSectionProps {
  onGenerate: () => void;
  isGenerating: boolean;
}

const HeroSection = ({ onGenerate, isGenerating }: HeroSectionProps) => {
  const [prompt, setPrompt] = useState("");

  return (
    <Section className="bg-gradient-to-b from-accent/50 via-background to-background pt-24">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center font-plasmik">
              Build a Behaviorally Accurate AI Persona
            </h1>
            <p className="text-lg text-muted-foreground text-center mb-12">
              Describe who you need. Our system will generate a simulated persona based on probabilistic 
              psychological modeling—ready for interviews, testing, or focus groups.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <Card className="p-6 mb-8">
              <label className="text-sm font-medium mb-2 block">Describe your persona:</label>
              <Textarea 
                placeholder="Example: 23-year-old Latina marketing associate from Arizona, distrusts politics, loves gaming"
                className="mb-4 min-h-[100px]"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <Button 
                onClick={onGenerate}
                className="w-full" 
                disabled={!prompt.trim() || isGenerating}
              >
                {isGenerating ? (
                  <>Generating Persona <span className="ml-2 animate-pulse">...</span></>
                ) : (
                  <>Generate Persona</>
                )}
              </Button>
            </Card>
          </Reveal>
        </div>
      </div>
    </Section>
  );
};

export default HeroSection;
