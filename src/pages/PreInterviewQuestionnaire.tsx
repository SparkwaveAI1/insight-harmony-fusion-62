
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowRight, Check, CheckCircle, ClipboardList } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import Section from "@/components/ui-custom/Section";
import Reveal from "@/components/ui-custom/Reveal";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { participantOperations, questionnaireOperations } from "@/services/database/supabaseClient";

type QuestionnaireForm = {
  background: string;
  interests: string;
  personalityTraits: string[];
  communicationStyle: string;
  decisionMaking: string;
  technologyUsage: string;
  privacyConcerns: string;
  additionalInfo: string;
};

const PreInterviewQuestionnaire = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const email = location.state?.email || "";

  const form = useForm<QuestionnaireForm>({
    defaultValues: {
      background: "",
      interests: "",
      personalityTraits: [],
      communicationStyle: "",
      decisionMaking: "",
      technologyUsage: "",
      privacyConcerns: "",
      additionalInfo: "",
    },
  });

  const onSubmit = async (data: QuestionnaireForm) => {
    if (!email) {
      toast({
        title: "Error",
        description: "Email information is missing. Please start from the beginning of the process.",
        variant: "destructive",
      });
      navigate("/interview-landing");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get participant by email
      const participant = await participantOperations.getParticipantByEmail(email);
      
      if (!participant) {
        throw new Error("Participant not found");
      }

      // Save questionnaire responses - using the correct method name
      await questionnaireOperations.saveQuestionnaire(participant.id, data);

      toast({
        title: "Questionnaire Submitted",
        description: "Thank you for completing the questionnaire. You will be notified when your interview is ready.",
      });

      // Navigate to interview process page
      navigate("/interview-process", { state: { email } });
    } catch (error) {
      console.error("Error submitting questionnaire:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your questionnaire. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="relative pt-24 pb-16">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background -z-10" />
          
          <div className="container px-4 mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <Reveal>
                <p className="inline-block mb-4 px-3 py-1 text-xs font-medium tracking-wider text-primary uppercase bg-primary/10 rounded-full">
                  Step 2: Pre-Interview Questionnaire
                </p>
              </Reveal>
              
              <Reveal delay={100}>
                <h1 className="mb-6 text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl font-plasmik">
                  Help Us Get to Know You Better
                </h1>
              </Reveal>
              
              <Reveal delay={200}>
                <p className="mb-10 text-lg text-muted-foreground max-w-2xl mx-auto">
                  This questionnaire helps our AI interviewer prepare relevant questions for your upcoming session. 
                  Your answers will contribute to creating a more personalized experience.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        <Section>
          <div className="container px-4 mx-auto">
            <div className="max-w-3xl mx-auto">
              <Reveal>
                <div className="bg-card border rounded-lg p-6 md:p-8">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                      <FormField
                        control={form.control}
                        name="background"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Personal Background</FormLabel>
                            <FormDescription>
                              Share a brief overview of your background, education, and professional experience.
                            </FormDescription>
                            <FormControl>
                              <Textarea 
                                placeholder="Tell us about yourself..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="interests"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Interests and Hobbies</FormLabel>
                            <FormDescription>
                              What activities, topics, or hobbies are you passionate about?
                            </FormDescription>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe your interests..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="communicationStyle"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Communication Style</FormLabel>
                            <FormDescription>
                              How would you describe your communication style?
                            </FormDescription>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                              >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="direct" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Direct and to-the-point
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="detailed" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Detailed and thorough
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="casual" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Casual and conversational
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="analytical" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Analytical and logical
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="decisionMaking"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Decision Making</FormLabel>
                            <FormDescription>
                              How do you typically approach making important decisions?
                            </FormDescription>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe your decision-making process..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="technologyUsage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Technology Usage</FormLabel>
                            <FormDescription>
                              Describe your relationship with technology and how you use it in your daily life.
                            </FormDescription>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe your technology usage..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="privacyConcerns"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Privacy and Data Concerns</FormLabel>
                            <FormDescription>
                              What are your thoughts about privacy and data sharing in the digital age?
                            </FormDescription>
                            <FormControl>
                              <Textarea 
                                placeholder="Share your thoughts on privacy..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="additionalInfo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Information</FormLabel>
                            <FormDescription>
                              Is there anything else you'd like to share that might be relevant for the interview?
                            </FormDescription>
                            <FormControl>
                              <Textarea 
                                placeholder="Share any additional information..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="pt-4 flex justify-end">
                        <Button 
                          type="submit" 
                          size="lg" 
                          className="group"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>Submitting...</>
                          ) : (
                            <>
                              Submit Questionnaire
                              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
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

export default PreInterviewQuestionnaire;
