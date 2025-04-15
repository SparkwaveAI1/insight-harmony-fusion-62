
import Header from "@/components/layout/Header";
import Section from "@/components/ui-custom/Section";
import Reveal from "@/components/ui-custom/Reveal";
import Footer from "@/components/sections/Footer";
import { ArrowRight, Brain, Users, UserRound, Globe2, Check, MessageSquare, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "@/components/ui-custom/Button";
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

const researchOutcomes = [
  "Identify consumer motivations",
  "Test behavioral response to product changes",
  "Analyze trends and competitor signals",
  "Back insights with structured, traceable reasoning"
];

const Research = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative min-h-[70vh] pt-24 pb-16 flex items-center">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-accent/50 via-background to-background -z-10" />
          
          <div className="container px-4 mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <Reveal>
                <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl font-plasmik">
                  Run Advanced Behavioral Research with AI or Human-Based Personas
                </h1>
              </Reveal>
              
              <Reveal delay={100}>
                <p className="mb-10 text-lg text-muted-foreground max-w-3xl mx-auto">
                  PersonaAI lets you conduct qualitative research using advanced AI personas or 
                  real human-derived profiles—delivering deep insights at scale.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Research Modes Section */}
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

        {/* Research Outcomes Section */}
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
      </main>
      <Footer />
    </div>
  );
};

export default Research;
