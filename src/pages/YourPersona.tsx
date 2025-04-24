
import { useState } from "react";
import { MessageSquare } from "lucide-react";
import Header from "@/components/layout/Header";
import Section from "@/components/ui-custom/Section";
import Reveal from "@/components/ui-custom/Reveal";
import Footer from "@/components/sections/Footer";
import ChatInterface from "@/components/persona-chat/ChatInterface";
import PersonaProfile from "@/components/persona-chat/PersonaProfile";
import IntegrationPanel from "@/components/persona-chat/IntegrationPanel";

const YourPersona = () => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = (message: string) => {
    // Add user message
    const userMessage = { role: 'user' as const, content: message };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    
    // Simulate AI response (would be replaced with actual API call)
    setTimeout(() => {
      const aiResponse = { 
        role: 'assistant' as const, 
        content: generateResponse(message) 
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const generateResponse = (query: string) => {
    const responses = [
      "As a Gen Z investor, I'd definitely look for more information about sustainable investment options first.",
      "From my perspective, that product feature seems promising, but I'd want to see how it performs in practice.",
      "I tend to research extensively before making financial decisions, especially for long-term investments.",
      "Social proof is important to me - I'd likely check reviews and ask for opinions in my network.",
      "That marketing approach might resonate with me, particularly if it highlights the technology and ethical aspects."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-24 pb-16">
          <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-background -z-10" />
          
          <div className="container px-4 mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <Reveal>
                <p className="inline-block mb-4 px-3 py-1 text-xs font-medium tracking-wider text-primary uppercase bg-primary/10 rounded-full">
                  Your AI Persona
                </p>
              </Reveal>
              
              <Reveal delay={100} animation="blur-in">
                <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl font-plasmik text-balance">
                  Chat with Your AI Persona
                </h1>
              </Reveal>
              
              <Reveal delay={200}>
                <p className="mb-10 text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
                  Ask questions, validate ideas, and get instant feedback from your Gen Z Investor Persona.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Chat Section */}
        <Section>
          <div className="container px-4 mx-auto">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <Reveal>
                <div className="w-full md:w-1/3">
                  <PersonaProfile />
                  <div className="mt-6">
                    <IntegrationPanel />
                  </div>
                </div>
              </Reveal>

              <Reveal delay={100}>
                <div className="w-full md:w-2/3">
                  <ChatInterface
                    messages={messages}
                    isLoading={isLoading}
                    onSendMessage={handleSendMessage}
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
};

export default YourPersona;
