
import { User, Bot, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Section from "../ui-custom/Section";
import Button from "../ui-custom/Button";
import Reveal from "../ui-custom/Reveal";

const CustomAIPersonas = () => {
  return (
    <Section id="custom-ai-personas" className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left side with persona image grid */}
          <div className="w-full md:w-1/2 relative">
            <Reveal>
              <div className="rounded-xl overflow-hidden shadow-xl border border-gray-700">
                <img 
                  src="/lovable-uploads/723fa150-405c-4fa6-aa1f-33398c934182.png" 
                  alt="Grid of diverse AI personas representing different demographics" 
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>
              </div>
            </Reveal>
          </div>

          {/* Right side with content */}
          <div className="w-full md:w-1/2">
            <Reveal>
              <div className="inline-flex items-center justify-center bg-primary/20 px-4 py-2 rounded-full mb-2">
                <Bot className="h-5 w-5 text-primary mr-2" />
                <span className="text-sm font-medium text-primary">AI Persona</span>
              </div>
            </Reveal>
            
            <Reveal delay={100}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 font-plasmik">
                <span className="text-primary">Custom AI Personas</span>
              </h2>
            </Reveal>
            
            <Reveal delay={200}>
              <p className="text-xl text-gray-300 mb-8">
                Your Users, Simulated. Get custom AI personas tailored to your audience—
                use them for market research, product testing, and strategic planning repeatedly.
              </p>
            </Reveal>
            
            <Reveal delay={300}>
              <Link to="/contact">
                <Button 
                  size="lg" 
                  variant="primary" 
                  className="rounded-full px-8 py-3 bg-gradient-to-r from-primary to-primary/80 border-none"
                >
                  Commission Custom Personas
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default CustomAIPersonas;
