
import { ArrowRight, Bot, Search } from "lucide-react";
import Button from "@/components/ui-custom/Button";
import Reveal from "@/components/ui-custom/Reveal";

const ResearchAgentSection = () => {
  return (
    <section className="bg-gray-800 py-16">
      <div className="container px-4 mx-auto">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="order-2 lg:order-1">
              <Reveal>
                <div className="inline-flex items-center justify-center bg-primary/20 px-4 py-2 rounded-full mb-4">
                  <Bot className="h-5 w-5 text-primary mr-2" />
                  <span className="text-sm font-medium text-primary">AI Research Assistant</span>
                </div>
              </Reveal>
              
              <Reveal delay={100}>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-100 font-plasmik">
                  Talk to PersonaAI Research Agent
                </h2>
              </Reveal>
              
              <Reveal delay={200}>
                <p className="text-gray-300 text-pretty mb-8">
                  Coming Soon
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResearchAgentSection;
