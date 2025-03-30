
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
                          
                          <FormField
                            control={form.control}
                            name="newProductTrial"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>How often do you try new products or tools?</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                  >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Very frequently" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Very frequently
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Occasionally" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Occasionally
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Rarely" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Rarely
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Almost never" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Almost never
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
                            name="decisionMakingStyle"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>What's your decision-making style?</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-wrap gap-4"
                                  >
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Logical" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Logical</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Intuitive" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Intuitive</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Fast" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Fast</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Methodical" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Methodical</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Depends" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Depends</FormLabel>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="brandTrust"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>How much do you trust brands to act in your best interest?</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-wrap gap-4"
                                  >
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Almost always" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Almost always</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Sometimes" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Sometimes</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Rarely" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Rarely</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Never" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Never</FormLabel>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="trustFactors"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>What makes you instantly trust or distrust a product or brand?</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Share your thoughts here..." 
                                    className="h-24 resize-none"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                      
                      {currentSection === 3 && (
                        <div className="space-y-6">
                          <h2 className="text-xl font-medium mb-4 flex items-center">
                            <span className="bg-primary/10 text-primary rounded-full w-7 h-7 inline-flex items-center justify-center mr-2">🔹</span>
                            Section 3: Spending, Budgeting & Value
                          </h2>
                          
                          <FormField
                            control={form.control}
                            name="moneyAttitude"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>How do you think about money?</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                  >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="I budget carefully" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        I budget carefully
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="I'm mindful but flexible" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        I'm mindful but flexible
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="I spend freely" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        I spend freely
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="I try not to think about it" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        I try not to think about it
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
                            name="worthItPurchases"
                            render={() => (
                              <FormItem>
                                <div className="mb-4">
                                  <FormLabel>Which purchases do you consider "worth it"? (Pick up to 3)</FormLabel>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {[
                                    { id: "saves-time", label: "Saves time" },
                                    { id: "high-quality", label: "High-quality / durable" },
                                    { id: "well-designed", label: "Beautiful / well-designed" },
                                    { id: "brings-joy", label: "Brings joy" },
                                    { id: "health-wellness", label: "Health/wellness" },
                                    { id: "growth-tools", label: "Growth tools" },
                                    { id: "experiences", label: "Experiences" }
                                  ].map((item) => (
                                    <FormField
                                      key={item.id}
                                      control={form.control}
                                      name="worthItPurchases"
                                      render={({ field }) => {
                                        return (
                                          <FormItem
                                            key={item.id}
                                            className="flex flex-row items-start space-x-3 space-y-0"
                                          >
                                            <FormControl>
                                              <Checkbox
                                                checked={field.value?.includes(item.label)}
                                                onCheckedChange={(checked) => {
                                                  const currentValues = field.value || [];
                                                  if (checked && currentValues.length < 3) {
                                                    field.onChange([...currentValues, item.label]);
                                                  } else if (!checked) {
                                                    field.onChange(
                                                      currentValues.filter(
                                                        (value) => value !== item.label
                                                      )
                                                    );
                                                  }
                                                }}
                                              />
                                            </FormControl>
                                            <FormLabel className="font-normal cursor-pointer">
                                              {item.label}
                                            </FormLabel>
                                          </FormItem>
                                        );
                                      }}
                                    />
                                  ))}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="impulseBuying"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>How often do you impulse buy?</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-wrap gap-4"
                                  >
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Very often" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Very often</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Occasionally" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Occasionally</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Rarely" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Rarely</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Never" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Never</FormLabel>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="noRegretPurchase"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>What's one recent purchase you don't regret at all? Why?</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Share your thoughts here..." 
                                    className="h-24 resize-none"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="productFrustrations"
                            render={() => (
                              <FormItem>
                                <div className="mb-4">
                                  <FormLabel>What frustrates you most in a product or platform? (Pick up to 3)</FormLabel>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {[
                                    { id: "unclear-pricing", label: "Unclear pricing" },
                                    { id: "bad-onboarding", label: "Bad onboarding" },
                                    { id: "poor-support", label: "Poor support" },
                                    { id: "buggy-features", label: "Buggy features" },
                                    { id: "overcomplicated-ui", label: "Overcomplicated UI" },
                                    { id: "pushy-marketing", label: "Pushy marketing" },
                                    { id: "lack-of-transparency", label: "Lack of transparency" },
                                    { id: "other", label: "Other" }
                                  ].map((item) => (
                                    <FormField
                                      key={item.id}
                                      control={form.control}
                                      name="productFrustrations"
                                      render={({ field }) => {
                                        return (
                                          <FormItem
                                            key={item.id}
                                            className="flex flex-row items-start space-x-3 space-y-0"
                                          >
                                            <FormControl>
                                              <Checkbox
                                                checked={field.value?.includes(item.label)}
                                                onCheckedChange={(checked) => {
                                                  const currentValues = field.value || [];
                                                  if (checked && currentValues.length < 3) {
                                                    field.onChange([...currentValues, item.label]);
                                                  } else if (!checked) {
                                                    field.onChange(
                                                      currentValues.filter(
                                                        (value) => value !== item.label
                                                      )
                                                    );
                                                  }
                                                }}
                                              />
                                            </FormControl>
                                            <FormLabel className="font-normal cursor-pointer">
                                              {item.label}
                                            </FormLabel>
                                          </FormItem>
                                        );
                                      }}
                                    />
                                  ))}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                      
                      {currentSection === 4 && (
                        <div className="space-y-6">
                          <h2 className="text-xl font-medium mb-4 flex items-center">
                            <span className="bg-primary/10 text-primary rounded-full w-7 h-7 inline-flex items-center justify-center mr-2">🔹</span>
                            Section 4: Information & Content Habits
                          </h2>
                          
                          <FormField
                            control={form.control}
                            name="newsSources"
                            render={() => (
                              <FormItem>
                                <div className="mb-4">
                                  <FormLabel>Where do you get news and updates? (Pick up to 3)</FormLabel>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {[
                                    { id: "twitter-x", label: "Twitter / X" },
                                    { id: "podcasts", label: "Podcasts" },
                                    { id: "reddit-discord", label: "Reddit / Discord" },
                                    { id: "news-apps", label: "News apps" },
                                    { id: "youtube", label: "YouTube" },
                                    { id: "newsletters", label: "Newsletters" },
                                    { id: "tv-radio", label: "TV / Radio" },
                                    { id: "group-chats", label: "Group chats" },
                                    { id: "dont-follow", label: "I don't follow news" }
                                  ].map((item) => (
                                    <FormField
                                      key={item.id}
                                      control={form.control}
                                      name="newsSources"
                                      render={({ field }) => {
                                        return (
                                          <FormItem
                                            key={item.id}
                                            className="flex flex-row items-start space-x-3 space-y-0"
                                          >
                                            <FormControl>
                                              <Checkbox
                                                checked={field.value?.includes(item.label)}
                                                onCheckedChange={(checked) => {
                                                  const currentValues = field.value || [];
                                                  if (checked && currentValues.length < 3) {
                                                    field.onChange([...currentValues, item.label]);
                                                  } else if (!checked) {
                                                    field.onChange(
                                                      currentValues.filter(
                                                        (value) => value !== item.label
                                                      )
                                                    );
                                                  }
                                                }}
                                              />
                                            </FormControl>
                                            <FormLabel className="font-normal cursor-pointer">
                                              {item.label}
                                            </FormLabel>
                                          </FormItem>
                                        );
                                      }}
                                    />
                                  ))}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="contentFormats"
                            render={() => (
                              <FormItem>
                                <div className="mb-4">
                                  <FormLabel>Which content formats do you enjoy most? (Pick up to 2)</FormLabel>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {[
                                    { id: "video", label: "Video" },
                                    { id: "podcasts", label: "Podcasts" },
                                    { id: "articles", label: "Articles" },
                                    { id: "visual-posts", label: "Visual posts" },
                                    { id: "threads-comments", label: "Threads/comments" }
                                  ].map((item) => (
                                    <FormField
                                      key={item.id}
                                      control={form.control}
                                      name="contentFormats"
                                      render={({ field }) => {
                                        return (
                                          <FormItem
                                            key={item.id}
                                            className="flex flex-row items-start space-x-3 space-y-0"
                                          >
                                            <FormControl>
                                              <Checkbox
                                                checked={field.value?.includes(item.label)}
                                                onCheckedChange={(checked) => {
                                                  const currentValues = field.value || [];
                                                  if (checked && currentValues.length < 2) {
                                                    field.onChange([...currentValues, item.label]);
                                                  } else if (!checked) {
                                                    field.onChange(
                                                      currentValues.filter(
                                                        (value) => value !== item.label
                                                      )
                                                    );
                                                  }
                                                }}
                                              />
                                            </FormControl>
                                            <FormLabel className="font-normal cursor-pointer">
                                              {item.label}
                                            </FormLabel>
                                          </FormItem>
                                        );
                                      }}
                                    />
                                  ))}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="contentConsumption"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>How much non-work content do you consume daily?</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-wrap gap-4"
                                  >
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="<1hr" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">&lt;1hr</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="1-2hrs" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">1–2hrs</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="3-4hrs" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">3–4hrs</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="5+hrs" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">5+hrs</FormLabel>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="influencerFollowing"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>Do you follow any influencers or thought leaders?</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                  >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Yes - closely" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Yes – closely
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Yes - casually" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Yes – casually
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="No" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        No
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
                            name="trustSource"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Who do you trust most for advice or insight?</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Share your thoughts here..." 
                                    className="h-24 resize-none"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                      
                      {currentSection === 5 && (
                        <div className="space-y-6">
                          <h2 className="text-xl font-medium mb-4 flex items-center">
                            <span className="bg-primary/10 text-primary rounded-full w-7 h-7 inline-flex items-center justify-center mr-2">🔹</span>
                            Section 5: Values, Identity & Mindset
                          </h2>
                          
                          <FormField
                            control={form.control}
                            name="successDefinition"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>How do you define success for yourself right now?</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Share your thoughts here..." 
                                    className="h-24 resize-none"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="lifeImprovement"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>If you could instantly improve one area of your life, what would it be?</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-wrap gap-4"
                                  >
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Physical health" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Physical health</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Mental health" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Mental health</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Finances" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Finances</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Relationships" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Relationships</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Career" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Career</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Time/focus" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Time/focus</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Creativity" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Creativity</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Other" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Other</FormLabel>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="worldview"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>Which of these worldviews resonates most with you?</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                  >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Work hard, play hard" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        "Work hard, play hard"
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Do no harm, take no shit" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        "Do no harm, take no shit"
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Everything happens for a reason" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        "Everything happens for a reason"
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="We make our own meaning" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        "We make our own meaning"
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Don't trust the system" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        "Don't trust the system"
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Just keep moving forward" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        "Just keep moving forward"
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Other / None" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Other / None
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
                            name="workIdentity"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>How much is your identity tied to your work?</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-wrap gap-4"
                                  >
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Very much" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Very much</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Somewhat" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Somewhat</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Not much" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Not much</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Not at all" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Not at all</FormLabel>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="personalityDifference"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>How different are you at work vs. at home?</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                  >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Same person" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Same person
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="More formal at work" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        More formal at work
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="More relaxed at work" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        More relaxed at work
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Completely different" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Completely different
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
                      
                      {currentSection === 6 && (
                        <div className="space-y-6">
                          <h2 className="text-xl font-medium mb-4 flex items-center">
                            <span className="bg-primary/10 text-primary rounded-full w-7 h-7 inline-flex items-center justify-center mr-2">🔹</span>
                            Section 6: Deeper Insight
                          </h2>
                          
                          <FormField
                            control={form.control}
                            name="confidenceSource"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>When do you feel most confident in decisions?</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                  >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="After research" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        After research
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Gut instinct" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Gut instinct
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Group support" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Group support
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Values alignment" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Values alignment
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Rarely confident" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Rarely confident
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
                            name="noveltyPreference"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>Do you seek out new experiences or stick with the familiar?</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                  >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Actively seek novelty" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Actively seek novelty
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Occasionally try new things" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Occasionally try new things
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Prefer what I know" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Prefer what I know
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Avoid change" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Avoid change
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
                            name="learningStyle"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>How do you usually learn something new?</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                  >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Hands-on" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Hands-on
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Tutorials / guides" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Tutorials / guides
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Someone shows me" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Someone shows me
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="I need to see it in action" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        I need to see it in action
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="I struggle with new things" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        I struggle with new things
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
                            name="mindChangeExample"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>What's something you've changed your mind about in the last few years?</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Share your thoughts here..." 
                                    className="h-24 resize-none"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="groupBehavior"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>How do you act in group settings?</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-wrap gap-4"
                                  >
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="I lead" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">I lead</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="I support" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">I support</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="I go solo" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">I go solo</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Depends" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Depends</FormLabel>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="stressReaction"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>How do you react to stress?</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-wrap gap-4"
                                  >
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Focused" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Focused</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Overwhelmed" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Overwhelmed</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Distracted" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Distracted</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Quiet" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Quiet</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Push through" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Push through</FormLabel>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="opinionSharing"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>How comfortable are you sharing opinions in public settings?</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-wrap gap-4"
                                  >
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Very" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Very</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Somewhat" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Somewhat</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Only with people I trust" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Only with people I trust</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Not at all" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Not at all</FormLabel>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="friendDescription"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>How would close friends describe you in 3 words?</FormLabel>
                                <FormControl>
                                  <Input placeholder="E.g., loyal, thoughtful, energetic" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="communityUnderstanding"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>Do people in your industry or community "get" people like you?</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-wrap gap-4"
                                  >
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Yes" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Yes</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Sometimes" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Sometimes</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Rarely" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Rarely</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Not at all" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Not at all</FormLabel>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="misunderstanding"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>What do people often misunderstand about you?</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Share your thoughts here..." 
                                    className="h-24 resize-none"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                      
                      {currentSection === 7 && (
                        <div className="space-y-6">
                          <h2 className="text-xl font-medium mb-4 flex items-center">
                            <span className="bg-primary/10 text-primary rounded-full w-7 h-7 inline-flex items-center justify-center mr-2">🔹</span>
                            Section 7: Worldview & Politics
                          </h2>
                          
                          <FormField
                            control={form.control}
                            name="politicalWorldview"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>Which statement best reflects your political worldview?</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                  >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="The system mostly works, but needs fixing" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        The system mostly works, but needs fixing
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="The system is broken and needs rebuilding" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        The system is broken and needs rebuilding
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="It serves some and ignores others" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        It serves some and ignores others
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Politics is a distraction" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Politics is a distraction
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="I don't think about politics much" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        I don't think about politics much
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Other" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Other
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
                            name="politicalAffiliation"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>How do you relate to political groups or parties?</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                  >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Strongly identify with one" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Strongly identify with one
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Lean toward one, but flexible" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Lean toward one, but flexible
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Don't trust parties" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Don't trust parties
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Stay independent" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Stay independent
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Avoid politics" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Avoid politics
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
                            name="institutionalTrust"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>How much trust do you have in major institutions?</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-wrap gap-4"
                                  >
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="High" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">High</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Moderate" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Moderate</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Low" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Low</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="None" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">None</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Don't think about it" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Don't think about it</FormLabel>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="valueExpression"
                            render={() => (
                              <FormItem>
                                <div className="mb-4">
                                  <FormLabel>How do you express your political/social values? (Pick up to 2)</FormLabel>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {[
                                    { id: "voting", label: "Voting" },
                                    { id: "posting-online", label: "Posting online" },
                                    { id: "conversations", label: "Conversations" },
                                    { id: "protests-activism", label: "Protests / activism" },
                                    { id: "financial-choices", label: "Financial choices" },
                                    { id: "creative-work", label: "Creative work" },
                                    { id: "keep-private", label: "Keep views private" }
                                  ].map((item) => (
                                    <FormField
                                      key={item.id}
                                      control={form.control}
                                      name="valueExpression"
                                      render={({ field }) => {
                                        return (
                                          <FormItem
                                            key={item.id}
                                            className="flex flex-row items-start space-x-3 space-y-0"
                                          >
                                            <FormControl>
                                              <Checkbox
                                                checked={field.value?.includes(item.label)}
                                                onCheckedChange={(checked) => {
                                                  const currentValues = field.value || [];
                                                  if (checked && currentValues.length < 2) {
                                                    field.onChange([...currentValues, item.label]);
                                                  } else if (!checked) {
                                                    field.onChange(
                                                      currentValues.filter(
                                                        (value) => value !== item.label
                                                      )
                                                    );
                                                  }
                                                }}
                                              />
                                            </FormControl>
                                            <FormLabel className="font-normal cursor-pointer">
                                              {item.label}
                                            </FormLabel>
                                          </FormItem>
                                        );
                                      }}
                                    />
                                  ))}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="politicalStance"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>Which label best matches your social/political stance?</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                  >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Progressive" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Progressive
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Libertarian" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Libertarian
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Conservative" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Conservative
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Anti-establishment" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Anti-establishment
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Centrist" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Centrist
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Apolitical" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Apolitical
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Other" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        Other
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
                            name="politicalRepresentation"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>Do you feel represented in mainstream politics?</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-wrap gap-4"
                                  >
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Yes" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Yes</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Somewhat" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Somewhat</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Rarely" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Rarely</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="No" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">No</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Not sure" />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">Not sure</FormLabel>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                      
                      {currentSection === 8 && (
                        <div className="space-y-6">
                          <h2 className="text-xl font-medium mb-4 flex items-center">
                            <span className="bg-primary/10 text-primary rounded-full w-7 h-7 inline-flex items-center justify-center mr-2">🔹</span>
                            Final: Optional
                          </h2>
                          
                          <FormField
                            control={form.control}
                            name="additionalInfo"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Is there anything else we should know to better understand your mindset or behavior? <span className="text-muted-foreground">(Optional)</span></FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Share any additional thoughts here..." 
                                    className="h-24 resize-none"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="openToFollowups"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>Would you be open to follow-ups or paid research?</FormLabel>
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
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="contactInfo"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>(Optional) Email, Telegram, or other contact info</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your contact information" {...field} />
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
