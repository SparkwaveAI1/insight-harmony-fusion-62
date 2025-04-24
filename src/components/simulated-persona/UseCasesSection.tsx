
import { Microscope, Vote, Copy, UserPlus } from "lucide-react";
import Section from "@/components/ui-custom/Section";
import Card from "@/components/ui-custom/Card";
import Reveal from "@/components/ui-custom/Reveal";

const useCases = [
  {
    icon: <Microscope className="h-6 w-6 text-accent-foreground" />,
    title: "Run Behavioral Interviews",
    description: "Explore how they think, decide, and rationalize."
  },
  {
    icon: <Vote className="h-6 w-6 text-accent-foreground" />,
    title: "Test Reactions",
    description: "Simulate how your persona responds to a new app, a political message, or an economic scenario."
  },
  {
    icon: <Copy className="h-6 w-6 text-accent-foreground" />,
    title: "Clone & Compare",
    description: "Modify income, age, or stress level to compare behavior."
  },
  {
    icon: <UserPlus className="h-6 w-6 text-accent-foreground" />,
    title: "Join Group Sessions",
    description: "Add them to a focus group with other personas or humans."
  }
];

const UseCasesSection = () => {
  return (
    <Section className="bg-white py-16">
      <div className="container px-4 mx-auto">
        <Reveal>
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2 font-plasmik">
              Use Your Persona for Research, Strategy, or Simulation
            </h2>
            <div className="w-32 h-1 bg-accent mx-auto mb-12"></div>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {useCases.map((useCase, index) => (
            <Reveal key={index} delay={index * 100}>
              <Card className="p-6 h-full border-l-4 border-l-accent shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-accent/20 rounded-lg shrink-0">
                    {useCase.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{useCase.title}</h3>
                    <p className="text-sm text-muted-foreground">{useCase.description}</p>
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

export default UseCasesSection;
