
import { User, Users, TrendingUp, Search, Briefcase } from "lucide-react";
import Section from "../ui-custom/Section";
import Card from "../ui-custom/Card";
import Reveal from "../ui-custom/Reveal";

const features = [
  {
    icon: <User className="h-6 w-6 text-primary" />,
    title: "AI Personas",
    description: "High-fidelity consumer simulations built from structured interviews."
  },
  {
    icon: <Users className="h-6 w-6 text-primary" />,
    title: "AI-Driven Focus Groups",
    description: "Test messaging, branding, and concepts instantly."
  },
  {
    icon: <TrendingUp className="h-6 w-6 text-primary" />,
    title: "Market Simulation",
    description: "Predict buying behavior using AI-driven personas."
  },
  {
    icon: <Search className="h-6 w-6 text-primary" />,
    title: "Qualitative Trend Analysis",
    description: "Identify sentiment shifts & hidden consumer patterns."
  },
  {
    icon: <Briefcase className="h-6 w-6 text-primary" />,
    title: "Custom B2B Research Tools",
    description: "Enterprise licensing, private research AI models."
  }
];

const Features = () => {
  return (
    <Section id="features">
      <div className="container px-4 mx-auto">
        <Reveal>
          <div className="max-w-2xl mx-auto text-center mb-16">
            <p className="inline-block mb-4 px-3 py-1 text-xs font-medium tracking-wider text-primary uppercase bg-primary/10 rounded-full">
              Features
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-plasmik">
              Advanced Research Features
            </h2>
            <p className="text-muted-foreground text-pretty">
              Our platform combines powerful AI-driven tools with an intuitive interface, making qualitative research more efficient and insightful.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Reveal key={index} delay={100 * index}>
              <Card className="h-full hover:shadow-md transition-all duration-300">
                <div className="p-2 bg-primary/10 rounded-lg inline-block mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default Features;
