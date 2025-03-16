
import { ArrowRight, Bot, CheckCircle, Clipboard, Clock, FileText, MessageSquare, Sparkles, UserCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import Section from "@/components/ui-custom/Section";
import Button from "@/components/ui-custom/Button";
import Reveal from "@/components/ui-custom/Reveal";
import { Button as ShadcnButton } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

type ScreenerForm = {
  email: string;
  age: string;
  occupation: string;
};

const InterviewLanding = () => {
  const [step, setStep] = useState<"intro" | "screener" | "loading" | "success" | "error">("intro");
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<ScreenerForm>({
    defaultValues: {
      email: "",
      age: "",
      occupation: ""
    }
  });

  const onSubmit = async (data: ScreenerForm) => {
    setStep("loading");
    
    try {
      // Add the participant to Supabase
      const { data: participant, error } = await supabase
        .from('participants')
        .insert([
          { 
            email: data.email,
            screener_data: { age: data.age, occupation: data.occupation },
            screener_passed: true,
            interview_unlocked: false
          }
        ])
        .select();

      if (error) {
        console.error("Error saving participant:", error);
        toast({
          title: "Error",
          description: "There was a problem saving your information. Please try again.",
          variant: "destructive",
        });
        setStep("error");
        return;
      }

      // Success - participant created
      toast({
        title: "Success!",
        description: "Your application has been submitted. You can now proceed to the interview process.",
      });
      
      setStep("success");
      
      // Redirect to the questionnaire page after a brief delay
      setTimeout(() => {
        navigate("/interview-process");
      }, 2000);
    } catch (err) {
      console.error("Error:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
      setStep("error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-24 pb-16">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background -z-10" />
          
          <div className="container px-4 mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <Reveal>
                <p className="inline-block mb-4 px-3 py-1 text-xs font-medium tracking-wider text-primary uppercase bg-primary/10 rounded-full">
                  PersonaAI Research Study
                </p>
              </Reveal>
              
              <Reveal delay={100} animation="blur-in">
                <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl font-plasmik text-balance">
                  Contribute to the Future of AI Personas
                </h1>
              </Reveal>
              
              <Reveal delay={200}>
                <p className="mb-10 text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
                  By participating in our research study, you'll help shape AI personas that understand human decision-making, preferences, and behavior. Complete a simple screening, answer a few questions, and chat with our AI interviewer.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Main Content Section */}
        <Section>
          <div className="container px-4 mx-auto">
            <div className="max-w-3xl mx-auto">
              {step === "intro" && (
                <div className="space-y-8">
                  <Reveal>
                    <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
                    
                    <div className="space-y-6">
                      <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium mb-1">1. Quick Screener</h3>
                          <p className="text-muted-foreground text-sm">Answer a few simple questions to see if you qualify for our study.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Clipboard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium mb-1">2. Pre-Interview Questionnaire</h3>
                          <p className="text-muted-foreground text-sm">Complete a brief questionnaire to help us understand your background.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <MessageSquare className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium mb-1">3. AI Interview Session</h3>
                          <p className="text-muted-foreground text-sm">Have a conversation with our AI interviewer (approx. 30-60 minutes).</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium mb-1">4. Access Your AI Persona</h3>
                          <p className="text-muted-foreground text-sm">After review, access your custom AI persona built from your interview data.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-center mt-8">
                      <ShadcnButton 
                        size="lg" 
                        className="group"
                        onClick={() => setStep("screener")}
                      >
                        Start Screening
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </ShadcnButton>
                    </div>
                  </Reveal>
                </div>
              )}

              {step === "screener" && (
                <div className="space-y-6">
                  <Reveal>
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold mb-2">Participant Screening</h2>
                      <p className="text-muted-foreground">Please answer these questions to see if you qualify for our study.</p>
                    </div>
                  </Reveal>
                  
                  <Reveal delay={100}>
                    <div className="p-6 border rounded-lg bg-card">
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="your@email.com" 
                                    type="email" 
                                    required
                                    {...field} 
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="age"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Age Group</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="e.g., 25-34" 
                                    required
                                    {...field} 
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="occupation"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Occupation</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="e.g., Marketing Manager" 
                                    required
                                    {...field} 
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex justify-between">
                            <ShadcnButton 
                              type="button" 
                              variant="outline"
                              onClick={() => setStep("intro")}
                            >
                              Back
                            </ShadcnButton>
                            
                            <ShadcnButton type="submit">
                              Submit
                            </ShadcnButton>
                          </div>
                        </form>
                      </Form>
                    </div>
                  </Reveal>
                </div>
              )}

              {step === "loading" && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 text-muted-foreground">Processing your application...</p>
                </div>
              )}

              {step === "success" && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-10 w-10 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Application Successful!</h2>
                  <p className="text-muted-foreground mb-4">You qualify for our study. Redirecting you to the next step...</p>
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              {step === "error" && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
                  <p className="text-muted-foreground mb-6">We encountered an error processing your application. Please try again.</p>
                  <ShadcnButton onClick={() => setStep("screener")}>
                    Try Again
                  </ShadcnButton>
                </div>
              )}
            </div>
          </div>
        </Section>

        {/* FAQ Section */}
        <Section className="bg-muted/30">
          <div className="container px-4 mx-auto">
            <div className="max-w-3xl mx-auto">
              <Reveal>
                <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
              </Reveal>
              
              <div className="space-y-4">
                <Reveal delay={100}>
                  <div className="p-6 border rounded-lg bg-card">
                    <h3 className="font-medium mb-2">How long will the interview take?</h3>
                    <p className="text-muted-foreground text-sm">The AI interview typically takes between 30-60 minutes to complete, depending on the depth of your responses.</p>
                  </div>
                </Reveal>
                
                <Reveal delay={150}>
                  <div className="p-6 border rounded-lg bg-card">
                    <h3 className="font-medium mb-2">What happens to my data?</h3>
                    <p className="text-muted-foreground text-sm">Your data is used to train an AI persona. You'll have access to this persona, and your data is kept confidential and secure.</p>
                  </div>
                </Reveal>
                
                <Reveal delay={200}>
                  <div className="p-6 border rounded-lg bg-card">
                    <h3 className="font-medium mb-2">Is there any compensation for participating?</h3>
                    <p className="text-muted-foreground text-sm">Yes, qualified participants will receive access to their custom AI persona, which can be used for various applications.</p>
                  </div>
                </Reveal>
                
                <Reveal delay={250}>
                  <div className="p-6 border rounded-lg bg-card">
                    <h3 className="font-medium mb-2">Can I stop the interview and continue later?</h3>
                    <p className="text-muted-foreground text-sm">Unfortunately, the interview should be completed in one session for best results. Please set aside adequate time.</p>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
};

export default InterviewLanding;
