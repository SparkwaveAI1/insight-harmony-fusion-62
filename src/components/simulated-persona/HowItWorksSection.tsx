
import { Brain, MessagesSquare, Shuffle, Users } from "lucide-react";
import Section from "@/components/ui-custom/Section";
import Card from "@/components/ui-custom/Card";
import Reveal from "@/components/ui-custom/Reveal";

const features = [
  {
    icon: <MessagesSquare className="h-10 w-10 text-primary" />,
    title: "Natural Language Input",
    description: "Describe the persona you want—no sliders or menus needed."
  },
  {
    icon: <Brain className="h-10 w-10 text-primary" />,
    title: "Trait Engine Activation",
    description: "We parse your prompt into probabilistic trait weights using Big Five, Moral Foundations, Behavioral Econ, and more."
  },
  {
    icon: <Shuffle className="h-10 w-10 text-primary" />,
    title: "Contradiction Logic",
    description: "Personas are generated with tension, complexity, and realism—not archetypes."
  },
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: "Ready to Interact",
    description: "Simulated personas can engage in research sessions, respond to prompts, or join focus groups."
  }
];

const HowItWorksSection = () => {
  return (
    <Section className="bg-muted/30 py-16">
      <div className="container px-4 mx-auto">
        <Reveal>
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2 font-plasmik">
              Not Just a Prompt. A Simulated Mind.
            </h2>
            <div className="w-24 h-1 bg-accent mx-auto mb-12"></div>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((item, index) => (
            <Reveal key={index} delay={index * 100}>
              <Card className="p-6 h-full flex flex-col items-center text-center border-t-2 border-t-accent shadow-sm">
                <div className="p-3 bg-muted rounded-full mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default HowItWorksSection;
