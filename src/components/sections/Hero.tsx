
import { ArrowRight, Zap, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../ui-custom/Button";
import Reveal from "../ui-custom/Reveal";

const Hero = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen pt-24 pb-16 flex items-center"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/50 via-background to-background -z-10" />
      
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal delay={100} animation="blur-in">
            <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl font-plasmik text-balance">
              AI-Powered Market Research with Research-Grade AI Personas
            </h1>
          </Reveal>
          
          <Reveal delay={200}>
            <p className="mb-10 text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
              AI Personas—digital consumers built from real human interviews. Run AI-driven focus groups, analyze sentiment shifts, and predict market behavior—faster and at scale.
            </p>
          </Reveal>
          
          <Reveal delay={300}>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                size="lg" 
                className="group"
                as={Link}
                to="/ai-focus-groups"
              >
                Run an AI Focus Group
                <Zap className="ml-2 h-4 w-4 transition-transform group-hover:scale-110" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                as={Link}
                to="/persona-ai-interviewer"
              >
                Try the PersonaAI Interviewer
                <MessageCircle className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="secondary" 
                size="lg"
                as="a"
                href="#qualitative-analysis"
              >
                Insights Conductor
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
      
      {/* Hero Image */}
      <Reveal delay={400} className="mt-16 max-w-5xl mx-auto px-6">
        <div className="relative aspect-[16/9] rounded-xl overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent product-image-mask pointer-events-none z-10" />
          <div className="bg-gradient-to-tr from-primary/20 to-accent/30 absolute inset-0" />
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:20px_20px]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Product visualization will appear here</p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
};

export default Hero;
