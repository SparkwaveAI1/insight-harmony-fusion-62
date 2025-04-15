
import { Drama, Repeat, Timer, Dna } from "lucide-react";
import Section from "../ui-custom/Section";
import Card from "../ui-custom/Card";
import Reveal from "../ui-custom/Reveal";

const features = [
  {
    icon: <Drama className="h-6 w-6 text-primary" />,
    title: "Cross-Model Trait Engine",
    description: "Combines Big Five, Moral Foundations, WVS, and Behavioral Economics."
  },
  {
    icon: <Repeat className="h-6 w-6 text-primary" />,
    title: "Contradiction = Realism",
    description: "We model inconsistency and tension, not archetypes."
  },
  {
    icon: <Timer className="h-6 w-6 text-primary" />,
    title: "Behavior Under Stress",
    description: "Test personas in high-pressure scenarios or ethical dilemmas."
  },
  {
    icon: <Dna className="h-6 w-6 text-primary" />,
    title: "Probabilistic Trait Generation",
    description: "Traits are rolled from real demographic distributions, not stereotypes."
  }
];

const PersonaBehavior = () => {
  return (
    <Section className="bg-slate-950">
      <div className="container px-4 mx-auto">
        <Reveal>
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-plasmik text-white">
              Why Our Personas Behave Like Real People
            </h2>
            <p className="text-gray-300">
              Our AI personas exhibit authentic human behaviors through sophisticated modeling
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Reveal key={index} delay={index * 100}>
              <Card className="bg-white/5 border-white/10 p-6 h-full">
                <div className="p-2 bg-primary/10 rounded-lg inline-block mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-medium mb-2 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-300">
                  {feature.description}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default PersonaBehavior;
