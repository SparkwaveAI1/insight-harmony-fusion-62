
import { User, Bot, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import Section from "../ui-custom/Section";
import Button from "../ui-custom/Button";
import Reveal from "../ui-custom/Reveal";

const CustomAIPersonas = () => {
  return (
    <Section id="custom-ai-personas" className="bg-gradient-to-r from-gray-950 to-gray-900 text-white">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left side with persona image grid */}
          <div className="w-full md:w-1/2 relative">
            <Reveal>
              <div className="rounded-xl overflow-hidden shadow-xl border border-gray-800 hover:border-primary/40 transition-all">
                <img 
                  src="/lovable-uploads/723fa150-405c-4fa6-aa1f-33398c934182.png" 
                  alt="Grid of diverse AI personas representing different demographics" 
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-70"></div>
                
                {/* Video avatar badge */}
                <div className="absolute top-4 right-4 px-3 py-1 bg-black/80 border border-primary/30 rounded-full flex items-center">
                  <Sparkles className="h-4 w-4 text-primary mr-2" />
                  <span className="text-xs font-medium text-primary">Custom Personas</span>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right side with content */}
          <div className="w-full md:w-1/2">
            <Reveal>
              <div className="inline-flex items-center justify-center bg-primary/10 px-4 py-2 rounded-full mb-2 border border-primary/20">
                <Bot className="h-5 w-5 text-primary mr-2" />
                <span className="text-sm font-medium text-primary">AI Persona</span>
              </div>
            </Reveal>
            
            <Reveal delay={100}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 font-plasmik">
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">Custom AI Personas for Your Business</span>
              </h2>
            </Reveal>
            
            <Reveal delay={200}>
              <p className="text-xl text-gray-300 mb-4">
                Build intelligent, behaviorally accurate personas based on your real users or customers.
                Use them to simulate decision-making, test messaging, or power internal research tools.
              </p>
              <p className="text-xl text-gray-300 mb-6">
                Whether you're a product team, marketing department, or insights division, we'll help you design and train AI personas that reflect your audience—with depth, nuance, and strategic value.
              </p>
            </Reveal>
            
            <Reveal delay={300}>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-primary mb-3">🔹 Use Cases:</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    Simulate customer reactions to new features
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    Test onboarding or retention strategies
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    Run internal focus groups with zero scheduling overhead
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    Develop always-on research agents for your team
                  </li>
                </ul>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-primary mb-3">🔹 Long-Term Value:</h3>
                <p className="text-gray-300">
                  Once created, your custom personas can be reused across research, product development, and customer success workflows.
                </p>
              </div>
            </Reveal>
            
            <Reveal delay={400}>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/your-persona">
                  <Button 
                    size="lg" 
                    variant="primary" 
                    className="rounded-full px-8 py-3 bg-gradient-to-r from-primary to-primary/70 border-none shadow-lg shadow-primary/20 w-full sm:w-auto"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Contact us to scope your custom persona project
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default CustomAIPersonas;
