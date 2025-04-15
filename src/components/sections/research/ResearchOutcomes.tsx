
import { Check, ArrowRight, Zap, MessageSquare } from "lucide-react";
import Reveal from "@/components/ui-custom/Reveal";
import Button from "@/components/ui-custom/Button";

const researchOutcomes = [
  "Identify consumer motivations",
  "Test behavioral response to product changes",
  "Analyze trends and competitor signals",
  "Back insights with structured, traceable reasoning"
];

const ResearchOutcomes = () => {
  return (
    <Section>
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <p className="text-xl mb-8 text-balance">
              Whether you're running experiments or tracking the market, PersonaAI delivers 
              qualitative clarity—faster and at scale.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mb-12 max-w-2xl mx-auto">
              {researchOutcomes.map((outcome, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-4 bg-card rounded-lg border"
                >
                  <Check className="h-5 w-5 text-primary shrink-0" />
                  <p>{outcome}</p>
                </div>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="group">
                Create Research Scenario
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" size="lg" className="group">
                Use Insight Conductor
                <Zap className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="secondary" size="lg" className="group">
                Talk to a Persona
                <MessageSquare className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
};

export default ResearchOutcomes;
