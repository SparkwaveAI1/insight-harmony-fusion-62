
import { User } from "lucide-react";
import { Link } from "react-router-dom";
import Section from "../ui-custom/Section";
import Button from "../ui-custom/Button";
import Reveal from "../ui-custom/Reveal";

const CustomAIPersonas = () => {
  return (
    <Section id="custom-ai-personas" className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left side with persona image grid */}
          <div className="w-full md:w-1/2 relative">
            <Reveal>
              <div className="rounded-xl overflow-hidden shadow-xl">
                <img 
                  src="/lovable-uploads/723fa150-405c-4fa6-aa1f-33398c934182.png" 
                  alt="Grid of diverse AI personas representing different demographics" 
                  className="w-full h-auto"
                />
              </div>
            </Reveal>
          </div>

          {/* Right side with content */}
          <div className="w-full md:w-1/2">
            <Reveal>
              <p className="text-primary text-lg mb-2">AI Persona</p>
            </Reveal>
            
            <Reveal delay={100}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 font-plasmik">
                <span className="text-primary">Custom AI Personas</span>
              </h2>
            </Reveal>
            
            <Reveal delay={200}>
              <p className="text-xl text-gray-700 mb-8">
                Your Users, Simulated. Get custom AI personas tailored to your audience—
                use them for market research, product testing, and strategic planning repeatedly.
              </p>
            </Reveal>
            
            <Reveal delay={300}>
              <Link to="/contact">
                <Button size="lg" variant="primary" className="rounded-full px-8 py-3">
                  Commission Custom Personas
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
