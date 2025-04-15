
import { Brain, User } from "lucide-react";
import Section from "../ui-custom/Section";
import Card from "../ui-custom/Card";
import Reveal from "../ui-custom/Reveal";

const pathsData = [
  {
    icon: <User className="h-12 w-12 text-primary" />,
    title: "Interview Module",
    subtitle: "Human-Derived Personas",
    description: "Built through real interviews with human participants. Used for personal reflection, business tools, or market research. May be eligible for royalties in future releases.",
  },
  {
    icon: <Brain className="h-12 w-12 text-primary" />,
    title: "Simulation Module",
    subtitle: "AI Personas",
    description: "Built from probabilistic trait models. Used for testing decisions, messaging, or running focus groups. Includes both system-generated and user-prompted personas.",
  }
];

const InsightPaths = () => {
  return (
    <Section className="bg-gradient-to-b from-background to-secondary/30">
      <div className="container px-4 mx-auto">
        <Reveal>
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-plasmik">
              Two Paths to Insight
            </h2>
            <p className="text-muted-foreground">
              Choose between real human interviews or AI-simulated personas for your research needs
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-8">
          {pathsData.map((path, index) => (
            <Reveal key={index} delay={index * 100}>
              <Card className="p-8 h-full flex flex-col items-center text-center">
                <div className="mb-6 p-4 bg-primary/10 rounded-2xl">
                  {path.icon}
                </div>
                <h3 className="text-2xl font-bold mb-2">{path.title}</h3>
                <p className="text-primary font-medium mb-4">{path.subtitle}</p>
                <p className="text-muted-foreground">{path.description}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default InsightPaths;
