
import { User, Bot, ArrowRight, Users } from "lucide-react";
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
              <div className="grid grid-cols-3 grid-rows-3 gap-2 rounded-xl overflow-hidden">
                <div className="overflow-hidden rounded-md">
                  <img 
                    src="/lovable-uploads/89382b41-5306-4a11-90a8-df0b7128dfa3.png" 
                    alt="Older woman with gray hair" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="overflow-hidden rounded-md">
                  <img 
                    src="/lovable-uploads/fd27e5a9-684b-43f2-b9a5-585d9fba51cd.png" 
                    alt="Middle-aged woman with gray and black hair" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="overflow-hidden rounded-md relative">
                  <img 
                    src="/lovable-uploads/c502dfc9-1f4d-4a3b-bede-1d793c65d9f8.png" 
                    alt="Older man in outdoor clothing" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 border border-primary/30 rounded-full flex items-center text-xs">
                    <span className="text-xs font-medium text-primary">Video Avatar</span>
                  </div>
                </div>
                <div className="overflow-hidden rounded-md">
                  <img 
                    src="/lovable-uploads/f5f1463f-b7ed-41b8-b223-4c9dff9a4549.png" 
                    alt="Young man with curly hair and glasses" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="overflow-hidden rounded-md">
                  <img 
                    src="/lovable-uploads/c58004f6-798b-47c0-be8b-701e182b6c62.png" 
                    alt="Young woman with curly hair and glasses" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="overflow-hidden rounded-md">
                  <img 
                    src="/lovable-uploads/f5f1463f-b7ed-41b8-b223-4c9dff9a4549.png" 
                    alt="Young man with headphones" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="overflow-hidden rounded-md">
                  <img 
                    src="/lovable-uploads/89382b41-5306-4a11-90a8-df0b7128dfa3.png" 
                    alt="Elderly woman with glasses" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="overflow-hidden rounded-md">
                  <img 
                    src="/lovable-uploads/fd27e5a9-684b-43f2-b9a5-585d9fba51cd.png" 
                    alt="Young Asian man" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="overflow-hidden rounded-md">
                  <img 
                    src="/lovable-uploads/c502dfc9-1f4d-4a3b-bede-1d793c65d9f8.png" 
                    alt="Middle-aged man with beard" 
                    className="w-full h-full object-cover"
                  />
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
                <span className="text-primary">Custom AI Personas</span>
              </h2>
            </Reveal>
            
            <Reveal delay={200}>
              <p className="text-xl text-gray-300 mb-4">
                For research: Talk directly to our AI Research personas. Get qualitative insights, sentiment analysis, and predictive intelligence from deeply-trained personas.
              </p>
              <p className="text-xl text-gray-300 mb-8">
                Create your own persona for personal and business use.
              </p>
            </Reveal>
            
            <Reveal delay={300}>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/interview-landing">
                  <Button 
                    className="rounded-full px-8 py-3 bg-blue-600 hover:bg-blue-700 border-none shadow-lg shadow-primary/20 w-full sm:w-auto flex items-center"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Create a Persona
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                
                <Link to="/ai-focus-groups">
                  <Button 
                    variant="secondary" 
                    className="rounded-full px-8 py-3 shadow-lg w-full sm:w-auto flex items-center"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    AI Focus Groups
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
