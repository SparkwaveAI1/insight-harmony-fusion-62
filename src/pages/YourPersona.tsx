
import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import Header from "@/components/layout/Header";
import Section from "@/components/ui-custom/Section";
import Card from "@/components/ui-custom/Card";
import Button from "@/components/ui-custom/Button";
import Reveal from "@/components/ui-custom/Reveal";
import Footer from "@/components/sections/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const YourPersona = () => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage = { role: 'user' as const, content: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    
    // Simulate AI response (would be replaced with actual API call)
    setTimeout(() => {
      const aiResponse = { 
        role: 'assistant' as const, 
        content: generateResponse(inputValue) 
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const generateResponse = (query: string) => {
    // Simple response generation logic - in a real app, this would call an API
    const responses = [
      "As a Gen Z investor, I'd definitely look for more information about sustainable investment options first.",
      "From my perspective, that product feature seems promising, but I'd want to see how it performs in practice.",
      "I tend to research extensively before making financial decisions, especially for long-term investments.",
      "Social proof is important to me - I'd likely check reviews and ask for opinions in my network.",
      "That marketing approach might resonate with me, particularly if it highlights the technology and ethical aspects."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-24 pb-16">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-accent/30 via-background to-background -z-10" />
          
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
                  <Card className="p-6 sticky top-24">
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="w-24 h-24 mb-4">
                        <AvatarImage src="/lovable-uploads/723fa150-405c-4fa6-aa1f-33398c934182.png" />
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                      <h2 className="text-2xl font-bold mb-2">Gen Z Investor Persona</h2>
                      <p className="text-muted-foreground mb-4">25-year-old tech-savvy investor focused on sustainable growth</p>
                      <div className="grid grid-cols-2 gap-4 w-full mt-4">
                        <div className="text-center p-2 bg-muted/30 rounded">
                          <p className="text-sm font-medium">Demographics</p>
                          <p className="text-xs text-muted-foreground">Urban, College Educated</p>
                        </div>
                        <div className="text-center p-2 bg-muted/30 rounded">
                          <p className="text-sm font-medium">Behavior</p>
                          <p className="text-xs text-muted-foreground">Mobile-first, Research-driven</p>
                        </div>
                        <div className="text-center p-2 bg-muted/30 rounded">
                          <p className="text-sm font-medium">Values</p>
                          <p className="text-xs text-muted-foreground">Sustainability, Innovation</p>
                        </div>
                        <div className="text-center p-2 bg-muted/30 rounded">
                          <p className="text-sm font-medium">Goals</p>
                          <p className="text-xs text-muted-foreground">Growth, Social Impact</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </Reveal>

              <Reveal delay={100}>
                <div className="w-full md:w-2/3">
                  <Card className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-2 bg-primary/10 rounded-lg inline-block">
                        <MessageSquare className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold">Chat with Your Persona</h3>
                    </div>
                    
                    <div className="mb-4 space-y-4 h-[400px] overflow-y-auto p-2">
                      {messages.length === 0 ? (
                        <div className="text-center text-muted-foreground p-8">
                          <p>Start a conversation with your AI Persona.</p>
                          <p className="text-sm mt-2">Try asking about investment preferences, buying behaviors, or product feedback.</p>
                        </div>
                      ) : (
                        messages.map((message, index) => (
                          <div 
                            key={index}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div 
                              className={`max-w-[80%] rounded-lg p-3 ${
                                message.role === 'user' 
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted/50'
                              }`}
                            >
                              {message.content}
                            </div>
                          </div>
                        ))
                      )}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="max-w-[80%] rounded-lg p-3 bg-muted/50">
                            <div className="flex gap-1">
                              <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce"></span>
                              <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                              <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Textarea 
                        placeholder="Ask your persona a question..." 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleSendMessage} 
                        disabled={!inputValue.trim() || isLoading}
                        size="icon"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                </div>
              </Reveal>
            </div>
          </div>
        </Section>

        {/* Use Cases */}
        <Section className="bg-muted/30">
          <div className="container px-4 mx-auto">
            <div className="max-w-4xl mx-auto text-center mb-8">
              <Reveal>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 font-plasmik">
                  Ways to Use Your Persona
                </h2>
              </Reveal>
              <Reveal delay={100}>
                <p className="text-muted-foreground">
                  Get valuable feedback and insights from your AI persona to inform your decisions
                </p>
              </Reveal>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Reveal>
                <Card className="p-6 h-full">
                  <h3 className="text-xl font-semibold mb-3">Validate Ideas</h3>
                  <p className="text-muted-foreground">
                    Test concepts and get feedback from your AI persona before going to market.
                  </p>
                </Card>
              </Reveal>

              <Reveal delay={100}>
                <Card className="p-6 h-full">
                  <h3 className="text-xl font-semibold mb-3">Message Testing</h3>
                  <p className="text-muted-foreground">
                    See how your messaging resonates with your target audience before launching campaigns.
                  </p>
                </Card>
              </Reveal>

              <Reveal delay={200}>
                <Card className="p-6 h-full">
                  <h3 className="text-xl font-semibold mb-3">Understand Preferences</h3>
                  <p className="text-muted-foreground">
                    Gain insights into your persona's preferences, behaviors, and decision-making process.
                  </p>
                </Card>
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
