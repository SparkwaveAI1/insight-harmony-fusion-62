
import Header from "@/components/layout/Header";
import Section from "@/components/ui-custom/Section";
import Card from "@/components/ui-custom/Card";
import Button from "@/components/ui-custom/Button";
import Reveal from "@/components/ui-custom/Reveal";
import Footer from "@/components/sections/Footer";
import ContactDialog from "@/components/contact/ContactDialog";
import { ArrowRight, MessageSquare, UserPlus, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";

const Interviewer = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-24 pb-16">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-accent/30 via-background to-background -z-10" />
          
          <div className="container px-4 mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <Reveal>
                <p className="inline-block mb-4 px-3 py-1 text-xs font-medium tracking-wider text-primary uppercase bg-primary/10 rounded-full">
                  PersonaAI Interviewer
                </p>
              </Reveal>
              
              <Reveal delay={100} animation="blur-in">
                <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl font-plasmik text-balance">
                  Structured Interviews for Persona Creation & Research
                </h1>
              </Reveal>
              
              <Reveal delay={200}>
                <p className="mb-10 text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
                  Create rich, human-derived AI Personas or run research studies with real participants—using our automated interviewer designed for realism, depth, and scale.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Main Options Section */}
        <Section>
          <div className="container px-4 mx-auto">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              {/* Build a Persona Option */}
              <Reveal>
                <Card className="p-8 h-full flex flex-col">
                  <div className="mb-6 pb-6 border-b">
                    <h2 className="text-2xl font-bold mb-4 font-plasmik">1️⃣ Build a Persona</h2>
                    <p className="text-muted-foreground text-sm">For: Individuals, businesses, researchers</p>
                  </div>
                  
                  <div className="mb-8 flex-grow">
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <span className="text-primary">🔹</span>
                        <p>Create a human-derived AI Persona through a structured interview.</p>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary">🔹</span>
                        <p>Based on real decisions, not assumptions—your responses shape how the AI thinks.</p>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary">🔹</span>
                        <p>Use your Persona privately, in your business, or license it for future research and earn $PRSNA.</p>
                      </li>
                    </ul>
                    
                    <div className="mt-6 p-4 bg-muted/40 rounded-lg">
                      <h3 className="font-medium mb-2">Use Case:</h3>
                      <p className="text-sm text-muted-foreground">
                        Want to create a thinking replica of yourself for strategy, automation, or AI-based interaction? The Interviewer captures your values, thought patterns, and decision logic—then builds a persona you can use or monetize.
                      </p>
                    </div>
                  </div>
                  
                  <Link to="/persona-creation/landing">
                    <Button className="w-full justify-center group mt-auto">
                      Create a Persona
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </Card>
              </Reveal>
              
              {/* Conduct Custom Research Option */}
              <Reveal delay={200}>
                <Card className="p-8 h-full flex flex-col">
                  <div className="mb-6 pb-6 border-b">
                    <h2 className="text-2xl font-bold mb-4 font-plasmik">2️⃣ Conduct Custom Research</h2>
                    <p className="text-muted-foreground text-sm">For: Researchers, brands, protocols</p>
                  </div>
                  
                  <div className="mb-8 flex-grow">
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <span className="text-primary">🔹</span>
                        <p>Use the Interviewer to run qualitative research with real people.</p>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary">🔹</span>
                        <p>Consistent, scalable moderation—no human interviewer required.</p>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary">🔹</span>
                        <p>Extract beliefs, motivations, and emotional responses in real time.</p>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary">🔹</span>
                        <p>Analyze results through the PersonaAI dashboard for immediate strategic insight.</p>
                      </li>
                    </ul>
                    
                    <div className="mt-6 p-4 bg-muted/40 rounded-lg">
                      <h3 className="font-medium mb-2">Use Case:</h3>
                      <p className="text-sm text-muted-foreground">
                        Want to understand what's driving community churn or resistance to staking? The Interviewer collects and analyzes human responses, giving you narrative insight with the speed of automation.
                      </p>
                    </div>
                  </div>
                  
                  <ContactDialog 
                    triggerButton={
                      <Button className="w-full justify-center group mt-auto">
                        Conduct Custom Research
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    }
                    title="Start Custom Research Project"
                    formType="custom-persona"
                  />
                </Card>
              </Reveal>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
};

export default Interviewer;
