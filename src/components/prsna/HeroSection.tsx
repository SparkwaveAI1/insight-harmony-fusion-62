import { Link } from "react-router-dom";
import Reveal from "@/components/ui-custom/Reveal";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <div className="container px-4 mx-auto">
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
        <Reveal>
          <div className="inline-flex items-center justify-center bg-secondary/20 px-4 py-2 rounded-full mb-6">
            Web3 Intelligence
          </div>
        </Reveal>

        <Reveal delay={100}>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-plasmik">
            Building the Future of On-Chain Behavioral Intelligence
          </h1>
        </Reveal>
        
        <Reveal delay={200}>
          <p className="text-muted-foreground text-pretty mb-6">
            PersonaAI is live inside the Virtuals Agent Commerce Protocol (ACP) on Base blockchain, providing on-demand qualitative insights from thousands of AI personas. $PRSNA fuels realistic human simulations and is set to become a fundamental component of Web3 research.
          </p>
        </Reveal>

        <Reveal delay={250}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://app.virtuals.io/acp" target="_blank" rel="noopener noreferrer">
              <Button 
                variant="default" 
                size="lg" 
                className="group bg-gradient-to-r from-blue-500 to-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                Virtuals Butler
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </a>
            <Link to="/dashboard">
              <Button 
                variant="default" 
                size="lg" 
                className="group bg-gradient-to-r from-blue-500 to-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                Go To App
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
};

export default HeroSection;
