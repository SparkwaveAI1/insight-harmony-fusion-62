
import { Brain, UserRound, MessageSquare, Globe2 } from "lucide-react";
import Reveal from "@/components/ui-custom/Reveal";
import Card from "@/components/ui-custom/Card";

const researchModes = [
  {
    icon: <Brain className="h-8 w-8 text-primary" />,
    title: "Simulated Persona Research",
    description: "Create and test lifelike AI personas derived from structured traits. Run experiments on incentives, messaging, decision-making, and emotional response."
  },
  {
    icon: <UserRound className="h-8 w-8 text-primary" />,
    title: "Human-Derived Persona Research",
    description: "Use personas built from real interviews and pre-questionnaires. Ideal for behavioral segmentation, political research, or user modeling."
  },
  {
    icon: <MessageSquare className="h-8 w-8 text-primary" />,
    title: "Focus Groups & Dialogue Simulation",
    description: "Run 1-on-1s, multi-persona panels, or avatar-led sessions. Choose voice or text format. Ideal for concept testing, message refinement, and social dynamics analysis."
  },
  {
    icon: <Globe2 className="h-8 w-8 text-primary" />,
    title: "Insight Conductor",
    description: "Gather qualitative insights from the open web. Track sentiment shifts, cultural trends, and narrative framing in real time. Uses proprietary AI synthesis engine.",
    beta: true
  }
];

const ResearchModes = () => {
  return (
    <Section className="bg-muted/50">
      <div className="container px-4 mx-auto">
        <Reveal>
          <h2 className="text-3xl font-bold text-center mb-12 font-plasmik">
            Choose Your Research Mode
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {researchModes.map((mode, index) => (
            <Reveal key={index} delay={index * 100}>
              <Card className="p-6 h-full hover:border-primary/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                    {mode.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-xl mb-2">{mode.title}</h3>
                      {mode.beta && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Beta
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground">{mode.description}</p>
                  </div>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default ResearchModes;
