
import { User } from "lucide-react";
import Section from "../ui-custom/Section";
import Button from "../ui-custom/Button";
import Reveal from "../ui-custom/Reveal";

const CustomAIPersonas = () => {
  return (
    <Section id="custom-ai-personas" className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left side with gradient background and abstract shapes */}
          <div className="w-full md:w-1/3 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-indigo-100/50 -z-10 rounded-3xl" />
            <div className="h-64 md:h-80 relative overflow-hidden">
              <div className="absolute -left-10 top-10 w-40 h-40 bg-gradient-to-r from-primary/20 to-accent/30 rounded-full transform rotate-12 blur-xl" />
              <div className="absolute -right-10 bottom-10 w-32 h-32 bg-gradient-to-r from-accent/30 to-primary/20 rounded-full transform -rotate-12 blur-xl" />
              <div className="absolute left-20 bottom-20 w-24 h-24 bg-gradient-to-r from-primary/30 to-accent/40 rounded-full blur-lg" />
            </div>
          </div>

          {/* Right side with content */}
          <div className="w-full md:w-2/3">
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
              <Button size="lg" variant="primary" className="rounded-full px-8 py-3">
                Commission a Custom Persona
              </Button>
            </Reveal>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default CustomAIPersonas;
