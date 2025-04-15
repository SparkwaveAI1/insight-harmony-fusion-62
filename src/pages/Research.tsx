
import Header from "@/components/layout/Header";
import Section from "@/components/ui-custom/Section";
import Reveal from "@/components/ui-custom/Reveal";
import Footer from "@/components/sections/Footer";
import { ArrowRight, Bot, Users, Globe2, BookOpen, MessagesSquare, BrainCircuit, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "@/components/ui-custom/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Card from "@/components/ui-custom/Card";

const researchMethods = [
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "Persona-Based Research",
    description: "Interact with AI personas in 1-on-1s, focus groups, or town halls. Test messaging, incentives, decisions, and sentiment in controlled simulations."
  },
  {
    icon: <Globe2 className="h-8 w-8 text-primary" />,
    title: "Web-Driven Insight",
    description: "Use the Insights Conductor to pull real-time qualitative patterns from social and media data. Filter by voice, topic, and timeframe."
  }
];

const simulationTools = [
  {
    icon: <Users className="h-6 w-6 text-primary" />,
    title: "Focus Group Simulator",
    description: "Run moderated conversations with diverse personas and analyze group dynamics."
  },
  {
    icon: <MessagesSquare className="h-6 w-6 text-primary" />,
    title: "Message Tester",
    description: "Test ad copy, onboarding flows, or narratives and view emotional/behavioral response."
  },
  {
    icon: <BrainCircuit className="h-6 w-6 text-primary" />,
    title: "Decision Driver Analysis",
    description: "Pose dilemmas or options—see how different personas evaluate, choose, and justify."
  },
  {
    icon: <AlertTriangle className="h-6 w-6 text-primary" />,
    title: "Stress Behavior Probe",
    description: "Observe how personas react under uncertainty, contradiction, or risk pressure."
  }
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
                  Simulate Human Behavior. 
                  <br />
                  Discover Real Insight.
                </h1>
              </Reveal>
              
              <Reveal delay={100}>
                <p className="mb-10 text-lg text-muted-foreground max-w-3xl mx-auto">
                  PersonaAI lets you run behavioral research using AI personas that think, speak, 
                  and respond like real people—modeled from psychological traits or real interviews.
                </p>
              </Reveal>
              
              <Reveal delay={200}>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button size="lg" className="group">
                    Create Research Scenario
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <Button variant="secondary" size="lg">
                    Use Web Data
                    <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Beta</span>
                  </Button>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Choose Your Method Section */}
        <Section className="bg-muted/50">
          <div className="container px-4 mx-auto">
            <Reveal>
              <h2 className="text-3xl font-bold text-center mb-12 font-plasmik">
                Choose Your Method
              </h2>
            </Reveal>

            <Tabs defaultValue="personas" className="max-w-5xl mx-auto">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="personas">Persona-Based Research</TabsTrigger>
                <TabsTrigger value="web">Web-Driven Insight</TabsTrigger>
              </TabsList>
              {researchMethods.map((method, index) => (
                <TabsContent key={index} value={index === 0 ? "personas" : "web"}>
                  <Card className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {method.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{method.title}</h3>
                        <p className="text-muted-foreground">{method.description}</p>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </Section>

        {/* Simulation Toolkit Section */}
        <Section>
          <div className="container px-4 mx-auto">
            <Reveal>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 font-plasmik">
                  Design Experiments. Watch Personas Respond.
                </h2>
              </div>
            </Reveal>

            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {simulationTools.map((tool, index) => (
                <Reveal key={index} delay={index * 100}>
                  <Card className="p-6 h-full">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                        {tool.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">{tool.title}</h3>
                        <p className="text-sm text-muted-foreground">{tool.description}</p>
                      </div>
                    </div>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </Section>

        {/* Web Data Beta Section */}
        <Section className="bg-muted/50">
          <div className="container px-4 mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <Reveal>
                <h2 className="text-3xl font-bold mb-6 font-plasmik inline-flex items-center gap-2">
                  Web Perspective Extraction
                  <span className="text-sm bg-primary/10 text-primary px-2 py-0.5 rounded-full">Beta</span>
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Uncover themes, emotions, and shifts in online conversations from live and historical sources.
                </p>
                <Button size="lg">
                  Reveal the Conversation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Reveal>
            </div>
          </div>
        </Section>

        {/* Bring Your Personas Section */}
        <Section>
          <div className="container px-4 mx-auto">
            <div className="max-w-4xl mx-auto">
              <Reveal>
                <h2 className="text-3xl font-bold mb-8 text-center font-plasmik">
                  Bring Your Personas or Use Ours
                </h2>
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <Card className="p-6 text-center">
                    <Users className="h-8 w-8 mx-auto mb-4 text-primary" />
                    <p className="text-sm">Use human-derived personas (from interviews)</p>
                  </Card>
                  <Card className="p-6 text-center">
                    <Bot className="h-8 w-8 mx-auto mb-4 text-primary" />
                    <p className="text-sm">Create prompt-based simulated personas</p>
                  </Card>
                  <Card className="p-6 text-center">
                    <BookOpen className="h-8 w-8 mx-auto mb-4 text-primary" />
                    <p className="text-sm">Clone or vary traits for A/B testing</p>
                  </Card>
                </div>
                <div className="text-center">
                  <Button size="lg">View Sample Personas</Button>
                </div>
              </Reveal>
            </div>
          </div>
        </Section>

        {/* Footer CTA */}
        <Section className="bg-primary text-white">
          <div className="container px-4 mx-auto">
            <div className="max-w-3xl mx-auto text-center">
              <Reveal>
                <p className="text-lg mb-8">
                  Whether you're exploring political behavior, crypto incentives, or UX messaging—PersonaAI 
                  gives you a behavioral sandbox for real insight at scale.
                </p>
                <Button 
                  variant="secondary" 
                  size="lg"
                  className="group"
                >
                  Start a Research Project
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
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
