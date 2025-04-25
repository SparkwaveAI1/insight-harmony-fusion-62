
import { Rocket, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "@/components/ui-custom/Button";
import Reveal from "@/components/ui-custom/Reveal";

interface RoadmapPhase {
  title: string;
  description: string;
}

const roadmapPhases: RoadmapPhase[] = [
  {
    title: "Today",
    description: "Contribute personas & participate in AI research."
  },
  {
    title: "Coming Soon",
    description: "ERC-6551: Every persona becomes an on-chain cognitive asset."
  },
  {
    title: "Token Utility",
    description: "$PRSNA activates for simulations, licensing, and ecosystem incentives."
  },
  {
    title: "Ecosystem",
    description: "Integration with Virtuals, GAME, and DAO governance simulations."
  }
];

const RoadmapSection = () => {
  return (
    <div className="container px-4 mx-auto">
      <div className="max-w-4xl mx-auto">
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">
            🚀 $PRSNA Roadmap: Powering Behavioral Intelligence
          </h2>
        </Reveal>

        <Reveal delay={100}>
          <div className="grid gap-6 my-12">
            {roadmapPhases.map((phase, index) => (
              <div 
                key={phase.title}
                className="relative flex items-center gap-6 bg-gray-800/50 rounded-lg p-6 border border-gray-700"
              >
                <div className="absolute left-0 top-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary" />
                {index < roadmapPhases.length - 1 && (
                  <div className="absolute left-0 top-[calc(50%+1rem)] -translate-x-1/2 w-0.5 h-[calc(100%+1.5rem)] bg-gray-700" />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-1">
                    {phase.title}
                  </h3>
                  <p className="text-gray-300">
                    {phase.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
        
        <Reveal delay={200}>
          <div className="text-center">
            <a 
              href="https://x.com/PersonaAI_agent" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button 
                variant="primary" 
                size="lg"
                className="group bg-gradient-to-r from-primary to-primary/80 border-none"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Follow Our Progress
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 ml-2" />
              </Button>
            </a>
          </div>
        </Reveal>
      </div>
    </div>
  );
};

export default RoadmapSection;
