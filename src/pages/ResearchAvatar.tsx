
import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import AvatarChat from "@/components/research/AvatarChat";
import Section from "@/components/ui-custom/Section";
import Reveal from "@/components/ui-custom/Reveal";
import { Bot } from "lucide-react";

const ResearchAvatar = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-24">
        <Section className="py-12">
          <div className="container px-4 mx-auto">
            <div className="max-w-4xl mx-auto text-center mb-10">
              <Reveal>
                <div className="inline-flex items-center justify-center bg-primary/10 px-4 py-2 rounded-full mb-4">
                  <Bot className="h-5 w-5 text-primary mr-2" />
                  <span className="text-sm font-medium text-primary">AI Research Assistant</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-6 font-plasmik">
                  PersonaAI Research Agent
                </h1>
                <p className="text-pretty max-w-2xl mx-auto">
                  Ask questions about market research, sentiment analysis, or any Web3 topic. 
                  Our AI research agent provides qualitative insights powered by our advanced analysis tools.
                </p>
              </Reveal>
            </div>
            
            <AvatarChat />
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
};

export default ResearchAvatar;
