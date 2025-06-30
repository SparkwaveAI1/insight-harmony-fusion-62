
import { User, Brain, Bot } from "lucide-react";
import Section from "../ui-custom/Section";
import Card from "../ui-custom/Card";
import Reveal from "../ui-custom/Reveal";
import Button from "../ui-custom/Button";

const pathsData = [
  {
    icon: <Bot className="h-12 w-12 text-primary" />,
    title: "Simulation Module",
    subtitle: "AI Personas",
    description: "Create behaviorally realistic personas using natural language prompts or system-generated profiles. All personas are grounded in psychological modeling and simulate authentic, testable behavior.",
    buttonText: "Create a Simulated Persona",
    buttonHref: "/simulated-persona"
  },
  {
    icon: <Brain className="h-12 w-12 text-primary" />,
    title: "Research Module",
    subtitle: "PersonaAI Researcher",
    description: "Use personas—human or simulated—to explore decisions, test messaging, or simulate group behavior. Run interviews, focus groups, or scenario tests and extract qualitative insight at scale.",
    buttonText: "Run Research Simulations",
    buttonHref: "/research"
  },
  {
    icon: <User className="h-12 w-12 text-primary" />,
    title: "Interview Module",
    subtitle: "Human-Derived Personas",
    description: "Build a high-fidelity AI persona through a structured interview process. Ideal for personal reflection, business tools, or future licensed use in research.",
    note: "May be eligible for royalties in upcoming releases.",
    buttonText: "Start Persona Interview",
    buttonHref: "/interviewer",
    inDevelopment: true
  }
];

const InsightPaths = () => {
  return (
    <Section className="bg-gradient-to-b from-background to-secondary/30">
      <div className="container px-4 mx-auto">
        <Reveal>
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-plasmik">
              Three Paths to Insight
            </h2>
            <p className="text-muted-foreground">
              Choose your approach to persona-based research and insights
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pathsData.map((path, index) => (
            <Reveal key={index} delay={index * 100}>
              <Card className={`p-8 h-full flex flex-col items-center text-center relative ${path.inDevelopment ? 'opacity-80' : ''}`}>
                {path.inDevelopment && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-block px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full">
                      IN DEVELOPMENT
                    </span>
                  </div>
                )}
                <div className="mb-6 p-4 bg-primary/10 rounded-2xl">
                  {path.icon}
                </div>
                <h3 className="text-2xl font-bold mb-2">{path.title}</h3>
                <p className="text-primary font-medium mb-4">{path.subtitle}</p>
                <p className="text-muted-foreground mb-4">{path.description}</p>
                {path.note && (
                  <p className="text-sm text-primary/80 italic mb-6">{path.note}</p>
                )}
                <div className="mt-auto">
                  {path.inDevelopment ? (
                    <Button
                      variant="outline"
                      className="w-full cursor-not-allowed opacity-60"
                      onClick={(e) => e.preventDefault()}
                    >
                      {path.buttonText}
                    </Button>
                  ) : (
                    <Button
                      as="a"
                      href={path.buttonHref}
                      variant="primary"
                      className="w-full"
                    >
                      {path.buttonText}
                    </Button>
                  )}
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default InsightPaths;
