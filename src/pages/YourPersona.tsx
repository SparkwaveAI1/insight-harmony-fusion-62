
import { useState } from "react";
import { MessageSquare, Sparkles, Send, FileText, Copy } from "lucide-react";
import Header from "@/components/layout/Header";
import Section from "@/components/ui-custom/Section";
import Card from "@/components/ui-custom/Card";
import Button from "@/components/ui-custom/Button";
import Reveal from "@/components/ui-custom/Reveal";
import Footer from "@/components/sections/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const YourPersona = () => {
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateEmail = () => {
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      setGeneratedEmail(
        `Subject: ${emailSubject}\n\nHi there,\n\nI'm excited to share our new product with you. Based on your interests in sustainable investing and AI-powered finance tools, I think you'll find our platform particularly valuable.\n\nOur latest features include personalized portfolio recommendations that align with your values while maximizing returns.\n\nWould you be available for a quick demo next week?\n\nBest regards,\nYour Name`
      );
      setIsGenerating(false);
    }, 1500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // In a real app, you would show a toast notification here
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
                  Leverage Your AI Persona for Daily Tasks
                </h1>
              </Reveal>
              
              <Reveal delay={200}>
                <p className="mb-10 text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
                  Put your AI Persona to work—generate content, validate ideas, and get instant feedback that 
                  resonates with your target audience.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Persona Profile */}
        <Section>
          <div className="container px-4 mx-auto">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <Reveal>
                <div className="w-full md:w-1/3">
                  <Card className="p-6">
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
                  <Tabs defaultValue="email">
                    <TabsList className="grid grid-cols-3 mb-6">
                      <TabsTrigger value="email">Email Writer</TabsTrigger>
                      <TabsTrigger value="social">Social Posts</TabsTrigger>
                      <TabsTrigger value="ideas">Idea Validator</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="email" className="mt-0">
                      <Card className="p-6">
                        <h3 className="text-xl font-bold mb-4">Generate Targeted Emails</h3>
                        <p className="text-muted-foreground mb-6">
                          Create emails that resonate with your target persona. Our AI will craft messaging that speaks 
                          to their needs, values, and communication style.
                        </p>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="email-subject">Email Subject</Label>
                            <Input 
                              id="email-subject" 
                              placeholder="Enter email subject" 
                              value={emailSubject}
                              onChange={(e) => setEmailSubject(e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="email-content">Email Purpose (briefly describe what you want to achieve)</Label>
                            <Textarea 
                              id="email-content" 
                              placeholder="e.g., Promote our new investment platform focusing on sustainable returns"
                              rows={4}
                              value={emailContent}
                              onChange={(e) => setEmailContent(e.target.value)}
                            />
                          </div>
                          
                          <Button 
                            onClick={handleGenerateEmail}
                            disabled={isGenerating || !emailSubject || !emailContent}
                            className="w-full"
                          >
                            {isGenerating ? (
                              <>Generating<Sparkles className="ml-2 h-4 w-4 animate-pulse" /></>
                            ) : (
                              <>Generate Email<Sparkles className="ml-2 h-4 w-4" /></>
                            )}
                          </Button>
                          
                          {generatedEmail && (
                            <div className="mt-6 p-4 bg-muted/30 rounded-lg relative">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="absolute top-2 right-2"
                                onClick={() => copyToClipboard(generatedEmail)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <pre className="whitespace-pre-wrap text-sm">{generatedEmail}</pre>
                            </div>
                          )}
                        </div>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="social" className="mt-0">
                      <Card className="p-6">
                        <h3 className="text-xl font-bold mb-4">Create Social Media Content</h3>
                        <p className="text-muted-foreground mb-6">
                          Generate social media posts tailored to your persona's preferences and platform behaviors.
                        </p>
                        
                        <div className="p-12 flex items-center justify-center border-2 border-dashed rounded-lg">
                          <p className="text-muted-foreground">Coming Soon</p>
                        </div>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="ideas" className="mt-0">
                      <Card className="p-6">
                        <h3 className="text-xl font-bold mb-4">Validate Your Ideas</h3>
                        <p className="text-muted-foreground mb-6">
                          Test concepts and get feedback from your AI persona before going to market.
                        </p>
                        
                        <div className="p-12 flex items-center justify-center border-2 border-dashed rounded-lg">
                          <p className="text-muted-foreground">Coming Soon</p>
                        </div>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </Reveal>
            </div>
          </div>
        </Section>

        {/* Additional Features */}
        <Section className="bg-muted/30">
          <div className="container px-4 mx-auto">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <Reveal>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 font-plasmik">
                  More Ways to Use Your Persona
                </h2>
              </Reveal>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Reveal>
                <Card className="p-6 h-full">
                  <div className="mb-4 p-3 bg-primary/10 rounded-lg inline-flex">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Direct Chat</h3>
                  <p className="text-muted-foreground">
                    Have a conversation with your persona to understand their perspective on specific topics or questions.
                  </p>
                </Card>
              </Reveal>

              <Reveal delay={100}>
                <Card className="p-6 h-full">
                  <div className="mb-4 p-3 bg-primary/10 rounded-lg inline-flex">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Content Analyzer</h3>
                  <p className="text-muted-foreground">
                    Get feedback on your existing content from your persona's perspective—see what resonates and what misses the mark.
                  </p>
                </Card>
              </Reveal>

              <Reveal delay={200}>
                <Card className="p-6 h-full">
                  <div className="mb-4 p-3 bg-primary/10 rounded-lg inline-flex">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Market Predictions</h3>
                  <p className="text-muted-foreground">
                    Use your persona to predict market trends based on demographic data and behavioral patterns.
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
