
import { useState } from "react";
import { ArrowRight, Brain, Users, MessagesSquare, Test, Vote, Copy, UserPlus, Save, FileJson, Shuffle } from "lucide-react";
import Header from "@/components/layout/Header";
import Section from "@/components/ui-custom/Section";
import Reveal from "@/components/ui-custom/Reveal";
import Card from "@/components/ui-custom/Card";
import Button from "@/components/ui-custom/Button";
import { Textarea } from "@/components/ui/textarea";
import Footer from "@/components/sections/Footer";

const SimulatedPersonaPage = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleGeneratePersona = () => {
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <Section className="bg-gradient-to-b from-accent/50 via-background to-background pt-24">
          <div className="container px-4 mx-auto">
            <div className="max-w-3xl mx-auto">
              <Reveal>
                <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center font-plasmik">
                  Build a Behaviorally Accurate AI Persona
                </h1>
                <p className="text-lg text-muted-foreground text-center mb-12">
                  Describe who you need. Our system will generate a simulated persona based on probabilistic 
                  psychological modeling—ready for interviews, testing, or focus groups.
                </p>
              </Reveal>

              <Reveal delay={100}>
                <div className="bg-card rounded-xl shadow-sm p-6 mb-8">
                  <label className="text-sm font-medium mb-2 block">Describe your persona:</label>
                  <Textarea 
                    placeholder="Example: 23-year-old Latina marketing associate from Arizona, distrusts politics, loves gaming and DAOs"
                    className="mb-4 min-h-[100px]"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                  <Button 
                    onClick={handleGeneratePersona}
                    className="w-full" 
                    disabled={!prompt.trim() || isGenerating}
                  >
                    {isGenerating ? (
                      <>Generating Persona <span className="ml-2 animate-pulse">...</span></>
                    ) : (
                      <>Generate Persona</>
                    )}
                  </Button>
                </div>
              </Reveal>
            </div>
          </div>
        </Section>

        {/* How It Works Section */}
        <Section>
          <div className="container px-4 mx-auto">
            <Reveal>
              <h2 className="text-3xl font-bold text-center mb-12 font-plasmik">
                Not Just a Prompt. A Simulated Mind.
              </h2>
            </Reveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
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
              ].map((item, index) => (
                <Reveal key={index} delay={index * 100}>
                  <Card className="p-6 h-full flex flex-col items-center text-center">
                    <div className="p-3 bg-primary/10 rounded-full mb-4">
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

        {/* Use Cases Section */}
        <Section className="bg-muted/30">
          <div className="container px-4 mx-auto">
            <Reveal>
              <h2 className="text-3xl font-bold text-center mb-12 font-plasmik">
                Use Your Persona for Research, Strategy, or Simulation
              </h2>
            </Reveal>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
                {
                  icon: <Test className="h-6 w-6 text-primary" />,
                  title: "Run Behavioral Interviews",
                  description: "Explore how they think, decide, and rationalize."
                },
                {
                  icon: <Vote className="h-6 w-6 text-primary" />,
                  title: "Test Reactions",
                  description: "Simulate how your persona responds to a new app, a political message, or an economic scenario."
                },
                {
                  icon: <Copy className="h-6 w-6 text-primary" />,
                  title: "Clone & Compare",
                  description: "Modify income, age, or stress level to compare behavior."
                },
                {
                  icon: <UserPlus className="h-6 w-6 text-primary" />,
                  title: "Join Group Sessions",
                  description: "Add them to a focus group with other personas or humans."
                }
              ].map((useCase, index) => (
                <Reveal key={index} delay={index * 100}>
                  <Card className="p-6 h-full">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg shrink-0">
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

        {/* Why Ours Are Different Section */}
        <Section>
          <div className="container px-4 mx-auto">
            <div className="max-w-3xl mx-auto">
              <Reveal>
                <h2 className="text-3xl font-bold text-center mb-8 font-plasmik">
                  Realistic Personas. No Stereotypes.
                </h2>
              </Reveal>

              <Reveal delay={100}>
                <Card className="p-6 mb-8">
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                        <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Demographic distributions sourced from Pew, WVS, Gallup</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                        <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Traits include risk, trust, political orientation, impulse control, empathy</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                        <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Nonlinear interactions between traits = emergent behavior</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                        <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Stored as structured .json files for advanced use</span>
                    </li>
                  </ul>
                </Card>
              </Reveal>

              <Reveal delay={200}>
                <div className="text-center">
                  <Button variant="outline">
                    See a Sample Persona
                    <FileJson className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </Reveal>
            </div>
          </div>
        </Section>

        {/* Save & Access Section */}
        <Section className="bg-muted/30">
          <div className="container px-4 mx-auto">
            <Reveal>
              <h2 className="text-3xl font-bold text-center mb-8 font-plasmik">
                Save & Access
              </h2>
            </Reveal>

            <Reveal delay={100}>
              <div className="max-w-3xl mx-auto mb-8">
                <Card className="p-6">
                  <p className="text-center text-muted-foreground mb-6">
                    Save your persona to your account, export it for integration with PersonaAI tools, 
                    or use it immediately in a research session.
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center">
                    <Button>
                      <Save className="mr-2 h-4 w-4" />
                      Save Persona
                    </Button>
                    <Button variant="secondary">
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Use in Research
                    </Button>
                    <Button variant="outline">
                      <Copy className="mr-2 h-4 w-4" />
                      Clone or Modify
                    </Button>
                  </div>
                </Card>
              </div>
            </Reveal>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
};

export default SimulatedPersonaPage;
