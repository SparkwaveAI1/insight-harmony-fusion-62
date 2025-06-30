import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Users, BookOpen, Sparkles } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import Section from '@/components/ui-custom/Section';
import Card from '@/components/ui-custom/Card';
import Button from '@/components/ui-custom/Button';
import Reveal from '@/components/ui-custom/Reveal';
import HowItWorksSection from '@/components/simulated-persona/HowItWorksSection';
import WhyDifferentSection from '@/components/simulated-persona/WhyDifferentSection';
import UseCasesSection from '@/components/simulated-persona/UseCasesSection';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <Section className="pt-32 pb-20">
        <div className="container px-4 mx-auto text-center">
          <Reveal>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-plasmik">
              Create Realistic <span className="text-accent">AI Personas</span>
            </h1>
          </Reveal>
          
          <Reveal delay={200}>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Generate behaviorally realistic personas, historical characters, and creative beings for research, storytelling, and innovation.
            </p>
          </Reveal>

          <Reveal delay={400}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" asChild>
                <Link to="/personas">
                  <Brain className="mr-2 h-5 w-5" />
                  Explore Personas
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/characters">
                  <Users className="mr-2 h-5 w-5" />
                  Browse Characters
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Module Selection Section */}
      <Section className="py-20 bg-muted/30">
        <div className="container px-4 mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-plasmik">
                Choose Your Module
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Three specialized modules for different types of AI personalities and use cases.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Persona Module */}
            <Reveal delay={100}>
              <Card className="p-8 text-center h-full flex flex-col hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Persona Module</h3>
                <p className="text-muted-foreground mb-6 flex-grow">
                  Research-grade behavioral personas with stable traits and psychologically grounded outputs. Perfect for academic research and behavioral studies.
                </p>
                <Button asChild className="w-full">
                  <Link to="/personas">
                    Enter Persona Module
                  </Link>
                </Button>
              </Card>
            </Reveal>

            {/* Historical Characters Module */}
            <Reveal delay={200}>
              <Card className="p-8 text-center h-full flex flex-col hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 mx-auto mb-6 bg-secondary/10 rounded-full flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Historical Characters</h3>
                <p className="text-muted-foreground mb-6 flex-grow">
                  Accurately modeled historical figures with verifiable traits, timelines, and public records. No fictional or speculative content.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/characters">
                    Browse Historical Figures
                  </Link>
                </Button>
              </Card>
            </Reveal>

            {/* Character Lab Module */}
            <Reveal delay={300}>
              <Card className="p-8 text-center h-full flex flex-col hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 mx-auto mb-6 bg-accent/10 rounded-full flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Character Lab</h3>
                <p className="text-muted-foreground mb-6 flex-grow">
                  Freeform character creation for storytelling, games, and simulations. Create any humanoid or non-humanoid being with complete creative freedom.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/characters/lab">
                    Enter Character Lab
                  </Link>
                </Button>
              </Card>
            </Reveal>
          </div>
        </div>
      </Section>

      <HowItWorksSection />
      <WhyDifferentSection />
      <UseCasesSection />
      <Footer />
    </div>
  );
};

export default Index;
