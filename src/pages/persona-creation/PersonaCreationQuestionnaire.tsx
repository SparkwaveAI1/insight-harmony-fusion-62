import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import Button from "@/components/ui-custom/Button";
import Card from "@/components/ui-custom/Card";
import Reveal from "@/components/ui-custom/Reveal";

// Define the form schema based on the questionnaire
const formSchema = z.object({
  // Identification
  fullName: z.string().min(2, "Name must be at least 2 characters").max(50),
  
  // Section 1: Daily Life & Environment
  dayStructure: z.string().min(1, "Please select an option"),
  weekPlanning: z.string().min(1, "Please select an option"),
  daytimeLocation: z.string().min(1, "Please select an option"),
  workHours: z.string().min(1, "Please select an option"),
  caregivingResponsibilities: z.string().min(1, "Please select an option"),
  livingArrangement: z.string().min(1, "Please select an option"),
  
  // Section 2: Decision-Making & Risk Style
  financialRisk: z.string().min(1, "Please select an option"),
  uncertaintyApproach: z.string().min(1, "Please select an option"),
  newProductTrial: z.string().min(1, "Please select an option"),
  decisionMakingStyle: z.string().min(1, "Please select an option"),
  brandTrust: z.string().min(1, "Please select an option"),
  trustFactors: z.string().min(1, "Please provide a response").max(500),
  
  // Section 3: Spending, Budgeting & Value
  moneyAttitude: z.string().min(1, "Please select an option"),
  worthItPurchases: z.array(z.string()).min(1, "Please select at least one option").max(3),
  impulseBuying: z.string().min(1, "Please select an option"),
  noRegretPurchase: z.string().min(1, "Please provide a response").max(500),
  productFrustrations: z.array(z.string()).min(1, "Please select at least one option").max(3),
  
  // Section 4: Information & Content Habits
  newsSources: z.array(z.string()).min(1, "Please select at least one option").max(3),
  contentFormats: z.array(z.string()).min(1, "Please select at least one option").max(2),
  contentConsumption: z.string().min(1, "Please select an option"),
  influencerFollowing: z.string().min(1, "Please select an option"),
  trustSource: z.string().min(1, "Please provide a response").max(500),
  
  // Section 5: Values, Identity & Mindset
  successDefinition: z.string().min(10, "Please provide more detail").max(500),
  lifeImprovement: z.string().min(1, "Please select an option"),
  worldview: z.string().min(1, "Please select an option"),
  workIdentity: z.string().min(1, "Please select an option"),
  personalityDifference: z.string().min(1, "Please select an option"),
  
  // Section 6: Deeper Insight
  confidenceSource: z.string().min(1, "Please select an option"),
  noveltyPreference: z.string().min(1, "Please select an option"),
  learningStyle: z.string().min(1, "Please select an option"),
  mindChangeExample: z.string().min(1, "Please provide a response").max(500),
  groupBehavior: z.string().min(1, "Please select an option"),
  stressReaction: z.string().min(1, "Please select an option"),
  opinionSharing: z.string().min(1, "Please select an option"),
  friendDescription: z.string().min(1, "Please provide a response").max(100),
  communityUnderstanding: z.string().min(1, "Please select an option"),
  misunderstanding: z.string().min(1, "Please provide a response").max(500),
  
  // Section 7: Worldview & Politics
  politicalWorldview: z.string().min(1, "Please select an option"),
  politicalAffiliation: z.string().min(1, "Please select an option"),
  institutionalTrust: z.string().min(1, "Please select an option"),
  valueExpression: z.array(z.string()).min(1, "Please select at least one option").max(2),
  politicalStance: z.string().min(1, "Please select an option"),
  politicalRepresentation: z.string().min(1, "Please select an option"),
  
  // Final: Optional
  additionalInfo: z.string().optional(),
  openToFollowups: z.string().min(1, "Please select an option"),
  contactInfo: z.string().optional()
});

type QuestionnaireFormValues = z.infer<typeof formSchema>;

