
import Header from "@/components/layout/Header";
import Hero from "@/components/sections/Hero";
import CustomAIPersonas from "@/components/sections/CustomAIPersonas";
import HowToUsePersonaAI from "@/components/sections/HowToUsePersonaAI";
import Features from "@/components/sections/Features";
import HowItWorks from "@/components/sections/HowItWorks";
import TokenEcosystem from "@/components/sections/TokenEcosystem";
import Footer from "@/components/sections/Footer";
import Section from "@/components/ui-custom/Section";
import Button from "@/components/ui-custom/Button";
import Reveal from "@/components/ui-custom/Reveal";
import { Link } from "react-router-dom";
import { ArrowRight, Search, Users, UserPlus } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        
        {/* Main Features Section - Place both sections side by side under hero */}
        <Section className="py-20 md:py-28">
          <div className="container px-4 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {/* PersonaAI Researcher Section */}
              <div className="bg-primary/5 rounded-xl p-8">
                <Reveal>
                  <h2 className="text-3xl font-bold mb-6 font-plasmik">
                    PersonaAI Researcher
                  </h2>
                </Reveal>
                
                <Reveal delay={100}>
                  <p className="text-muted-foreground text-pretty mb-8">
                    Leverage our AI-powered research tools to uncover qualitative insights at scale. 
                    From the Insights Conductor to AI Focus Groups, get the data you need fast.
                  </p>
                </Reveal>
                
                <Reveal delay={200}>
                  <div className="flex flex-col gap-4">
                    <Link to="/research#insights-conductor">
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="w-full group"
                      >
                        <Search className="mr-2 h-4 w-4" />
                        Insights Conductor
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                    <Link to="/research#ai-focus-groups">
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="w-full group"
                      >
                        <Users className="mr-2 h-4 w-4" />
                        AI Focus Groups
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </Reveal>
                
                <Reveal delay={300}>
                  <div className="mt-6">
                    <Link to="/research">
                      <Button 
                        variant="primary" 
                        size="lg" 
                        className="w-full group"
                      >
                        Explore All Research Solutions
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </Reveal>
              </div>
              
              {/* AI Interviewer Section */}
              <div className="bg-primary/5 rounded-xl p-8">
                <Reveal>
                  <h2 className="text-3xl font-bold mb-6 font-plasmik">
                    PersonaAI Interviewer
                  </h2>
                </Reveal>
                
                <Reveal delay={100}>
                  <p className="text-muted-foreground text-pretty mb-8">
                    Use AI-driven interviews to build accurate personas or conduct research studies at scale—
                    then leverage those personas for ongoing insights.
                  </p>
                </Reveal>
                
                <Reveal delay={200}>
                  <div className="flex flex-col gap-4">
                    <Link to="/persona-ai-interviewer">
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="w-full group"
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        PersonaAI Interviewer
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                    <Link to="/your-persona">
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="w-full group"
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Your AI Persona
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </Reveal>
                
                <Reveal delay={300}>
                  <div className="mt-6">
                    <Link to="/interviewer">
                      <Button 
                        variant="primary" 
                        size="lg" 
                        className="w-full group"
                      >
                        Explore AI Interviewer
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </Section>
        
        <CustomAIPersonas />
        <HowToUsePersonaAI />
        <Features />
        <HowItWorks />
        <TokenEcosystem />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
