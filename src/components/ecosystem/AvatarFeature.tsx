
import { ArrowRight, Bot } from "lucide-react";
import Section from "@/components/ui-custom/Section";
import Button from "@/components/ui-custom/Button";
import Reveal from "@/components/ui-custom/Reveal";

const AvatarFeature = () => {
  return (
    <Section className="bg-gray-900 py-8">
      <div className="container px-4 mx-auto">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="bg-gray-800/80 border border-gray-700 rounded-xl p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-3/5">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 font-plasmik">
                    AI Research Avatar
                  </h2>
                  <p className="text-gray-300 text-pretty mb-6">
                    Talk with our AI research agent to explore market insights and token utility. 
                    Get personalized recommendations and analysis based on your interests.
                  </p>
                  <div className="px-3 py-1 bg-green-900/40 text-green-400 rounded-full text-xs inline-flex items-center mb-6">
                    <span className="animate-pulse mr-2 h-2 w-2 rounded-full bg-green-400"></span>
                    Coming Soon
                  </div>
                  <div>
                    <Button 
                      variant="secondary" 
                      className="group"
                    >
                      Experience AI Avatar
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 ml-2" />
                    </Button>
                  </div>
                </div>
                
                <div className="w-full md:w-2/5 aspect-video bg-gray-900/80 rounded-lg overflow-hidden relative">
                  <img 
                    src="/lovable-uploads/a1966bfb-6785-4632-b49d-e778a8986165.png" 
                    alt="AI Research Avatar" 
                    className="object-cover w-full h-full absolute inset-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
};

export default AvatarFeature;