const PersonaCreationQuestionnaire = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  
  const sections = [
    "Identification",
    "Daily Life & Environment",
    "Decision-Making & Risk Style",
    "Spending, Budgeting & Value",
    "Information & Content Habits",
    "Values, Identity & Mindset",
    "Deeper Insight",
    "Worldview & Politics",
    "Final"
  ];
  
  const form = useForm<QuestionnaireFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      dayStructure: "",
      weekPlanning: "",
      daytimeLocation: "",
      workHours: "",
      caregivingResponsibilities: "",
      livingArrangement: "",
      financialRisk: "",
      uncertaintyApproach: "",
      newProductTrial: "",
      decisionMakingStyle: "",
      brandTrust: "",
      trustFactors: "",
      moneyAttitude: "",
      worthItPurchases: [],
      impulseBuying: "",
      noRegretPurchase: "",
      productFrustrations: [],
      newsSources: [],
      contentFormats: [],
      contentConsumption: "",
      influencerFollowing: "",
      trustSource: "",
      successDefinition: "",
      lifeImprovement: "",
      worldview: "",
      workIdentity: "",
      personalityDifference: "",
      confidenceSource: "",
      noveltyPreference: "",
      learningStyle: "",
      mindChangeExample: "",
      groupBehavior: "",
      stressReaction: "",
      opinionSharing: "",
      friendDescription: "",
      communityUnderstanding: "",
      misunderstanding: "",
      politicalWorldview: "",
      politicalAffiliation: "",
      institutionalTrust: "",
      valueExpression: [],
      politicalStance: "",
      politicalRepresentation: "",
      additionalInfo: "",
      openToFollowups: "",
      contactInfo: ""
    },
  });

  const onSubmit = async (values: QuestionnaireFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Store data in Supabase (this would be implemented later)
      console.log("Form values to save:", values);
      
      // Navigate to the interview process
      setTimeout(() => {
        navigate("/interview-process");
      }, 1500);
    } catch (error) {
      console.error("Error in questionnaire submission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextSection = () => {
    setCurrentSection(prev => Math.min(prev + 1, sections.length - 1));
    window.scrollTo(0, 0);
  };

  const prevSection = () => {
    setCurrentSection(prev => Math.max(prev - 1, 0));
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="relative pt-24 pb-16">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/30 via-background to-background -z-10" />
          
          <div className="container px-4 mx-auto">
            <div className="max-w-3xl mx-auto">
              <Reveal>
                <h1 className="text-3xl md:text-4xl font-bold mb-4 font-plasmik text-center">
                  Persona Pre-Interview Questionnaire
                </h1>
              </Reveal>
              
              <Reveal delay={100}>
                <div className="mb-8 text-center">
                  <p className="text-lg text-muted-foreground mb-2">
                    Estimated time: 15–20 minutes
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Purpose: Capture foundational data to build deep, behaviorally accurate AI personas
                  </p>
                </div>
              </Reveal>
              
              <Reveal delay={200}>
                <Card className="p-6 md:p-8 mb-8">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="mb-8">
                        <div className="flex justify-between mb-2 text-sm">
                          <span>Section {currentSection + 1} of {sections.length}</span>
                          <span>{sections[currentSection]}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-primary h-2.5 rounded-full" style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}></div>
                        </div>
                      </div>
                      
                      {currentSection === 0 && (
                        <div className="space-y-6">
                          <h2 className="text-xl font-medium mb-4 flex items-center">
                            <span className="bg-primary/10 text-primary rounded-full w-7 h-7 inline-flex items-center justify-center mr-2">🧾</span>
                            Identification
                          </h2>
                          
                          <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First name + last initial</FormLabel>
                                <FormDescription>
                                  e.g., Dana M.
                                </FormDescription>
                                <FormControl>
                                  <Input placeholder="Your name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                      
                      {currentSection === 1 && (
                        <div className="space-y-6">
                          <h2 className="text-xl font-medium mb-4 flex items-center">
                            <span className="bg-primary/10 text-primary rounded-full w-7 h-7 inline-flex items-center justify-center mr-2">🔹</span>
                            Section 1: Daily Life & Environment
                          </h2>
                          
                          <FormField
                            control={form.control}
                            name="dayStructure"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>How structured is your typical day?</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                  >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Highly structured" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Highly structured – I follow a clear routine
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Somewhat structured" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Somewhat structured – a few key routines
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Flexible" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Flexible – I adjust as needed
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Unstructured" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Unstructured – every day is different
                                      </FormLabel>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="weekPlanning"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>How do you usually plan your week?</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                  >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Calendar and to-do lists" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Calendar + to-do lists
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Mental notes" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Mental notes
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Apps or software" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Apps or software
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="I don't plan ahead much" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        I don't plan ahead much
                                      </FormLabel>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="daytimeLocation"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>Where do you spend most of your daytime hours?</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                  >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Home" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Home</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Office / workplace" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Office / workplace</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="On the road" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">On the road</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Mixed or remote" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Mixed or remote</FormLabel>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="workHours"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>How many hours do you work per week (on average)?</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-wrap gap-4"
                                  >
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Under 10" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Under 10</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="10-25" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">10-25</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="26-40" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">26-40</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="41-60" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">41-60</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="60+" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">60+</FormLabel>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="caregivingResponsibilities"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>Do you have caregiving responsibilities (kids, elders, others)?</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex gap-4"
                                  >
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Yes" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Yes</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="No" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">No</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Prefer not to say" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Prefer not to say</FormLabel>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="livingArrangement"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>Who do you live with?</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                  >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Alone" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Alone</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="With partner/spouse" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">With partner/spouse</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="With children" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">With children</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="With parents/family" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">With parents/family</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="With roommates or others" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">With roommates or others</FormLabel>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                      
                      {currentSection === 2 && (
                        <div className="space-y-6">
                          <h2 className="text-xl font-medium mb-4 flex items-center">
                            <span className="bg-primary/10 text-primary rounded-full w-7 h-7 inline-flex items-center justify-center mr-2">🔹</span>
                            Section 2: Decision-Making & Risk Style
                          </h2>
                          
                          <FormField
                            control={form.control}
                            name="financialRisk"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>How do you approach financial risk?</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                  >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="I avoid it" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        I avoid it
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="I take calculated risks" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        I take calculated risks
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="I like bold bets" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        I like bold bets
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="I don't think much about risk" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        I don't think much about risk
                                      </FormLabel>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="uncertaintyApproach"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>When you're unsure about something, what's your first move?</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                  >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Research it" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Research it
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Ask someone I trust" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Ask someone I trust
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Try it and see" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Try it and see
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Avoid it or wait" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Avoid it or wait
                                      </FormLabel>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                      
                      <div className="flex justify-between pt-4">
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={prevSection}
                          disabled={currentSection === 0}
                          className="w-24"
                        >
                          Previous
                        </Button>
                        
                        {currentSection < sections.length - 1 ? (
                          <Button 
                            type="button" 
                            variant="primary"
                            onClick={nextSection}
                            className="w-24"
                          >
                            Next
                          </Button>
                        ) : (
                          <Button 
                            type="submit" 
                            variant="primary"
                            disabled={isSubmitting}
                            className="w-24"
                          >
                            {isSubmitting ? (
                              <Save className="h-4 w-4 animate-pulse" />
                            ) : (
                              "Submit"
                            )}
                          </Button>
                        )}
                      </div>
                    </form>
                  </Form>
                </Card>
              </Reveal>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PersonaCreationQuestionnaire;
